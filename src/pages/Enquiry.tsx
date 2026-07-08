import { useEffect, useState } from "react";
import { ArrowUpRight, Check, Loader2, Shield, Cpu, Activity, Lock, Globe, Layers, ArrowRight } from "lucide-react";
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

const METRICS = [
  { asset: "Bitcoin (BTC)", yieldRate: "6.8% APY", liquidity: "$14.2 B", change: "+0.45%" },
  { asset: "Ethereum (ETH)", yieldRate: "8.4% APY", liquidity: "$8.9 B", change: "+1.12%" },
  { asset: "Solana (SOL)", yieldRate: "12.4% APY", liquidity: "$4.1 B", change: "+3.87%" },
  { asset: "USD Coin (USDC)", yieldRate: "14.1% APY", liquidity: "$22.5 B", change: "Stable" },
];

export function EnquiryPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    countryCode: "IN",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [leadsCount, setLeadsCount] = useState<number | null>(null);

  // Load registered leads count on mount
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
    <div className="relative min-h-screen w-full bg-[#06030c] text-zinc-100 font-sans antialiased overflow-x-hidden flex flex-col justify-between selection:bg-purple-500/30 selection:text-white">
      {/* Hand Pointer Cursor Rule */}
      <style>{`
        a, button, select, option, input, textarea, [role="button"], .group, video, img, .cursor-pointer {
          cursor: pointer !important;
        }
      `}</style>

      {/* Background Gradients & WebGL Streaks */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-purple-950/20 via-transparent to-transparent -z-20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-violet-950/10 via-transparent to-transparent -z-20" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#2a2438_1px,transparent_1px),linear-gradient(to_bottom,#2a2438_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-[0.07] -z-20" />
      <Lightfall color="#8b5cf6" bgColor="bg-transparent" opacity={0.25} />

      {/* --- STANDALONE HEADER --- */}
      <header className="relative mx-auto max-w-7xl w-full px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-purple-600 to-violet-500 flex items-center justify-center text-white font-black text-sm tracking-tighter">
            V
          </div>
          <span className="font-display font-extrabold text-lg tracking-wider text-white uppercase" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Vortex Crypto
          </span>
        </div>
        
        {/* Navigation links for standalone SaaS */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-zinc-400">
          <a href="#metrics" className="hover:text-purple-400 transition-colors">Yield Rates</a>
          <a href="#features" className="hover:text-purple-400 transition-colors">Infrastructure</a>
          <a href="#intake" className="hover:text-purple-400 transition-colors">Intake Desk</a>
        </nav>

        <div className="flex items-center gap-4">
          <a
            href="#intake"
            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-full text-xs font-bold transition-all shadow-lg shadow-purple-600/20"
          >
            Launch Client Console
          </a>
        </div>
      </header>

      {/* --- SECTION 1: HERO --- */}
      <section className="relative mx-auto max-w-7xl w-full px-6 pt-20 pb-16 z-10 flex flex-col items-center text-center">
        {/* Portal Glow capsule */}
        <div className="inline-flex items-center gap-2 rounded-full bg-zinc-900/80 border border-zinc-800 px-4 py-1.5 shadow-xl mb-6 backdrop-blur">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
          </span>
          <span className="text-[11px] font-semibold text-zinc-300">
            SECURE ACCESS DEPLOYED {leadsCount !== null && <>· <strong className="text-purple-400">{leadsCount}</strong> client allocations logged</>}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Autonomous Yield & <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-violet-300 to-zinc-400">
            Crypto Allocation
          </span>
        </h1>

        {/* Description */}
        <p className="mt-6 text-sm sm:text-base text-zinc-400 max-w-xl leading-relaxed">
          The continuous execution layer for digital treasury, structural crypto compounding, and microsecond arbitrage spreads. Bypassing administrative friction completely.
        </p>

        {/* CTA */}
        <div className="mt-8">
          <a
            href="#intake"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-sm font-bold transition-all shadow-lg shadow-purple-600/25"
          >
            Establish Portfolio Mandate
            <ArrowUpRight className="h-4.5 w-4.5" />
          </a>
        </div>
      </section>

      {/* --- SECTION 2 (NEW): REAL-TIME PERFORMANCE & METRICS --- */}
      <section id="metrics" className="relative mx-auto max-w-5xl w-full px-6 py-16 z-10 border-t border-zinc-900/60">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Live Platform Yield Metrics
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-zinc-400">
            Real-time compounding percentages processed continuously on institutional liquidity pools.
          </p>
        </div>

        <div className="bg-[#0b0813] border border-purple-950/60 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-purple-950/80 bg-purple-950/20 text-purple-300 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Crypto Asset</th>
                  <th className="py-4 px-6 text-right">Yield APY</th>
                  <th className="py-4 px-6 text-right">Pool Liquidity</th>
                  <th className="py-4 px-6 text-right">Arbitrage Drift</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-950/40 text-zinc-300">
                {METRICS.map((m, idx) => (
                  <tr key={idx} className="hover:bg-purple-950/10 transition-colors">
                    <td className="py-4 px-6 font-bold text-white flex items-center gap-2.5">
                      <span className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
                      {m.asset}
                    </td>
                    <td className="py-4 px-6 text-right text-purple-400 font-extrabold">{m.yieldRate}</td>
                    <td className="py-4 px-6 text-right font-mono">{m.liquidity}</td>
                    <td className={`py-4 px-6 text-right font-semibold ${m.change.startsWith("+") ? "text-purple-400" : "text-zinc-500"}`}>
                      {m.change}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* --- SECTION 3: FEATURES --- */}
      <section id="features" className="relative mx-auto max-w-7xl w-full px-6 py-20 z-10 border-t border-zinc-900/60">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Decentralized Engine Mechanics
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-zinc-400">
            A comprehensive capital deployment network built on continuous optimization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-zinc-950/60 border border-purple-950/30 rounded-2xl p-8 hover:border-purple-800/50 transition-all group">
            <div className="h-10 w-10 rounded-lg bg-purple-950/50 border border-purple-900/50 flex items-center justify-center text-purple-400 mb-6 group-hover:bg-purple-600 group-hover:text-white transition-all">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Decentralized Yields</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Depositors connect to yielding contracts, earning up to eighty percent of protocol margins with automated time compounding.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-zinc-950/60 border border-purple-950/30 rounded-2xl p-8 hover:border-purple-800/50 transition-all group">
            <div className="h-10 w-10 rounded-lg bg-purple-950/50 border border-purple-900/50 flex items-center justify-center text-purple-400 mb-6 group-hover:bg-purple-600 group-hover:text-white transition-all">
              <Activity className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Spread Compounding</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Continuous scan triggers secure microsecond price discrepancies across global spot libraries, converting latency to yield.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-zinc-950/60 border border-purple-950/30 rounded-2xl p-8 hover:border-purple-800/50 transition-all group">
            <div className="h-10 w-10 rounded-lg bg-purple-950/50 border border-purple-900/50 flex items-center justify-center text-purple-400 mb-6 group-hover:bg-purple-600 group-hover:text-white transition-all">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Tokenized Settlement</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Convert locked reserves, debt profiles, and real-world assets into fractional tokens that settle globally inside seconds.
            </p>
          </div>
        </div>
      </section>

      {/* --- SECTION 4: CONTACT & SECURE INTAKE --- */}
      <section id="intake" className="relative mx-auto max-w-5xl w-full px-6 py-20 z-10 border-t border-zinc-900/60 flex flex-col lg:flex-row items-center lg:items-stretch gap-12">
        {/* Left Side Content panel */}
        <div className="flex-1 flex flex-col justify-center space-y-6">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
            Secure Onboarding
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Submit Custom Allocations Request
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Begin customized deployment. Input credential parameters. An onboarding allocator will verify details and return contact via secured encrypted links.
          </p>
          <div className="space-y-4 pt-4 border-t border-purple-950/40 text-xs text-zinc-500">
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-purple-500" />
              <span>AES-256 standard database vaults active</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-4 w-4 text-purple-500" />
              <span>Mandate confirmation processed in 60 minutes</span>
            </div>
          </div>
        </div>

        {/* Right Side Form Panel (White card matching screenshot) */}
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-[32px] p-8 sm:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.6)] text-zinc-800">
            {status === "success" ? (
              <div className="text-center py-10 animate-fade-in">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-purple-50 border border-purple-250 text-purple-600 mb-6">
                  <Check className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-zinc-950">
                  Enquiry Logged
                </h3>
                <p className="mt-4 text-sm text-zinc-500 leading-relaxed max-w-sm mx-auto">
                  Your specifications have been logged securely. Onboarding credentials will arrive shortly.
                </p>
                <div className="mt-8 rounded-full bg-zinc-50 border border-zinc-100 px-6 py-2.5 font-mono text-xs tracking-wider text-zinc-600 max-w-xs mx-auto">
                  TICKET: <span className="text-purple-600 font-bold">VX-{Math.floor(100000 + Math.random() * 899999)}</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {errors.general && (
                  <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-xs text-red-600 text-center font-bold">
                    {errors.general}
                  </div>
                )}

                {/* Name & Email fields side-by-side */}
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
                      className="w-full bg-zinc-50 border border-zinc-200 focus:border-purple-500/80 focus:ring-1 focus:ring-purple-500/20 rounded-2xl px-5 py-3 text-sm text-zinc-950 placeholder-zinc-400 outline-none transition-all"
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
                      className="w-full bg-zinc-50 border border-zinc-200 focus:border-purple-500/80 focus:ring-1 focus:ring-purple-500/20 rounded-2xl px-5 py-3 text-sm text-zinc-950 placeholder-zinc-400 outline-none transition-all"
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
                        className="w-full bg-zinc-50 border border-zinc-200 focus:border-purple-500/80 rounded-2xl pl-4 pr-8 py-3 text-sm text-zinc-800 outline-none appearance-none cursor-pointer"
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
                        className="w-full bg-zinc-50 border border-zinc-200 focus:border-purple-500/80 focus:ring-1 focus:ring-purple-500/20 rounded-2xl px-5 py-3 text-sm text-zinc-950 placeholder-zinc-400 outline-none transition-all"
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
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-purple-500/80 focus:ring-1 focus:ring-purple-500/20 rounded-3xl px-5 py-4 text-sm text-zinc-950 placeholder-zinc-400 outline-none transition-all resize-none"
                    placeholder="Tell us about your investment goals..."
                  />
                </div>

                {/* Send Enquiry button */}
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-black hover:bg-purple-600 text-white py-4 text-sm font-bold transition-all disabled:opacity-60 cursor-pointer shadow-lg"
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      TRANSMITTING...
                    </>
                  ) : (
                    <>
                      Send Enquiry
                      <ArrowRight className="h-4.5 w-4.5 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="relative mx-auto max-w-7xl w-full px-6 py-12 z-10 border-t border-zinc-900/60 text-center text-xs text-zinc-600">
        <p className="uppercase tracking-[0.25em] font-semibold text-[10px] text-zinc-500 mb-3">
          SECURE CLIENT VAULT DIRECT DEPLOYMENT GATEWAY
        </p>
        <p>© {new Date().getFullYear()} Vortex Crypto. All rights reserved.</p>
      </footer>
    </div>
  );
}
