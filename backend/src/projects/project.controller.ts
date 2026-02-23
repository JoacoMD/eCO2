import { Body, Controller, Get, Patch, Inject, Post, UseGuards, Param, Req, Res } from "@nestjs/common";
import { ProjectService } from "./project.service";
import type { CreateMilestoneRequest, UpdateProjectRequest } from "./dto/types";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller()
export class ProjectController {
    constructor(
        @Inject() private readonly projectService: ProjectService,
    ) {}

    @Get("/projects/:address")
    async getProjectsByAddress(@Param('address') address: string): Promise<string> {
        try {
            const projects = await this.projectService.findProjectByAddress(address);
            return JSON.stringify(projects[0] || { message: "No projects found" });
        }
        catch (error) {
            return `Error retrieving projects: ${error.message}`;
        }
    }

    @Get("/projects/:address/tokens")
    async getProjectTokens(@Param('address') address: string): Promise<string> {
        try {
            const tokens = await this.projectService.findTokensByProjectAddress(address);
            return JSON.stringify(tokens);
        } catch (error) {
            return `Error retrieving project tokens: ${error.message}`;
        }
    }

    @UseGuards(JwtAuthGuard)
    @Patch("/projects/:address")
    async updateProjectInfo(@Param('address') address: string, @Body() data: UpdateProjectRequest, @Req() req, @Res() res) {
        if (!req.user || req.user.address?.toLowerCase() !== address.toLowerCase()) {
            res.status(403).json({ message: "You can only update your own project" });
            return;
        }
        try {
            const updatedProject = await this.projectService.updateProjectInfo(address, data);
            res.json(updatedProject[0]);
        }
        catch (error) {
            res.status(500).json({ message: `Error updating project info: ${error.message}` });
        }
    }

    @UseGuards(JwtAuthGuard)
    @Patch("/projects/:address/milestones")
    async updateMilestone(@Param('address') address: string, @Body() data: CreateMilestoneRequest, @Req() req, @Res() res) {
        if (!req.user || req.user.address?.toLowerCase() !== address.toLowerCase()) {
            res.status(403).json({ message: "You can only update milestones of your own project" });
            return;
        }
        try {
            await this.projectService.updateMilestoneInfo(address, data);
            res.json({ message: `Milestone updated successfully for project with address ${address}` });
        }
        catch (error) {
            res.status(500).json({ message: `Error updating milestone: ${error.message}` });
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post("/projects/:address/milestones")
    async upsertMilestone(@Param('address') address: string, @Body() data: CreateMilestoneRequest, @Req() req, @Res() res) {
        if (!req.user || req.user.address?.toLowerCase() !== address.toLowerCase()) {
            res.status(403).json({ message: "You can only update milestones of your own project" });
            return;
        }
        try {
            const result = await this.projectService.upsertMilestone(address, data.id, {
                title: data.title,
                url: data.url,
            });
            res.json(result[0]);
        }
        catch (error) {
            res.status(500).json({ message: `Error upserting milestone: ${error.message}` });
        }
    }

}