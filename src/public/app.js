const mainApp = document.getElementById('main-app');
const API = '/api';

async function loadWallets() {
  mainApp.innerHTML = '<p>Buscando carteiras...</p>';
  try {
    // Busca dados gerais e detalhados para consolidar os totais
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

    // Visão 1: Painel inicial e listagem de carteiras
    let html = `
      <div style="background: #151f32; padding: 20px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #38bdf8;">
        <h3 style="margin-top: 0; color: #fff;">📊 Bem-vindo ao Investment Tracker</h3>
        <p style="color: #94a3b8; margin: 0; font-size: 14px; line-height: 1.6;">
          Esta é uma plataforma Single Page Application (SPA) para consolidação de ativos financeiros. Aqui você pode criar carteiras personalizadas e registrar suas ordens de compra e venda. O sistema calcula automaticamente o custo médio ponderado e computa o lucro real assim que uma posição é encerrada.
        </p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 30px; width: 100%;">
        <div class="form-group" style="margin-top:0; text-align:center; border-top: 4px solid #deff9a; background: #151f32;">
          <small style="color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">Patrimônio Atual</small>
          <h2 style="font-size: 28px; margin: 10px 0 0 0; color: #deff9a;">R$ ${patrimonioTotal.toFixed(2)}</h2>
        </div>
        <div class="form-group" style="margin-top:0; text-align:center; border-top: 4px solid ${lucroGeralAcumulado >= 0 ? '#4caf50' : '#f44336'}; background: #151f32;">
          <small style="color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">Lucro Total Fechado</small>
          <h2 style="font-size: 28px; margin: 10px 0 0 0; color: ${lucroGeralAcumulado >= 0 ? '#4caf50' : '#f44336'};">R$ ${lucroGeralAcumulado.toFixed(2)}</h2>
        </div>
        <div class="form-group" style="margin-top:0; text-align:center; border-top: 4px solid #a855f7; background: #151f32;">
          <small style="color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">Total de Operações</small>
          <h2 style="font-size: 28px; margin: 10px 0 0 0; color: #fff;">${totalTransacoesGeral}</h2>
        </div>
      </div>
      
      <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; width:100%;">
        <h2 style="margin:0;">Minhas Carteiras</h2>
        <button class="btn btn-primary" onclick="showWalletForm()">+ Nova Carteira</button>
      </div>
    `;

    html += '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; width: 100%;">';
    wallets.forEach(w => {
      html += `
        <div class="wallet-card" style="background: #151f32; min-width: 100%; box-sizing: border-box;" onclick="viewWallet('${w._id}')">
          <h3><i class="fa-solid fa-folder"></i> ${w.nome}</h3>
          <p style="color: #94a3b8;">${w.descricao || 'Sem descrição'}</p>
          <div class="actions" style="margin-top: 15px;">
            <button class="btn btn-danger" onclick="event.stopPropagation(); deleteWallet('${w._id}')">Excluir</button>
          </div>
        </div>`;
    });
    html += '</div>';
    mainApp.innerHTML = wallets.length ? html : '<div style="width:100%; text-align:center;"><p>Nenhuma carteira encontrada.</p><button class="btn btn-primary" onclick="showWalletForm()">Criar uma Carteira</button></div>';
  } catch (e) { mainApp.innerHTML = '<p>Erro de conexão com a API.</p>'; }
}

function showWalletForm() {
  // Visão 2: Formulário de cadastro de carteiras
  mainApp.innerHTML = `
    <div class="form-group" style="max-width: 600px; margin: 40px auto; background: #151f32; padding: 30px; border-radius: 8px;">
      <h2>Nova Carteira</h2>
      <div style="margin-bottom: 15px;">
        <label style="display:block; margin-bottom: 5px; color: #94a3b8;">Nome da Carteira</label>
        <input type="text" id="w-nome" placeholder="Ex: Criptomoedas ou Ações" style="width:100%; box-sizing:border-box;">
      </div>
      <div style="margin-bottom: 20px;">
        <label style="display:block; margin-bottom: 5px; color: #94a3b8;">Descrição</label>
        <input type="text" id="w-desc" placeholder="Ex: Ativos de alto risco" style="width:100%; box-sizing:border-box;">
      </div>
      <button class="btn btn-primary" onclick="createWallet()">Salvar Carteira</button>
      <button class="btn btn-secondary" onclick="loadWallets()" style="margin-left: 10px;">Cancelar</button>
    </div>`;
}

