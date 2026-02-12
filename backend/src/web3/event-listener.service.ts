import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ethers } from 'ethers';
// import { UsersService } from '../users/users.service'; // Tu servicio de negocio
import { Web3Service } from './web3.service'; // Tu servicio base de conexión
import { ProjectService } from 'src/projects/project.service';

@Injectable()
export class EventsListenerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventsListenerService.name);
  private contract: ethers.Contract;

  constructor(
    private readonly web3Service: Web3Service,
    private readonly projectService: ProjectService,
  ) {}

  async onModuleInit() {
    // Obtenemos el contrato ya inicializado de nuestro servicio base
    this.contract = this.web3Service.getContract();
    await this.syncLostEvents();
    
    this.logger.log('🎧 Iniciando escuchador de eventos Blockchain...');
    this.subscribeToEvents();
  }

  onModuleDestroy() {
    // Importante: Limpiar listeners al apagar la app
    this.contract.removeAllListeners();
  }

  private subscribeToEvents() {
    // this.contract.on('MilestoneAdded', async (projectAddress, idMilestone, event) => {
    //   try {
    //     this.logger.log(`Evento MilestoneAdded detectado: Project ${projectAddress} - Milestone ID ${idMilestone}`);
    //     await this.projectService.addMilestone(projectAddress, Number(idMilestone), `Milestone ${idMilestone}`);
    //     console.log('Bloque:', event.log.blockNumber);
        
    //   } catch (error) {
    //     this.logger.error(`Error procesando evento Deposit: ${error.message}`);
    //   }
    // });

  }

  private async syncLostEvents() {
    const lastProcessedBlock = 38; // Obtén esto de tu DB o almacenamiento
    const currentBlock = await this.web3Service.getProvider().getBlockNumber();
    this.logger.log(`Sincronizando eventos desde el bloque ${lastProcessedBlock} hasta ${currentBlock}...`);
    const events = await this.web3Service.getContract().queryFilter(
      this.contract.filters.MilestoneAdded(), // Filtra por el evento que te interesa
      lastProcessedBlock + 1,
      currentBlock
    );

    events.forEach((event) => {
        if ('args' in event) {
            const [projectAddress, idMilestone] = event.args;
            this.logger.log(`Evento perdido sincronizado: ${projectAddress} - Milestone ID ${idMilestone}`);
        }
        this.logger.log(`Evento sincronizado: ${JSON.stringify(event)}`);
    });
  }
}