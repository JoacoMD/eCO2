import { Inject, Injectable } from "@nestjs/common";
import { desc } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres/driver";
import { DRIZZLE } from "src/database/drizzle.provider";
import * as schema from "src/database/schema";

@Injectable()
export class Web3Repository {
    constructor(
        @Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
    ) {}

    async logTransaction(newTransaction: schema.NewTransaction) {
        return this.db
            .insert(schema.transactions)
            .values(newTransaction)
            .returning();
    }

    async findLastTransaction() {
        return this.db
            .select()
            .from(schema.transactions)
            .orderBy(desc(schema.transactions.blockNumber))
            .limit(1);
    }
}