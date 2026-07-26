'use client';
import { useEffect } from 'react';

// Pings /api/admin/assistants/heartbeat every 30s to track online status
export default function HeartbeatPing() {
  useEffect(() => {
    const ping = () => fetch('/api/admin/assistants/heartbeat', { method: 'POST' }).catch(() => {});
    ping();
    const id = setInterval(ping, 30000);
    return () => clearInterval(id);
  }, []);
  return null;
}
