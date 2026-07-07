ALTER TABLE "tags"
ADD CONSTRAINT "tags_name_lowercase_check"
CHECK ("name" = lower("name"));