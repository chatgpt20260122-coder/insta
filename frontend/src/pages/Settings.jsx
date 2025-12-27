import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, Lock, User as UserIcon, LogOut, Bell } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import { Separator } from '../components/ui/separator';
import { toast } from '../hooks/use-toast';

const Settings = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.clear();
    toast({
      title: 'Logout realizado',
      description: 'Você foi desconectado com sucesso.'
    });
    navigate('/login');
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Erro',
        description: 'As senhas não coincidem',
        variant: 'destructive'
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: 'Erro',
        description: 'A senha deve ter no mínimo 6 caracteres',
        variant: 'destructive'
      });
      return;
    }

    // Aqui você adicionaria a chamada à API para alterar senha
    toast({
      title: 'Senha alterada!',
      description: 'Sua senha foi atualizada com sucesso.'
    });
    
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b z-50 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ArrowLeft className="w-6 h-6 cursor-pointer" onClick={() => navigate('/')} />
            <h1 className="text-xl font-semibold">Configurações</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-16 pb-20">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          
          {/* Conta */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                Conta
              </CardTitle>
              <CardDescription>
                Informações da sua conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm text-gray-600">Nome de usuário</Label>
                <p className="font-semibold">@{user.username}</p>
              </div>
              <Separator />
              <div>
                <Label className="text-sm text-gray-600">Email</Label>
                <p className="font-semibold">{user.email}</p>
              </div>
              <Separator />
              <div>
                <Label className="text-sm text-gray-600">Nome completo</Label>
                <p className="font-semibold">{user.fullName}</p>
              </div>
            </CardContent>
          </Card>

          {/* Aparência */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                Aparência
              </CardTitle>
              <CardDescription>
                Personalize a aparência do app
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="dark-mode">Modo escuro</Label>
                  <p className="text-sm text-gray-500">Ative o tema escuro</p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notificações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notificações
              </CardTitle>
              <CardDescription>
                Gerencie suas notificações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications">Notificações push</Label>
                  <p className="text-sm text-gray-500">Receba notificações de curtidas e comentários</p>
                </div>
                <Switch
                  id="notifications"
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
            </CardContent>
          </Card>

          {/* Alterar Senha */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Alterar senha
              </CardTitle>
              <CardDescription>
                Atualize sua senha de acesso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Senha atual</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="Digite sua senha atual"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nova senha</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Digite sua nova senha"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirme sua nova senha"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
                  Alterar senha
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Sair */}
          <Card>
            <CardContent className="pt-6">
              <Button 
                onClick={handleLogout}
                variant="destructive"
                className="w-full"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair da conta
              </Button>
            </CardContent>
          </Card>

          {/* Versão */}
          <div className="text-center text-sm text-gray-500 py-4">
            <p>InstaClone v1.0.0</p>
            <p className="text-xs mt-1">Made with Emergent</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
