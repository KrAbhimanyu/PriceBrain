'use client';

import { useState, useEffect, useCallback } from 'react';

interface PushNotificationState {
  supported: boolean;
  permission: NotificationPermission;
  subscribed: boolean;
  loading: boolean;
}

export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>({
    supported: false,
    permission: 'default',
    subscribed: false,
    loading: true,
  });

  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    const permission = supported ? Notification.permission : 'denied';
    setState(prev => ({
      ...prev,
      supported,
      permission,
      loading: false,
    }));
  }, []);

  useEffect(() => {
    if (!state.supported) return;

    async function checkSubscription() {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setState(prev => ({ ...prev, subscribed: !!subscription }));
      } catch (error) {
        console.error('Error checking push subscription:', error);
      }
    }

    checkSubscription();
  }, [state.supported]);

  const getVapidKey = useCallback(async (): Promise<string | null> => {
    try {
      const response = await fetch('/api/notifications/push/vapid-public-key');
      if (!response.ok) return null;
      const data = await response.json();
      return data.publicKey || null;
    } catch {
      return null;
    }
  }, []);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!state.supported || state.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setState(prev => ({ ...prev, permission }));
        return false;
      }
      setState(prev => ({ ...prev, permission: 'granted' }));
    }

    try {
      const publicKey = await getVapidKey();
      if (!publicKey) {
        console.error('No VAPID public key available');
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      const applicationServerKey = urlBase64ToUint8Array(publicKey);

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as BufferSource,
      });

      const response = await fetch('/api/notifications/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + (typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : ''),
        },
        body: JSON.stringify({ subscription }),
      });

      if (response.ok) {
        setState(prev => ({ ...prev, subscribed: true }));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error subscribing to push:', error);
      return false;
    }
  }, [state.supported, state.permission, getVapidKey]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await fetch('/api/notifications/push/unsubscribe', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + (typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : ''),
          },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });

        await subscription.unsubscribe();
        setState(prev => ({ ...prev, subscribed: false }));
      }
      
      return true;
    } catch (error) {
      console.error('Error unsubscribing from push:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(error => {
        console.error('Service worker registration failed:', error);
      });
    }
  }, []);

  return {
    ...state,
    subscribe,
    unsubscribe,
  };
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
