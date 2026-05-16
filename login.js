// ========== SISTEMA DE LOGIN E PROTEÇÃO DE ROTAS ==========

class LoginManager {
    constructor() {
        this.usersKey = 'cultureUsers';
        this.adminUsersKey = 'users';
        this.demoUsersKey = 'demoUsers';
        this.currentUserKey = 'currentUser';
    }

    // Sincronizar usuários do admin antes de fazer login
    syncAndValidateUsers() {
        const adminUsers = JSON.parse(localStorage.getItem(this.adminUsersKey) || '[]');
        let cultureUsers = JSON.parse(localStorage.getItem(this.usersKey) || '{}');
        
        // Converter para objeto se for array
        if (Array.isArray(cultureUsers)) {
            cultureUsers = {};
        }

        // Sincronizar usuários do admin
        adminUsers.forEach(adminUser => {
            const login = adminUser.login;
            
            // Verificar se o usuário está bloqueado
            if (adminUser.status === 'bloqueado') {
                // Remover usuário bloqueado
                delete cultureUsers[login];
                return;
            }

            // Verificar se acesso expirou
            let acessoValido = true;
            if (adminUser.dataExpiracao) {
                const expireDate = new Date(adminUser.dataExpiracao);
                if (new Date() > expireDate) {
                    acessoValido = false;
                }
            }

            if (acessoValido) {
                // Adicionar ou atualizar usuário
                cultureUsers[login] = {
                    username: login,
                    password: adminUser.senha,
                    email: login + '@sistema.local',
                    nome: adminUser.nome,
                    createdAt: new Date().toISOString()
                };
            } else {
                // Remover usuário expirado
                delete cultureUsers[login];
            }
        });

        // Sincronizar usuários demo
        const demoUsers = JSON.parse(localStorage.getItem(this.demoUsersKey) || '[]');
        demoUsers.forEach(demoUser => {
            const login = demoUser.login;
            cultureUsers[login] = {
                username: login,
                password: demoUser.senha,
                email: login + '@demo.local',
                nome: 'Demo User',
                createdAt: new Date().toISOString()
            };
        });

        localStorage.setItem(this.usersKey, JSON.stringify(cultureUsers));
        return cultureUsers;
    }

    // Fazer login
    login(username, password) {
        // Sincronizar e validar usuários
        const users = this.syncAndValidateUsers();
        const user = users[username];

        if (!user) {
            return {
                success: false,
                message: '❌ Usuário não encontrado ou acesso expirado'
            };
        }

        if (user.password !== password) {
            return {
                success: false,
                message: '❌ Senha incorreta'
            };
        }

        // Salvar usuário logado
        const currentUserData = {
            username: user.username,
            email: user.email,
            loginTime: new Date().toISOString()
        };
        localStorage.setItem(this.currentUserKey, JSON.stringify(currentUserData));

        return {
            success: true,
            message: '✅ Login realizado com sucesso!',
            user: currentUserData
        };
    }

    // Fazer logout
    logout() {
        localStorage.removeItem(this.currentUserKey);
        window.location.href = 'login.html';
    }

    // Obter usuário atual
    getCurrentUser() {
        const currentUser = localStorage.getItem(this.currentUserKey);
        if (currentUser) {
            try {
                return JSON.parse(currentUser).username;
            } catch (e) {
                return null;
            }
        }
        return null;
    }

    // Verificar se está logado
    isLoggedIn() {
        return localStorage.getItem(this.currentUserKey) !== null;
    }

    // Obter dados do usuário atual
    getCurrentUserData() {
        const currentUser = localStorage.getItem(this.currentUserKey);
        if (currentUser) {
            try {
                return JSON.parse(currentUser);
            } catch (e) {
                return null;
            }
        }
        return null;
    }
}

// Instância global
const loginManager = new LoginManager();

// ========== PROTEÇÃO DE ROTAS ==========

function protectIndexPage() {
    // Se não está autenticado, redirecionar para login
    if (!loginManager.isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    // Verificar se o usuário não está bloqueado ou expirado
    const username = loginManager.getCurrentUser();
    if (!username) {
        window.location.href = 'login.html';
        return;
    }

    // Sincronizar usuários para validar se ainda tem acesso
    const users = loginManager.syncAndValidateUsers();
    if (!users[username]) {
        // Usuário foi bloqueado ou acesso expirou
        loginManager.logout();
        return;
    }
}

// ========== FUNÇÕES DE LOGOUT ==========

function doLogout() {
    if (confirm('Tem certeza que deseja fazer logout?')) {
        loginManager.logout();
    }
}

// ========== INTERCEPTOR DE NAVEGAÇÃO ==========

// Redirecionar automaticamente se tentar acessar uma página protegida sem estar logado
document.addEventListener('DOMContentLoaded', function() {
    // Se estiver em uma página protegida e não está logado
    const currentPage = window.location.pathname.split('/').pop();
    const protectedPages = ['index.html', ''];

    if (protectedPages.includes(currentPage) && !loginManager.isLoggedIn()) {
        window.location.href = 'login.html';
    }
});
