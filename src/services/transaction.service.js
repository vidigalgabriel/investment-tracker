const transactionRepository = require('../repositories/transaction.repository');

const createTransaction = async (data) => {
  const { carteiraId, ativo, tipo, quantidade, preco } = data;

  if (!carteiraId || !ativo || !quantidade || !preco || !tipo) {
    throw new Error('Dados obrigatórios ausentes');
  }

  const ativoFormatado = ativo.toUpperCase().trim();

  if (tipo.toUpperCase() === 'VENDA') {
    const transacoes = await transactionRepository.findByWalletId(carteiraId);
    const transacoesDoAtivo = transacoes.filter(t => t.ativo.toUpperCase().trim() === ativoFormatado);

    let quantidadeDisponivel = 0;
    let custoTotal = 0;
    let custoMedio = 0;

    transacoesDoAtivo.forEach(t => {
      if (t.tipo.toUpperCase() === 'COMPRA') {
        quantidadeDisponivel += t.quantidade;
        custoTotal += (t.quantidade * t.preco);
        custoMedio = custoTotal / quantidadeDisponivel;
      } else if (t.tipo.toUpperCase() === 'VENDA') {
        quantidadeDisponivel -= t.quantidade;
        custoTotal -= (t.quantidade * custoMedio);
        if (quantidadeDisponivel > 0) {
          custoMedio = custoTotal / quantidadeDisponivel;
        } else {
          custoMedio = 0;
          custoTotal = 0;
        }
      }
    });

    if (quantidade > quantidadeDisponivel) {
      const error = new Error(`Saldo insuficiente. Disponível: ${quantidadeDisponivel}`);
      error.statusCode = 400;
      throw error;
    }

    data.lucroRealizado = (preco - custoMedio) * quantidade;
  } else {
    data.lucroRealizado = 0;
  }

  data.ativo = ativoFormatado;
  return await transactionRepository.create(data);
};

const getTransactions = async (walletId) => {
  if (walletId) {
    return await transactionRepository.findByWalletId(walletId);
  }
  return await transactionRepository.findAll();
};

const getWalletPosition = async (walletId) => {
  const transacoes = await transactionRepository.findByWalletId(walletId);
  const posicao = {};

  transacoes.forEach(t => {
    const ativo = t.ativo.toUpperCase().trim();
    if (!posicao[ativo]) {
      posicao[ativo] = { quantidade: 0, custoTotal: 0, custoMedio: 0, lucroTotal: 0 };
    }

    if (t.tipo.toUpperCase() === 'COMPRA') {
      posicao[ativo].quantidade += t.quantidade;
      posicao[ativo].custoTotal += (t.quantidade * t.preco);
    } else if (t.tipo.toUpperCase() === 'VENDA') {
      const custoMedioMomento = posicao[ativo].quantidade > 0 ? (posicao[ativo].custoTotal / posicao[ativo].quantidade) : 0;
      
      posicao[ativo].quantidade -= t.quantidade;
      posicao[ativo].custoTotal -= (t.quantidade * custoMedioMomento);
      
      if (t.lucroRealizado !== undefined) {
        posicao[ativo].lucroTotal += t.lucroRealizado;
      } else {
        posicao[ativo].lucroTotal += (t.preco - custoMedioMomento) * t.quantidade;
      }
    }

    if (posicao[ativo].quantidade > 0) {
      posicao[ativo].custoMedio = posicao[ativo].custoTotal / posicao[ativo].quantidade;
    } else {
      posicao[ativo].custoMedio = 0;
      posicao[ativo].custoTotal = 0;
    }
  });

  return posicao;
};

module.exports = {
  createTransaction,
  getTransactions,
  getWalletPosition
};