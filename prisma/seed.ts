import 'dotenv/config';
import { PrismaClient } from '@/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

// 직무 그룹(JobGroup) → 하위 카테고리(JobCategory) 시드 데이터.
// 필요에 맞게 자유롭게 추가/수정하세요. slug 는 그룹의 고유 키로 사용됩니다.
const GROUPS: { name: string; slug: string; categories: string[] }[] = [
  {
    name: '개발',
    slug: 'development',
    categories: [
      '프론트엔드',
      '백엔드',
      '풀스택',
      '모바일',
      'DevOps',
      '데이터 엔지니어',
    ],
  },
  {
    name: '디자인',
    slug: 'design',
    categories: ['UX/UI 디자인', '그래픽 디자인', '프로덕트 디자인', '브랜드 디자인'],
  },
  {
    name: '기획·PM',
    slug: 'product-management',
    categories: ['서비스 기획', '프로덕트 매니저', '프로젝트 매니저', '데이터 분석'],
  },
  {
    name: '마케팅',
    slug: 'marketing',
    categories: ['퍼포먼스 마케팅', '콘텐츠 마케팅', '브랜드 마케팅', 'CRM'],
  },
];

async function main() {
  for (const group of GROUPS) {
    // slug 기준 upsert → 재실행해도 중복 생성되지 않음
    const savedGroup = await prisma.jobGroup.upsert({
      where: { slug: group.slug },
      update: { name: group.name },
      create: { name: group.name, slug: group.slug },
    });

    for (const categoryName of group.categories) {
      // @@unique([name, groupId]) 복합키 기준 upsert
      await prisma.jobCategory.upsert({
        where: {
          name_groupId: { name: categoryName, groupId: savedGroup.id },
        },
        update: {},
        create: { name: categoryName, groupId: savedGroup.id },
      });
    }

    console.log(
      `✅ ${group.name}(${group.slug}) + 카테고리 ${group.categories.length}개`,
    );
  }
}

main()
  .then(() => console.log('🌱 Seed completed'))
  .catch((e) => {
    console.error('❌ Seed failed', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });