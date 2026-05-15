// ========== APLICAÇÃO PRINCIPAL - GESTÃO DE PROJETOS ==========
// Este arquivo contém a lógica do dashboard

// ========== VARIÁVEIS GLOBAIS ==========
let currentProjectId = null;
let itemCount = 0;

let tarefasData = { pre: [], prod: [], pos: [] };
let budgetItems = [];

const opcoesPecas = [
    "Redes Sociais", "Anúncios Google ADS", "Audiovisual", "Cartazes",
    "Banners", "Telão de LED", "Outdoor", "Panfletos", "Rádio",
    "TV", "Mídia Impressa", "E-mail Marketing"
];

const generosPorCategoria = {
    'audiovisual': ['Suspense', 'Drama', 'Comédia', 'Documentário', 'Terror', 'Ação', 'Aventura', 'Ficção Científica', 'Romance', 'Animação', 'Fantasia', 'Policial', 'Musical', 'Western', 'Slasher', 'Indie'],
    'teatro': ['Comédia', 'Drama', 'Musical', 'Stand-up', 'Monólogo', 'Tragédia', 'Farsa', 'Teatro de Rua', 'Teatro Infantil', 'Performance', 'Improviso', 'Clássico', 'Contemporâneo'],
    'musica': ['MPB', 'Rock', 'Samba', 'Pagode', 'Funk', 'Eletrônica', 'Clássica', 'Jazz', 'Blues', 'Country', 'Reggae', 'Hip Hop', 'Forró', 'Axé', 'Gospel', 'Infantil'],
    'artes_visuais': ['Pintura', 'Escultura', 'Fotografia', 'Grafite', 'Arte Digital', 'Instalação', 'Performance', 'Desenho', 'Gravura', 'Cerâmica', 'Arte Contemporânea', 'Arte Abstrata'],
    'alimentos': ['Gastronomia', 'Culinária Regional', 'Comida de Rua', 'Alimentação Saudável', 'Culinária Internacional', 'Confeitaria', 'Bebidas', 'Evento Gastronômico'],
    'esportes': ['Futebol', 'Vôlei', 'Basquete', 'Natação', 'Atletismo', 'Judô', 'Capoeira', 'Dança Esportiva', 'Skate', 'Surfe', 'e-Sports', 'Corrida', 'Ciclismo', 'Musculação'],
    'educacao': ['EAD', 'Presencial', 'Workshop', 'Palestra', 'Curso Livre', 'Capacitação', 'Treinamento', 'Oficina', 'Seminário', 'Congresso', 'Ensino Fundamental', 'Ensino Médio'],
    'circo': ['Palhaçaria', 'Malabarismo', 'Acrobacia', 'Mágica', 'Trapezio', 'Equilibrismo', 'Contorcionismo', 'Teatro Circense', 'Show Musical', 'Aéreo', 'Clown', 'Ilusionismo']
};

const formatosAudiovisual = ['Série', 'Longa-metragem', 'Curta-metragem', 'Novela', 'Reality Show', 'Documentário', 'Minissérie', 'Programa de TV', 'Videoclipe', 'Animação', 'Propaganda', 'Comercial'];

