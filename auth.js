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