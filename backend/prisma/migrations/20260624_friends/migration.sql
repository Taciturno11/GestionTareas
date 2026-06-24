CREATE TYPE "FriendRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELED');

CREATE TABLE "FriendRequest" (
  "id" TEXT NOT NULL,
  "requesterId" TEXT NOT NULL,
  "recipientId" TEXT NOT NULL,
  "status" "FriendRequestStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "respondedAt" TIMESTAMP(3),

  CONSTRAINT "FriendRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Friendship" (
  "id" TEXT NOT NULL,
  "userAId" TEXT NOT NULL,
  "userBId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Friendship_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "FriendRequest_requesterId_status_idx" ON "FriendRequest"("requesterId", "status");
CREATE INDEX "FriendRequest_recipientId_status_idx" ON "FriendRequest"("recipientId", "status");
CREATE INDEX "FriendRequest_requesterId_recipientId_idx" ON "FriendRequest"("requesterId", "recipientId");
CREATE UNIQUE INDEX "Friendship_userAId_userBId_key" ON "Friendship"("userAId", "userBId");
CREATE INDEX "Friendship_userBId_idx" ON "Friendship"("userBId");

ALTER TABLE "FriendRequest" ADD CONSTRAINT "FriendRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FriendRequest" ADD CONSTRAINT "FriendRequest_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_userAId_fkey" FOREIGN KEY ("userAId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_userBId_fkey" FOREIGN KEY ("userBId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
