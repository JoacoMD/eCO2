import { Body, Controller, Get, Param, Patch, Req, Res, UseGuards } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { NewCompany } from 'src/database/schema';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

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

  @UseGuards(JwtAuthGuard)
  @Patch('/:address')
  async updateCompanyInfo(
    @Param('address') address: string,
    @Body() data: Partial<NewCompany>,
    @Req() req,
    @Res() res
  ) {
    if (!req.user || req.user.address?.toLowerCase() !== address.toLowerCase()) {
      res.status(403).json({ message: 'You can only update your own company' });
      return;
    }
    try {
      const updatedCompany = await this.companiesService.updateCompanyInfo(address, data);
      res.json(updatedCompany[0]);
    } catch (error) {
      res.status(500).json({ message: `Error updating company info: ${error.message}` });
    }
  }
}
