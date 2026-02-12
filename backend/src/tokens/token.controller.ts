import { Body, Controller, Get, Param, Patch } from "@nestjs/common";
import { TokensService } from "./tokens.service";

@Controller()
export class TokenController {
  constructor(private readonly tokenService: TokensService) {}

  @Get("/tokens/:id")
  async getTokenById(@Param("id") id: number): Promise<string> {
    try {
        
        return JSON.stringify((await this.tokenService.findTokenById(id))[0]);
    } catch (error) {
        return `Error retrieving token: ${error.message}`;
    }
  }

  @Patch("/tokens/:id")
  async updateTokenInfo(
    @Param("id") id: number,
    @Body() data: { name: string; description: string; image: string }
  ): Promise<string> {
    try {
      const updatedToken = await this.tokenService.updateTokenInfo(
        id,
        data.name,
        data.description,
        data.image
      );
      return JSON.stringify(updatedToken[0]);
    } catch (error) {
      return `Error updating token info: ${error.message}`;
    }
  }
}