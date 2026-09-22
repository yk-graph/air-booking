/*
  Warnings:

  - You are about to drop the column `passengerId` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the `Passenger` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `firstName` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bookingId` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Passenger` DROP FOREIGN KEY `Passenger_bookingId_fkey`;

-- DropForeignKey
ALTER TABLE `Ticket` DROP FOREIGN KEY `Ticket_passengerId_fkey`;

-- DropIndex
DROP INDEX `Ticket_passengerId_idx` ON `Ticket`;

-- AlterTable
ALTER TABLE `Booking` ADD COLUMN `countryOfIssue` VARCHAR(191) NULL,
    ADD COLUMN `dateOfBirth` DATETIME(3) NULL,
    ADD COLUMN `dateOfExpiry` DATETIME(3) NULL,
    ADD COLUMN `dateOfIssue` DATETIME(3) NULL,
    ADD COLUMN `firstName` VARCHAR(191) NOT NULL,
    ADD COLUMN `lastName` VARCHAR(191) NOT NULL,
    ADD COLUMN `middleName` VARCHAR(191) NULL,
    ADD COLUMN `nationality` VARCHAR(191) NULL,
    ADD COLUMN `passportNumber` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Ticket` DROP COLUMN `passengerId`,
    ADD COLUMN `bookingId` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `Passenger`;

-- CreateIndex
CREATE INDEX `Ticket_bookingId_idx` ON `Ticket`(`bookingId`);

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
