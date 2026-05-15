// ========== SISTEMA DE AUTENTICAÇÃO ==========

class AuthSystem {
    constructor() {
        this.usersKey = 'cultureUsers';
        this.currentUserKey = 'currentUser';
        this.initializeUsers();
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
    }

    // Fazer login
    login(username, password) {
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
