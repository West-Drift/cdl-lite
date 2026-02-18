// app/api/boundaries/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * GET /api/boundaries
 * Params: mode, level, country, admin1, admin2
 * Returns: { options: [{ id, name }], count }
 */
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const mode = sp.get("mode") || "GADM";
  const level = sp.get("level");
  const country = sp.get("country");
  const admin1 = sp.get("admin1");
  const admin2 = sp.get("admin2");

  try {
    if (mode !== "GADM") {
      // TAMSAT / SHAMBA have no dropdown — polygons load directly on map
      return NextResponse.json({ options: [], count: 0 });
    }

    let sql = "";
    let values: string[] = [];

    switch (level) {
      case "country":
        sql = `SELECT DISTINCT country AS id, country_name AS name
               FROM gadm_boundaries WHERE level = 1 ORDER BY country_name`;
        break;
      case "admin1":
        if (!country) return NextResponse.json({ options: [], count: 0 });
        sql = `SELECT DISTINCT admin1_code AS id, admin1_name AS name
               FROM gadm_boundaries WHERE country = $1 AND level = 1 ORDER BY admin1_name`;
        values = [country];
        break;
      case "admin2":
        if (!country || !admin1)
          return NextResponse.json({ options: [], count: 0 });
        sql = `SELECT DISTINCT admin2_code AS id, admin2_name AS name
               FROM gadm_boundaries WHERE country = $1 AND admin1_code = $2 AND level = 2
               ORDER BY admin2_name`;
        values = [country, admin1];
        break;
      case "admin3":
        if (!country || !admin1 || !admin2)
          return NextResponse.json({ options: [], count: 0 });
        sql = `SELECT DISTINCT admin3_code AS id, admin3_name AS name
               FROM gadm_boundaries WHERE country = $1 AND admin1_code = $2 AND admin2_code = $3
               AND level = 3 ORDER BY admin3_name`;
        values = [country, admin1, admin2];
        break;
      default:
        return NextResponse.json({ error: "Invalid level" }, { status: 400 });
    }

    const { rows } = await pool.query(sql, values);
    return NextResponse.json({ options: rows, count: rows.length });
  } catch (err: any) {
    console.error("/api/boundaries error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
