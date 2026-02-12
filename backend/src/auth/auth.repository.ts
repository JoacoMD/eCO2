import { Inject, Injectable } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres/driver';
import { DRIZZLE } from 'src/database/drizzle.provider';
import * as schema from 'src/database/schema';
import { auth_messages } from 'src/database/schema';

@Injectable()
export class AuthRepository {
  constructor(
    @Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async createAuthMessage(newAuthMessage: schema.NewAuthMessage) {
    return this.db
      .insert(schema.auth_messages)
      .values(newAuthMessage)
      .returning();
  }

  async getAuthMessageByAddress(address: string) {
    return this.db
      .select()
      .from(auth_messages)
      .where(eq(auth_messages.address, address))
      .orderBy(desc(schema.auth_messages.createdAt))
      .limit(1);
  }

  async updateAuthMessageStatus(
    id: string,
    status: schema.AuthMessage['status'],
  ) {
    return this.db
      .update(schema.auth_messages)
      .set({ status })
      .where(eq(schema.auth_messages.id, id))
      .returning();
  }
}
