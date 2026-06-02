import 'dotenv/config';

type ConfigType = {
  DATABASE_URL: string;
  PORT: number;
};

const CONFIG: ConfigType = {
  DATABASE_URL:
    process.env.DATABASE_URL ??
    'mysql://johndoe:randompassword@localhost:3306/mydb',
  PORT: Number(process.env.PORT) ?? 3000,
};

export default CONFIG;
