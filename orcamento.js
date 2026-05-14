// ========== ORÇAMENTO - ESTRUTURA POR CATEGORIAS ==========

const budgetStructure = [
  { id: "1", name: "Pessoal - Profissionais da Área", items: [] },
  { id: "2", name: "Pessoal - Demais Prestadores de Serviços", items: [] },
  { id: "3", name: "Equipamentos / Material / Estrutura", items: [] },
  { id: "4", name: "Logística", items: [] },
  { id: "5", name: "Divulgação, Mídia e Comunicação", items: [] },
  { id: "6", name: "Ações de Acessibilidade", items: [] },
  { id: "7", name: "Custos Administrativos", items: [] },
  { id: "8", name: "Taxas e Seguros", items: [] }
];

// Unidades disponíveis
const unidades = ["mês", "projeto", "dia", "semana", "unidade", "cache", "item"];

function getItemCode(catIndex, itemIndex) {
  return `${catIndex + 1}.${itemIndex + 1}`;
}

function calculateSubtotal(quantidade, quantidadeUnidade, valorUnitario) {
  const qtd = parseFloat(quantidade) || 0;
  const qtdUnid = parseFloat(quantidadeUnidade) || 0;
  const valor = parseFloat(valorUnitario) || 0;
  return qtd * qtdUnid * valor;
}

function renderBudget() {
  const container = document.getElementById('budgetContainer');
  if (!container) return;

  let grandTotal = 0;
  let html = '';

  budgetStructure.forEach((category, catIndex) => {
    let categoryTotal = 0;
    const items = category.items;

    html += `<div class="budget-category">
              <h3>${category.id} - ${category.name}</h3>
              <table class="budget-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th style="width: 30%">Descrição</th>
                    <th>Quantidade</th>
                    <th>Unidade</th>
                    <th>Quant. de Unidade</th>
                    <th>Valor Unitário (R$)</th>
                    <th>Subtotal (R$)</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>`;

    items.forEach((item, itemIndex) => {
      const code = getItemCode(catIndex, itemIndex);
      const qtd = item.quantidade || 0;
      const qtdUnid = item.quantidadeUnidade || 0;
      const valor = item.valorUnitario || 0;
      const subtotal = calculateSubtotal(qtd, qtdUnid, valor);
      categoryTotal += subtotal;
      grandTotal += subtotal;

      html += `<tr>
        <td>${code}</td>
        <td><input type="text" value="${escapeHtml(item.descricao || '')}" onchange="updateBudgetItem(${catIndex}, ${itemIndex}, 'descricao', this.value)"></td>
        <td><input type="number" value="${qtd}" step="0.01" onchange="updateBudgetItem(${catIndex}, ${itemIndex}, 'quantidade', parseFloat(this.value) || 0)"></td>
        <td>
          <select onchange="updateBudgetItem(${catIndex}, ${itemIndex}, 'unidade', this.value)">
            ${unidades.map(un => `<option value="${un}" ${item.unidade === un ? 'selected' : ''}>${un}</option>`).join('')}
          </select>
        </td>
        <td><input type="number" value="${qtdUnid}" step="0.01" onchange="updateBudgetItem(${catIndex}, ${itemIndex}, 'quantidadeUnidade', parseFloat(this.value) || 0)"></td>
        <td><input type="number" value="${valor}" step="0.01" onchange="updateBudgetItem(${catIndex}, ${itemIndex}, 'valorUnitario', parseFloat(this.value) || 0)"></td>
        <td class="subtotal">R$ ${subtotal.toFixed(2)}</td>
        <td><button onclick="removeBudgetItem(${catIndex}, ${itemIndex})">🗑️</button></td>
      </tr>`;
    });

    html += `<tr class="category-total">
              <td colspan="6" style="text-align: right;"><strong>Subtotal da Categoria</strong></td>
              <td colspan="2"><strong>R$ ${categoryTotal.toFixed(2)}</strong></td>
             </tr>`;

    html += `</tbody>
           </table>
           <button class="btn-add-row" onclick="addBudgetItem(${catIndex})">+ Adicionar Item à Categoria ${category.id}</button>
         </div><br>`;
  });

  html += `<div class="grand-total">💰 TOTAL DA PROPOSTA: R$ ${grandTotal.toFixed(2)}</div>`;
  container.innerHTML = html;
}

function addBudgetItem(categoryIndex) {
  budgetStructure[categoryIndex].items.push({
    descricao: '',
    quantidade: 0,
    unidade: 'unidade',
    quantidadeUnidade: 1,
    valorUnitario: 0
  });
  renderBudget();
}

function updateBudgetItem(catIndex, itemIndex, field, value) {
  const item = budgetStructure[catIndex].items[itemIndex];
  if (item) {
    item[field] = value;
    renderBudget();
  }
}

function removeBudgetItem(catIndex, itemIndex) {
  if (confirm('Remover este item do orçamento?')) {
    budgetStructure[catIndex].items.splice(itemIndex, 1);
    renderBudget();
  }
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Inicializa com alguns exemplos
window.onload = () => {
  if (budgetStructure[0].items.length === 0) {
    budgetStructure[0].items.push({
      descricao: 'Coordenador de Projetos',
      quantidade: 1,
      unidade: 'mês',
      quantidadeUnidade: 6,
      valorUnitario: 5000
    });
    budgetStructure[0].items.push({
      descricao: 'Assistente Administrativo',
      quantidade: 1,
      unidade: 'mês',
      quantidadeUnidade: 6,
      valorUnitario: 2500
    });
  }
  renderBudget();
};