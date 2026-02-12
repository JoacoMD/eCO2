import { Injectable, Inject } from '@nestjs/common';
import { CompanyRepository } from './companies.repository';
import { NewCompany } from 'src/database/schema';

@Injectable()
export class CompaniesService {

    constructor(
        @Inject() private readonly companyRepository: CompanyRepository,
    ) {}

    async findCompanyByAddress(address: string) {
        return this.companyRepository.findCompanyByAddress(address);
    }

    async updateCompanyInfo(address: string, data: Partial<NewCompany>) {
        const company = await this.companyRepository.findCompanyByAddress(address);
        if (company.length === 0) {
            throw new Error('Compañía no encontrada');
        }
        return this.companyRepository.updateCompanyInfo(company[0].id, data);
    }
}
