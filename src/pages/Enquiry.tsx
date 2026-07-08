import { useEffect, useState } from "react";
import { ArrowUpRight, Check, Loader2, ArrowLeft, Shield, Cpu, Activity, Lock, Globe } from "lucide-react";
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

export function EnquiryPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    countryCode: "IN", // Default to IN like the screenshot
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [leadsCount, setLeadsCount] = useState<number | null>(null);

  // Fetch registered lead counts
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

  // Instant Validation
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
      newErrors.name = "Please enter your full name.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (form.phone.trim()) {
      const phoneErr = validatePhoneNumber(form.phone, form.countryCode);
      if (phoneErr) {
        newErrors.phone = phoneErr;
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus("loading");
    try {
      // Default to "Institutional mandate" to satisfy the CRM backend constraints
      const res = await fetch("/api/submit-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || "Not Provided",
          countryCode: form.countryCode,
          budget: "Institutional mandate",
          message: form.message,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        let errMsg = data.error || "Failed to submit. Please try again.";
        if (errMsg.toLowerCase().includes("lead is not valid")) {
          errMsg = "Invalid phone number format for selected country.";
        }
        setErrors({ general: errMsg });
        setStatus("idle");
        return;
      }

      setLeadsCount((prev) => (prev !== null ? prev + 1 : 1));
      setStatus("success");
    } catch (err) {
      console.error(err);
      setErrors({ general: "Network error. Please try again later." });
      setStatus("idle");
    }
  };

  const selectedConfig = countryConfigs[form.countryCode] || countryConfigs.GEN;
  const placeholder = selectedConfig.placeholder;

  return (
    <div className="relative min-h-screen w-full bg-[#030203] text-zinc-100 font-sans antialiased overflow-x-hidden flex flex-col justify-between selection:bg-red-500/30 selection:text-white">
      {/* Hand Cursor Style Injections */}
      <style>{`
        a, button, select, option, input, textarea, [role="button"], .cursor-pointer {
          cursor: pointer !important;
        }
      `}</style>

      {/* Dark SaaS Grid Overlay & Moving lightfall streaks */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-zinc-900/40 via-transparent to-transparent -z-20" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f23_1px,transparent_1px),linear-gradient(to_bottom,#1f1f23_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.08] -z-20" />
      <Lightfall color="#ef4444" bgColor="bg-transparent" opacity={0.15} />

      {/* --- HEADER --- */}
      <header className="relative mx-auto max-w-7xl w-full px-6 py-6 flex items-center justify-between z-10">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Journal
        </a>
        <div className="flex items-center gap-6">
          <span className="hidden sm:inline-flex items-center gap-2 text-xs text-zinc-500 uppercase tracking-widest">
            <Lock className="h-3 w-3 text-red-500" /> Secure Gateway Active
          </span>
          <a
            href="#intake"
            className="bg-white hover:bg-zinc-200 text-black px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm"
          >
            Access Portal
          </a>
        </div>
      </header>

      {/* --- SECTION 1: HERO (Revelle SaaS Style) --- */}
      <section className="relative mx-auto max-w-7xl w-full px-6 pt-16 pb-12 z-10 flex flex-col items-center text-center">
        {/* Glow Tag */}
        <div className="inline-flex items-center gap-2.5 rounded-full bg-zinc-900/80 border border-zinc-800 px-4 py-1.5 shadow-xl mb-6 backdrop-blur">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
          </span>
          <span className="text-xs font-semibold text-zinc-300">
            Meridian Prime Portal {leadsCount !== null && <>· <strong className="text-red-500">{leadsCount}</strong> active mandates today</>}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-tight">
          Autonomous Wealth <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-zinc-200 to-zinc-400">
            Allocation Engine
          </span>
        </h1>

        {/* Lede */}
        <p className="mt-6 text-base sm:text-lg text-zinc-400 max-w-2xl leading-relaxed">
          The institutional-grade platform for fractional capital, algorithmic arbitrage, and decentralized yield compounding. Fully secured, audited, and continuous.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <a
            href="#intake"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 text-sm font-bold transition-all shadow-lg shadow-red-600/20"
          >
            Establish Mandate
            <ArrowUpRight className="h-4 w-4" />
          </a>
          <a
            href="#features"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 px-8 py-3.5 text-sm font-bold transition-all"
          >
            Explore Engine
          </a>
        </div>
      </section>

      {/* --- SECTION 2: FEATURES (Grid) --- */}
      <section id="features" className="relative mx-auto max-w-7xl w-full px-6 py-20 z-10 border-t border-zinc-900">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Engineered for Capital Optimization
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Decentralized mechanics running continuously at the boundary of efficiency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-8 hover:border-zinc-800 transition-all group">
            <div className="h-10 w-10 rounded-lg bg-red-950/50 border border-red-900/50 flex items-center justify-center text-red-500 mb-6 group-hover:bg-red-600 group-hover:text-white transition-all">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Liquidity Compounding</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Interact directly with automated ledger protocols, securing transaction yield fee parameters without banking friction.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-8 hover:border-zinc-800 transition-all group">
            <div className="h-10 w-10 rounded-lg bg-red-950/50 border border-red-900/50 flex items-center justify-center text-red-500 mb-6 group-hover:bg-red-600 group-hover:text-white transition-all">
              <Activity className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Micro-Arbitrage Execution</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Algorithmic execution systems capture microsecond price spreads across hundreds of global digital exchanges instantly.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-8 hover:border-zinc-800 transition-all group">
            <div className="h-10 w-10 rounded-lg bg-red-950/50 border border-red-900/50 flex items-center justify-center text-red-500 mb-6 group-hover:bg-red-600 group-hover:text-white transition-all">
              <Globe className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Fractional Tokenization</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Convert real estate, sovereign debt, and equity structures to liquid tokens, bypassing administrative clearance protocols.
            </p>
          </div>
        </div>
      </section>

      {/* --- SECTION 3: secure intake form --- */}
      <section id="intake" className="relative mx-auto max-w-5xl w-full px-6 py-20 z-10 border-t border-zinc-900 flex flex-col lg:flex-row items-center lg:items-stretch gap-12">
        {/* Side panel */}
        <div className="flex-1 flex flex-col justify-center space-y-6">
          <span className="text-xs font-bold uppercase tracking-wider text-red-500">
            Secure Onboarding
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Schedule a Confidential Consultation
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Provide your contact details. An executive allocator will establish contact over the secure line to detail capital deployment programs.
          </p>
          <div className="space-y-4 pt-4 border-t border-zinc-900 text-xs text-zinc-500">
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-red-500" />
              <span>State-of-the-art encryption protocols active</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-4 w-4 text-red-500" />
              <span>Average response window: 60 minutes</span>
            </div>
          </div>
        </div>

        {/* Intake form container */}
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-[32px] p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.4)] text-zinc-800 relative">
            {status === "success" ? (
              <div className="text-center py-10 animate-fade-in">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-50 border border-red-200 text-red-600 mb-6">
                  <Check className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-zinc-950">
                  Mandate Submitted
                </h3>
                <p className="mt-4 text-sm text-zinc-500 leading-relaxed max-w-sm mx-auto">
                  Your credentials have been verified and logged in the Meridian Prime secure vault.
                </p>
                <div className="mt-8 rounded-full bg-zinc-50 border border-zinc-100 px-6 py-2.5 font-mono text-xs tracking-wider text-zinc-600 max-w-xs mx-auto">
                  REF: <span className="text-red-600 font-bold">MP-{Math.floor(100000 + Math.random() * 899999)}</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {errors.general && (
                  <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-xs text-red-600 text-center font-bold">
                    {errors.general}
                  </div>
                )}

                {/* Full name and email side by side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-xs font-bold text-zinc-500 mb-2">
                      Full Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 focus:border-red-500/80 focus:ring-1 focus:ring-red-500/20 rounded-full px-5 py-3 text-sm text-zinc-950 placeholder-zinc-400 outline-none transition-all"
                      placeholder="Alexandra Chen"
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-600 px-2">{errors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-xs font-bold text-zinc-500 mb-2">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 focus:border-red-500/80 focus:ring-1 focus:ring-red-500/20 rounded-full px-5 py-3 text-sm text-zinc-950 placeholder-zinc-400 outline-none transition-all"
                      placeholder="alex@company.com"
                    />
                    {errors.email && <p className="mt-1 text-xs text-red-600 px-2">{errors.email}</p>}
                  </div>
                </div>

                {/* Country dropdown & Phone input */}
                <div>
                  <label htmlFor="phone" className="block text-xs font-bold text-zinc-500 mb-2">
                    Phone Number (optional)
                  </label>
                  <div className="grid grid-cols-[120px_1fr] gap-3">
                    <div>
                      <select
                        id="countryCode"
                        value={form.countryCode}
                        onChange={(e) => updateField("countryCode", e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 focus:border-red-500/80 rounded-full pl-4 pr-8 py-3 text-sm text-zinc-800 outline-none appearance-none cursor-pointer"
                        style={{
                          backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                          backgroundRepeat: "no-repeat",
                          backgroundPosition: "right 14px center",
                          backgroundSize: "14px",
                        }}
                      >
                        {COUNTRIES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.code} +{countryConfigs[c.code]?.prefix || ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <input
                        id="phone"
                        type="tel"
                        value={form.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 focus:border-red-500/80 focus:ring-1 focus:ring-red-500/20 rounded-full px-5 py-3 text-sm text-zinc-950 placeholder-zinc-400 outline-none transition-all"
                        placeholder={placeholder}
                      />
                    </div>
                  </div>
                  {errors.phone && <p className="mt-1.5 text-xs text-red-600 px-2">{errors.phone}</p>}
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-xs font-bold text-zinc-500 mb-2">
                    Message (optional)
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    value={form.message}
                    onChange={(e) => updateField("message", e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-red-500/80 focus:ring-1 focus:ring-red-500/20 rounded-3xl px-5 py-4 text-sm text-zinc-950 placeholder-zinc-400 outline-none transition-all resize-none"
                    placeholder="Tell us about your investment goals..."
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-black hover:bg-red-600 text-white py-4 text-sm font-bold transition-all disabled:opacity-60 cursor-pointer shadow-lg"
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      TRANSMITTING...
                    </>
                  ) : (
                    <>
                      Send Enquiry
                      <ArrowUpRight className="h-4.5 w-4.5 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="relative mx-auto max-w-7xl w-full px-6 py-12 z-10 border-t border-zinc-900 text-center text-xs text-zinc-600">
        <p className="uppercase tracking-[0.25em] font-semibold text-[10px] text-zinc-500 mb-3">
          SECURE QUANT DESK INTERACTION GATEWAY
        </p>
        <p>© {new Date().getFullYear()} Meridian Prime. All rights reserved.</p>
      </footer>
    </div>
  );
}
