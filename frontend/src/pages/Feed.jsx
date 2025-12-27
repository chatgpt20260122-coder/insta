import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Home, Search, PlusSquare, User, X, Trash2, ChevronLeft, ChevronRight, Eye, Share2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { toast } from '../hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { postAPI, storyAPI } from '../api';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [commentText, setCommentText] = useState({});
  const [loading, setLoading] = useState(true);
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [newPostCaption, setNewPostCaption] = useState('');
  const [newPostImage, setNewPostImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [createStoryOpen, setCreateStoryOpen] = useState(false);
  const [storyImage, setStoryImage] = useState(null);
  const [uploadingStory, setUploadingStory] = useState(false);
  const [viewingStory, setViewingStory] = useState(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadFeed();
    loadStories();
  }, []);

  const loadFeed = async () => {
    try {
      const response = await postAPI.getFeed();
      setPosts(response.data.posts);
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStories = async () => {
    try {
      const response = await storyAPI.getAll();
      setStories(response.data.stories);
    } catch (error) {
      console.error('Error loading stories:', error);
    }
  };

  const handleLike = async (postId, liked) => {
    try {
      if (liked) {
        await postAPI.unlike(postId);
      } else {
        await postAPI.like(postId);
      }
      
      setPosts(prevPosts => prevPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            liked: !post.liked,
            likes: post.liked ? post.likes - 1 : post.likes + 1
          };
        }
        return post;
      }));
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao curtir post',
        variant: 'destructive'
      });
    }
  };

  const handleComment = async (postId) => {
    if (!commentText[postId] || !commentText[postId].trim()) return;

    try {
      const response = await postAPI.addComment(postId, commentText[postId]);
      
      setPosts(prevPosts => prevPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [...post.comments, response.data]
          };
        }
        return post;
      }));

      setCommentText(prev => ({ ...prev, [postId]: '' }));
      toast({
        title: 'Comentário adicionado!',
        description: 'Seu comentário foi publicado com sucesso.'
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao adicionar comentário',
        variant: 'destructive'
      });
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostImage) {
      toast({
        title: 'Erro',
        description: 'Selecione uma imagem',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('caption', newPostCaption);
      formData.append('image', newPostImage);

      const response = await postAPI.create(formData);
      setPosts([response.data, ...posts]);
      
      setCreatePostOpen(false);
      setNewPostCaption('');
      setNewPostImage(null);
      
      toast({
        title: 'Post criado!',
        description: 'Seu post foi publicado com sucesso.'
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao criar post',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCreateStory = async (e) => {
    e.preventDefault();
    if (!storyImage) {
      toast({
        title: 'Erro',
        description: 'Selecione uma imagem',
        variant: 'destructive'
      });
      return;
    }

    setUploadingStory(true);
    try {
      const formData = new FormData();
      formData.append('image', storyImage);

      await storyAPI.create(formData);
      
      setCreateStoryOpen(false);
      setStoryImage(null);
      loadStories(); // Reload stories
      
      toast({
        title: 'Story criado!',
        description: 'Seu story foi publicado com sucesso.'
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao criar story',
        variant: 'destructive'
      });
    } finally {
      setUploadingStory(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Deseja realmente excluir este post?')) return;
    
    try {
      await postAPI.delete(postId);
      setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
      
      toast({
        title: 'Post excluído!',
        description: 'Seu post foi removido com sucesso.'
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao excluir post',
        variant: 'destructive'
      });
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const postDate = new Date(timestamp);
    const diff = Math.floor((now - postDate) / 1000);

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
          <p className="text-gray-600">Carregando feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation - Mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b z-50 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
            InstaClone
          </h1>
          <div className="flex gap-4">
            <Heart 
              className="w-6 h-6 cursor-pointer hover:text-pink-600 transition-colors" 
              onClick={() => navigate('/notifications')}
            />
            <Send 
              className="w-6 h-6 cursor-pointer hover:text-blue-600 transition-colors" 
              onClick={() => navigate('/messages')}
            />
          </div>
        </div>
      </div>

      {/* Sidebar - Desktop */}
      <div className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 border-r bg-white flex-col p-6 z-50">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-10">
          InstaClone
        </h1>
        
        <nav className="flex-1 space-y-2">
          <Button variant="ghost" className="w-full justify-start text-base" onClick={() => navigate('/')}>
            <Home className="mr-3 w-6 h-6" />
            Início
          </Button>
          <Button variant="ghost" className="w-full justify-start text-base" onClick={() => navigate('/search')}>
            <Search className="mr-3 w-6 h-6" />
            Pesquisar
          </Button>
          <Dialog open={createPostOpen} onOpenChange={setCreatePostOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" className="w-full justify-start text-base">
                <PlusSquare className="mr-3 w-6 h-6" />
                Criar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar novo post</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreatePost} className="space-y-4 py-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  {newPostImage ? (
                    <div className="relative">
                      <img 
                        src={URL.createObjectURL(newPostImage)} 
                        alt="Preview" 
                        className="max-h-64 mx-auto rounded"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => setNewPostImage(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <input
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={(e) => setNewPostImage(e.target.files[0])}
                      />
                      <PlusSquare className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">Clique para selecionar foto</p>
                    </label>
                  )}
                </div>
                <Input 
                  placeholder="Escreva uma legenda..." 
                  value={newPostCaption}
                  onChange={(e) => setNewPostCaption(e.target.value)}
                />
                <Button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  disabled={!newPostImage || uploading}
                >
                  {uploading ? 'Enviando...' : 'Compartilhar'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          <Button variant="ghost" className="w-full justify-start text-base" onClick={() => navigate('/profile')}>
            <User className="mr-3 w-6 h-6" />
            Perfil
          </Button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 pt-16 lg:pt-0">
        <div className="max-w-2xl mx-auto py-6 px-4">
          {/* Stories */}
          {(stories.length > 0 || true) && (
            <div className="mb-6 bg-white border rounded-lg p-4">
              <div className="flex gap-4 overflow-x-auto pb-2">
                {/* Add Story Button */}
                <Dialog open={createStoryOpen} onOpenChange={setCreateStoryOpen}>
                  <DialogTrigger asChild>
                    <div className="flex flex-col items-center gap-1 cursor-pointer flex-shrink-0">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 via-pink-600 to-orange-600 p-0.5 flex items-center justify-center">
                        <div className="bg-white rounded-full w-full h-full flex items-center justify-center">
                          <PlusSquare className="w-6 h-6 text-purple-600" />
                        </div>
                      </div>
                      <span className="text-xs">Criar story</span>
                    </div>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Criar story</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateStory} className="space-y-4 py-4">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        {storyImage ? (
                          <div className="relative">
                            <img 
                              src={URL.createObjectURL(storyImage)} 
                              alt="Preview" 
                              className="max-h-64 mx-auto rounded"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => setStoryImage(null)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <label className="cursor-pointer block">
                            <input
                              type="file"
                              accept="image/*,video/*"
                              className="hidden"
                              onChange={(e) => setStoryImage(e.target.files[0])}
                            />
                            <PlusSquare className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm text-gray-600">Clique para selecionar foto</p>
                          </label>
                        )}
                      </div>
                      <Button 
                        type="submit"
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        disabled={!storyImage || uploadingStory}
                      >
                        {uploadingStory ? 'Enviando...' : 'Publicar story'}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>

                {stories.map((storyGroup) => (
                  <div 
                    key={storyGroup.userId} 
                    className="flex flex-col items-center gap-1 cursor-pointer flex-shrink-0"
                    onClick={() => {
                      setViewingStory(storyGroup);
                      setCurrentStoryIndex(0);
                    }}
                  >
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 via-pink-600 to-orange-600 p-0.5">
                      <div className="bg-white rounded-full p-0.5 w-full h-full">
                        <Avatar className="w-full h-full">
                          <AvatarImage src={storyGroup.profilePicture} />
                          <AvatarFallback>{storyGroup.username[0]}</AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                    <span className="text-xs max-w-[64px] truncate">{storyGroup.username}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Posts */}
          {posts.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-600 mb-4">Nenhum post ainda</p>
              <p className="text-sm text-gray-500 mb-4">Comece seguindo pessoas ou crie seu primeiro post!</p>
              <Button 
                onClick={() => navigate('/search')}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                Buscar pessoas
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <Card key={post.id} className="overflow-hidden border-0 shadow-sm">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Avatar 
                        className="w-10 h-10 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => navigate(`/user/${post.userId}`)}
                      >
                        <AvatarImage src={post.userProfilePicture} />
                        <AvatarFallback>{post.username[0]}</AvatarFallback>
                      </Avatar>
                      <p 
                        className="font-semibold text-sm cursor-pointer hover:text-gray-600 transition-colors"
                        onClick={() => navigate(`/user/${post.userId}`)}
                      >
                        {post.username}
                      </p>
                    </div>
                    {post.userId === currentUser.id ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-5 h-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => handleDeletePost(post.id)}
                            className="text-red-600 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir post
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-5 h-5" />
                      </Button>
                    )}
                  </div>

                  {/* Post Image/Video */}
                  <div className="relative aspect-square bg-gray-100">
                    {post.imageUrl.includes('.mp4') || post.imageUrl.includes('.mov') || post.imageUrl.includes('video') ? (
                      <video
                        src={post.imageUrl}
                        className="w-full h-full object-cover"
                        controls
                        loop
                        playsInline
                      />
                    ) : (
                      <img
                        src={post.imageUrl}
                        alt="Post"
                        className="w-full h-full object-cover"
                        onDoubleClick={() => handleLike(post.id, post.liked)}
                      />
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <button onClick={() => handleLike(post.id, post.liked)}>
                          <Heart
                            className={`w-6 h-6 cursor-pointer transition-all ${
                              post.liked ? 'fill-red-500 text-red-500' : 'hover:text-gray-600'
                            }`}
                          />
                        </button>
                        <MessageCircle className="w-6 h-6 cursor-pointer hover:text-gray-600" />
                        <Send className="w-6 h-6 cursor-pointer hover:text-gray-600" />
                      </div>
                      <Bookmark className="w-6 h-6 cursor-pointer hover:text-gray-600" />
                    </div>

                    <p className="font-semibold text-sm mb-2">{post.likes} curtidas</p>

                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="font-semibold mr-2">{post.username}</span>
                        {post.caption}
                      </p>

                      {post.comments.length > 0 && (
                        <div className="space-y-1">
                          {post.comments.map((comment) => (
                            <p key={comment.id} className="text-sm">
                              <span className="font-semibold mr-2">{comment.username}</span>
                              {comment.text}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 mt-2">{formatTimestamp(post.timestamp)}</p>
                  </div>

                  <div className="border-t p-4">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Adicione um comentário..."
                        value={commentText[post.id] || ''}
                        onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') handleComment(post.id);
                        }}
                        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                      <Button
                        onClick={() => handleComment(post.id)}
                        variant="ghost"
                        disabled={!commentText[post.id]}
                        className="text-blue-500 hover:text-blue-600 font-semibold"
                      >
                        Publicar
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation - Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50">
        <div className="flex justify-around py-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <Home className="w-6 h-6" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate('/search')}>
            <Search className="w-6 h-6" />
          </Button>
          <Dialog open={createPostOpen} onOpenChange={setCreatePostOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <PlusSquare className="w-6 h-6" />
              </Button>
            </DialogTrigger>
          </Dialog>
          <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>
            <User className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Story Viewer Modal */}
      {viewingStory && (
        <Dialog open={!!viewingStory} onOpenChange={() => setViewingStory(null)}>
          <DialogContent className="max-w-md p-0 bg-black border-0">
            <div className="relative aspect-[9/16] bg-black">
              {viewingStory.stories[currentStoryIndex]?.imageUrl.includes('.mp4') || 
               viewingStory.stories[currentStoryIndex]?.imageUrl.includes('.mov') ||
               viewingStory.stories[currentStoryIndex]?.imageUrl.includes('video') ? (
                <video
                  src={viewingStory.stories[currentStoryIndex]?.imageUrl}
                  className="w-full h-full object-contain"
                  autoPlay
                  loop
                  playsInline
                  controls
                />
              ) : (
                <img
                  src={viewingStory.stories[currentStoryIndex]?.imageUrl}
                  alt="Story"
                  className="w-full h-full object-contain"
                />
              )}
              
              {/* Story Header */}
              <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8 border-2 border-white">
                      <AvatarImage src={viewingStory.profilePicture} />
                      <AvatarFallback>{viewingStory.username[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-white font-semibold text-sm">{viewingStory.username}</span>
                    <span className="text-white/80 text-xs">
                      {formatTimestamp(viewingStory.stories[currentStoryIndex]?.timestamp)}
                    </span>
                  </div>
                  <button
                    onClick={() => setViewingStory(null)}
                    className="text-white hover:text-gray-300"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                {/* Progress bars */}
                <div className="flex gap-1 mt-2">
                  {viewingStory.stories.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-0.5 flex-1 rounded ${
                        idx === currentStoryIndex
                          ? 'bg-white'
                          : idx < currentStoryIndex
                          ? 'bg-white/50'
                          : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Navigation */}
              {viewingStory.stories.length > 1 && (
                <>
                  {currentStoryIndex > 0 && (
                    <button
                      onClick={() => setCurrentStoryIndex(currentStoryIndex - 1)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300"
                    >
                      <ChevronLeft className="w-8 h-8" />
                    </button>
                  )}
                  {currentStoryIndex < viewingStory.stories.length - 1 && (
                    <button
                      onClick={() => setCurrentStoryIndex(currentStoryIndex + 1)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300"
                    >
                      <ChevronRight className="w-8 h-8" />
                    </button>
                  )}
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Feed;
