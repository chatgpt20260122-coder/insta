import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, UserPlus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Card } from '../components/ui/card';

const Notifications = () => {
  const navigate = useNavigate();

  // Mock notifications
  const notifications = [
    {
      id: 1,
      type: 'follow',
      user: {
        username: 'usuario1',
        profilePicture: null
      },
      message: 'começou a seguir você',
      timestamp: '2h',
      read: false
    },
    {
      id: 2,
      type: 'like',
      user: {
        username: 'usuario2',
        profilePicture: null
      },
      message: 'curtiu sua foto',
      timestamp: '5h',
      read: false,
      postImage: 'https://via.placeholder.com/50'
    },
    {
      id: 3,
      type: 'comment',
      user: {
        username: 'usuario3',
        profilePicture: null
      },
      message: 'comentou: "Que foto linda!"',
      timestamp: '1d',
      read: true,
      postImage: 'https://via.placeholder.com/50'
    }
  ];

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
