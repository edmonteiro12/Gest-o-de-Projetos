// ========== VARIÁVEIS GLOBAIS ==========
let currentUser = null;
let projects = [];
let currentEditingProjectId = null;
let currentEquipe = [];
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

// ========== INICIALIZAÇÃO ==========
function init() {
    loadUsersFromStorage();
    checkLogin();
}

function loadUsersFromStorage() {
    let users = localStorage.getItem('users');
    if (!users) {
        const defaultUsers = [
            { nome: "Administrador", documento: "000", login: "admin", senha: "123456", status: "ativo", senhaAtualizada: true }
        ];
        localStorage.setItem('users', JSON.stringify(defaultUsers));
    }
}

function checkLogin() {
    const loggedUser = localStorage.getItem('loggedUser');
    if (loggedUser) {
        currentUser = JSON.parse(loggedUser);
        document.getElementById('appContainer').style.display = 'block';
        document.getElementById('userNameDisplay').innerText = currentUser.nome || currentUser.login;
        loadProjects();
        renderCalendar();
        renderProjectsList();
    }
}

// ========== LOGIN ==========
function doLogin() {
    const login = document.getElementById('loginUser').value;
    const senha = document.getElementById('loginPass').value;
    
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.login === login && u.senha === senha && u.status !== 'bloqueado');
    
    if (user) {
        localStorage.setItem('loggedUser', JSON.stringify(user));
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 200);
    } else {
        document.getElementById('loginError').innerText = 'Login ou senha incorretos ou usuário bloqueado!';
    }
}

function doLogout() {
    localStorage.removeItem('loggedUser');
    currentUser = null;
    window.location.href = 'login.html';
}

// ========== PROJETOS ==========
function loadProjects() {
    const allProjects = localStorage.getItem('projects');
    const allProjectsArray = allProjects ? JSON.parse(allProjects) : [];
    if (currentUser) {
        projects = allProjectsArray.filter(p => p.userLogin === currentUser.login);
    } else {
        projects = [];
    }
}

function saveProjectsToStorage() {
    let allProjects = localStorage.getItem('projects');
    let allProjectsArray = allProjects ? JSON.parse(allProjects) : [];
    const otherProjects = allProjectsArray.filter(p => p.userLogin !== currentUser.login);
    const finalProjects = [...otherProjects, ...projects];
    localStorage.setItem('projects', JSON.stringify(finalProjects));
}

function openProjectModal(projectId = null) {
    currentEditingProjectId = projectId;
    const modal = document.getElementById('projectModal');
    const modalTitle = document.getElementById('modalTitle');
    
    if (projectId) {
        modalTitle.innerText = 'Editar Projeto';
        const project = projects.find(p => p.id === projectId);
        if (project) {
            document.getElementById('projNome').value = project.nome || '';
            document.getElementById('projCategoria').value = project.categoria || 'audiovisual';
            document.getElementById('projDataInicio').value = project.dataInicio || '';
            document.getElementById('projDataTermino').value = project.dataTermino || '';
            document.getElementById('projObjetivo').value = project.objetivo || '';
            document.getElementById('projSinopse').value = project.sinopse || '';
            document.getElementById('projPublico').value = project.publico || '';
            document.getElementById('projJustificativa').value = project.justificativa || '';
            document.getElementById('projComoRealizado').value = project.comoRealizado || '';
            document.getElementById('projNarrativa').value = project.narrativa || '';
            document.getElementById('planoEstrategias').value = project.planoEstrategias || '';
            document.getElementById('planoAcoes').value = project.planoAcoes || '';
            document.getElementById('planoPecas').value = project.planoPecas || '';
            document.getElementById('planoEspecificacoes').value = project.planoEspecificacoes || '';
            
            // Inicializar dados das abas
            window.currentTarefas = project.tarefas || { pre: [], prod: [], pos: [] };
            window.currentBudgetItems = project.budgetItems || [];
            window.currentEquipe = project.equipe || [];
            
            if (typeof renderCronograma === 'function') renderCronograma();
            if (typeof renderBudget === 'function') renderBudget();
            renderEquipeList();
        }
    } else {
        modalTitle.innerText = 'Criar Novo Projeto';
        clearProjectForm();
        window.currentTarefas = { pre: [], prod: [], pos: [] };
        window.currentBudgetItems = [];
        window.currentEquipe = [];
        if (typeof renderCronograma === 'function') renderCronograma();
        if (typeof renderBudget === 'function') renderBudget();
        renderEquipeList();
    }
    
    modal.style.display = 'block';
    switchTab('info');
}

