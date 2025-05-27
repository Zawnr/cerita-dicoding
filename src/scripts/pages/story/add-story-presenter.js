import { addNewStory } from '../../data/api';

export default class AddStoryPresenter {
  constructor(view) {
    this._view = view;
  }

  async init() {
    try {
      await this._view.afterRender();
    } catch (error) {
      console.error('Presenter init failed:', error);
      this._view.showError('Failed to initialize form');
    }
  }

  async handleSubmit() {
    this._view.showLoading();
    console.log('[DEBUG] Starting form submission');
    
    try {
      // 1. Get form data from view
      const formData = this._view.getFormData();
      console.log('[DEBUG] Form data:', {
        description: formData.description,
        hasPhoto: !!formData.photo,
        photoType: formData.photo?.constructor?.name,
        location: formData.lat && formData.lon ? 
          `${formData.lat}, ${formData.lon}` : 'none'
      });
    
      // 2. Prepare payload
      const payload = new FormData();
      payload.append('description', formData.description);
      
      // Handle photo (Blob/File)
      if (formData.photo instanceof Blob || formData.photo instanceof File) {
        payload.append('photo', formData.photo, 'story.jpg');
      } else {
        throw new Error('Format foto tidak valid');
      }
    
      // Add location if available
      if (formData.lat && formData.lon) {
        payload.append('lat', formData.lat.toString());
        payload.append('lon', formData.lon.toString());
      }
    
      // 3. Send to API
      console.log('[DEBUG] Sending to API...');
      const response = await addNewStory(payload);
      console.log('[DEBUG] API response:', response);
    
      // 4. Handle success
      this._view.showSuccess('Cerita berhasil ditambahkan!');
      this._view.resetForm();
    
      // 5. Trigger callback if exists
      if (this.onSuccessCallback) {
        this.onSuccessCallback();
      }
    
      } catch (error) {
          let userMessage = error.message;
          if (error.message.includes('token')) {
            userMessage = 'Sesi telah berakhir, silakan login kembali';
          } else if (error.message.includes('network')) {
            userMessage = 'Gagal terhubung ke server';
            }
      
          this._view.showError(userMessage);

      } finally {
        this._view.stopLoading();
      }
  }

  setOnSuccessCallback(callback) {
    this.onSuccessCallback = callback;
  }
}