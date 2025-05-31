import routes from '../routes/routes';
import { 
  getActiveRoute, 
  navigateTo 
} from '../routes/url-parser';
import { updateNavbar } from '../utils/navbar-handler';
import { checkAuthAccess } from '../utils/auth';
import { 
  generateSubscribeButtonTemplate, 
  generateUnsubscribeButtonTemplate 
} from '../templates';
import { isServiceWorkerAvailable, } from '../utils';
import { 
  isCurrentPushSubscriptionAvailable, 
  subscribe, 
  unsubscribe 
} from '../utils/notification-helper';

class App {
  constructor({ navigationDrawer, drawerButton, content }) {
    this._content = content;
    this._drawerButton = drawerButton;
    this._navigationDrawer = navigationDrawer;

    this._setupDrawer();
    this._setupRouter();
    updateNavbar();
  }

  _setupDrawer() {
    this._drawerButton.addEventListener('click', () => {
      this._navigationDrawer.classList.toggle('open');
    });

    document.addEventListener('click', (event) => {
      if (!this._navigationDrawer.contains(event.target) && 
          !this._drawerButton.contains(event.target)) {
        this._navigationDrawer.classList.remove('open');
      }
    });
  }

  _setupRouter() {
    window.addEventListener('hashchange', () => this._renderPage());
    this._renderPage(); 
  }

  async _renderContent(path) {
    const redirectTo = checkAuthAccess(path);
    if (redirectTo) {
      window.location.hash = redirectTo;
      return;
    }

    const matchedRoute = Object.keys(routes).find(route => {
      const routeParts = route.split('/');
      const pathParts = path.split('/');
      return routeParts.every((part, i) => 
        part.startsWith(':') || part === pathParts[i]
      );
    });

    if (!matchedRoute) {
      this._content.innerHTML = '<h1>404 - Halaman Tidak Ditemukan</h1>';
      return;
    }

    const params = {};
    const routeParts = matchedRoute.split('/');
    const pathParts = path.split('/');
    
    routeParts.forEach((part, i) => {
      if (part.startsWith(':')) {
        params[part.slice(1)] = pathParts[i];
      }
    });

    const html = await routes[matchedRoute].render(params);
    this._content.innerHTML = html;
    
    if (typeof routes[matchedRoute].page.afterRender === 'function') {
      await routes[matchedRoute].page.afterRender(params);
    }
  }

  async #setupPushNotification() {
    const pushNotificationTools = document.getElementById('push-notification-tools');
    if (!pushNotificationTools) {
      console.warn('Elemen #push-notification-tools tidak ditemukan di DOM.');
      return;
    }

    const isSubscribed = await isCurrentPushSubscriptionAvailable();

    if (isSubscribed) {
      pushNotificationTools.innerHTML = generateUnsubscribeButtonTemplate();
      document.getElementById('unsubscribe-button')?.addEventListener('click', async () => {
        const success = await unsubscribe();
        if (success) { 
          this.#setupPushNotification(); 
        }
      });
    } else {
      pushNotificationTools.innerHTML = generateSubscribeButtonTemplate();

      document.getElementById('subscribe-button')?.addEventListener('click', async () => {
        const success = await subscribe();
        if (success) { 
          this.#setupPushNotification();
        }
      });
    }
  }

  async _renderPage() {
    const path = this._getActiveRoute();
    
    if (!document.startViewTransition) {
      await this._renderContent(path);
      if (isServiceWorkerAvailable()) {
        await this.#setupPushNotification();
      }
      return;
    }

    try {
      await document.startViewTransition(async () => {
        await this._renderContent(path);
      }).finished;
    } catch (err) {
      console.error('View transition failed:', err);

      await this._renderContent(path);
    }

    if (isServiceWorkerAvailable()) {
      this.#setupPushNotification();
    }
  }

  _getActiveRoute() {
    return window.location.hash.substring(1) || '/';
  }
}

export default App;
