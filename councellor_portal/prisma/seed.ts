// prisma/seed.ts

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

// Create adapter for seed script
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  const passwordHash = await bcrypt.hash("password123", 10);

  // Create counselors
  const counselor = await prisma.counselor.upsert({
    where: { email: "counselor@example.com" },
    update: {},
    create: {
      email: "counselor@example.com",
      passwordHash,
      fullName: "Dr. Jane Smith",
      role: "COUNSELOR",
    },
  });

  const senior = await prisma.counselor.upsert({
    where: { email: "senior@example.com" },
    update: {},
    create: {
      email: "senior@example.com",
      passwordHash,
      fullName: "Dr. John Doe",
      role: "SENIOR_COUNSELOR",
    },
  });

  console.log("✅ Created counselors");

  // Create sample cases
  const criticalCase = await prisma.case.create({
    data: {
      studentId: "student-001",
      studentName: "Alice Johnson",
      studentEmail: "alice@student.edu",
      riskLevel: "CRITICAL",
      riskScore: 92.5,
      triggerType: "ASSESSMENT_HIGH",
      emotionSnapshot: {
        sadness: 0.92,
        anxiety: 0.88,
        joy: 0.05,
        neutral: 0.1,
      },
      assessmentData: {
        type: "PHQ9",
        score: 22,
        timestamp: new Date().toISOString(),
      },
    },
  });

  const highCase = await prisma.case.create({
    data: {
      studentId: "student-002",
      studentName: "Bob Williams",
      studentEmail: "bob@student.edu",
      riskLevel: "HIGH",
      riskScore: 78.3,
      triggerType: "EMOTION_ANOMALY",
      emotionSnapshot: {
        sadness: 0.75,
        anxiety: 0.68,
        joy: 0.15,
        neutral: 0.2,
      },
    },
  });

  console.log("✅ Created sample cases");
  console.log("✨ Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
