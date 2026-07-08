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
  "Markets",
  "Business",
  "Economy",
  "Opinion",
  "World",
  "Technology",
  "Editorial",
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

const inTheNews = [
  "AI Masterclass",
  "Money Masterclass",
  "Ask Apollo",
  "Parentology",
  "BTC Backtest",
  "Cyprus Sourcing",
  "MPC Custody",
  "Solana ETF Decision",
  "Institutional Inflows",
  "Securitized Yields",
  "Tokenized Treasury",
  "Arbitrage Desks",
  "Tokenized Bonds",
  "Yield Compression",
  "SEC Updates",
  "Macro Indicators",
  "Treasury Yields",
  "DeFi Governance",
  "Gas Token Spikes",
  "DEX Volumes",
  "Venture Deployments",
  "AI Cloud Spending",
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
  const today = useMemo(
    () =>
      new Date().toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    [],
  );
  return (
    <div className="hairline-b bg-paper-tint">
      <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-4 px-4 py-2 text-[11px] uppercase tracking-widest text-ink-soft sm:px-6">
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline">{today}</span>
          <span className="hidden items-center gap-1.5 md:inline-flex">
            <Cloud className="h-3.5 w-3.5" aria-hidden />
            London 14° · Overcast
          </span>
        </div>
        <div className="flex items-center gap-4">
          <label className="hidden items-center gap-2 md:inline-flex">
            <span className="sr-only">Edition</span>
            <select
              aria-label="Select edition"
              className="border-none bg-transparent text-[11px] uppercase tracking-widest text-ink outline-none focus:text-link"
              defaultValue="global"
            >
              <option value="global">Global Edition</option>
              <option value="uk">UK Edition</option>
              <option value="us">US Edition</option>
              <option value="asia">Asia Edition</option>
              <option value="india">India Edition</option>
            </select>
          </label>
          <a href="#newsletter" className="hidden hover:text-link md:inline">
            Newsletter
          </a>
          <a href="#epaper" className="hidden hover:text-link md:inline">
            E-paper
          </a>
          <button
            aria-label="Search"
            className="inline-flex items-center gap-1 hover:text-link"
          >
            <Search className="h-3.5 w-3.5" aria-hidden />
            <span className="hidden sm:inline">Search</span>
          </button>
          <a href="/enquiry" className="hover:text-link font-sans font-semibold text-link">
            Institutional Lead Portal
          </a>
          <a href="#signin" className="hover:text-link">
            Sign In
          </a>
          <a
            href="#subscribe"
            className="border border-ink px-2.5 py-1 text-ink hover:bg-ink hover:text-paper"
          >
            Subscribe
          </a>
        </div>
      </div>
    </div>
  );
}

function Masthead() {
  return (
    <div className="mx-auto max-w-[1360px] px-4 pt-6 pb-2 text-center sm:px-6 sm:pt-8">
      <p className="eyebrow">Est. MCMXCVIII · Vol. XXVII · No. 214</p>
      <h1 className="mt-3 font-display text-[13vw] leading-[0.95] tracking-tight text-ink sm:text-[64px] md:text-[84px] lg:text-[104px]">
        The Investor's Chronicle
      </h1>
      <p className="mt-3 font-serif text-sm italic text-ink-soft">
        Reporting the business of capital, with clarity and without compromise.
      </p>
    </div>
  );
}

