-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "passwordHash" TEXT,
    "schoolId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "School" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "soumCode" TEXT,
    "district" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SchoolClass" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "gradeLevel" INTEGER,
    "sourceClassId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SchoolClass_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SchoolClass_sourceClassId_fkey" FOREIGN KEY ("sourceClassId") REFERENCES "SchoolClass" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Child" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "classId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "childKey" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "birthYear" INTEGER NOT NULL,
    "rosterSlot" INTEGER NOT NULL,
    "gender" TEXT,
    "guardianPhone" TEXT,
    "consentObtained" BOOLEAN NOT NULL DEFAULT false,
    "consentAt" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Child_classId_fkey" FOREIGN KEY ("classId") REFERENCES "SchoolClass" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Child_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Screening" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "childKey" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "screenedById" TEXT NOT NULL,
    "triageLevel" TEXT NOT NULL,
    "triageScore" REAL NOT NULL,
    "triageConfidentWording" BOOLEAN NOT NULL,
    "triageReason" TEXT,
    "modelName" TEXT NOT NULL,
    "modelVersion" TEXT,
    "contentVersionId" TEXT NOT NULL,
    "capturedAt" DATETIME NOT NULL,
    "deviceId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "syncedAt" DATETIME,
    CONSTRAINT "Screening_screenedById_fkey" FOREIGN KEY ("screenedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Screening_contentVersionId_fkey" FOREIGN KEY ("contentVersionId") REFERENCES "ContentVersion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ScreeningImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "screeningId" TEXT NOT NULL,
    "ref" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ScreeningImage_screeningId_fkey" FOREIGN KEY ("screeningId") REFERENCES "Screening" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ToothFinding" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "screeningId" TEXT NOT NULL,
    "fdi" INTEGER,
    "className" TEXT NOT NULL,
    "classId" INTEGER NOT NULL,
    "confidence" REAL NOT NULL,
    "boxX1" REAL NOT NULL,
    "boxY1" REAL NOT NULL,
    "boxX2" REAL NOT NULL,
    "boxY2" REAL NOT NULL,
    "longitudinal" TEXT,
    CONSTRAINT "ToothFinding_screeningId_fkey" FOREIGN KEY ("screeningId") REFERENCES "Screening" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Questionnaire" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "screeningId" TEXT NOT NULL,
    "swelling" BOOLEAN,
    "painDisturbingSleepOrEating" BOOLEAN,
    "fever" BOOLEAN,
    "gumPimpleOrFistula" BOOLEAN,
    "trauma" BOOLEAN,
    CONSTRAINT "Questionnaire_screeningId_fkey" FOREIGN KEY ("screeningId") REFERENCES "Screening" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FollowUp" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "childKey" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'flagged',
    "assignedToId" TEXT,
    "appointmentAt" DATETIME,
    "notifiedAt" DATETIME,
    "notificationChannel" TEXT,
    "notes" TEXT,
    "updatedAt" DATETIME NOT NULL,
    "updatedById" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "FollowUp_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "FollowUp_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContentVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "version" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "publishedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedById" TEXT NOT NULL,
    CONSTRAINT "ContentVersion_publishedById_fkey" FOREIGN KEY ("publishedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolClass_schoolId_name_seasonId_key" ON "SchoolClass"("schoolId", "name", "seasonId");

-- CreateIndex
CREATE INDEX "Child_childKey_idx" ON "Child"("childKey");

-- CreateIndex
CREATE UNIQUE INDEX "Child_classId_rosterSlot_key" ON "Child"("classId", "rosterSlot");

-- CreateIndex
CREATE UNIQUE INDEX "Child_classId_childKey_key" ON "Child"("classId", "childKey");

-- CreateIndex
CREATE INDEX "Screening_childKey_idx" ON "Screening"("childKey");

-- CreateIndex
CREATE INDEX "Screening_childKey_seasonId_idx" ON "Screening"("childKey", "seasonId");

-- CreateIndex
CREATE INDEX "Screening_schoolId_seasonId_idx" ON "Screening"("schoolId", "seasonId");

-- CreateIndex
CREATE UNIQUE INDEX "Questionnaire_screeningId_key" ON "Questionnaire"("screeningId");

-- CreateIndex
CREATE UNIQUE INDEX "FollowUp_childKey_key" ON "FollowUp"("childKey");

-- CreateIndex
CREATE INDEX "FollowUp_schoolId_status_idx" ON "FollowUp"("schoolId", "status");
