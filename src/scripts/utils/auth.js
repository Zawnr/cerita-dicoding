import CONFIG from '../config';  

export function getAccessToken() {
  try {
    const accessToken = localStorage.getItem(CONFIG.ACCESS_TOKEN_KEY);
    console.log('Membaca token:', accessToken, 'Key yang digunakan:', CONFIG.ACCESS_TOKEN_KEY); // Debug
    
    if (!accessToken || accessToken === 'null' || accessToken === 'undefined') {
      return null;
    }

    return accessToken;
  } catch (error) {
    console.error('getAccessToken: error:', error);
    return null;
  }
}

export function putAccessToken(token) {
  try {
    console.log('Menyimpan token:', token); // Debug 1
    localStorage.setItem(CONFIG.ACCESS_TOKEN_KEY, token);
    console.log('Token tersimpan:', localStorage.getItem(CONFIG.ACCESS_TOKEN_KEY)); // Debug 2
    return true;
  } catch (error) {
    console.error('putAccessToken: error:', error);
    return false;
  }
}


export function removeAccessToken() {
  try {
    localStorage.removeItem(CONFIG.ACCESS_TOKEN_KEY);
    return true;
  } catch (error) {
    console.error('removeAccessToken: error:', error);
    return false;
  }
}

// Helper route guards
const unauthenticatedRoutesOnly = ['/login', '/register'];

export function checkUnauthenticatedRouteOnly(page) {
  const url = getActiveRoute();
  const isLogin = !!getAccessToken();

  if (unauthenticatedRoutesOnly.includes(url) && isLogin) {
    location.hash = '/';
    return null;
  }

  return page;
}

export function checkAuthenticatedRoute(page) {
  const isLogin = !!getAccessToken();

  if (!isLogin) {
    location.hash = '/login';
    return null;
  }

  return page;
}

export function getLogout() {
  removeAccessToken();
}

export const publicRoutes = ['/', '/login', '/register', '/about']; // Route yang boleh diakses tanpa login

export function checkAuthAccess(path) {
  const token = getAccessToken();
  // Jika sudah login, redirect dari login/register ke home
  if (token && (path === '/login' || path === '/register')) {
    return '/';
  }
  // Jika belum login dan mencoba akses restricted route
  if (!token && !publicRoutes.includes(path)) {
    return '/login';
  }
  return null; // No redirect needed
}