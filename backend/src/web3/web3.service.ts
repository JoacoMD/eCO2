import { Injectable, OnModuleInit } from '@nestjs/common';
import { ethers } from 'ethers';

@Injectable()
export class Web3Service implements OnModuleInit {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;

  // Tu contrato ABI (Interfaz) y Dirección
  private readonly contractAddress = process.env.CONTRACT_ADDRESS;
  private readonly contractABI = process.env.CONTRACT_ABI;

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
      JSON.parse(this.contractABI),
      this.provider
    );
  }

  getContract() {
    return this.contract;
  }
  
  getProvider() {
    return this.provider;
  }
}