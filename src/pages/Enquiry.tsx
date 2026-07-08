import { useEffect, useState } from "react";
import { ArrowUpRight, Check, Loader2, ArrowLeft, Shield } from "lucide-react";
import { Lightfall } from "../components/Lightfall";
import {
  validatePhoneNumber,
  formatFullPhoneNumber,
  countryConfigs,
} from "../lib/phoneValidation";

const COUNTRIES = [
  { code: "CY", name: "Cyprus" },
  { code: "CH", name: "Switzerland" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "DE", name: "Germany" },
  { code: "IN", name: "India" },
  { code: "FR", name: "France" },
  { code: "BE", name: "Belgium" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "NL", name: "Netherlands" },
  { code: "AT", name: "Austria" },
  { code: "SE", name: "Sweden" },
  { code: "GEN", name: "Other" },
];

const BUDGETS = [
  "USD 100k — 250k",
  "USD 250k — 1 M",
  "USD 1 M — 5 M",
  "USD 5 M — 25 M",
  "USD 25 M +",
  "Institutional mandate",
];

export function EnquiryPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    countryCode: "CY",
    budget: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [leadsCount, setLeadsCount] = useState<number | null>(null);

  // Load active leads counter dynamically on mount
  useEffect(() => {
    fetch("/api/leads-count")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.count === "number") {
          setLeadsCount(data.count);
        }
      })
      .catch((err) => console.error("Error fetching leads count:", err));
  }, []);

  // Instant Validation Hook: validates phone as user inputs
  useEffect(() => {
    if (!form.phone.trim()) {
      setErrors((prev) => {
        const { phone: _, ...rest } = prev;
        return rest;
      });
      return;
    }
    const phoneErr = validatePhoneNumber(form.phone, form.countryCode);
    setErrors((prev) => {
      if (phoneErr) {
        return { ...prev, phone: phoneErr };
      } else {
        const { phone: _, ...rest } = prev;
        return rest;
      }
    });
  }, [form.phone, form.countryCode]);

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim() || form.name.trim().split(" ").length < 2) {
      newErrors.name = "Please enter your full name (first and last name).";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    
    const phoneErr = validatePhoneNumber(form.phone, form.countryCode);
    if (phoneErr) {
      newErrors.phone = phoneErr;
    }
    
    if (!form.budget) {
      newErrors.budget = "Please select an investment range.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/submit-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          countryCode: form.countryCode,
          budget: form.budget,
          message: form.message,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        let errMsg = data.error || "Failed to submit. Please try again.";
        // Short, clean validation warning display to fit containers
        if (errMsg.toLowerCase().includes("lead is not valid")) {
          errMsg = "Invalid phone number or email format. Please check the digits and selected country.";
        }
        setErrors({ general: errMsg });
        setStatus("idle");
        return;
      }

      // Increment count locally upon success
      setLeadsCount((prev) => (prev !== null ? prev + 1 : 1));
      setStatus("success");
    } catch (err) {
      console.error(err);
      setErrors({ general: "Network communication failure. Please check your connection." });
      setStatus("idle");
    }
  };

  const selectedConfig = countryConfigs[form.countryCode] || countryConfigs.GEN;
  const placeholder = selectedConfig.placeholder;

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-[#030712] py-12 px-4 sm:px-6 font-jakarta text-slate-100 antialiased">
      {/* WebGL Canvas in background */}
      <Lightfall />

      {/* Top Header Navigation */}
      <header className="relative mx-auto max-w-5xl w-full flex items-center justify-between z-10 mb-8">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-cyan-400 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Journal
        </a>
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-cyan-400" />
          <span className="text-xs tracking-[0.2em] font-semibold text-slate-400 uppercase">
            SECURE CLIENT PORTAL
          </span>
        </div>
      </header>

      {/* Leads Counter Capsule */}
      {leadsCount !== null && (
        <div className="relative mx-auto z-10 mb-4 animate-fade-in">
          <div className="inline-flex items-center gap-2.5 rounded-full bg-slate-950/80 border border-slate-800/80 px-4 py-1.5 backdrop-blur-md">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-medium text-slate-300">
              <strong className="text-emerald-400">{leadsCount}</strong> Active Client Registrations Today
            </span>
          </div>
        </div>
      )}

      {/* Main Glassmorphic Form Card */}
      <main className="relative mx-auto max-w-lg w-full flex-1 flex flex-col justify-center z-10">
        <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-slate-800">
          {status === "success" ? (
            <div className="text-center py-8">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-400 mb-6 animate-pulse">
                <Check className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-slate-100">
                Enquiry Successfully Transmitted
              </h3>
              <p className="mt-4 text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
                Your credentials have been securely stored in the Meridian Prime database.
                An executive allocator will contact you within one business hour via the encrypted line provided.
              </p>
              <div className="mt-8 rounded-xl bg-slate-950/60 border border-slate-800/50 p-4 font-mono text-xs tracking-wider text-slate-400 max-w-xs mx-auto">
                PORTAL REF: <span className="text-cyan-400">MP-{Math.floor(100000 + Math.random() * 899999)}</span>
              </div>
              <div className="mt-8">
                <a
                  href="/"
                  className="inline-flex items-center gap-2 border border-slate-700 hover:border-slate-500 rounded-lg px-5 py-2.5 text-xs font-semibold text-slate-300 hover:text-slate-100 transition-colors"
                >
                  Return to Publication
                </a>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-8 text-center sm:text-left">
                <h2 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400">
                  Meridian Prime
                </h2>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                  Institutional Client Allocation Office. Provide your details below for private capital placement.
                </p>
              </div>

              {errors.general && (
                <div className="mb-6 rounded-xl bg-red-950/30 border border-red-500/20 p-4 text-xs text-red-400 leading-relaxed text-center">
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    className="w-full bg-slate-950/40 border border-slate-800 focus:border-cyan-500/80 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all"
                    placeholder="Marcus Ashcroft"
                  />
                  {errors.name && <p className="mt-1.5 text-xs text-red-400">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Corporate Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className="w-full bg-slate-950/40 border border-slate-800 focus:border-cyan-500/80 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all"
                    placeholder="m.ashcroft@ashcroftwarde.com"
                  />
                  {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-4">
                  <div>
                    <label htmlFor="country" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Country
                    </label>
                    <select
                      id="country"
                      value={form.countryCode}
                      onChange={(e) => updateField("countryCode", e.target.value)}
                      className="w-full bg-slate-950/40 border border-slate-800 focus:border-cyan-500/80 rounded-xl px-3 py-3 text-sm text-slate-100 outline-none transition-all cursor-pointer"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code} className="bg-slate-950 text-slate-200">
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Secure Phone Line {form.countryCode !== "GEN" ? `(+${selectedConfig.prefix})` : ""}
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      className="w-full bg-slate-950/40 border border-slate-800 focus:border-cyan-500/80 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all"
                      placeholder={placeholder}
                    />
                    {errors.phone && <p className="mt-1.5 text-xs text-red-400">{errors.phone}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="budget" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Intended Allocation Size
                  </label>
                  <select
                    id="budget"
                    required
                    value={form.budget}
                    onChange={(e) => updateField("budget", e.target.value)}
                    className="w-full bg-slate-950/40 border border-slate-800 focus:border-cyan-500/80 rounded-xl px-4 py-3 text-sm text-slate-100 outline-none transition-all cursor-pointer"
                  >
                    <option value="" className="bg-slate-950 text-slate-600">Select range</option>
                    {BUDGETS.map((b) => (
                      <option key={b} value={b} className="bg-slate-950 text-slate-200">
                        {b}
                      </option>
                    ))}
                  </select>
                  {errors.budget && <p className="mt-1.5 text-xs text-red-400">{errors.budget}</p>}
                </div>

                <div>
                  <label htmlFor="message" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Case Specifications (Optional)
                  </label>
                  <textarea
                    id="message"
                    rows={3}
                    value={form.message}
                    onChange={(e) => updateField("message", e.target.value)}
                    className="w-full bg-slate-950/40 border border-slate-800 focus:border-cyan-500/80 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all resize-none"
                    placeholder="Outline any special sovereign mandates, private equity requirements or currency hedges..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 px-6 py-3.5 text-sm font-bold uppercase tracking-widest text-white shadow-lg transition-all focus:ring-2 focus:ring-cyan-500/40 disabled:opacity-60 cursor-pointer"
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      SECURELY TRANSMITTING
                    </>
                  ) : (
                    <>
                      ESTABLISH CONTACT
                      <ArrowUpRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </main>

      {/* Footer Disclaimer */}
      <footer className="relative mx-auto max-w-3xl w-full text-center z-10 mt-8">
        <p className="text-[10px] text-slate-500 leading-relaxed uppercase tracking-widest">
          THIS INTERFACE TRANSMITS ENCRYPTED METADATA DIRECTLY TO THE MERIDIAN PRIME DESK.
          ALL SHIELD PROTOCOLS ACTIVE. REGISTRATION CONFIDENTIAL.
        </p>
      </footer>
    </div>
  );
}
