import { getLeadCount } from "../src/lib/leadStorage";

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const count = await getLeadCount();
    return res.status(200).json({ count });
  } catch (err: any) {
    console.error("Error reading lead count in endpoint:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
