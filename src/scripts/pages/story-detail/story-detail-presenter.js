import { getAccessToken } from '../../utils/auth';
import { getStoryById } from '../../data/api';
import Map from '../../utils/maps';
import Database from '../../data/database'; 

export default class StoryDetailPresenter {
  #storyId; 
  #view;
  #apiModel; 
  #dbModel;  

  constructor(storyId, { view, apiModel, dbModel }) {
    this.#storyId = storyId;
    this.#view = view;
    this.#apiModel = apiModel; 
    this.#dbModel = dbModel;   
  }
  
  async loadStory() {
    try {
      this.#view.showLoading();
      this.#view.hideError(); 

      const token = getAccessToken(); 
      if (!token) {
        throw new Error('Silakan login terlebih dahulu');
      }

      const { ok, story, message } = await this.#apiModel.getStoryById(this.#storyId, token);

      if (!ok) {
        throw new Error(message || 'Gagal memuat detail cerita');
      }

      if (!story) {
        throw new Error('Cerita tidak ditemukan');
      }

      if (story.lat && story.lon) {
        try {
          story.locationName = await Map.getPlaceNameByCoordinate(story.lat, story.lon);
        } catch (error) {
          console.error('Error getting location name:', error);
          story.locationName = `${story.lat}, ${story.lon}`;
        }
      }

      this.#view.showStoryDetail(story);

    } catch (error) {
      this.#view.showError(error.message);
      console.error('Error loading story:', error.message);
    } finally {
      this.#view.hideLoading();
    }
  }

  async saveStory() {
    try {
      this.#view.showLoading(); 
      const token = getAccessToken();
      const { ok, story, message } = await this.#apiModel.getStoryById(this.#storyId, token);

      if (!ok) {
        throw new Error(message || 'Gagal mendapatkan detail cerita dari API.');
      }

      if (!story || !story.id) {
        throw new Error('Data cerita tidak lengkap untuk disimpan (ID tidak ditemukan).');
      }

      await this.#dbModel.putReport(story);
      this.#view.saveToBookmarkSuccessfully('Cerita berhasil disimpan!');
    } catch (error) {
      console.error('saveStory: error:', error);
      this.#view.saveToBookmarkFailed(error.message || 'Gagal menyimpan cerita.');
    } finally {
      this.#view.hideLoading(); 
    }
  }

  async removeStory() {
    try {
      this.#view.showLoading(); 
      await this.#dbModel.removeReport(this.#storyId); 
      this.#view.removeFromBookmarkSuccessfully('Cerita berhasil dihapus dari simpanan!');
    } catch (error) {
      console.error('removeStory: error:', error);
      this.#view.removeFromBookmarkFailed(error.message || 'Gagal menghapus cerita.');
    } finally {
      this.#view.hideLoading(); 
    }
  }

  async showSaveButton() {
    if (await this.#isStorySaved()) {
      this.#view.renderRemoveButton();
      return;
    }
    this.#view.renderSaveButton();
  }

  async #isStorySaved() {
    return !!(await this.#dbModel.getReportById(this.#storyId)); 
  }
}