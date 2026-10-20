-- AlterTable
ALTER TABLE "consulting_rooms" ADD COLUMN     "preparation_minutes" INTEGER;
ALTER TABLE "consulting_rooms"
ADD CONSTRAINT "consulting_rooms_preparation_minutes_nonnegative"
CHECK ("preparation_minutes" >= 0);