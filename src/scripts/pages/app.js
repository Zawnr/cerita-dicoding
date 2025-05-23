import routes from '../routes/routes';
import { getActiveRoute, navigateTo } from '../routes/url-parser';
import { updateNavbar } from '../utils/navbar-handler';
import { checkAuthAccess } from '../utils/auth';

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

  async _renderPage() {
    const path = this._getActiveRoute();
    
    if (!document.startViewTransition) {
      return this._renderContent(path);
    }

    try {
      await document.startViewTransition(async () => {
        await this._renderContent(path);
      }).finished;
    } catch (err) {
      console.error('View transition failed:', err);

      await this._renderContent(path);
    }
  }

  _getActiveRoute() {
    return window.location.hash.substring(1) || '/';
  }
}

export default App;
