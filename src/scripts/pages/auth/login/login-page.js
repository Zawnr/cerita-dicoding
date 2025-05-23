
export default class LoginPage {
  constructor() {
    this._mainElement = document.querySelector('#main-content');
    this._presenter = null;
  }

  render() {
    return `
      <section class="login-container">
        <article class="login-form-container">
          <h1 class="login__title">Masuk akun</h1>
          <div id="loginError" class="error-message" style="display: none;"></div>
          <form id="login-form" class="login-form">
            <div class="form-control">
              <label for="email-input">Email</label>
              <input id="email-input" type="email" required placeholder="Contoh: nama@email.com">
            </div>
            <div class="form-control">
              <label for="password-input">Password</label>
              <input id="password-input" type="password" required placeholder="Masukkan password Anda" minlength="8">
            </div>
            <div class="form-buttons">
              <div id="submit-button-container">
                <button class="btn" type="submit">Masuk</button>
              </div>
              <p class="login-form__do-not-have-account">
                Belum punya akun? <a href="#/register">Daftar</a>
              </p>
            </div>
          </form>
        </article>
      </section>
    `;
  }

  async afterRender() {
    try {
      const { default: LoginPresenter } = await import('./login-presenter');
      this._presenter = new LoginPresenter(this);
      
      // Binding event
      const form = document.getElementById('login-form');
      if (form) {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          if (this._presenter) {
            const email = document.getElementById('email-input').value;
            const password = document.getElementById('password-input').value;
            await this._presenter.handleLogin({ email, password });
          }
        });
      }
    } catch (error) {
      console.error('afterRender error:', error);
    }
  }

  showLoading() {
    const submitContainer = document.getElementById('submit-button-container');
    if (submitContainer) {
      submitContainer.innerHTML = `
        <button class="btn" type="submit" disabled>
          <i class="fas fa-spinner fa-spin"></i> Memproses...
        </button>
      `;
    }
  }

  showError(message) {
    const errorElement = document.getElementById('loginError');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  }

  resetForm() {
    const errorElement = document.getElementById('loginError');
    const submitContainer = document.getElementById('submit-button-container');
    
    if (errorElement) {
      errorElement.style.display = 'none';
    }
    
    if (submitContainer) {
      submitContainer.innerHTML = `
        <button class="btn" type="submit">Masuk</button>
      `;
    }
  }
}
