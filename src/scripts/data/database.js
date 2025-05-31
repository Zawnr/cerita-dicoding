import { openDB } from 'idb';

const DATABASE_NAME = 'citycare';
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = 'saved-reports';

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade: (database) => {
    database.createObjectStore(OBJECT_STORE_NAME, {
      keyPath: 'id', // 'id' akan menjadi primary key untuk setiap laporan
    });
  },
});

const Database = {
  // Fungsi untuk menyimpan laporan baru ke IndexedDB
  async putReport(report) {
    if (!Object.hasOwn(report, 'id')) {
      throw new Error('`id` is required to save.');
    }
    return (await dbPromise).put(OBJECT_STORE_NAME, report);
  },

  // Fungsi untuk mendapatkan satu laporan berdasarkan ID dari IndexedDB
  async getReportById(id) {
    if (!id) {
      throw new Error('`id` is required.');
    }
    return (await dbPromise).get(OBJECT_STORE_NAME, id);
  },

  // Fungsi untuk mendapatkan semua laporan dari IndexedDB
  async getAllReports() {
    return (await dbPromise).getAll(OBJECT_STORE_NAME);
  },

  // Fungsi untuk menghapus laporan berdasarkan ID dari IndexedDB
  async removeReport(id) {
    return (await dbPromise).delete(OBJECT_STORE_NAME, id);
  },
};

export default Database;