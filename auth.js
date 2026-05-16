<<<<<<< HEAD
// Auth System for Gestão de Projetos

const AUTH_STORAGE_KEY = 'culture_users';
const USERS_STORAGE_KEY = 'users';
const DEMO_USERS_KEY = 'demoUsers';

// Initialize default admin user only (no public test credentials)
function initAuthSystem() {
    // Initialize main users storage with ONLY admin
    let users = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!users) {
        const defaultUsers = [
            { email: 'admin', password: 'admin123', name: 'Administrador' }
        ];
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(defaultUsers));
    }
    
    // Sync users from admin panel
    syncUsersFromAdminPanel();
}

// Sync users from admin panel (both regular users and demo users)
function syncUsersFromAdminPanel() {
    const adminUsers = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
    const demoUsers = JSON.parse(localStorage.getItem(DEMO_USERS_KEY) || '[]');
    let cultureUsers = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || '[]');
    let updated = false;
    
    // Keep admin user always
    const adminExists = cultureUsers.find(u => u.email === 'admin');
    if (!adminExists) {
        cultureUsers.push({ email: 'admin', password: 'admin123', name: 'Administrador' });
        updated = true;
    }
    
    // Add admin panel users (only if active and not expired)
    adminUsers.forEach(adminUser => {
        if (adminUser.status !== 'bloqueado') {
            let acessoValido = true;
            if (adminUser.dataExpiracao && !adminUser.acessoIlimitado) {
                const expireDate = new Date(adminUser.dataExpiracao);
                if (new Date() > expireDate) {
                    acessoValido = false;
                }
            }
            
            if (acessoValido) {
                const exists = cultureUsers.find(u => u.email === adminUser.login);
                if (!exists) {
                    cultureUsers.push({
                        email: adminUser.login,
                        password: adminUser.senha,
                        name: adminUser.nome
                    });
                    updated = true;
                } else if (exists.password !== adminUser.senha) {
                    exists.password = adminUser.senha;
                    updated = true;
                }
            } else {
                const index = cultureUsers.findIndex(u => u.email === adminUser.login);
                if (index !== -1) {
                    cultureUsers.splice(index, 1);
                    updated = true;
                }
            }
        } else {
            const index = cultureUsers.findIndex(u => u.email === adminUser.login);
            if (index !== -1) {
                cultureUsers.splice(index, 1);
                updated = true;
            }
        }
    });
    
    // Add demo users
    demoUsers.forEach(demoUser => {
        let acessoValido = true;
        if (demoUser.dataExpiracao && !demoUser.acessoIlimitado) {
            const expireDate = new Date(demoUser.dataExpiracao);
            if (new Date() > expireDate) {
                acessoValido = false;
            }
        }
        
        if (acessoValido && demoUser.status !== 'bloqueado') {
            const exists = cultureUsers.find(u => u.email === demoUser.login);
            if (!exists) {
                cultureUsers.push({
                    email: demoUser.login,
                    password: demoUser.senha,
                    name: 'Usuário Demo'
                });
                updated = true;
            } else if (exists.password !== demoUser.senha) {
                exists.password = demoUser.senha;
                updated = true;
            }
        } else {
            const index = cultureUsers.findIndex(u => u.email === demoUser.login);
            if (index !== -1) {
                cultureUsers.splice(index, 1);
                updated = true;
            }
        }
    });
    
    if (updated) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(cultureUsers));
    }
}

// Login function
function authLogin(email, password) {
    initAuthSystem();
    
    const users = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Check if user is blocked or expired in admin panel
        const adminUsers = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
        const adminUser = adminUsers.find(u => u.login === email);
        
        if (adminUser) {
            if (adminUser.status === 'bloqueado') {
                return { success: false, message: 'Usuário bloqueado. Contate o administrador.' };
            }
            
            if (adminUser.dataExpiracao && !adminUser.acessoIlimitado) {
                const expireDate = new Date(adminUser.dataExpiracao);
                if (new Date() > expireDate) {
                    return { success: false, message: 'Acesso expirado. Contate o administrador para renovar.' };
                }
            }
        }
        
        // Check demo users expiration
        const demoUsers = JSON.parse(localStorage.getItem(DEMO_USERS_KEY) || '[]');
        const demoUser = demoUsers.find(u => u.login === email);
        if (demoUser && demoUser.dataExpiracao && !demoUser.acessoIlimitado) {
            const expireDate = new Date(demoUser.dataExpiracao);
            if (new Date() > expireDate) {
                return { success: false, message: 'Acesso demo expirado. Contate o administrador.' };
            }
        }
        
        // Clear any existing session first
        sessionStorage.removeItem('currentUser');
        localStorage.removeItem('current_user');
        
        // Store current user in sessionStorage
        const currentUser = { username: user.email, name: user.name };
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        localStorage.setItem('current_user', JSON.stringify(currentUser));
        
        return { success: true, message: 'Login realizado com sucesso!' };
    }
    
    return { success: false, message: 'Usuário ou senha incorretos' };
}

// Check if user is logged in
function isLoggedIn() {
    const sessionUser = sessionStorage.getItem('currentUser');
    if (sessionUser) return true;
    return localStorage.getItem('current_user') !== null;
}

