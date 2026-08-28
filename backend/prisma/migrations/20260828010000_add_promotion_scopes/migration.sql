-- Add scope_type column to promotions table if not present
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'promotions' AND column_name = 'scope_type'
    ) THEN
        ALTER TABLE "promotions" ADD COLUMN "scope_type" TEXT NOT NULL DEFAULT 'CATEGORY';
    END IF;
END $$;

-- Make category_id nullable in promotions
ALTER TABLE "promotions" ALTER COLUMN "category_id" DROP NOT NULL;

-- Update foreign key on promotions.category_id to SET NULL
ALTER TABLE "promotions" DROP CONSTRAINT IF EXISTS "promotions_category_id_fkey";
ALTER TABLE "promotions" ADD CONSTRAINT "promotions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex for scope_type if not exists
CREATE INDEX IF NOT EXISTS "promotions_scope_type_idx" ON "promotions"("scope_type");

-- Create Junction Table _PromotionCategories if not exists
CREATE TABLE IF NOT EXISTS "_PromotionCategories" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PromotionCategories_AB_pkey" PRIMARY KEY ("A","B")
);

-- Create Junction Table _PromotionProducts if not exists
CREATE TABLE IF NOT EXISTS "_PromotionProducts" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PromotionProducts_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndexes for junction tables
CREATE INDEX IF NOT EXISTS "_PromotionCategories_B_index" ON "_PromotionCategories"("B");
CREATE INDEX IF NOT EXISTS "_PromotionProducts_B_index" ON "_PromotionProducts"("B");

-- AddForeignKeys for junction tables
ALTER TABLE "_PromotionCategories" DROP CONSTRAINT IF EXISTS "_PromotionCategories_A_fkey";
ALTER TABLE "_PromotionCategories" ADD CONSTRAINT "_PromotionCategories_A_fkey" FOREIGN KEY ("A") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_PromotionCategories" DROP CONSTRAINT IF EXISTS "_PromotionCategories_B_fkey";
ALTER TABLE "_PromotionCategories" ADD CONSTRAINT "_PromotionCategories_B_fkey" FOREIGN KEY ("B") REFERENCES "promotions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_PromotionProducts" DROP CONSTRAINT IF EXISTS "_PromotionProducts_A_fkey";
ALTER TABLE "_PromotionProducts" ADD CONSTRAINT "_PromotionProducts_A_fkey" FOREIGN KEY ("A") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_PromotionProducts" DROP CONSTRAINT IF EXISTS "_PromotionProducts_B_fkey";
ALTER TABLE "_PromotionProducts" ADD CONSTRAINT "_PromotionProducts_B_fkey" FOREIGN KEY ("B") REFERENCES "promotions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
