import { Body, Controller, Get, Param, Patch, Req, Res, UseGuards } from "@nestjs/common";
import { TokensService } from "./tokens.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

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

  @UseGuards(JwtAuthGuard)
  @Patch("/tokens/:id")
  async updateTokenInfo(
    @Param("id") id: number,
    @Body() data: { name: string; description: string; image: string },
    @Res() res,
    @Req() req
  ) {
    try {
      const project = await this.tokenService.findProjectByTokenId(id);
      if (!req.user || req.user.address?.toLowerCase() !== project.address.toLowerCase()) {
        res.status(403).json({ message: "You can only update tokens of your own project" });
        return;
      }
      const updatedToken = await this.tokenService.updateTokenInfo(
        id,
        data.name,
        data.description,
        data.image
      );
      res.json(updatedToken[0]);
    } catch (error) {
      res.status(500).json({ message: `Error updating token info: ${error.message}` });
    }
  }
}