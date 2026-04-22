import { PrismaPg } from "@prisma/adapter-pg";
import {
  ContractStage,
  PredictionMethod,
  PrismaClient,
} from "../src/generated/prisma/client";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/bidvault?schema=public";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@thebidvault.local" },
    update: { name: "Demo User" },
    create: {
      email: "demo@thebidvault.local",
      name: "Demo User",
    },
  });

  const atlasTenant = await prisma.tenant.upsert({
    where: { slug: "atlas-contracting-group" },
    update: {},
    create: {
      name: "Atlas Contracting Group",
      slug: "atlas-contracting-group",
    },
  });

  const pioneerTenant = await prisma.tenant.upsert({
    where: { slug: "pioneer-civil-works" },
    update: {},
    create: {
      name: "Pioneer Civil Works",
      slug: "pioneer-civil-works",
    },
  });

  const northstarTenant = await prisma.tenant.upsert({
    where: { slug: "northstar-industrial-services" },
    update: {},
    create: {
      name: "Northstar Industrial Services",
      slug: "northstar-industrial-services",
    },
  });

  await prisma.tenantMembership.upsert({
    where: {
      userId_tenantId: {
        userId: demoUser.id,
        tenantId: atlasTenant.id,
      },
    },
    update: { role: "OWNER" },
    create: {
      userId: demoUser.id,
      tenantId: atlasTenant.id,
      role: "OWNER",
    },
  });

  const contracts = [
    {
      tenantId: atlasTenant.id,
      title: "Regional HVAC Preventive Maintenance",
      agency: "U.S. Army Corps of Engineers",
      naicsCode: "238220",
      location: "Sacramento, CA",
      state: "CA",
      city: "Sacramento",
      summary:
        "Multi-site HVAC maintenance and emergency response coverage for district facilities.",
      source: "seed",
      sourceExternalId: "atlas-hvac-001",
      awardAmount: "684000.00",
      awardDate: new Date("2024-07-16"),
      expirationDate: new Date("2026-07-15"),
      stage: ContractStage.REBID_SOON,
      incumbentCompany: "Sierra Mechanical Group",
      predictedDate: new Date("2026-05-30"),
      confidenceScore: "0.91",
      winner: "Sierra Mechanical Group",
    },
    {
      tenantId: atlasTenant.id,
      title: "Federal Building Janitorial Services",
      agency: "General Services Administration",
      naicsCode: "561720",
      location: "Oakland, CA",
      state: "CA",
      city: "Oakland",
      summary:
        "Nightly janitorial, consumables restocking, and day porter services for a federal office complex.",
      source: "seed",
      sourceExternalId: "atlas-janitorial-002",
      awardAmount: "392500.00",
      awardDate: new Date("2025-02-03"),
      expirationDate: new Date("2027-02-02"),
      stage: ContractStage.WATCH,
      incumbentCompany: "Desert Peak Services",
      predictedDate: new Date("2026-11-18"),
      confidenceScore: "0.68",
      winner: "Desert Peak Services",
    },
    {
      tenantId: pioneerTenant.id,
      title: "Municipal Fleet Parts Distribution",
      agency: "City of Los Angeles",
      naicsCode: "423120",
      location: "Los Angeles, CA",
      state: "CA",
      city: "Los Angeles",
      summary:
        "Supply and delivery of OEM-equivalent fleet maintenance parts under annual blanket purchase terms.",
      source: "seed",
      sourceExternalId: "pioneer-fleet-003",
      awardAmount: "1185000.00",
      awardDate: new Date("2024-10-11"),
      expirationDate: new Date("2026-10-10"),
      stage: ContractStage.ACTIVE,
      incumbentCompany: "Metro Industrial Supply",
      predictedDate: new Date("2026-08-14"),
      confidenceScore: "0.73",
      winner: "Metro Industrial Supply",
    },
    {
      tenantId: northstarTenant.id,
      title: "VA Clinic Custodial Services",
      agency: "Department of Veterans Affairs",
      naicsCode: "561720",
      location: "Phoenix, AZ",
      state: "AZ",
      city: "Phoenix",
      summary:
        "Custodial services, restroom sanitation, and quality inspection support across outpatient clinics.",
      source: "seed",
      sourceExternalId: "northstar-va-004",
      awardAmount: "512300.00",
      awardDate: new Date("2024-12-02"),
      expirationDate: new Date("2026-12-01"),
      stage: ContractStage.WATCH,
      incumbentCompany: "Northstar Industrial Services",
      predictedDate: new Date("2026-10-20"),
      confidenceScore: "0.77",
      winner: "Northstar Industrial Services",
    },
  ];

  for (const item of contracts) {
    const contract = await prisma.contract.upsert({
      where: {
        tenantId_source_sourceExternalId: {
          tenantId: item.tenantId,
          source: item.source,
          sourceExternalId: item.sourceExternalId,
        },
      },
      update: {
        title: item.title,
        agency: item.agency,
        naicsCode: item.naicsCode,
        location: item.location,
        state: item.state,
        city: item.city,
        summary: item.summary,
        awardAmount: item.awardAmount,
        awardDate: item.awardDate,
        expirationDate: item.expirationDate,
        stage: item.stage,
        incumbentCompany: item.incumbentCompany,
      },
      create: {
        tenantId: item.tenantId,
        title: item.title,
        agency: item.agency,
        naicsCode: item.naicsCode,
        location: item.location,
        state: item.state,
        city: item.city,
        summary: item.summary,
        source: item.source,
        sourceExternalId: item.sourceExternalId,
        awardAmount: item.awardAmount,
        awardDate: item.awardDate,
        expirationDate: item.expirationDate,
        stage: item.stage,
        incumbentCompany: item.incumbentCompany,
      },
    });

    await prisma.winningBid.upsert({
      where: {
        id: `${contract.id}-winning-bid`,
      },
      update: {
        companyName: item.winner,
        bidAmount: item.awardAmount,
        awardDate: item.awardDate,
      },
      create: {
        id: `${contract.id}-winning-bid`,
        contractId: contract.id,
        companyName: item.winner,
        bidAmount: item.awardAmount,
        awardDate: item.awardDate,
      },
    });

    await prisma.rebidPrediction.upsert({
      where: {
        id: `${contract.id}-rebid-prediction`,
      },
      update: {
        predictedDate: item.predictedDate,
        confidenceScore: item.confidenceScore,
        predictionMethod: PredictionMethod.EXPIRATION_DATE,
        notes: "Seeded baseline rebid forecast for local development.",
      },
      create: {
        id: `${contract.id}-rebid-prediction`,
        contractId: contract.id,
        predictedDate: item.predictedDate,
        confidenceScore: item.confidenceScore,
        predictionMethod: PredictionMethod.EXPIRATION_DATE,
        notes: "Seeded baseline rebid forecast for local development.",
      },
    });

    if (
      item.sourceExternalId === "atlas-hvac-001" ||
      item.sourceExternalId === "atlas-janitorial-002"
    ) {
      await prisma.savedContract.upsert({
        where: {
          userId_contractId: {
            userId: demoUser.id,
            contractId: contract.id,
          },
        },
        update: {
          reminderDaysBefore: item.sourceExternalId === "atlas-hvac-001" ? 45 : 30,
          ownerLabel:
            item.sourceExternalId === "atlas-hvac-001"
              ? "Atlas capture team"
              : "Atlas business development",
          notes:
            item.sourceExternalId === "atlas-hvac-001"
              ? "Start subcontractor outreach and pricing refresh before expected posting."
              : "Track facility amendments and custodial scope changes for the next rebid window.",
        },
        create: {
          userId: demoUser.id,
          contractId: contract.id,
          reminderDaysBefore: item.sourceExternalId === "atlas-hvac-001" ? 45 : 30,
          ownerLabel:
            item.sourceExternalId === "atlas-hvac-001"
              ? "Atlas capture team"
              : "Atlas business development",
          notes:
            item.sourceExternalId === "atlas-hvac-001"
              ? "Start subcontractor outreach and pricing refresh before expected posting."
              : "Track facility amendments and custodial scope changes for the next rebid window.",
        },
      });
    }
  }

  console.log("Seed complete: tenants, contracts, winning bids, and rebid predictions.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
