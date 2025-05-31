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

            <div id="cameraContainer" class="camera-container" style="display:none">
              <video id="cameraView" autoplay playsinline></video>
              <button type="button" id="captureBtn" class="btn btn-primary">
                <i class="fas fa-camera-retro"></i> Ambil Foto
              </button>
            </div>
            
            <div class="photo-options">
              <button type="button" id="openCameraBtn" class="btn btn-outline">
                <i class="fas fa-camera"></i> Buka Kamera
              </button>
              <button type="button" id="uploadPhotoBtn" class="btn btn-outline">
                <i class="fas fa-upload"></i> Ambil dari File
              </button>
              <input type="file" id="photoInput" accept="image/*" style="display:none">
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
          <div id="notification"></div>
        </form>
      </section>
    `;
  }

  async afterRender() {
    try {
    const { default: AddStoryPresenter } = await import('./add-story-presenter');
    this._presenter = new AddStoryPresenter(this);

    this._initCamera();
    await this._initMap();
    this._setupEventListeners();

        console.log('[SUCCESS] AddStoryPage initialized with presenter');
    
    } catch (error) {
      console.error('[ERROR] Failed to initialize AddStoryPage:', error);
      this.showError('Gagal menginisialisasi halaman');
    }
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

    console.log('[DEBUG] Form values:', { description, lat, lon });
    console.log('[DEBUG] Selected photo:', this._selectedPhoto);

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
    console.log('[DEBUG] showSuccess called:', message);
    try {
      const notif = document.getElementById('notification');
      if (notif) {
        notif.innerHTML = `<div class="alert alert-success">${message}</div>`;
        setTimeout(() => {
          try {
            notif.innerHTML = '';
          } catch (timeoutError) {
            console.warn('[WARNING] Timeout cleanup failed:', timeoutError);
          }
        }, 3000);
      } else {
        // Fallback: gunakan alert jika notification element tidak ada
        console.warn('[WARNING] Notification element not found, using alert');
        alert(message);
      }
    } catch (error) {
      console.error('[ERROR] showSuccess failed:', error);
      // Fallback ke alert
      alert(message);
    }
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
    console.log('[DEBUG] resetForm called');
    try {
      // Reset form
      const form = document.getElementById('storyForm');
      if (form) {
        form.reset();
      }

      // Reset photo preview
      const photoPreview = document.getElementById('photoPreview');
      if (photoPreview) {
        photoPreview.style.display = 'none';
        photoPreview.src = '';
      }

      // Reset selected photo
      this._selectedPhoto = null;

      // Safely stop camera
      if (this._camera) {
        try {
          this._camera.stop();
        } catch (cameraError) {
          console.warn('[WARNING] Camera stop failed:', cameraError);
        }
      }

      // Reset camera UI
      this._isCameraOpen = false;
      const openCameraBtn = document.getElementById('openCameraBtn');
      const cameraContainer = document.getElementById('cameraContainer');

      if (openCameraBtn) {
        openCameraBtn.innerHTML = '<i class="fas fa-camera"></i> Buka Kamera';
      }
      if (cameraContainer) {
        cameraContainer.style.display = 'none';
      }

      // Safely reset map
      if (this._map && this._marker) {
        try {
          const center = this._map.getCenter();
          this._marker.setLatLng([center.latitude, center.longitude]);
          this._updateCoordinateInputs(center.latitude, center.longitude);
        } catch (mapError) {
          console.warn('[WARNING] Map reset failed:', mapError);
        }
      }

      console.log('[SUCCESS] Form reset completed');
    } catch (error) {
      console.error('[ERROR] resetForm failed:', error);
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

      if (this._presenter && typeof this._presenter.handleSubmit === 'function') {
        try {
          await this._presenter.handleSubmit();
        } catch (error) {
          // PERBAIKAN: Log error detail untuk debugging
          console.error('[ERROR] Form submission failed in view:', error);
          console.error('[ERROR] Error stack:', error.stack);

          // Show user-friendly message
          this.showError(`Gagal mengirim form: ${error.message || 'Unknown error'}`);
        }
      } else {
        console.error('[ERROR] Presenter or handleSubmit not available');
        this.showError('Form handler tidak tersedia');
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