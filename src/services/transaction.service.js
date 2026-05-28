const transactionRepository = require('../repositories/transaction.repository');

const createTransaction = async (data) => {
  const { carteiraId, ativo, tipo, quantidade, preco } = data;

  if (!carteiraId || !ativo || !quantidade || !preco || !tipo) {
    throw new Error('Dados obrigatórios ausentes');
  }

  if (tipo.toUpperCase() === 'VENDA') {
    const transacoesIda = await transactionRepository.findByWalletId(carteiraId);
    const transacoesDoAtivo = transacoesIda.filter(t => t.ativo.toUpperCase() === ativo.toUpperCase());

    let quantidadeDisponivel = 0;
    transacoesDoAtivo.forEach(t => {
      if (t.tipo.toUpperCase() === 'COMPRA') quantidadeDisponivel += t.quantidade;
      if (t.tipo.toUpperCase() === 'VENDA') quantidadeDisponivel -= t.quantidade;
    });

    if (quantidade > quantidadeDisponivel) {
      const error = new Error(`Saldo insuficiente. Disponível: ${quantidadeDisponivel}`);
      error.statusCode = 400;
      throw error;
    }
  }

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
    const ativo = t.ativo.toUpperCase();
    if (!posicao[ativo]) {
      posicao[ativo] = { quantidade: 0, custoTotal: 0, custoMedio: 0 };
    }

    if (t.tipo.toUpperCase() === 'COMPRA') {
      posicao[ativo].quantidade += t.quantidade;
      posicao[ativo].custoTotal += (t.quantidade * t.preco);
    } else if (t.tipo.toUpperCase() === 'VENDA') {
      posicao[ativo].quantidade -= t.quantidade;
      posicao[ativo].custoTotal -= (t.quantidade * posicao[ativo].custoMedio);
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