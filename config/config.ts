import 'dotenv/config';

type ConfigType = {
  DATABASE_URL: string;
  PORT: number;
  FRONTEND_URL: string;
  google: {
    clientId: string;
    clientSecret: string;
    redirectPath: string;
  };
  jwt: {
    accessSecret: string;
    refreshSecret: string;
    accessExpiresIn: `${number}${'h' | 'd'}`;
    refreshExpiresIn: `${number}${'h' | 'd'}`;
  };
  cookie: {
    deviceIdName: string;
    refreshTokenName: string;
    domain?: string;
    secure: boolean;
    sameSite: 'lax' | 'strict' | 'none';
    deviceIdMaxAge: number;
    refreshMaxAge: number;
  };
  r2: {
    accountId: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucketName: string;
    publicUrl: string;
  };
};

const CONFIG: ConfigType = {
  DATABASE_URL: process.env.DATABASE_URL!,
  PORT: Number(process.env.PORT) || 3000,
  // OAuth 완료 후 토큰을 들고 리다이렉트할 프론트 주소
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    redirectPath: '/auth/google/callback',
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET!,
    refreshSecret: process.env.JWT_REFRESH_SECRET!,
    accessExpiresIn: '1h',
    refreshExpiresIn: '1d',
  },
  cookie: {
    deviceIdName: 'device_id',
    refreshTokenName: 'refresh_token',
    // 운영: '.example.com' 처럼 공통 부모 도메인. 로컬: undefined
    domain: process.env.COOKIE_DOMAIN || undefined,
    secure: process.env.NODE_ENV === 'production',
    // cross-site(프론트≠백엔드 사이트)면 'none' 필요. 'none' 은 secure(HTTPS) 필수.
    // 로컬 same-site 는 'lax'.
    sameSite: 'lax',
    deviceIdMaxAge: 400 * 24 * 60 * 60 * 1000, // 400d (브라우저 쿠키 maxAge 상한)
    refreshMaxAge: 24 * 60 * 60 * 1000, // 1d (jwt.refreshExpiresIn 과 일치)
  },
  r2: {
    accountId: process.env.R2_ACCOUNT_ID!,
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    bucketName: process.env.R2_BUCKET_NAME || 'draft',
    // 버킷 공개 도메인 (r2.dev 하위 도메인 또는 커스텀 도메인, 끝에 / 없이)
    publicUrl: process.env.R2_PUBLIC_URL!,
  },
};

export default CONFIG;
