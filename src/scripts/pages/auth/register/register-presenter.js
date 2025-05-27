import { getRegistered } from '../../../data/api';
import { navigateTo } from '../../../routes/url-parser';

class RegisterPresenter {
  constructor({ view }) {
    this._view = view;
    this._handleRegister = this._handleRegister.bind(this); // Binding method
  }

  async _handleRegister({ name, email, password }) {
    try {
      this._view.showLoading();
      
      const response = await getRegistered({ name, email, password });
      
      if (!response.ok) {
        throw new Error(response.message || 'Registration failed');
      }

      this._view.showSuccess('Registration successful! Please login');
      navigateTo('/login');
      
    } catch (error) {
      this._view.showError(error.message);
    } finally {
      this._view.hideLoading();
    }
  }
}

const createRegisterPresenter = (view) => {
  return new RegisterPresenter({ view });
};

export default RegisterPresenter;