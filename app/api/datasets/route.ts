// app/api/datasets/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * GET /api/datasets
 * Optional params: category, subcategory, boundary_type
 *
 * Returns: { datasets: DatasetRow[], count }
 * Each row: { id, name, category, subcategory, sensor, type, boundary_type }
 */
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const category = sp.get("category");
  const subcategory = sp.get("subcategory");
  const boundaryType = sp.get("boundary_type");

  try {
    let query =
      "SELECT id, name, category, subcategory, sensor, type, boundary_type FROM datasets WHERE 1=1";
    const values: string[] = [];

    if (category) {
      values.push(category);
      query += ` AND category = $${values.length}`;
    }
    if (subcategory) {
      values.push(subcategory);
      query += ` AND subcategory = $${values.length}`;
    }
    if (boundaryType) {
      values.push(boundaryType);
      query += ` AND boundary_type = $${values.length}`;
    }

    query += " ORDER BY category, subcategory, name";

    const { rows } = await pool.query(query, values);
    return NextResponse.json({ datasets: rows, count: rows.length });
  } catch (err: any) {
    console.error("/api/datasets error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
