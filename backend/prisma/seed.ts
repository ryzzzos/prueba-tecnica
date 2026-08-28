import { PrismaClient, DiscountType, PromotionStatus, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('[INFO] Starting database seed...');

  // 1. Seed Categories
  const categoriesData = [
    { name: 'Bebidas y Refrescos', description: 'Gaseosas, jugos, aguas y bebidas energeticas', position: 0, isActive: true },
    { name: 'Snacks y Confiteria', description: 'Papas fritas, galletas, chocolates y golosinas', position: 1, isActive: true },
    { name: 'Lacteos y Refrigerados', description: 'Leche, yogur, quesos y mantequilla', position: 2, isActive: true },
    { name: 'Panaderia y Pasteleria', description: 'Pan fresco, panes envasados y pasteleria', position: 3, isActive: true },
    { name: 'Cuidado Personal', description: 'Shampoo, jabones, desodorantes y cuidado bucal', position: 4, isActive: true },
    { name: 'Limpieza del Hogar', description: 'Detergentes, desinfectantes y papel higienico', position: 5, isActive: true },
  ];

  const categories = [];
  for (const cat of categoriesData) {
    const category = await prisma.category.upsert({
      where: { name: cat.name },
      update: { position: cat.position, isActive: cat.isActive },
      create: cat,
    });
    categories.push(category);
  }

  console.log(`[SUCCESS] Seeded ${categories.length} categories.`);

  // 2. Seed Sample Products
  const existingProductsCount = await prisma.product.count();
  const products = [];
  if (existingProductsCount === 0) {
    const sampleProducts = [
      {
        name: 'Coca Cola Sin Azúcar 1.5L',
        description: 'Bebida gaseosa refrescante sin calorías en botella retornable',
        price: new Prisma.Decimal(4500),
        sku: 'BEB-001',
        imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80',
        isActive: true,
        categoryId: categories[0].id,
      },
      {
        name: 'Jugo Natural Naranja 1L',
        description: 'Jugo 100% fruta pasteurizado sin azúcar añadida',
        price: new Prisma.Decimal(6200),
        sku: 'BEB-002',
        imageUrl: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&auto=format&fit=crop&q=80',
        isActive: true,
        categoryId: categories[0].id,
      },
      {
        name: 'Papas Fritas Artesanales Sal Marina 150g',
        description: 'Papas crujientes con sal marina natural libre de grasas trans',
        price: new Prisma.Decimal(5500),
        sku: 'SNK-001',
        imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600&auto=format&fit=crop&q=80',
        isActive: true,
        categoryId: categories[1].id,
      },
      {
        name: 'Chocolate Amargo 70% Cacao 80g',
        description: 'Tableta de chocolate fino de origen colombiano',
        price: new Prisma.Decimal(8900),
        sku: 'SNK-002',
        imageUrl: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=600&auto=format&fit=crop&q=80',
        isActive: true,
        categoryId: categories[1].id,
      },
      {
        name: 'Leche Entera Larga Vida 1L',
        description: 'Leche entera ultrapasteurizada enriquecida con vitaminas A y D',
        price: new Prisma.Decimal(4200),
        sku: 'LAC-001',
        imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80',
        isActive: true,
        categoryId: categories[2].id,
      },
      {
        name: 'Queso Mozzarella Tajado 250g',
        description: 'Queso semi-graso ideal para sándwiches y pizzas',
        price: new Prisma.Decimal(9800),
        sku: 'LAC-002',
        imageUrl: 'https://images.unsplash.com/photo-1589881133803-a4e068f1b6dd?w=600&auto=format&fit=crop&q=80',
        isActive: true,
        categoryId: categories[2].id,
      },
      {
        name: 'Pan Tajado Integral con Semillas 500g',
        description: 'Pan horneado con masa madre, chía, lino y avena',
        price: new Prisma.Decimal(6800),
        sku: 'PAN-001',
        imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
        isActive: true,
        categoryId: categories[3].id,
      },
      {
        name: 'Detergente Líquido Ropa Concentrado 2L',
        description: 'Fórmula biodegradable con poder quitamanchas activo',
        price: new Prisma.Decimal(24900),
        sku: 'LMP-001',
        imageUrl: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=600&auto=format&fit=crop&q=80',
        isActive: true,
        categoryId: categories[5].id,
      },
    ];

    for (const p of sampleProducts) {
      const createdProd = await prisma.product.create({ data: p });
      products.push(createdProd);
    }
    console.log(`[SUCCESS] Seeded ${products.length} sample products.`);
  } else {
    console.log('[INFO] Products already exist, skipping sample products seed.');
  }

  // 3. Seed Sample Promotions (only if none exist)
  const existingPromotionsCount = await prisma.promotion.count();
  if (existingPromotionsCount === 0) {
    const now = new Date();
    const allProducts = products.length > 0 ? products : await prisma.product.findMany();

    const samplePromotions = [
      {
        name: 'Super Descuento Bebidas de Verano',
        scopeType: 'PRODUCT',
        categoryId: categories[0].id,
        productId: allProducts[0]?.id || null,
        categories: { connect: [{ id: categories[0].id }] },
        products: allProducts[0] ? { connect: [{ id: allProducts[0].id }] } : undefined,
        discountType: DiscountType.PERCENTAGE,
        discountValue: new Prisma.Decimal(20), // 20%
        startDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // Hace 2 dias
        endDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // En 5 dias
        status: PromotionStatus.ACTIVE,
      },
      {
        name: 'Promo 2x1 en Snacks Salados',
        scopeType: 'CATEGORY',
        categoryId: categories[1].id,
        productId: null,
        categories: { connect: [{ id: categories[1].id }] },
        discountType: DiscountType.FIXED_AMOUNT,
        discountValue: new Prisma.Decimal(1500), // $1500 de descuento fijo
        startDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000), // Manana
        endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // En 7 dias
        status: PromotionStatus.PROGRAMMED,
      },
      {
        name: 'Rebajas Especiales Lacteos Premium',
        scopeType: 'CATEGORY',
        categoryId: categories[2].id,
        productId: null,
        categories: { connect: [{ id: categories[2].id }] },
        discountType: DiscountType.PERCENTAGE,
        discountValue: new Prisma.Decimal(15), // 15%
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
