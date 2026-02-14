import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Web3Service } from './web3/web3.service';
import { EventsListenerService } from './web3/event-listener.service';
import { ConfigModule } from '@nestjs/config';
import { ProjectService } from './projects/project.service';
import { ProjectRepository } from './projects/project.repository';
import { DatabaseModule } from './database/database.module';
import { TokensService } from './tokens/tokens.service';
import { TokenController } from './tokens/token.controller';
import { TokensRepository } from './tokens/tokens.repository';
import { AuthModule } from './auth/auth.module';
import { CompaniesModule } from './companies/companies.module';
import { Web3Repository } from './web3/web3.repository';
import { ProjectController } from './projects/project.controller';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    CompaniesModule,
  ],
  controllers: [AppController, TokenController, ProjectController],
  providers: [AppService, Web3Service, EventsListenerService, ProjectService, ProjectRepository, TokensService, TokensRepository, Web3Repository],
  exports: [Web3Service],
})
export class AppModule {}
