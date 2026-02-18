// app/api/boundaries/geojson/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * GET /api/boundaries/geojson
 *
 * GADM (default):
 *   ?country=KEN                        → admin1 polygons
 *   ?country=KEN&admin1=KEN.1_1         → admin2 polygons
 *   ?country=KEN&admin1=...&admin2=...  → admin3 (ward) polygons
 *
 * Feature property `location_id` is built as NAME_1 | NAME_2 | NAME_3
 * to match what was imported into timeseries_data.
 *
 * TAMSAT:  ?mode=TAMSAT&country=KEN[&admin1=...][&admin2=...]
 * SHAMBA:  ?mode=SHAMBA&country=KEN[&admin1=...][&admin2=...][&admin3=...]
 *
 * SHAMBA location_id = farm_id (already stored as "id | NAME_3 | NAME_2 | NAME_1")
 */
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const mode = sp.get("mode") ?? "GADM";
  const country = sp.get("country");
  const admin1 = sp.get("admin1");
  const admin2 = sp.get("admin2");
  const admin3 = sp.get("admin3");

  try {
    if (mode === "TAMSAT") return await tamsatGeojson(country, admin1, admin2);
    if (mode === "SHAMBA")
      return await shambaGeojson(country, admin1, admin2, admin3);
    return await gadmGeojson(country, admin1, admin2);
  } catch (err: any) {
    console.error("/api/boundaries/geojson error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ─── GADM ────────────────────────────────────────────────────────────────────

async function gadmGeojson(
  country: string | null,
  admin1: string | null,
  admin2: string | null,
) {
  if (!country)
    return NextResponse.json({ type: "FeatureCollection", features: [] });

  let level: number;
  const whereParts: string[] = ["country = $1"];
  const values: string[] = [country];

  if (admin2) {
    level = 3;
    whereParts.push("admin1_code = $2", "admin2_code = $3");
    values.push(admin1!, admin2);
  } else if (admin1) {
    level = 2;
    whereParts.push("admin1_code = $2");
    values.push(admin1);
  } else {
    level = 1;
  }

  const nameCol =
    level === 3 ? "admin3_name" : level === 2 ? "admin2_name" : "admin1_name";
  const codeCol =
    level === 3 ? "admin3_code" : level === 2 ? "admin2_code" : "admin1_code";

  values.push(String(level));
  const levelParam = `$${values.length}`;

  // location_id matches timeseries_data: NAME_1 | NAME_2 | NAME_3
  const sql = `
    SELECT jsonb_build_object(
      'type', 'FeatureCollection',
      'features', COALESCE(jsonb_agg(f), '[]'::jsonb)
    ) AS geojson
    FROM (
      SELECT jsonb_build_object(
        'type',       'Feature',
        'id',         gid,
        'geometry',   ST_AsGeoJSON(geometry)::jsonb,
        'properties', jsonb_build_object(
          'id',          gid,
          'name',        ${nameCol},
          'admin_code',  ${codeCol},
          'location_id', CASE
            WHEN level = 3 THEN admin1_name || ' | ' || admin2_name || ' | ' || admin3_name
            WHEN level = 2 THEN admin1_name || ' | ' || admin2_name
            ELSE admin1_name
          END
        )
      ) AS f
      FROM gadm_boundaries
      WHERE ${whereParts.join(" AND ")} AND level = ${levelParam}
    ) sub
  `;

  const { rows } = await pool.query(sql, values);
  return NextResponse.json(
    rows[0]?.geojson ?? { type: "FeatureCollection", features: [] },
  );
}

// ─── TAMSAT ──────────────────────────────────────────────────────────────────

async function tamsatGeojson(
  country: string | null,
  admin1: string | null,
  admin2: string | null,
) {
  if (!country)
    return NextResponse.json({ type: "FeatureCollection", features: [] });

  const whereParts: string[] = ["g.country = $1"];
  const values: string[] = [country];

  if (admin1) {
    values.push(admin1);
    whereParts.push(`g.admin1_code = $${values.length}`);
  }
  if (admin2) {
    values.push(admin2);
    whereParts.push(`g.admin2_code = $${values.length}`);
  }

  const sql = `
    SELECT jsonb_build_object(
      'type', 'FeatureCollection',
      'features', COALESCE(jsonb_agg(f), '[]'::jsonb)
    ) AS geojson
    FROM (
      SELECT jsonb_build_object(
        'type',       'Feature',
        'id',         t.grid_id,
        'geometry',   ST_AsGeoJSON(t.geometry)::jsonb,
        'properties', jsonb_build_object(
          'id',          t.grid_id,
          'name',        t.grid_id,
          'location_id', t.grid_id
        )
      ) AS f
      FROM tamsat_grids t
      JOIN gadm_boundaries g ON t.admin3_code = g.admin3_code AND g.level = 3
      WHERE ${whereParts.join(" AND ")}
    ) sub
  `;

  const { rows } = await pool.query(sql, values);
  return NextResponse.json(
    rows[0]?.geojson ?? { type: "FeatureCollection", features: [] },
  );
}

// ─── SHAMBA ──────────────────────────────────────────────────────────────────

async function shambaGeojson(
  country: string | null,
  admin1: string | null,
  admin2: string | null,
  admin3: string | null,
) {
  if (!country)
    return NextResponse.json({ type: "FeatureCollection", features: [] });

  const whereParts: string[] = ["g.country = $1"];
  const values: string[] = [country];

  if (admin1) {
    values.push(admin1);
    whereParts.push(`g.admin1_code = $${values.length}`);
  }
  if (admin2) {
    values.push(admin2);
    whereParts.push(`g.admin2_code = $${values.length}`);
  }
  if (admin3) {
    values.push(admin3);
    whereParts.push(`g.admin3_code = $${values.length}`);
  }

  const sql = `
    SELECT jsonb_build_object(
      'type', 'FeatureCollection',
      'features', COALESCE(jsonb_agg(f), '[]'::jsonb)
    ) AS geojson
    FROM (
      SELECT jsonb_build_object(
        'type',       'Feature',
        'id',         fp.farm_id,
        'geometry',   ST_AsGeoJSON(fp.geometry)::jsonb,
        'properties', jsonb_build_object(
          'id',          fp.farm_id,
          'name',        fp.farm_id,
          'location_id', fp.farm_id
        )
      ) AS f
      FROM farm_polygons fp
      JOIN gadm_boundaries g ON fp.admin3_code = g.admin3_code AND g.level = 3
      WHERE ${whereParts.join(" AND ")}
    ) sub
  `;

  const { rows } = await pool.query(sql, values);
  return NextResponse.json(
    rows[0]?.geojson ?? { type: "FeatureCollection", features: [] },
  );
}
