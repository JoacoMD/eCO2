import { Module } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { CompanyRepository } from './companies.repository';

@Module({
  controllers: [CompaniesController],
  providers: [CompaniesService, CompanyRepository],
})
export class CompaniesModule {}
