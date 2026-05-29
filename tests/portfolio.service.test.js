const walletService = require('../src/services/wallet.service');
const walletRepository = require('../src/repositories/wallet.repository');

jest.mock('../src/repositories/wallet.repository');

describe('Wallet Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve criar uma carteira com sucesso', async () => {
    const mockData = { nome: 'Carteira de Ações', descricao: 'B3' };
    walletRepository.create.mockResolvedValue({ _id: '1', ...mockData });

    const result = await walletService.createWallet(mockData);
    expect(result.nome).toBe('Carteira de Ações');
  });

  it('deve retornar uma carteira por id', async () => {
    walletRepository.findById.mockResolvedValue({ _id: '1', nome: 'Cripto' });

    const result = await walletService.getWalletById('1');
    expect(result._id).toBe('1');
  });

  it('deve dar erro ao buscar id inexistente', async () => {
    walletRepository.findById.mockResolvedValue(null);

    await expect(walletService.getWalletById('999')).rejects.toThrow('Carteira não encontrada');
  });

  it('deve dar erro ao deletar id inexistente', async () => {
    walletRepository.remove.mockResolvedValue(null);

    await expect(walletService.deleteWallet('999')).rejects.toThrow('Carteira não encontrada');
  });
});