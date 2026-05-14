// ========== CRONOGRAMA - FUNCIONALIDADES ==========

let currentEditingTarefa = null;

function renderCronograma() {
    const container = document.getElementById('cronogramaContainer');
    if (!container) return;

    loadResponsaveisOptions('novaTarefaResp');
    loadResponsaveisOptions('editTarefaResp');
    
    const fases = {
        pre: 'Pré-Produção',
        prod: 'Produção',
        pos: 'Pós-Produção'
    };
    
    const coresPadrao = {
        pre: '#ffc107',
        prod: '#17a2b8',
        pos: '#6f42c1'
    };
    
    let html = '';
    const hoje = new Date();
    
    for (const [key, label] of Object.entries(fases)) {
        const tarefas = window.currentTarefas?.[key] || [];
        html += `
            <div class="fase-coluna">
                <div class="fase-titulo" style="border-bottom-color: ${coresPadrao[key]};">${label}</div>
                <div class="tarefas-list">
                    ${tarefas.length === 0 ? '<div class="empty-tasks">📭 Nenhuma tarefa</div>' : ''}
                    ${tarefas.map((tarefa, idx) => {
                        const dataInicio = tarefa.dataInicio ? new Date(tarefa.dataInicio) : null;
                        const dataFim = tarefa.dataTermino ? new Date(tarefa.dataTermino) : null;
                        let corStatus = coresPadrao[key];
                        let prazoTexto = '';
                        if (dataInicio && dataFim) {
                            const diferencaDias = Math.ceil((dataFim - hoje) / (1000 * 60 * 60 * 24));
                            prazoTexto = `Início: ${escapeHtml(tarefa.dataInicio)} • Fim: ${escapeHtml(tarefa.dataTermino)}`;
                            if (dataFim.toDateString() === hoje.toDateString()) {
                                corStatus = '#28a745';
                            } else if (diferencaDias >= 1 && diferencaDias <= 5) {
                                corStatus = '#dc3545';
                            } else if (diferencaDias >= 6 && diferencaDias <= 15) {
                                corStatus = '#ffc107';
                            } else if (diferencaDias > 15) {
                                corStatus = '#0d6efd';
                            } else {
                                corStatus = '#6c757d';
                            }
                        }
                        return `
                        <div class="tarefa-item ${tarefa.concluida ? 'concluida' : ''}" style="border-left-color: ${corStatus};">
                            <div class="tarefa-info">
                                <div class="tarefa-nome">${escapeHtml(tarefa.nome) || 'Sem nome'}</div>
                                <div class="tarefa-resp">
                                    ${tarefa.responsavel ? `<span>👤 ${escapeHtml(tarefa.responsavel)}</span>` : ''}
                                    ${prazoTexto ? `<span>📅 ${prazoTexto}</span>` : ''}
                                </div>
                            </div>
                            <div class="tarefa-actions">
                                <button onclick="toggleTarefaStatus('${key}', ${idx})" title="${tarefa.concluida ? 'Marcar como pendente' : 'Marcar como concluída'}">
                                    ${tarefa.concluida ? '🔄' : '✅'}
                                </button>
                                <button onclick="openEditTarefa('${key}', ${idx})" title="Editar tarefa">✏️</button>
                                <button onclick="removeTarefa('${key}', ${idx})" title="Remover tarefa">🗑️</button>
                            </div>
                        </div>`;
                    }).join('')}
                </div>
            </div>
        `;
    }
    container.innerHTML = html;
}

function addTarefa() {
    const nomeInput = document.getElementById('novaTarefaNome');
    const faseSelect = document.getElementById('novaTarefaFase');
    const responsavelInput = document.getElementById('novaTarefaResp');
    const inicioInput = document.getElementById('novaTarefaInicio');
    const fimInput = document.getElementById('novaTarefaFim');
    
    const nome = nomeInput?.value.trim();
    if (!nome) {
        alert('Digite o nome da tarefa!');
        return;
    }
    
    const fase = faseSelect?.value;
    const responsavel = responsavelInput?.value || '';
    const dataInicio = inicioInput?.value || '';
    const dataTermino = fimInput?.value || '';
    
    if (!window.currentTarefas[fase]) window.currentTarefas[fase] = [];
    
    window.currentTarefas[fase].push({
        nome: nome,
        responsavel: responsavel,
        dataInicio: dataInicio,
        dataTermino: dataTermino,
        concluida: false
    });
    
    if (nomeInput) nomeInput.value = '';
    if (responsavelInput) responsavelInput.value = '';
    if (inicioInput) inicioInput.value = '';
    if (fimInput) fimInput.value = '';
    
    renderCronograma();
}

function openEditTarefa(fase, index) {
    const tarefa = window.currentTarefas?.[fase]?.[index];
    if (!tarefa) return;
    currentEditingTarefa = { fase, index };
    document.getElementById('editTarefaNome').value = tarefa.nome || '';
    document.getElementById('editTarefaFase').value = fase;
    document.getElementById('editTarefaResp').value = tarefa.responsavel || '';
    document.getElementById('editTarefaInicio').value = tarefa.dataInicio || '';
    document.getElementById('editTarefaFim').value = tarefa.dataTermino || '';
    document.getElementById('editTarefaModal').classList.remove('hidden');
}

function saveEditTarefa() {
    if (!currentEditingTarefa) return;
    const { fase, index } = currentEditingTarefa;
    const tarefa = window.currentTarefas?.[fase]?.[index];
    if (!tarefa) return;

    const nome = document.getElementById('editTarefaNome').value.trim();
    const novaFase = document.getElementById('editTarefaFase').value;
    const responsavel = document.getElementById('editTarefaResp').value || '';
    const dataInicio = document.getElementById('editTarefaInicio').value || '';
    const dataTermino = document.getElementById('editTarefaFim').value || '';
    
    if (!nome) {
        alert('Digite o nome da tarefa!');
        return;
    }

    const updatedTarefa = {
        ...tarefa,
        nome,
        responsavel,
        dataInicio,
        dataTermino
    };

    if (novaFase === fase) {
        window.currentTarefas[fase][index] = updatedTarefa;
    } else {
        window.currentTarefas[fase].splice(index, 1);
        if (!window.currentTarefas[novaFase]) window.currentTarefas[novaFase] = [];
        window.currentTarefas[novaFase].push(updatedTarefa);
    }

    cancelEditTarefa();
    renderCronograma();
}

function cancelEditTarefa() {
    currentEditingTarefa = null;
    const modal = document.getElementById('editTarefaModal');
    if (modal) modal.classList.add('hidden');
}

function loadResponsaveisOptions(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const ativos = users.filter(user => user.status !== 'bloqueado');
    const currentValue = select.value;
    select.innerHTML = '<option value="">Selecione o responsável</option>';
    ativos.forEach(user => {
        const option = document.createElement('option');
        option.value = user.nome;
        option.textContent = user.nome;
        select.appendChild(option);
    });
    if (currentValue) select.value = currentValue;
}

function toggleTarefaStatus(fase, index) {
    if (window.currentTarefas[fase] && window.currentTarefas[fase][index]) {
        window.currentTarefas[fase][index].concluida = !window.currentTarefas[fase][index].concluida;
        renderCronograma();
    }
}

function removeTarefa(fase, index) {
    if (window.currentTarefas[fase]) {
        if (confirm('Remover esta tarefa?')) {
            window.currentTarefas[fase].splice(index, 1);
            renderCronograma();
        }
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}