const mainApp = document.getElementById('main-app');
const API = '/api';

async function loadWallets() {
  mainApp.innerHTML = '<p>Buscando carteiras...</p>';
  try {
    const res = await fetch(`${API}/wallets`);
    const wallets = await res.json();
    
    let patrimonioTotal = 0;
    let lucroGeralAcumulado = 0;
    let totalTransacoesGeral = 0;

    const walletPromises = wallets.map(w => fetch(`${API}/wallets/${w._id}`).then(r => r.json()));
    const fullWalletsData = await Promise.all(walletPromises);

    fullWalletsData.forEach(w => {
      if (w.posicao) {
        Object.keys(w.posicao).forEach(ticker => {
          patrimonioTotal += w.posicao[ticker].custoTotal || 0;
          lucroGeralAcumulado += w.posicao[ticker].lucroTotal || 0;
        });
      }
      totalTransacoesGeral += w.transacoes ? w.transacoes.length : 0;
    });

    let html = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px;">
        <div class="form-group" style="margin-top:0; text-align:center; border-top: 4px solid #deff9a;">
          <small style="color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">Patrimônio Atual</small>
          <h2 style="font-size: 32px; margin: 10px 0 0 0; color: #deff9a;">R$ ${patrimonioTotal.toFixed(2)}</h2>
        </div>
        <div class="form-group" style="margin-top:0; text-align:center; border-top: 4px solid ${lucroGeralAcumulado >= 0 ? '#4caf50' : '#f44336'};">
          <small style="color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">Lucro Total Fechado</small>
          <h2 style="font-size: 32px; margin: 10px 0 0 0; color: ${lucroGeralAcumulado >= 0 ? '#4caf50' : '#f44336'};">R$ ${lucroGeralAcumulado.toFixed(2)}</h2>
        </div>
        <div class="form-group" style="margin-top:0; text-align:center; border-top: 4px solid #a855f7;">
          <small style="color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">Total de Operações</small>
          <h2 style="font-size: 32px; margin: 10px 0 0 0; color: #fff;">${totalTransacoesGeral}</h2>
        </div>
      </div>
    `;

    html += '<div class="grid">';
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
            <thead><tr><th>Ativo</th><th>Qtd</th><th>Média</th><th>Total</th><th>Lucro Realizado</th></tr></thead>
            <tbody>
              ${Object.keys(data.posicao).map(ticker => {
                const lucro = data.posicao[ticker].lucroTotal || 0;
                const corLucro = lucro > 0 ? '#4caf50' : (lucro < 0 ? '#f44336' : '#fff');
                return `
                  <tr>
                    <td>${ticker}</td>
                    <td>${data.posicao[ticker].quantidade}</td>
                    <td>R$ ${data.posicao[ticker].custoMedio.toFixed(2)}</td>
                    <td>R$ ${data.posicao[ticker].custoTotal.toFixed(2)}</td>
                    <td style="color: ${corLucro}; font-weight: bold;">R$ ${lucro.toFixed(2)}</td>
                  </tr>
                `;
              }).join('') || '<tr><td colspan="5">Nenhum ativo em carteira</td></tr>'}
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
          ${transactions.map(tx => {
            let infoLucro = '';
            if (tx.tipo === 'VENDA' && tx.lucroRealizado !== undefined) {
              const corTxLucro = tx.lucroRealizado >= 0 ? '#4caf50' : '#f44336';
              infoLucro = ` <span style="color: ${corTxLucro}; font-size: 14px;">(Lucro: R$ ${tx.lucroRealizado.toFixed(2)})</span>`;
            }
            return `
              <div style="padding: 10px 0; border-bottom: 1px solid #333; display: flex; justify-content: space-between;">
                <span>
                  ${tx.tipo === 'COMPRA' ? '<b style="color: #4caf50;">🟢 COMPRA</b>' : '<b style="color: #f44336;">🔴 VENDA</b>'} 
                  de ${tx.quantidade} ${tx.ativo} @ R$ ${tx.preco.toFixed(2)} ${infoLucro}
                </span>
                <span style="color: #888;">${new Date(tx.data || Date.now()).toLocaleDateString('pt-BR')}</span>
              </div>
            `;
          }).join('') || '<p style="color: #888;">Nenhuma transação realizada nesta carteira.</p>'}
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