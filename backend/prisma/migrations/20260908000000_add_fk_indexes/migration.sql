-- CreateIndex
CREATE INDEX IF NOT EXISTS "episodes_movieId_idx" ON "episodes"("movieId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "favorites_userId_idx" ON "favorites"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "favorites_movieId_idx" ON "favorites"("movieId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "watch_histories_movieId_idx" ON "watch_histories"("movieId");
