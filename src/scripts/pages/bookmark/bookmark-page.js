// src/scripts/pages/bookmark/bookmark-page.js

// Import template yang diperlukan untuk menampilkan daftar laporan
import {
  generateLoaderAbsoluteTemplate,
  generateReportItemTemplate, // Asumsi template ini bisa dipakai untuk item cerita
  generateReportsListEmptyTemplate,
  generateReportsListErrorTemplate,
} from '../../templates';
import BookmarkPresenter from './bookmark-presenter'; // Akan kita buat di langkah berikutnya
import Database from '../../data/database'; // Import model Database
import Map from '../../utils/maps'; // Jika Anda ingin menampilkan peta

export default class BookmarkPage {
  #presenter = null;
  #map = null; // Properti untuk instance peta

  async render() {
    return `
      <section>
        <div class="reports-list__map__container">
          <div id="map" class="reports-list__map"></div>
          <div id="map-loading-container"></div>
        </div>
      </section>

      <section class="container">
        <h1 class="section-title">Daftar Cerita Tersimpan</h1>

        <div class="reports-list__container">
          <div id="reports-list"></div>
          <div id="reports-list-loading-container"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    // Inisialisasi Presenter dan jalankan logika awal setelah render
    this.#presenter = new BookmarkPresenter({
      view: this,
      model: Database, // Teruskan Database sebagai model untuk presenter
    });
    await this.#presenter.initialGalleryAndMap(); // Memuat data dan peta
  }

  /**
   * Mengisi daftar cerita yang di-bookmark ke dalam UI.
   * @param {string} message Pesan status.
   * @param {Array<Object>} reports Array objek cerita.
   */
  populateBookmarkedReports(message, reports) {
    if (reports.length <= 0) {
      this.populateBookmarkedReportsListEmpty();
      return;
    }

    const html = reports.reduce((accumulator, report) => {
      // Tambahkan marker ke peta jika peta sudah diinisialisasi
      if (this.#map && report.lat && report.lon) { // Pastikan koordinat cerita ada
        const coordinate = [report.lat, report.lon]; // Sesuaikan jika properti koordinat berbeda
        const markerOptions = { alt: report.name || 'Cerita Tersimpan' };
        const popupOptions = { content: report.name || 'Lokasi Cerita' };
        this.#map.addMarker(coordinate, markerOptions, popupOptions);
      }

      // Asumsi generateReportItemTemplate bisa menerima objek cerita
      return accumulator.concat(
        generateReportItemTemplate({
          ...report,
          // Sesuaikan properti agar cocok dengan generateReportItemTemplate Anda
          placeNameLocation: report.locationName || 'Lokasi tidak diketahui',
          reporterName: report.reporter?.name || 'Anonim', // Asumsi ada objek reporter
        }),
      );
    }, '');

    document.getElementById('reports-list').innerHTML = `
      <div class="reports-list">${html}</div>
    `;
    console.log(message); // Tampilkan pesan sukses di konsol
  }

  /**
   * Menampilkan template jika daftar cerita kosong.
   */
  populateBookmarkedReportsListEmpty() {
    document.getElementById('reports-list').innerHTML = generateReportsListEmptyTemplate();
  }

  /**
   * Menampilkan template jika ada error saat memuat daftar cerita.
   * @param {string} message Pesan error.
   */
  populateBookmarkedReportsError(message) {
    document.getElementById('reports-list').innerHTML = generateReportsListErrorTemplate(message);
  }

  /**
   * Menampilkan indikator loading untuk daftar cerita.
   */
  showReportsListLoading() {
    const loadingContainer = document.getElementById('reports-list-loading-container');
    if (loadingContainer) {
      loadingContainer.innerHTML = generateLoaderAbsoluteTemplate();
      loadingContainer.style.display = 'flex'; // Pastikan container loading terlihat
    }
  }

  /**
   * Menyembunyikan indikator loading untuk daftar cerita.
   */
  hideReportsListLoading() {
    const loadingContainer = document.getElementById('reports-list-loading-container');
    if (loadingContainer) {
      loadingContainer.innerHTML = ''; // Hapus konten loader
      loadingContainer.style.display = 'none'; // <--- Sembunyikan container sepenuhnya
    }
  }

  /**
   * Menginisialisasi peta.
   */
  async initialMap() {
    // Pastikan elemen dengan id="map" ada di metode render()
    this.#map = await Map.build('#map', { // Asumsi Map.build tersedia di utils/maps.js
      zoom: 10,
      locate: true, // Mengaktifkan lokasi pengguna
    });
  }

  /**
   * Menampilkan indikator loading untuk peta.
   */
  showMapLoading() {
    document.getElementById('map-loading-container').innerHTML = generateLoaderAbsoluteTemplate();
  }

  /**
   * Menyembunyikan indikator loading untuk peta.
   */
  hideMapLoading() {
    document.getElementById('map-loading-container').innerHTML = '';
  }
}