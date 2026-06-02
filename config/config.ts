import 'dotenv/config';

type ConfigType = {
  DATABASE_URL: string;
  PORT: number;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_REDIRECT_URI: string;
};

const CONFIG: ConfigType = {
  DATABASE_URL:
    process.env.DATABASE_URL ??
    'mysql://johndoe:randompassword@localhost:3306/mydb',
  PORT: Number(process.env.PORT) ?? 3000,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,
  GOOGLE_REDIRECT_URI: 'http://localhost:3000/auth/google/callback',
};

export default CONFIG;
