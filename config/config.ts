import 'dotenv/config';

type ConfigType = {
  DATABASE_URL: string;
  PORT: number;
  google: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  };
  jwt: {
    accessSecret: string;
    refreshSecret: string;
    accessExpiresIn: `${number}${'h' | 'd'}`;
    refreshExpiresIn: `${number}${'h' | 'd'}`;
  };
};

const CONFIG: ConfigType = {
  DATABASE_URL: process.env.DATABASE_URL!,
  PORT: Number(process.env.PORT) || 3000,
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    redirectUri: 'http://localhost:3000/auth/google/callback',
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET!,
    refreshSecret: process.env.JWT_REFRESH_SECRET!,
    accessExpiresIn: '1h',
    refreshExpiresIn: '1d',
  },
};

export default CONFIG;
