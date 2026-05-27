const appRoute = document.getElementById('app');
const API_URL = 'http://localhost:3000/api';

async function renderDashboard() {
  appRoute.innerHTML = '<h2>Carregando carteiras...</h2>';
  
  try {
    const res = await fetch(`${API_URL}/wallets`);
    const wallets = await res.json();
    
    let html = `
      <h3>Minhas Carteiras</h3>
      <button onclick="renderWalletForm()">+ Nova Carteira</button>
    `;
    
    wallets.forEach(wallet => {
      html += `
        <div class="card">
          <h4>${wallet.nome}</h4>
          <p>${wallet.descricao || 'Sem descrição'}</p>
          <button onclick="deleteWallet('${wallet._id}')" style="background: #ff4444;">Excluir</button>
        </div>
      `;
    });
    
    appRoute.innerHTML = html;
  } catch (error) {
    appRoute.innerHTML = '<p>Erro ao carregar dados do servidor.</p>';
  }
}


function renderWalletForm() {
  appRoute.innerHTML = `
    <h3>Nova Carteira</h3>
    <input type="text" id="nome" placeholder="Nome da Carteira">
    <input type="text" id="descricao" placeholder="Descrição">
    <button onclick="saveWallet()">Salvar</button>
    <button onclick="renderDashboard()" style="background:#555; margin-left: 10px;">Voltar</button>
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

renderDashboard();