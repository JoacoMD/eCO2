import { Inject, Injectable } from "@nestjs/common";
import { UUID } from "crypto";
import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DRIZZLE } from "src/database/drizzle.provider";
import * as schema from "src/database/schema";

@Injectable()
export class TokensRepository {

    constructor(
        @Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
    ) { }

    async findTokenById(tokenId: number) {
        try {
            return this.db
            .select()
            .from(schema.tokens)
            .where(eq(schema.tokens.id, tokenId))
            .limit(1);
        } catch (error) {
            throw new Error(`Error finding token by ID: ${error.message}`);
        }
    }

    async updateTokenInfo(tokenId: number, name: string, description: string, image: string) {
        try {
            return this.db
            .update(schema.tokens)
            .set({ name, description, image })
            .where(eq(schema.tokens.id, tokenId))
            .returning();
        } catch (error) {
            throw new Error(`Error updating token info: ${error.message}`);
        }
    }

    async createToken(tokenId: number, projectId: number) {
        try {
            return this.db
            .insert(schema.tokens)
            .values({ id: tokenId, projectId })
            .returning();
        } catch (error) {
            throw new Error(`Error creating token: ${error.message}`);
        }
    }

    async findTokensByProjectId(projectId: number) {
        try {
            return this.db
            .select()
            .from(schema.tokens)
            .where(eq(schema.tokens.projectId, projectId));
        } catch (error) {
            throw new Error(`Error finding tokens by project ID: ${error.message}`);
        }
    }
}