function clearProjectForm() {
    document.getElementById('projNome').value = '';
    document.getElementById('projCategoria').value = 'audiovisual';
    document.getElementById('projDataInicio').value = '';
    document.getElementById('projDataTermino').value = '';
    document.getElementById('projObjetivo').value = '';
    document.getElementById('projSinopse').value = '';
    document.getElementById('projPublico').value = '';
    document.getElementById('projJustificativa').value = '';
    document.getElementById('projComoRealizado').value = '';
    document.getElementById('projNarrativa').value = '';
    document.getElementById('planoEstrategias').value = '';
    document.getElementById('planoAcoes').value = '';
    if (typeof clearDivulgacaoForm === 'function') {
        clearDivulgacaoForm();
    } else {
        divulgacaoPecas = [];
    }
    window.currentEquipe = [];
    document.getElementById('equipeForm').classList.add('hidden');
    clearEquipeFields();
    renderEquipeList();
}

function closeProjectModal() {
    document.getElementById('projectModal').style.display = 'none';
    currentEditingProjectId = null;
}

function saveCurrentProject() {
    const nome = document.getElementById('projNome').value;
    if (!nome) {
        alert('Por favor, informe o nome do projeto!');
        return;
    }
    
    const projectData = {
        id: currentEditingProjectId || Date.now(),
        userLogin: currentUser.login,
        nome: nome,
        categoria: document.getElementById('projCategoria').value,
        dataInicio: document.getElementById('projDataInicio').value,
        dataTermino: document.getElementById('projDataTermino').value,
        objetivo: document.getElementById('projObjetivo').value,
        sinopse: document.getElementById('projSinopse').value,
        publico: document.getElementById('projPublico').value,
        justificativa: document.getElementById('projJustificativa').value,
        comoRealizado: document.getElementById('projComoRealizado').value,
        narrativa: document.getElementById('projNarrativa').value,
        planoEstrategias: document.getElementById('planoEstrategias').value,
        planoAcoes: document.getElementById('planoAcoes').value,
        divulgacaoPecas: typeof getDivulgacaoData === 'function' ? getDivulgacaoData().divulgacaoPecas : (window.divulgacaoPecas || []),
        tarefas: window.currentTarefas,
        budgetItems: window.currentBudgetItems,
        equipe: window.currentEquipe
    };
    
    if (currentEditingProjectId) {
        const index = projects.findIndex(p => p.id === currentEditingProjectId);
        if (index !== -1) projects[index] = projectData;
    } else {
        projects.push(projectData);
    }
    
    saveProjectsToStorage();
    closeProjectModal();
    renderCalendar();
    renderProjectsList();
    alert('Projeto salvo com sucesso!');
}

function deleteProject(projectId) {
    if (confirm('Tem certeza que deseja excluir este projeto?')) {
        projects = projects.filter(p => p.id !== projectId);
        saveProjectsToStorage();
        renderCalendar();
        renderProjectsList();
    }
}

// ========== CALENDÁRIO ==========
function renderCalendar() {
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const monthYearElement = document.getElementById('monthYear');
    if (monthYearElement) {
        monthYearElement.innerText = `${monthNames[currentMonth]} ${currentYear}`;
    }
    
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    let gridHtml = '';
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    weekDays.forEach(day => {
        gridHtml += `<div class="calendar-day calendar-day-header">${day}</div>`;
    });
    
    for (let i = 0; i < firstDay; i++) {
        gridHtml += `<div class="calendar-day"></div>`;
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const hasProject = projects.some(p => p.dataInicio === dateStr || p.dataTermino === dateStr);
        const projectClass = hasProject ? 'has-project' : '';
        gridHtml += `<div class="calendar-day ${projectClass}" onclick="filterProjectsByDate('${dateStr}')">${day}</div>`;
    }
    
    const calendarGrid = document.getElementById('calendarGrid');
    if (calendarGrid) calendarGrid.innerHTML = gridHtml;
}

function previousMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar();
}

function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar();
}

function filterProjectsByDate(date) {
    const filtered = projects.filter(p => p.dataInicio === date || p.dataTermino === date);
    renderProjectsList(filtered);
    setTimeout(() => {
        renderProjectsList();
    }, 3000);
}

// ========== RENDER PROJETOS ==========
function renderProjectsList(projectsToShow = null) {
    const grid = document.getElementById('projectsGrid');
    const listToShow = projectsToShow || projects;
    
    if (!grid) return;
    
    if (listToShow.length === 0) {
        grid.innerHTML = '<div style="text-align:center; padding:2rem; color:#888;">Nenhum projeto cadastrado. Clique em "Criar Projeto" para começar!</div>';
        return;
    }
    
    let html = '';
    listToShow.forEach(project => {
        const categoriaNome = getCategoriaNome(project.categoria);
        html += `
            <div class="project-card" onclick="openProjectModal(${project.id})">
                <div class="project-title">${escapeHtml(project.nome)}</div>
                <div class="project-categoria">${categoriaNome}</div>
                <div class="project-dates">
                    📅 ${project.dataInicio || '?'} → ${project.dataTermino || '?'}
                </div>
                <button class="logout-btn" style="margin-top:10px; background:#dc3545;" onclick="event.stopPropagation(); deleteProject(${project.id})">Excluir</button>
            </div>
        `;
    });
    grid.innerHTML = html;
}

