import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import { Web3Service } from './web3.service';
import { ProjectService } from '../projects/project.service';
import { CompaniesService } from '../companies/companies.service';
import { TokensService } from '../tokens/tokens.service';

@Injectable()
export class EventsListenerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventsListenerService.name);
  private contract: ethers.Contract;

  constructor(
    private readonly web3Service: Web3Service,
    private readonly projectService: ProjectService,
    private readonly companiesService: CompaniesService,
    private readonly tokensService: TokensService,
  ) {}

  async onModuleInit() {
    this.contract = this.web3Service.getContract();
    await this.syncLostEvents();
    
    this.logger.log('🎧 Iniciando escuchador de eventos Blockchain...');
    this.subscribeToEvents();
  }

  onModuleDestroy() {
    this.contract.removeAllListeners();
  }

  private subscribeToEvents() {
    this.contract.on('ProjectRegistered', async (projectAddress, projectId, name, event) => {
      try {
        this.logger.log(`Evento ProjectRegistered detectado: ${projectAddress} - Project ID ${projectId} - Name: ${name} | Block ${event.log.blockNumber}`);

        await this.projectService.createProject(projectAddress, Number(projectId), name);
        await this.web3Service.logEvent({
          event: 'ProjectRegistered',
          blockNumber: event.log.blockNumber,
          hash: event.log.transactionHash,
          from: event.log.address,
          data: JSON.stringify({ projectAddress, projectId: Number(projectId), name }),
        })

      } catch (error) {
        this.logger.error(`Error procesando evento ProjectRegistered: ${error.message}`);
      }
    })
    this.contract.on('CompanyRegistered', async (companyAddress, companyId, name, event) => {
      try {
        this.logger.log(`Evento CompanyRegistered detectado: ${companyAddress} - Company ID ${companyId} - Name: ${name} | Block ${event.log.blockNumber}`);

        await this.companiesService.createCompany(companyAddress, Number(companyId), name);
        await this.web3Service.logEvent({
          event: 'CompanyRegistered',
          blockNumber: event.log.blockNumber,
          hash: event.log.transactionHash,
          from: event.log.address,
          data: JSON.stringify({ companyAddress, companyId: Number(companyId), name }),
        })

      } catch (error) {
        this.logger.error(`Error procesando evento CompanyRegistered: ${error.message}`);
      }
    })
    this.contract.on('TokenMinted', async (to, tokenId, amount, event) => {
      try {
        this.logger.log(`Evento TokenMinted detectado: To ${to} - Token ID ${tokenId} - Amount: ${amount} | Block ${event.log.blockNumber}`);
        await this.tokensService.createToken(Number(tokenId), to);
        await this.web3Service.logEvent({
          event: 'TokenMinted',
          blockNumber: event.log.blockNumber,
          hash: event.log.transactionHash,
          from: event.log.address,
          data: JSON.stringify({ to, tokenId: Number(tokenId), amount }),
        })
      } catch (error) {
        this.logger.error(`Error procesando evento TokenMinted: ${error.message}`);
      }
    })
    this.contract.on('MilestoneAdded', async (projectAddress, idMilestone, event) => {
      try {
        this.logger.log(`Evento MilestoneAdded detectado: Project ${projectAddress} - Milestone ID ${idMilestone} | Block ${event.log.blockNumber}`);
        // Only create the milestone record with id and projectId
        // The frontend will add title and url via the upsert endpoint
        await this.projectService.createMilestone(projectAddress, Number(idMilestone));
        await this.web3Service.logEvent({
          event: 'MilestoneAdded',
          blockNumber: event.log.blockNumber,
          hash: event.log.transactionHash,
          from: event.log.address,
          data: JSON.stringify({ projectAddress, idMilestone: Number(idMilestone) }),
        })
      } catch (error) {
        // If milestone already exists (race condition with frontend), that's okay
        if (error.message.includes('duplicate key') || error.message.includes('ya existe')) {
          this.logger.warn(`Milestone ${idMilestone} already exists, skipping creation from event`);
        } else {
          this.logger.error(`Error procesando evento MilestoneAdded: ${error.message}`);
        }
      }
    });

  }

  private async syncLostEvents() {
    const lastProcessedBlock = await this.web3Service.getLastBlockNumberProcessed();
    if (!lastProcessedBlock) return; 
    const currentBlock = await this.web3Service.getProvider().getBlockNumber();
    this.logger.log(`Sincronizando eventos desde el bloque ${lastProcessedBlock} hasta ${currentBlock}...`);
    const events = await this.web3Service.getContract().queryFilter(
      this.contract.filters.MilestoneAdded(), // Filtra por el evento que te interesa
      Number(lastProcessedBlock) + 1,
      currentBlock
    );

    events.forEach(async (event) => {
        if ('args' in event) {
            try {
                const [projectAddress, idMilestone] = event.args;
                this.logger.log(`Evento perdido sincronizado: ${projectAddress} - Milestone ID ${Number(idMilestone)}`);
                await this.projectService.createMilestone(projectAddress, Number(idMilestone));
                await this.web3Service.logEvent({
                  event: 'MilestoneAdded',
                  blockNumber: event.blockNumber,
                  hash: event.transactionHash,
                  from: event.address,
                  data: JSON.stringify({ projectAddress, idMilestone: Number(idMilestone) }),
                })
            } catch (error) {
                if (error.message.includes('duplicate key') || error.message.includes('ya existe')) {
                    this.logger.warn(`Milestone ${event.args[1]} already exists, skipping sync`);
                } else {
                    this.logger.error(`Error syncing MilestoneAdded event: ${error.message}`);
                }
            }
        }
        this.logger.log(`Evento sincronizado: ${JSON.stringify(event)}`);
    });
    const eventsProjects = await this.web3Service.getContract().queryFilter(
      this.contract.filters.ProjectRegistered(), // Filtra por el evento que te interesa
      Number(lastProcessedBlock) + 1,
      currentBlock
    );

    eventsProjects.forEach(async (event) => {
        if ('args' in event) {
            const [projectAddress, projectId, name] = event.args;
            this.logger.log(`Evento perdido sincronizado: ${projectAddress} - Project ID ${Number(projectId)} - Name: ${name}`);
            await this.projectService.createProject(projectAddress, Number(projectId), name);
            await this.web3Service.logEvent({
              event: 'ProjectRegistered',
              blockNumber: event.blockNumber,
              hash: event.transactionHash,
              from: event.address,
              data: JSON.stringify({ projectAddress, projectId: Number(projectId), name }),
            })
        }
        this.logger.log(`Evento sincronizado: ${JSON.stringify(event)}`);
    });
    const eventsCompanies = await this.web3Service.getContract().queryFilter(
      this.contract.filters.CompanyRegistered(), // Filtra por el evento que te interesa
      Number(lastProcessedBlock) + 1,
      currentBlock
    );
    eventsCompanies.forEach(async (event) => {
        if ('args' in event) {
            const [companyAddress, companyId, name] = event.args;
            this.logger.log(`Evento perdido sincronizado: ${companyAddress} - Company ID ${Number(companyId)} - Name: ${name}`);
            await this.companiesService.createCompany(companyAddress, Number(companyId), name);
            await this.web3Service.logEvent({
              event: 'CompanyRegistered',
              blockNumber: event.blockNumber,
              hash: event.transactionHash,
              from: event.address,
              data: JSON.stringify({ companyAddress, companyId: Number(companyId), name }),
            })
        }
        this.logger.log(`Evento sincronizado: ${JSON.stringify(event)}`);
    });
    const eventsTokens = await this.web3Service.getContract().queryFilter(
      this.contract.filters.TokenMinted(), // Filtra por el evento que te interesa
      Number(lastProcessedBlock) + 1,
      currentBlock
    );
    eventsTokens.forEach(async (event) => {
        if ('args' in event) {
            const [to, tokenId, amount] = event.args;
            this.logger.log(`Evento perdido sincronizado: To ${to} - Token ID ${Number(tokenId)} - Amount: ${Number(amount)}`);
            await this.tokensService.createToken(Number(tokenId), to);
            await this.web3Service.logEvent({
              event: 'TokenMinted',
              blockNumber: event.blockNumber,
              hash: event.transactionHash,
              from: event.address,
              data: JSON.stringify({ to, tokenId: Number(tokenId), amount: Number(amount) }),
            })
        }
        this.logger.log(`Evento sincronizado: ${JSON.stringify(event)}`);
    });
  }
}