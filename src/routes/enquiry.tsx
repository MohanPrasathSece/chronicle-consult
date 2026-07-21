import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { EnquiryPage } from "../pages/Enquiry";
import { formatFullPhoneNumber } from "../lib/phoneValidation";
import { incrementLeadCount } from "../lib/leadStorage";
import { toast } from "sonner";

interface LeadSubmission {
  name: string;
  email: string;
  phone: string;
  countryCode: string;
  budget: string;
  message: string;
}

// TanStack Start Server Function orchestrating CRM connection
export const submitLeadToCRM = createServerFn({ method: "POST" })
  .validator((data: LeadSubmission) => data)
  .handler(async ({ data }) => {
    // 1. Process and format names
    const [first_name, ...lastNameParts] = (data.name || "Unknown").trim().split(" ");
    const last_name = lastNameParts.join(" ") || "";

    // 2. Format phone number
    const formattedPhone = formatFullPhoneNumber(data.phone || "", data.countryCode || "CY");

    // 3. Assemble CRM payload
    const payload = {
      country_name: (data.countryCode || "cy").toLowerCase(),
      description: "VortexCrypto",
      phone: formattedPhone,
      email: data.email.toLowerCase().trim(),
      first_name,
      last_name,
      custom_fields: {
        Source_ID: "website",
        How_Much_Invested: data.budget || "0",
        Outline_Your_Case: data.message || "",
      },
    };

    // 4. Post to external CRM Core
    const crmUrl = process.env.CRM_API_URL || "https://inwo.crmcore.me/api/lead_management/api/affiliates";
    const token = process.env.CRM_AUTH_TOKEN || "AFF_1_92cbc1bc76284e19b711bab22587d75f";

    try {
      const response = await fetch(crmUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-token": token,
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      let responseData: any;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { text: responseText };
      }

      if (!response.ok) {
        throw new Error(responseData.error || "Lead validation failed on CRM desk.");
      }

      // Sync to dashboard
      try {
        const url = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_DASHBOARD_URL) || "https://lead-dashboard-orcin.vercel.app/api/increment";
        await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ website: "VortexCrypto", type: "contact", name: data.name, email: data.email})
        }).catch(() => {});
      } catch (e: any) {
      const rawMsg = (e?.message || e?.toString() || "");
      if (rawMsg.toLowerCase().includes("already exist") || rawMsg.toLowerCase().includes("already exists") || rawMsg.toLowerCase().includes("contacted")) {
        toast.success("Thank you for contacting us. Your message has been received, and our team will get back to you shortly.");
        return;
      }
}
      // Sync to dashboard
      try {
        const url = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_DASHBOARD_URL) || "https://lead-dashboard-orcin.vercel.app/api/increment";
        await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ website: "VortexCrypto", type: "contact", name: data.name, email: data.email})
        }).catch(() => {});
      } catch (e: any) {
      const rawMsg = (e?.message || e?.toString() || "");
      if (rawMsg.toLowerCase().includes("already exist") || rawMsg.toLowerCase().includes("already exists") || rawMsg.toLowerCase().includes("contacted")) {
        toast.success("Thank you for contacting us. Your message has been received, and our team will get back to you shortly.");
        return;
      }
}
      // 5. Increment lead counter in Vercel Blob / local file
      const newCount = await incrementLeadCount();

      return {
        success: true,
        count: newCount,
        reference: `MP-${Math.floor(100000 + Math.random() * 899999)}`,
      };
    } catch (error: any) {
      const rawMsg = (error?.message || error?.toString() || "");
      if (rawMsg.toLowerCase().includes("already exist") || rawMsg.toLowerCase().includes("already exists") || rawMsg.toLowerCase().includes("contacted")) {
        toast.success("Thank you for contacting us. Your message has been received, and our team will get back to you shortly.");
        return;
      }
      console.error("CRM submission failure:", error);
      throw new Error(error.message || "Failed to submit lead to institutional CRM.");
    }
  });

export const Route = createFileRoute("/enquiry")({
  component: EnquiryPage,
});
