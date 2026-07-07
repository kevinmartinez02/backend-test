-- CreateTable
CREATE TABLE "status_history" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "from_status" "book_status",
    "to_status" "book_status" NOT NULL,
    "changed_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "status_history_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "status_history" ADD CONSTRAINT "status_history_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
