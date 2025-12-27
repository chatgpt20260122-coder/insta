import React, { useState } from 'react';
import { mockPosts, mockStories, currentUser } from '../mockData';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Home, Search, PlusSquare, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { toast } from '../hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const Feed = () => {
  const [posts, setPosts] = useState(mockPosts);
  const [commentText, setCommentText] = useState({});
  const [selectedStory, setSelectedStory] = useState(null);
  const navigate = useNavigate();

  const handleLike = (postId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          liked: !post.liked,
          likes: post.liked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  const handleComment = (postId) => {
    if (!commentText[postId] || !commentText[postId].trim()) return;

    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [
            ...post.comments,
            {
              id: `c${Date.now()}`,
              userId: currentUser.id,
              username: currentUser.username,
              text: commentText[postId],
              timestamp: new Date()
            }
          ]
        };
      }
      return post;
    }));

    setCommentText({ ...commentText, [postId]: '' });
    toast({
      title: 'Comentário adicionado!',
      description: 'Seu comentário foi publicado com sucesso.'
    });
  };

  const handleSave = (postId) => {
    toast({
      title: 'Post salvo!',
      description: 'Post adicionado aos salvos.'
    });
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = Math.floor((now - timestamp) / 1000);

    if (diff < 60) return 'agora';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation - Mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b z-50 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
            InstaClone
          </h1>
          <div className="flex gap-4">
            <Heart className="w-6 h-6 cursor-pointer hover:text-pink-600 transition-colors" />
            <Send className="w-6 h-6 cursor-pointer hover:text-blue-600 transition-colors" />
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
          <Dialog>
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
              <div className="space-y-4 py-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 transition-colors">
                  <PlusSquare className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">Clique para selecionar foto</p>
                </div>
                <Input placeholder="Escreva uma legenda..." />
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  Compartilhar
                </Button>
              </div>
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
          <div className="mb-6 bg-white border rounded-lg p-4">
            <div className="flex gap-4 overflow-x-auto pb-2">
              <div className="flex flex-col items-center gap-1 cursor-pointer">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 via-pink-600 to-orange-600 p-0.5">
                  <div className="bg-white rounded-full p-0.5 w-full h-full">
                    <Avatar className="w-full h-full">
                      <AvatarImage src={currentUser.profilePicture} />
                      <AvatarFallback>{currentUser.username[0]}</AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                <span className="text-xs">Seu story</span>
              </div>

              {mockStories.map((story) => (
                <Dialog key={story.id}>
                  <DialogTrigger asChild>
                    <div className="flex flex-col items-center gap-1 cursor-pointer flex-shrink-0">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 via-pink-600 to-orange-600 p-0.5">
                        <div className="bg-white rounded-full p-0.5 w-full h-full">
                          <Avatar className="w-full h-full">
                            <AvatarImage src={story.profilePicture} />
                            <AvatarFallback>{story.username[0]}</AvatarFallback>
                          </Avatar>
                        </div>
                      </div>
                      <span className="text-xs max-w-[64px] truncate">{story.username}</span>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-md p-0 bg-black">
                    <div className="relative aspect-[9/16]">
                      <img
                        src={story.stories[0].imageUrl}
                        alt="Story"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 left-4 flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={story.profilePicture} />
                          <AvatarFallback>{story.username[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-white font-semibold">{story.username}</span>
                        <span className="text-white text-sm">{formatTimestamp(story.stories[0].timestamp)}</span>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </div>

          {/* Posts */}
          <div className="space-y-6">
            {posts.map((post) => (
              <Card key={post.id} className="overflow-hidden border-0 shadow-sm">
                {/* Post Header */}
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 cursor-pointer" onClick={() => navigate('/profile')}>
                      <AvatarImage src={post.userProfilePicture} />
                      <AvatarFallback>{post.username[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm cursor-pointer hover:text-gray-600" onClick={() => navigate('/profile')}>
                        {post.username}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-5 h-5" />
                  </Button>
                </div>

                {/* Post Image */}
                <div className="relative aspect-square bg-gray-100">
                  <img
                    src={post.imageUrl}
                    alt="Post"
                    className="w-full h-full object-cover"
                    onDoubleClick={() => handleLike(post.id)}
                  />
                </div>

                {/* Post Actions */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <button onClick={() => handleLike(post.id)} className="transition-transform hover:scale-110">
                        <Heart
                          className={`w-6 h-6 cursor-pointer transition-colors ${
                            post.liked ? 'fill-red-500 text-red-500' : 'hover:text-gray-600'
                          }`}
                        />
                      </button>
                      <MessageCircle className="w-6 h-6 cursor-pointer hover:text-gray-600 transition-transform hover:scale-110" />
                      <Send className="w-6 h-6 cursor-pointer hover:text-gray-600 transition-transform hover:scale-110" />
                    </div>
                    <button onClick={() => handleSave(post.id)} className="transition-transform hover:scale-110">
                      <Bookmark className="w-6 h-6 cursor-pointer hover:text-gray-600" />
                    </button>
                  </div>

                  <p className="font-semibold text-sm mb-2">{post.likes} curtidas</p>

                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="font-semibold mr-2">{post.username}</span>
                      {post.caption}
                    </p>

                    {post.comments.length > 0 && (
                      <div className="space-y-1">
                        {post.comments.slice(0, 2).map((comment) => (
                          <p key={comment.id} className="text-sm">
                            <span className="font-semibold mr-2">{comment.username}</span>
                            {comment.text}
                          </p>
                        ))}
                        {post.comments.length > 2 && (
                          <button className="text-sm text-gray-500 hover:text-gray-700">
                            Ver todos os {post.comments.length} comentários
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 mt-2">{formatTimestamp(post.timestamp)}</p>
                </div>

                {/* Comment Input */}
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
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <PlusSquare className="w-6 h-6" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar novo post</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 transition-colors">
                  <PlusSquare className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">Clique para selecionar foto</p>
                </div>
                <Input placeholder="Escreva uma legenda..." />
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  Compartilhar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>
            <User className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Feed;