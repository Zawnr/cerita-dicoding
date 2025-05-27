export default class AboutPresenter {
  constructor(view) {
    this._view = view;
  }

    init() {
    this._setupCTAButtons();
  }

  _setupCTAButtons() {
    const addStoryBtn = this._view.addStoryButton;
    const exploreBtn = this._view.exploreButton;

    addStoryBtn?.addEventListener('click', () => {
      console.log('Tombol "Mulai Cerita" diklik');
    });

    exploreBtn?.addEventListener('click', () => {
      console.log('Tombol "Jelajahi Cerita Lain" diklik');
    });
  }
}
