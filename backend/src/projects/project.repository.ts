import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DRIZZLE } from "../database/drizzle.provider";
import * as schema from "../database/schema";
import { CreateMilestoneRequest, UpdateProjectRequest } from "./dto/types";

@Injectable()
export class ProjectRepository {
    constructor(
    @Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async findMilestoneById(idMilestone: number) {
    return this.db
      .select()
      .from(schema.milestones)
      .where(eq(schema.milestones.id, idMilestone))
      .limit(1);
  }

  async addMilestone(newMilestone: schema.NewMilestone) {
    return this.db
      .insert(schema.milestones)
      .values(newMilestone)
      .returning();
  }

  async updateMilestoneInfo(projectAddress: string, data: CreateMilestoneRequest) {
    return this.db
      .update(schema.milestones)
      .set({ title: data.title, url: data.url })
      .where(eq(schema.milestones.id, data.id))
      .returning();
  }

  async upsertMilestone(projectId: number, milestoneId: number, data: { title?: string; url?: string }) {
    // Try to find existing milestone
    const existing = await this.findMilestoneById(milestoneId);
    
    if (existing.length > 0) {
      // Update existing milestone (created by event listener)
      return this.db
        .update(schema.milestones)
        .set({ title: data.title, url: data.url })
        .where(eq(schema.milestones.id, milestoneId))
        .returning();
    } else {
      // Insert new milestone (event listener hasn't processed it yet)
      // Use onConflictDoUpdate to handle race condition if event listener creates it between our check and insert
      return this.db
        .insert(schema.milestones)
        .values({
          id: milestoneId,
          projectId: projectId,
          title: data.title,
          url: data.url,
        })
        .onConflictDoUpdate({
          target: schema.milestones.id,
          set: {
            title: data.title,
            url: data.url,
          },
        })
        .returning();
    }
  }

  async findProjectByAddress(address: string) {
    return this.db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.address, address))
      .limit(1);
  }

  async findProjectById(projectId: number) {
    return this.db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.id, projectId))
      .limit(1);
  }

  async updateProjectInfo(projectId: number, data: UpdateProjectRequest) {
    return this.db
      .update(schema.projects)
      .set(data)
      .where(eq(schema.projects.id, projectId))
      .returning();
  }

  async createProject(newProject: schema.NewProject) {
    return this.db
      .insert(schema.projects)
      .values(newProject)
      .returning();
  }
}