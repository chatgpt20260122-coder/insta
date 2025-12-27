import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, ArrowLeft, UserPlus, UserCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { toast } from '../hooks/use-toast';
import { userAPI } from '../api';

const Search = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchQuery.trim()) {
      searchUsers();
    } else {
      setUsers([]);
    }
  }, [searchQuery]);

  const searchUsers = async () => {
    setLoading(true);
    try {
      const response = await userAPI.search(searchQuery);
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId, isFollowing) => {
    try {
      if (isFollowing) {
        await userAPI.unfollow(userId);
        toast({
          title: 'Deixou de seguir',
          description: 'Você não segue mais este usuário.'
        });
      } else {
        await userAPI.follow(userId);
        toast({
          title: 'Seguindo!',
          description: 'Você começou a seguir este usuário.'
        });
      }
      
      // Update local state using functional update to avoid stale closure
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, isFollowing: !isFollowing } : user
        )
      );
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao seguir/deixar de seguir',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b z-50 px-4 py-3">
        <div className="flex items-center gap-3">
          <ArrowLeft className="w-6 h-6 cursor-pointer" onClick={() => navigate('/')} />
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Pesquisar"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Sidebar - Desktop */}
      <div className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 border-r bg-white flex-col p-6 z-50">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-10 cursor-pointer" onClick={() => navigate('/')}>
          InstaClone
        </h1>
        
        <nav className="flex-1 space-y-2">
          <Button variant="ghost" className="w-full justify-start text-base" onClick={() => navigate('/')}>
            Voltar ao Feed
          </Button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 pt-16 lg:pt-8">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {/* Desktop Search */}
          <div className="hidden lg:block mb-6">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Pesquisar usuários..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>
          </div>

          {/* Search Results */}
          {searchQuery ? (
            <Card className="bg-white divide-y">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <div key={user.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div 
                        className="flex items-center gap-3 cursor-pointer flex-1"
                        onClick={() => navigate(`/user/${user.id}`)}
                      >
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={user.profilePicture} />
                          <AvatarFallback>{user.username[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm hover:text-gray-600">{user.username}</p>
                          <p className="text-gray-600 text-sm">{user.fullName}</p>
                          <p className="text-gray-500 text-xs">{user.followers} seguidores</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleFollow(user.id, user.isFollowing)}
                        size="sm"
                        variant={user.isFollowing ? 'outline' : 'default'}
                        className={user.isFollowing ? '' : 'bg-blue-500 hover:bg-blue-600'}
                      >
                        {user.isFollowing ? (
                          <>
                            <UserCheck className="w-4 h-4 mr-1" />
                            Seguindo
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4 mr-1" />
                            Seguir
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-600">
                  <SearchIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Nenhum resultado encontrado</p>
                </div>
              )}
            </Card>
          ) : (
            <div className="text-center py-16">
              <SearchIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600 text-lg">Busque por usuários</p>
              <p className="text-gray-500 text-sm">Digite um nome ou nome de usuário</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
