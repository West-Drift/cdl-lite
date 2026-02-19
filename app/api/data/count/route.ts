// app/api/data/count/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * GET /api/data/count
 *
 * location_id formats per boundary type (must match geojson/route.ts):
 *   GADM  → "admin1_name | admin2_name | admin3_name"
 *   TAMSAT → grid_id (stored directly on tamsat_grids)
 *   SHAMBA → farm_id (stored directly on farm_polygons)
 *
 * Dropdown option.id values (from /api/boundaries) are always CODES:
 *   admin1_code, admin2_code, admin3_code — e.g. "KEN.1_1"
 *   country = ISO-3 code e.g. "KEN"
 *
 * Params:
 *   dataset_type  – required
 *   boundary_type – required: "GADM" | "TAMSAT" | "SHAMBA"
 *   start / end   – optional ISO date
 *   country       – optional ISO-3 code
 *   admin1/2/3    – optional GADM codes
 *
 * Returns: { count: number, filtered: boolean }
 *   filtered = true when sub-region (admin1/2/3) or date range is active.
 *   Country-only = full dataset scope → filtered = false.
 */
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const datasetType = sp.get("dataset_type");
  const boundaryType = (sp.get("boundary_type") ?? "GADM").toUpperCase();
  const start = sp.get("start");
  const end = sp.get("end");
  const country = sp.get("country");
  const admin1 = sp.get("admin1");
  const admin2 = sp.get("admin2");
  const admin3 = sp.get("admin3");

  if (!datasetType) {
    return NextResponse.json(
      { error: "dataset_type required" },
      { status: 400 },
    );
  }

  // Country alone = full dataset scope (not a narrowing filter).
  // Sub-admin (admin1/2/3) or date range = user narrowed → filtered = true.
  const hasSubRegion = !!(admin1 || admin2 || admin3);
  const hasLocation = !!(country || admin1 || admin2 || admin3);
  const hasDate = !!(start || end);
  const isFiltered = hasSubRegion || hasDate;

  try {
    let sql: string;
    const values: string[] = [datasetType];

    if (boundaryType === "TAMSAT") {
      // ── TAMSAT ──────────────────────────────────────────────────────────────
      // location_id in timeseries_data = tamsat grid_id
      // Filter by matching grid_id via tamsat_grids joined to gadm_boundaries
      const tWhere: string[] = ["t.dataset_type = $1"];
      const gWhere: string[] = [];

      if (hasLocation) {
        if (country) {
          values.push(country);
          gWhere.push(`g.country = $${values.length}`);
        }
        if (admin1) {
          values.push(admin1);
          gWhere.push(`g.admin1_code = $${values.length}`);
        }
        if (admin2) {
          values.push(admin2);
          gWhere.push(`g.admin2_code = $${values.length}`);
        }
        if (admin3) {
          values.push(admin3);
          gWhere.push(`g.admin3_code = $${values.length}`);
        }
      }

      if (start) {
        values.push(start);
        tWhere.push(`t.date >= $${values.length}`);
      }
      if (end) {
        values.push(end);
        tWhere.push(`t.date <= $${values.length}`);
      }

      if (hasLocation) {
        sql = `
          SELECT COUNT(*) AS count
          FROM timeseries_data t
          JOIN (
            SELECT DISTINCT tg.grid_id
            FROM tamsat_grids tg
            JOIN gadm_boundaries g ON tg.admin3_code = g.admin3_code AND g.level = 3
            WHERE ${gWhere.join(" AND ")}
          ) locs ON t.location_id = locs.grid_id
          WHERE ${tWhere.join(" AND ")}
        `;
      } else {
        sql = `SELECT COUNT(*) AS count FROM timeseries_data WHERE ${tWhere.join(" AND ")}`;
      }
    } else if (boundaryType === "SHAMBA") {
      // ── SHAMBA ──────────────────────────────────────────────────────────────
      // location_id in timeseries_data = farm_id
      const tWhere: string[] = ["t.dataset_type = $1"];
      const gWhere: string[] = [];

      if (hasLocation) {
        if (country) {
          values.push(country);
          gWhere.push(`g.country = $${values.length}`);
        }
        if (admin1) {
          values.push(admin1);
          gWhere.push(`g.admin1_code = $${values.length}`);
        }
        if (admin2) {
          values.push(admin2);
          gWhere.push(`g.admin2_code = $${values.length}`);
        }
        if (admin3) {
          values.push(admin3);
          gWhere.push(`g.admin3_code = $${values.length}`);
        }
      }

      if (start) {
        values.push(start);
        tWhere.push(`t.date >= $${values.length}`);
      }
      if (end) {
        values.push(end);
        tWhere.push(`t.date <= $${values.length}`);
      }

      if (hasLocation) {
        sql = `
          SELECT COUNT(*) AS count
          FROM timeseries_data t
          JOIN (
            SELECT DISTINCT fp.farm_id
            FROM farm_polygons fp
            JOIN gadm_boundaries g ON fp.admin3_code = g.admin3_code AND g.level = 3
            WHERE ${gWhere.join(" AND ")}
          ) locs ON t.location_id = locs.farm_id
          WHERE ${tWhere.join(" AND ")}
        `;
      } else {
        sql = `SELECT COUNT(*) AS count FROM timeseries_data WHERE ${tWhere.join(" AND ")}`;
      }
    } else {
      // ── GADM (default) ──────────────────────────────────────────────────────
      // location_id = "admin1_name | admin2_name | admin3_name"
      // Dropdown ids are CODES (admin1_code etc.) — match on codes in gadm_boundaries
      // then resolve to name-concatenated loc_id for the JOIN.
      const tWhere: string[] = ["t.dataset_type = $1"];
      const gWhere: string[] = [];

      if (hasLocation) {
        if (country) {
          values.push(country);
          gWhere.push(`g.country = $${values.length}`);
        }
        if (admin1) {
          values.push(admin1);
          gWhere.push(`g.admin1_code = $${values.length}`);
        }
        if (admin2) {
          values.push(admin2);
          gWhere.push(`g.admin2_code = $${values.length}`);
        }
        if (admin3) {
          values.push(admin3);
          gWhere.push(`g.admin3_code = $${values.length}`);
        }
      }

      if (start) {
        values.push(start);
        tWhere.push(`t.date >= $${values.length}`);
      }
      if (end) {
        values.push(end);
        tWhere.push(`t.date <= $${values.length}`);
      }

      if (hasLocation) {
        sql = `
          SELECT COUNT(*) AS count
          FROM timeseries_data t
          JOIN (
            SELECT DISTINCT
              g.admin1_name || ' | ' || g.admin2_name || ' | ' || g.admin3_name AS loc_id
            FROM gadm_boundaries g
            WHERE g.level = 3
              ${gWhere.length ? "AND " + gWhere.join(" AND ") : ""}
          ) locs ON t.location_id = locs.loc_id
          WHERE ${tWhere.join(" AND ")}
        `;
      } else {
        sql = `SELECT COUNT(*) AS count FROM timeseries_data WHERE ${tWhere.join(" AND ")}`;
      }
    }

    console.log("[/api/data/count] boundary_type:", boundaryType);
    console.log("[/api/data/count] sql:", sql.replace(/\s+/g, " ").trim());
    console.log("[/api/data/count] values:", values);

    const { rows } = await pool.query(sql, values);
    const count = parseInt(rows[0]?.count ?? "0", 10);

    return NextResponse.json({ count, filtered: isFiltered });
  } catch (err: any) {
    console.error("/api/data/count error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
