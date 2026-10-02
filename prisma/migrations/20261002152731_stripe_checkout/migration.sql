-- AlterTable
ALTER TABLE `Account` ADD COLUMN `stripeCustomerId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Booking` ADD COLUMN `expiresAt` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `Payment` (
    `id` VARCHAR(191) NOT NULL,
    `bookingId` VARCHAR(191) NOT NULL,
    `stripeCheckoutSessionId` VARCHAR(191) NOT NULL,
    `stripePaymentIntentId` VARCHAR(191) NULL,
    `amount` INTEGER NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'cad',
    `status` ENUM('PENDING', 'SUCCEEDED', 'FAILED', 'EXPIRED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `receiptUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Payment_stripeCheckoutSessionId_key`(`stripeCheckoutSessionId`),
    UNIQUE INDEX `Payment_stripePaymentIntentId_key`(`stripePaymentIntentId`),
    INDEX `Payment_bookingId_idx`(`bookingId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StripeEvent` (
    `id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Account_stripeCustomerId_key` ON `Account`(`stripeCustomerId`);

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

