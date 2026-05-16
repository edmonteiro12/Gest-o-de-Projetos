# Sistema de Autenticação com Isolamento de Dados

## 📋 Descrição

Adicionei um **sistema completo de autenticação** que permite:

✅ **Login individual** - cada usuário tem suas próprias credenciais  
✅ **Isolamento de dados** - cada usuário só vê seus projetos  
✅ **Registro de novos usuários** - sem duplicatas  
✅ **Proteção contra acesso não autorizado**

---

## 📁 Arquivos Criados

### 1. **auth.js** - Sistema de Autenticação
Contém duas classes principais:

#### `AuthSystem`
- `login(username, password)` - fazer login
- `logout()` - fazer logout
- `register(username, password, email)` - registrar novo usuário
- `getCurrentUser()` - obter usuário logado
- `isLoggedIn()` - verificar se está logado
- `changePassword(username, oldPassword, newPassword)` - alterar senha

#### `ProjectManager`
- `getUserProjects()` - obter projetos do usuário
- `addProject(projectData)` - adicionar projeto
- `updateProject(projectId, projectData)` - atualizar projeto
- `deleteProject(projectId)` - deletar projeto
- `getProject(projectId)` - obter projeto específico

### 2. **login.html** - Página de Login
Interface completa com:
- 🔐 Formulário de Login
- ✍️ Formulário de Registro
- 👥 Usuários de Demonstração
- 📱 Design responsivo

---

## 🚀 Como Integrar

### Passo 1: Adicionar referência no index.html

Adicione no `<head>` do seu **index.html**:
```html
<script src="auth.js"></script>
```

### Passo 2: Modificar o carregamento de projetos

**Antes (usando localStorage direto):**
```javascript
let projects = JSON.parse(localStorage.getItem('cultureProjects') || '[]');
```

**Depois (usando o gerenciador):**
```javascript
let projects = projectManager.getUserProjects();
```

### Passo 3: Atualizar salvamento de projetos

**Antes:**
```javascript
localStorage.setItem('cultureProjects', JSON.stringify(projects));
```

**Depois:**
```javascript
projectManager.saveUserProjects(projects);
```

### Passo 4: Proteger a página

No início do **index.html**, adicione:
```javascript
window.addEventListener('load', () => {
    if (!auth.isLoggedIn()) {
        window.location.href = 'login.html';
    }
});
```

### Passo 5: Atualizar logout

Modificar a função `doLogout()`:
```javascript
function doLogout() {
    auth.logout();
    window.location.href = 'login.html';
}
```

### Passo 6: Exibir nome do usuário

```javascript
window.addEventListener('load', () => {
    const currentUser = auth.getCurrentUser();
    if (currentUser) {
        document.getElementById('userNameDisplay').textContent = `Olá, ${currentUser}! 👋`;
    }
});
```

---

## 🔑 Usuários de Demonstração

| Usuário | Senha | E-mail |
|---------|-------|--------|
| user1 | senha123 | user1@example.com |
| user2 | senha456 | user2@example.com |
| user3 | senha789 | user3@example.com |

---

## 💾 Estrutura de Dados no localStorage

```
1. Banco de Usuários:
   localStorage.getItem('cultureUsers')
   {
       "user1": {
           "username": "user1",
           "password": "senha123",
           "email": "user1@example.com",
           "createdAt": "2026-05-15T..."
       }
   }

2. Usuário Logado:
   localStorage.getItem('currentUser')
   {
       "username": "user1",
       "email": "user1@example.com",
       "loginTime": "2026-05-15T..."
   }

3. Projetos do Usuário:
   localStorage.getItem('userProjects_user1')
   [
       {
           "id": 1234567890,
           "nome": "Meu Projeto",
           "createdAt": "2026-05-15T...",
           "createdBy": "user1",
           ...
       }
   ]
```

---

## 🔐 Segurança

⚠️ **IMPORTANTE**: Este sistema usa localStorage com senhas em texto plano para demonstração. 

**Para produção, implemente:**
1. ✅ Hash de senhas (bcrypt)
2. ✅ Autenticação no backend
3. ✅ JWT tokens
4. ✅ HTTPS apenas
5. ✅ Rate limiting de login

---

## 🎯 Exemplos de Uso

### Fazer Login
```javascript
const result = auth.login('user1', 'senha123');
if (result.success) {
    console.log('Login bem-sucedido');
}
```

### Registrar Novo Usuário
```javascript
const result = auth.register('newuser', 'senhaforte123', 'new@example.com');
if (result.success) {
    console.log('Usuário registrado');
}
```

### Obter Projetos do Usuário Logado
```javascript
const projects = projectManager.getUserProjects();
console.log(projects);
```

### Adicionar Projeto
```javascript
const newProject = {
    nome: 'Novo Projeto',
    categoria: 'audiovisual',
    dataInicio: '2026-05-15'
};
const result = projectManager.addProject(newProject);
```

### Deletar Projeto
```javascript
projectManager.deleteProject(projectId);
```

---

## 📞 Suporte

Se precisar de ajustes específicos no seu sistema, posso:
- Adicionar validações extras
- Implementar recuperação de senha
- Adicionar dois fatores de autenticação (2FA)
- Integrar com banco de dados
- Adicionar permissões (admin, editor, leitor)

