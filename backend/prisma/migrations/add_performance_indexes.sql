CREATE INDEX IF NOT EXISTS "idx_user_course_user_active" ON "UserCourse" ("userId", "isActive");
CREATE INDEX IF NOT EXISTS "idx_chapter_course_order" ON "Chapter" ("courseId", "orderIndex");
