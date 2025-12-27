import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Heart, Settings, ArrowLeft, Camera } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { toast } from '../hooks/use-toast';
import { authAPI, userAPI, postAPI } from '../api';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState({
    fullName: '',
    bio: '',
    profilePicture: null
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await authAPI.getMe();
      setUser(response.data.user);
      setEditData({
        fullName: response.data.user.fullName,
        bio: response.data.user.bio,
        profilePicture: null
      });
      
      // Load user posts
      const feedResponse = await postAPI.getFeed();
      const myPosts = feedResponse.data.posts.filter(p => p.userId === response.data.user.id);
      setUserPosts(myPosts);
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar perfil',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const formData = new FormData();
      if (editData.fullName) formData.append('fullName', editData.fullName);
      if (editData.bio) formData.append('bio', editData.bio);
      if (editData.profilePicture) formData.append('profilePicture', editData.profilePicture);

      const response = await userAPI.updateProfile(formData);
      setUser(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      setEditOpen(false);
      toast({
        title: 'Perfil atualizado!',
        description: 'Suas alterações foram salvas.'
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar perfil',
        variant: 'destructive'
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b z-50 px-4 py-3">
        <div className="flex items-center justify-between">
          <ArrowLeft className="w-6 h-6 cursor-pointer" onClick={() => navigate('/')} />
          <span className="font-semibold text-lg">{user.username}</span>
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
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                  <AvatarImage src={user.profilePicture} />
                  <AvatarFallback className="text-3xl">{user.username[0]}</AvatarFallback>
                </Avatar>
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
                  <h2 className="text-2xl font-semibold">{user.username}</h2>
                  <div className="flex gap-2">
                    <Dialog open={editOpen} onOpenChange={setEditOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          Editar perfil
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Editar perfil</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleUpdateProfile} className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Foto de perfil</Label>
                            <div className="flex items-center gap-4">
                              <Avatar className="w-20 h-20">
                                <AvatarImage src={editData.profilePicture ? URL.createObjectURL(editData.profilePicture) : user.profilePicture} />
                                <AvatarFallback>{user.username[0]}</AvatarFallback>
                              </Avatar>
                              <label htmlFor="profilePicFile" className="cursor-pointer">
                                <input
                                  id="profilePicFile"
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => setEditData({ ...editData, profilePicture: e.target.files[0] })}
                                />
                                <span className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
                                  <Camera className="w-4 h-4 mr-2" />
                                  Alterar foto
                                </span>
                              </label>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="fullName">Nome completo</Label>
                            <Input
                              id="fullName"
                              value={editData.fullName}
                              onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                              id="bio"
                              value={editData.bio}
                              onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                              placeholder="Conte um pouco sobre você..."
                              rows={3}
                            />
                          </div>
                          <Button 
                            type="submit" 
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                            disabled={updating}
                          >
                            {updating ? 'Salvando...' : 'Salvar alterações'}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" size="sm" className="lg:hidden" onClick={handleLogout}>
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex justify-center md:justify-start gap-8 mb-6">
                  <div className="text-center">
                    <div className="font-semibold text-lg">{user.posts}</div>
                    <div className="text-gray-600 text-sm">publicações</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-lg">{user.followers}</div>
                    <div className="text-gray-600 text-sm">seguidores</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-lg">{user.following}</div>
                    <div className="text-gray-600 text-sm">seguindo</div>
                  </div>
                </div>

                <div>
                  <p className="font-semibold mb-1">{user.fullName}</p>
                  <p className="text-gray-700">{user.bio || 'Sem bio'}</p>
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
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Grid className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-600 text-lg mb-2">Nenhuma publicação ainda</p>
                  <Button onClick={() => navigate('/')} className="bg-gradient-to-r from-purple-600 to-pink-600">
                    Criar primeiro post
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
