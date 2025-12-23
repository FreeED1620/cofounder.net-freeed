import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  //   // Grab IP from headers
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0] || "127.0.0.1"; // fallback for local dev

  // 🔹 Hardcode IP for testing
  // const ip = "8.8.8.8"; // Google DNS server

  let region = "Unknown";
  try {
    // Example using FreeIPAPI (no token required)
    const res = await fetch(`https://freeipapi.com/api/json/${ip}`);
    const data = await res.json();

    region = data.regionName || data.cityName || "Unknown";
  } catch (e) {
    console.error("Region lookup failed", e);
  }

  return NextResponse.json({ ip, region });
}