function Nav({ compact = false }: { compact?: boolean }) {
  return (
    <nav
      aria-label="Primary"
      className={`mx-auto max-w-[1360px] px-4 sm:px-6 ${compact ? "" : "hairline hairline-b py-2"}`}
    >
      <ul className="flex items-center justify-center gap-6 overflow-x-auto whitespace-nowrap font-sans text-[13px] font-medium uppercase tracking-[0.14em] text-ink">
        {NAV.map((item) => (
          <li key={item}>
            <a
              href={`#${item.toLowerCase()}`}
              className="relative py-1 text-ink transition-colors hover:text-link"
            >
              {item}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function StickyBar({ progress }: { progress: number }) {
  return (
    <div className="fixed inset-x-0 top-0 z-50 border-b border-rule bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
        <div className="flex items-center gap-3">
          <button aria-label="Open menu" className="text-ink hover:text-link">
            <Menu className="h-5 w-5" />
          </button>
          <a
            href="#top"
            className="font-display text-lg leading-none tracking-tight text-ink"
          >
            The Investor's Chronicle
          </a>
        </div>
        <nav aria-label="Sticky" className="hidden lg:block">
          <ul className="flex items-center gap-5 font-sans text-[12px] uppercase tracking-widest text-ink-soft">
            {NAV.slice(0, 6).map((n) => (
              <li key={n}>
                <a href={`#${n.toLowerCase()}`} className="hover:text-link">
                  {n}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-3 font-sans text-[12px] uppercase tracking-widest">
          <a href="/enquiry" className="text-link hover:text-ink font-semibold">
            Portal
          </a>
          <a href="#signin" className="hidden text-ink-soft hover:text-link sm:inline">
            Sign In
          </a>
          <a
            href="#consult"
            className="border border-ink px-2.5 py-1 text-ink hover:bg-ink hover:text-paper"
          >
            Subscribe
          </a>
        </div>
      </div>
      <div
        className="h-[2px] origin-left bg-ink transition-transform duration-150 ease-out"
        style={{ transform: `scaleX(${progress})` }}
        aria-hidden
      />
    </div>
  );
}

function Ticker() {
  const items = [...TICKER, ...TICKER, ...TICKER];
  return (
    <div className="hairline-b overflow-hidden bg-paper">
      <div className="mx-auto flex max-w-[1360px] items-stretch">
        <span className="flex items-center border-r border-rule bg-ink px-3 font-sans text-[10px] font-semibold uppercase tracking-widest text-paper z-10">
          Live Markets
        </span>
        <div className="relative flex-1 overflow-hidden">
          <div className="ticker-track flex w-max gap-8 py-2 pl-6 font-mono text-[12px]">
            {items.map((t, i) => (
              <span key={i} className="flex items-center gap-2 whitespace-nowrap">
                <span className="font-semibold text-ink">{t.s}</span>
                <span className="text-ink-soft">{t.v}</span>
                <span
                  className={
                    t.d.startsWith("-") ? "text-breaking" : "text-link"
                  }
                >
                  {t.d}
                </span>
                <span className="text-rule">·</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function InTheNewsTicker() {
  // Duplicate to prevent trailing white space on wide displays
  const items = [...inTheNews, ...inTheNews, ...inTheNews];
  return (
    <div className="hairline-b overflow-hidden bg-paper-tint">
      <div className="mx-auto flex max-w-[1360px] items-stretch">
        <span className="flex items-center border-r border-rule bg-link px-3 font-sans text-[10px] font-semibold uppercase tracking-widest text-paper z-10 whitespace-nowrap">
          In The News
        </span>
        <div className="relative flex-1 overflow-hidden">
          <div className="ticker-track flex w-max gap-8 py-2 pl-6 font-sans text-[11px] uppercase tracking-wider text-ink-soft">
            {items.map((topic, i) => (
              <span key={i} className="flex items-center gap-2 whitespace-nowrap hover:text-link cursor-pointer">
                <span>{topic}</span>
                <span className="text-rule">·</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TrendingTags() {
  // Duplicate tags to ensure full ticker-track marquee scrolling
  const items = [...trendingTags, ...trendingTags];
  return (
    <div className="hairline-b overflow-hidden bg-paper">
      <div className="mx-auto flex max-w-[1360px] items-stretch">
        <span className="flex items-center border-r border-rule bg-breaking px-3 font-sans text-[10px] font-semibold uppercase tracking-widest text-paper z-10 whitespace-nowrap">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-paper mr-1.5" />
          Breaking
        </span>
        <div className="relative flex-1 overflow-hidden">
          <div className="ticker-track flex w-max gap-8 py-2 pl-6 font-sans text-[12px] tracking-wide text-ink-soft">
            {items.map((t, i) => (
              <a
                key={i}
                href={`#${t}`}
                className="hover:text-link whitespace-nowrap"
              >
                {t}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero + Article                                                     */
/* ------------------------------------------------------------------ */

function ArticleMeta() {
  const [saved, setSaved] = useState(false);
  const [fontLevel, setFontLevel] = useState(0);
  useEffect(() => {
    const root = document.getElementById("article-body");
    if (!root) return;
    const sizes = [1, 1.08, 1.16];
    root.style.fontSize = `${sizes[fontLevel]}rem`;
  }, [fontLevel]);

  return (
    <div className="mx-auto grid max-w-[820px] gap-6 border-y border-rule px-4 py-4 sm:px-0 sm:grid-cols-[1fr_auto] sm:items-center">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-sans text-[12px] uppercase tracking-widest text-ink-soft">
        <span>By <span className="text-ink">Eleanor Marsh</span></span>
        <span aria-hidden>·</span>
        <span>London · New York</span>
        <span aria-hidden>·</span>
        <span>Published 06:14 GMT</span>
        <span aria-hidden>·</span>
        <span>Updated 09:42 GMT</span>
        <span aria-hidden>·</span>
        <span>12 min read</span>
      </div>
      <div className="flex flex-wrap items-center gap-2 font-sans text-[12px] uppercase tracking-widest">
        <button
          onClick={() => setSaved((s) => !s)}
          className={`inline-flex items-center gap-1.5 border border-rule px-2.5 py-1.5 transition-colors hover:border-ink ${
            saved ? "bg-ink text-paper" : "text-ink"
          }`}
          aria-pressed={saved}
        >
          <Bookmark className="h-3.5 w-3.5" aria-hidden />
          {saved ? "Saved" : "Save"}
        </button>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 border border-rule px-2.5 py-1.5 text-ink hover:border-ink"
          aria-label="Print article"
        >
          <Printer className="h-3.5 w-3.5" aria-hidden /> Print
        </button>
        <button className="inline-flex items-center gap-1.5 border border-rule px-2.5 py-1.5 text-ink hover:border-ink">
          <Headphones className="h-3.5 w-3.5" aria-hidden /> Listen
        </button>
        <button
          onClick={() => setFontLevel((f) => (f + 1) % 3)}
          className="inline-flex items-center gap-1.5 border border-rule px-2.5 py-1.5 text-ink hover:border-ink"
          aria-label="Adjust font size"
        >
          <Type className="h-3.5 w-3.5" aria-hidden /> A
        </button>
        <button
          onClick={() =>
            navigator.share?.({ title: document.title, url: location.href }).catch(() => {})
          }
          className="inline-flex items-center gap-1.5 border border-rule px-2.5 py-1.5 text-ink hover:border-ink"
        >
          <Share2 className="h-3.5 w-3.5" aria-hidden /> Share
        </button>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section id="markets" className="mx-auto max-w-[1360px] px-4 sm:px-6">
      <div className="mx-auto max-w-[900px] pt-10 sm:pt-14">
        <p className="eyebrow text-center text-breaking">
          Exclusive · Investigation · Global Markets
        </p>
        <h2 className="mx-auto mt-4 text-center font-display text-[38px] leading-[1.05] tracking-tight text-ink sm:text-[52px] md:text-[64px] lg:text-[76px]">
          Quiet Money Returns: Inside the Institutional Retreat from Speculation
        </h2>
        <p className="mx-auto mt-6 max-w-[720px] text-center font-serif text-lg leading-relaxed text-ink-soft sm:text-xl">
          After a decade defined by cheap capital and index momentum, the world's most
          patient investors are once again buying research, discipline and time. An
          Investor's Chronicle investigation.
        </p>
      </div>

      <ArticleMeta />

      <figure className="mt-8" data-reveal>
        <img
          src={heroImg}
          alt="Traders and analysts at dawn on a global trading floor, reviewing curved market screens"
          width={1920}
          height={1088}
          className="w-full rounded-sm object-cover"
        />
        <figcaption className="mx-auto mt-3 max-w-[820px] font-sans text-[12px] italic text-ink-soft">
          A pre-open briefing at a global asset-management floor, March 12. Institutional
          allocators are rebuilding portfolios around cash-flow discipline.
          <span className="ml-2 not-italic uppercase tracking-widest">
            Photograph · The Investor's Chronicle
          </span>
        </figcaption>
      </figure>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Article Body                                                       */
/* ------------------------------------------------------------------ */

const TOC = [
  { id: "sec-lede", label: "The Return of Patience" },
  { id: "sec-numbers", label: "By the Numbers" },
  { id: "sec-desk", label: "Inside the Desk" },
  { id: "sec-method", label: "Research Methodology" },
  { id: "sec-risk", label: "Managing Risk" },
  { id: "sec-record", label: "Performance Record" },
  { id: "sec-outlook", label: "The Outlook" },
];

function ShareRail() {
  return (
    <aside
      aria-label="Share this article"
      className="sticky top-28 hidden shrink-0 flex-col items-center gap-3 pt-2 lg:flex"
    >
      <span className="mb-1 h-8 w-px bg-rule" aria-hidden />
      {[
        { Icon: Twitter, label: "Share on X" },
        { Icon: Facebook, label: "Share on Facebook" },
        { Icon: Linkedin, label: "Share on LinkedIn" },
        { Icon: Mail, label: "Share by email" },
      ].map(({ Icon, label }) => (
        <button
          key={label}
          aria-label={label}
          className="flex h-9 w-9 items-center justify-center border border-rule text-ink-soft transition-colors hover:border-ink hover:text-ink"
        >
          <Icon className="h-3.5 w-3.5" aria-hidden />
        </button>
      ))}
    </aside>
  );
}

function Toc() {
  return (
    <aside className="sticky top-28 hidden xl:block" aria-label="In this article">
      <p className="eyebrow">In this article</p>
      <ol className="mt-3 space-y-2 font-serif text-[15px]">
        {TOC.map((t, i) => (
          <li key={t.id} className="leading-snug">
            <a
              href={`#${t.id}`}
              className="group flex items-baseline gap-2 text-ink-soft hover:text-ink"
            >
              <span className="font-mono text-[11px] text-rule group-hover:text-ink">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{t.label}</span>
            </a>
          </li>
        ))}
      </ol>
      <div className="hairline mt-6 pt-4">
        <p className="eyebrow">Reporter</p>
        <div className="mt-3 flex items-center gap-3">
          <img
            src={reporterImg}
            alt="Eleanor Marsh"
            width={40}
            height={40}
            loading="lazy"
            className="h-10 w-10 rounded-full object-cover grayscale"
          />
          <div className="text-[13px] leading-tight">
            <p className="font-semibold text-ink">Eleanor Marsh</p>
            <p className="text-ink-soft">Senior Markets Correspondent</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function PullQuote({ children, cite }: { children: string; cite: string }) {
  return (
    <blockquote className="my-10 border-y border-ink py-8" data-reveal>
      <Quote className="mb-4 h-5 w-5 text-ink" aria-hidden />
      <p className="font-display text-[26px] leading-[1.25] tracking-tight text-ink sm:text-[32px]">
        “{children}”
      </p>
      <cite className="mt-4 block font-sans text-[12px] uppercase not-italic tracking-widest text-ink-soft">
        — {cite}
      </cite>
    </blockquote>
  );
}

function Stat({ n, suffix = "", label, sub }: { n: number; suffix?: string; label: string; sub?: string }) {
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
    <div ref={ref} className="border-t-2 border-ink pt-4">
      <div className="font-display text-4xl font-bold text-ink sm:text-5xl">
        {display}
        {suffix}
      </div>
      <p className="mt-2 font-sans text-[11px] uppercase tracking-widest text-ink-soft">
        {label}
      </p>
      {sub && <p className="mt-1 font-serif text-sm text-ink-soft">{sub}</p>}
    </div>
  );
}

function BarChart() {
  const rows = [
    { y: "2019", value: 42 },
    { y: "2020", value: 58 },
    { y: "2021", value: 71 },
    { y: "2022", value: 46 },
    { y: "2023", value: 34 },
    { y: "2024", value: 28 },
    { y: "2025", value: 22 },
  ];
  const max = 71;
  return (
    <figure className="my-10 border border-rule bg-paper p-6" data-reveal>
      <figcaption className="mb-6">
        <p className="eyebrow">Figure 1</p>
        <h4 className="mt-1 font-display text-2xl leading-tight">
          Share of global fund flows into momentum-only strategies
        </h4>
        <p className="mt-1 font-serif text-sm text-ink-soft">
          Percentage of net inflows into strategies with no fundamental screen.
          Source: Investor's Chronicle analysis.
        </p>
      </figcaption>
      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.y} className="grid grid-cols-[48px_1fr_56px] items-center gap-3">
            <span className="font-mono text-[12px] text-ink-soft">{r.y}</span>
            <div className="relative h-6 bg-paper-tint">
              <div
                className="h-full bg-ink"
                style={{ width: `${(r.value / max) * 100}%` }}
              />
            </div>
            <span className="text-right font-mono text-[12px] text-ink">
              {r.value}%
            </span>
          </div>
        ))}
      </div>
    </figure>
  );
}

function FactBox() {
  return (
    <aside
      className="my-10 border-l-2 border-ink bg-paper-tint p-6"
      data-reveal
      aria-label="Editorial fact box"
    >
      <p className="eyebrow">Fact box · What has changed</p>
      <ul className="mt-3 space-y-2 font-serif text-[15px] leading-relaxed">
        <li className="flex gap-3">
          <span className="mt-2 h-1 w-3 shrink-0 bg-ink" />
          Global cash allocations have risen to their highest level since 2009.
        </li>
        <li className="flex gap-3">
          <span className="mt-2 h-1 w-3 shrink-0 bg-ink" />
          Discretionary managers now hold nearly 22% of AUM in short-duration paper.
        </li>
        <li className="flex gap-3">
          <span className="mt-2 h-1 w-3 shrink-0 bg-ink" />
          For the first time in a decade, private research budgets outpace marketing.
        </li>
      </ul>
    </aside>
  );
}

function EditorsNote() {
  return (
    <div className="my-10 flex items-start gap-4 border border-rule p-6" data-reveal>
      <span className="mt-1 font-sans text-[10px] font-semibold uppercase tracking-widest text-breaking">
        Editor's Note
      </span>
      <p className="font-serif text-[15px] leading-relaxed text-ink-soft">
        This report is part of a continuing Investor's Chronicle series. Data cited has been independently
        verified by our research desk.
      </p>
    </div>
  );
}

function Body() {
  return (
    <article
      id="article-body"
      className="prose-none font-serif text-ink transition-[font-size] duration-200"
      style={{ fontSize: "1rem" }}
    >
      <section id="sec-lede">
        <p className="drop-cap text-[17px] leading-[1.8]">
          In the paneled reading rooms of London's West End and along the twenty-third
          floor of a Midtown Manhattan tower, an old habit is quietly returning. For the
          first time since the era of zero rates began, some of the world's largest
          allocators of capital are talking, once again, about the price of things —
          about earnings, about balance sheets, about the cost of being wrong.
        </p>
        <p className="mt-6 text-[17px] leading-[1.8]">
          The retreat from speculation has not arrived in a single headline. It has
          arrived, according to more than two dozen fund managers, sovereign-fund
          officials and family-office principals interviewed for this article, in the
          slow and unglamorous form of memoranda circulated among investment
          committees. The consensus is unmistakable: <em>the age of momentum, of
          borrowing to buy the index, of confusing motion for progress, is over</em>.
        </p>
      </section>

      <PullQuote cite="A London-based pension chief investment officer">
        We are no longer paid to keep up with the crowd. We are paid to be right, and to
        explain, in one page, why.
      </PullQuote>

      <section id="sec-numbers">
        <h3 className="mt-10 font-display text-[28px] leading-tight sm:text-[32px]">
          By the numbers: a return to discipline
        </h3>
        <p className="mt-4 text-[17px] leading-[1.8]">
          The shift can be measured. Flows into strategies with no explicit fundamental screen have
          fallen sharply, while allocations to research-led, cash-flow-aware managers
          have compounded quietly at double-digit rates.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
          <Stat n={2.4} suffix="T" label="Cash sidelined" sub="Institutional, USD" />
          <Stat n={38} suffix="%" label="Rise in research spend" sub="2019–2025" />
          <Stat n={11.6} suffix="%" label="Avg. return, research-led" sub="5-yr, net" />
          <Stat n={4200} label="Committee meetings" sub="Reviewed for this report" />
        </div>

        <BarChart />

        {/* Premium HTML Video section */}
        <figure className="my-10 border border-rule bg-paper p-4" data-reveal>
          <figcaption className="mb-4">
            <p className="eyebrow">Featured Video Report</p>
            <h4 className="mt-1 font-display text-2xl leading-tight">
              The Return of Patience: Capital Allocation Flow Dynamics
            </h4>
          </figcaption>
          <video
            src="https://assets.mixkit.co/videos/preview/mixkit-business-charts-on-a-screen-40082-large.mp4"
            className="w-full aspect-video rounded-sm object-cover bg-black cursor-pointer"
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
          <p className="mt-3 font-sans text-[12px] italic text-ink-soft text-center">
            Eleanor Marsh details the macro elements shifting institutional risk parameters. Click inside video to play/pause.
          </p>
        </figure>

        <FactBox />
      </section>

      <section id="sec-desk">
        <h3 className="font-display text-[28px] leading-tight sm:text-[32px]">
          Inside the desk: what patient capital looks like now
        </h3>
        <p className="mt-4 text-[17px] leading-[1.8]">
          The Chronicle spent three weeks embedded with the research desk of{" "}
          <strong>Ashcroft &amp; Warde Capital</strong>, a mid-sized institutional
          firm that has, in relative silence, become one of the most
          consistently cited allocators in the trade.
        </p>
        <p className="mt-4 text-[17px] leading-[1.8]">
          "There is no proprietary alchemy here," Alistair Warde, the firm's chief
          investment officer, told the Chronicle in an interview. "We write things down. We argue. We wait."
        </p>

        <EditorsNote />
      </section>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 3 — Investigation continues                                */
/* ------------------------------------------------------------------ */

const TIMELINE = [
  { y: "1998", t: "Founded in London by former fixed-income desk heads." },
  { y: "2004", t: "Opens institutional research office in Mumbai." },
  { y: "2008", t: "Preserves 96% of client capital through the financial crisis." },
  { y: "2013", t: "First sovereign mandate; assets cross USD 4 bn." },
  { y: "2019", t: "Publishes ‘Six Signals’ framework for macro screening." },
  { y: "2022", t: "Adds private-credit and infrastructure research desks." },
  { y: "2025", t: "Named among 20 most-cited allocators globally." },
];

const METHODOLOGY = [
  {
    n: "01",
    h: "Origination",
    b: "Ideas begin at the desk, not the deck. Every position starts as a two-page written thesis, reviewed weekly.",
  },
  {
    n: "02",
    h: "Independent Research",
    b: "Every hypothesis is stress-tested by a second analyst who has never met the originator, in writing.",
  },
  {
    n: "03",
    h: "Committee",
    b: "Positions above 2% of book require a unanimous vote of the six-person investment committee.",
  },
  {
    n: "04",
    h: "Sizing",
    b: "Size is a function of the price of being wrong. No conviction, no size — no exceptions.",
  },
  {
    n: "05",
    h: "Monitoring",
    b: "Each thesis is re-underwritten every 90 days against the original written case.",
  },
  {
    n: "06",
    h: "Exit",
    b: "Positions exit not on price, but on thesis. Discipline is the only edge that compounds.",
  },
];

const ALLOCATION = [
  { k: "Global Equities", v: 42, note: "Cash-flow-screened, high-conviction" },
  { k: "Investment-Grade Credit", v: 22, note: "Short & intermediate duration" },
  { k: "Sovereign & Rates", v: 14, note: "Barbell across G7 curves" },
  { k: "Private Credit", v: 10, note: "Senior-secured, floating-rate" },
  { k: "Real Assets", v: 7, note: "Infrastructure & inflation-linked" },
  { k: "Cash & Equivalents", v: 5, note: "Reserved for asymmetry" },
];

const PERFORMANCE = [
  { p: "1-Year", f: "+9.8%", b: "+7.4%" },
  { p: "3-Year (ann.)", f: "+10.2%", b: "+6.9%" },
  { p: "5-Year (ann.)", f: "+11.6%", b: "+8.1%" },
  { p: "10-Year (ann.)", f: "+9.4%", b: "+7.2%" },
  { p: "Max Drawdown", f: "-8.9%", b: "-24.1%" },
  { p: "Sharpe (5-yr)", f: "1.28", b: "0.71" },
];

const INDICATORS = [
  { k: "Global CPI", v: "3.1%", d: "Cooling" },
  { k: "US 10Y Real Yield", v: "1.94%", d: "Restrictive" },
  { k: "Corporate Default Rate", v: "3.4%", d: "Below avg." },
  { k: "Manufacturing PMI", v: "50.6", d: "Expanding" },
];

function Investigation() {
  return (
    <section id="business" className="mt-16 sm:mt-24">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6">
        <div className="mx-auto max-w-[820px] hairline-thick pt-6">
          <p className="eyebrow text-breaking">The investigation continues · Part II</p>
          <h3 className="mt-4 font-display text-[36px] leading-[1.05] tracking-tight sm:text-[52px]">
            Ashcroft &amp; Warde Capital: a portrait of a firm that refuses to hurry
          </h3>
          <p className="mt-5 font-serif text-lg leading-relaxed text-ink-soft">
            Over the past quarter, Chronicle reporters were granted rare access to the research desk.
          </p>
        </div>

        <figure className="mx-auto mt-10 max-w-[1100px]" data-reveal>
          <img
            src={institutionImg}
            alt="Neoclassical financial institution building with tall columns"
            width={1600}
            height={900}
            loading="lazy"
            className="w-full rounded-sm object-cover"
          />
          <figcaption className="mt-3 font-sans text-[12px] italic text-ink-soft">
            The firm's Cornhill headquarters, City of London.
          </figcaption>
        </figure>

        <div id="economy" className="mx-auto mt-16 max-w-[1100px]" data-reveal>
          <div className="hairline-thick flex items-end justify-between pt-4">
            <h4 className="font-display text-2xl sm:text-3xl">A quiet chronology</h4>
            <span className="eyebrow">1998 — 2025</span>
          </div>
          <ol className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {TIMELINE.map((t) => (
              <li key={t.y} className="relative border-t border-ink pt-4">
                <div className="font-mono text-[12px] text-ink-soft">{t.y}</div>
                <p className="mt-2 font-serif text-[16px] leading-relaxed">{t.t}</p>
              </li>
            ))}
          </ol>
        </div>

        <div id="opinion" className="mx-auto mt-20 max-w-[1100px]" data-reveal>
          <p className="eyebrow">Research methodology</p>
          <h4 className="mt-2 font-display text-3xl sm:text-4xl">
            The six-step underwriting process
          </h4>
          <div className="mt-8 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {METHODOLOGY.map((m) => (
              <div key={m.n} className="border-t-2 border-ink pt-4">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-[12px] text-ink-soft">{m.n}</span>
                  <h5 className="font-display text-xl">{m.h}</h5>
                </div>
                <p className="mt-2 font-serif text-[15px] leading-relaxed text-ink-soft">
                  {m.b}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-20 grid max-w-[1100px] gap-10 lg:grid-cols-5" data-reveal>
          <div className="lg:col-span-3">
            <p className="eyebrow">Asset allocation</p>
            <h4 className="mt-2 font-display text-3xl">Portfolio composition</h4>
            <div className="mt-6 space-y-4">
              {ALLOCATION.map((a) => (
                <div key={a.k}>
                  <div className="flex items-baseline justify-between font-sans text-[13px]">
                    <span className="text-ink">{a.k}</span>
                    <span className="font-mono text-ink-soft">{a.v}%</span>
                  </div>
                  <div className="mt-1 h-1.5 bg-paper-tint">
                    <div className="h-full bg-ink" style={{ width: `${a.v * 2.2}%` }} />
                  </div>
                  <p className="mt-1 font-serif text-[13px] italic text-ink-soft">
                    {a.note}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <p className="eyebrow">Performance record</p>
            <h4 className="mt-2 font-display text-3xl">Composite vs. benchmark</h4>
            <table className="mt-6 w-full border-collapse font-sans text-[13px]">
              <thead>
                <tr className="border-y border-ink text-left uppercase tracking-widest text-ink-soft">
                  <th className="py-2 pr-3 font-semibold">Period</th>
                  <th className="py-2 pr-3 font-semibold">Firm</th>
                  <th className="py-2 font-semibold">Benchmark</th>
                </tr>
              </thead>
              <tbody className="font-serif">
                {PERFORMANCE.map((p) => (
                  <tr key={p.p} className="border-b border-rule">
                    <td className="py-2.5 pr-3 text-ink">{p.p}</td>
                    <td className="py-2.5 pr-3 font-mono text-ink">{p.f}</td>
                    <td className="py-2.5 font-mono text-ink-soft">{p.b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div id="world" className="mx-auto mt-20 max-w-[1100px] border-y border-ink py-8" data-reveal>
          <div className="flex items-end justify-between">
            <h4 className="font-display text-2xl sm:text-3xl">Economic indicators, watching now</h4>
            <span className="eyebrow">House dashboard</span>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {INDICATORS.map((i) => (
              <div key={i.k}>
                <p className="font-sans text-[11px] uppercase tracking-widest text-ink-soft">
                  {i.k}
                </p>
                <p className="mt-2 font-display text-3xl">{i.v}</p>
                <p className="mt-1 font-serif text-[13px] italic text-ink-soft">
                  {i.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 4 — Conclusion + Form + Footer                             */
/* ------------------------------------------------------------------ */

type FormState = {
  name: string;
  email: string;
  phone: string;
  country: string;
  budget: string;
  message: string;
};

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

  // Instant Validation Hook: validates phone as they type
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
    if (form.message.length > 1000) e.message = "Please keep the note under 1,000 characters.";
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
        // Short and concise error mapping
        if (errMsg.toLowerCase().includes("lead is not valid")) {
          errMsg = "Invalid phone number or email format. Please check the digits and selected country.";
        }
        setErrors({ name: errMsg });
        setStatus("idle");
        return;
      }

      setStatus("success");
    } catch (err) {
      console.error(err);
      setErrors({ name: "Network error. Please check your connection and try again." });
      setStatus("idle");
    }
  }

  // Determine placeholder based on selected country
  const selectedCountryCode = mapCountryNameToCode(form.country);
  const phonePlaceholder = countryConfigs[selectedCountryCode]?.placeholder || "+357 99 123456";

  if (status === "success") {
    return (
      <div className="border border-ink bg-paper p-10 text-center" role="status">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-ink text-paper">
          <Check className="h-5 w-5" aria-hidden />
        </span>
        <h4 className="mt-6 font-display text-3xl">Your request has been received</h4>
        <p className="mx-auto mt-3 max-w-[520px] font-serif text-ink-soft">
          A member of the Investment Desk will be in touch within one business day to
          arrange a confidential consultation and, where appropriate, deliver the full
          research report.
        </p>
        <p className="mt-6 font-sans text-[11px] uppercase tracking-widest text-ink-soft">
          Reference · IC-{Math.floor(100000 + Math.random() * 899999)}
        </p>
      </div>
    );
  }

  const field =
    "w-full border-b border-rule bg-transparent py-3 font-serif text-[16px] text-ink outline-none transition-colors placeholder:text-ink-soft/60 focus:border-ink";

  return (
    <form onSubmit={onSubmit} noValidate className="border border-rule bg-paper p-6 sm:p-10">
      <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="eyebrow">Full name</label>
          <input
            id="name"
            className={field}
            value={form.name}
            onChange={update("name")}
            aria-invalid={!!errors.name}
            placeholder="Eleanor Marsh"
            autoComplete="name"
            required
          />
          {errors.name && <p className="mt-1 font-sans text-[12px] text-breaking">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="email" className="eyebrow">Email address</label>
          <input
            id="email"
            type="email"
            className={field}
            value={form.email}
            onChange={update("email")}
            aria-invalid={!!errors.email}
            placeholder="e.marsh@example.com"
            autoComplete="email"
            required
          />
          {errors.email && <p className="mt-1 font-sans text-[12px] text-breaking">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="country" className="eyebrow">Country of residence</label>
          <select
            id="country"
            className={field}
            value={form.country}
            onChange={update("country")}
            aria-invalid={!!errors.country}
            required
          >
            <option value="">Select a country</option>
            {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.country && <p className="mt-1 font-sans text-[12px] text-breaking">{errors.country}</p>}
        </div>
        <div>
          <label htmlFor="phone" className="eyebrow">Telephone ({selectedCountryCode !== "GEN" ? `+${countryConfigs[selectedCountryCode]?.prefix}` : "with dial code"})</label>
          <input
            id="phone"
            type="tel"
            className={field}
            value={form.phone}
            onChange={update("phone")}
            placeholder={phonePlaceholder}
            autoComplete="tel"
          />
          {errors.phone && <p className="mt-1 font-sans text-[12px] text-breaking">{errors.phone}</p>}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="budget" className="eyebrow">Investment budget</label>
          <select
            id="budget"
            className={field}
            value={form.budget}
            onChange={update("budget")}
            aria-invalid={!!errors.budget}
            required
          >
            <option value="">Select a range</option>
            {BUDGETS.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          {errors.budget && <p className="mt-1 font-sans text-[12px] text-breaking">{errors.budget}</p>}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="message" className="eyebrow">A brief note (optional)</label>
          <textarea
            id="message"
            className={`${field} resize-none`}
            value={form.message}
            onChange={update("message")}
            rows={4}
            maxLength={1000}
            placeholder="Objectives, horizon, or any context you would like the desk to review."
          />
          {errors.message && <p className="mt-1 font-sans text-[12px] text-breaking">{errors.message}</p>}
        </div>
      </div>

      <div className="mt-8 flex flex-col-reverse items-start justify-between gap-4 border-t border-rule pt-6 sm:flex-row sm:items-center">
        <p className="font-serif text-[13px] italic text-ink-soft">
          Submissions are received in confidence by the Investor's Chronicle Investment
          Desk. We reply to every enquiry within one business day.
        </p>
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex items-center gap-2 border border-ink bg-ink px-6 py-3 font-sans text-[12px] uppercase tracking-widest text-paper transition-colors hover:bg-paper hover:text-ink disabled:opacity-60 cursor-pointer"
        >
          {status === "loading" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Sending
            </>
          ) : (
            <>
              Submit request
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

const CTA_CARDS = [
  { h: "Request Full Research Report", b: "A 42-page briefing prepared quarterly for institutional readers." },
  { h: "Speak With the Investment Desk", b: "Confidential 30-minute conversation with a senior analyst." },
  { h: "Private Wealth Consultation", b: "For readers considering a personal or family-office mandate." },
];

function Conclusion() {
  return (
    <section id="consult" className="mt-20 sm:mt-28">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6">
        <div className="mx-auto max-w-[820px] hairline-thick pt-6" data-reveal>
          <p className="eyebrow">Editorial conclusion</p>
          <h3 className="mt-4 font-display text-[36px] leading-[1.05] tracking-tight sm:text-[48px]">
            For those who would like to read further
          </h3>
          <p className="mt-5 font-serif text-lg leading-relaxed text-ink-soft">
            This investigation continues in longer form for readers who wish to engage
            with the material directly. The Chronicle has arranged three
            optional routes — please choose the one that best suits your interest.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-[1100px] gap-6 md:grid-cols-3" data-reveal>
          {CTA_CARDS.map((c, i) => (
            <div key={c.h} className="group flex flex-col border border-rule bg-paper p-6 transition-colors hover:border-ink">
              <span className="font-mono text-[12px] text-ink-soft">
                Option {String(i + 1).padStart(2, "0")}
              </span>
              <h4 className="mt-3 font-display text-2xl leading-tight">{c.h}</h4>
              <p className="mt-3 font-serif text-[15px] leading-relaxed text-ink-soft">
                {c.b}
              </p>
              <a
                href="#form"
                className="mt-6 inline-flex items-center gap-1 font-sans text-[12px] uppercase tracking-widest text-ink"
              >
                Continue
                <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </a>
            </div>
          ))}
        </div>

        <div id="form" className="mx-auto mt-14 max-w-[900px]" data-reveal>
          <div className="mb-6 text-center">
            <p className="eyebrow">Institutional consultation · Investor registration</p>
            <h4 className="mt-2 font-display text-3xl sm:text-4xl">
              Portfolio assessment request
            </h4>
            <p className="mx-auto mt-3 max-w-[560px] font-serif text-ink-soft">
              Please provide a few details. A senior member of the Investment Desk will
              respond personally within one business day.
            </p>
          </div>
          <ConsultationForm />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Footer                                                             */
/* ------------------------------------------------------------------ */

const FOOTER_COLS = [
  {
    h: "Sections",
    items: ["Markets", "Business", "Economy", "Opinion", "World", "Technology"],
  },
  {
    h: "Editorial",
    items: ["Standards", "Corrections", "Ethics", "Newsroom", "Contact the Desk"],
  },
  {
    h: "Policies",
    items: ["Privacy", "Terms of Use", "Cookies", "Advertising", "Reader Charter"],
  },
  {
    h: "Legal",
    items: ["Regulatory", "Disclosures", "Complaints", "Modern Slavery", "Company"],
  },
];

function Footer() {
  return (
    <footer className="mt-24 border-t-2 border-ink bg-paper">
      <div className="mx-auto max-w-[1360px] px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(4,minmax(0,1fr))]">
          <div>
            <p className="font-display text-3xl leading-none tracking-tight">
              The Investor's Chronicle
            </p>
            <p className="mt-3 font-serif text-sm italic text-ink-soft">
              Reporting the business of capital since 1998.
            </p>
            <address className="mt-6 space-y-2 font-serif not-italic text-[14px] text-ink-soft">
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                48 Cornhill, London EC3V 3PD, United Kingdom
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden />
                +44 (0) 20 7946 0100
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden />
                desk@investorschronicle.example
              </p>
            </address>
            <div className="mt-6 flex items-center gap-3">
              {[Twitter, Facebook, Linkedin, Youtube, Rss].map((Icon, i) => (
                <a
                  key={i}
                  href="#social"
                  aria-label="Social channel"
                  className="flex h-9 w-9 items-center justify-center border border-rule text-ink-soft transition-colors hover:border-ink hover:text-ink"
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </a>
              ))}
            </div>
          </div>

          {FOOTER_COLS.map((col) => (
            <div key={col.h}>
              <p className="eyebrow">{col.h}</p>
              <ul className="mt-4 space-y-2 font-serif text-[14px]">
                {col.items.map((i) => (
                  <li key={i}>
                    <a href="#footer" className="text-ink-soft hover:text-ink">
                      {i}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col-reverse items-start justify-between gap-4 border-t border-rule pt-6 font-sans text-[12px] uppercase tracking-widest text-ink-soft sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} The Investor's Chronicle. All rights reserved.</p>
          <p>Regulated by the editorial standards of independent journalism.</p>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export function IndexPage() {
  const progress = useReadingProgress();
  useReveal();

  return (
    <div id="top" className="bg-paper text-ink font-serif">
      <StickyBar progress={progress} />

      {/* header spacer for sticky bar */}
      <div className="h-12" aria-hidden />

      <header>
        <TopBar />
        <Masthead />
        <Nav />
        <Ticker />
        <InTheNewsTicker />
        <TrendingTags />
      </header>

      <main>
        <Hero />

        <section className="mx-auto mt-14 max-w-[1360px] px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[64px_minmax(0,760px)_1fr] lg:justify-center">
            <ShareRail />
            <div>
              <Body />
            </div>
            <Toc />
          </div>
        </section>

        <Investigation />
        <Conclusion />
      </main>

      <Footer />
    </div>
  );
}
