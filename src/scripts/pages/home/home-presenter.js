import { getAccessToken } from '../../utils/auth';
import { getAllStories } from '../../data/api';

export default class HomePresenter {
  constructor(view) {
    this._view = view;
  }

  async loadStories() {
    try {
      this._view.showLoading();
      const token = getAccessToken();
      const response = await getAllStories({ token });

      if (!response.ok) throw new Error(response.message);

      this._view.showStories(response.listStory);

    } catch (error) {
      this._view.showError(error.message || 'Gagal memuat cerita');
    } finally {
      this._view.hideLoading();
    }
  }
}