function getCategoriaNome(categoria) {
    const categorias = {
        audiovisual: '🎬 Audiovisual',
        teatro: '🎭 Teatro',
        musica: '🎵 Música',
        artes_visuais: '🎨 Artes Visuais',
        alimentos: '🍽️ Alimentos',
        esportes: '⚽ Esportes',
        educacao: '📚 Educação'
    };
    return categorias[categoria] || categoria;
}

function toggleEquipeForm() {
    const form = document.getElementById('equipeForm');
    if (!form) return;
    form.classList.toggle('hidden');
}

function clearEquipeFields() {
    const fields = ['equipeNome', 'equipeCpf', 'equipeNascimento', 'equipeTelefone', 'equipeEmail'];
    fields.forEach(id => {
        const field = document.getElementById(id);
        if (field) field.value = '';
    });
}

function renderEquipeList() {
    const list = document.getElementById('equipeList');
    if (!list) return;
    if (!window.currentEquipe || window.currentEquipe.length === 0) {
        list.innerHTML = '<div style="color:#666; padding:0.75rem;">Nenhum membro na equipe.</div>';
        return;
    }
    list.innerHTML = window.currentEquipe.map(member => `
        <div class="equipe-item">
            <strong>${escapeHtml(member.nome)}</strong><br>
            CPF: ${escapeHtml(member.cpf)} • Nasc: ${escapeHtml(member.nascimento)}<br>
            📞 ${escapeHtml(member.telefone)} • ✉️ ${escapeHtml(member.email)}
        </div>
    `).join('');
}

function addEquipeMember() {
    const nome = document.getElementById('equipeNome').value.trim();
    const cpf = document.getElementById('equipeCpf').value.trim();
    const nascimento = document.getElementById('equipeNascimento').value;
    const telefone = document.getElementById('equipeTelefone').value.trim();
    const email = document.getElementById('equipeEmail').value.trim();

    if (!nome || !cpf || !nascimento || !telefone || !email) {
        alert('Preencha todos os campos da equipe.');
        return;
    }

    window.currentEquipe = window.currentEquipe || [];
    window.currentEquipe.push({ nome, cpf, nascimento, telefone, email });
    clearEquipeFields();
    renderEquipeList();
    alert('Membro da equipe adicionado!');
}

function toggleEquipeForm() {
    const form = document.getElementById('equipeForm');
    if (!form) return;
    form.classList.toggle('hidden');
}

function clearEquipeFields() {
    const fields = ['equipeNome', 'equipeCpf', 'equipeNascimento', 'equipeTelefone', 'equipeEmail'];
    fields.forEach(id => {
        const field = document.getElementById(id);
        if (field) field.value = '';
    });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========== UTILS ==========
function switchTab(tabName) {
    const tabs = ['info', 'cronograma', 'budget', 'comunicacao'];
    tabs.forEach(tab => {
        const content = document.getElementById(`tab${tab.charAt(0).toUpperCase() + tab.slice(1)}`);
        if (content) content.classList.remove('active');
    });
    
    const activeTab = document.getElementById(`tab${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`);
    if (activeTab) activeTab.classList.add('active');
    
    const sidebarButtons = document.querySelectorAll('.modal-sidebar .tab');
    sidebarButtons.forEach(btn => btn.classList.remove('active'));
    
    if (event && event.target) {
        event.target.classList.add('active');
    } else {
        const targetBtn = Array.from(sidebarButtons).find(btn => btn.innerText.includes(getTabLabel(tabName)));
        if (targetBtn) targetBtn.classList.add('active');
    }
    
    if (tabName === 'cronograma' && typeof renderCronograma === 'function') renderCronograma();
    if (tabName === 'budget' && typeof renderBudget === 'function') renderBudget();
}

function getTabLabel(tabName) {
    const labels = {
        info: 'Informações',
        cronograma: 'Cronograma',
        budget: 'Orçamento',
        comunicacao: 'Plano de Divulgação'
    };
    return labels[tabName] || '';
}

// Inicializar
if (document.getElementById('loginPage')) {
    init();
} else {
    checkLogin();
}
let secaoAtual = 1;
let contadorSubitens = 0;

function gerarNumeroItemComSecao() {
    if (contadorSubitens === 0) {
        contadorSubitens = 1;
    } else {
        contadorSubitens++;
    }
    return `${secaoAtual}.${contadorSubitens}`;
}

function adicionarItem() {
    const numeroItem = document.getElementById('numeroItemDesc');
    const novoNumero = gerarNumeroItemComSecao();
    
    numeroItem.value = novoNumero;
    
    // Criar elemento visual do item
    const listaItens = document.getElementById('listaItens');
    const novoItem = document.createElement('div');
    novoItem.textContent = `Item ${novoNumero}`;
    listaItens.appendChild(novoItem);
}

function novaSecao() {
    secaoAtual++;
    contadorSubitens = 0;
    adicionarItem(); // Começa nova seção com 1.1, 2.1, 3.1...
}