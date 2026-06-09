# syntax=docker/dockerfile:1
# check=error=true
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

HEALTHCHECK --start-period=15s --start-interval=2s \
    CMD wget -qO- http://localhost:3000/health || exit 1

EXPOSE 3000
CMD ["npm", "run", "start:prod"]

# GHCR 로그인 (write:packages 권한 PAT 필요)
# PowerShell:  $env:CR_PAT | docker login ghcr.io -u hyeongu01 --password-stdin
#
# (최초 1회) buildx 빌더 생성 + QEMU 부트스트랩
# docker buildx create --name multi --use
# docker buildx inspect --bootstrap
#
# 멀티아키(amd64 + arm64) 빌드 후 GHCR 로 바로 push
# 윈도우 빌드 → 라즈베리파이(aarch64) 에서 실행하려면 멀티아키 필수
# docker buildx build --platform linux/amd64,linux/arm64 -t ghcr.io/hyeongu01/draft-backend:0.0.1 --push .
#
# (라즈베리파이에서) 이미지 pull — 아키텍처에 맞는 arm64 변형이 자동 선택됨
# docker pull ghcr.io/hyeongu01/draft-backend:0.0.1
#
# (라즈베리파이에서) 컨테이너 실행 (이름 지정, 백그라운드, 포트 매핑, env 주입)
# docker run -d --name draft-backend -p 3000:3000 --env-file .env ghcr.io/hyeongu01/draft-backend:0.0.1
#
# 컨테이너 중지 & 삭제
# docker stop draft-backend
# docker rm draft-backend
#
# 이미지 아키텍처 확인 (멀티아키 매니페스트 확인)
# docker buildx imagetools inspect ghcr.io/hyeongu01/draft-backend:0.0.1
