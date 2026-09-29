-- DropForeignKey
ALTER TABLE `Flight` DROP FOREIGN KEY `Flight_destinationAirportId_fkey`;

-- DropForeignKey
ALTER TABLE `Flight` DROP FOREIGN KEY `Flight_originAirportId_fkey`;

-- DropIndex
DROP INDEX `Flight_destinationAirportId_idx` ON `Flight`;

-- DropIndex
DROP INDEX `Flight_originAirportId_idx` ON `Flight`;

-- AlterTable
ALTER TABLE `Flight` DROP COLUMN `destinationAirportId`,
    DROP COLUMN `originAirportId`,
    ADD COLUMN `flightMapId` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `FlightMap` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `originAirportId` VARCHAR(191) NOT NULL,
    `destinationAirportId` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `FlightMap_code_key`(`code`),
    UNIQUE INDEX `FlightMap_originAirportId_destinationAirportId_key`(`originAirportId`, `destinationAirportId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Flight_flightMapId_idx` ON `Flight`(`flightMapId`);

-- AddForeignKey
ALTER TABLE `FlightMap` ADD CONSTRAINT `FlightMap_originAirportId_fkey` FOREIGN KEY (`originAirportId`) REFERENCES `Airport`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FlightMap` ADD CONSTRAINT `FlightMap_destinationAirportId_fkey` FOREIGN KEY (`destinationAirportId`) REFERENCES `Airport`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Flight` ADD CONSTRAINT `Flight_flightMapId_fkey` FOREIGN KEY (`flightMapId`) REFERENCES `FlightMap`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

