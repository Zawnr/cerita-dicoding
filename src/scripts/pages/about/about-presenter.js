export default class AboutPresenter {
  constructor(view) {
    this._view = view;
    this._setupCTAButtons();
  }

  _setupCTAButtons() {
    const addStoryBtn = document.querySelector('.cta-button.primary');
    const exploreBtn = document.querySelector('.cta-button.secondary');

    addStoryBtn?.addEventListener('click', () => {
      console.log('Tombol "Mulai Cerita" diklik');
      // Tambahkan tracking event atau animasi nanti
    });

    exploreBtn?.addEventListener('click', () => {
      console.log('Tombol "Jelajahi Cerita Lain" diklik');
    });
  }
}