// Get current user
function getCurrentUser() {
    let user = sessionStorage.getItem('currentUser');
    if (user) return JSON.parse(user);
    user = localStorage.getItem('current_user');
    return user ? JSON.parse(user) : null;
}

// Logout
function logout() {
    sessionStorage.removeItem('currentUser');
    localStorage.removeItem('current_user');
}

// Get projects for current user
function getUserProjects() {
    const currentUser = getCurrentUser();
    if (!currentUser) return [];
    
    const projectsKey = `projects_${currentUser.username}`;
    const projects = localStorage.getItem(projectsKey);
    return projects ? JSON.parse(projects) : [];
}

// Save projects for current user
function saveUserProjects(projects) {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const projectsKey = `projects_${currentUser.username}`;
    localStorage.setItem(projectsKey, JSON.stringify(projects));
}

// Create auth object for global use
const auth = {
    login: authLogin,
    isLoggedIn: isLoggedIn,
    getCurrentUser: getCurrentUser,
    logout: logout,
    getUserProjects: getUserProjects,
    saveUserProjects: saveUserProjects,
    init: initAuthSystem
};

// Auto-initialize
auth.init();
=======
// ========== SISTEMA DE AUTENTICAÇÃO ==========

class AuthSystem {
    constructor() {
        this.usersKey = 'cultureUsers';
        this.adminUsersKey = 'users'; // Usuários cadastrados no admin
        this.currentUserKey = 'currentUser';
        this.initializeUsers();
    }

    // Sincronizar usuários do admin com o sistema de autenticação
    syncAdminUsers() {
        const adminUsers = JSON.parse(localStorage.getItem(this.adminUsersKey) || '[]');
        let cultureUsers = JSON.parse(localStorage.getItem(this.usersKey) || '{}');
        
        // Converter para objeto se for array (compatibilidade)
        if (Array.isArray(cultureUsers)) {
            cultureUsers = {};
        }

        let sincronizado = false;

        adminUsers.forEach(adminUser => {
            // Verificar se usuário não está bloqueado e acesso não expirou
            if (adminUser.status !== 'bloqueado') {
                let acessoValido = true;
                
                if (adminUser.dataExpiracao) {
                    const expireDate = new Date(adminUser.dataExpiracao);
                    if (new Date() > expireDate) {
                        acessoValido = false;
                    }
                }

                if (acessoValido) {
                    const login = adminUser.login;
                    
                    // Adicionar ou atualizar no formato cultureUsers
                    if (!cultureUsers[login] || cultureUsers[login].password !== adminUser.senha) {
                        cultureUsers[login] = {
                            username: login,
                            password: adminUser.senha,
                            email: login + '@sistema.local',
                            nome: adminUser.nome,
                            createdAt: new Date().toISOString()
                        };
                        sincronizado = true;
                    }
                }
            }
        });

        // Sincronizar usuários demo também
        const demoUsers = JSON.parse(localStorage.getItem('demoUsers') || '[]');
        demoUsers.forEach(demoUser => {
            const login = demoUser.login;
            if (!cultureUsers[login] || cultureUsers[login].password !== demoUser.senha) {
                cultureUsers[login] = {
                    username: login,
                    password: demoUser.senha,
                    email: login + '@demo.local',
                    nome: 'Demo User',
                    createdAt: new Date().toISOString()
                };
                sincronizado = true;
            }
        });

        if (sincronizado) {
            localStorage.setItem(this.usersKey, JSON.stringify(cultureUsers));
            console.log('✅ Usuários sincronizados do admin');
        }

        return cultureUsers;
    }

    // Inicializar usuários padrão
    initializeUsers() {
        const existingUsers = localStorage.getItem(this.usersKey);
        if (!existingUsers) {
            const defaultUsers = {
                'user1': {
                    username: 'user1',
                    password: 'senha123',
                    email: 'user1@example.com',
                    createdAt: new Date().toISOString()
                },
                'user2': {
                    username: 'user2',
                    password: 'senha456',
                    email: 'user2@example.com',
                    createdAt: new Date().toISOString()
                },
                'user3': {
                    username: 'user3',
                    password: 'senha789',
                    email: 'user3@example.com',
                    createdAt: new Date().toISOString()
                }
            };
            localStorage.setItem(this.usersKey, JSON.stringify(defaultUsers));
        }

        // Sincronizar usuários do admin na inicialização
        this.syncAdminUsers();
    }

