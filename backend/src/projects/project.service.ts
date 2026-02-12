import { Inject, Injectable } from "@nestjs/common";
import { ProjectRepository } from "./project.repository";
import { CreateMilestoneRequest, UpdateProjectRequest } from "./dto/types";
import { randomUUID } from "crypto";

@Injectable()
export class ProjectService {

    constructor(
        @Inject() private readonly projectRepository: ProjectRepository,
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

    async addMilestone(projectAddress: string, data: CreateMilestoneRequest) {
        const project = await this.projectRepository.findProjectByAddress(projectAddress);
        if (project.length === 0) {
            throw new Error('Proyecto no encontrado');
        }
        await this.projectRepository.addMilestone({
            id: randomUUID(),
            projectId: project[0].id,
            title: data.title,
            url: data.url,
        });
    }

    async findProjectByAddress(address: string) {
        return this.projectRepository.findProjectByAddress(address);
    }

    async updateProjectInfo(address: string, data: UpdateProjectRequest) {
        const project = await this.projectRepository.findProjectByAddress(address);
        if (project.length === 0) {
            throw new Error('Proyecto no encontrado');
        }
        return this.projectRepository.updateProjectInfo(project[0].id, data);
    }

}