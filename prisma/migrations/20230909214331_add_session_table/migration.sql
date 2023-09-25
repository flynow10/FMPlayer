-- CreateTable
CREATE TABLE `Session` (
    `refreshToken` CHAR(64) NOT NULL,
    `expiresOn` DATETIME(3) NOT NULL,

    PRIMARY KEY (`refreshToken`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
