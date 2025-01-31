-- CreateTable
CREATE TABLE "configurations" (
    "id" TEXT NOT NULL,
    "SMTP_HOST" TEXT NOT NULL,
    "SMTP_PORT" TEXT NOT NULL,
    "SMTP_USER" TEXT NOT NULL,
    "SMTP_PASS" TEXT NOT NULL,
    "EMAIL_FROM" TEXT NOT NULL,
    "EMAIL_SUBJECT" TEXT NOT NULL,
    "EMAIL_RATE_LIMIT" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "configurations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "configurations_userId_key" ON "configurations"("userId");

-- AddForeignKey
ALTER TABLE "configurations" ADD CONSTRAINT "configurations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
