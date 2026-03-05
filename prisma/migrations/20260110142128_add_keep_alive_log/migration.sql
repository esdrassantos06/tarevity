-- CreateTable
CREATE TABLE "db_keep_alive_log" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,

    CONSTRAINT "db_keep_alive_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "db_keep_alive_log_createdAt_idx" ON "db_keep_alive_log"("createdAt");
