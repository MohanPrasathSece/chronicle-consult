import { put, list } from "@vercel/blob";

const BLOB_PATH = "lead_counter.json";

export async function getLeadCount(): Promise<number> {
  // If Vercel Blob Token is set, use it
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blobs = await list({ prefix: BLOB_PATH });
      if (blobs.blobs.length === 0) return 0;
      
      const res = await fetch(blobs.blobs[0].url);
      const data = await res.json();
      return data.count || 0;
    } catch (e) {
      console.error("Vercel Blob fetch error:", e);
      return 0;
    }
  }

  // Local fallback for dev server (server-side context only)
  if (typeof window === "undefined") {
    try {
      const fs = await import("fs/promises");
      const path = await import("path");
      const filePath = path.join(process.cwd(), BLOB_PATH);
      const data = await fs.readFile(filePath, "utf-8");
      const parsed = JSON.parse(data);
      return parsed.count || 0;
    } catch {
      return 0; // return 0 if file doesn't exist
    }
  }

  return 0;
}

export async function incrementLeadCount(): Promise<number> {
  const currentCount = await getLeadCount();
  const nextCount = currentCount + 1;
  
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      await put(BLOB_PATH, JSON.stringify({ count: nextCount }), {
        access: 'public',
        addRandomSuffix: false
      });
      return nextCount;
    } catch (e) {
      console.error("Vercel Blob put error, falling back:", e);
    }
  }

  // Local fallback for dev server (server-side context only)
  if (typeof window === "undefined") {
    try {
      const fs = await import("fs/promises");
      const path = await import("path");
      const filePath = path.join(process.cwd(), BLOB_PATH);
      await fs.writeFile(filePath, JSON.stringify({ count: nextCount }), "utf-8");
    } catch (e) {
      console.error("Failed to write local lead count:", e);
    }
  }
  
  return nextCount;
}