    // Fazer login
    login(username, password) {
        // Primeiro sincronizar usuários do admin
        this.syncAdminUsers();

        const users = JSON.parse(localStorage.getItem(this.usersKey) || '{}');
        const user = users[username];

        if (!user) {
            return {
                success: false,
                message: 'Usuário não encontrado'
            };
        }

        if (user.password !== password) {
            return {
                success: false,
                message: 'Senha incorreta'
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
            message: 'Login realizado com sucesso!',
            user: currentUserData
        };
    }

    // Fazer logout
    logout() {
        localStorage.removeItem(this.currentUserKey);
        return { success: true, message: 'Logout realizado' };
    }

    // Registrar novo usuário
    register(username, password, email) {
        // Validações
        if (!username || !password || !email) {
            return {
                success: false,
                message: 'Todos os campos são obrigatórios'
            };
        }

        if (password.length < 6) {
            return {
                success: false,
                message: 'Senha deve ter no mínimo 6 caracteres'
            };
        }

        const users = JSON.parse(localStorage.getItem(this.usersKey) || '{}');

        if (users[username]) {
            return {
                success: false,
                message: 'Este usuário já existe'
            };
        }

        // Validar email
        if (!email.includes('@')) {
            return {
                success: false,
                message: 'E-mail inválido'
            };
        }

        // Adicionar novo usuário
        users[username] = {
            username: username,
            password: password,
            email: email,
            createdAt: new Date().toISOString()
        };

        localStorage.setItem(this.usersKey, JSON.stringify(users));

        return {
            success: true,
            message: 'Usuário registrado com sucesso!'
        };
    }

    // Obter usuário atual
    getCurrentUser() {
        const currentUser = localStorage.getItem(this.currentUserKey);
        if (currentUser) {
            return JSON.parse(currentUser).username;
        }
        return null;
    }

    // Verificar se está logado
    isLoggedIn() {
        return localStorage.getItem(this.currentUserKey) !== null;
    }

    // Alterar senha
    changePassword(username, oldPassword, newPassword) {
        const users = JSON.parse(localStorage.getItem(this.usersKey) || '{}');
        const user = users[username];

        if (!user) {
            return { success: false, message: 'Usuário não encontrado' };
        }

        if (user.password !== oldPassword) {
            return { success: false, message: 'Senha atual incorreta' };
        }

        if (newPassword.length < 6) {
            return { success: false, message: 'Nova senha deve ter no mínimo 6 caracteres' };
        }

        users[username].password = newPassword;
        localStorage.setItem(this.usersKey, JSON.stringify(users));

        return { success: true, message: 'Senha alterada com sucesso!' };
    }
}

// ========== GERENCIADOR DE PROJETOS POR USUÁRIO ==========

class ProjectManager {
    constructor() {
        this.auth = new AuthSystem();
    }

    // Obter chave de projetos do usuário atual
    getUserProjectsKey() {
        const username = this.auth.getCurrentUser();
        if (!username) {
            throw new Error('Nenhum usuário logado');
        }
        return `userProjects_${username}`;
    }

    // Obter todos os projetos do usuário
    getUserProjects() {
        try {
            const key = this.getUserProjectsKey();
            return JSON.parse(localStorage.getItem(key) || '[]');
        } catch (error) {
            console.error('Erro ao obter projetos:', error);
            return [];
        }
    }

    // Salvar projetos do usuário
    saveUserProjects(projects) {
        try {
            const key = this.getUserProjectsKey();
            localStorage.setItem(key, JSON.stringify(projects));
            return { success: true, message: 'Projetos salvos com sucesso' };
        } catch (error) {
            console.error('Erro ao salvar projetos:', error);
            return { success: false, message: 'Erro ao salvar projetos' };
        }
    }

    // Adicionar novo projeto
    addProject(projectData) {
        try {
            const projects = this.getUserProjects();
            const newProject = {
                id: Date.now(),
                ...projectData,
                createdAt: new Date().toISOString(),
                createdBy: this.auth.getCurrentUser()
            };
            projects.push(newProject);
            this.saveUserProjects(projects);
            return { success: true, projectId: newProject.id, message: 'Projeto adicionado' };
        } catch (error) {
            console.error('Erro ao adicionar projeto:', error);
            return { success: false, message: 'Erro ao adicionar projeto' };
        }
    }

    // Obter projeto específico
    getProject(projectId) {
        try {
            const projects = this.getUserProjects();
            return projects.find(p => p.id === projectId);
        } catch (error) {
            console.error('Erro ao obter projeto:', error);
            return null;
        }
    }

    // Atualizar projeto
    updateProject(projectId, projectData) {
        try {
            const projects = this.getUserProjects();
            const index = projects.findIndex(p => p.id === projectId);
            if (index !== -1) {
                projects[index] = { ...projects[index], ...projectData, updatedAt: new Date().toISOString() };
                this.saveUserProjects(projects);
                return { success: true, message: 'Projeto atualizado' };
            }
            return { success: false, message: 'Projeto não encontrado' };
        } catch (error) {
            console.error('Erro ao atualizar projeto:', error);
            return { success: false, message: 'Erro ao atualizar projeto' };
        }
    }

    // Deletar projeto
    deleteProject(projectId) {
        try {
            let projects = this.getUserProjects();
            projects = projects.filter(p => p.id !== projectId);
            this.saveUserProjects(projects);
            return { success: true, message: 'Projeto deletado' };
        } catch (error) {
            console.error('Erro ao deletar projeto:', error);
            return { success: false, message: 'Erro ao deletar projeto' };
        }
    }
}

// ========== INSTÂNCIAS GLOBAIS ==========
const auth = new AuthSystem();
const projectManager = new ProjectManager();
>>>>>>> 77a6df3d31197b0e6323d4bd2ee57d40be8567e1
