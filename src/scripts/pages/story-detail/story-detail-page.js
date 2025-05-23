import StoryDetailPresenter from "./story-detail-presenter";
import Map  from '../../utils/maps';

export default class StoryDetailPage {
    constructor() {
      this._mainElement = document.querySelector('#main-content');
      this._loadingElement = null;
      this._errorElement = null;
      this._map = null;
    }
  
    render() {
     return `
        <div>
          <h1 id="story-title">Loading...</h1>
          <div id="story-content">
            <img id="story-image" width="300" alt="Foto cerita" />
            <p id="story-description"></p>
            <p id="story-date"></p>
            <p id="story-location-name"></p>
            <p id="story-coordinates"></p>
            <!-- Tempat peta -->
            <div id="map-container" style="height: 300px; border-radius: 12px; margin-top: 1rem;">
              <div id="map" style="height: 100%;"></div>
            </div>
          </div>
          <div id="loading">Memuat detail cerita...</div>
          <div id="error" style="color:red;display:none;"></div>
          <a href="#/" class="back-button">Kembali ke Beranda</a>
        </div>
      `;
    }
  
  async afterRender(params) {
    this._loadingElement = document.getElementById('loading');
    this._errorElement = document.getElementById('error');
    
    const { default: StoryDetailPresenter } = await import('./story-detail-presenter');
    this._presenter = new StoryDetailPresenter(this);
    await this._presenter.loadStory(params.id);
  }

  showLoading() {
    if (this._loadingElement) {
      this._loadingElement.style.display = 'block';
    }
  }

  hideLoading() {
    if (this._loadingElement) {
      this._loadingElement.style.display = 'none';
    }
  }

  showError(message) {
    if (this._errorElement) {
      this._errorElement.style.display = 'block';
      this._errorElement.textContent = message;
    }
  }

  async showStoryDetail(story) {
  if (!story) {
    return this.showError('Data cerita tidak valid');
  }

  const elements = {
    title: document.getElementById('story-title'),
    image: document.getElementById('story-image'),
    description: document.getElementById('story-description'),
    date: document.getElementById('story-date'),
    locationName: document.getElementById('story-location-name'),
    coordinates: document.getElementById('story-coordinates'),
  };

  // Update story information
  elements.title.textContent = story.name || 'Judul tidak tersedia';
  elements.description.textContent = story.description || 'Deskripsi tidak tersedia';
  elements.image.src = story.photoUrl || 'placeholder.jpg';
  elements.image.alt = story.name || 'Cerita';
  
  if (story.createdAt) {
    const date = new Date(story.createdAt);
    elements.date.textContent = `Dibuat pada: ${date.toLocaleDateString()}`;
  }

  // Show location information
  if (story.lat && story.lon) {
    // Tampilkan koordinat
    elements.coordinates.textContent = `Koordinat: Lat ${story.lat}, Lon ${story.lon}`;
    
    // Tampilkan nama lokasi jika ada
    if (story.locationName) {
      elements.locationName.textContent = `Lokasi: ${story.locationName}`;
    } else {
      // Jika tidak ada locationName, coba dapatkan dari Map
      try {
        const locationName = await Map.getPlaceNameByCoordinate(story.lat, story.lon);
        elements.locationName.textContent = `Lokasi: ${locationName}`;
      } catch (error) {
        console.error('Gagal mendapatkan nama lokasi:', error);
        elements.locationName.textContent = 'Lokasi: Tidak diketahui';
      }
    }

    // Initialize map
    await this._initMap(story.lat, story.lon, story.name);
  } else {
    elements.locationName.textContent = 'Lokasi: Tidak tersedia';
    elements.coordinates.textContent = 'Koordinat: Tidak tersedia';
  }
}

  async _initMap(lat, lon, title) {
    try {
      // Remove existing map if any
      if (this._map) {
        this._map.remove();
      }

      // Initialize new map
      this._map = await Map.build('#map', {
        center: [lat, lon],
        zoom: 15,
        locate: false
      });

      // Add marker
      this._map.addMarker([lat, lon], {}, {
        content: title || 'Lokasi Cerita'
      });

    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }
}