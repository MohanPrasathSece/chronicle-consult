import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Menu,
  Bookmark,
  Printer,
  Share2,
  Headphones,
  Type,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Rss,
  Mail,
  Phone,
  MapPin,
  Cloud,
  ArrowUpRight,
  Check,
  Loader2,
  Play,
} from "lucide-react";

import heroImg from "@/assets/hero-trading-floor.jpg";
import institutionImg from "@/assets/institution.jpg";

import {
  validatePhoneNumber,
  mapCountryNameToCode,
  countryConfigs,
} from "../lib/phoneValidation";

/* ------------------------------------------------------------------ */
/*  Small helpers & Custom Hooks                                       */
/* ------------------------------------------------------------------ */

function useReveal() {
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
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function useReadingProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const total = h.scrollHeight - h.clientHeight;
      setP(total > 0 ? Math.min(1, Math.max(0, h.scrollTop / total)) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return p;
}

function useCountUp(target: number, active: boolean, duration = 1400) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - k, 3);
      setV(target * eased);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration]);
  return v;
}

/* ------------------------------------------------------------------ */
/*  Navigation & Constants                                             */
/* ------------------------------------------------------------------ */

const NAV = [
  "City",
  "Live",
  "Markets",
  "Business",
  "Economy",
  "Opinion",
  "World",
  "Technology",
  "Blogs",
];

const trendingTags = [
  "Bitcoin at $98k",
  "Ethereum ETF Inflows",
  "Solana DEX Volume Spikes",
  "SEC DeFi Mandates",
  "Ukraine Drone Attack",
  "Bangladesh Bomb Blast",
  "Rick Scott",
  "Strait of Hormuz",
  "Yield Curves Reset",
  "Gas Fees Reduction",
  "Zero-Knowledge Rollups",
  "L3 Scalability",
  "US Debt Ceiling",
  "Interest Rate Spikes",
  "NVIDIA Valuation",
  "Tokyo Inflation",
  "ECB Rate Cuts",
  "Gold Reserve Index",
  "Crude Oil Spreads",
  "Arbitrum Upgrade",
];

const TIMELINE = [
  { y: "1998", t: "Founded in London by former fixed-income desk heads." },
  { y: "2004", t: "Opens institutional research office in Mumbai." },
  { y: "2008", t: "Preserves 96% of client capital through the financial crisis." },
  { y: "2013", t: "First sovereign mandate; assets cross USD 4 bn." },
  { y: "2019", t: "Publishes ‘Six Signals’ framework for macro screening." },
  { y: "2022", t: "Adds private-credit and infrastructure research desks." },
  { y: "2025", t: "Named among 20 most-cited allocators globally." },
];

const inTheNewsItems = [
  { name: "AI Masterclass" },
  { name: "Money Masterclass" },
  { name: "Ask Apollo", isNew: true },
  { name: "BTC Backtest" },
  { name: "DeFi Sourcing" },
  { name: "Solana ETF Decision" },
  { name: "Institutional Inflows" },
  { name: "Securitized Yields", isNew: true },
  { name: "Tokenized Treasury" },
  { name: "Arbitrage Desks" },
  { name: "Tokenized Bonds" },
  { name: "Yield Compression" },
  { name: "SEC Updates" },
  { name: "Macro Indicators" },
  { name: "Treasury Yields" },
  { name: "DeFi Governance" },
  { name: "Gas Token Spikes", isNew: true },
];

const TICKER = [
  { s: "BTC", v: "$98,204", d: "+4.14%" },
  { s: "ETH", v: "$3,428.21", d: "+2.42%" },
  { s: "SOL", v: "$214.08", d: "+8.31%" },
  { s: "DOW", v: "39,428.21", d: "+0.42%" },
  { s: "S&P 500", v: "5,214.08", d: "+0.31%" },
  { s: "NASDAQ", v: "16,742.39", d: "-0.18%" },
  { s: "GOLD", v: "$2,384.10", d: "+0.11%" },
  { s: "BRENT", v: "$84.16", d: "+0.87%" },
  { s: "USD/INR", v: "83.94", d: "+0.05%" },
];

const COUNTRIES = [
  "Cyprus",
  "Switzerland",
  "United States",
  "United Kingdom",
  "Germany",
  "India",
  "France",
  "Belgium",
  "Italy",
  "Spain",
  "Netherlands",
  "Austria",
  "Sweden",
  "Other",
];

