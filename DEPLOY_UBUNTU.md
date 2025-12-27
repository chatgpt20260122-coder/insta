# Guia de Deploy - InstaClone no Ubuntu

## 📋 Requisitos do Servidor Ubuntu

- Ubuntu 20.04 ou superior
- Node.js 18+ e npm/yarn
- Python 3.8+
- MongoDB (local ou Atlas)
- Nginx
- Supervisor (opcional, para gerenciar processos)

---

## 🚀 Passo a Passo de Instalação

### 1. Instalar Dependências do Sistema

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar Yarn
npm install -g yarn

# Instalar Python 3 e pip
sudo apt install -y python3 python3-pip python3-venv

# Instalar MongoDB (opcional - se não usar Atlas)
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Instalar Nginx
sudo apt install -y nginx

# Instalar Supervisor
sudo apt install -y supervisor
```

### 2. Clonar/Copiar o Projeto

```bash
# Criar diretório para a aplicação
sudo mkdir -p /var/www/instaclone
sudo chown -R $USER:$USER /var/www/instaclone

# Copiar os arquivos do projeto para /var/www/instaclone
# Você pode usar git clone, scp, rsync, etc.
```

### 3. Configurar Backend

```bash
cd /var/www/instaclone/backend

# Criar ambiente virtual Python
python3 -m venv venv
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Criar arquivo .env
cat > .env << EOF
MONGO_URL="mongodb://localhost:27017"
DB_NAME="instaclone"
JWT_SECRET="seu-secret-super-seguro-aqui-$(openssl rand -hex 32)"
CLOUDINARY_CLOUD_NAME="dwltt3bz6"
CLOUDINARY_API_KEY="932266375633866"
CLOUDINARY_API_SECRET="pJikvBmv_7-8IZJyeINwhHnmDds"
EOF

# Testar se o backend inicia
python -m uvicorn server:app --host 0.0.0.0 --port 8001
# Se funcionar, pare com Ctrl+C
```

### 4. Configurar Frontend

```bash
cd /var/www/instaclone/frontend

# Instalar dependências
yarn install

# Criar arquivo .env para produção
cat > .env << EOF
REACT_APP_BACKEND_URL=http://SEU_DOMINIO_OU_IP
EOF

# Fazer build de produção
yarn build
```

### 5. Configurar Supervisor (Backend)

```bash
# Criar arquivo de configuração do supervisor
sudo nano /etc/supervisor/conf.d/instaclone-backend.conf
```

Adicionar:

```ini
[program:instaclone-backend]
directory=/var/www/instaclone/backend
command=/var/www/instaclone/backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001
user=seu-usuario
autostart=true
autorestart=true
stderr_logfile=/var/log/instaclone-backend.err.log
stdout_logfile=/var/log/instaclone-backend.out.log
environment=PATH="/var/www/instaclone/backend/venv/bin"
```

```bash
# Recarregar supervisor
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start instaclone-backend

