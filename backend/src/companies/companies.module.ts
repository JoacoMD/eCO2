import { Module } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { CompanyRepository } from './companies.repository';
import { Web3Service } from 'src/web3/web3.service';
import { Web3Repository } from 'src/web3/web3.repository';

@Module({
  controllers: [CompaniesController],
  providers: [CompaniesService, CompanyRepository, Web3Service, Web3Repository],
  exports: [CompaniesService],
})
export class CompaniesModule {}
