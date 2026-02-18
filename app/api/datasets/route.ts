// app/api/datasets/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * GET /api/datasets
 * Optional params: category, boundary_type
 * Returns: { datasets: [...], count }
 */
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const category = sp.get("category");
  const boundaryType = sp.get("boundary_type");

  try {
    let query = "SELECT * FROM datasets WHERE 1=1";
    const values: string[] = [];

    if (category) {
      values.push(category);
      query += ` AND category = $${values.length}`;
    }
    if (boundaryType) {
      values.push(boundaryType);
      query += ` AND boundary_type = $${values.length}`;
    }

    query += " ORDER BY category, name";

    const { rows } = await pool.query(query, values);
    return NextResponse.json({ datasets: rows, count: rows.length });
  } catch (err: any) {
    console.error("/api/datasets error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
