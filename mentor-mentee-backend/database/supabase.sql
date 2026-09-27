-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MENTOR', 'MENTEE');

-- CreateEnum
CREATE TYPE "FormStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "IssueStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "IssueType" AS ENUM ('ACADEMIC', 'PERSONAL');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "isFirstLogin" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "academic_year" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mentor" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "academic_year" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mentor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mentee" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "prn" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "academic_year" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "mentorId" UUID,

    CONSTRAINT "Mentee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MentorshipForm" (
    "id" UUID NOT NULL,
    "menteeId" UUID NOT NULL,
    "status" "FormStatus" NOT NULL DEFAULT 'PENDING',
    "academic_year" TEXT NOT NULL,
    "formData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MentorshipForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeetingReport" (
    "id" UUID NOT NULL,
    "meetingNumber" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "semester" TEXT NOT NULL,
    "academic_year" TEXT NOT NULL,
    "agenda" TEXT NOT NULL,
    "discussion" TEXT NOT NULL,
    "suggestions" TEXT NOT NULL,
    "conclusion" TEXT NOT NULL,
    "attendanceCount" INTEGER NOT NULL,
    "mentorId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MeetingReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IssueLog" (
    "id" UUID NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "academic_year" TEXT NOT NULL,
    "issueType" "IssueType" NOT NULL,
    "description" TEXT NOT NULL,
    "actionTaken" TEXT NOT NULL,
    "referredTo" TEXT,
    "followUpDate" TIMESTAMP(3),
    "status" "IssueStatus" NOT NULL DEFAULT 'OPEN',
    "mentorId" UUID NOT NULL,
    "menteeId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IssueLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgressRecord" (
    "id" UUID NOT NULL,
    "semester" TEXT NOT NULL,
    "academic_year" TEXT NOT NULL,
    "cgpa" DOUBLE PRECISION NOT NULL,
    "attendance" DOUBLE PRECISION NOT NULL,
    "backlogs" INTEGER NOT NULL,
    "technicalSkills" TEXT NOT NULL,
    "communicationSkills" TEXT NOT NULL,
    "activities" TEXT NOT NULL,
    "certifications" TEXT NOT NULL,
    "internships" TEXT NOT NULL,
    "projects" TEXT NOT NULL,
    "selfRating" INTEGER NOT NULL,
    "autoScore" DOUBLE PRECISION,
    "menteeId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgressRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuidanceMessage" (
    "id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "academic_year" TEXT NOT NULL,
    "isFromMentor" BOOLEAN NOT NULL DEFAULT true,
    "mentorId" UUID NOT NULL,
    "menteeId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuidanceMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeetingSchedule" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "academic_year" TEXT NOT NULL,
    "isBatch" BOOLEAN NOT NULL DEFAULT true,
    "mentorId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MeetingSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "academic_year" TEXT NOT NULL,
    "menteeId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Mentor_userId_key" ON "Mentor"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Mentor_email_key" ON "Mentor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Mentee_userId_key" ON "Mentee"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Mentee_prn_key" ON "Mentee"("prn");

-- CreateIndex
CREATE UNIQUE INDEX "Mentee_email_key" ON "Mentee"("email");

-- CreateIndex
CREATE UNIQUE INDEX "MentorshipForm_menteeId_key" ON "MentorshipForm"("menteeId");

-- AddForeignKey
ALTER TABLE "Mentor" ADD CONSTRAINT "Mentor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mentee" ADD CONSTRAINT "Mentee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mentee" ADD CONSTRAINT "Mentee_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "Mentor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorshipForm" ADD CONSTRAINT "MentorshipForm_menteeId_fkey" FOREIGN KEY ("menteeId") REFERENCES "Mentee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingReport" ADD CONSTRAINT "MeetingReport_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "Mentor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueLog" ADD CONSTRAINT "IssueLog_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "Mentor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueLog" ADD CONSTRAINT "IssueLog_menteeId_fkey" FOREIGN KEY ("menteeId") REFERENCES "Mentee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressRecord" ADD CONSTRAINT "ProgressRecord_menteeId_fkey" FOREIGN KEY ("menteeId") REFERENCES "Mentee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuidanceMessage" ADD CONSTRAINT "GuidanceMessage_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "Mentor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuidanceMessage" ADD CONSTRAINT "GuidanceMessage_menteeId_fkey" FOREIGN KEY ("menteeId") REFERENCES "Mentee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingSchedule" ADD CONSTRAINT "MeetingSchedule_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "Mentor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_menteeId_fkey" FOREIGN KEY ("menteeId") REFERENCES "Mentee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
