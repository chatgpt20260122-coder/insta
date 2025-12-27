import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card } from '../components/ui/card';
import { toast } from '../hooks/use-toast';
import { userAPI } from '../api';

const Followers = () => {
  const navigate = useNavigate();
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadFollowers();
  }, []);

  const loadFollowers = async () => {
    try {
      // Buscar todos os usuários e filtrar
      const response = await userAPI.search('');
      const allUsers = response.data.users;
      
      // Simular seguidores/seguindo baseado no isFollowing
      setFollowing(allUsers.filter(u => u.isFollowing));
      
      // Para seguidores, seria necessário uma API específica
      // Por ora, vamos deixar vazio
      setFollowers([]);
    } catch (error) {
      console.error('Error loading followers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      await userAPI.unfollow(userId);
      setFollowing(prev => prev.filter(u => u.id !== userId));
      toast({
        title: 'Deixou de seguir',
        description: 'Você não segue mais este usuário.'
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao deixar de seguir',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-0 left-0 right-0 bg-white border-b z-50 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <ArrowLeft className="w-6 h-6 cursor-pointer" onClick={() => navigate(-1)} />
          <h1 className="text-xl font-semibold">{currentUser.username}</h1>
        </div>
      </div>

      <div className="pt-16 pb-20">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <Tabs defaultValue="following" className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="followers">
                {followers.length} Seguidores
              </TabsTrigger>
              <TabsTrigger value="following">
                {following.length} Seguindo
              </TabsTrigger>
            </TabsList>

            <TabsContent value="followers" className="mt-4">
              <Card className="bg-white divide-y">
                {followers.length > 0 ? (
                  followers.map((user) => (
                    <div key={user.id} className="p-4 flex items-center justify-between">
                      <div 
                        className="flex items-center gap-3 flex-1 cursor-pointer"
                        onClick={() => navigate(`/user/${user.id}`)}
                      >
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={user.profilePicture} />
                          <AvatarFallback>{user.username[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm">{user.username}</p>
                          <p className="text-gray-600 text-sm">{user.fullName}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Remover
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-600">
                    <p>Nenhum seguidor ainda</p>
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="following" className="mt-4">
              <Card className="bg-white divide-y">
                {following.length > 0 ? (
                  following.map((user) => (
                    <div key={user.id} className="p-4 flex items-center justify-between">
                      <div 
                        className="flex items-center gap-3 flex-1 cursor-pointer"
                        onClick={() => navigate(`/user/${user.id}`)}
                      >
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={user.profilePicture} />
                          <AvatarFallback>{user.username[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm">{user.username}</p>
                          <p className="text-gray-600 text-sm">{user.fullName}</p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleUnfollow(user.id)}
                      >
                        <UserCheck className="w-4 h-4 mr-1" />
                        Seguindo
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-600">
                    <p>Você não segue ninguém ainda</p>
                    <Button onClick={() => navigate('/search')} className="mt-4">
                      Buscar pessoas
                    </Button>
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Followers;