// ========== FUNÇÕES DE CALENDÁRIO ==========
let currentDate = new Date();

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const monthYearElem = document.getElementById('monthYear');
    if (monthYearElem) {
        monthYearElem.textContent = `${currentDate.toLocaleString('pt-BR', { month: 'long' })} ${year}`;
    }
    
    const firstDay = new Date(year, month, 1);
    const startDay = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let projects = JSON.parse(localStorage.getItem('cultureProjects') || '[]');
    
    let todasTarefasPorDia = [];
    projects.forEach(proj => {
        if (proj.tarefas) {
            proj.tarefas.forEach(tarefa => {
                if (tarefa.dataInicio) {
                    const dataObj = new Date(tarefa.dataInicio + 'T00:00:00');
                    todasTarefasPorDia.push({
                        data: dataObj,
                        tarefa: tarefa.nome,
                        status: tarefa.status || 'pending'
                    });
                }
            });
        }
    });
    
    const calendarGrid = document.getElementById('calendarGrid');
    if (!calendarGrid) return;
    
    calendarGrid.innerHTML = '';
    
    // Dias da semana
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    const headerRow = document.createElement('div');
    headerRow.style.display = 'contents';
    
    diasSemana.forEach(dia => {
        const dayHeader = document.createElement('div');
        dayHeader.style.fontWeight = 'bold';
        dayHeader.style.textAlign = 'center';
        dayHeader.style.padding = '10px';
        dayHeader.style.color = '#667eea';
        dayHeader.textContent = dia;
        calendarGrid.appendChild(dayHeader);
    });
    
    // Dias vazios antes do primeiro dia do mês
    for (let i = 0; i < startDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendarGrid.appendChild(emptyDay);
    }
    
    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day';
        
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day;
        dayCell.appendChild(dayNumber);
        
        // Adicionar tarefas do dia
        const dataAtual = new Date(year, month, day);
        const tarefasDodia = todasTarefasPorDia.filter(t => 
            t.data.toDateString() === dataAtual.toDateString()
        );
        
        tarefasDodia.forEach(t => {
            const eventEl = document.createElement('div');
            eventEl.className = 'calendar-event ' + (t.status || 'pending');
            eventEl.textContent = t.tarefa.substring(0, 15) + (t.tarefa.length > 15 ? '...' : '');
            eventEl.style.cursor = 'pointer';
            eventEl.onclick = () => showTaskStatus(t.tarefa, t.status);
            dayCell.appendChild(eventEl);
        });
        
        calendarGrid.appendChild(dayCell);
    }
}

function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
}

// ========== FUNÇÕES DE MODAL ==========
function openProjectModal() {
    currentProjectId = null;
    document.getElementById('modalTitle').textContent = 'Criar Novo Projeto';
    resetProjectForm();
    document.getElementById('projectModal').style.display = 'flex';
}

function closeProjectModal() {
    document.getElementById('projectModal').style.display = 'none';
    resetProjectForm();
}

function resetProjectForm() {
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
    
    tarefasData = { pre: [], prod: [], pos: [] };
    budgetItems = [];
    itemCount = 0;
    
    renderCronograma();
    renderBudgetContainer();
    renderEspecificacoes();
    renderComunicacao();
    
    switchTab('info');
}

function switchTab(tabName) {
    // Ocultar todas as abas
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => tab.classList.remove('active'));
    
    // Desativar todos os botões de aba
    const tabButtons = document.querySelectorAll('.tab');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // Mostrar aba selecionada
    const selectedTab = document.getElementById('tab' + tabName.charAt(0).toUpperCase() + tabName.slice(1));
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Ativar botão selecionado
    event.target.classList.add('active');
}

