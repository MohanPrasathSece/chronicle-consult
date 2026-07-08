import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Menu,
  Bookmark,
  Printer,
  Share2,
  Headphones,
  Type,
  ChevronRight,
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
  Quote,
  Play,
} from "lucide-react";

import heroImg from "@/assets/hero-trading-floor.jpg";
import reporterImg from "@/assets/reporter.jpg";
import institutionImg from "@/assets/institution.jpg";

import {
  validatePhoneNumber,
  mapCountryNameToCode,
  countryConfigs,
} from "../lib/phoneValidation";

/* ------------------------------------------------------------------ */
/*  Small helpers                                                      */
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
  "Ukraine Drone Attack",
  "Bangladesh Bomb Blast",
  "Rick Scott",
  "Strait of Hormuz",
  "Benjamin Netanyahu",
  "BTC at $71k",
  "Ethereum ETF Inflows",
  "Cyprus Yield Desk",
  "FOMC Minutes",
  "Liquidity Crunch",
  "Yield Curves",
  "Gas Fees Reduction",
  "Zero-Knowledge Rollups",
  "L3 Scalability",
  "US Debt Ceiling",
  "Interest Rate Spikes",
  "Nasdaq Record Highs",
  "NVIDIA Valuation",
  "Tokyo Inflation",
  "ECB Rate Cuts",
  "Gold Reserve Index",
  "Crude Oil Spreads",
  "Eurozone Divergence",
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
  { name: "Parentology" },
  { name: "BTC Backtest" },
  { name: "Cyprus Sourcing" },
  { name: "MPC Custody" },
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
  { name: "Gas Token Spikes" },
  { name: "DEX Volumes" },
  { name: "Venture Deployments" },
  { name: "AI Cloud Spending", isNew: true },
];

