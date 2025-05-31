import { reportMapper } from '../../data/api-mapper'; 

export default class BookmarkPresenter {
  #view;
  #model; // Ini akan menjadi instance Database

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model; // Inisialisasi model (Database)
  }

  /**
   * Menginisialisasi galeri laporan tersimpan dan peta.
   */
  async initialGalleryAndMap() {
    this.#view.showReportsListLoading(); // Tampilkan loading untuk daftar laporan

    try {
      await this.showReportsListMap(); // Inisialisasi peta terlebih dahulu

      const listOfReports = await this.#model.getAllReports(); // <--- Ambil semua laporan dari IndexedDB
      
      // Lakukan mapping data jika diperlukan, sesuaikan dengan kebutuhan Anda
      // Asumsi: data dari IndexedDB mungkin perlu di-mapping agar sesuai dengan generateReportItemTemplate
      const reports = await Promise.all(listOfReports.map(reportMapper)); 

      const message = 'Berhasil mendapatkan daftar cerita tersimpan.';
      this.#view.populateBookmarkedReports(message, reports); // Tampilkan laporan ke view
    } catch (error) {
      console.error('initialGalleryAndMap: error:', error);
      this.#view.populateBookmarkedReportsError(error.message || 'Gagal memuat daftar cerita tersimpan.');
    } finally {
      this.#view.hideReportsListLoading(); // Sembunyikan loading
    }
  }

  /**
   * Menginisialisasi tampilan peta di view.
   */
  async showReportsListMap() {
    this.#view.showMapLoading(); // Tampilkan loading untuk peta
    try {
      await this.#view.initialMap(); // Memanggil metode inisialisasi peta di view
    } catch (error) {
      console.error('showReportsListMap: error:', error);
    } finally {
      this.#view.hideMapLoading(); // Sembunyikan loading peta
    }
  }
}