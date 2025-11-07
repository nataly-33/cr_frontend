import React, { useState, useEffect } from 'react';
import { Bell, X, Check } from 'lucide-react';
import { notificationsService } from '../services/notifications.service';
import type { Notification } from '../types';

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUnreadCount();
    // Poll cada 30 segundos
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const count = await notificationsService.getUnreadCount();
      setUnreadCount(count);
      setError(null);
    } catch (error) {
      console.error('Error loading unread count:', error);
      setError('No se pudo cargar las notificaciones');
    }
  };

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const notifs = await notificationsService.getUnreadNotifications();
      setNotifications(notifs);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setError('Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleBellClick = () => {
    if (!isOpen) {
      loadNotifications();
    }
    setIsOpen(!isOpen);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationsService.markAsRead(notificationId);
      setNotifications(notifications.filter(n => n.id !== notificationId));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setError('Error al marcar como leído');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
      setError('Error al marcar todas como leído');
    }
  };

  const getColorClasses = (type: string) => {
    const colorMap: Record<string, string> = {
      'document.uploaded': 'bg-blue-50 border-blue-200',
      'clinical_record.result': 'bg-green-50 border-green-200',
      'system.alert': 'bg-red-50 border-red-200',
      'appointment.created': 'bg-yellow-50 border-yellow-200',
    };
    return colorMap[type] || 'bg-gray-50 border-gray-200';
  };

  const getColorBadge = (type: string) => {
    const badgeMap: Record<string, string> = {
      'document.uploaded': 'text-blue-600',
      'clinical_record.result': 'text-green-600',
      'system.alert': 'text-red-600',
      'appointment.created': 'text-yellow-600',
    };
    return badgeMap[type] || 'text-gray-600';
  };

  const getIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      'document.uploaded': '📄',
      'clinical_record.result': '🏥',
      'system.alert': '🔔',
      'appointment.created': '📅',
    };
    return iconMap[type] || '📬';
  };

  return (
    <div className="relative">
      <button 
        onClick={handleBellClick}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition"
        title="Notificaciones"
        aria-label="Notificaciones"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white shadow-xl rounded-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Notificaciones</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border-b border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
                <p className="mt-2">Cargando...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {unreadCount === 0 ? 'Sin notificaciones' : 'Cargando notificaciones...'}
              </div>
            ) : (
              notifications.map(notif => (
                <div 
                  key={notif.id} 
                  className={`p-4 border-b border-gray-100 hover:bg-opacity-70 transition ${getColorClasses(notif.type)}`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-start gap-2">
                        <span className={`text-lg ${getColorBadge(notif.type)}`}>
                          {getIcon(notif.type)}
                        </span>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{notif.title}</p>
                          <p className="text-sm text-gray-600 mt-1">{notif.body}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(notif.created_at).toLocaleString('es-ES')}
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="text-blue-600 hover:text-blue-700 transition flex-shrink-0"
                      title="Marcar como leído"
                      aria-label="Marcar como leído"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200 text-center">
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition"
              >
                Marcar todo como leído
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
