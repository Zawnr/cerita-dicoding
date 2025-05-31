import { convertBase64ToUint8Array } from './index';
import { VAPID_PUBLIC_KEY } from '../config';
import { subscribePushNotification, unsubscribePushNotification } from '../data/api'; 

export function isNotificationAvailable() {
  return 'Notification' in window;
}
 
export function isNotificationGranted() {
  return Notification.permission === 'granted';
}
 
export async function requestNotificationPermission() {
  if (!isNotificationAvailable()) {
    console.error('Notification API unsupported.');
    return false;
  }
 
  if (isNotificationGranted()) {
    return true;
  }
 
  const status = await Notification.requestPermission();
 
  if (status === 'denied') {
    alert('Izin notifikasi ditolak.');
    return false;
  }
 
  if (status === 'default') {
    alert('Izin notifikasi ditutup atau diabaikan.');
    return false;
  }
 
  return true;
}
 
export async function getPushSubscription() {
  const registration = await navigator.serviceWorker.getRegistration();
  return await registration.pushManager.getSubscription();
}
 
export async function isCurrentPushSubscriptionAvailable() {
  return !!(await getPushSubscription());
}

export function generateSubscribeOptions() {
  return {
    userVisibleOnly: true,
    applicationServerKey: convertBase64ToUint8Array(VAPID_PUBLIC_KEY),
  };
}

export async function subscribe() {
  if (!(await requestNotificationPermission())) {
    return;
  }
 
  if (await isCurrentPushSubscriptionAvailable()) {
    alert('Sudah berlangganan push notification.');
    return;
  }
 
  console.log('Mulai berlangganan push notification...');

  const failureSubscribeMessage = 'Langganan push notification gagal diaktifkan.';
  const successSubscribeMessage = 'Langganan push notification berhasil diaktifkan.';
  let pushSubscription = null; 

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      console.error('Service Worker registration not found.');
      alert(failureSubscribeMessage);
      return;
    }

    pushSubscription = await registration.pushManager.subscribe(generateSubscribeOptions());

    const { endpoint, keys } = pushSubscription.toJSON();
    console.log('Push Subscription Data:', { endpoint, keys });

    // Kirim data subscribe ke server 
    const response = await subscribePushNotification({ endpoint, keys });

    if (!response.ok) {
      console.error('API Subscribe Gagal:', response);
      alert(`${failureSubscribeMessage} Server menolak langganan.`);

      await pushSubscription.unsubscribe();
      return;
    }

    alert(successSubscribeMessage);
    return true; 
  } catch (error) {
    console.error('Error saat berlangganan push notification:', error);
    alert(`${failureSubscribeMessage} Terjadi kesalahan.`);

    if (pushSubscription) {
      try {
        await pushSubscription.unsubscribe();
        console.log('Subscribe client berhasil dibatalkan setelah gagal subscribe ke server.');
      } catch (unsubscribeError) {
        console.error('Gagal membatalkan langganan client:', unsubscribeError);
      }
    }
    return false; 
  }
}

export async function unsubscribe() {
  const failureUnsubscribeMessage = 'Gagal menonaktifkan langganan notifikasi.';
  const successUnsubscribeMessage = 'Langganan notifikasi berhasil dinonaktifkan.';

  try {
    const pushSubscription = await getPushSubscription();

    if (!pushSubscription) {
      alert('Tidak bisa memutus langganan notifikasi karena Anda belum berlangganan.');
      return false;
    }

    const { endpoint } = pushSubscription.toJSON();

    // Kirim permintaan unsubscribe ke server 
    const response = await unsubscribePushNotification({ endpoint });

    if (!response.ok) {
      console.error('API Unsubscribe Gagal:', response);
      alert(`${failureUnsubscribeMessage} Server menolak pembatalan.`);
      return false;
    }

    const unsubscribed = await pushSubscription.unsubscribe();

    if (!unsubscribed) {
      alert(`${failureUnsubscribeMessage} Gagal membatalkan di sisi browser.`);
      return false;
    }

    alert(successUnsubscribeMessage);
    return true; 
  } catch (error) {
    console.error('Error saat memutus langganan push notification:', error);
    alert(`${failureUnsubscribeMessage} Terjadi kesalahan.`);
    return false;
  }
}