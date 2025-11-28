import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  const passwordHash = await bcrypt.hash("password123", 10);

  const counselor1 = await prisma.counselor.upsert({
    where: { email: "counselor1@example.com" },
    update: {},
    create: {
      email: "counselor1@example.com",
      passwordHash,
      fullName: "Dr. Jane Smith",
      currentCaseLoad: 0,
      maxCaseLoad: 10,
    },
  });

  const counselor2 = await prisma.counselor.upsert({
    where: { email: "counselor2@example.com" },
    update: {},
    create: {
      email: "counselor2@example.com",
      passwordHash,
      fullName: "Dr. John Doe",
      currentCaseLoad: 0,
      maxCaseLoad: 10,
    },
  });

  const counselor3 = await prisma.counselor.upsert({
    where: { email: "counselor3@example.com" },
    update: {},
    create: {
      email: "counselor3@example.com",
      passwordHash,
      fullName: "Dr. Sarah Wilson",
      currentCaseLoad: 0,
      maxCaseLoad: 8,
    },
  });

  console.log("✅ Created counselors");

  await prisma.case.create({
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
      assignedToId: counselor1.id,
      assignedAt: new Date(),
      status: "ASSIGNED",
    },
  });

  await prisma.counselor.update({
    where: { id: counselor1.id },
    data: { currentCaseLoad: 1 },
  });

  console.log("✅ Created sample cases");
  console.log("✨ Seeding completed!");
  console.log("\nLogin credentials:");
  console.log("- counselor1@example.com / password123");
  console.log("- counselor2@example.com / password123");
  console.log("- counselor3@example.com / password123");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
