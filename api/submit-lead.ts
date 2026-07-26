import { formatFullPhoneNumber } from "../src/lib/phoneValidation";
import { incrementLeadCount } from "../src/lib/leadStorage";

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { name, email, phone, countryCode, budget, message } = req.body || {};

  if (!name || !email || !phone || !countryCode || !budget) {
    return res.status(400).json({ error: "Required fields are missing." });
  }

  // Name splitting
  const [first_name, ...lastNameParts] = (name || "Unknown").trim().split(" ");
  const last_name = lastNameParts.join(" ") || "";

  // Phone formatting
  const formattedPhone = formatFullPhoneNumber(phone || "", countryCode || "CY");

  // CRM payload mapping
  
        const payload = {
    country_name: (countryCode || "FR").toUpperCase(),
    description: "VortexCrypto",
    phone: formattedPhone || "+44123456",
    email: email.toLowerCase().trim() || "example@gmail.com",
    first_name: first_name || "John",
    last_name: last_name || "Doe",
    deposit: 100,
    ftd_amount: 2000,
    registration_date: 2000,
    ip_address: "10.10.10.10",
    note: message || "Sample note",
    brand_status: "Enabled",
    brand_name: "Brand name",
    language: "EN"
  };

  const crmUrl = process.env.CRM_API_URL || "https://api.myinvesttrade.com/api/lead_management/api/affiliates";
  const token = process.env.CRM_AUTH_TOKEN || "AFF_1_697ac63e6f88cac9f990b1a5c4beaefd";

  // Bypass SSL certificate errors for this specific CRM API (UNABLE_TO_VERIFY_LEAF_SIGNATURE)
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  try {
    const crmResponse = await fetch(crmUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-token": token,
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const responseText = await crmResponse.text();
    let responseData: any;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { text: responseText };
    }

    if (!crmResponse.ok) {
      const errMsg = (responseData.error || responseData.message || responseText || "").toString();
      if (crmResponse.status === 500 || errMsg.toLowerCase().includes("already") || errMsg.toLowerCase().includes("exist") || errMsg.toLowerCase().includes("contacted") || errMsg.toLowerCase().includes("500") || errMsg.toLowerCase().includes("internal server")) {
        return res.status(409).json({ error: "You have already contacted us. Please wait while our team reviews your request. We'll get back to you soon." });
      }
      return res.status(400).json({ error: responseData.error || "Lead validation failed on CRM desk." });
    }

    // Sync to dashboard
    try {
      const url = (typeof process !== 'undefined' && process.env && process.env.VITE_DASHBOARD_URL) || "https://lead-dashboard-orcin.vercel.app/api/increment";
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ website: "VortexCrypto", type: "contact", name: name, email: email})
      }).catch(() => {});
    } catch(e){}
    // Increment count
    const count = await incrementLeadCount();

    return res.status(200).json({
      success: true,
      count,
      reference: `MP-${Math.floor(100000 + Math.random() * 899999)}`,
    });
  } catch (err: any) {
    console.error("Endpoint submit error:", err);
    return res.status(500).json({ error: "You have already contacted us. Please wait while our team reviews your request. We'll get back to you soon." });
  }
}
