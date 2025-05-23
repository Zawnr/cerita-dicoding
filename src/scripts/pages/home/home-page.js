export default class HomePage {
  constructor() {
    this._mainElement = document.querySelector('#main-content');
  }

  render() {
    return `
      <section class="home-container">
        <h1 class="page-title">Berkumpul Bercerita</h1>
        <div id="stories-list" class="stories-list"></div>
        <div id="loading" class="loading" style="display:none;">Loading...</div>
        <div id="error" class="error" style="display:none;"></div>
      </section>
    `;
  }

  async afterRender() {
    this._mainElement.innerHTML = this.render();
    const { default: HomePresenter } = await import('./home-presenter');
    this._presenter = new HomePresenter(this);
    await this._presenter.loadStories();
  }

  showStories(stories) {
    const container = document.getElementById('stories-list');
    container.innerHTML = stories.map(story => `
      <article class="story-item">
        <h3 class="story-title">${story.name}</h3>
        <img src="${story.photoUrl}" alt="Foto ${story.name}" class="story-photo" loading="lazy" />
        <small class="story-date">${new Date(story.createdAt).toLocaleDateString('id-ID', {
          day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
        })}</small>
        <p class="story-location">📍 ${story.lat}, ${story.lon}</p>
        <p class="story-description">${story.description.substring(0, 50)}...</p>
        <a href="#/stories/${story.id}" class="btn btn-primary btn-sm">Selengkapnya</a>
      </article>
    `).join('');
  }

  showLoading() {
    const loadingEl = document.getElementById('loading');
    loadingEl.style.display = 'block';
    loadingEl.textContent = 'Memuat cerita...';
  }

  hideLoading() {
    document.getElementById('loading').style.display = 'none';
  }

  showError(message) {
    const errorEl = document.getElementById('error');
    errorEl.style.display = 'block';
    errorEl.textContent = message;
    errorEl.style.color = 'var(--color-error)';
  }
}
