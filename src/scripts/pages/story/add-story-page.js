import Camera from '../../utils/camera';
import Map from '../../utils/maps';

export default class AddStoryPage {
  constructor() {
    this._camera = null;
    this._map = null;
    this._isCameraOpen = false;
    this._selectedPhoto = null;
    this._presenter = null;
  }

  render() {
    return `
      <section class="add-story">
        <h2><i class="fas fa-plus-circle"></i> Tambah Cerita Baru</h2>
        <form id="storyForm" novalidate>
          <!-- Foto Section -->
          <div class="form-section">
            <h3><i class="fas fa-camera"></i> Foto</h3>
            <div class="photo-options">
              <button type="button" id="openCameraBtn" class="btn btn-outline">
                <i class="fas fa-camera"></i> Buka Kamera
              </button>
              <button type="button" id="uploadPhotoBtn" class="btn btn-outline">
                <i class="fas fa-upload"></i> Ambil dari File
              </button>
              <input type="file" id="photoInput" accept="image/*" style="display:none">
            </div>

            <div id="cameraContainer" class="camera-container" style="display:none">
              <video id="cameraView" autoplay playsinline></video>
              <button type="button" id="captureBtn" class="btn btn-primary">
                <i class="fas fa-camera-retro"></i> Ambil Foto
              </button>
            </div>

            <div class="photo-preview">
              <img id="photoPreview" class="preview-image">
            </div>
          </div>

          <!-- Deskripsi Section -->
          <div class="form-section">
            <h3><i class="fas fa-align-left"></i> Deskripsi</h3>
            <label for="description" class="sr-only">Deskripsi</label>
            <textarea 
              id="description" 
              class="form-control"
              rows="5" 
              required
              placeholder="Ceritakan pengalamanmu..."
            ></textarea>
          </div>

          <!-- Lokasi Section -->
          <div class="form-section">
            <h3><i class="fas fa-map-marker-alt"></i> Lokasi</h3>
            <div id="map" class="map-container"></div>
            <div class="coordinate-inputs">
              <div class="input-group">
                <label>Latitude</label>
                <input type="number" id="latitude" class="form-control" step="0.000001">
              </div>
              <div class="input-group">
                <label>Longitude</label>
                <input type="number" id="longitude" class="form-control" step="0.000001">
              </div>
              <button type="button" id="getLocationBtn" class="btn btn-outline">
                <i class="fas fa-location-arrow"></i> Dapatkan Lokasi Sekarang
              </button>
            </div>
          </div>

          <button type="submit" id="submitBtn" class="btn btn-primary">
            <span id="submitText">Simpan Cerita</span>
            <span id="spinner" class="spinner d-none"></span>
          </button>
        </form>
      </section>
    `;
  }

  async afterRender() {
    this._initCamera();
    await this._initMap();
    this._setupEventListeners();
  }

  setPresenter(presenter) {
    if (!presenter) {
      console.error('Error: Presenter tidak boleh null');
      return;
    }
    this._presenter = presenter;
  }

  getFormData() {
    const description = document.getElementById('description').value;
    const lat = document.getElementById('latitude').value;
    const lon = document.getElementById('longitude').value;

    if (!description) {
      this.showError('Deskripsi tidak boleh kosong');
      return null;
    }

    if (!this._selectedPhoto) {
      this.showError('Foto harus dipilih atau diambil terlebih dahulu');
      return null;
    }
        
    return { 
      description, 
      photo: this._selectedPhoto, 
      lat: lat ? parseFloat(lat) : null, 
      lon: lon ? parseFloat(lon) : null 
    };
  }

  showSuccess(message) {
    const notif = document.getElementById('notification');
    notif.innerHTML = `<div class="alert alert-success">${message}</div>`;
    setTimeout(() => notif.innerHTML = '', 3000);
  }

  showLoading() {
    document.getElementById('submitBtn').disabled = true;
    document.getElementById('submitText').textContent = 'Menyimpan...';
    document.getElementById('spinner').classList.remove('d-none');
  }

  stopLoading() {
    document.getElementById('submitBtn').disabled = false;
    document.getElementById('submitText').textContent = 'Simpan Cerita';
    document.getElementById('spinner').classList.add('d-none');
  }

  showError(message) {
    alert(`Error: ${message}`); 
  }

  resetForm() {
    document.getElementById('storyForm').reset();
    document.getElementById('photoPreview').style.display = 'none';
    
    if (this._camera) {
      this._camera.stop();
    }
    
    this._isCameraOpen = false;
    document.getElementById('openCameraBtn').innerHTML = '<i class="fas fa-camera"></i> Buka Kamera';
    document.getElementById('cameraContainer').style.display = 'none';

    if (this._map && this._marker) {
      const center = this._map.getCenter();
      this._marker.setLatLng([center.latitude, center.longitude]);
      this._updateCoordinateInputs(center.latitude, center.longitude);
    }

  }

  // Private methods
  _initCamera() {
    this._camera = new Camera({
      video: document.getElementById('cameraView'),
      canvas: document.createElement('canvas'),
    });
    document.getElementById('cameraContainer').style.display = 'none';
  }

