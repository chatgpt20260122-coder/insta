import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, UserPlus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Card } from '../components/ui/card';
import { notificationAPI } from '../api';

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await notificationAPI.getAll();
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.read) {
      try {
        await notificationAPI.markAsRead(notification.id);
        setNotifications(prevNotifs => 
          prevNotifs.map(n => 
            n.id === notification.id ? { ...n, read: true } : n
          )
        );
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    // Navigate based on type
    if (notification.type === 'follow') {
      navigate(`/user/${notification.actorId}`);
    } else if (notification.postId) {
      navigate('/');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'follow':
        return <UserPlus className="w-6 h-6 text-blue-500" />;
      case 'like':
        return <Heart className="w-6 h-6 text-red-500 fill-red-500" />;
      case 'comment':
        return <MessageCircle className="w-6 h-6 text-green-500" />;
      default:
        return null;
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'agora';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando notificações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-0 left-0 right-0 bg-white border-b z-50 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <ArrowLeft className="w-6 h-6 cursor-pointer" onClick={() => navigate(-1)} />
          <h1 className="text-xl font-semibold">Notificações</h1>
        </div>
      </div>

      <div className="pt-16 pb-20">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <Card className="bg-white divide-y">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 flex items-center gap-3 ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={notification.user.profilePicture} />
                      <AvatarFallback>{notification.user.username[0]}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                      {getIcon(notification.type)}
                    </div>
                  </div>

                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-semibold">{notification.user.username}</span>{' '}
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{notification.timestamp}</p>
                  </div>

                  {notification.postImage && (
                    <img
                      src={notification.postImage}
                      alt="Post"
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-600">
                <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Nenhuma notificação ainda</p>
              </div>
            )}
          </Card>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Você está em dia com todas as notificações
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
