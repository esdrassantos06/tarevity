-- CreateIndex
CREATE INDEX "task_userId_status_dueDate_idx" ON "task"("userId", "status", "dueDate");

-- CreateIndex
CREATE INDEX "task_userId_status_createdAt_idx" ON "task"("userId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "task_userId_priority_idx" ON "task"("userId", "priority");
