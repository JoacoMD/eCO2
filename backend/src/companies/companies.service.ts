import { Injectable, Inject } from '@nestjs/common';
import { CompanyRepository } from './companies.repository';
import { NewCompany } from 'src/database/schema';
import { Web3Service } from 'src/web3/web3.service';

@Injectable()
export class CompaniesService {

    constructor(
        @Inject() private readonly companyRepository: CompanyRepository,
        @Inject() private readonly web3Service: Web3Service,
    ) {}

    async findCompanyByAddress(address: string) {
        return this.companyRepository.findCompanyByAddress(address);
    }

    async updateCompanyInfo(address: string, data: Partial<NewCompany>) {
        let company = await this.companyRepository.findCompanyByAddress(address);
        
        // If company not found in DB, query the smart contract
        if (company.length === 0) {
            try {
                const contract = this.web3Service.getContract();
                const companyFromChain = await contract.getCompany(address);
                
                // Check if company exists on chain (id != 0)
                if (companyFromChain && companyFromChain.id && Number(companyFromChain.id) !== 0) {
                    // Save company to database
                    await this.createCompany(
                        address,
                        Number(companyFromChain.id),
                        companyFromChain.name
                    );
                    // Retrieve the newly created company
                    company = await this.companyRepository.findCompanyByAddress(address);
                } else {
                    throw new Error('Compañía no encontrada en la blockchain');
                }
            } catch (error) {
                if (error.message.includes('Company not registered')) {
                    throw new Error('Compañía no registrada en la blockchain');
                }
                throw new Error(`Error consultando compañía: ${error.message}`);
            }
        }
        
        if (company.length === 0) {
            throw new Error('Compañía no encontrada');
        }
        return this.companyRepository.updateCompanyInfo(company[0].id, data);
    }

    async createCompany(address: string, companyId: number, name: string) {
        const existingCompany = await this.companyRepository.findCompanyByAddress(address);
        if (existingCompany.length > 0) {
            throw new Error('La compañía ya está registrada');
        }
        return this.companyRepository.createCompany({
            address,
            id: companyId,
            name,
        });
    }
}