async function viewWallet(id) {
  mainApp.innerHTML = '<p>Carregando dados da carteira...</p>';
  try {
    const resWallet = await fetch(`${API}/wallets/${id}`);
    if (!resWallet.ok) throw new Error();
    const data = await resWallet.json();

    const transactions = data.transacoes || [];
    
    // Visão 3: Detalhes, ativos atuais e histórico da carteira
    mainApp.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px; width: 100%;">
        <h2>Carteira: ${data.nome}</h2>
        <div>
          <button class="btn btn-primary" onclick="openTransactionModal()" style="margin-right: 10px;">+ Nova Transação</button>
          <button class="btn btn-secondary" onclick="loadWallets()">Voltar</button>
        </div>
      </div>
      
      <div style="width: 100%; background: #151f32; padding: 20px; border-radius: 8px; box-sizing: border-box; margin-bottom: 30px; overflow-x: auto;">
        <h3>Ativos Atuais</h3>
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead>
            <tr style="border-bottom: 2px solid #334155; color: #94a3b8;">
              <th style="padding: 12px 8px;">Ativo</th>
              <th style="padding: 12px 8px;">Qtd</th>
              <th style="padding: 12px 8px;">Média de Compra</th>
              <th style="padding: 12px 8px;">Total Alocado</th>
              <th style="padding: 12px 8px;">Lucro Realizado (%)</th>
            </tr>
          </thead>
          <tbody>
            ${Object.keys(data.posicao).map(ticker => {
              const lucro = data.posicao[ticker].lucroTotal || 0;
              const custoTotalOriginal = data.posicao[ticker].custoTotal || 0;
              
              // Processamento da variação percentual
              let porcentagemLucro = 0;
              if (lucro !== 0) {
                const totalCompradoHistorico = custoTotalOriginal + (lucro < 0 ? Math.abs(lucro) : 0);
                porcentagemLucro = totalCompradoHistorico > 0 ? (lucro / totalCompradoHistorico) * 100 : 0;
              }

              const corLucro = lucro > 0 ? '#4caf50' : (lucro < 0 ? '#f44336' : '#fff');
              const sinalLucro = lucro > 0 ? '+' : '';
              
              return `
                <tr style="border-bottom: 1px solid #1e293b;">
                  <td style="padding: 12px 8px; font-weight: bold; color: #deff9a;">${ticker}</td>
                  <td style="padding: 12px 8px;">${data.posicao[ticker].quantidade}</td>
                  <td style="padding: 12px 8px;">R$ ${data.posicao[ticker].custoMedio.toFixed(2)}</td>
                  <td style="padding: 12px 8px;">R$ ${custoTotalOriginal.toFixed(2)}</td>
                  <td style="padding: 12px 8px; color: ${corLucro}; font-weight: bold;">
                    R$ ${lucro.toFixed(2)} <span style="font-size: 13px; font-weight: normal; margin-left: 5px;">(${sinalLucro}${porcentagemLucro.toFixed(1)}%)</span>
                  </td>
                </tr>
              `;
            }).join('') || '<tr><td colspan="5" style="padding: 15px; text-align:center; color: #94a3b8;">Nenhum ativo nesta carteira</td></tr>'}
          </tbody>
        </table>
      </div>

      <div style="width: 100%; background: #151f32; padding: 20px; border-radius: 8px; box-sizing: border-box;">
        <h3>Histórico de Movimentações (Extrato)</h3>
        <div class="timeline" style="background: #0f172a; padding: 15px; border-radius: 8px;">
          ${transactions.map(tx => {
            let infoLucro = '';
            if (tx.tipo === 'VENDA' && tx.lucroRealizado !== undefined) {
              const corTxLucro = tx.lucroRealizado >= 0 ? '#4caf50' : '#f44336';
              infoLucro = ` <span style="color: ${corTxLucro}; font-size: 14px; font-weight: bold;">(Retorno: R$ ${tx.lucroRealizado.toFixed(2)})</span>`;
            }
            return `
              <div style="padding: 12px 0; border-bottom: 1px solid #1e293b; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <span>
                  ${tx.tipo === 'COMPRA' ? '<b style="color: #4caf50;">🟢 COMPRA</b>' : '<b style="color: #f44336;">🔴 VENDA</b>'} 
                  de ${tx.quantidade} ${tx.ativo} @ R$ ${tx.preco.toFixed(2)} ${infoLucro}
                </span>
                <span style="color: #64748b; font-size: 14px;">${new Date(tx.data || Date.now()).toLocaleDateString('pt-BR')}</span>
              </div>
            `;
          }).join('') || '<p style="color: #64748b; margin: 0;">Nenhuma transação realizada nesta carteira.</p>'}
        </div>
      </div>

      <div id="txModal" style="display: none; position: fixed; z-index: 9999; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.7); align-items: center; justify-content: center;">
        <div style="background: #151f32; padding: 25px; border-radius: 8px; width: 100%; max-width: 480px; box-sizing: border-box; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
          <h3 style="margin-top: 0; margin-bottom: 15px;">Nova Transação</h3>
          
          <div style="background: #0f172a; padding: 12px; border-radius: 6px; margin-bottom: 15px; border-left: 3px solid #a855f7; font-size: 12px; color: #94a3b8; line-height: 1.5;">
            <strong>⚠️ Regras Importantes de Uso:</strong><br>
            • Utilize sempre a <b>sigla padrão (Ticker)</b> do ativo em maiúsculo (ex: <b>BTC</b>, <b>AAPL</b>, <b>PETR4</b>).<br>
            • Evite digitar nomes por extenso (ex: "Bitcoin", "Apple"), pois o sistema diferenciará como ativos separados.<br>
            • Para ordens de <b>VENDA</b>, certifique-se de que possui quantidade suficiente em custódia para evitar rejeições.
          </div>

          <div style="margin-bottom: 12px;">
            <label style="display:block; margin-bottom:4px; color:#94a3b8;">Sigla do Ativo (Ticker)</label>
            <input type="text" id="t-ativo" placeholder="Ex: BTC" style="width:100%; box-sizing:border-box;">
          </div>
          <div style="margin-bottom: 12px;">
            <label style="display:block; margin-bottom:4px; color:#94a3b8;">Tipo de Ordem</label>
            <select id="t-tipo" style="width:100%; box-sizing:border-box; padding: 8px; background:#0f172a; color:#fff; border:1px solid #334155; border-radius:4px;"><option value="COMPRA">COMPRA</option><option value="VENDA">VENDA</option></select>
          </div>
          <div style="margin-bottom: 12px;">
            <label style="display:block; margin-bottom:4px; color:#94a3b8;">Quantidade</label>
            <input type="number" id="t-qtd" placeholder="0.00" style="width:100%; box-sizing:border-box;">
          </div>
          <div style="margin-bottom: 20px;">
            <label style="display:block; margin-bottom:4px; color:#94a3b8;">Preço Unitário</label>
            <input type="number" id="t-preco" placeholder="R$ 0.00" style="width:100%; box-sizing:border-box;">
          </div>
          <div style="display:flex; justify-content: flex-end; gap: 10px;">
            <button class="btn btn-secondary" onclick="closeTransactionModal()">Cancelar</button>
            <button class="btn btn-primary" onclick="addTransaction('${id}')">Confirmar</button>
          </div>
        </div>
      </div>
    `;
  } catch (e) { alert('Erro ao abrir detalhes.'); loadWallets(); }
}

function openTransactionModal() {
  document.getElementById('txModal').style.display = 'flex';
}

function closeTransactionModal() {
  document.getElementById('txModal').style.display = 'none';
}

async function addTransaction(walletId) {
  // Envio de nova ordem via POST assíncrono
  const data = {
    carteiraId: walletId,
    ativo: document.getElementById('t-ativo').value.toUpperCase().trim(),
    tipo: document.getElementById('t-tipo').value,
    quantidade: Number(document.getElementById('t-qtd').value),
    preco: Number(document.getElementById('t-preco').value)
  };
  const res = await fetch(`${API}/transactions`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
  });
  if (res.ok) {
    closeTransactionModal();
    viewWallet(walletId);
  } else { 
    const err = await res.json(); 
    alert(err.message); 
  }
}

async function createWallet() {
  const nome = document.getElementById('w-nome').value;
  const descricao = document.getElementById('w-desc').value;
  if(!nome) return alert('O nome é obrigatório');
  
  await fetch(`${API}/wallets`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ nome, descricao })
  });
  loadWallets();
}

async function deleteWallet(id) {
  if (confirm('Deseja realmente excluir esta carteira?')) { 
    await fetch(`${API}/wallets/${id}`, { method: 'DELETE' }); 
    loadWallets(); 
  }
}

// Inicialização síncrona do painel principal
loadWallets();