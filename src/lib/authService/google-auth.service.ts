import { Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import CONFIG from '@/config/config';

@Injectable()
export class GoogleAuthService {
  private readonly client = new OAuth2Client(
    CONFIG.GOOGLE_CLIENT_ID,
    CONFIG.GOOGLE_CLIENT_SECRET,
    CONFIG.GOOGLE_REDIRECT_URI,
  );

  getAuthUrl(): string {
    return this.client.generateAuthUrl({
      access_type: 'offline',
      scope: ['openid', 'email', 'profile'],
    });
  }

  async exchangeCode(code: string) {
    const { tokens } = await this.client.getToken(code);
    this.client.setCredentials(tokens);

    const ticket = await this.client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: CONFIG.GOOGLE_CLIENT_ID,
    });

    return ticket.getPayload();
  }

  async verify(idToken: string) {
    const ticket = await this.client.verifyIdToken({
      idToken,
      audience: CONFIG.GOOGLE_CLIENT_ID,
    });

    return ticket.getPayload();
  }
}
