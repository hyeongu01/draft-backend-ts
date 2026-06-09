import { Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import CONFIG from '@/config/config';

@Injectable()
export class GoogleAuthService {
  private readonly client = new OAuth2Client(
    CONFIG.google.clientId,
    CONFIG.google.clientSecret,
    `${CONFIG.FRONTEND_URL}${CONFIG.google.redirectPath}`,
  );

  getAuthUrl(): string {
    return this.client.generateAuthUrl({
      access_type: 'offline',
      scope: ['openid', 'email', 'profile'],
    });
  }

  async exchangeCode(code: string) {
    const { tokens } = await this.client.getToken(code);
    const ticket = await this.client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: CONFIG.google.clientId,
    });

    return ticket.getPayload();
  }

  async verify(idToken: string) {
    const ticket = await this.client.verifyIdToken({
      idToken,
      audience: CONFIG.google.clientId,
    });

    return ticket.getPayload();
  }
}
