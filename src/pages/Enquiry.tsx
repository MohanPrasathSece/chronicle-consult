import { useEffect, useState } from "react";
import { Check, Loader2, ArrowRight, Shield, Zap, TrendingUp, Star } from "lucide-react";
import {
  validatePhoneNumber,
  countryConfigs,
} from "../lib/phoneValidation";

/* ─────────────────────────────────────────────
   Country list (code → prefix mapping)
───────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────
   SVG Wave divider
───────────────────────────────────────────── */
function WaveBottom({ fill = "#fff" }: { fill?: string }) {
  return (
    <div className="overflow-hidden leading-none -mb-1">
      <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full block h-16 sm:h-20">
        <path d="M0,32 C360,80 1080,0 1440,48 L1440,80 L0,80 Z" fill={fill} />
      </svg>
    </div>
  );
}

function WaveTop({ fill = "#fff" }: { fill?: string }) {
  return (
    <div className="overflow-hidden leading-none -mt-1">
      <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full block h-16 sm:h-20">
        <path d="M0,48 C360,0 1080,80 1440,32 L1440,0 L0,0 Z" fill={fill} />
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Floating card component
───────────────────────────────────────────── */
function FloatingCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-3xl shadow-2xl p-6 sm:p-8 ${className}`}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
export function EnquiryPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", countryCode: "IN", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [leadsCount, setLeadsCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/leads-count")
      .then((r) => r.json())
      .then((d) => d?.count && setLeadsCount(d.count))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!form.phone.trim()) { setErrors((p) => { const { phone: _, ...r } = p; return r; }); return; }
    const err = validatePhoneNumber(form.phone, form.countryCode);
    setErrors((p) => err ? { ...p, phone: err } : (({ phone: _, ...r }) => r)(p));
  }, [form.phone, form.countryCode]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim() || form.name.trim().split(" ").length < 2) e.name = "Enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email.";
    if (form.phone.trim()) { const pe = validatePhoneNumber(form.phone, form.countryCode); if (pe) e.phone = pe; }
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/submit-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone || "Not Provided", countryCode: form.countryCode, budget: "Institutional mandate", message: form.message }),
      });
      const data = await res.json();
      if (!res.ok) { setErrors({ general: data.error?.toLowerCase().includes("lead is not valid") ? "Invalid phone number for selected country." : (data.error || "Failed. Try again.") }); setStatus("idle"); return; }
      setLeadsCount((p) => (p ?? 0) + 1);
      setStatus("success");
    } catch { setErrors({ general: "Network error. Try again." }); setStatus("idle"); }
  };

  const cfg = countryConfigs[form.countryCode] || countryConfigs.GEN;

  return (
    <div className="min-h-screen w-full bg-white font-sans antialiased" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
      <style>{`
        * { cursor: pointer; }
        input, textarea { cursor: text !important; }
        @keyframes float { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-12px)} }
        @keyframes floatSlow { 0%,100%{transform:translateY(0px) rotate(-2deg)} 50%{transform:translateY(-8px) rotate(2deg)} }
        @keyframes swim { 0%{transform:translateX(-100px) scaleX(1)} 50%{transform:translateX(calc(50vw)) scaleX(1)} 51%{transform:translateX(calc(50vw)) scaleX(-1)} 100%{transform:translateX(-100px) scaleX(-1)} }
        .float-anim { animation: float 4s ease-in-out infinite; }
        .float-slow { animation: floatSlow 6s ease-in-out infinite; }
        .card-hover { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .card-hover:hover { transform: translateY(-6px); box-shadow: 0 30px 60px rgba(30,58,138,0.15); }
      `}</style>

      {/* ──────────── HEADER ──────────── */}
      <header className="absolute inset-x-0 top-0 z-50 px-6 py-5">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* Logo mark */}
            <div className="h-9 w-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center border border-white/30">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-white fill-current">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-white font-extrabold text-xl tracking-tight">VortexCrypto</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-white/80 text-sm font-semibold">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </nav>
          <a href="#contact" className="bg-white text-blue-700 font-bold text-sm px-5 py-2.5 rounded-full hover:bg-blue-50 transition-colors shadow-lg">
            Get Started Free
          </a>
        </div>
      </header>

      {/* ──────────── SECTION 1: HERO ──────────── */}
      <section
        className="relative min-h-[90vh] flex flex-col items-center justify-center text-center overflow-hidden pt-28 pb-0"
        style={{ background: "linear-gradient(160deg, #1e40af 0%, #3b82f6 30%, #06b6d4 60%, #0891b2 80%, #1d4ed8 100%)" }}
      >
        {/* Decorative circles */}
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-40 right-10 w-80 h-80 rounded-full bg-cyan-300/10 blur-3xl pointer-events-none" />

        {/* Floating decorative elements */}
        <div className="absolute top-32 left-8 float-anim opacity-80 pointer-events-none hidden lg:block">
          <div className="bg-white rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3 min-w-[160px]">
            <div className="h-9 w-9 rounded-full bg-green-400 flex items-center justify-center text-white font-black text-sm">₿</div>
            <div className="text-left">
              <div className="text-xs text-gray-500 font-medium">BTC Yield</div>
              <div className="text-sm font-extrabold text-gray-900 text-green-600">+6.8% APY</div>
            </div>
          </div>
        </div>

        <div className="absolute top-40 right-8 float-slow opacity-80 pointer-events-none hidden lg:block">
          <div className="bg-white rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3 min-w-[160px]">
            <div className="h-9 w-9 rounded-full bg-purple-500 flex items-center justify-center text-white font-black text-sm">Ξ</div>
            <div className="text-left">
              <div className="text-xs text-gray-500 font-medium">ETH Yield</div>
              <div className="text-sm font-extrabold text-green-600">+8.4% APY</div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-32 left-16 float-anim opacity-70 pointer-events-none hidden lg:block" style={{ animationDelay: "1.5s" }}>
          <div className="bg-white rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-orange-400 flex items-center justify-center text-white font-black text-xs">◎</div>
            <div className="text-left">
              <div className="text-xs text-gray-500 font-medium">SOL Pool</div>
              <div className="text-sm font-extrabold text-green-600">+12.4% APY</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur border border-white/20 rounded-full px-4 py-1.5 text-white text-xs font-semibold mb-6">
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            {leadsCount !== null ? `${leadsCount} investors joined this week` : "Institutional-grade crypto yield"}
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
            All-in-one platform<br />
            <span className="text-cyan-300">for crypto wealth</span>
          </h1>
          <p className="mt-6 text-white/80 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Automated yield strategies, real-time arbitrage, and tokenized asset allocation — built for serious investors.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#contact" className="bg-white text-blue-700 font-bold px-8 py-4 rounded-full text-sm hover:bg-blue-50 transition-all shadow-xl inline-flex items-center gap-2">
              Start Earning Free
              <ArrowRight className="h-4 w-4" />
            </a>
            <a href="#features" className="text-white/90 font-semibold text-sm hover:text-white transition-colors inline-flex items-center gap-2 border border-white/30 px-6 py-4 rounded-full">
              See How It Works
            </a>
          </div>

          {/* Social proof stars */}
          <div className="mt-10 flex items-center justify-center gap-2 text-white/70 text-xs">
            <div className="flex">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />)}
            </div>
            <span>Trusted by 2,400+ investors globally</span>
          </div>
        </div>

        {/* Large floating center card (product mockup) */}
        <div className="relative z-10 mt-12 w-full max-w-3xl mx-auto px-6">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-2xl">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Total Assets", value: "$4.2B", icon: "💎", change: "+14%" },
                { label: "Active Pools", value: "247", icon: "⚡", change: "+32" },
                { label: "Avg. Yield", value: "11.2%", icon: "📈", change: "APY" },
              ].map((s, i) => (
                <div key={i} className="bg-white/20 rounded-2xl p-4 text-center text-white">
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className="text-xl sm:text-2xl font-extrabold">{s.value}</div>
                  <div className="text-xs text-white/70 mt-0.5">{s.label}</div>
                  <div className="text-xs font-bold text-green-300 mt-1">{s.change}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ocean wave */}
        <div className="w-full mt-12">
          <WaveBottom fill="#f0f9ff" />
        </div>
      </section>

      {/* ──────────── SECTION 2: FEATURES / HOW IT WORKS ──────────── */}
      <section id="features" className="bg-sky-50 py-4 pb-0">
        <div id="how-it-works" className="max-w-6xl mx-auto px-6 pt-12 pb-4">
          <div className="text-center mb-12">
            <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-4">
              Platform Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Everything you need to<br />grow your crypto wealth
            </h2>
            <p className="mt-4 text-gray-500 text-sm sm:text-base max-w-xl mx-auto">
              Built for investors who demand automation, transparency, and institutional-grade infrastructure.
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: <Zap className="h-6 w-6 text-blue-600" />,
                bg: "bg-blue-50",
                badge: "Live",
                badgeColor: "bg-blue-600",
                title: "Automated Yield Engine",
                desc: "Smart contracts continuously harvest and reinvest yields across 50+ DeFi protocols — no manual action required.",
                stat: "6.8% – 14.1%",
                statLabel: "Average APY range",
                color: "border-blue-100",
              },
              {
                icon: <TrendingUp className="h-6 w-6 text-cyan-600" />,
                bg: "bg-cyan-50",
                badge: "Popular",
                badgeColor: "bg-cyan-500",
                title: "Microsecond Arbitrage",
                desc: "Proprietary bots capture price discrepancies across 200+ exchanges in milliseconds, converting latency into profit.",
                stat: "200+",
                statLabel: "Exchanges monitored",
                color: "border-cyan-100",
              },
              {
                icon: <Shield className="h-6 w-6 text-indigo-600" />,
                bg: "bg-indigo-50",
                badge: "Secure",
                badgeColor: "bg-indigo-600",
                title: "Tokenized Assets",
                desc: "Fractional blockchain ownership of real estate, bonds, and commodities — settling globally in under 5 seconds.",
                stat: "$2.4B+",
                statLabel: "Assets tokenized",
                color: "border-indigo-100",
              },
            ].map((f, i) => (
              <div key={i} className={`card-hover bg-white rounded-3xl border-2 ${f.color} p-7 relative overflow-hidden`}>
                <div className="flex items-center justify-between mb-5">
                  <div className={`h-12 w-12 ${f.bg} rounded-2xl flex items-center justify-center`}>{f.icon}</div>
                  <span className={`text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${f.badgeColor}`}>{f.badge}</span>
                </div>
                <h3 className="text-lg font-extrabold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-5">{f.desc}</p>
                <div className="border-t border-gray-100 pt-4">
                  <div className="text-2xl font-extrabold text-gray-900">{f.stat}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{f.statLabel}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Wide stats banner */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-8 text-white">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { v: "37%", l: "Average annual return" },
                { v: "92%", l: "Client retention rate" },
                { v: "$4.2B", l: "Assets under management" },
                { v: "2,400+", l: "Active investors" },
              ].map((s, i) => (
                <div key={i}>
                  <div className="text-3xl sm:text-4xl font-extrabold">{s.v}</div>
                  <div className="text-white/70 text-xs mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative underwater elements */}
        <div className="relative h-32 overflow-hidden mt-4">
          {/* Seaweed left */}
          <svg className="absolute bottom-0 left-8 opacity-60" width="40" height="80" viewBox="0 0 40 80">
            <path d="M20 80 Q10 60 20 40 Q30 20 20 0" stroke="#22c55e" strokeWidth="4" fill="none" strokeLinecap="round"/>
            <ellipse cx="13" cy="55" rx="8" ry="5" fill="#22c55e" opacity="0.6"/>
            <ellipse cx="27" cy="28" rx="8" ry="5" fill="#16a34a" opacity="0.6"/>
          </svg>
          {/* Seaweed right */}
          <svg className="absolute bottom-0 right-12 opacity-60" width="40" height="60" viewBox="0 0 40 60">
            <path d="M20 60 Q30 45 20 30 Q10 15 20 0" stroke="#16a34a" strokeWidth="4" fill="none" strokeLinecap="round"/>
            <ellipse cx="27" cy="42" rx="7" ry="4" fill="#22c55e" opacity="0.5"/>
          </svg>
          {/* Fish */}
          <svg className="absolute bottom-8 left-1/3 float-slow" width="50" height="30" viewBox="0 0 50 30">
            <ellipse cx="22" cy="15" rx="18" ry="10" fill="#38bdf8"/>
            <polygon points="40,5 50,15 40,25" fill="#0ea5e9"/>
            <circle cx="12" cy="12" r="3" fill="white"/>
            <circle cx="11" cy="12" r="1.5" fill="#1e3a5f"/>
          </svg>
          {/* Coral */}
          <svg className="absolute bottom-0 left-1/2 opacity-40" width="60" height="40" viewBox="0 0 60 40">
            <path d="M30 40 L25 20 M25 20 L15 10 M25 20 L35 8 M25 20 L20 5" stroke="#f97316" strokeWidth="5" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Wave into next section */}
        <div style={{ background: "linear-gradient(160deg,#1e40af,#3b82f6 40%,#0891b2)" }}>
          <WaveTop fill="#f0f9ff" />
        </div>
      </section>

      {/* ──────────── SECTION 3: BENEFITS / SOCIAL PROOF ──────────── */}
      <section
        id="benefits"
        className="relative overflow-hidden py-20"
        style={{ background: "linear-gradient(160deg, #1e40af 0%, #3b82f6 40%, #0891b2 80%, #06b6d4 100%)" }}
      >
        {/* Decorative blobs */}
        <div className="absolute top-10 right-0 w-96 h-96 rounded-full bg-cyan-400/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="inline-block bg-white/15 text-white text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-4 border border-white/20">
              Why Investors Choose Us
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Built for your <span className="text-cyan-300">financial freedom</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left: testimonial cards */}
            <div className="space-y-4">
              {[
                { name: "Marcus T.", role: "Private Equity Partner", quote: "VortexCrypto tripled our crypto allocation yield in 8 months. The automation is flawless.", stars: 5, avatar: "M" },
                { name: "Priya S.", role: "Family Office CIO", quote: "Finally a platform that handles institutional volumes with DeFi-grade returns. Remarkable.", stars: 5, avatar: "P" },
                { name: "David K.", role: "Hedge Fund Manager", quote: "The arbitrage engine alone has paid for our entire subscription many times over.", stars: 5, avatar: "D" },
              ].map((t, i) => (
                <div key={i} className="card-hover bg-white rounded-2xl p-5 shadow-xl flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {t.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-0.5 mb-1">
                      {[...Array(t.stars)].map((_, si) => <Star key={si} className="h-3 w-3 fill-yellow-400 text-yellow-400" />)}
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed italic mb-2">"{t.quote}"</p>
                    <div className="text-xs font-bold text-gray-900">{t.name} <span className="font-normal text-gray-400">· {t.role}</span></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: benefits list */}
            <div className="space-y-5">
              {[
                { icon: "🚀", title: "Instant Onboarding", desc: "Start earning within 60 minutes of your account verification. No legacy delays." },
                { icon: "🔒", title: "Bank-Grade Security", desc: "AES-256 encryption, multi-sig wallets, and real-time fraud monitoring protect every dollar." },
                { icon: "📊", title: "Transparent Reporting", desc: "Live dashboards show every trade, yield, and position with full audit trails." },
                { icon: "🌍", title: "Global Accessibility", desc: "Operate from 40+ countries with local currency settlement and compliance coverage." },
              ].map((b, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="h-12 w-12 bg-white/15 backdrop-blur rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 border border-white/20">
                    {b.icon}
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-base">{b.title}</h4>
                    <p className="text-white/70 text-sm leading-relaxed mt-0.5">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave to white contact section */}
        <div className="mt-16">
          <WaveBottom fill="#ffffff" />
        </div>
      </section>

      {/* ──────────── SECTION 4: CONTACT FORM ──────────── */}
      <section id="contact" className="bg-white py-6 pb-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-4">
              Get Started Today
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Schedule your demo
            </h2>
            <p className="mt-3 text-gray-500 text-sm max-w-md mx-auto">
              Tell us about your investment goals. We'll set up a personalised onboarding session.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            {/* Left: info */}
            <div className="space-y-8">
              <div
                className="rounded-3xl p-8 text-white relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, #1d4ed8, #0891b2)" }}
              >
                {/* Decorative */}
                <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10" />
                <div className="absolute -right-2 bottom-4 w-24 h-24 rounded-full bg-cyan-400/20" />

                {/* Fish illustration */}
                <div className="relative z-10">
                  <div className="mb-6">
                    <svg width="64" height="40" viewBox="0 0 64 40" className="float-anim">
                      <ellipse cx="28" cy="20" rx="22" ry="14" fill="#7dd3fc"/>
                      <polygon points="50,6 64,20 50,34" fill="#38bdf8"/>
                      <circle cx="14" cy="16" r="4" fill="white"/>
                      <circle cx="13" cy="15.5" r="2" fill="#1e3a5f"/>
                      <path d="M28 6 Q22 0 16 6" stroke="#bae6fd" strokeWidth="2" fill="none"/>
                      <path d="M28 34 Q22 40 16 34" stroke="#bae6fd" strokeWidth="2" fill="none"/>
                    </svg>
                  </div>

                  <h3 className="text-2xl font-extrabold mb-2">Interested?<br />Schedule your demo today.</h3>
                  <p className="text-white/75 text-sm leading-relaxed mb-8">
                    Our onboarding team will contact you within 60 minutes with a custom proposal matching your portfolio goals.
                  </p>

                  <div className="space-y-4">
                    {[
                      { icon: "✅", text: "No commitment required" },
                      { icon: "⚡", text: "Setup in under 60 minutes" },
                      { icon: "🔒", text: "Fully encrypted & secure" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm text-white/90">
                        <span className="text-base">{item.icon}</span>
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Seaweed decoration below card */}
              <div className="flex items-end gap-4 px-4 opacity-60">
                <svg width="30" height="60" viewBox="0 0 30 60">
                  <path d="M15 60 Q5 45 15 30 Q25 15 15 0" stroke="#22c55e" strokeWidth="4" fill="none" strokeLinecap="round"/>
                  <ellipse cx="8" cy="42" rx="6" ry="4" fill="#22c55e" opacity="0.7"/>
                  <ellipse cx="22" cy="20" rx="6" ry="4" fill="#16a34a" opacity="0.7"/>
                </svg>
                <svg width="30" height="45" viewBox="0 0 30 45">
                  <path d="M15 45 Q22 33 15 22 Q8 11 15 0" stroke="#16a34a" strokeWidth="4" fill="none" strokeLinecap="round"/>
                  <ellipse cx="21" cy="30" rx="5" ry="3.5" fill="#22c55e" opacity="0.6"/>
                </svg>
                <svg width="50" height="30" viewBox="0 0 50 30" className="float-slow mb-2">
                  <ellipse cx="22" cy="15" rx="18" ry="9" fill="#38bdf8"/>
                  <polygon points="40,6 50,15 40,24" fill="#0ea5e9"/>
                  <circle cx="12" cy="12" r="3" fill="white"/>
                  <circle cx="11" cy="12" r="1.5" fill="#1e3a5f"/>
                </svg>
              </div>
            </div>

            {/* Right: Form card */}
            <div>
              {status === "success" ? (
                <FloatingCard className="text-center py-14">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-50 border-2 border-green-200 text-green-500 mb-6 mx-auto">
                    <Check className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-gray-900 mb-3">You're in the queue!</h3>
                  <p className="text-gray-500 text-sm max-w-xs mx-auto leading-relaxed">
                    Your enquiry has been received. An onboarding specialist will reach you within the hour.
                  </p>
                  <div className="mt-6 inline-block bg-gray-50 border border-gray-200 rounded-full px-6 py-2 font-mono text-xs text-gray-600">
                    REF: <span className="text-blue-600 font-bold">VX-{Math.floor(100000 + Math.random() * 899999)}</span>
                  </div>
                </FloatingCard>
              ) : (
                <FloatingCard>
                  <h3 className="text-xl font-extrabold text-gray-900 mb-6">Tell us about yourself</h3>

                  {errors.general && (
                    <div className="mb-4 rounded-2xl bg-red-50 border border-red-200 p-4 text-xs text-red-600 font-medium text-center">
                      {errors.general}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name + Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5">Full Name *</label>
                        <input
                          type="text" required value={form.name} onChange={set("name")}
                          placeholder="Alexandra Chen"
                          className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5">Email Address *</label>
                        <input
                          type="email" required value={form.email} onChange={set("email")}
                          placeholder="alex@fund.com"
                          className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1.5">Phone Number</label>
                      <div className="flex gap-3">
                        <select
                          value={form.countryCode} onChange={set("countryCode")}
                          className="bg-gray-50 border border-gray-200 rounded-2xl px-3 py-3 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all appearance-none min-w-[120px]"
                          style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", backgroundSize: "14px", paddingRight: "32px" }}
                        >
                          {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
                        </select>
                        <input
                          type="tel" value={form.phone} onChange={set("phone")}
                          placeholder={cfg.placeholder}
                          className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                      </div>
                      {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1.5">Investment Goals</label>
                      <textarea
                        rows={4} value={form.message} onChange={set("message")}
                        placeholder="Tell us about your portfolio size, target returns, and timeline..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                      />
                    </div>

                    {/* Submit */}
                    <button
                      type="submit" disabled={status === "loading"}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-full py-4 text-sm font-extrabold text-white transition-all disabled:opacity-60 shadow-lg"
                      style={{ background: "linear-gradient(135deg, #1d4ed8, #0891b2)" }}
                    >
                      {status === "loading" ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</>
                      ) : (
                        <>Schedule my Demo <ArrowRight className="h-4 w-4" /></>
                      )}
                    </button>

                    <p className="text-center text-xs text-gray-400">
                      No spam, ever. Unsubscribe at any time.
                    </p>
                  </form>
                </FloatingCard>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ──────────── FOOTER ──────────── */}
      <footer
        className="py-10 text-center relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1e40af, #0891b2)" }}
      >
        {/* Seaweed & fish decorations */}
        <div className="absolute bottom-0 left-6 opacity-50">
          <svg width="30" height="50" viewBox="0 0 30 50">
            <path d="M15 50 Q5 37 15 25 Q25 12 15 0" stroke="#22c55e" strokeWidth="3" fill="none" strokeLinecap="round"/>
            <ellipse cx="8" cy="35" rx="5" ry="3" fill="#22c55e" opacity="0.8"/>
          </svg>
        </div>
        <div className="absolute bottom-0 right-6 opacity-50">
          <svg width="40" height="25" viewBox="0 0 40 25" className="float-slow mb-2">
            <ellipse cx="18" cy="12" rx="14" ry="8" fill="#7dd3fc"/>
            <polygon points="32,4 40,12 32,20" fill="#38bdf8"/>
            <circle cx="10" cy="9" r="2.5" fill="white"/>
            <circle cx="9.5" cy="9" r="1.2" fill="#1e3a5f"/>
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="h-7 w-7 rounded-lg bg-white/20 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="text-white font-extrabold text-lg tracking-tight">VortexCrypto</span>
          </div>
          <p className="text-white/60 text-xs">
            © {new Date().getFullYear()} VortexCrypto. All rights reserved. · Institutional-grade crypto wealth management.
          </p>
        </div>
      </footer>
    </div>
  );
}