const BUDGETS = [
  "USD 100k — 250k",
  "USD 250k — 1 M",
  "USD 1 M — 5 M",
  "USD 5 M — 25 M",
  "USD 25 M +",
  "Institutional mandate",
];

function TopBar() {
  const [edition, setEdition] = useState("US");
  const [showEditionDropdown, setShowEditionDropdown] = useState(false);

  const formattedDate = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "2-digit",
      year: "numeric",
    }) + " | Updated 02:08PM IST";
  }, []);

  const editions = [
    { code: "US", name: "US", flag: "🇺🇸" },
    { code: "IN", name: "IN", flag: "🇮🇳" },
    { code: "GCC", name: "GCC", flag: "🇧🇭" },
  ];

  const activeFlag = editions.find((e) => e.code === edition)?.flag || "🇺🇸";

  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-1.5 text-[11px] font-sans text-slate-500 sm:px-6">
        <div className="flex items-center gap-4">
          {/* Edition Selector */}
          <div className="relative">
            <button
              onClick={() => setShowEditionDropdown(!showEditionDropdown)}
              className="flex items-center gap-1 hover:text-slate-900 cursor-pointer"
            >
              <span>Edition</span>
              <span className="ml-1">{activeFlag} {edition}</span>
              <span className="text-[8px]">▼</span>
            </button>
            {showEditionDropdown && (
              <div className="absolute left-0 mt-1 z-50 w-28 bg-white border border-slate-200 rounded shadow-lg py-1">
                {editions.map((e) => (
                  <button
                    key={e.code}
                    onClick={() => {
                      setEdition(e.code);
                      setShowEditionDropdown(false);
                    }}
                    className="flex items-center gap-2 w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 cursor-pointer"
                  >
                    <span>{e.flag}</span>
                    <span>{e.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <span className="text-slate-300">|</span>

          {/* Language selector */}
          <div className="flex items-center gap-1 cursor-pointer hover:text-slate-900">
            <span>English</span>
            <span className="text-[8px]">▼</span>
          </div>

          <span className="text-slate-300">|</span>

          {/* Live Dynamic Date */}
          <span>{formattedDate}</span>

          <span className="text-slate-300">|</span>

          {/* Weather Widget */}
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3" />
            <span>London 14° Overcast</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <a href="/enquiry" className="text-red-600 hover:underline font-bold">
            Portal
          </a>
          <a href="#signin" className="hover:text-slate-900">
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
}

function Masthead() {
  return (
    <div className="bg-white py-4 text-center">
      <div className="mx-auto max-w-[1280px] px-4">
        <h1 
          className="font-display text-[4vw] tracking-wider text-black uppercase font-extrabold border-none"
          style={{ fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "0.06em" }}
        >
          The Investor's Chronicle
        </h1>
      </div>
    </div>
  );
}

function NavigationBar() {
  return (
    <div className="border-y border-slate-900 bg-white">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 sm:px-6">
        <nav aria-label="Main" className="flex-1 overflow-x-auto whitespace-nowrap scrollbar-none">
          <ul className="flex items-center gap-5 py-2.5 font-sans text-[13px] font-bold text-slate-800">
            {NAV.map((item, idx) => (
              <li key={idx} className="hover:text-red-600 transition-colors">
                <a href={`#${item.toLowerCase()}`}>{item}</a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right Nav Icons */}
        <div className="flex items-center gap-4 border-l border-slate-200 pl-4 py-2 text-slate-800 font-sans text-xs">
          <span className="border border-red-600 text-red-600 font-black px-2 py-0.5 rounded text-[11px] tracking-wider cursor-pointer">
            IC+
          </span>
          <button aria-label="Search" className="hover:text-red-600 cursor-pointer">
            <Search className="h-4 w-4 stroke-[2.5]" />
          </button>
          <button aria-label="Menu" className="hover:text-red-600 cursor-pointer">
            <Menu className="h-4 w-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
}

function InTheNewsBar() {
  return (
    <div className="border-b border-slate-200 bg-white py-2">
      <div className="mx-auto flex max-w-[1280px] items-center gap-4 px-4 sm:px-6 text-xs overflow-x-auto whitespace-nowrap scrollbar-none">
        <span className="font-bold text-red-600 uppercase pr-2">
          In The News
        </span>
        <div className="flex items-center gap-6">
          {inTheNewsItems.map((item, idx) => (
            <div key={idx} className="relative group cursor-pointer inline-block text-[12px] font-sans text-slate-800 hover:text-red-600 font-medium">
              {item.isNew && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[7px] font-black text-red-600 uppercase bg-white px-0.5 leading-none">
                  New
                </span>
              )}
              <a href={`#${item.name.toLowerCase()}`}>{item.name}</a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StickyBar({ progress }: { progress: number }) {
  return (
    <div className="fixed inset-x-0 top-0 z-50 border-b border-slate-300 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
        <div className="flex items-center gap-3">
          <button aria-label="Open menu" className="text-slate-800 hover:text-red-600">
            <Menu className="h-5 w-5" />
          </button>
          <a
            href="#top"
            className="font-display text-lg font-extrabold uppercase tracking-wide text-slate-900"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            The Investor's Chronicle
          </a>
        </div>
        <nav aria-label="Sticky" className="hidden lg:block">
          <ul className="flex items-center gap-5 font-sans text-[12px] font-bold text-slate-700">
            {NAV.slice(0, 6).map((n) => (
              <li key={n} className="hover:text-red-600">
                <a href={`#${n.toLowerCase()}`}>{n}</a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-3 font-sans text-[12px] uppercase">
          <a href="/enquiry" className="bg-red-600 text-white font-extrabold px-2.5 py-1 rounded text-xs hover:bg-red-700 transition-colors">
            IC+ Portal
          </a>
        </div>
      </div>
      <div
        className="h-[2.5px] origin-left bg-red-600 transition-transform duration-150 ease-out"
        style={{ transform: `scaleX(${progress})` }}
        aria-hidden
      />
    </div>
  );
}

function Ticker() {
  const items = [...TICKER, ...TICKER];
  return (
    <div className="border-b border-slate-200 overflow-hidden bg-white">
      <div className="mx-auto flex max-w-[1280px] items-stretch">
        <span className="flex items-center border-r border-slate-200 bg-slate-100 px-3 font-sans text-[9px] font-bold uppercase tracking-wider text-slate-700 z-10 whitespace-nowrap">
          Live Markets
        </span>
        <div className="relative flex-1 overflow-hidden">
          <div className="ticker-track flex w-max gap-8 py-1.5 pl-6 font-mono text-[11px]">
            {items.map((t, i) => (
              <span key={i} className="flex items-center gap-2 whitespace-nowrap">
                <span className="font-semibold text-slate-800">{t.s}</span>
                <span className="text-slate-500">{t.v}</span>
                <span
                  className={
                    t.d.startsWith("-") ? "text-red-600" : "text-slate-900 font-semibold"
                  }
                >
                  {t.d}
                </span>
                <span className="text-slate-300">·</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Body Elements                                                      */
/* ------------------------------------------------------------------ */

function ArticleMeta() {
  const [saved, setSaved] = useState(false);
  return (
    <div className="flex items-center justify-between border-y border-slate-200 py-2.5 text-[11px] font-sans text-slate-500 my-4">
      <div className="flex items-center gap-2">
        <span>By <strong>Eleanor Marsh</strong></span>
        <span>·</span>
        <span>London</span>
        <span>·</span>
        <span>Updated Jul 08, 2026, 09:42 GMT</span>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSaved((s) => !s)}
          className={`flex items-center gap-1 hover:text-slate-800 ${saved ? "text-red-600" : ""}`}
        >
          <Bookmark className="h-3.5 w-3.5" />
          <span>{saved ? "Saved" : "Save"}</span>
        </button>
        <button onClick={() => window.print()} className="flex items-center gap-1 hover:text-slate-800">
          <Printer className="h-3.5 w-3.5" />
          <span>Print</span>
        </button>
      </div>
    </div>
  );
}

function Stat({ n, suffix = "", label }: { n: number; suffix?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setActive(true),
      { threshold: 0.4 },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  const v = useCountUp(n, active);
  const display =
    n % 1 === 0 ? Math.round(v).toLocaleString() : v.toFixed(1);
  return (
    <div ref={ref} className="bg-white border border-slate-200 p-4 text-center rounded">
      <div className="font-sans text-3xl font-extrabold text-slate-900">
        {display}
        {suffix}
      </div>
      <p className="mt-1 font-sans text-[10px] uppercase font-bold tracking-wider text-slate-500">
        {label}
      </p>
    </div>
  );
}

function ConsultationForm() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    country: "",
    budget: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const update =
    (k: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [k]: e.target.value }));
    };

  // Instant Validation
  useEffect(() => {
    if (!form.phone.trim()) {
      setErrors((prev) => {
        const { phone: _, ...rest } = prev;
        return rest;
      });
      return;
    }
    const countryCode = mapCountryNameToCode(form.country);
    const phoneErr = validatePhoneNumber(form.phone, countryCode);
    setErrors((prev) => {
      if (phoneErr) {
        return { ...prev, phone: phoneErr };
      } else {
        const { phone: _, ...rest } = prev;
        return rest;
      }
    });
  }, [form.phone, form.country]);

  function validate() {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = "Please enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Please enter a valid email.";
    
    const countryCode = mapCountryNameToCode(form.country);
    const phoneErr = validatePhoneNumber(form.phone, countryCode);
    if (phoneErr) {
      e.phone = phoneErr;
    }

    if (!form.country) e.country = "Please select a country.";
    if (!form.budget) e.budget = "Please select a range.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setStatus("loading");

    try {
      const countryCode = mapCountryNameToCode(form.country);
      const res = await fetch("/api/submit-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          countryCode: countryCode,
          budget: form.budget,
          message: form.message,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        let errMsg = data.error || "Failed to submit. Please try again.";
        if (errMsg.toLowerCase().includes("lead is not valid")) {
          errMsg = "Invalid phone number format for selected country.";
        }
        setErrors({ name: errMsg });
        setStatus("idle");
        return;
      }

      setStatus("success");
    } catch (err) {
      console.error(err);
      setErrors({ name: "Network error. Please try again." });
      setStatus("idle");
    }
  }

  const selectedCountryCode = mapCountryNameToCode(form.country);
  const phonePlaceholder = countryConfigs[selectedCountryCode]?.placeholder || "+357 99 123456";

  if (status === "success") {
    return (
      <div className="border border-slate-300 bg-white p-8 text-center rounded-lg" role="status">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white">
          <Check className="h-5 w-5" />
        </span>
        <h4 className="mt-4 font-sans text-xl font-bold text-slate-900">Request Transmitted</h4>
        <p className="mx-auto mt-2 max-w-[420px] font-sans text-xs text-slate-500 leading-relaxed">
          The Investment Desk will contact you within one business day.
        </p>
      </div>
    );
  }

  const field =
    "w-full border border-slate-300 rounded bg-white px-3 py-2 font-sans text-[14px] text-slate-900 outline-none focus:border-red-500 transition-colors";

  return (
    <form onSubmit={onSubmit} noValidate className="border border-slate-200 bg-white p-6 rounded-lg shadow-sm">
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block font-sans text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Full name
          </label>
          <input
            id="name"
            className={field}
            value={form.name}
            onChange={update("name")}
            placeholder="Marcus Ashcroft"
            required
          />
          {errors.name && <p className="mt-1 font-sans text-[11px] text-red-600">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="email" className="block font-sans text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Email address
          </label>
          <input
            id="email"
            type="email"
            className={field}
            value={form.email}
            onChange={update("email")}
            placeholder="m.ashcroft@corporate.com"
            required
          />
          {errors.email && <p className="mt-1 font-sans text-[11px] text-red-600">{errors.email}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="country" className="block font-sans text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Country
            </label>
            <select
              id="country"
              className={field}
              value={form.country}
              onChange={update("country")}
              required
            >
              <option value="">Select country</option>
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.country && <p className="mt-1 font-sans text-[11px] text-red-600">{errors.country}</p>}
          </div>
          <div>
            <label htmlFor="phone" className="block font-sans text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Telephone
            </label>
            <input
              id="phone"
              type="tel"
              className={field}
              value={form.phone}
              onChange={update("phone")}
              placeholder={phonePlaceholder}
            />
            {errors.phone && <p className="mt-1 font-sans text-[11px] text-red-600">{errors.phone}</p>}
          </div>
        </div>
        <div>
          <label htmlFor="budget" className="block font-sans text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Investment size
          </label>
          <select
            id="budget"
            className={field}
            value={form.budget}
            onChange={update("budget")}
            required
          >
            <option value="">Select range</option>
            {BUDGETS.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          {errors.budget && <p className="mt-1 font-sans text-[11px] text-red-600">{errors.budget}</p>}
        </div>
        <div>
          <label htmlFor="message" className="block font-sans text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Brief specifications
          </label>
          <textarea
            id="message"
            className={`${field} resize-none`}
            value={form.message}
            onChange={update("message")}
            rows={3}
            placeholder="Hedging specifications, timelines, or capital placement requirements..."
          />
        </div>

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full inline-flex items-center justify-center gap-2 rounded bg-slate-950 hover:bg-red-600 text-white font-sans text-xs font-bold uppercase tracking-widest py-3 transition-colors cursor-pointer"
        >
          {status === "loading" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              TRANSMITTING...
            </>
          ) : (
            <>
              SUBMIT CONSULTATION REQUEST
              <ArrowUpRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

type FormState = {
  name: string;
  email: string;
  phone: string;
  country: string;
  budget: string;
  message: string;
};

/* ------------------------------------------------------------------ */
/*  Page Layout                                                        */
/* ------------------------------------------------------------------ */

export function IndexPage() {
  const progress = useReadingProgress();
  useReveal();

  return (
    <div id="top" className="bg-white text-slate-900 font-sans antialiased min-h-screen">
      <StickyBar progress={progress} />

      {/* header spacer for sticky bar */}
      <div className="h-12" aria-hidden />

      {/* Top Header widgets */}
      <TopBar />
      <Masthead />
      <NavigationBar />
      <InTheNewsBar />
      <Ticker />

      {/* Main 3-Column Grid Layout */}
      <main className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Related Articles (25% width equivalent) */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="border-b-2 border-slate-900 pb-2">
              <h3 className="font-sans font-extrabold text-sm uppercase tracking-wider text-slate-900">
                RELATED ARTICLES
              </h3>
            </div>
            
            {/* Related Article 1 */}
            <article className="border-b border-slate-200 pb-4">
              <div className="w-full aspect-video rounded overflow-hidden mb-2.5">
                <img 
                  src="https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&w=400&q=80" 
                  alt="DeFi Liquidity Pools" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h4 className="font-sans font-bold text-sm text-slate-900 hover:text-red-600 transition-colors leading-snug">
                <a href="#defi-pools">
                  DeFi Liquidity Pools: Re-engineering the Banking Infrastructure
                </a>
              </h4>
              <p className="mt-1 text-xs text-slate-500">
                How smart contract code replaces legacy banks and pays depositors direct interest.
              </p>
            </article>

            {/* Related Article 2 */}
            <article className="border-b border-slate-200 pb-4">
              <div className="w-full aspect-video rounded overflow-hidden mb-2.5">
                <img 
                  src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=400&q=80" 
                  alt="Tokenized Real Estate" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h4 className="font-sans font-bold text-sm text-slate-900 hover:text-red-600 transition-colors leading-snug">
                <a href="#tokenization">
                  Fractional Tokenization: Unleashing Hidden Real Estate Capital
                </a>
              </h4>
              <p className="mt-1 text-xs text-slate-500">
                Fractional blockchain shares make illiquid assets instantly tradeable worldwide.
              </p>
            </article>

            {/* Related Article 3 */}
            <article className="border-b border-slate-200 pb-4">
              <div className="w-full aspect-video rounded overflow-hidden mb-2.5">
                <img 
                  src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=400&q=80" 
                  alt="Arbitrage Execution" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h4 className="font-sans font-bold text-sm text-slate-900 hover:text-red-600 transition-colors leading-snug">
                <a href="#arbitrage">
                  Arbitrage Velocity: Capital Capture in the Microsecond Era
                </a>
              </h4>
              <p className="mt-1 text-xs text-slate-500">
                Automated bots capture discrepancies across hundreds of crypto exchanges.
              </p>
            </article>
          </aside>

          {/* CENTER COLUMN: Main Crypto Article (~55% width equivalent) */}
          <section className="lg:col-span-6 space-y-6 border-x border-slate-200 lg:px-6">
            <article id="article-body">
              <p className="font-sans text-[11px] font-extrabold uppercase tracking-widest text-red-600">
                Cryptocurrency & Capital Markets
              </p>
              
              <h2 
                className="mt-2 font-sans text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight"
                style={{ letterSpacing: "-0.02em" }}
              >
                The Liquidity Multiplier: How Digital Assets Accelerate Wealth Creation
              </h2>

              <p className="mt-3 font-sans text-sm text-slate-500 leading-relaxed">
                An analysis of the velocity of capital within blockchain systems, decentralized yields, and the mathematical parameters driving rapid valuation gains.
              </p>

              <ArticleMeta />

              <figure className="my-4">
                <img
                  src={heroImg}
                  alt="Traders at global asset-management floor"
                  className="w-full rounded object-cover"
                />
                <figcaption className="mt-2.5 font-sans text-[11px] text-slate-500 italic text-center">
                  Digital liquidity structures are redefining private capital placement. Photograph: The Investor's Chronicle.
                </figcaption>
              </figure>

              {/* Main article content in readable sans-serif font without quotes */}
              <div className="font-sans text-[15px] text-slate-800 leading-relaxed space-y-5">
                <p>
                  Blockchain technology and cryptocurrency markets have redefined how capital is generated and compounded in the digital age. Unlike traditional financial markets that rely on centralized gatekeepers, clearinghouses, and legacy banking systems, digital assets operate on decentralized networks that facilitate instant, borderless transactions. This structural change shifts the speed and efficiency of money, allowing individuals and institutions to increase capital velocity to unprecedented levels.
                </p>
                <p>
                  At the core of crypto’s ability to multiply money is the concept of decentralized liquidity pools. In traditional banking, when capital is deposited, the bank lends a fraction of it to borrowers, keeping the interest fees for itself while paying depositors a near-zero percentage. In decentralized finance (DeFi), smart contracts replace the bank. Depositors interact directly with automated liquidity protocols, earning up to eighty percent of transaction fees. By compounding these yields continuously, assets multiply automatically without intermediary delays.
                </p>
                <p>
                  Furthermore, tokenization creates fractional ownership of highly liquid assets. Real estate, venture equity, and sovereign debt are converted into digital shares that can be traded globally twenty-four hours a day, seven days a week. This continuous market access removes the traditional illiquidity premium, driving demand and asset prices higher. Investors can transfer value from real estate to yielding assets in seconds, bypassing weeks of administrative audits.
                </p>

                <div className="grid grid-cols-2 gap-4 my-6">
                  <Stat n={142} suffix=" B" label="Total Value Locked (DeFi TVL)" />
                  <Stat n={8.4} suffix="x" label="Capital Velocity Multiplier" />
                </div>

                {/* Video section */}
                <figure className="my-6 border border-slate-200 rounded-lg p-4 bg-white">
                  <h4 className="font-sans font-bold text-base text-slate-900 mb-2">
                    DeFi Asset Flows and Tokenization Dynamics
                  </h4>
                  <div className="relative aspect-video bg-black rounded overflow-hidden">
                    <video
                      src="https://assets.mixkit.co/videos/preview/mixkit-business-charts-on-a-screen-40082-large.mp4"
                      className="w-full h-full object-cover cursor-pointer"
                      autoPlay={false}
                      muted={false}
                      controls
                    />
                  </div>
                  <p className="mt-2 font-sans text-[11px] text-slate-500 italic text-center">
                    Eleanor Marsh reports on the structural flows behind the headlines. Click to play.
                  </p>
                </figure>

                <p>
                  Algorithmic arbitrage represents another major driver of quick capital returns. Automated trading systems identify price differences for the same asset across hundreds of global exchanges. Because crypto transactions settle in seconds, these systems buy the underpriced asset and sell it where it is overpriced, pocketing the difference instantly. This constant cycle of micro-spread capture generates consistent, compounded returns that are mathematically impossible under standard banking clearing cycles.
                </p>
                <p>
                  Ultimately, the acceleration of wealth in cryptocurrency is a direct function of system efficiency. By eliminating deposit settlement delays, high broker fees, and restrictive trading hours, capital compounds at its natural limit. The transition to tokenized economies is not merely a change of currency, but a complete re-engineering of the time-value of money.
                </p>
              </div>
            </article>

            {/* Chronology section */}
            <section id="business" className="border-t border-slate-200 pt-6">
              <h3 className="font-sans font-black text-xl text-slate-900 mb-4">
                Milestones in Blockchain Capital Velocity
              </h3>
              <p className="font-sans text-[14px] text-slate-600 leading-relaxed mb-4">
                A historical overview of infrastructure milestones that enabled instant global compounding.
              </p>
              <img
                src={institutionImg}
                alt="Institutional Infrastructure"
                className="w-full rounded object-cover my-4"
              />
              <ol className="space-y-4">
                {TIMELINE.slice(0, 4).map((t, idx) => (
                  <li key={idx} className="border-t border-slate-100 pt-3 flex gap-4">
                    <span className="font-mono text-xs text-red-600 font-bold">{t.y}</span>
                    <p className="font-sans text-xs text-slate-700 leading-normal">{t.t}</p>
                  </li>
                ))}
              </ol>
            </section>
          </section>

          {/* RIGHT COLUMN: Recommended Articles & Forms (25% width equivalent) */}
          <aside className="lg:col-span-3 space-y-6">
            
            {/* Header: Recommended Articles */}
            <div className="border-b-2 border-slate-900 pb-2">
              <h3 className="font-sans font-extrabold text-sm uppercase tracking-wider text-slate-900">
                RECOMMENDED ARTICLES
              </h3>
            </div>

            {/* Recommended Article 1 */}
            <article className="space-y-2 pb-4 border-b border-slate-100">
              <div className="w-full aspect-video rounded overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1516245834210-c4c142787335?auto=format&fit=crop&w=400&q=80" 
                  alt="Bitcoin Core" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h5 className="font-sans font-bold text-xs text-slate-900 leading-snug hover:text-red-600">
                <a href="#bitcoin">
                  L3 Scaling: Achieving Millions of Transfers Without High Gas Costs
                </a>
              </h5>
              <p className="text-[11px] text-slate-500">
                New layer structures compress network data, resolving Ethereum bottlenecks.
              </p>
            </article>

            {/* Recommended Article 2 */}
            <article className="space-y-2 pb-4 border-b border-slate-100">
              <div className="w-full aspect-video rounded overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&w=400&q=80" 
                  alt="Ethereum Nodes" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h5 className="font-sans font-bold text-xs text-slate-900 leading-snug hover:text-red-600">
                <a href="#stablecoins">
                  Stablecoin Velocity: Instant Settlements Releasing Hidden Capital
                </a>
              </h5>
              <p className="text-[11px] text-slate-500">
                Corporate treasury departments use digital fiat to optimize daily cash returns.
              </p>
            </article>

            {/* Consultation Form Widget */}
            <section id="consult" className="pt-4">
              <div className="mb-4">
                <h4 className="font-sans font-black text-sm uppercase tracking-wider text-slate-900">
                  PORTFOLIO CONSULTATION
                </h4>
                <p className="font-sans text-[11px] text-slate-500 leading-relaxed mt-1">
                  Connect securely with our institutional investment desk correspondence.
                </p>
              </div>
              <ConsultationForm />
            </section>
          </aside>

        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white text-slate-500 py-12 font-sans text-xs">
        <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-display font-extrabold text-slate-900 text-base uppercase" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              The Investor's Chronicle
            </h4>
            <p className="mt-2 text-slate-500 leading-relaxed">
              Reporting capital since 1998. Regulated by the editorial standards of independent journalism.
            </p>
          </div>
          <div>
            <h5 className="font-bold text-slate-900 uppercase mb-3">Headquarters</h5>
            <p className="space-y-1 text-slate-500 leading-relaxed">
              <span>48 Cornhill, London EC3V 3PD</span><br />
              <span>United Kingdom</span>
            </p>
          </div>
          <div>
            <h5 className="font-bold text-slate-900 uppercase mb-3">Support</h5>
            <p className="space-y-1 text-slate-500">
              <span>desk@investorschronicle.example</span><br />
              <span>+44 (0) 20 7946 0100</span>
            </p>
          </div>
          <div>
            <h5 className="font-bold text-slate-900 uppercase mb-3">Institutional</h5>
            <a href="/enquiry" className="text-red-600 font-bold hover:underline">
              Meridian Prime Portal
            </a>
          </div>
        </div>
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 border-t border-slate-200 mt-8 pt-6 flex flex-col md:flex-row justify-between text-slate-500">
          <p>© {new Date().getFullYear()} The Investor's Chronicle. All rights reserved.</p>
          <p className="mt-2 md:mt-0 uppercase tracking-widest text-[9px] font-bold text-red-600">SECURED GATEWAY ACTIVE</p>
        </div>
      </footer>
    </div>
  );
}
