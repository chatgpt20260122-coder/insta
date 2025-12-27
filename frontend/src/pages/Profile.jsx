import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { currentUser, mockPosts } from '../mockData';
import { Grid, Heart, MessageCircle, Settings, ArrowLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card } from '../components/ui/card';

const Profile = () => {
  const navigate = useNavigate();
  const userPosts = mockPosts.filter(post => post.username === currentUser.username);
  const [following, setFollowing] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b z-50 px-4 py-3">
        <div className="flex items-center justify-between">
          <ArrowLeft className="w-6 h-6 cursor-pointer" onClick={() => navigate('/')} />
          <span className="font-semibold text-lg">{currentUser.username}</span>
          <Settings className="w-6 h-6 cursor-pointer" onClick={handleLogout} />
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
          <Button variant="ghost" className="w-full justify-start text-base text-red-600 hover:text-red-700" onClick={handleLogout}>
            Sair
          </Button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 pt-16 lg:pt-0">
        <div className="max-w-4xl mx-auto py-8 px-4">
          {/* Profile Header */}
          <div className="bg-white rounded-lg p-8 mb-6 shadow-sm">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                <AvatarImage src={currentUser.profilePicture} />
                <AvatarFallback className="text-3xl">{currentUser.username[0]}</AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
                  <h2 className="text-2xl font-semibold">{currentUser.username}</h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="hover:bg-gray-100">
                      Editar perfil
                    </Button>
                    <Button variant="outline" size="sm" className="lg:hidden" onClick={handleLogout}>
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex justify-center md:justify-start gap-8 mb-6">
                  <div className="text-center">
                    <div className="font-semibold text-lg">{currentUser.posts}</div>
                    <div className="text-gray-600 text-sm">publicações</div>
                  </div>
                  <div className="text-center cursor-pointer hover:text-gray-700">
                    <div className="font-semibold text-lg">{currentUser.followers}</div>
                    <div className="text-gray-600 text-sm">seguidores</div>
                  </div>
                  <div className="text-center cursor-pointer hover:text-gray-700">
                    <div className="font-semibold text-lg">{currentUser.following}</div>
                    <div className="text-gray-600 text-sm">seguindo</div>
                  </div>
                </div>

                <div>
                  <p className="font-semibold mb-1">{currentUser.fullName}</p>
                  <p className="text-gray-700">{currentUser.bio}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Posts Tabs */}
          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="w-full justify-center border-t bg-white">
              <TabsTrigger value="posts" className="flex-1 gap-2">
                <Grid className="w-4 h-4" />
                <span className="hidden sm:inline">Publicações</span>
              </TabsTrigger>
              <TabsTrigger value="saved" className="flex-1 gap-2">
                <Heart className="w-4 h-4" />
                <span className="hidden sm:inline">Salvos</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="mt-6">
              {userPosts.length > 0 ? (
                <div className="grid grid-cols-3 gap-1 md:gap-4">
                  {userPosts.map((post) => (
                    <div
                      key={post.id}
                      className="relative aspect-square bg-gray-100 cursor-pointer group overflow-hidden rounded-sm"
                    >
                      <img
                        src={post.imageUrl}
                        alt="Post"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex gap-6 text-white">
                          <div className="flex items-center gap-2">
                            <Heart className="w-6 h-6 fill-white" />
                            <span className="font-semibold">{post.likes}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MessageCircle className="w-6 h-6 fill-white" />
                            <span className="font-semibold">{post.comments.length}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Grid className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-600 text-lg">Nenhuma publicação ainda</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="saved" className="mt-6">
              <div className="text-center py-16">
                <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600 text-lg">Nenhum post salvo</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;