# Verificar status
sudo supervisorctl status instaclone-backend
```

### 6. Configurar Nginx

```bash
# Criar arquivo de configuração do Nginx
sudo nano /etc/nginx/sites-available/instaclone
```

Adicionar:

```nginx
server {
    listen 80;
    server_name SEU_DOMINIO_OU_IP;

    # Frontend (React build)
    location / {
        root /var/www/instaclone/frontend/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Aumentar timeout para uploads
        client_max_body_size 50M;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
```

```bash
# Ativar o site
sudo ln -s /etc/nginx/sites-available/instaclone /etc/nginx/sites-enabled/

# Remover site padrão (opcional)
sudo rm /etc/nginx/sites-enabled/default

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### 7. Configurar Firewall

```bash
# Permitir HTTP e HTTPS
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

### 8. Configurar SSL (Opcional mas Recomendado)

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obter certificado SSL
sudo certbot --nginx -d SEU_DOMINIO

# Certbot irá configurar automaticamente o Nginx para HTTPS
# Os certificados serão renovados automaticamente
```

---

## 🔧 Comandos Úteis

### Backend

```bash
# Ver logs do backend
sudo tail -f /var/log/instaclone-backend.out.log
sudo tail -f /var/log/instaclone-backend.err.log

# Reiniciar backend
sudo supervisorctl restart instaclone-backend

# Parar backend
sudo supervisorctl stop instaclone-backend
```

### Frontend

```bash
# Rebuild do frontend após mudanças
cd /var/www/instaclone/frontend
yarn build

# Limpar cache
rm -rf node_modules/.cache
```

### Nginx

```bash
# Reiniciar Nginx
sudo systemctl restart nginx

# Ver logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### MongoDB

```bash
# Acessar MongoDB
mongosh

# Backup do banco
mongodump --db instaclone --out /backup/instaclone-$(date +%Y%m%d)

# Restaurar backup
mongorestore --db instaclone /backup/instaclone-20250101/instaclone
```

---

## 📱 PWA - Funcionamento como App no Celular

O InstaClone já está configurado como PWA (Progressive Web App). Para instalar no celular:

### Android (Chrome/Edge):
1. Acesse o site no navegador
2. Toque no menu (três pontos)
3. Selecione "Adicionar à tela inicial"
4. O app será instalado como um aplicativo nativo

### iOS (Safari):
1. Acesse o site no Safari
2. Toque no ícone de compartilhar
3. Selecione "Adicionar à Tela de Início"
4. O app será instalado

**Recursos PWA incluídos:**
- ✅ Funciona offline (cache básico)
- ✅ Ícone na tela inicial
- ✅ Tela cheia (sem barra de navegador)
- ✅ Service Worker configurado
- ✅ Manifest.json completo

---

## 🔒 Segurança

### Recomendações importantes:

1. **Alterar JWT_SECRET**: Gere uma chave única e segura
   ```bash
   openssl rand -hex 32
   ```

2. **HTTPS**: Sempre use SSL em produção (configurado no passo 8)

3. **Firewall**: Configure UFW para permitir apenas portas necessárias

4. **MongoDB**: Se usar Atlas, configure whitelist de IPs

5. **Backup**: Configure backup automático do MongoDB

6. **Atualizar .env frontend**: Mude `REACT_APP_BACKEND_URL` para seu domínio real

---

## 🐛 Troubleshooting

### Backend não inicia
```bash
# Verificar logs
sudo tail -n 100 /var/log/instaclone-backend.err.log

# Verificar se a porta 8001 está disponível
sudo netstat -tulpn | grep 8001

# Testar manualmente
cd /var/www/instaclone/backend
source venv/bin/activate
python -m uvicorn server:app --host 0.0.0.0 --port 8001
```

### Frontend mostra erro 404 na API
```bash
# Verificar se backend está rodando
curl http://localhost:8001/api/auth/me

# Verificar configuração Nginx
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### Upload de imagens falha
```bash
# Verificar credenciais Cloudinary no .env
# Verificar logs do backend
# Aumentar client_max_body_size no Nginx (já configurado para 50M)
```

---

## 📊 Monitoramento

### Verificar status dos serviços
```bash
# Backend
sudo supervisorctl status

# Nginx
sudo systemctl status nginx

# MongoDB
sudo systemctl status mongod

# Ver uso de recursos
htop
df -h
```

---

## 🎉 Pronto!

Após seguir todos os passos, seu InstaClone estará rodando em:
- **Frontend**: http://SEU_DOMINIO (ou https:// com SSL)
- **Backend API**: http://SEU_DOMINIO/api
- **PWA**: Instale na tela inicial do celular

**Sistema está 100% funcional com:**
- ✅ Autenticação JWT
- ✅ Upload real de imagens (Cloudinary)
- ✅ MongoDB integrado
- ✅ Sistema de posts, curtidas e comentários
- ✅ Stories com expiração de 24h
- ✅ Sistema de seguir/deixar de seguir
- ✅ Busca de usuários
- ✅ PWA configurado
- ✅ Responsivo (mobile + desktop)

Boa sorte com seu InstaClone! 🚀
