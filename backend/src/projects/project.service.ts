import { Inject, Injectable } from "@nestjs/common";
import { ProjectRepository } from "./project.repository";
import { CreateMilestoneRequest, UpdateProjectRequest } from "./dto/types";
import { Web3Service } from "../web3/web3.service";
import { TokensRepository } from "../tokens/tokens.repository";

@Injectable()
export class ProjectService {

    constructor(
        @Inject() private readonly projectRepository: ProjectRepository,
        @Inject() private readonly tokensRepository: TokensRepository,
        @Inject() private readonly web3Service: Web3Service,
    ) {}

    async updateMilestoneInfo(projectAddress: string, data: CreateMilestoneRequest) {
        const milestone = await this.projectRepository.findMilestoneById(data.id);
        if (milestone.length === 0) {
            throw new Error('Hito no encontrado');
        }
        if (milestone[0].projectId !== (await this.projectRepository.findProjectByAddress(projectAddress))[0].id) {
            throw new Error('El hito no pertenece al proyecto especificado');
        }
        return this.projectRepository.updateMilestoneInfo(projectAddress, data);
    }

    async upsertMilestone(projectAddress: string, milestoneId: number, data: { title?: string; url?: string }) {
        const project = await this.projectRepository.findProjectByAddress(projectAddress);
        if (project.length === 0) {
            throw new Error('Proyecto no encontrado');
        }
        
        // Check if milestone exists and belongs to this project
        // The milestone may already exist if the event listener processed the MilestoneAdded event
        // before the frontend made this request
        const existingMilestone = await this.projectRepository.findMilestoneById(milestoneId);
        if (existingMilestone.length > 0 && existingMilestone[0].projectId !== project[0].id) {
            throw new Error('El hito no pertenece al proyecto especificado');
        }
        
        // Upsert: Insert if not exists (event not processed yet), update if exists (event already processed)
        return this.projectRepository.upsertMilestone(project[0].id, milestoneId, data);
    }

    async createMilestone(projectAddress: string, id: number) {
        const project = await this.projectRepository.findProjectByAddress(projectAddress);
        if (project.length === 0) {
            throw new Error('Proyecto no encontrado');
        }
        return this.projectRepository.addMilestone({
            id,
            projectId: project[0].id,
        });
    }

    async findProjectByAddress(address: string) {
        return this.projectRepository.findProjectByAddress(address);
    }

    async updateProjectInfo(address: string, data: UpdateProjectRequest) {
        let project = await this.projectRepository.findProjectByAddress(address);
        
        // If project not found in DB, query the smart contract
        if (project.length === 0) {
            try {
                const contract = this.web3Service.getContract();
                const projectFromChain = await contract.getProject(address);
                
                // Check if project exists on chain (id != 0)
                if (projectFromChain && projectFromChain.id && Number(projectFromChain.id) !== 0) {
                    // Save project to database
                    await this.createProject(
                        address,
                        Number(projectFromChain.id),
                        projectFromChain.name
                    );
                    // Retrieve the newly created project
                    project = await this.projectRepository.findProjectByAddress(address);
                } else {
                    throw new Error('Proyecto no encontrado en la blockchain');
                }
            } catch (error) {
                if (error.message.includes('Project not registered')) {
                    throw new Error('Proyecto no registrado en la blockchain');
                }
                throw new Error(`Error consultando proyecto: ${error.message}`);
            }
        }
        
        if (project.length === 0) {
            throw new Error('Proyecto no encontrado');
        }
        return this.projectRepository.updateProjectInfo(project[0].id, data);
    }

    async createProject(address: string, projectId: number, name: string) {
        const existingProject = await this.projectRepository.findProjectByAddress(address);
        if (existingProject.length > 0) {
            throw new Error('El proyecto ya está registrado');
        }
        return this.projectRepository.createProject({
            address,
            id: projectId,
            name,
        });
    }

    async findTokensByProjectAddress(address: string) {
        const project = await this.projectRepository.findProjectByAddress(address);
        if (project.length === 0) {
            throw new Error('Proyecto no encontrado');
        }
        const dictTokens = {} as Record<number, { name: string | null; description: string | null; image?: string | null }>;
        const tokens = await this.tokensRepository.findTokensByProjectId(project[0].id);
        tokens.forEach(token => {
            dictTokens[token.id] = {
                name: token.name,
                description: token.description,
                image: token.image,
            };
        });

        
        try {
            const contract = this.web3Service.getContract();
            const tokensFromChain = await contract.getBalanceOfAllTokens(address);

            return tokensFromChain[0].map((tokenId: bigint ) => ({
                id: Number(tokenId),
                name: dictTokens[Number(tokenId)]?.name ?? "",
                description: dictTokens[Number(tokenId)]?.description ?? "",
                image: dictTokens[Number(tokenId)]?.image ?? "",
                completed: !!dictTokens[Number(tokenId)]?.name, 
            }));
        } catch (error) {
            throw new Error(`Error consultando tokens en la blockchain: ${error.message}`);
        }
    }
}