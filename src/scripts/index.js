// CSS imports
import '../styles/styles.css';
import { tns } from 'tiny-slider';
import App from './pages/app';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
window.L = L; 
import Camera from './utils/camera';

document.addEventListener('DOMContentLoaded', () => {
  const app = new App({
    navigationDrawer: document.querySelector('#navigation-drawer'),
    drawerButton: document.querySelector('#drawer-button'),
    content: document.querySelector('#main-content'),
    skipLinkButton: document.getElementById('skip-link'),
  });

  window.addEventListener('hashchange', async () => {
    // Stop all active media
    Camera.stopAllStreams();
  });

  document.querySelector('.skip-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('#main-content')?.focus();
  });
});

