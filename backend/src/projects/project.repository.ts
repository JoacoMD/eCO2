import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DRIZZLE } from "src/database/drizzle.provider";
import * as schema from "src/database/schema";
import { CreateMilestoneRequest, UpdateProjectRequest } from "./dto/types";

@Injectable()
export class ProjectRepository {
    constructor(
    @Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async findMilestoneById(idMilestone: string) {
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

  async findProjectByAddress(address: string) {
    return this.db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.address, address))
      .limit(1);
  }

  async updateProjectInfo(projectId: string, data: UpdateProjectRequest) {
    return this.db
      .update(schema.projects)
      .set(data)
      .where(eq(schema.projects.id, projectId))
      .returning();
  }
}