const TICKER = [
  { s: "DOW", v: "39,428.21", d: "+0.42%" },
  { s: "S&P 500", v: "5,214.08", d: "+0.31%" },
  { s: "NASDAQ", v: "16,742.39", d: "-0.18%" },
  { s: "FTSE 100", v: "8,152.44", d: "+0.09%" },
  { s: "NIKKEI", v: "40,168.07", d: "-0.24%" },
  { s: "SENSEX", v: "82,401.16", d: "+0.55%" },
  { s: "NIFTY 50", v: "25,124.90", d: "+0.48%" },
  { s: "HANG SENG", v: "18,432.11", d: "-0.62%" },
  { s: "GOLD", v: "$2,384.10", d: "+0.11%" },
  { s: "BRENT", v: "$84.16", d: "+0.87%" },
  { s: "USD/INR", v: "83.94", d: "+0.05%" },
  { s: "BTC", v: "$63,204", d: "-1.14%" },
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
          {/* Muted/Red IC+ badge */}
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
          
          {/* LEFT COLUMN: Sidebar Feed (~20% width equivalent) */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="border-b-2 border-slate-900 pb-2">
              <h3 className="font-sans font-extrabold text-sm uppercase tracking-wider text-slate-900">
                LATEST BULLETINS
              </h3>
            </div>
            
            {/* Sidebar Article Card 1 */}
            <article className="border-b border-slate-200 pb-4">
              <h4 className="font-sans font-bold text-sm text-slate-900 hover:text-red-600 transition-colors leading-snug">
                <a href="#world">
                  'Rate Spikes Misread': Former FOMC governor tears apart interest rate playbook
                </a>
              </h4>
              <div className="relative mt-2 aspect-video rounded bg-slate-950 overflow-hidden group cursor-pointer">
                <video 
                  src="https://assets.mixkit.co/videos/preview/mixkit-business-charts-on-a-screen-40082-large.mp4" 
                  className="w-full h-full object-cover opacity-80"
                  muted
                  playsInline
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white shadow-lg border border-red-500">
                    <Play className="h-4 w-4 fill-current ml-0.5" />
                  </span>
                </div>
                <span className="absolute bottom-2 right-2 bg-slate-950/80 px-1.5 py-0.5 rounded font-mono text-[9px] text-white">
                  03:14
                </span>
              </div>
            </article>

            {/* Sidebar Article Card 2 */}
            <article className="border-b border-slate-200 pb-4">
              <h4 className="font-sans font-bold text-sm text-slate-900 hover:text-red-600 transition-colors leading-snug">
                <a href="#business">
                  Cyprus Yield Desk: Arbitrage desks report record inflows amid compression spikes
                </a>
              </h4>
              <p className="mt-1 text-xs text-slate-500">
                Sovereign and rates desk analysts outline details in confidential memorandum.
              </p>
            </article>

            {/* Sidebar Article Card 3 */}
            <article className="border-b border-slate-200 pb-4">
              <h4 className="font-sans font-bold text-sm text-slate-900 hover:text-red-600 transition-colors leading-snug">
                <a href="#technology">
                  Zero-Knowledge Rollups: Scaling security and speed on private credit books
                </a>
              </h4>
              <p className="mt-1 text-xs text-slate-500">
                Technology correspondence outlining implementation timeline across core ledgers.
              </p>
            </article>
          </aside>

          {/* CENTER COLUMN: Main Article & Lede (~55% width equivalent) */}
          <section className="lg:col-span-6 space-y-6 border-x border-slate-200 lg:px-6">
            <article id="article-body">
              <p className="font-sans text-[11px] font-extrabold uppercase tracking-widest text-red-600">
                Exclusive investigation
              </p>
              
              <h2 
                className="mt-2 font-sans text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight"
                style={{ letterSpacing: "-0.02em" }}
              >
                Quiet Money Returns: Inside the Institutional Retreat from Speculation
              </h2>

              <p className="mt-3 font-sans text-sm text-slate-500 leading-relaxed">
                After a decade defined by cheap capital and index momentum, the world's most patient allocators are once again buying research, discipline and time. An Investor's Chronicle investigation.
              </p>

              <ArticleMeta />

              <figure className="my-4">
                <img
                  src={heroImg}
                  alt="Traders at global asset-management floor"
                  className="w-full rounded object-cover"
                />
                <figcaption className="mt-2.5 font-sans text-[11px] text-slate-500 italic text-center">
                  A pre-open briefing at a global asset-management floor. Photograph: The Investor's Chronicle.
                </figcaption>
              </figure>

              <div className="font-sans text-[15px] text-slate-800 leading-relaxed space-y-4">
                <p>
                  In the paneled reading rooms of London's West End and along the twenty-third floor of a Midtown Manhattan tower, an old habit is quietly returning. For the first time since the era of zero rates began, some of the world's largest allocators of capital are talking, once again, about the price of things — about earnings, about balance sheets, about the cost of being wrong.
                </p>
                <p>
                  The retreat from speculation has not arrived in a single headline. It has arrived in the slow and unglamorous form of memoranda circulated among investment committees. The consensus is unmistakable: the age of momentum, of borrowing to buy the index, of confusing motion for progress, is over.
                </p>

                <PullQuote cite="Marcus Ashcroft, Chairman & Founding Partner">
                  A portfolio is not a list of names. It is a written argument, priced daily by a market that doesn't much care whether you were right yesterday.
                </PullQuote>

                <p>
                  The shift can be measured. Analysis conducted for the Chronicle by independent data providers shows a consistent pattern across the last eight quarters: flows into strategies with no explicit fundamental screen have fallen sharply, while allocations to research-led, cash-flow-aware managers have compounded quietly at double-digit rates.
                </p>

                <div className="grid grid-cols-2 gap-4 my-6">
                  <Stat n={2.4} suffix="T" label="Sidelined Cash" />
                  <Stat n={38} suffix="%" label="Research Spend Increase" />
                </div>

                {/* Premium HTML Video section */}
                <figure className="my-6 border border-slate-200 rounded-lg p-4 bg-white">
                  <h4 className="font-sans font-bold text-base text-slate-900 mb-2">
                    Featured Video Report: Capital Allocation Dynamics
                  </h4>
                  <div className="relative aspect-video bg-black rounded overflow-hidden">
                    <video
                      src="https://assets.mixkit.co/videos/preview/mixkit-business-charts-on-a-screen-40082-large.mp4"
                      className="w-full h-full object-cover cursor-pointer"
                      autoPlay={false}
                      muted={false}
                      controls
                      onClick={(e) => {
                        if (e.currentTarget.paused) {
                          e.currentTarget.play().catch(() => {});
                        } else {
                          e.currentTarget.pause();
                        }
                      }}
                    />
                  </div>
                  <p className="mt-2 font-sans text-[11px] text-slate-500 italic text-center">
                    Eleanor Marsh reports on the structural flows behind the headlines. Click to play.
                  </p>
                </figure>

                <p>
                  "There is no proprietary alchemy here," Alistair Warde, firm chief investment officer, told the Chronicle in an interview. "We write things down. We argue. We wait. And, on the rare occasions the market offers us a genuine mispricing, we buy — and we hold long enough for the thesis to actually happen."
                </p>
              </div>
            </article>

            {/* Ashcroft Warde Profile */}
            <section id="business" className="border-t border-slate-200 pt-6">
              <h3 className="font-sans font-black text-xl text-slate-900 mb-4">
                Ashcroft & Warde Capital: A portrait of a firm that refuses to hurry
              </h3>
              <p className="font-sans text-[14px] text-slate-600 leading-relaxed mb-4">
                Over the past quarter, Chronicle reporters were granted rare access to the people and processes that sit behind one of the industry's quietest track records.
              </p>
              <img
                src={institutionImg}
                alt="Ashcroft headquarters"
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

          {/* RIGHT COLUMN: Featured Videos & Lead Forms (~25% width equivalent) */}
          <aside className="lg:col-span-3 space-y-6">
            
            {/* Header: Featured Videos */}
            <div className="border-b-2 border-slate-900 pb-2 flex items-center justify-between">
              <h3 className="font-sans font-extrabold text-sm uppercase tracking-wider text-slate-900">
                Featured Videos
              </h3>
              <span className="text-xs text-slate-500 cursor-pointer hover:text-red-600">▶</span>
            </div>

            {/* Video widget item 1 (Red header tag) */}
            <article className="space-y-2">
              <div className="bg-red-600 text-white font-sans text-[11px] font-black uppercase px-2.5 py-1 text-center tracking-wider rounded-t">
                LIQUIDITY CRUNCH
              </div>
              <div className="border border-slate-200 border-t-0 p-3 rounded-b bg-white shadow-sm">
                <div className="relative aspect-video bg-slate-950 rounded overflow-hidden group cursor-pointer">
                  <video 
                    src="https://assets.mixkit.co/videos/preview/mixkit-financial-charts-and-graphs-on-a-monitor-40076-large.mp4" 
                    className="w-full h-full object-cover opacity-80"
                    muted
                    playsInline
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white shadow-lg border border-red-500">
                      <Play className="h-4 w-4 fill-current ml-0.5" />
                    </span>
                  </div>
                </div>
                <h5 className="font-sans font-bold text-xs text-slate-900 leading-snug mt-2 hover:text-red-600">
                  Sovereign desk managers pivot to physical gold reserves
                </h5>
              </div>
            </article>

            {/* Video widget item 2 (Neutral black header tag) */}
            <article className="space-y-2">
              <div className="bg-slate-950 text-white font-sans text-[11px] font-black uppercase px-2.5 py-1 text-center tracking-wider rounded-t">
                AI CAPEX WATCH
              </div>
              <div className="border border-slate-200 border-t-0 p-3 rounded-b bg-white shadow-sm">
                <div className="relative aspect-video bg-slate-950 rounded overflow-hidden group cursor-pointer">
                  <video 
                    src="https://assets.mixkit.co/videos/preview/mixkit-business-charts-on-a-screen-40082-large.mp4" 
                    className="w-full h-full object-cover opacity-80"
                    muted
                    playsInline
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-white shadow-lg border border-slate-800">
                      <Play className="h-4 w-4 fill-current ml-0.5" />
                    </span>
                  </div>
                </div>
                <h5 className="font-sans font-bold text-xs text-slate-900 leading-snug mt-2 hover:text-red-600">
                  Silicon Valley cloud spending signals structural reset warning
                </h5>
              </div>
            </article>

            {/* Consultation Signup Form Widget */}
            <section id="consult" className="pt-4 border-t border-slate-200">
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
      <footer className="mt-16 border-t border-slate-300 bg-slate-950 text-slate-400 py-12 font-sans text-xs">
        <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-display font-extrabold text-white text-base uppercase" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              The Investor's Chronicle
            </h4>
            <p className="mt-2 text-slate-500 leading-relaxed">
              Reporting capital since 1998. Regulated by the editorial standards of independent journalism.
            </p>
          </div>
          <div>
            <h5 className="font-bold text-white uppercase mb-3">Headquarters</h5>
            <p className="space-y-1 text-slate-500 leading-relaxed">
              <span>48 Cornhill, London EC3V 3PD</span><br />
              <span>United Kingdom</span>
            </p>
          </div>
          <div>
            <h5 className="font-bold text-white uppercase mb-3">Support</h5>
            <p className="space-y-1 text-slate-500">
              <span>desk@investorschronicle.example</span><br />
              <span>+44 (0) 20 7946 0100</span>
            </p>
          </div>
          <div>
            <h5 className="font-bold text-white uppercase mb-3">Institutional</h5>
            <a href="/enquiry" className="text-red-500 font-bold hover:underline">
              Meridian Prime Portal
            </a>
          </div>
        </div>
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 border-t border-slate-900 mt-8 pt-6 flex flex-col md:flex-row justify-between text-slate-600">
          <p>© {new Date().getFullYear()} The Investor's Chronicle. All rights reserved.</p>
          <p className="mt-2 md:mt-0 uppercase tracking-widest text-[9px] font-bold">SECURED GATEWAY ACTIVE</p>
        </div>
      </footer>
    </div>
  );
}

function PullQuote({ children, cite }: { children: string; cite: string }) {
  return (
    <blockquote className="my-6 border-l-4 border-red-600 pl-4 py-1.5 italic bg-slate-50 rounded-r">
      <p className="font-sans text-base font-bold text-slate-950">
        “{children}”
      </p>
      <cite className="mt-1.5 block font-sans text-[11px] uppercase font-bold tracking-wider text-slate-500 not-italic">
        — {cite}
      </cite>
    </blockquote>
  );
}
