// app/api/data/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * GET /api/data
 * Params: location_id, dataset_type, date_from (or start), date_to (or end)
 * Returns: bare array of { date: string, value: number | null }
 */
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;

  const locationId = sp.get("location_id");
  const datasetType = sp.get("dataset_type");
  const start = sp.get("start") || sp.get("date_from") || "2018-01-01";
  const end = sp.get("end") || sp.get("date_to") || "2026-12-31";

  if (!locationId || !datasetType) {
    return NextResponse.json(
      { error: "location_id and dataset_type are required" },
      { status: 400 },
    );
  }

  try {
    const { rows } = await pool.query(
      `SELECT
         to_char(date, 'YYYY-MM-DD') AS date,
         value
       FROM timeseries_data
       WHERE location_id  = $1
         AND dataset_type = $2
         AND date >= $3
         AND date <= $4
       ORDER BY date ASC`,
      [locationId, datasetType, start, end],
    );

    return NextResponse.json(
      rows.map((r) => ({
        date: r.date,
        value: r.value != null ? parseFloat(r.value) : null,
      })),
    );
  } catch (err: any) {
    console.error("/api/data error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
