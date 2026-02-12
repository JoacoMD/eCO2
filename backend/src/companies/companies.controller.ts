import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { NewCompany } from 'src/database/schema';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get('/:address')
  async getCompanyByAddress(@Param('address') address: string): Promise<string> {
    try {
      const company = await this.companiesService.findCompanyByAddress(address);
      return JSON.stringify(company[0] || { message: 'No company found' });
    } catch (error) {
      return `Error retrieving company: ${error.message}`;
    }
  }

  @Patch('/:address')
  async updateCompanyInfo(
    @Param('address') address: string,
    @Body() data: Partial<NewCompany>,
  ): Promise<string> {
    try {
      const updatedCompany = await this.companiesService.updateCompanyInfo(address, data);
      return JSON.stringify(updatedCompany[0]);
    } catch (error) {
      return `Error updating company info: ${error.message}`;
    }
  }
}
