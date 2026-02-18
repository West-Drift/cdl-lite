import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    layers: [
      {
        id: "chirps_rainfall",
        name: "CHIRPS Rainfall",
        wms_url: "http://localhost:8080/geoserver/mapexplorer/wms",
        layer_name: "mapexplorer:chirps_rainfall",
      },
    ],
  });
}
