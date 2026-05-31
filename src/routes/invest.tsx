import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { entities } from "@/lib/data";

export const Route = createFileRoute("/invest")({
  head: () => ({
    meta: [
      { title: "Invest — The Musk Portfolio | Zaxbyte" },
      { name: "description", content: "Invest across Tesla, SpaceX, Neuralink, xAI, Starlink, The Boring Company and every Musk-founded venture." },
      { property: "og:title", content: "Invest — The Musk Portfolio | Zaxbyte" },
      { property: "og:description", content: "One portal, every Musk venture. Tiered investment plans from $250 to institutional scale." },
    ],
  }),
  component: InvestPage,
});

function InvestPage() {
  return (
    <div className="mx-auto max-w-[1600px] px-6 py-16 lg:px-12 lg:py-24">
      <div className="mb-16 max-w-3xl">
        <div className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          The Musk Portfolio
        </div>
        <h1 className="mt-3 text-5xl md:text-7xl">Own the next century.</h1>
        <p className="mt-6 text-lg text-muted-foreground">
          Every entity founded or majority-led by Elon Musk, accessible through a
          single portal. Choose a venture, pick a plan, fund in crypto, and watch
          your stake grow.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {entities.map((e) => (
          <div
            key={e.slug}
            className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)]"
          >
            <div
              className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl text-base font-semibold tracking-tight text-white"
              style={{ backgroundColor: e.accent }}
            >
              {e.initials}
            </div>
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {e.sector}
            </div>
            <h3 className="mt-1 text-2xl">{e.name}</h3>
            <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{e.mission}</p>

            <div className="mt-5 grid grid-cols-2 gap-2 border-t border-border pt-4 text-xs">
              {e.plans.slice(0, 4).map((p) => (
                <div key={p.name}>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-muted-foreground">
                    {p.minimum >= 1000 ? `$${(p.minimum / 1000).toFixed(0)}k+` : `$${p.minimum}+`}
                  </div>
                </div>
              ))}
            </div>

            <Link
              to="/invest/$slug"
              params={{ slug: e.slug }}
              className="mt-6 inline-flex items-center justify-between rounded-full bg-foreground px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-background transition-opacity hover:opacity-90"
            >
              Invest Now
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
