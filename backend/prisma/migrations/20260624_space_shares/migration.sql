-- CreateEnum
CREATE TYPE "SpaceShareRole" AS ENUM ('VIEWER', 'EDITOR');

-- CreateTable
CREATE TABLE "SpaceShare" (
    "id" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "SpaceShareRole" NOT NULL DEFAULT 'VIEWER',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpaceShare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SpaceShare_spaceId_userId_key" ON "SpaceShare"("spaceId", "userId");

-- CreateIndex
CREATE INDEX "SpaceShare_userId_idx" ON "SpaceShare"("userId");

-- CreateIndex
CREATE INDEX "SpaceShare_spaceId_idx" ON "SpaceShare"("spaceId");

-- AddForeignKey
ALTER TABLE "SpaceShare" ADD CONSTRAINT "SpaceShare_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpaceShare" ADD CONSTRAINT "SpaceShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpaceShare" ADD CONSTRAINT "SpaceShare_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
