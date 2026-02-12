import { Inject, Injectable } from "@nestjs/common";
import { TokensRepository } from "./tokens.repository";
import { ProjectRepository } from "src/projects/project.repository";

@Injectable()
export class TokensService {
    constructor(
        @Inject() private readonly tokensRepository: TokensRepository,
        @Inject() private readonly projectRepository: ProjectRepository,
    ) {}

    async findTokenById(tokenId: number) {
        return this.tokensRepository.findTokenById(tokenId);
    }

    async updateTokenInfo(tokenId: number, name: string, description: string, image: string) {
        const token = await this.tokensRepository.findTokenById(tokenId);
        if (token.length === 0) {
            throw new Error('Token no encontrado');
        }
        return this.tokensRepository.updateTokenInfo(tokenId, name, description, image);
    }

    async createToken(tokenId: number, ownerAddress: string) {
        const project = await this.projectRepository.findProjectByAddress(ownerAddress);
        if (project.length === 0) {
            throw new Error('Proyecto no encontrado para el token');
        }
        return this.tokensRepository.createToken(tokenId, project[0].id);
    }
}