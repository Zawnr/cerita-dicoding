export default class AboutPage {
  constructor() {
    this._mainElement = document.querySelector('#main-content');
  }

  render() {
    return `
      <section class="about-container">
        <div class="intro-section">
          <h1 class="title">✨ Kenalan Yuk Sama <span class="highlight">Cerita Dicoding!</span></h1>
          <p class="description">
            Pernah ngerasa pengin cerita soal pengalaman belajar, ikut kelas, atau sukses dapet kerja gara-gara ngoding?
            <br><br>
            Di <strong>Cerita Dicoding</strong>, kamu bisa bagiin semua momen itu! Ini tempat buat kamu berbagi cerita bareng komunitas,
            khususnya pejuang teknologi di seluruh Indonesia. <em>Simpel, seru, dan pastinya bikin semangat!</em>
          </p>
        </div>

        <div class="about-section">
          <h2>Apa Itu Cerita Dicoding?</h2>
          <p>
            Cerita Dicoding adalah platform berbagi cerita berbasis web, mirip kayak post di media sosial—tapi khusus 
            untuk kamu yang semangat belajar dan berkembang di dunia teknologi.
            <br><br>
            Di sini, kamu bisa upload foto, kasih deskripsi, bahkan tambahin lokasi kalau mau. <strong>Nggak perlu jadi expert kok, semua orang bisa cerita!</strong>
          </p>
        </div>

        <div class="about-section">
          <h2>Kenapa Harus Cerita Dicoding?</h2>
          <ul class="custom-list">
            <li> Mudah digunakan, bahkan buat pemula</li>
            <li> Bisa login atau langsung posting sebagai tamu</li>
            <li> Cerita kamu bisa dilihat banyak orang & menginspirasi</li>
            <li> Dapat notifikasi kalau ada cerita baru</li>
            <li> Bangun koneksi dan semangat bareng komunitas Dicoding</li>
          </ul>
        </div>

        <div class="about-section">
          <h2>Siapa Saja yang Bisa Gabung?</h2>
          <p>
            <strong>Semua orang!</strong> Baik kamu yang baru mulai belajar, lagi magang, atau udah kerja di industri,
            Cerita Dicoding bisa jadi tempat buat berbagi dan saling dukung. Karena <em>setiap cerita itu penting 💬</em>
          </p>
        </div>

        <div class="cta-section">
          <h2>🚀 Yuk, Mulai Ceritamu Hari Ini!</h2>
          <p>Buka hati. Buka browser. Terus klik tombol <strong>"Buat Cerita"</strong> dan mulai bagikan kisah kamu sekarang juga!</p>
          <p>📸✨ Ceritamu bisa jadi inspirasi orang lain, lho!</p>
          
          <div class="cta-buttons">
            <a href="#/add-story" class="cta-button primary">✍️ Mulai Cerita Sekarang</a>
            <a href="#/" class="cta-button secondary">🔍 Jelajahi Cerita Lain</a>
          </div>
        </div>
      </section>
    `;
  }

  afterRender() {
    this._cacheDOM();
    console.log('About page rendered');
  }

  _cacheDOM() {
    this._addStoryBtn = document.querySelector('.cta-button.primary');
    this._exploreBtn = document.querySelector('.cta-button.secondary');
  }

  get addStoryButton() {
    return this._addStoryBtn;
  }

  get exploreButton() {
    return this._exploreBtn;
  }
}
