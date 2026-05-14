// ========== PLANO DE DIVULGAÇÃO - FUNCIONALIDADES ==========

// Estrutura dinâmica para peças de divulgação
let divulgacaoPecas = [];

function renderDivulgacaoPecas() {
    const container = document.getElementById('pecasDivulgacaoContainer');
    if (!container) return;

    if (divulgacaoPecas.length === 0) {
        container.innerHTML = `
            <p style="color: #999; text-align: center; padding: 1rem;">Nenhuma peça cadastrada. Clique em "Adicionar Peça" para começar.</p>
            <button class="btn-add-row" onclick="addDivulgacaoPeca()" style="margin-top: 0.5rem; width: 100%;">+ Adicionar Peça de Divulgação</button>
        `;
        return;
    }

    let html = '';
    divulgacaoPecas.forEach((peca, index) => {
        html += `
            <div class="peca-divulgacao-item" style="margin-bottom: 1rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; background: #f9f9f9;">
                <div style="display: grid; grid-template-columns: 1fr 1fr auto; gap: 1rem; align-items: start;">
                    <!-- Coluna: Peça de Divulgação -->
                    <div>
                        <label style="font-weight: bold; display: block; margin-bottom: 0.25rem;">🎨 Peça de Divulgação ${index + 1}</label>
                        <input type="text" 
                               value="${escapeHtml(peca.nome)}" 
                               onchange="updateDivulgacaoPeca(${index}, 'nome', this.value)" 
                               placeholder="Ex: Banner, Folder, Spot de rádio, Post para redes sociais..."
                               style="width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px;">
                    </div>
                    
                    <!-- Coluna: Especificações Técnicas -->
                    <div>
                        <label style="font-weight: bold; display: block; margin-bottom: 0.25rem;">📐 Especificações Técnicas</label>
                        <textarea 
                            onchange="updateDivulgacaoPeca(${index}, 'especificacoes', this.value)" 
                            placeholder="Ex: Dimensões, formato, resolução, duração, cores, materiais..."
                            style="width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; resize: vertical; min-height: 60px;">${escapeHtml(peca.especificacoes)}</textarea>
                    </div>
                    
                    <!-- Coluna: Botão Remover -->
                    <div style="display: flex; align-items: flex-end;">
                        <button onclick="removeDivulgacaoPeca(${index})" style="background: #dc3545; color: white; border: none; border-radius: 4px; padding: 0.5rem 1rem; cursor: pointer; font-size: 0.9rem;">
                            🗑️ Remover
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    // Botão de adicionar fora do loop (aparece apenas uma vez)
    html += `<button class="btn-add-row" onclick="addDivulgacaoPeca()" style="margin-top: 1rem; width: 100%;">+ Adicionar Peça de Divulgação</button>`;
    
    container.innerHTML = html;
}

function addDivulgacaoPeca() {
    divulgacaoPecas.push({
        nome: '',
        especificacoes: ''
    });
    renderDivulgacaoPecas();
}

function updateDivulgacaoPeca(index, field, value) {
    if (divulgacaoPecas[index]) {
        divulgacaoPecas[index][field] = value;
    }
}

function removeDivulgacaoPeca(index) {
    if (confirm('Remover esta peça de divulgação?')) {
        divulgacaoPecas.splice(index, 1);
        renderDivulgacaoPecas();
    }
}

// Carregar dados salvos
function loadDivulgacaoData(data) {
    if (data) {
        document.getElementById('planoEstrategias').value = data.planoEstrategias || '';
        document.getElementById('planoAcoes').value = data.planoAcoes || '';
        
        if (data.divulgacaoPecas && Array.isArray(data.divulgacaoPecas)) {
            divulgacaoPecas = data.divulgacaoPecas;
        } else {
            divulgacaoPecas = [];
        }
        
        renderDivulgacaoPecas();
    }
}

// Salvar dados atuais
function getDivulgacaoData() {
    return {
        planoEstrategias: document.getElementById('planoEstrategias')?.value || '',
        planoAcoes: document.getElementById('planoAcoes')?.value || '',
        divulgacaoPecas: divulgacaoPecas
    };
}

function clearDivulgacaoForm() {
    document.getElementById('planoEstrategias').value = '';
    document.getElementById('planoAcoes').value = '';
    divulgacaoPecas = [];
    renderDivulgacaoPecas();
}

// Contadores de caracteres para os campos de texto longo
function setupCharCounters() {
    const fields = [
        { id: 'planoEstrategias', max: 500 },
        { id: 'planoAcoes', max: 500 }
    ];
    
    fields.forEach(field => {
        const textarea = document.getElementById(field.id);
        if (textarea && !textarea.parentNode.querySelector('.char-counter')) {
            const counter = document.createElement('small');
            counter.className = 'char-counter';
            counter.style.display = 'block';
            counter.style.textAlign = 'right';
            counter.style.color = '#666';
            counter.style.fontSize = '0.7rem';
            counter.style.marginTop = '4px';
            
            const updateCounter = () => {
                const length = textarea.value.length;
                counter.innerHTML = `${length} / ${field.max} caracteres`;
                if (length > field.max) {
                    counter.style.color = '#dc3545';
                    textarea.value = textarea.value.substring(0, field.max);
                    counter.innerHTML = `${field.max} / ${field.max} caracteres (limite atingido)`;
                } else {
                    counter.style.color = '#666';
                }
            };
            
            textarea.parentNode.appendChild(counter);
            textarea.addEventListener('input', updateCounter);
            updateCounter();
        }
    });
}

// Inicializar contadores quando o modal abrir
if (document.getElementById('projectModal')) {
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'style' && 
                document.getElementById('projectModal').style.display === 'block') {
                setupCharCounters();
                renderDivulgacaoPecas();
            }
        });
    });
    observer.observe(document.getElementById('projectModal'), { attributes: true });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
    
    // Botão de adicionar fora do loop (aparece apenas uma vez)
    html += `<button class="btn-add-row" onclick="addDivulgacaoPeca()" style="margin-top: 1rem; width: 100%;">+ Adicionar Peça de Divulgação</button>`;
    
    container.innerHTML = html;
}

function addDivulgacaoPeca() {
    divulgacaoPecas.push({
        nome: '',
        especificacoes: ''
    });
    renderDivulgacaoPecas();
}

function updateDivulgacaoPeca(index, field, value) {
    if (divulgacaoPecas[index]) {
        divulgacaoPecas[index][field] = value;
    }
}

function removeDivulgacaoPeca(index) {
    if (confirm('Remover esta peça de divulgação?')) {
        divulgacaoPecas.splice(index, 1);
        renderDivulgacaoPecas();
    }
}

// Carregar dados salvos
function loadDivulgacaoData(data) {
    if (data) {
        document.getElementById('planoEstrategias').value = data.planoEstrategias || '';
        document.getElementById('planoAcoes').value = data.planoAcoes || '';
        
        if (data.divulgacaoPecas && Array.isArray(data.divulgacaoPecas)) {
            divulgacaoPecas = data.divulgacaoPecas;
        } else {
            divulgacaoPecas = [];
        }
        
        renderDivulgacaoPecas();
    }
}

    html += `<button class="btn-add-row" onclick="addDivulgacaoPeca()" style="margin-top: 0.5rem;">+ Adicionar Peça de Divulgação</button>`;
    container.innerHTML = html;
}

function addDivulgacaoPeca() {
    divulgacaoPecas.push({
        nome: '',
        especificacoes: ''
    });
    renderDivulgacaoPecas();
}

function updateDivulgacaoPeca(index, field, value) {
    if (divulgacaoPecas[index]) {
        divulgacaoPecas[index][field] = value;
        // Não precisa re-renderizar para performance, mas opcional
        // renderDivulgacaoPecas();
    }
}

function removeDivulgacaoPeca(index) {
    if (confirm('Remover esta peça de divulgação?')) {
        divulgacaoPecas.splice(index, 1);
        renderDivulgacaoPecas();
    }
}

// Carregar dados salvos
function loadDivulgacaoData(data) {
    if (data) {
        document.getElementById('planoEstrategias').value = data.planoEstrategias || '';
        document.getElementById('planoAcoes').value = data.planoAcoes || '';
        
        if (data.divulgacaoPecas && Array.isArray(data.divulgacaoPecas)) {
            divulgacaoPecas = data.divulgacaoPecas;
        } else {
            divulgacaoPecas = [];
        }
        
        renderDivulgacaoPecas();
    }
}

// Salvar dados atuais
function getDivulgacaoData() {
    return {
        planoEstrategias: document.getElementById('planoEstrategias')?.value || '',
        planoAcoes: document.getElementById('planoAcoes')?.value || '',
        divulgacaoPecas: divulgacaoPecas
    };
}

function clearDivulgacaoForm() {
    document.getElementById('planoEstrategias').value = '';
    document.getElementById('planoAcoes').value = '';
    divulgacaoPecas = [];
    renderDivulgacaoPecas();
}

// Contadores de caracteres para os campos de texto longo
function setupCharCounters() {
    const fields = [
        { id: 'planoEstrategias', max: 500 },
        { id: 'planoAcoes', max: 500 }
    ];
    
    fields.forEach(field => {
        const textarea = document.getElementById(field.id);
        if (textarea && !textarea.parentNode.querySelector('.char-counter')) {
            const counter = document.createElement('small');
            counter.className = 'char-counter';
            counter.style.display = 'block';
            counter.style.textAlign = 'right';
            counter.style.color = '#666';
            counter.style.fontSize = '0.7rem';
            counter.style.marginTop = '4px';
            
            const updateCounter = () => {
                const length = textarea.value.length;
                counter.innerHTML = `${length} / ${field.max} caracteres`;
                if (length > field.max) {
                    counter.style.color = '#dc3545';
                    textarea.value = textarea.value.substring(0, field.max);
                    counter.innerHTML = `${field.max} / ${field.max} caracteres (limite atingido)`;
                } else {
                    counter.style.color = '#666';
                }
            };
            
            textarea.parentNode.appendChild(counter);
            textarea.addEventListener('input', updateCounter);
            updateCounter();
        }
    });
}

// Inicializar contadores quando o modal abrir
if (document.getElementById('projectModal')) {
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'style' && 
                document.getElementById('projectModal').style.display === 'block') {
                setupCharCounters();
                renderDivulgacaoPecas();
            }
        });
    });
    observer.observe(document.getElementById('projectModal'), { attributes: true });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}