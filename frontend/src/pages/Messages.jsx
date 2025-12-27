import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send as SendIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { toast } from '../hooks/use-toast';
import { messageAPI } from '../api';

const Messages = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadConversations();
    if (userId) {
      loadMessages(userId);
    }
  }, [userId]);

  const loadConversations = async () => {
    try {
      const response = await messageAPI.getConversations();
      setConversations(response.data.conversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (otherUserId) => {
    try {
      const response = await messageAPI.getMessages(otherUserId);
      setMessages(response.data.messages);
      
      // Find conversation
      const conv = conversations.find(c => c.userId === otherUserId);
      setSelectedConversation(conv || { userId: otherUserId });
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !userId) return;

    try {
      const response = await messageAPI.sendMessage(userId, newMessage);
      setMessages([...messages, response.data]);
      setNewMessage('');
      
      // Scroll to bottom
      setTimeout(() => {
        const container = document.getElementById('messages-container');
        if (container) container.scrollTop = container.scrollHeight;
      }, 100);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao enviar mensagem',
        variant: 'destructive'
      });
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

  if (loading && !userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando mensagens...</p>
        </div>
      </div>
    );
  }

  // Conversation view
  if (userId && selectedConversation) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="fixed top-0 left-0 right-0 bg-white border-b z-50 px-4 py-3">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <ArrowLeft className="w-6 h-6 cursor-pointer" onClick={() => navigate('/messages')} />
            <Avatar className="w-10 h-10">
              <AvatarImage src={selectedConversation.profilePicture} />
              <AvatarFallback>{selectedConversation.username?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold">{selectedConversation.username}</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div 
          id="messages-container"
          className="flex-1 overflow-y-auto pt-16 pb-20 px-4"
        >
          <div className="max-w-2xl mx-auto space-y-4 py-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    msg.senderId === currentUser.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  <p className="text-sm break-words">{msg.text}</p>
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <div className="text-center py-16 text-gray-500">
                <p>Nenhuma mensagem ainda</p>
                <p className="text-sm mt-2">Envie a primeira mensagem!</p>
              </div>
            )}
          </div>
        </div>

        {/* Input */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-3">
          <form onSubmit={handleSendMessage} className="max-w-2xl mx-auto flex items-center gap-2">
            <Input
              placeholder="Mensagem..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1"
            />
            <Button 
              type="submit" 
              size="icon"
              disabled={!newMessage.trim()}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <SendIcon className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // Conversations list
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-0 left-0 right-0 bg-white border-b z-50 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <ArrowLeft className="w-6 h-6 cursor-pointer" onClick={() => navigate('/')} />
          <h1 className="text-xl font-semibold">{currentUser.username}</h1>
        </div>
      </div>

      <div className="pt-16 pb-20">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <Card className="bg-white divide-y">
            {conversations.length > 0 ? (
              conversations.map((conv) => (
                <div
                  key={conv.userId}
                  className="p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => navigate(`/messages/${conv.userId}`)}
                >
                  <Avatar className="w-14 h-14">
                    <AvatarImage src={conv.profilePicture} />
                    <AvatarFallback>{conv.username[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{conv.username}</p>
                    <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{formatTimestamp(conv.timestamp)}</p>
                    {conv.unread && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 ml-auto"></div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-600">
                <SendIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Nenhuma mensagem ainda</p>
                <p className="text-sm mt-2">Comece uma conversa!</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Messages;
