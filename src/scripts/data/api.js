import CONFIG from '../config';  
import { getAccessToken } from '../utils/auth';
  
const ENDPOINTS = {
  // auth
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
  
  // Story
  STORY_LIST: `${CONFIG.BASE_URL}/stories`,
  ADD_NEW_STORY: `${CONFIG.BASE_URL}/stories`,
  STORY_DETAIL: (id) => `${CONFIG.BASE_URL}/stories/${id}`,

  // Push Notification
  SUBSCRIBE: `${CONFIG.BASE_URL}/notifications/subscribe`,
  UNSUBSCRIBE: `${CONFIG.BASE_URL}/notifications/subscribe`,
};

export async function getRegistered({ name, email, password }) {
  const data = JSON.stringify({ name, email, password });
  try {
    const fetchResponse = await fetch(ENDPOINTS.REGISTER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: data,
    });

    let json = {};
    try {
      json = await fetchResponse.json();
    } catch (e) {
      console.error('Invalid JSON response', e);
    }

    return {
      ...json,
      ok: fetchResponse.ok,
    };
  } catch (e) {
    console.error('Network error:', e);
    return {
      ok: false,
      message: 'Terjadi masalah jaringan. Silakan coba lagi.',
    };
  }
}

export async function getLogin({ email, password }) {
  const data = JSON.stringify({ email, password });

  const fetchResponse = await fetch(ENDPOINTS.LOGIN, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: data,
  });

  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function getAllStories({ token }) {
  const response = await fetch(ENDPOINTS.STORY_LIST, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();
  return {
    ok: response.ok,
    message: data.message,
    listStory: data.listStory || []
  };
}

export async function addNewStory(payload) {
  const token = getAccessToken();
  if (!token) throw new Error('Token tidak ditemukan');

  try {
    const response = await fetch(`${CONFIG.BASE_URL}/stories`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: payload
    });

    // Debug response
    console.log('[API] Response status:', response.status);
    const responseText = await response.text();
    console.log('[API] Response text:', responseText);

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        errorData = { message: responseText };
      }
      throw new Error(errorData.message || 'Gagal menambahkan cerita');
    }

    return JSON.parse(responseText);
  } catch (error) {
    console.error('[API] Error adding story:', error);
    
    // Enhance error message for network errors
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Gagal terhubung ke server');
    }
    
    throw error;
  }
}

export async function getStoryById(id, token) {
  try {
    const url = ENDPOINTS.STORY_DETAIL(id);
    console.log('Fetching from:', url); // Debug URL
    
    const response = await fetch(url, {  // Gunakan url yang sudah dibentuk
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // Handle response HTML (404 page)
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Invalid response: ${text.substring(0, 100)}...`);
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch story');
    }

    const data = await response.json();
    return {
      ok: true,
      story: data.story,
      message: data.message || 'Success'
    };
    
  } catch (error) {
    console.error('API Error:', error.message);
    return {
      ok: false,
      message: error.message,
      story: null
    };
  }
}

export async function subscribePushNotification({ endpoint, keys: { p256dh, auth } }) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error('Access token not found. Please log in first.');
  }

  const data = JSON.stringify({
    endpoint,
    keys: { p256dh, auth },
  });

  try {
    const fetchResponse = await fetch(ENDPOINTS.SUBSCRIBE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: data,
    });
    
    // Pastikan respons adalah JSON atau tangani jika tidak
    let json = {};
    try {
      json = await fetchResponse.json();
    } catch (e) {
      console.warn('Response is not JSON or empty:', fetchResponse.status, e);
      if (fetchResponse.ok) {
        json = { message: 'Success (no JSON response)', error: false };
      } else {
        json = { message: `Server error: ${fetchResponse.statusText}`, error: true };
      }
    }

    return {
      ...json,
      ok: fetchResponse.ok,
    };
  } catch (error) {
    console.error('subscribePushNotification network error:', error);
    return {
      ok: false,
      message: 'Network error: Failed to connect to push notification server.',
      error: true,
    };
  }
}

export async function unsubscribePushNotification({ endpoint }) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error('Access token not found. Please log in first.');
  }

  const data = JSON.stringify({ endpoint });

  try {
    const fetchResponse = await fetch(ENDPOINTS.UNSUBSCRIBE, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: data,
    });


    let json = {};
    try {
      json = await fetchResponse.json();
    } catch (e) {
      console.warn('Response is not JSON or empty:', fetchResponse.status, e);
      if (fetchResponse.ok) {
        json = { message: 'Success (no JSON response)', error: false };
      } else {
        json = { message: `Server error: ${fetchResponse.statusText}`, error: true };
      }
    }

    return {
      ...json,
      ok: fetchResponse.ok,
    };
  } catch (error) {
    console.error('unsubscribePushNotification network error:', error);
    return {
      ok: false,
      message: 'Network error: Failed to connect to push notification server.',
      error: true,
    };
  }
}

export {
  ENDPOINTS
};