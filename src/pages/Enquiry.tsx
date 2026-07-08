import { useEffect, useState } from "react";
import { Check, Loader2, ArrowRight, Shield, Zap, TrendingUp, BarChart3, Globe, Lock, ChevronRight, Sparkles } from "lucide-react";
import {
  validatePhoneNumber,
  countryConfigs,
} from "../lib/phoneValidation";

const COUNTRIES = [
  { code: "US", label: "🇺🇸 US +1" },
  { code: "GB", label: "🇬🇧 GB +44" },
  { code: "IN", label: "🇮🇳 IN +91" },
  { code: "DE", label: "🇩🇪 DE +49" },
  { code: "FR", label: "🇫🇷 FR +33" },
  { code: "CH", label: "🇨🇭 CH +41" },
  { code: "CY", label: "🇨🇾 CY +357" },
  { code: "BE", label: "🇧🇪 BE +32" },
  { code: "IT", label: "🇮🇹 IT +39" },
  { code: "ES", label: "🇪🇸 ES +34" },
  { code: "NL", label: "🇳🇱 NL +31" },
  { code: "SE", label: "🇸🇪 SE +46" },
  { code: "GEN", label: "🌍 Other" },
];

const LOGOS = ["Bloomberg", "Reuters", "Coinbase", "Binance", "Goldman Sachs", "JP Morgan"];

