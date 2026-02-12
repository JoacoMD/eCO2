import { Body, Controller, Get, Patch, Inject, Post } from "@nestjs/common";
import { ProjectService } from "./project.service";
import type { CreateMilestoneRequest, UpdateProjectRequest } from "./dto/types";

@Controller('projects')
export class ProjectController {
    constructor(
        @Inject() private readonly projectService: ProjectService,
    ) {}

    @Get("/:address")
    async getProjectsByAddress(@Inject('address') address: string): Promise<string> {
        try {
            const projects = await this.projectService.findProjectByAddress(address);
            return JSON.stringify(projects[0] || { message: "No projects found" });
        }
        catch (error) {
            return `Error retrieving projects: ${error.message}`;
        }
    }

    @Patch("/:address")
    async updateProjectInfo(@Inject('address') address: string, @Body() data: UpdateProjectRequest): Promise<string> {
        try {
            const updatedProject = await this.projectService.updateProjectInfo(address, data);
            return JSON.stringify(updatedProject);
        }
        catch (error) {
            return `Error updating project info: ${error.message}`;
        }
    }

    @Post("/:address/milestones")
    async addMilestone(@Inject('address') address: string, @Body() data: CreateMilestoneRequest): Promise<string> {
        try {
            await this.projectService.addMilestone(address, data);
            return `Milestone added successfully to project with address ${address}`;
        }
        catch (error) {
            return `Error adding milestone: ${error.message}`;
        }
    }

}