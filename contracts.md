# Contratos de API - InstaClone

## Autenticação

### POST /api/auth/register
**Request:**
```json
{
  "email": "user@example.com",
  "password": "senha123",
  "username": "username",
  "fullName": "Nome Completo"
}
```
**Response:**
```json
{
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "username": "username",
    "fullName": "Nome Completo",
    "profilePicture": null,
    "bio": ""
  }
}
```

### POST /api/auth/login
**Request:**
```json
{
  "email": "user@example.com",
  "password": "senha123"
}
```
**Response:**
```json
{
  "token": "jwt_token",
  "user": { /* user object */ }
}
```

### GET /api/auth/me
**Headers:** Authorization: Bearer {token}
**Response:**
```json
{
  "user": { /* user object with followers/following counts */ }
}
```

## Usuários

### GET /api/users/search?q=username
**Headers:** Authorization: Bearer {token}
**Response:**
```json
{
  "users": [
    {
      "id": "user_id",
      "username": "username",
      "fullName": "Nome",
      "profilePicture": "url",
      "followers": 123,
      "isFollowing": false
    }
  ]
}
```

### GET /api/users/:userId
**Response:**
```json
{
  "user": { /* complete user profile */ },
  "posts": [ /* user posts */ ],
  "isFollowing": false
}
```

### PUT /api/users/profile
**Headers:** Authorization: Bearer {token}
**Request (multipart/form-data):**
```
fullName: "Novo Nome"
bio: "Nova bio"
profilePicture: File (opcional)
```

### POST /api/users/:userId/follow
**Headers:** Authorization: Bearer {token}
**Response:**
```json
{
  "message": "Following user",
  "isFollowing": true
}
```

### DELETE /api/users/:userId/follow
**Headers:** Authorization: Bearer {token}

## Posts

### GET /api/posts/feed
**Headers:** Authorization: Bearer {token}
**Query:** ?page=1&limit=10
**Response:**
```json
{
  "posts": [
    {
      "id": "post_id",
      "userId": "user_id",
      "username": "username",
      "userProfilePicture": "url",
      "imageUrl": "cloudinary_url",
      "caption": "Legenda",
      "likes": 123,
      "liked": false,
      "comments": [],
      "timestamp": "2025-01-01T00:00:00Z"
    }
  ],
  "hasMore": true
}
```

### POST /api/posts
**Headers:** Authorization: Bearer {token}
**Request (multipart/form-data):**
```
caption: "Legenda do post"
image: File
```

### POST /api/posts/:postId/like
**Headers:** Authorization: Bearer {token}

### DELETE /api/posts/:postId/like
**Headers:** Authorization: Bearer {token}

### POST /api/posts/:postId/comments
**Headers:** Authorization: Bearer {token}
**Request:**
```json
{
  "text": "Comentário"
}
```

### DELETE /api/posts/:postId
**Headers:** Authorization: Bearer {token}

## Stories

### GET /api/stories
**Headers:** Authorization: Bearer {token}
**Response:**
```json
{
  "stories": [
    {
      "userId": "user_id",
      "username": "username",
      "profilePicture": "url",
      "stories": [
        {
          "id": "story_id",
          "imageUrl": "cloudinary_url",
          "timestamp": "2025-01-01T00:00:00Z"
        }
      ]
    }
  ]
}
```

### POST /api/stories
**Headers:** Authorization: Bearer {token}
**Request (multipart/form-data):**
```
image: File
```

## Dados Mockados no Frontend (REMOVER)

### mockData.js
- `mockUsers` - REMOVER: será substituído por chamadas à API /api/users/search
- `mockStories` - REMOVER: será substituído por chamadas à API /api/stories
- `mockPosts` - REMOVER: será substituído por chamadas à API /api/posts/feed
- `currentUser` - REMOVER: será substituído por chamadas à API /api/auth/me

## Integração Frontend-Backend

### Login.jsx
- Substituir mock login por POST /api/auth/login
- Armazenar token JWT no localStorage
- Redirecionar para feed após login bem-sucedido

### Feed.jsx
- Carregar posts: GET /api/posts/feed
- Carregar stories: GET /api/stories
- Like/unlike: POST/DELETE /api/posts/:postId/like
- Adicionar comentário: POST /api/posts/:postId/comments
- Criar post: POST /api/posts (com upload de imagem)

### Profile.jsx
- Carregar perfil: GET /api/auth/me
- Atualizar perfil: PUT /api/users/profile
- Upload de foto de perfil via Cloudinary

### Search.jsx
- Buscar usuários: GET /api/users/search?q=query
- Seguir/deixar de seguir: POST/DELETE /api/users/:userId/follow

## Cloudinary Integration

### Upload Flow
1. Frontend seleciona imagem
2. Frontend envia para backend via multipart/form-data
3. Backend faz upload para Cloudinary
4. Backend salva URL do Cloudinary no MongoDB
5. Backend retorna URL para frontend

### Configuração
```
CLOUDINARY_CLOUD_NAME=dwltt3bz6
CLOUDINARY_API_KEY=932266375633866
CLOUDINARY_API_SECRET=pJikvBmv_7-8IZJyeINwhHnmDds
```

## PWA Features

### manifest.json
- Nome: InstaClone
- Ícones para diferentes tamanhos
- Display: standalone
- Theme color: #9333ea (purple)

### Service Worker
- Cache estratégico para assets estáticos
- Funcionalidade offline básica
- Ícone para adicionar à tela inicial

## Deployment (Ubuntu Server)

### Backend
- FastAPI rodando na porta 8001
- Supervisor para gerenciar processo
- Nginx como reverse proxy

### Frontend
- Build de produção: `yarn build`
- Servir via Nginx
- Configurar CORS corretamente

### MongoDB
- Usar MongoDB Atlas ou instância local
- Configurar MONGO_URL no .env

### Variáveis de Ambiente
```
MONGO_URL=mongodb://...
DB_NAME=instaclone
JWT_SECRET=seu_secret_aqui
CLOUDINARY_CLOUD_NAME=dwltt3bz6
CLOUDINARY_API_KEY=932266375633866
CLOUDINARY_API_SECRET=pJikvBmv_7-8IZJyeINwhHnmDds
```
