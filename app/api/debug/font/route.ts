import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export async function GET() {
  const filePath = path.join(process.cwd(), "public", "fonts", "NotoSansArabic-Regular.ttf");

  try {
    const stat = fs.statSync(filePath);
    return Response.json({
      status: "found",
      path: filePath,
      sizeBytes: stat.size,
      cwd: process.cwd()
    });
  } catch (err) {
    return Response.json({
      status: "not_found",
      path: filePath,
      cwd: process.cwd(),
      error: err instanceof Error ? err.message : String(err)
    });
  }
}
