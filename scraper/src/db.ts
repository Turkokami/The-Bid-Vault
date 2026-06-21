import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

export async function upsertOpportunity(opp: {
  sourceCode: string;
  stateCode: string;
  title: string;
  issuingEntity: string;
  opportunityType: string;
  status: string;
  dueDate?: Date;
  postedDate?: Date;
  summary?: string;
  sourceUrl?: string;
  categoryCode?: string;
  registrationRequired?: boolean;
}): Promise<"inserted" | "updated"> {
  const existing = await pool.query(
    `SELECT id FROM "StateLocalOpportunity" WHERE "sourceName" = $1 AND title = $2 AND "issuingEntity" = $3 LIMIT 1`,
    [opp.sourceCode, opp.title, opp.issuingEntity]
  );

  if (existing.rows.length > 0) {
    await pool.query(
      `UPDATE "StateLocalOpportunity" SET status = $1, "dueDate" = $2, "sourceUrl" = $3, "updatedAt" = now() WHERE id = $4`,
      [opp.status, opp.dueDate ?? null, opp.sourceUrl ?? null, existing.rows[0].id]
    );
    return "updated";
  }

  await pool.query(
    `INSERT INTO "StateLocalOpportunity"
      (id, "sourceName", "stateCode", title, "issuingEntity", "opportunityType", status, "dueDate", "postedDate", summary, "sourceUrl", "categoryCode", "registrationRequired", "createdAt", "updatedAt")
     VALUES
      (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, now(), now())`,
    [
      opp.sourceCode, opp.stateCode, opp.title, opp.issuingEntity,
      opp.opportunityType, opp.status, opp.dueDate ?? null,
      opp.postedDate ?? null, opp.summary ?? null, opp.sourceUrl ?? null,
      opp.categoryCode ?? null, opp.registrationRequired ?? false,
    ]
  );
  return "inserted";
}

export async function logSync(sourceName: string, status: string, added: number, updated: number, error?: string) {
  await pool.query(
    `INSERT INTO "SourceSyncLog" (id, "sourceName", "syncStatus", "recordsAdded", "recordsUpdated", "errorMessage", "lastRunAt", "createdAt")
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, now(), now())`,
    [sourceName, status, added, updated, error ?? null]
  );
}
