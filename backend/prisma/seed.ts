import { PrismaClient, DiscountType, PromotionStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('[INFO] Starting database seed...');

  // 1. Seed Categories
  const categoriesData = [
    { name: 'Bebidas y Refrescos', description: 'Gaseosas, jugos, aguas y bebidas energeticas' },
    { name: 'Snacks y Confiteria', description: 'Papas fritas, galletas, chocolates y golosinas' },
    { name: 'Lacteos y Refrigerados', description: 'Leche, yogur, quesos y mantequilla' },
    { name: 'Panaderia y Pasteleria', description: 'Pan fresco, panes envasados y pasteleria' },
    { name: 'Cuidado Personal', description: 'Shampoo, jabones, desodorantes y cuidado bucal' },
    { name: 'Limpieza del Hogar', description: 'Detergentes, desinfectantes y papel higienico' },
  ];

  const categories = [];
  for (const cat of categoriesData) {
    const category = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
    categories.push(category);
  }

  console.log(`[SUCCESS] Seeded ${categories.length} categories.`);

  // 2. Seed Sample Promotions (only if none exist)
  const existingPromotionsCount = await prisma.promotion.count();
  if (existingPromotionsCount === 0) {
    const now = new Date();

    const samplePromotions = [
      {
        name: 'Super Descuento Bebidas de Verano',
        categoryId: categories[0].id,
        discountType: DiscountType.PERCENTAGE,
        discountValue: 20, // 20%
        startDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // Hace 2 dias
        endDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // En 5 dias
        status: PromotionStatus.ACTIVE,
      },
      {
        name: 'Promo 2x1 en Snacks Salados',
        categoryId: categories[1].id,
        discountType: DiscountType.FIXED_AMOUNT,
        discountValue: 1500, // $1500 de descuento fijo
        startDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000), // Manana
        endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // En 7 dias
        status: PromotionStatus.PROGRAMMED,
      },
      {
        name: 'Rebajas Especiales Lacteos Premium',
        categoryId: categories[2].id,
        discountType: DiscountType.PERCENTAGE,
        discountValue: 15, // 15%
        startDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // Hace 10 dias
        endDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // Ayer (vencida)
        status: PromotionStatus.FINISHED,
      },
    ];

    for (const promo of samplePromotions) {
      await prisma.promotion.create({ data: promo });
    }

    console.log(`[SUCCESS] Seeded ${samplePromotions.length} sample promotions.`);
  } else {
    console.log('[INFO] Promotions already exist, skipping sample promotions seed.');
  }

  console.log('[SUCCESS] Database seed completed successfully.');
}

main()
  .catch((e) => {
    console.error('[ERROR] Error during seed execution:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
