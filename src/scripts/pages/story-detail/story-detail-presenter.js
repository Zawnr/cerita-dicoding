import { getAccessToken } from '../../utils/auth';
import { getStoryById } from '../../data/api';
import Map from '../../utils/maps';

export default class StoryDetailPresenter {
    constructor(view) {
      this._view = view;
    }
  
  async loadStory(storyId) {
    try {
      this._view.showLoading();
      
      const token = getAccessToken();
      if (!token) throw new Error('Silakan login terlebih dahulu');

      const { ok, story, message } = await getStoryById(storyId, token);
      
      if (!ok) {
        throw new Error(message || 'Gagal memuat detail cerita');
      }

      if (!story) {
        throw new Error('Cerita tidak ditemukan');
      }

      // Tambahkan lokasi name jika ada koordinat
      if (story.lat && story.lon) {
        try {
          story.locationName = await Map.getPlaceNameByCoordinate(story.lat, story.lon);
        } catch (error) {
          console.error('Error getting location name:', error);
          story.locationName = `${story.lat}, ${story.lon}`;
        }
      }

      this._view.showStoryDetail(story);
      
    } catch (error) {
      this._view.showError(error.message);
      console.error('Error loading story:', error.message);
    } finally {
      this._view.hideLoading();
    }
  }
}