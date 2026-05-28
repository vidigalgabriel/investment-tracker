const appRoute = document.getElementById('app');
const API_URL = 'http://localhost:3000/api';

async function renderDashboard() {
  appRoute.innerHTML = '<h2>Carregando carteiras...</h2>';
  
  try {
    const res = await fetch(`${API_URL}/wallets`);
    if (!res.ok) throw new Error('Erro ao buscar carteiras');
    const wallets = await res.json();
    
    let html = `
      <h3>Minhas Carteiras</h3>
      <button onclick="renderWalletForm()">+ Nova Carteira</button>
      <div style="margin-top: 15px;">
    `;
    
    if (!wallets || wallets.length === 0) {
      html += '<p style="color: #888;">Nenhuma carteira encontrada. Crie a primeira!</p>';
    } else {
      wallets.forEach(wallet => {
        html += `
          <div class="card" onclick="renderWalletDetails('${wallet._id}')">
            <h4>📁 ${wallet.nome}</h4>
            <p>${wallet.descricao || 'Sem descrição'}</p>
            <button class="btn-danger" onclick="event.stopPropagation(); deleteWallet('${wallet._id}')">Excluir</button>
          </div>
        `;
      });
    }
    
    html += '</div>';
    appRoute.innerHTML = html;
  } catch (error) {
    appRoute.innerHTML = '<p>Erro ao carregar dados do servidor.</p>';
  }
}

function renderWalletForm() {
  appRoute.innerHTML = `
    <h3>Nova Carteira</h3>
    <input type="text" id="nome" placeholder="Nome da Carteira (Ex: Cripto, Ações)">
    <input type="text" id="descricao" placeholder="Descrição">
    <button onclick="saveWallet()">Salvar</button>
    <button class="btn-secondary" onclick="renderDashboard()">Voltar</button>
  `;
}

async function saveWallet() {
  const nome = document.getElementById('nome').value;
  const descricao = document.getElementById('descricao').value;

  if (!nome) {
    alert('O nome é obrigatório!');
    return;
  }

  await fetch(`${API_URL}/wallets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, descricao })
  });

  renderDashboard();
}

async function deleteWallet(id) {
  if (confirm('Deseja mesmo excluir esta carteira?')) {
    await fetch(`${API_URL}/wallets/${id}`, { method: 'DELETE' });
    renderDashboard();
  }
}

async function renderWalletDetails(walletId) {
  appRoute.innerHTML = '<h2>Carregando detalhes...</h2>';
  
  try {
    const res = await fetch(`${API_URL}/wallets/${walletId}`);
    if (!res.ok) throw new Error('Erro ao buscar detalhes da carteira');
    const data = await res.json();
    
    let html = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h3>📁 Carteira: ${data.nome}</h3>
        <button class="btn-secondary" onclick="renderDashboard()">← Voltar ao Dashboard</button>
      </div>
      <p><em>${data.descricao || 'Sem descrição'}</em></p>
      
      <div class="flex-container">
        <div class="box">
          <h4>Ativos Consolidados</h4>
          <table>
            <thead>
              <tr>
                <th>Ativo</th>
                <th>Quantidade</th>
                <th>Custo Médio</th>
                <th>Custo Total</th>
              </tr>
            </thead>
            <tbody>
    `;
    
    const ativos = Object.keys(data.posicao);
    if (ativos.length === 0) {
      html += '<tr><td colspan="4" style="color:#888; text-align:center;">Nenhum ativo nesta carteira.</td></tr>';
    } else {
      ativos.forEach(ativo => {
        const item = data.posicao[ativo];
        if (item.quantidade > 0) {
          html += `
            <tr>
              <td><strong>${ativo}</strong></td>
              <td>${item.quantidade}</td>
              <td>R$ ${item.custoMedio.toFixed(2)}</td>
              <td>R$ ${item.custoTotal.toFixed(2)}</td>
            </tr>
          `;
        }
      });
    }
    
    html += `
            </tbody>
          </table>
        </div>
        
        <div class="box">
          <h4>Registrar Operação</h4>
          <label>Ativo</label>
          <input type="text" id="ativo" placeholder="Ex: BTC, PETR4, SOL">
          
          <label>Tipo</label>
          <select id="tipo">
            <option value="COMPRA">COMPRA</option>
            <option value="VENDA">VENDA</option>
          </select>
          
          <label>Quantidade</label>
          <input type="number" id="quantidade" min="1" step="any" placeholder="0">
          
          <label>Preço Unitário (R$)</label>
          <input type="number" id="preco" min="0.01" step="any" placeholder="0.00">
          
          <button onclick="saveTransaction('${walletId}')">Confirmar Transação</button>
        </div>
      </div>
    `;
    
    appRoute.innerHTML = html;
  } catch (error) {
    appRoute.innerHTML = '<p>Erro ao carregar detalhes da carteira.</p>';
  }
}

async function saveTransaction(carteiraId) {
  const ativo = document.getElementById('ativo').value;
  const tipo = document.getElementById('tipo').value;
  const quantidade = parseFloat(document.getElementById('quantidade').value);
  const preco = parseFloat(document.getElementById('preco').value);

  if (!ativo || !quantidade || !preco) {
    alert('Preencha todos os campos da transação!');
    return;
  }

  const res = await fetch(`${API_URL}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ carteiraId, ativo, tipo, quantidade, preco })
  });

  if (!res.ok) {
    const errorData = await res.json();
    alert(`Erro: ${errorData.message}`);
    return;
  }

  renderWalletDetails(carteiraId);
}

renderDashboard();