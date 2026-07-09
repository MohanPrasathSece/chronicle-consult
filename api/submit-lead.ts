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
  const last_name = lastNameParts.join(" ") || "Lead";

  // Phone formatting
  const formattedPhone = formatFullPhoneNumber(phone || "", countryCode || "CY");

  // CRM payload mapping
  
        let finalPhone = (leadData.number || leadData.phone || "").replace(/[^0-9+]/g, '');
        if (finalPhone && finalPhone.startsWith('+')) {
            finalPhone = '00' + finalPhone.slice(1);
        }
        let countryName = leadData.countryCode ? leadData.countryCode.toLowerCase() : "ch";

        const payload = {
    country_name: (countryCode || "cy").toLowerCase(),
    description: "VortexCrypto",
    phone: finalPhone,
    email: email.toLowerCase().trim(),
    first_name,
    last_name,
    custom_fields: {
      Source_ID: "website",
      How_Much_Invested: budget || "0",
      Outline_Your_Case: message || "",
    },
  };

  const crmUrl = process.env.CRM_API_URL || "https://inwo.crmcore.me/api/lead_management/api/affiliates";
  const token = process.env.CRM_AUTH_TOKEN || "AFF_1_92cbc1bc76284e19b711bab22587d75f";

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
    return res.status(500).json({ error: "Failed to transmit lead to institutional CRM." });
  }
}
