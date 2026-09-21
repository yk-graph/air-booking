/*
  Warnings:

  - You are about to drop the column `accountId` on the `Passenger` table. All the data in the column will be lost.
  - You are about to drop the column `bookingId` on the `Ticket` table. All the data in the column will be lost.
  - Added the required column `bookingId` to the `Passenger` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Passenger` DROP FOREIGN KEY `Passenger_accountId_fkey`;

-- DropForeignKey
ALTER TABLE `Ticket` DROP FOREIGN KEY `Ticket_bookingId_fkey`;

-- DropForeignKey
ALTER TABLE `Ticket` DROP FOREIGN KEY `Ticket_passengerId_fkey`;

-- DropIndex
DROP INDEX `Passenger_accountId_idx` ON `Passenger`;

-- DropIndex
DROP INDEX `Passenger_countryOfIssue_passportNumber_key` ON `Passenger`;

-- DropIndex
DROP INDEX `Ticket_bookingId_idx` ON `Ticket`;

-- AlterTable
ALTER TABLE `Passenger` DROP COLUMN `accountId`,
    ADD COLUMN `bookingId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Ticket` DROP COLUMN `bookingId`;

-- CreateIndex
CREATE INDEX `Passenger_bookingId_idx` ON `Passenger`(`bookingId`);

-- AddForeignKey
ALTER TABLE `Passenger` ADD CONSTRAINT `Passenger_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_passengerId_fkey` FOREIGN KEY (`passengerId`) REFERENCES `Passenger`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
