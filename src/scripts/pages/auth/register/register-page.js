export default class RegisterPage {
  constructor() {
    this._mainElement = document.querySelector('#main-content');
  }

  render() {
    return `
      <section class="register-container">
        <div class="register-form-container">
          <h1 class="register__title">Daftar akun</h1>
          <div id="registerError" class="error-message"></div>
          <form id="register-form" class="register-form">
            <div class="form-control">
              <label for="name-input">Nama lengkap</label>
              <input id="name-input" type="text" required>
            </div>
            <div class="form-control">
              <label for="email-input">Email</label>
              <input id="email-input" type="email" required>
            </div>
            <div class="form-control">
              <label for="password-input">Password (min 8 karakter)</label>
              <input id="password-input" type="password" required minlength="8">
            </div>
            <div class="form-buttons">
              <button id="register-button" class="btn" type="submit">Daftar</button>
              <p class="register-form__link">
                Sudah punya akun? <a href="#/login">Masuk</a>
              </p>
            </div>
          </form>
        </div>
      </section>
    `;
  }

  bindRegister(handler) {
    document.getElementById('register-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = {
        name: document.getElementById('name-input').value,
        email: document.getElementById('email-input').value,
        password: document.getElementById('password-input').value
      };
      await handler(data);
    });
  }

  showError(message) {
    const errorElement = document.getElementById('registerError');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }

  showLoading() {
    const button = document.getElementById('register-button');
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
    button.disabled = true;
  }

  resetForm() {
    document.getElementById('registerError').style.display = 'none';
    const button = document.getElementById('register-button');
    button.textContent = 'Daftar';
    button.disabled = false;
  }
}
  