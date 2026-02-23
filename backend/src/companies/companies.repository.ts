import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DRIZZLE } from "../database/drizzle.provider";
import * as schema from "../database/schema";

@Injectable()
export class CompanyRepository {
    constructor(
    @Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async findCompanyByAddress(address: string) {
    return this.db
      .select()
      .from(schema.companies)
      .where(eq(schema.companies.address, address))
      .limit(1);
  }

  async updateCompanyInfo(companyId: number, data: Partial<schema.NewCompany>) {
    return this.db
      .update(schema.companies)
      .set(data)
      .where(eq(schema.companies.id, companyId))
      .returning();
  }

  async createCompany(newCompany: schema.NewCompany) {
    return this.db
      .insert(schema.companies)
      .values(newCompany)
      .returning();
  }
}