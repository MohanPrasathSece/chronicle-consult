import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="max-w-md text-center">
        <p className="eyebrow">Error 404</p>
        <h1 className="mt-3 font-display text-6xl">Page not found</h1>
        <p className="mt-4 text-ink-soft">
          The story you're looking for has been moved, retired, or never existed in our archive.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center border-b border-ink pb-0.5 font-sans text-sm uppercase tracking-widest text-ink hover:text-link"
          >
            Return to the front page
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="max-w-md text-center">
        <p className="eyebrow">Editorial notice</p>
        <h1 className="mt-3 font-display text-4xl">This page didn't load</h1>
        <p className="mt-3 text-ink-soft">
          Please try refreshing, or return to the front page.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="border-b border-ink pb-0.5 font-sans text-sm uppercase tracking-widest text-ink hover:text-link"
          >
            Try again
          </button>
          <a
            href="/"
            className="border-b border-ink pb-0.5 font-sans text-sm uppercase tracking-widest text-ink hover:text-link"
          >
            Front page
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        title:
          "Institutional Capital Returns to Fundamentals — The Investor's Chronicle",
      },
      {
        name: "description",
        content:
          "An exclusive Investor's Chronicle investigation into the quiet return of disciplined, research-led capital allocation across global markets.",
      },
      { name: "author", content: "The Investor's Chronicle" },
      {
        property: "og:title",
        content:
          "Institutional Capital Returns to Fundamentals — The Investor's Chronicle",
      },
      {
        property: "og:description",
        content:
          "An exclusive investigation into the quiet return of disciplined, research-led capital allocation across global markets.",
      },
      { property: "og:type", content: "article" },
      { property: "og:site_name", content: "The Investor's Chronicle" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@InvestorChron" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800;900&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
