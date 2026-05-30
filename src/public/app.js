const mainApp = document.getElementById('main-app');
const API = '/api';

async function loadWallets() {
  mainApp.innerHTML = '<p>Buscando carteiras...</p>';
  try {
    const res = await fetch(`${API}/wallets`);
    const wallets = await res.json();
    let html = '<div class="grid">';
    wallets.forEach(w => {
      html += `
        <div class="wallet-card" onclick="viewWallet('${w._id}')">
          <h3><i class="fa-solid fa-folder"></i> ${w.nome}</h3>
          <p>${w.descricao || 'Sem descrição'}</p>
          <div class="actions">
            <button class="btn btn-danger" onclick="event.stopPropagation(); deleteWallet('${w._id}')">Excluir</button>
          </div>
        </div>`;
    });
    html += '</div>';
    mainApp.innerHTML = wallets.length ? html : '<p>Nenhuma carteira. Crie a primeira!</p>';
  } catch (e) { mainApp.innerHTML = '<p>Erro de conexão com a API.</p>'; }
}

async function viewWallet(id) {
  mainApp.innerHTML = '<p>Carregando dados da carteira...</p>';
  try {
    const resWallet = await fetch(`${API}/wallets/${id}`);
    if (!resWallet.ok) throw new Error();
    const data = await resWallet.json();

    const transactions = data.transacoes || [];
    
    mainApp.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
        <h2>Carteira: ${data.nome}</h2>
        <button class="btn btn-secondary" onclick="loadWallets()">Voltar</button>
      </div>
      <div class="grid">
        <div class="form-group">
          <h3>Ativos Atuais</h3>
          <table>
            <thead><tr><th>Ativo</th><th>Qtd</th><th>Média</th><th>Total</th></tr></thead>
            <tbody>
              ${Object.keys(data.posicao).map(ticker => `
                <tr><td>${ticker}</td><td>${data.posicao[ticker].quantidade}</td><td>R$ ${data.posicao[ticker].custoMedio.toFixed(2)}</td><td>R$ ${data.posicao[ticker].custoTotal.toFixed(2)}</td></tr>
              `).join('') || '<tr><td colspan="4">Nenhum ativo em carteira</td></tr>'}
            </tbody>
          </table>
        </div>
        <div class="form-group">
          <h3>Nova Transação</h3>
          <input type="text" id="t-ativo" placeholder="Ticker (ex: BTC)">
          <select id="t-tipo"><option value="COMPRA">COMPRA</option><option value="VENDA">VENDA</option></select>
          <input type="number" id="t-qtd" placeholder="Quantidade">
          <input type="number" id="t-preco" placeholder="Preço">
          <button class="btn btn-primary" onclick="addTransaction('${id}')">Confirmar</button>
        </div>
      </div>
      <div class="form-group" style="margin-top: 30px;">
        <h3>Histórico de Movimentações (Extrato)</h3>
        <div class="timeline" style="background: #1e1e1e; padding: 15px; border-radius: 8px;">
          ${transactions.map(tx => `
            <div style="padding: 10px 0; border-bottom: 1px solid #333; display: flex; justify-content: space-between;">
              <span>
                ${tx.tipo === 'COMPRA' ? '<b style="color: #4caf50;">🟢 COMPRA</b>' : '<b style="color: #f44336;">🔴 VENDA</b>'} 
                de ${tx.quantidade} ${tx.ativo} @ R$ ${tx.preco.toFixed(2)}
              </span>
              <span style="color: #888;">${new Date(tx.data || Date.now()).toLocaleDateString('pt-BR')}</span>
            </div>
          `).join('') || '<p style="color: #888;">Nenhuma transação realizada nesta carteira.</p>'}
        </div>
      </div>`;
  } catch (e) { alert('Erro ao abrir detalhes.'); loadWallets(); }
}

async function addTransaction(walletId) {
  const data = {
    carteiraId: walletId,
    ativo: document.getElementById('t-ativo').value.toUpperCase(),
    tipo: document.getElementById('t-tipo').value,
    quantidade: Number(document.getElementById('t-qtd').value),
    preco: Number(document.getElementById('t-preco').value)
  };
  const res = await fetch(`${API}/transactions`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
  });
  if (res.ok) viewWallet(walletId);
  else { const err = await res.json(); alert(err.message); }
}

function showWalletForm() {
  mainApp.innerHTML = `
    <div class="form-group">
      <h2>Nova Carteira</h2>
      <input type="text" id="w-nome" placeholder="Nome">
      <input type="text" id="w-desc" placeholder="Descrição">
      <button class="btn btn-primary" onclick="createWallet()">Criar</button>
      <button class="btn btn-secondary" onclick="loadWallets()">Cancelar</button>
    </div>`;
}

async function createWallet() {
  await fetch(`${API}/wallets`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ nome: document.getElementById('w-nome').value, descricao: document.getElementById('w-desc').value })
  });
  loadWallets();
}

async function deleteWallet(id) {
  if (confirm('Excluir?')) { await fetch(`${API}/wallets/${id}`, { method: 'DELETE' }); loadWallets(); }
}

loadWallets();