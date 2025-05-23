import { getAccessToken, removeAccessToken } from './auth';
import { generateNavbarTemplate } from '../templates';

export function updateNavbar() {
  const isAuthenticated = !!getAccessToken();
  const navContainer = document.querySelector('#navigation-drawer');
  
  if (navContainer) {
    navContainer.innerHTML = generateNavbarTemplate(isAuthenticated);
    bindNavbarEvents();
  }
}

function bindNavbarEvents() {
  const logoutLink = document.querySelector('#logout-link');
  if (logoutLink) {
    logoutLink.addEventListener('click', (e) => {
      e.preventDefault();
      removeAccessToken();
      updateNavbar();
      window.location.hash = '/login';
    });
  }
}