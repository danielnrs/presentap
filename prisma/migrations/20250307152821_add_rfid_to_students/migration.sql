/*
  Warnings:

  - A unique constraint covering the columns `[rfid]` on the table `students` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `students` ADD COLUMN `rfid` VARCHAR(50) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `students_rfid_key` ON `students`(`rfid`);
