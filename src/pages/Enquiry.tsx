import { useEffect, useState } from "react";
import { Check, Loader2, ArrowRight, Shield, Zap, TrendingUp, Lock, ChevronRight, Sparkles } from "lucide-react";
import {
  validatePhoneNumber,
  countryConfigs,
} from "../lib/phoneValidation";
import Particles from "../components/Particles";

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

  // IntersectionObserver reveal effect hook
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("reveal-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("reveal-in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
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
    if (!form.name.trim()) e.name = "Name is required.";
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
    <div className="min-h-screen w-full bg-[#030712] text-white antialiased overflow-x-hidden relative text-[15px] sm:text-[17px] tracking-normal leading-relaxed" style={{ fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      {/* Dynamic Glowing Mesh Background Orbs */}
      <div className="absolute top-[10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] -z-10 pointer-events-none animate-pulse" style={{ animationDuration: "8s" }} />
      <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[130px] -z-10 pointer-events-none animate-pulse" style={{ animationDuration: "12s" }} />
      <div className="absolute bottom-[10%] left-[20%] w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[160px] -z-10 pointer-events-none" />

      <style>{`
        a, button, [role="button"] { cursor: pointer !important; }
        input, textarea, select { cursor: text !important; }
        select { cursor: pointer !important; }
        h1, h2, h3, h4, h5, h6, .font-heading { 
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif !important; 
          letter-spacing: -0.025em !important;
        }
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        .fade-up { animation: fadeUp 0.7s ease-out both; }
        .fade-up-d1 { animation: fadeUp 0.7s 0.1s ease-out both; }
        .fade-up-d2 { animation: fadeUp 0.7s 0.2s ease-out both; }
        .fade-up-d3 { animation: fadeUp 0.7s 0.3s ease-out both; }
        .fade-in { animation: fadeIn 0.5s ease-out both; }
        
        /* Glassmorphism Styles */
        .glass-panel {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .glass-panel-hover:hover {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.2);
        }

        /* Scroll Reveal base style override */
        [data-reveal] {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal-in {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `}</style>

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/10 bg-[#030712]/75">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
          <a href="#" className="flex items-center gap-2 group flex-shrink-0">
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
            </div>
            <span className="font-heading font-extrabold text-[15px] sm:text-[17px] text-white tracking-tight">VortexCrypto</span>
          </a>
          <nav className="flex items-center gap-4 sm:gap-8 text-[12px] sm:text-[13px] font-semibold text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </nav>
          <a href="#contact" className="bg-blue-600 hover:bg-blue-500 text-white text-[11px] sm:text-[13px] font-bold px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-full transition-all shadow-lg shadow-blue-500/20 hover:scale-[1.02] flex-shrink-0">
            Get Started
          </a>
        </div>
      </header>

      {/* ── SECTION 1: HERO ── */}
      <section className="relative overflow-hidden min-h-[520px] flex items-center justify-center">
        {/* Background Particles Animation */}
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-90">
          <Particles
            particleColors={["#ffffff"]}
            particleCount={120}
            particleSpread={15}
            speed={0.12}
            particleBaseSize={200}
            moveParticlesOnHover={true}
            particleHoverFactor={5}
            alphaParticles={false}
            disableRotation={false}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-6 pt-24 pb-20 text-center">
          {/* Badge */}
          <div className="fade-up inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-[12px] font-semibold text-gray-300 mb-8 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-green-450 animate-pulse" style={{ backgroundColor: "#22c55e" }} />
            {leadsCount !== null ? `${leadsCount.toLocaleString()} investors onboarded` : "Now accepting new allocations"}
            <ChevronRight className="h-3 w-3 text-gray-500" />
          </div>

          <h1 className="fade-up-d1 text-4xl sm:text-5xl lg:text-[58px] font-extrabold text-white leading-[1.1] tracking-wide max-w-3xl mx-auto">
            The modern platform for
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400 bg-clip-text text-transparent"> crypto wealth </span>
            management
          </h1>

          <p className="fade-up-d2 mt-6 text-gray-400 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed tracking-wide">
            Automated yield strategies, real-time arbitrage execution, and institutional-grade portfolio management — in one clean glassmorphic portal.
          </p>

          <div className="fade-up-d3 mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="#contact" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-full text-sm transition-all shadow-lg shadow-blue-500/20 inline-flex items-center gap-2 hover:scale-[1.02]">
              Start Free Trial <ArrowRight className="h-4 w-4" />
            </a>
            <a href="#features" className="text-gray-300 hover:text-white font-semibold text-sm transition-colors inline-flex items-center gap-2 px-6 py-4 border border-white/10 rounded-full bg-white/5 backdrop-blur-sm hover:bg-white/10">
              See how it works <ChevronRight className="h-4 w-4" />
            </a>
          </div>

          {/* Trust logos */}
          <div className="mt-12 sm:mt-16 pt-8 border-t border-white/5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 mb-5">Trusted by teams at</p>
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12">
              {LOGOS.map((name, i) => (
                <span key={i} className="text-[13px] sm:text-[14px] font-bold text-gray-500 hover:text-gray-300 transition-colors tracking-wide">{name}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: FEATURES ── */}
      <section id="features" className="border-y border-white/5">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center mb-12 sm:mb-16" data-reveal>
            <p className="text-[12px] font-bold uppercase tracking-widest text-blue-400 mb-3">Platform</p>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-wide">
              Everything you need to grow
            </h2>
            <p className="mt-3 text-gray-455 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
              Three core engines working together to maximise your returns.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <TrendingUp className="h-5 w-5" />,
                title: "Automated Yield",
                desc: "Smart contracts harvest and reinvest across 50+ DeFi protocols continuously. No manual intervention needed.",
                metric: "6.8 – 14.1%",
                metricLabel: "Average APY",
                accent: "bg-blue-500/10 text-blue-400 border-blue-500/20",
              },
              {
                icon: <Zap className="h-5 w-5" />,
                title: "Microsecond Arbitrage",
                desc: "Proprietary bots capture price gaps across 200+ exchanges in milliseconds, converting latency into profit.",
                metric: "200+",
                metricLabel: "Exchanges monitored",
                accent: "bg-violet-500/10 text-violet-400 border-violet-500/20",
              },
              {
                icon: <Shield className="h-5 w-5" />,
                title: "Tokenized Assets",
                desc: "Fractional ownership of real estate, bonds, and commodities — settling globally in under 5 seconds.",
                metric: "$2.4B+",
                metricLabel: "Assets tokenized",
                accent: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
              },
            ].map((f, i) => (
              <div key={i} className="glass-panel glass-panel-hover rounded-2xl p-7 transition-all duration-300 group" data-reveal style={{ transitionDelay: `${i * 120}ms` }}>
                <div className={`h-11 w-11 rounded-xl ${f.accent} border flex items-center justify-center mb-5`}>
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm sm:text-[15px] text-gray-400 leading-relaxed mb-6">{f.desc}</p>
                <div className="pt-4 border-t border-white/5">
                  <div className="text-2xl font-extrabold text-white">{f.metric}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{f.metricLabel}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 3: CONTACT FORM (DARK GLASS) ── */}
      <section id="contact" className="relative overflow-hidden">
        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-24" data-reveal>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
            {/* Left info */}
            <div className="lg:col-span-2 space-y-6">
              <p className="text-[12px] font-bold uppercase tracking-widest text-blue-400">Get started</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide leading-tight">
                Schedule your personalised demo
              </h2>
              <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                Tell us about your goals. Our team will prepare a custom onboarding session within 60 minutes.
              </p>

              <div className="space-y-4 pt-4">
                {[
                  { icon: <Shield className="h-4 w-4 text-blue-400" />, text: "AES-256 encrypted data vaults" },
                  { icon: <Check className="h-4 w-4 text-blue-400" />, text: "Mandate confirmation in 60 min" },
                  { icon: <Lock className="h-4 w-4 text-blue-400" />, text: "No commitment required" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm sm:text-base text-gray-400">
                    <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/10">{item.icon}</div>
                    {item.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Right form */}
            <div className="lg:col-span-3">
              {status === "success" ? (
                <div className="glass-panel rounded-2xl p-8 sm:p-10 text-center shadow-2xl fade-in">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 border border-green-500/20 text-green-400 mb-5">
                    <Check className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-extrabold text-white mb-2">You're all set!</h3>
                  <p className="text-sm sm:text-base text-gray-400 max-w-sm mx-auto leading-relaxed">
                    Your enquiry has been received. An onboarding specialist will reach you within the hour.
                  </p>
                </div>
              ) : (
                <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-2xl">
                  {errors.general && (
                    <div className="mb-5 rounded-xl bg-red-500/10 border border-red-200 p-3 text-xs text-red-400 font-medium text-center">{errors.general}</div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1.5">Full Name *</label>
                        <input type="text" required value={form.name} onChange={set("name")} placeholder="Alexandra Chen"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all" />
                        {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1.5">Email *</label>
                        <input type="email" required value={form.email} onChange={set("email")} placeholder="alex@fund.com"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all" />
                        {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1.5">Phone Number</label>
                      <div className="flex gap-2 sm:gap-3">
                        <select value={form.countryCode} onChange={set("countryCode")}
                          className="bg-slate-900 border border-white/10 rounded-xl px-2 sm:px-3 py-3 text-xs sm:text-sm text-white outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all appearance-none w-[95px] sm:w-[115px] flex-shrink-0"
                          style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'/%3e%3c/svg%3e")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center", backgroundSize: "12px", paddingRight: "24px" }}>
                          {COUNTRIES.map(c => <option key={c.code} value={c.code} className="bg-slate-900">{c.label}</option>)}
                        </select>
                        
<div style={{ display: 'flex', gap: '8px', width: '100%' }}>
    <select name="countryCode" style={{ width: '110px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#fff', padding: '0.8rem', fontFamily: 'inherit' }}>
        <option value="CH">🇨🇭 +41</option>
        <option value="GB">🇬🇧 +44</option>
        <option value="CA">🇨🇦 +1</option>
        <option value="AU">🇦🇺 +61</option>
    </select>
<input type="tel" value={form.phone} onChange={set("phone")} placeholder={cfg.placeholder}
                          className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all"  style={{ flex: 1 }} />
</div>
                      </div>
                      {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1.5">Message</label>
                      <textarea rows={3} value={form.message} onChange={set("message")} placeholder="Tell us about your investment goals..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all resize-none" />
                    </div>

                    <button type="submit" disabled={status === "loading"}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white py-3.5 text-sm font-bold transition-all disabled:opacity-60 shadow-lg shadow-blue-500/20 hover:scale-[1.02]">
                      {status === "loading" ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</> : <>Submit Enquiry <ArrowRight className="h-4 w-4" /></>}
                    </button>
                    <p className="text-center text-[11px] text-gray-500">No spam. Unsubscribe anytime.</p>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-10 border-t border-white/5 bg-[#030712]/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-blue-600 flex items-center justify-center">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
            <span className="font-heading font-bold text-sm text-white">VortexCrypto</span>
          </div>
          <p className="text-xs text-gray-500">© {new Date().getFullYear()} VortexCrypto. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
