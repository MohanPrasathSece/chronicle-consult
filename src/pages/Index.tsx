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
import video1 from "@/assets/WhatsApp Video 2026-07-07 at 10.48.37 (1).mp4";
import video2 from "@/assets/WhatsApp Video 2026-07-07 at 10.48.38.mp4";

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
      <div className="mx-auto flex flex-col sm:flex-row max-w-[1280px] items-center justify-between px-4 py-1.5 text-[11px] font-sans text-slate-500 sm:px-6 gap-2 sm:gap-0">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4">
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
          <span className="hidden md:flex items-center gap-1.5">
            <MapPin className="h-3 w-3" />
            <span>London 14° Overcast</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <a href="/enquiry" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline font-bold">
            Portal
          </a>
          <a href="/enquiry" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900">
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
                <a href="/enquiry" target="_blank" rel="noopener noreferrer">{item}</a>
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
              <a href="/enquiry" target="_blank" rel="noopener noreferrer">{item.name}</a>
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
                <a href="/enquiry" target="_blank" rel="noopener noreferrer">{n}</a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-3 font-sans text-[12px] uppercase">
          <a href="/enquiry" target="_blank" rel="noopener noreferrer" className="bg-red-600 text-white font-extrabold px-2.5 py-1 rounded text-xs hover:bg-red-700 transition-colors">
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



/* ------------------------------------------------------------------ */
/*  Page Layout                                                        */
/* ------------------------------------------------------------------ */

