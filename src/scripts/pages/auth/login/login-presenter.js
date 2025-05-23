import { putAccessToken, getAccessToken } from "../../../utils/auth";
import { getLogin } from "../../../data/api";
import { navigateTo } from '../../../routes/url-parser';


export default class LoginPresenter {
  constructor(view) {
    this._view = view;
    this.handleLogin = this._handleLogin.bind(this); // Binding method

  }

  async _handleLogin({ email, password }) {
    try {
      this._view.showLoading();
      const response = await getLogin({ email, password });
      
      if (!response.ok || !response.loginResult?.token) {
        throw new Error(response.message || 'Login gagal');
      }
  
      putAccessToken(response.loginResult.token);
      const verifiedToken = getAccessToken();
  
      if (!verifiedToken) {
        throw new Error('Gagal memverifikasi token');
      }
      
      navigateTo('/');

    } catch (error) {
      this._view.showError(error.message);
    } finally {
      this._view.resetForm();
    }
  }
}