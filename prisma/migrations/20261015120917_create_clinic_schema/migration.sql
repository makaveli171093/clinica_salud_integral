/*
  Warnings:

  - The values [COMPLETADA,ATENDIDO] on the enum `AppointmentStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `scheduled_at` on the `appointments` table. All the data in the column will be lost.
  - Added the required column `consulting_room_id` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end_time` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_time` to the `appointments` table without a default value. This is not possible if the table is not empty.

*/
-- Creando btree_gist (para evitar solapamientos en agendacion)
CREATE EXTENSION IF NOT EXISTS btree_gist;
-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO');

-- AlterEnum
BEGIN;
CREATE TYPE "AppointmentStatus_new" AS ENUM ('PROGRAMADA', 'CONFIRMADA', 'EN_ESPERA', 'EN_ATENCION', 'ATENDIDA', 'CANCELADA', 'NO_ASISTIO');
ALTER TABLE "public"."appointments" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "appointments" ALTER COLUMN "status" TYPE "AppointmentStatus_new" USING ("status"::text::"AppointmentStatus_new");
ALTER TYPE "AppointmentStatus" RENAME TO "AppointmentStatus_old";
ALTER TYPE "AppointmentStatus_new" RENAME TO "AppointmentStatus";
DROP TYPE "public"."AppointmentStatus_old";
ALTER TABLE "appointments" ALTER COLUMN "status" SET DEFAULT 'PROGRAMADA';
COMMIT;

-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_patient_id_fkey";

-- DropForeignKey
ALTER TABLE "medical_consultations" DROP CONSTRAINT "medical_consultations_medical_record_id_fkey";

-- DropForeignKey
ALTER TABLE "medical_records" DROP CONSTRAINT "medical_records_patient_id_fkey";

-- AlterTable
ALTER TABLE "appointments" DROP COLUMN "scheduled_at",
ADD COLUMN     "consulting_room_id" INTEGER NOT NULL,
ADD COLUMN     "end_time" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "is_overbooking" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "overbooking_reason" TEXT,
ADD COLUMN     "start_time" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "specialties" ADD COLUMN     "duration_minutes" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "requires_referral" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "doctor_schedules" (
    "id" SERIAL NOT NULL,
    "doctor_id" INTEGER NOT NULL,
    "consulting_room_id" INTEGER NOT NULL,
    "day_of_week" "DayOfWeek" NOT NULL,
    "start_time" VARCHAR(5) NOT NULL,
    "end_time" VARCHAR(5) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctor_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branches" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consulting_rooms" (
    "id" SERIAL NOT NULL,
    "branch_id" INTEGER NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consulting_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "doctor_schedules_doctor_id_day_of_week_start_time_key" ON "doctor_schedules"("doctor_id", "day_of_week", "start_time");

-- CreateIndex
CREATE UNIQUE INDEX "branches_name_key" ON "branches"("name");

-- CreateIndex
CREATE UNIQUE INDEX "consulting_rooms_branch_id_name_key" ON "consulting_rooms"("branch_id", "name");

-- CreateIndex
CREATE INDEX "appointments_doctor_id_start_time_end_time_idx" ON "appointments"("doctor_id", "start_time", "end_time");

-- CreateIndex
CREATE INDEX "appointments_consulting_room_id_start_time_end_time_idx" ON "appointments"("consulting_room_id", "start_time", "end_time");

-- CreateIndex
CREATE INDEX "appointments_patient_id_start_time_idx" ON "appointments"("patient_id", "start_time");

-- AddForeignKey
ALTER TABLE "doctor_schedules" ADD CONSTRAINT "doctor_schedules_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_schedules" ADD CONSTRAINT "doctor_schedules_consulting_room_id_fkey" FOREIGN KEY ("consulting_room_id") REFERENCES "consulting_rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_consulting_room_id_fkey" FOREIGN KEY ("consulting_room_id") REFERENCES "consulting_rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_consultations" ADD CONSTRAINT "medical_consultations_medical_record_id_fkey" FOREIGN KEY ("medical_record_id") REFERENCES "medical_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consulting_rooms" ADD CONSTRAINT "consulting_rooms_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Restricción contra solapamiento de horario para un mismo médico
ALTER TABLE "appointments"
ADD CONSTRAINT "no_overlapping_doctor_appointments"
EXCLUDE USING GIST (
  "doctor_id" WITH =,
  tsrange("start_time", "end_time") WITH &&
)
WHERE (status != 'CANCELADA' AND is_overbooking = false);

-- Restricción contra solapamiento de horario en un mismo consultorio
ALTER TABLE "appointments"
ADD CONSTRAINT "no_overlapping_room_appointments"
EXCLUDE USING GIST (
  "consulting_room_id" WITH =,
  tsrange("start_time", "end_time") WITH &&
)
WHERE (status != 'CANCELADA' AND is_overbooking = false);