// ========== FUNÇÕES DE CRONOGRAMA ==========
function renderCronograma() {
    const container = document.getElementById('cronogramaContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    const fases = [
        { id: 'pre', nome: 'Pré-Produção' },
        { id: 'prod', nome: 'Produção' },
        { id: 'pos', nome: 'Pós-Produção' }
    ];
    
    fases.forEach(fase => {
        const faseItem = document.createElement('div');
        faseItem.className = 'fase-item';
        
        let html = `
            <div class="fase-header">
                📌 ${fase.nome}
            </div>
        `;
        
        if (tarefasData[fase.id].length > 0) {
            html += `
                <div style="display: grid; grid-template-columns: 1.5fr 1fr 1.5fr 1.5fr 1fr 40px; gap: 10px; padding: 10px 15px; font-weight: bold; border-bottom: 2px solid #ddd; background: #f8f9fa;">
                    <div>Tarefa</div>
                    <div>Responsável</div>
                    <div>Data Início</div>
                    <div>Data Fim</div>
                    <div>Status</div>
                    <div></div>
                </div>
            `;
            
            tarefasData[fase.id].forEach((tarefa, idx) => {
                html += `
                    <div class="tarefa-item">
                        <input type="text" value="${tarefa.nome}" onchange="tarefasData['${fase.id}'][${idx}].nome = this.value" style="padding: 8px; border: 1px solid #ddd; border-radius: 5px;">
                        <input type="text" value="${tarefa.responsavel}" onchange="tarefasData['${fase.id}'][${idx}].responsavel = this.value" style="padding: 8px; border: 1px solid #ddd; border-radius: 5px;">
                        <input type="date" value="${tarefa.dataInicio}" onchange="tarefasData['${fase.id}'][${idx}].dataInicio = this.value" style="padding: 8px; border: 1px solid #ddd; border-radius: 5px;">
                        <input type="date" value="${tarefa.dataFim}" onchange="tarefasData['${fase.id}'][${idx}].dataFim = this.value" style="padding: 8px; border: 1px solid #ddd; border-radius: 5px;">
                        <select onchange="tarefasData['${fase.id}'][${idx}].status = this.value" style="padding: 8px; border: 1px solid #ddd; border-radius: 5px;">
                            <option value="pending" ${tarefa.status === 'pending' ? 'selected' : ''}>Pendente</option>
                            <option value="completed" ${tarefa.status === 'completed' ? 'selected' : ''}>Concluída</option>
                            <option value="urgent" ${tarefa.status === 'urgent' ? 'selected' : ''}>Urgente</option>
                        </select>
                        <button type="button" class="remove-tarefa" onclick="removeTarefa('${fase.id}', ${idx})">🗑️</button>
                    </div>
                `;
            });
        } else {
            html += '<div style="padding: 15px; text-align: center; color: #999;">Nenhuma tarefa adicionada</div>';
        }
        
        faseItem.innerHTML = html;
        container.appendChild(faseItem);
    });
    
    updateTarefasTotal();
}

function addTarefa() {
    const nome = document.getElementById('novaTarefaNome').value;
    const fase = document.getElementById('novaTarefaFase').value;
    const responsavel = document.getElementById('novaTarefaResp').value;
    const dataInicio = document.getElementById('novaTarefaDataInicio').value;
    const dataFim = document.getElementById('novaTarefaDataFim').value;
    
    if (!nome || !responsavel || !dataInicio || !dataFim) {
        alert('Por favor, preencha todos os campos');
        return;
    }
    
    tarefasData[fase].push({
        nome,
        responsavel,
        dataInicio,
        dataFim,
        status: 'pending'
    });
    
    document.getElementById('novaTarefaNome').value = '';
    document.getElementById('novaTarefaResp').value = '';
    document.getElementById('novaTarefaDataInicio').value = '';
    document.getElementById('novaTarefaDataFim').value = '';
    
    renderCronograma();
}

function removeTarefa(fase, idx) {
    tarefasData[fase].splice(idx, 1);
    renderCronograma();
}

function updateTarefasTotal() {
    const totalTarefas = tarefasData.pre.length + tarefasData.prod.length + tarefasData.pos.length;
    document.getElementById('totalTarefas').textContent = totalTarefas;
    
    let totalDias = 0;
    let dataInicio = null;
    let dataFim = null;
    
    Object.values(tarefasData).forEach(fase => {
        fase.forEach(tarefa => {
            const inicio = new Date(tarefa.dataInicio);
            const fim = new Date(tarefa.dataFim);
            const dias = Math.ceil((fim - inicio) / (1000 * 60 * 60 * 24));
            totalDias += dias;
            
            if (!dataInicio || inicio < dataInicio) dataInicio = inicio;
            if (!dataFim || fim > dataFim) dataFim = fim;
        });
    });
    
    document.getElementById('totalDias').textContent = totalDias;
    
    if (dataInicio && dataFim) {
        const periodoTotal = Math.ceil((dataFim - dataInicio) / (1000 * 60 * 60 * 24));
        document.getElementById('totalPeriodo').textContent = periodoTotal + ' dias';
    }
}