  async _initMap() {
    try {
      this._map = await Map.build('#map', {
        zoom: 15,
        locate: true,
      });

      const center = this._map.getCenter();
      this._updateCoordinateInputs(center.latitude, center.longitude);

      this._marker = this._map.addMarker(
        [center.latitude, center.longitude],
        { draggable: true, autoPan: true }
      );

      this._marker.on('dragend', (e) => {
        const pos = e.target.getLatLng();
        this._updateCoordinateInputs(pos.lat, pos.lng);
      });

      this._map.addMapEventListener('click', (e) => {
        this._marker.setLatLng(e.latlng);
        this._updateCoordinateInputs(e.latlng.lat, e.latlng.lng);
      });

      const mapElement = document.getElementById('map');
      mapElement.style.height = '400px';
      mapElement.style.width = '100%';
    } catch (error) {
      console.error('Gagal menginisialisasi peta:', error);
      this.showError('Gagal memuat peta: ' + error.message);
    }
  }

  _setupEventListeners() {
    // Camera and Photo
    document.getElementById('openCameraBtn').addEventListener('click', this._toggleCamera.bind(this));
    document.getElementById('captureBtn').addEventListener('click', this._capturePhoto.bind(this));
    document.getElementById('uploadPhotoBtn').addEventListener('click', () => {
      document.getElementById('photoInput').click();
    });
    document.getElementById('photoInput').addEventListener('change', this._handleFileUpload.bind(this));

    // Location
    document.getElementById('getLocationBtn').addEventListener('click', this._getCurrentLocation.bind(this));

    // Coordinates
    document.getElementById('latitude').addEventListener('change', this._updateMapFromInputs.bind(this));
    document.getElementById('longitude').addEventListener('change', this._updateMapFromInputs.bind(this));

    // Form submission handled by presenter
    const form = document.getElementById('storyForm');
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (this._presenter) {
          try {
            await this._presenter.handleSubmit();
          } catch (error) {
            console.error('Form submission error:', error);
            this.showError('Terjadi kesalahan saat mengirim form');
          }
        }
    });
  }

  _updateCoordinateInputs(lat, lng) {
    document.getElementById('latitude').value = lat.toFixed(6);
    document.getElementById('longitude').value = lng.toFixed(6);
  }

  async _toggleCamera() {
    const cameraBtn = document.getElementById('openCameraBtn');
    const cameraContainer = document.getElementById('cameraContainer');

    try {
      if (this._isCameraOpen) {
        cameraBtn.innerHTML = '<i class="fas fa-camera"></i> Buka Kamera';
        cameraContainer.style.display = 'none';
        this._camera.stop();
      } else {
        cameraBtn.innerHTML = '<i class="fas fa-times"></i> Tutup Kamera';
        cameraContainer.style.display = 'block';
        cameraBtn.disabled = true;
        cameraBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Membuka Kamera...';
        
        await this._camera.launch();
        
        cameraBtn.disabled = false;
        cameraBtn.innerHTML = '<i class="fas fa-times"></i> Tutup Kamera';
      }
      
      this._isCameraOpen = !this._isCameraOpen;
    } catch (error) {
      console.error('Error:', error);
      this.showError('Gagal mengakses kamera: ' + error.message);
      
      cameraBtn.disabled = false;
      cameraBtn.innerHTML = '<i class="fas fa-camera"></i> Buka Kamera';
      cameraContainer.style.display = 'none';
      this._isCameraOpen = false;
    }
  }

  async _capturePhoto() {
    const captureBtn = document.getElementById('captureBtn');
    const preview = document.getElementById('photoPreview');

    try {
      captureBtn.disabled = true;
      captureBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';

      const photo = await this._camera.takePicture();
      if (!photo || typeof photo !== 'string') {
        throw new Error('Hasil capture tidak valid');
      }

      this._selectedPhoto = await this._convertBase64ToBlob(photo, 'image/jpeg');
      preview.src = photo;
      preview.style.display = 'block';

    } catch (error) {
      console.error('Error capture:', error);
      this.showError(`Gagal mengambil foto: ${error.message}`);
      preview.src = '';
      preview.style.display = 'none';
      this._selectedPhoto = null;
    } finally {
      captureBtn.disabled = false;
      captureBtn.innerHTML = '<i class="fas fa-camera-retro"></i> Ambil Foto';
    }
  }

  _handleFileUpload(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 1000000) {
        this.showError('Ukuran gambar maksimal 1MB');
        return;
      }

      this._selectedPhoto = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = document.getElementById('photoPreview');
        preview.src = e.target.result;
        preview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  }

  async _getCurrentLocation() {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000
        });
      });

      const latlng = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      
      this._map.changeCamera([latlng.lat, latlng.lng], 15);
      this._marker.setLatLng(latlng);
      this._updateCoordinateInputs(latlng.lat, latlng.lng);
    } catch (err) {
      this.showError('Tidak dapat mendapatkan lokasi: ' + err.message);
    }
  }

  _updateMapFromInputs() {
    const lat = parseFloat(document.getElementById('latitude').value);
    const lng = parseFloat(document.getElementById('longitude').value);

    if (!isNaN(lat) && !isNaN(lng)) {
      this._map.changeCamera([lat, lng]);
      this._marker.setLatLng([lat, lng]);
    }
  }

  async _convertBase64ToBlob(base64, type) {
    const res = await fetch(base64);
    return await res.blob();
  }
}