export function EnquiryPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", countryCode: "IN", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [leadsCount, setLeadsCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/leads-count").then(r => r.json()).then(d => d?.count && setLeadsCount(d.count)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!form.phone.trim()) { setErrors(p => { const { phone: _, ...r } = p; return r; }); return; }
    const err = validatePhoneNumber(form.phone, form.countryCode);
    setErrors(p => err ? { ...p, phone: err } : (({ phone: _, ...r }) => r)(p));
  }, [form.phone, form.countryCode]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim() || form.name.trim().split(" ").length < 2) e.name = "Enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email.";
    if (form.phone.trim()) { const pe = validatePhoneNumber(form.phone, form.countryCode); if (pe) e.phone = pe; }
    setErrors(e); return !Object.keys(e).length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/submit-lead", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone || "Not Provided", countryCode: form.countryCode, budget: "Institutional mandate", message: form.message }),
      });
      const data = await res.json();
      if (!res.ok) { setErrors({ general: data.error?.toLowerCase().includes("lead is not valid") ? "Invalid phone number for selected country." : (data.error || "Failed. Try again.") }); setStatus("idle"); return; }
      setLeadsCount(p => (p ?? 0) + 1);
      setStatus("success");
    } catch { setErrors({ general: "Network error. Try again." }); setStatus("idle"); }
  };

  const cfg = countryConfigs[form.countryCode] || countryConfigs.GEN;

  return (
    <div className="min-h-screen w-full bg-white antialiased overflow-x-hidden" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}>
      <style>{`
        a, button, [role="button"] { cursor: pointer !important; }
        input, textarea, select { cursor: text !important; }
        select { cursor: pointer !important; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        .fade-up { animation: fadeUp 0.7s ease-out both; }
        .fade-up-d1 { animation: fadeUp 0.7s 0.1s ease-out both; }
        .fade-up-d2 { animation: fadeUp 0.7s 0.2s ease-out both; }
        .fade-up-d3 { animation: fadeUp 0.7s 0.3s ease-out both; }
        .fade-in { animation: fadeIn 0.5s ease-out both; }
      `}</style>

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded-lg bg-black flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-extrabold text-[17px] text-gray-900 tracking-tight">VortexCrypto</span>
          </a>
          <nav className="hidden md:flex items-center gap-8 text-[13px] font-semibold text-gray-500">
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#stats" className="hover:text-gray-900 transition-colors">Performance</a>
            <a href="#contact" className="hover:text-gray-900 transition-colors">Contact</a>
          </nav>
          <a href="#contact" className="bg-gray-900 hover:bg-gray-800 text-white text-[13px] font-bold px-5 py-2.5 rounded-full transition-all shadow-sm">
            Get Started
          </a>
        </div>
      </header>

      {/* ── SECTION 1: HERO ── */}
      <section className="relative overflow-hidden">
        {/* Subtle gradient orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-blue-50/80 via-violet-50/40 to-transparent rounded-full blur-3xl -z-10" />

        <div className="mx-auto max-w-4xl px-6 pt-24 pb-20 text-center">
          {/* Badge */}
          <div className="fade-up inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-1.5 text-[12px] font-semibold text-gray-600 mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            {leadsCount !== null ? `${leadsCount.toLocaleString()} investors onboarded` : "Now accepting new allocations"}
            <ChevronRight className="h-3 w-3 text-gray-400" />
          </div>

          <h1 className="fade-up-d1 text-4xl sm:text-5xl lg:text-[56px] font-extrabold text-gray-900 leading-[1.1] tracking-tight max-w-3xl mx-auto">
            The modern platform for
            <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 bg-clip-text text-transparent"> crypto wealth </span>
            management
          </h1>

          <p className="fade-up-d2 mt-6 text-gray-500 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Automated yield strategies, real-time arbitrage execution, and institutional-grade portfolio management — in one clean platform.
          </p>

          <div className="fade-up-d3 mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="#contact" className="bg-gray-900 hover:bg-gray-800 text-white font-bold px-8 py-4 rounded-full text-sm transition-all shadow-lg inline-flex items-center gap-2">
              Start Free Trial <ArrowRight className="h-4 w-4" />
            </a>
            <a href="#features" className="text-gray-600 hover:text-gray-900 font-semibold text-sm transition-colors inline-flex items-center gap-2 px-6 py-4">
              See how it works <ChevronRight className="h-4 w-4" />
            </a>
          </div>

          {/* Trust logos */}
          <div className="mt-16 pt-8 border-t border-gray-100">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-5">Trusted by teams at</p>
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
              {LOGOS.map((name, i) => (
                <span key={i} className="text-[13px] font-bold text-gray-300 tracking-wide">{name}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: FEATURES ── */}
      <section id="features" className="bg-gray-50/50 border-y border-gray-100">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="text-center mb-16">
            <p className="text-[12px] font-bold uppercase tracking-widest text-blue-600 mb-3">Platform</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Everything you need to grow
            </h2>
            <p className="mt-3 text-gray-500 text-sm max-w-md mx-auto">Three core engines working together to maximise your returns.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <TrendingUp className="h-5 w-5" />,
                title: "Automated Yield",
                desc: "Smart contracts harvest and reinvest across 50+ DeFi protocols continuously. No manual intervention needed.",
                metric: "6.8 – 14.1%",
                metricLabel: "Average APY",
                accent: "bg-blue-50 text-blue-600 border-blue-100",
              },
              {
                icon: <Zap className="h-5 w-5" />,
                title: "Microsecond Arbitrage",
                desc: "Proprietary bots capture price gaps across 200+ exchanges in milliseconds, converting latency into profit.",
                metric: "200+",
                metricLabel: "Exchanges monitored",
                accent: "bg-violet-50 text-violet-600 border-violet-100",
              },
              {
                icon: <Shield className="h-5 w-5" />,
                title: "Tokenized Assets",
                desc: "Fractional ownership of real estate, bonds, and commodities — settling globally in under 5 seconds.",
                metric: "$2.4B+",
                metricLabel: "Assets tokenized",
                accent: "bg-emerald-50 text-emerald-600 border-emerald-100",
              },
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-7 hover:shadow-lg hover:border-gray-300 transition-all duration-300 group">
                <div className={`h-11 w-11 rounded-xl ${f.accent} border flex items-center justify-center mb-5`}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-6">{f.desc}</p>
                <div className="pt-4 border-t border-gray-100">
                  <div className="text-2xl font-extrabold text-gray-900">{f.metric}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{f.metricLabel}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 3: STATS / SOCIAL PROOF ── */}
      <section id="stats" className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="text-center mb-16">
            <p className="text-[12px] font-bold uppercase tracking-widest text-violet-600 mb-3">Performance</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Numbers that speak for themselves
            </h2>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {[
              { v: "$4.2B", l: "Assets managed", icon: <BarChart3 className="h-4 w-4" /> },
              { v: "37%", l: "Avg. annual return", icon: <TrendingUp className="h-4 w-4" /> },
              { v: "2,400+", l: "Active investors", icon: <Globe className="h-4 w-4" /> },
              { v: "99.9%", l: "Platform uptime", icon: <Lock className="h-4 w-4" /> },
            ].map((s, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-400 mb-4">{s.icon}</div>
                <div className="text-3xl sm:text-4xl font-extrabold text-gray-900">{s.v}</div>
                <div className="text-xs text-gray-500 mt-1 font-medium">{s.l}</div>
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { q: "VortexCrypto tripled our crypto allocation yield in 8 months. The automation is flawless.", name: "Marcus T.", role: "PE Partner" },
              { q: "Finally a platform that handles institutional volumes with DeFi-grade returns. Remarkable.", name: "Priya S.", role: "Family Office CIO" },
              { q: "The arbitrage engine alone has paid for our entire subscription many times over.", name: "David K.", role: "Hedge Fund Manager" },
            ].map((t, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, si) => (
                    <svg key={si} className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">"{t.q}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">{t.name[0]}</div>
                  <div>
                    <div className="text-xs font-bold text-gray-900">{t.name}</div>
                    <div className="text-[11px] text-gray-400">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 4: CONTACT FORM ── */}
      <section id="contact" className="bg-gray-50/50 border-t border-gray-100">
        <div className="mx-auto max-w-5xl px-6 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
            {/* Left info */}
            <div className="lg:col-span-2 space-y-6">
              <p className="text-[12px] font-bold uppercase tracking-widest text-blue-600">Get started</p>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
                Schedule your personalised demo
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                Tell us about your goals. Our team will prepare a custom onboarding session within 60 minutes.
              </p>

              <div className="space-y-4 pt-4">
                {[
                  { icon: <Shield className="h-4 w-4 text-gray-400" />, text: "AES-256 encrypted data vaults" },
                  { icon: <Check className="h-4 w-4 text-gray-400" />, text: "Mandate confirmation in 60 min" },
                  { icon: <Lock className="h-4 w-4 text-gray-400" />, text: "No commitment required" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-gray-500">
                    <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">{item.icon}</div>
                    {item.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Right form */}
            <div className="lg:col-span-3">
              {status === "success" ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center shadow-sm fade-in">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-50 border border-green-200 text-green-500 mb-5">
                    <Check className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-extrabold text-gray-900 mb-2">You're all set!</h3>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
                    Your enquiry has been received. An onboarding specialist will reach you within the hour.
                  </p>
                  <div className="mt-6 inline-block bg-gray-50 border border-gray-200 rounded-full px-5 py-2 font-mono text-xs text-gray-600">
                    REF: <span className="text-blue-600 font-bold">VX-{Math.floor(100000 + Math.random() * 899999)}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                  {errors.general && (
                    <div className="mb-5 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-600 font-medium text-center">{errors.general}</div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Full Name *</label>
                        <input type="text" required value={form.name} onChange={set("name")} placeholder="Alexandra Chen"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
                        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email *</label>
                        <input type="email" required value={form.email} onChange={set("email")} placeholder="alex@fund.com"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
                        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">Phone Number</label>
                      <div className="flex gap-3">
                        <select value={form.countryCode} onChange={set("countryCode")}
                          className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all appearance-none min-w-[115px]"
                          style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'/%3e%3c/svg%3e")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", backgroundSize: "14px", paddingRight: "30px" }}>
                          {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                        </select>
                        <input type="tel" value={form.phone} onChange={set("phone")} placeholder={cfg.placeholder}
                          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
                      </div>
                      {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">Message</label>
                      <textarea rows={3} value={form.message} onChange={set("message")} placeholder="Tell us about your investment goals..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none" />
                    </div>

                    <button type="submit" disabled={status === "loading"}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white py-3.5 text-sm font-bold transition-all disabled:opacity-60 shadow-sm">
                      {status === "loading" ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</> : <>Schedule Demo <ArrowRight className="h-4 w-4" /></>}
                    </button>
                    <p className="text-center text-[11px] text-gray-400">No spam. Unsubscribe anytime.</p>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-white border-t border-gray-100 py-10">
        <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gray-900 flex items-center justify-center">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
            <span className="font-bold text-sm text-gray-900">VortexCrypto</span>
          </div>
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} VortexCrypto. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