// ========== FUNÇÕES DE ORÇAMENTO ==========
function renderBudgetContainer() {
    const container = document.getElementById('budgetContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (budgetItems.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">Nenhum item adicionado</p>';
        updateBudgetTotal();
        return;
    }
    
    const categorias = {};
    budgetItems.forEach(item => {
        if (!categorias[item.categoria]) {
            categorias[item.categoria] = [];
        }
        categorias[item.categoria].push(item);
    });
    
    Object.keys(categorias).forEach(categoria => {
        const budgetCategory = document.createElement('div');
        budgetCategory.className = 'budget-category';
        
        let html = `<h4>${categoria}</h4>`;
        html += `
            <table class="budget-table">
                <thead>
                    <tr>
                        <th>Nº</th>
                        <th>Descrição</th>
                        <th>Quantidade</th>
                        <th>Unidade</th>
                        <th>Qtd Unidade</th>
                        <th>V. Unitário</th>
                        <th>V. Total</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        categorias[categoria].forEach((item, idx) => {
            const itemTotal = item.quantidade * item.qtdUnidade * item.valorUnitario;
            html += `
                <tr>
                    <td>${item.numero}</td>
                    <td>${item.descricao}</td>
                    <td>${item.quantidade}</td>
                    <td>${item.unidade}</td>
                    <td>${item.qtdUnidade}</td>
                    <td>R$ ${item.valorUnitario.toFixed(2)}</td>
                    <td>R$ ${itemTotal.toFixed(2)}</td>
                    <td><button type="button" class="btn-add-task" style="background: #dc3545; padding: 5px 8px;" onclick="removeBudgetItem(${budgetItems.indexOf(item)})">🗑️</button></td>
                </tr>
            `;
        });
        
        html += `
                </tbody>
            </table>
        `;
        
        budgetCategory.innerHTML = html;
        container.appendChild(budgetCategory);
    });
    
    updateBudgetTotal();
}

function addBudgetItem() {
    const numero = itemCount + 1;
    const descricao = document.getElementById('descricaoItem').value;
    const categoria = document.getElementById('categoriaItem').value;
    const quantidade = parseInt(document.getElementById('quantidadeItem').value) || 1;
    const unidade = document.getElementById('unidadeItem').value;
    const qtdUnidade = parseInt(document.getElementById('qtdUnidade').value) || 1;
    const valorUnitario = parseFloat(document.getElementById('valorUnitario').value) || 0;
    
    if (!descricao || !categoria || valorUnitario <= 0) {
        alert('Por favor, preencha todos os campos corretamente');
        return;
    }
    
    budgetItems.push({
        numero,
        descricao,
        categoria,
        quantidade,
        unidade,
        qtdUnidade,
        valorUnitario
    });
    
    itemCount++;
    
    document.getElementById('descricaoItem').value = '';
    document.getElementById('quantidadeItem').value = '1';
    document.getElementById('qtdUnidade').value = '1';
    document.getElementById('valorUnitario').value = '';
    
    renderBudgetContainer();
}

function removeBudgetItem(idx) {
    budgetItems.splice(idx, 1);
    renderBudgetContainer();
}

function updateBudgetTotal() {
    let total = 0;
    budgetItems.forEach(item => {
        total += item.quantidade * item.qtdUnidade * item.valorUnitario;
    });
    
    // Atualizar elemento de total se existir
    const totalElement = document.querySelector('[data-budget-total]');
    if (totalElement) {
        totalElement.textContent = 'R$ ' + total.toFixed(2);
    }
}

// ========== FUNÇÕES DE ESPECIFICAÇÕES ==========
function renderEspecificacoes() {
    const container = document.getElementById('specificationsContainer');
    if (!container) return;
    
    const categoria = document.getElementById('projCategoria').value;
    
    container.innerHTML = `
        <div class="spec-group">
            <h4>Categoria</h4>
            <div class="spec-row">
                <div>
                    <label>Gênero</label>
                    <select id="specGenero" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 5px;">
                        <option value="">Selecione um gênero</option>
                        ${(generosPorCategoria[categoria] || []).map(g => `<option value="${g}">${g}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label>Formato (se audiovisual)</label>
                    <select id="specFormato" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 5px;">
                        <option value="">Selecione um formato</option>
                        ${categoria === 'audiovisual' ? formatosAudiovisual.map(f => `<option value="${f}">${f}</option>`).join('') : ''}
                    </select>
                </div>
            </div>
        </div>
    `;
}

// ========== FUNÇÕES DE COMUNICAÇÃO ==========
function renderComunicacao() {
    const container = document.getElementById('itemsContainer');
    if (!container) return;
    container.innerHTML = '';
}

function adicionarLinhaDivulgacao() {
    const container = document.getElementById('itemsContainer');
    const rowCount = container.querySelectorAll('.item-row').length;
    
    const itemRow = document.createElement('div');
    itemRow.className = 'item-row';
    itemRow.innerHTML = `
        <input type="text" placeholder="Peça de Divulgação" list="opcoesPecas">
        <datalist id="opcoesPecas">
            ${opcoesPecas.map(p => `<option value="${p}">`).join('')}
        </datalist>
        <input type="text" placeholder="Especificações Técnicas">
        <button type="button" class="btn-remove" onclick="this.parentElement.remove()">Remover</button>
    `;
    
    container.appendChild(itemRow);
}

// ========== FUNÇÕES DE SALVAMENTO ==========
function saveCurrentProject() {
    const nome = document.getElementById('projNome').value.trim();
    const categoria = document.getElementById('projCategoria').value;
    const dataInicio = document.getElementById('projDataInicio').value;
    const dataTermino = document.getElementById('projDataTermino').value;
    
    if (!nome || !dataInicio || !dataTermino) {
        alert('Por favor, preencha Nome do Projeto, Data Início e Data Término');
        return;
    }
    
    const projeto = {
        id: currentProjectId || Date.now(),
        nome,
        categoria,
        dataInicio,
        dataTermino,
        objetivo: document.getElementById('projObjetivo').value,
        sinopse: document.getElementById('projSinopse').value,
        publico: document.getElementById('projPublico').value,
        justificativa: document.getElementById('projJustificativa').value,
        comoRealizado: document.getElementById('projComoRealizado').value,
        narrativa: document.getElementById('projNarrativa').value,
        genero: document.getElementById('specGenero').value,
        formato: document.getElementById('specFormato').value,
        tarefas: [...tarefasData.pre, ...tarefasData.prod, ...tarefasData.pos],
        orcamento: budgetItems,
        planoEstrategias: document.getElementById('planoEstrategias').value,
        planoAcoes: document.getElementById('planoAcoes').value,
        dataCriacao: new Date().toISOString()
    };
    
    let projetos = JSON.parse(localStorage.getItem('cultureProjects') || '[]');
    
    if (currentProjectId) {
        projetos = projetos.map(p => p.id === currentProjectId ? projeto : p);
    } else {
        projetos.push(projeto);
    }
    
    localStorage.setItem('cultureProjects', JSON.stringify(projetos));
    
    alert('Projeto salvo com sucesso!');
    closeProjectModal();
    loadProjects();
    renderCalendar();
}

// ========== FUNÇÕES DE CARREGAMENTO E VISUALIZAÇÃO ==========
function loadProjects() {
    const projetos = JSON.parse(localStorage.getItem('cultureProjects') || '[]');
    const grid = document.getElementById('projectsGrid');
    
    if (!grid) return;
    
    if (projetos.length === 0) {
        grid.innerHTML = '<div class="no-projects">📭 Nenhum projeto cadastrado. Clique em "+ Criar Projeto" para começar!</div>';
        return;
    }
    
    grid.innerHTML = projetos.map(proj => `
        <div class="project-card">
            <h4>${proj.nome}</h4>
            <div class="project-category">${proj.categoria}</div>
            <div class="project-dates">
                📅 ${new Date(proj.dataInicio).toLocaleDateString('pt-BR')} - ${new Date(proj.dataTermino).toLocaleDateString('pt-BR')}
            </div>
            <div class="project-actions">
                <button class="btn-view" onclick="viewProject('${proj.id}')">👁️ Ver</button>
                <button class="btn-edit" onclick="editProject('${proj.id}')">✏️ Editar</button>
                <button class="btn-print" onclick="printProject('${proj.id}')">🖨️ Imprimir</button>
                <button class="btn-delete" onclick="deleteProject('${proj.id}')">🗑️ Deletar</button>
            </div>
        </div>
    `).join('');
}

function viewProject(id) {
    const projetos = JSON.parse(localStorage.getItem('cultureProjects') || '[]');
    const projeto = projetos.find(p => p.id == id);
    
    if (!projeto) return;
    
    alert(`Projeto: ${projeto.nome}\n\nCategoria: ${projeto.categoria}\nPeriodo: ${projeto.dataInicio} até ${projeto.dataTermino}\n\nTotal de Tarefas: ${projeto.tarefas?.length || 0}`);
}

function editProject(id) {
    const projetos = JSON.parse(localStorage.getItem('cultureProjects') || '[]');
    const projeto = projetos.find(p => p.id == id);
    
    if (!projeto) return;
    
    currentProjectId = projeto.id;
    
    document.getElementById('projNome').value = projeto.nome;
    document.getElementById('projCategoria').value = projeto.categoria;
    document.getElementById('projDataInicio').value = projeto.dataInicio;
    document.getElementById('projDataTermino').value = projeto.dataTermino;
    document.getElementById('projObjetivo').value = projeto.objetivo || '';
    document.getElementById('projSinopse').value = projeto.sinopse || '';
    document.getElementById('projPublico').value = projeto.publico || '';
    document.getElementById('projJustificativa').value = projeto.justificativa || '';
    document.getElementById('projComoRealizado').value = projeto.comoRealizado || '';
    document.getElementById('projNarrativa').value = projeto.narrativa || '';
    
    tarefasData = {
        pre: projeto.tarefas?.filter(t => t.fase === 'pre') || [],
        prod: projeto.tarefas?.filter(t => t.fase === 'prod') || [],
        pos: projeto.tarefas?.filter(t => t.fase === 'pos') || []
    };
    
    budgetItems = projeto.orcamento || [];
    itemCount = budgetItems.length;
    
    document.getElementById('modalTitle').textContent = 'Editar Projeto';
    renderCronograma();
    renderBudgetContainer();
    renderEspecificacoes();
    
    document.getElementById('projectModal').style.display = 'flex';
}

function deleteProject(id) {
    if (!confirm('Tem certeza que deseja deletar este projeto?')) return;
    
    let projetos = JSON.parse(localStorage.getItem('cultureProjects') || '[]');
    projetos = projetos.filter(p => p.id != id);
    localStorage.setItem('cultureProjects', JSON.stringify(projetos));
    
    loadProjects();
    renderCalendar();
}

function printProject(id) {
    const projetos = JSON.parse(localStorage.getItem('cultureProjects') || '[]');
    const projeto = projetos.find(p => p.id == id);
    
    if (!projeto) return;
    
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(`
        <html><head><title>${projeto.nome}</title></head><body>
        <h1>${projeto.nome}</h1>
        <p><strong>Categoria:</strong> ${projeto.categoria}</p>
        <p><strong>Período:</strong> ${projeto.dataInicio} a ${projeto.dataTermino}</p>
        <p><strong>Objetivo:</strong> ${projeto.objetivo || 'Não informado'}</p>
        <h2>Tarefas</h2>
        <ul>${(projeto.tarefas || []).map(t => `<li>${t.nome} - ${t.responsavel}</li>`).join('')}</ul>
        </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
}

function imprimirCronograma() {
    alert('Função de impressão do cronograma em desenvolvimento');
}

function imprimirOrcamento() {
    alert('Função de impressão do orçamento em desenvolvimento');
}

function showTaskStatus(taskName, status) {
    const newStatus = status === 'completed' ? 'pending' : 'completed';
    alert(`Tarefa: ${taskName}\nStatus atual: ${status}\n\nFuncionalidade de atualização em desenvolvimento`);
}

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', function() {
    renderCalendar();
    loadProjects();
    renderEspecificacoes();
});

// Fechar modal ao clicar fora
window.addEventListener('click', function(event) {
    const modal = document.getElementById('projectModal');
    if (event.target === modal) {
        closeProjectModal();
    }
});
