import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { JwtService } from '@nestjs/jwt';
import { ethers } from 'ethers';
import { randomUUID } from 'crypto';

export const AUTH_MESSAGE =
  'This request will not trigger a blockchain transaction or cost any gas fees.';

@Injectable()
export class AuthService {
  constructor(
    @Inject() private readonly authRepository: AuthRepository,
    @Inject() private readonly jwtService: JwtService,
) {}

  async generateAuthMessage(address: string) {
    const authMessage = await this.authRepository.createAuthMessage({
      id: randomUUID(),
      address: address.toLowerCase(),
    });

    return {
      authMessage: {
        nonce: authMessage[0].id,
        walletAddress: authMessage[0].address,
        message: `${AUTH_MESSAGE}\n\nWallet address:\n${authMessage[0].address.toLowerCase()}\n\nNonce:\n${
          authMessage[0].id
        }`,
      },
    };
  }

  async verifyAndLogin(address: string, signature: string) {
    const lowerAddress = address.toLowerCase();
    console.log('Verifying login for address:', lowerAddress);
    const nonce = await this.authRepository.getAuthMessageByAddress(lowerAddress);
    console.log('Retrieved nonce:', nonce);

    if (!nonce[0]) {
      throw new UnauthorizedException('Nonce not found or expired');
    }

    try {
      const message = `${AUTH_MESSAGE}\n\nWallet address:\n${lowerAddress}\n\nNonce:\n${nonce[0].id}`;
      console.log('Verifying message:', message);
      const recoveredAddress = ethers.verifyMessage(message, signature);

      if (recoveredAddress.toLowerCase() !== lowerAddress) {
        throw new UnauthorizedException('Invalid signature');
      }

      if (nonce[0].status !== 'pending') {
        throw new UnauthorizedException('Nonce already used or expired');
      }

      await this.authRepository.updateAuthMessageStatus(nonce[0].id, 'used');

      const payload = { address: lowerAddress };
      const accessToken = this.jwtService.sign(payload);

      return {
        accessToken,
        address: lowerAddress,
      };
    } catch (error) {
      throw new UnauthorizedException('Signature verification failed');
    }
  }
}
