-- This is an empty migration.
ALTER TABLE "books"
ADD CONSTRAINT "books_rating_check"
CHECK (
  rating IS NULL
  OR (
    status = 'read'
    AND rating BETWEEN 1 AND 5
  )
);