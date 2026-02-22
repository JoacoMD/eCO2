import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ethers } from 'ethers';
import { NewTransaction } from 'src/database/schema';
import { Web3Repository } from './web3.repository';
import { eco2contract } from './contracts';

@Injectable()
export class Web3Service implements OnModuleInit {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;

  constructor(
    @Inject() private readonly web3Repository: Web3Repository,
  ) {}

  // Tu contrato ABI (Interfaz) y Dirección
  private readonly contractAddress = process.env.CONTRACT_ADDRESS as `0x${string}`;
  private readonly contractABI = eco2contract.abi;

  onModuleInit() {
    // 1. Conexión al nodo (RPC)
    // Recomiendo usar variables de entorno para la URL de Infura/Alchemy
    this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

    if (this.contractAddress == null) {
      throw new Error('CONTRACT_ADDRESS no está definido en las variables de entorno');
    }
    if (this.contractABI == null) {
      throw new Error('CONTRACT_ABI no está definido en las variables de entorno');
    }
    // 2. Instancia del contrato (Solo Lectura)
    this.contract = new ethers.Contract(
      this.contractAddress,
      this.contractABI,
      this.provider
    );
  }

  getContract() {
    return this.contract;
  }
  
  getProvider() {
    return this.provider;
  }

  async logEvent(eventData: NewTransaction) {
    try {
      await this.web3Repository.logTransaction(eventData);
    } catch (error) {
      console.error('Error logging transaction:', error);
    }
  }

  async getLastBlockNumberProcessed() {
    try {
      const [transaction] = await this.web3Repository.findLastTransaction();
      return transaction?.blockNumber ?? null;
    } catch (error) {
      console.error('Error getting last block number:', error);
      return null;
    }
  }
}