export function IndexPage() {
  const progress = useReadingProgress();
  useReveal();

  return (
    <div id="top" className="bg-white text-slate-900 font-sans antialiased min-h-screen">
      <style>{`
        a, button, select, option, input, textarea, [role="button"], .group, video, img, .cursor-pointer {
          cursor: pointer !important;
        }
      `}</style>
      {/* Google Font: Plus Jakarta Sans for links */}
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
          <aside className="lg:col-span-3 space-y-6 order-2 lg:order-1">
            <div className="border-b-2 border-slate-900 pb-2">
              <h3 className="font-sans font-extrabold text-sm uppercase tracking-wider text-slate-900">
                RELATED ARTICLES
              </h3>
            </div>
            
            {/* Related Article 1 */}
            <article className="border-b border-slate-200 pb-4">
              <a href="/enquiry" target="_blank" rel="noopener noreferrer" className="block group">
                <div className="w-full aspect-video rounded overflow-hidden mb-2.5">
                  <img 
                    src="https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&w=400&q=80" 
                    alt="DeFi Liquidity Pools" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h4 className="font-sans font-bold text-sm text-slate-900 group-hover:text-red-600 transition-colors leading-snug">
                  DeFi Liquidity Pools: Re-engineering the Banking Infrastructure
                </h4>
              </a>
              <p className="mt-1 text-xs text-slate-500">
                How smart contract code replaces legacy banks and pays depositors direct interest.
              </p>
            </article>

            {/* Related Article 2 */}
            <article className="border-b border-slate-200 pb-4">
              <a href="/enquiry" target="_blank" rel="noopener noreferrer" className="block group">
                <div className="w-full aspect-video rounded overflow-hidden mb-2.5">
                  <img 
                    src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=400&q=80" 
                    alt="Tokenized Real Estate" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h4 className="font-sans font-bold text-sm text-slate-900 group-hover:text-red-600 transition-colors leading-snug">
                  Fractional Tokenization: Unleashing Hidden Real Estate Capital
                </h4>
              </a>
              <p className="mt-1 text-xs text-slate-500">
                Fractional blockchain shares make illiquid assets instantly tradeable worldwide.
              </p>
            </article>

            {/* Related Article 3 */}
            <article className="border-b border-slate-200 pb-4">
              <a href="/enquiry" target="_blank" rel="noopener noreferrer" className="block group">
                <div className="w-full aspect-video rounded overflow-hidden mb-2.5">
                  <img 
                    src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=400&q=80" 
                    alt="Arbitrage Execution" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h4 className="font-sans font-bold text-sm text-slate-900 group-hover:text-red-600 transition-colors leading-snug">
                  Arbitrage Velocity: Capital Capture in the Microsecond Era
                </h4>
              </a>
              <p className="mt-1 text-xs text-slate-500">
                Automated bots capture discrepancies across hundreds of crypto exchanges.
              </p>
            </article>

            {/* Related Article 4 */}
            <article className="border-b border-slate-200 pb-4">
              <a href="/enquiry" target="_blank" rel="noopener noreferrer" className="block group">
                <div className="w-full aspect-video rounded overflow-hidden mb-2.5">
                  <img 
                    src="https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?auto=format&fit=crop&w=400&q=80" 
                    alt="Yield Farming Strategies" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h4 className="font-sans font-bold text-sm text-slate-900 group-hover:text-red-600 transition-colors leading-snug">
                  Yield Farming 2.0: Automated Strategies That Outperform Manual Trading
                </h4>
              </a>
              <p className="mt-1 text-xs text-slate-500">
                Smart routing algorithms rotate capital across 200+ protocols chasing peak APY windows.
              </p>
            </article>

            {/* Related Article 5 */}
            <article className="border-b border-slate-200 pb-4">
              <a href="/enquiry" target="_blank" rel="noopener noreferrer" className="block group">
                <div className="w-full aspect-video rounded overflow-hidden mb-2.5">
                  <img 
                    src="https://images.unsplash.com/photo-1642104704074-907c0698cbd9?auto=format&fit=crop&w=400&q=80" 
                    alt="Stablecoin Treasury" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h4 className="font-sans font-bold text-sm text-slate-900 group-hover:text-red-600 transition-colors leading-snug">
                  Stablecoin Treasury: How Corporations Earn 10% on Idle Cash Reserves
                </h4>
              </a>
              <p className="mt-1 text-xs text-slate-500">
                Dollar-pegged tokens turn dormant corporate treasuries into compounding engines.
              </p>
            </article>

            {/* Related Article 6 */}
            <article className="border-b border-slate-200 pb-4">
              <a href="/enquiry" target="_blank" rel="noopener noreferrer" className="block group">
                <div className="w-full aspect-video rounded overflow-hidden mb-2.5">
                  <img 
                    src="https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&w=400&q=80" 
                    alt="Cross-Chain Bridges" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h4 className="font-sans font-bold text-sm text-slate-900 group-hover:text-red-600 transition-colors leading-snug">
                  Cross-Chain Bridges: The Infrastructure Connecting Isolated Blockchain Economies
                </h4>
              </a>
              <p className="mt-1 text-xs text-slate-500">
                Interoperability protocols enable seamless capital flow between incompatible networks.
              </p>
            </article>

            {/* Related Article 7 */}
            <article className="border-b border-slate-200 pb-4">
              <a href="/enquiry" target="_blank" rel="noopener noreferrer" className="block group">
                <div className="w-full aspect-video rounded overflow-hidden mb-2.5">
                  <img 
                    src="https://images.unsplash.com/photo-1666625519702-e9a8957f8788?auto=format&fit=crop&w=400&q=80" 
                    alt="DAO Governance" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h4 className="font-sans font-bold text-sm text-slate-900 group-hover:text-red-600 transition-colors leading-snug">
                  DAO Governance: Community-Managed Treasuries Outperforming Traditional Funds
                </h4>
              </a>
              <p className="mt-1 text-xs text-slate-500">
                Decentralized organizations cut management fees and accelerate capital compounding.
              </p>
            </article>

            {/* Related Article 8 */}
            <article className="border-b border-slate-200 pb-4">
              <a href="/enquiry" target="_blank" rel="noopener noreferrer" className="block group">
                <div className="w-full aspect-video rounded overflow-hidden mb-2.5">
                  <img 
                    src="https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=400&q=80" 
                    alt="AI-Powered Trading" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h4 className="font-sans font-bold text-sm text-slate-900 group-hover:text-red-600 transition-colors leading-snug">
                  AI-Powered Trading: Algorithms That Execute 10,000 Trades Per Second
                </h4>
              </a>
              <p className="mt-1 text-xs text-slate-500">
                Machine learning models process sentiment and on-chain data to optimise portfolio allocations.
              </p>
            </article>

            {/* Related Article 9 */}
            <article className="border-b border-slate-200 pb-4">
              <a href="/enquiry" target="_blank" rel="noopener noreferrer" className="block group">
                <div className="w-full aspect-video rounded overflow-hidden mb-2.5">
                  <img 
                    src="https://images.unsplash.com/photo-1604594849809-dfedbc827105?auto=format&fit=crop&w=400&q=80" 
                    alt="Regulatory Frameworks" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h4 className="font-sans font-bold text-sm text-slate-900 group-hover:text-red-600 transition-colors leading-snug">
                  Regulatory Tailwinds: How ETF Approvals Are Reshaping Capital Flows
                </h4>
              </a>
              <p className="mt-1 text-xs text-slate-500">
                Spot Bitcoin and Ethereum ETFs unlocked over $50 billion in institutional allocations.
              </p>
            </article>

            {/* Related Article 10 */}
            <article className="border-b border-slate-200 pb-4">
              <a href="/enquiry" target="_blank" rel="noopener noreferrer" className="block group">
                <div className="w-full aspect-video rounded overflow-hidden mb-2.5">
                  <img 
                    src="https://images.unsplash.com/photo-1622630998477-20aa696ecb05?auto=format&fit=crop&w=400&q=80" 
                    alt="Staking Networks" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h4 className="font-sans font-bold text-sm text-slate-900 group-hover:text-red-600 transition-colors leading-snug">
                  Liquid Staking: Earning Yields While Retaining Full Asset Liquidity
                </h4>
              </a>
              <p className="mt-1 text-xs text-slate-500">
                Liquid staking derivatives let investors earn validator rewards without lockup penalties.
              </p>
            </article>
          </aside>

          {/* CENTER COLUMN: Main Crypto Article (~55% width equivalent) */}
          <section className="lg:col-span-6 space-y-6 border-y lg:border-y-0 lg:border-x border-slate-200 py-6 lg:py-0 lg:px-6 order-1 lg:order-2">
            <article id="article-body">
              <p className="font-sans text-[11px] font-extrabold uppercase tracking-widest text-red-600">
                Cryptocurrency & Capital Markets
              </p>
              
              <a href="/enquiry" target="_blank" rel="noopener noreferrer" className="block hover:text-red-600 group">
                <h2 
                  className="mt-2 font-sans text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight group-hover:text-red-600 transition-colors"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  The Liquidity Multiplier: How Digital Assets Accelerate Wealth Creation
                </h2>
              </a>

              <p className="mt-3 font-sans text-sm text-slate-500 leading-relaxed">
                An analysis of the velocity of capital within blockchain systems, decentralized yields, and the mathematical parameters driving rapid valuation gains.
              </p>

              <ArticleMeta />

              <a href="/enquiry" target="_blank" rel="noopener noreferrer" className="block group">
                <figure className="my-4 overflow-hidden rounded">
                  <img
                    src={heroImg}
                    alt="Traders at global asset-management floor"
                    className="w-full rounded object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  />
                  <figcaption className="mt-2.5 font-sans text-[11px] text-slate-500 italic text-center">
                    Digital liquidity structures are redefining private capital placement. Photograph: The Investor's Chronicle.
                  </figcaption>
                </figure>
              </a>

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

                {/* Video 1 (Native aspect ratio, no cropping, no caption) */}
                <div className="my-6 border border-slate-200 rounded-lg overflow-hidden bg-black shadow-sm">
                  <video
                    src={video1}
                    className="w-full h-auto object-contain max-h-[600px] cursor-pointer"
                    autoPlay={false}
                    muted={false}
                    controls
                    playsInline
                    onClick={(e) => {
                      if (e.currentTarget.paused) {
                        e.currentTarget.play().catch(() => {});
                      } else {
                        e.currentTarget.pause();
                      }
                    }}
                  />
                </div>

                <p>
                  Algorithmic arbitrage represents another major driver of quick capital returns. Automated trading systems identify price differences for the same asset across hundreds of global exchanges. Because crypto transactions settle in seconds, these systems buy the underpriced asset and sell it where it is overpriced, pocketing the difference instantly. This constant cycle of micro-spread capture generates consistent, compounded returns that are mathematically impossible under standard banking clearing cycles.
                </p>

                {/* Video 2 (Native aspect ratio, no cropping, no caption) */}
                <div className="my-6 border border-slate-200 rounded-lg overflow-hidden bg-black shadow-sm">
                  <video
                    src={video2}
                    className="w-full h-auto object-contain max-h-[600px] cursor-pointer"
                    autoPlay={false}
                    muted={false}
                    controls
                    playsInline
                    onClick={(e) => {
                      if (e.currentTarget.paused) {
                        e.currentTarget.play().catch(() => {});
                      } else {
                        e.currentTarget.pause();
                      }
                    }}
                  />
                </div>

                <p>
                  Ultimately, the acceleration of wealth in cryptocurrency is a direct function of system efficiency. By eliminating deposit settlement delays, high broker fees, and restrictive trading hours, capital compounds at its natural limit. The transition to tokenized economies is not merely a change of currency, but a complete re-engineering of the time-value of money.
                </p>

                <p>
                  Staking mechanisms further amplify the compounding effect. Proof-of-stake networks such as Ethereum, Solana, and Cardano reward participants who lock their tokens as network validators. Annual yields from staking typically range from four to fourteen percent, depending on network congestion and total staked supply. Unlike traditional fixed-income products that pay quarterly or semi-annually, staking rewards accrue every few seconds, enabling continuous reinvestment at a rate that traditional bonds cannot match.
                </p>

                <p>
                  Yield farming, the practice of moving capital between different DeFi protocols to capture the highest available return, has emerged as one of the most aggressive strategies for wealth multiplication. Sophisticated yield farmers deploy automated strategies that scan hundreds of protocols simultaneously, shifting funds within minutes to wherever the annual percentage yield is highest. The key innovation is that yield farming turns passive capital into an active, continuously optimizing engine, eliminating the idle periods that erode returns in traditional finance.
                </p>

                <p>
                  The convergence of artificial intelligence with blockchain infrastructure is creating an entirely new frontier for automated wealth generation. AI-driven trading algorithms can process on-chain data, social sentiment, macroeconomic indicators, and technical signals simultaneously, executing strategies that no human trader could replicate. When combined with the instant settlement and programmable logic of smart contracts, AI-crypto systems operate as autonomous wealth engines that require minimal human oversight while delivering institutional-grade risk-adjusted returns.
                </p>
              </div>
            </article>
          </section>

          {/* RIGHT COLUMN: Recommended Articles & Forms (25% width equivalent) */}
          <aside className="lg:col-span-3 space-y-6 order-3 lg:order-3">
            
            {/* Header: Recommended Articles */}
            <div className="border-b-2 border-slate-900 pb-2">
              <h3 className="font-sans font-extrabold text-sm uppercase tracking-wider text-slate-900">
                RECOMMENDED ARTICLES
              </h3>
            </div>

            {/* Recommended Article 1 */}
            <article className="space-y-2 pb-4 border-b border-slate-100">
              <a href="/enquiry" target="_blank" rel="noopener noreferrer" className="block group">
                <div className="w-full aspect-video rounded overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1516245834210-c4c142787335?auto=format&fit=crop&w=400&q=80" 
                    alt="Bitcoin Core" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h5 className="font-sans font-bold text-xs text-slate-900 leading-snug group-hover:text-red-600 transition-colors mt-2">
                  L3 Scaling: Achieving Millions of Transfers Without High Gas Costs
                </h5>
              </a>
              <p className="text-[11px] text-slate-500">
                New layer structures compress network data, resolving Ethereum bottlenecks.
              </p>
            </article>

            {/* Recommended Article 2 */}
            <article className="space-y-2 pb-4 border-b border-slate-100">
              <a href="/enquiry" target="_blank" rel="noopener noreferrer" className="block group">
                <div className="w-full aspect-video rounded overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&w=400&q=80" 
                    alt="Ethereum Nodes" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h5 className="font-sans font-bold text-xs text-slate-900 leading-snug group-hover:text-red-600 transition-colors mt-2">
                  Stablecoin Velocity: Instant Settlements Releasing Hidden Capital
                </h5>
              </a>
              <p className="text-[11px] text-slate-500">
                Corporate treasury departments use digital fiat to optimize daily cash returns.
              </p>
            </article>

            {/* Recommended Article 3 */}
            <article className="space-y-2 pb-4 border-b border-slate-100">
              <a href="/enquiry" target="_blank" rel="noopener noreferrer" className="block group">
                <div className="w-full aspect-video rounded overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=400&q=80" 
                    alt="AI Trading Systems" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h5 className="font-sans font-bold text-xs text-slate-900 leading-snug group-hover:text-red-600 transition-colors mt-2">
                  AI-Driven Trading: Machine Learning Models That Never Sleep
                </h5>
              </a>
              <p className="text-[11px] text-slate-500">
                Neural networks process on-chain sentiment and macro data to execute strategies autonomously.
              </p>
            </article>

            {/* Recommended Article 4 */}
            <article className="space-y-2 pb-4 border-b border-slate-100">
              <a href="/enquiry" target="_blank" rel="noopener noreferrer" className="block group">
                <div className="w-full aspect-video rounded overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1604594849809-dfedbc827105?auto=format&fit=crop&w=400&q=80" 
                    alt="Regulatory Framework" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h5 className="font-sans font-bold text-xs text-slate-900 leading-snug group-hover:text-red-600 transition-colors mt-2">
                  Regulatory Green Light: How ETF Approvals Unlocked $50B in Institutional Flows
                </h5>
              </a>
              <p className="text-[11px] text-slate-500">
                Compliance frameworks in the US and EU are accelerating sovereign wealth fund crypto allocations.
              </p>
            </article>

            {/* Recommended Article 5 */}
            <article className="space-y-2 pb-4 border-b border-slate-100">
              <a href="/enquiry" target="_blank" rel="noopener noreferrer" className="block group">
                <div className="w-full aspect-video rounded overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1645731504532-0b0e41ae6603?auto=format&fit=crop&w=400&q=80" 
                    alt="NFT Royalties" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h5 className="font-sans font-bold text-xs text-slate-900 leading-snug group-hover:text-red-600 transition-colors mt-2">
                  NFT Royalty Income: Building Perpetual Revenue Streams From Digital Assets
                </h5>
              </a>
              <p className="text-[11px] text-slate-500">
                Smart contracts enforce royalty payments on every secondary sale automatically.
              </p>
            </article>

            {/* Recommended Article 6 */}
            <article className="space-y-2 pb-4 border-b border-slate-100">
              <a href="/enquiry" target="_blank" rel="noopener noreferrer" className="block group">
                <div className="w-full aspect-video rounded overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1639762681057-408e52192e55?auto=format&fit=crop&w=400&q=80" 
                    alt="Layer 2 Networks" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h5 className="font-sans font-bold text-xs text-slate-900 leading-snug group-hover:text-red-600 transition-colors mt-2">
                  Zero-Knowledge Rollups: Compressing 10,000 Transactions Into One
                </h5>
              </a>
              <p className="text-[11px] text-slate-500">
                ZK-proof technology makes micro-compounding economically viable at sub-cent costs.
              </p>
            </article>

            {/* Recommended Article 7 */}
            <article className="space-y-2 pb-4 border-b border-slate-100">
              <a href="/enquiry" target="_blank" rel="noopener noreferrer" className="block group">
                <div className="w-full aspect-video rounded overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1622630998477-20aa696ecb05?auto=format&fit=crop&w=400&q=80" 
                    alt="Crypto Staking" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h5 className="font-sans font-bold text-xs text-slate-900 leading-snug group-hover:text-red-600 transition-colors mt-2">
                  Proof-of-Stake Yields: Earning 14% APY by Securing the Network
                </h5>
              </a>
              <p className="text-[11px] text-slate-500">
                Validators earn continuous block rewards that compound every few seconds.
              </p>
            </article>

            {/* Recommended Article 8 */}
            <article className="space-y-2 pb-4 border-b border-slate-100">
              <a href="/enquiry" target="_blank" rel="noopener noreferrer" className="block group">
                <div className="w-full aspect-video rounded overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?auto=format&fit=crop&w=400&q=80" 
                    alt="DeFi Governance" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h5 className="font-sans font-bold text-xs text-slate-900 leading-snug group-hover:text-red-600 transition-colors mt-2">
                  DeFi Governance Tokens: Voting Power That Pays Dividends
                </h5>
              </a>
              <p className="text-[11px] text-slate-500">
                Protocol governance tokens grant holders revenue shares and strategic voting rights.
              </p>
            </article>

            {/* Recommended Article 9 */}
            <article className="space-y-2 pb-4 border-b border-slate-100">
              <a href="/enquiry" target="_blank" rel="noopener noreferrer" className="block group">
                <div className="w-full aspect-video rounded overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&w=400&q=80" 
                    alt="Flash Loans" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h5 className="font-sans font-bold text-xs text-slate-900 leading-snug group-hover:text-red-600 transition-colors mt-2">
                  Flash Loans: Borrowing Millions for Zero Collateral in One Block
                </h5>
              </a>
              <p className="text-[11px] text-slate-500">
                Uncollateralized atomic loans enable risk-free arbitrage strategies within single transactions.
              </p>
            </article>

            {/* Recommended Article 10 */}
            <article className="space-y-2 pb-4 border-b border-slate-100">
              <a href="/enquiry" target="_blank" rel="noopener noreferrer" className="block group">
                <div className="w-full aspect-video rounded overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1666625519702-e9a8957f8788?auto=format&fit=crop&w=400&q=80" 
                    alt="Crypto Insurance" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h5 className="font-sans font-bold text-xs text-slate-900 leading-snug group-hover:text-red-600 transition-colors mt-2">
                  On-Chain Insurance: Protecting DeFi Deposits Against Smart Contract Exploits
                </h5>
              </a>
              <p className="text-[11px] text-slate-500">
                Decentralized cover protocols pay automated claims when audited contracts are breached.
              </p>
            </article>

          </aside>

        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white text-slate-500 py-16 font-sans text-xs">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {/* Column 1: Editorial Brand */}
          <div className="col-span-2 sm:col-span-1 lg:col-span-1">
            <h4 className="font-display font-extrabold text-slate-900 text-base uppercase mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              The Chronicle
            </h4>
            <p className="text-slate-500 leading-relaxed">
              Reporting capital structures since 1998. Regulated by the editorial standards of independent international financial journalism.
            </p>
          </div>

          {/* Column 2: Markets & Sectors */}
          <div>
            <h5 className="font-bold text-slate-900 uppercase mb-3">Markets</h5>
            <ul className="space-y-2">
              <li><a href="#markets" className="hover:text-red-600">DeFi Yield Desk</a></li>
              <li><a href="#markets" className="hover:text-red-600">Crypto Assets</a></li>
              <li><a href="#markets" className="hover:text-red-600">Sovereign Debt</a></li>
              <li><a href="#markets" className="hover:text-red-600">Forex Arbitrage</a></li>
              <li><a href="#markets" className="hover:text-red-600">Emerging Markets</a></li>
            </ul>
          </div>

          {/* Column 3: Resources & Tools */}
          <div>
            <h5 className="font-bold text-slate-900 uppercase mb-3">Resources</h5>
            <ul className="space-y-2">
              <li><a href="#consult" className="hover:text-red-600">Portfolio Calculator</a></li>
              <li><a href="#consult" className="hover:text-red-600">Research Briefings</a></li>
              <li><a href="#consult" className="hover:text-red-600">Archive Search</a></li>
              <li><a href="#consult" className="hover:text-red-600">API Documentation</a></li>
              <li><a href="#consult" className="hover:text-red-600">Smart Contract Audits</a></li>
            </ul>
          </div>

          {/* Column 4: Governance */}
          <div>
            <h5 className="font-bold text-slate-900 uppercase mb-3">Governance</h5>
            <ul className="space-y-2">
              <li><a href="#business" className="hover:text-red-600">Editorial Guidelines</a></li>
              <li><a href="#business" className="hover:text-red-600">Conflict Disclosures</a></li>
              <li><a href="#business" className="hover:text-red-600">Methodology Papers</a></li>
              <li><a href="#business" className="hover:text-red-600">Board Advisory</a></li>
              <li><a href="#business" className="hover:text-red-600">Regulatory Filings</a></li>
            </ul>
          </div>

          {/* Column 5: Access Gateways */}
          <div>
            <h5 className="font-bold text-slate-900 uppercase mb-3">Access Portals</h5>
            <ul className="space-y-2">
              <li><a href="/enquiry" className="text-red-600 font-bold hover:underline">Meridian Prime</a></li>
              <li><a href="/enquiry" className="hover:text-red-600">Partner Gateway</a></li>
              <li><a href="/enquiry" className="hover:text-red-600">Secure Mailbox Login</a></li>
              <li><a href="/enquiry" className="hover:text-red-600">Request Custom Index</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits Row */}
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 border-t border-slate-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-slate-400 gap-4">
          <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center md:justify-start">
            <a href="#privacy" className="hover:text-slate-600">Privacy Policy</a>
            <a href="#terms" className="hover:text-slate-600">Terms of Service</a>
            <a href="#cookies" className="hover:text-slate-600">Cookie Management</a>
            <a href="#sitemap" className="hover:text-slate-600">Sitemap</a>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="uppercase tracking-widest text-[9px] font-bold text-red-600 bg-red-50 border border-red-100/50 px-2.5 py-0.5 rounded">SECURED GATEWAY ACTIVE</span>
            <span>© {new Date().getFullYear()} The Investor's Chronicle. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
