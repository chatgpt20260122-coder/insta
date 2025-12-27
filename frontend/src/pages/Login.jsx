import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { toast } from '../hooks/use-toast';

const Login = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    fullName: ''
  });
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Mock login/register
    if (isLogin) {
      // Mock login check
      if (formData.email && formData.password) {
        localStorage.setItem('isAuthenticated', 'true');
        onLogin();
        toast({
          title: 'Login realizado com sucesso!',
          description: `Bem-vindo de volta!`
        });
        navigate('/');
      }
    } else {
      // Mock register
      if (formData.email && formData.password && formData.username && formData.fullName) {
        localStorage.setItem('isAuthenticated', 'true');
        onLogin();
        toast({
          title: 'Conta criada com sucesso!',
          description: `Bem-vindo, ${formData.fullName}!`
        });
        navigate('/');
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-2">
            InstaClone
          </h1>
          <p className="text-gray-600">Compartilhe seus momentos</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle>{isLogin ? 'Entrar' : 'Criar conta'}</CardTitle>
            <CardDescription>
              {isLogin ? 'Entre na sua conta' : 'Crie uma nova conta'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nome completo</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="João Silva"
                      value={formData.fullName}
                      onChange={handleChange}
                      required={!isLogin}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Nome de usuário</Label>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="joaosilva"
                      value={formData.username}
                      onChange={handleChange}
                      required={!isLogin}
                    />
                  </div>
                </>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                {isLogin ? 'Entrar' : 'Criar conta'}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-purple-600 hover:text-purple-700 transition-colors"
              >
                {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;