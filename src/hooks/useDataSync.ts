import { useEffect } from 'react';
import { apiCache } from '../utils/apiCache';
import { useToast } from '../contexts/ToastContext';
import { ENV } from '../configurations/env';

export function useDataSync() {
  const { showToast } = useToast();

  useEffect(() => {
    // SSE Endpoint in API Gateway
    const eventSource = new EventSource(`${ENV.API_BASE_URL}/api/v1/events/data-changes`);

    eventSource.onopen = () => {
      console.log('[SSE] Connected to real-time data sync');
    };

    eventSource.addEventListener('data-changed', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[SSE] Data change received:', data);

        // Clear all frontend in-memory cache to ensure fresh data
        apiCache.clearAll();

        // Prevent interrupting the Admin's workflow with forced reloads.
        // Admins already see their own changes immediately.
        if (window.location.pathname.startsWith('/admin')) {
          // Silently invalidate for admin, dispatch event to trigger re-renders
          showToast('Dữ liệu đã được cập nhật từ hệ thống.', 'info');
          window.dispatchEvent(new Event('admin-data-changed'));
          return;
        }

        // Optional: show a quick toast to the user
        showToast('Dữ liệu hệ thống đã được cập nhật. Đang tải lại...', 'info');

        // Delay slightly so the user sees the toast, then dispatch event
        setTimeout(() => {
          window.dispatchEvent(new Event('public-data-changed'));
        }, 1500);

      } catch (error) {
        console.error('[SSE] Failed to parse event data:', error);
      }
    });

    eventSource.onerror = (error) => {
      console.error('[SSE] Connection error:', error);
      // EventSource will automatically attempt to reconnect
    };

    return () => {
      console.log('[SSE] Disconnecting...');
      eventSource.close();
    };
  }, [showToast]);
}
