import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Grid, Heart, ArrowLeft, UserPlus, UserCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from '../hooks/use-toast';
import { userAPI, postAPI } from '../api';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      // Get all posts and filter by userId
      const feedResponse = await postAPI.getFeed();
      const posts = feedResponse.data.posts.filter(p => p.userId === userId);
      setUserPosts(posts);
      
      // Get user info from posts or search
      if (posts.length > 0) {
        const post = posts[0];
        setUser({
          id: userId,
          username: post.username,
          fullName: post.username,
          profilePicture: post.userProfilePicture,
          bio: '',
          posts: posts.length,
          followers: 0,
          following: 0
        });
      } else {
        // Try to search for user
        const searchResponse = await userAPI.search('');
        const foundUser = searchResponse.data.users.find(u => u.id === userId);
        if (foundUser) {
          setUser({
            ...foundUser,
            posts: 0
          });
          setFollowing(foundUser.isFollowing);
        }
      }
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

  const handleFollow = async () => {
    try {
      if (following) {
        await userAPI.unfollow(userId);
        toast({
          title: 'Deixou de seguir',
          description: `Você não segue mais @${user.username}`
        });
      } else {
        await userAPI.follow(userId);
        toast({
          title: 'Seguindo!',
          description: `Você começou a seguir @${user.username}`
        });
      }
      setFollowing(!following);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao seguir/deixar de seguir',
        variant: 'destructive'
      });
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Usuário não encontrado</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Voltar ao feed
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b z-50 px-4 py-3">
        <div className="flex items-center justify-between">
          <ArrowLeft className="w-6 h-6 cursor-pointer" onClick={() => navigate(-1)} />
          <span className="font-semibold text-lg">{user.username}</span>
          <div className="w-6"></div>
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
      <div className="lg:ml-64 pt-16 lg:pt-0">
        <div className="max-w-4xl mx-auto py-8 px-4">
          {/* Profile Header */}
          <div className="bg-white rounded-lg p-8 mb-6 shadow-sm">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                <AvatarImage src={user.profilePicture} />
                <AvatarFallback className="text-3xl">{user.username[0]}</AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
                  <h2 className="text-2xl font-semibold">{user.username}</h2>
                  <Button
                    onClick={handleFollow}
                    size="sm"
                    variant={following ? 'outline' : 'default'}
                    className={following ? '' : 'bg-blue-500 hover:bg-blue-600'}
                  >
                    {following ? (
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
                  {user.bio && <p className="text-gray-700">{user.bio}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Posts Grid */}
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
                  <p className="text-gray-600 text-lg">Nenhuma publicação ainda</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
