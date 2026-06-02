import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Copy, Upload, ArrowLeft, ShieldCheck, X } from "lucide-react";
import { getEntity, wallets, cryptoRails, type InvestmentPlan } from "@/lib/data";

export const Route = createFileRoute("/invest/$slug")({
  loader: ({ params }) => {
    const entity = getEntity(params.slug);
    if (!entity) throw notFound();
    return { entity };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `Invest in ${loaderData?.entity.name ?? "Venture"} — Zaxbyte` },
      { name: "description", content: `Fund your ${loaderData?.entity.name ?? ""} investment in BTC, ETH or SOL with tiered plans and full proof-of-payment verification.` },
    ],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-6 py-32 text-center">
      <h1 className="text-3xl">Venture not found</h1>
      <Link to="/invest" className="mt-6 inline-block text-sm underline">Back to portfolio</Link>
    </div>
  ),
  component: CheckoutPage,
});

function currency(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function WalletRow({ label, address }: { label: string; address: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-secondary p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="mt-1 truncate font-mono text-sm">{address}</div>
      </div>
      <button
        onClick={() => {
          navigator.clipboard.writeText(address);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="inline-flex shrink-0 items-center gap-2 rounded-full border border-foreground/20 px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-colors hover:bg-foreground hover:text-background"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

function CheckoutPage() {
  const { entity } = Route.useLoaderData();
  const [planIdx, setPlanIdx] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);

  return (
    <div>
      {/* Branded Hero */}
      <section
        className="border-b border-border"
        style={{
          background: `linear-gradient(180deg, ${entity.accent}10 0%, transparent 100%)`,
        }}
      >
        <div className="mx-auto max-w-[1400px] px-6 py-16 lg:px-12 lg:py-24">
          <Link
            to="/invest"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Portfolio
          </Link>
          <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-center">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-2xl text-2xl font-semibold text-white"
              style={{ backgroundColor: entity.accent }}
            >
              {entity.initials}
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                {entity.sector} · Founded {entity.founded}
              </div>
              <h1 className="mt-2 text-4xl md:text-6xl">Invest in {entity.name}</h1>
            </div>
          </div>
          <p className="mt-8 max-w-2xl text-lg text-muted-foreground">{entity.mission}</p>
        </div>
      </section>

      {/* Plans */}
      <section className="mx-auto max-w-[1400px] px-6 py-16 lg:px-12">
        <h2 className="text-3xl">Choose your plan.</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {entity.plans.map((p: InvestmentPlan, i: number) => {
            const selected = i === planIdx;
            return (
              <button
                key={p.name}
                onClick={() => setPlanIdx(i)}
                className={`flex flex-col rounded-2xl border p-6 text-left transition-all ${
                  selected ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:border-foreground/40"
                }`}
              >
                <div className={`text-xs font-semibold uppercase tracking-widest ${selected ? "text-background/70" : "text-muted-foreground"}`}>
                  {p.name}
                </div>
                <div className="mt-3 text-3xl font-medium">
                  {p.minimum >= 1000 ? `$${(p.minimum / 1000).toFixed(0)}k` : `$${p.minimum}`}
                </div>
                <div className={`text-sm ${selected ? "text-background/70" : "text-muted-foreground"}`}>minimum</div>
                <div className="mt-5 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className={selected ? "text-background/70" : "text-muted-foreground"}>ROI</span>
                    <span className="font-medium">{p.roi}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={selected ? "text-background/70" : "text-muted-foreground"}>Term</span>
                    <span className="font-medium">{p.term}</span>
                  </div>
                </div>
                <ul className="mt-5 space-y-1.5 text-xs">
                  {p.features.map((f: string) => (
                    <li key={f} className="flex gap-2">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>
      </section>

      {/* How to invest */}
      <section className="mx-auto max-w-[1400px] px-6 py-12 lg:px-12">
        <h2 className="text-3xl">How to invest.</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            { n: "01", t: "Select your plan", d: `Choose the tier that matches your goals. Selected: ${entity.plans[planIdx].name} — min ${currency(entity.plans[planIdx].minimum)}.` },
            { n: "02", t: "Send crypto", d: "Transfer the equivalent in BTC, ETH or SOL to the corresponding Zaxbyte custody wallet below." },
            { n: "03", t: "Submit proof", d: "Upload your transaction hash or screenshot. Your investment is activated within 12 hours." },
          ].map((s) => (
            <div key={s.n} className="rounded-2xl border border-border p-6">
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{s.n}</div>
              <div className="mt-2 text-xl font-medium">{s.t}</div>
              <p className="mt-3 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Wallets */}
      <section className="mx-auto max-w-[1400px] px-6 py-12 lg:px-12">
        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-border bg-secondary p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Your selection
            </div>
            <div className="mt-1 text-lg font-medium">
              {entity.name} · {entity.plans[planIdx].name}
            </div>
            <div className="text-sm text-muted-foreground">
              Min {currency(entity.plans[planIdx].minimum)} · {entity.plans[planIdx].roi} · {entity.plans[planIdx].term}
            </div>
          </div>
          <div
            className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white"
            style={{ backgroundColor: entity.accent }}
          >
            Ready to fund
          </div>
        </div>

        <h2 className="text-3xl">Funding wallets.</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Send only the matching asset to each address. Sending the wrong asset may result in loss of funds.
        </p>
        <div className="mt-6 grid gap-3">
          <WalletRow label="Bitcoin (BTC)" address={wallets.BTC} />
          <WalletRow label="Ethereum (ETH)" address={wallets.ETH} />
          <WalletRow label="Solana (SOL)" address={wallets.SOL} />
        </div>
      </section>

      {/* Proof */}
      <section className="mx-auto max-w-[1400px] px-6 pb-24 pt-12 lg:px-12">
        <div className="rounded-3xl bg-foreground p-8 text-background md:p-14">
          <p className="text-xl font-semibold md:text-2xl">
            Once you've made your transaction, click the button below to send proof of
            payment to enable your investment plan.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <label className="inline-flex cursor-pointer items-center gap-3 rounded-full bg-background px-6 py-3.5 text-sm font-semibold uppercase tracking-widest text-foreground transition-opacity hover:opacity-90">
              <Upload className="h-4 w-4" />
              {file ? "Replace file" : "Choose proof file"}
              <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
            <button
              disabled={!file}
              onClick={() => setSubmitted(true)}
              className="rounded-full border border-background/30 px-6 py-3.5 text-sm font-semibold uppercase tracking-widest transition-colors disabled:opacity-40 enabled:hover:bg-background enabled:hover:text-foreground"
            >
              Submit Proof of Payment
            </button>
            {file && (
              <div className="text-sm text-background/70">Attached: {file.name}</div>
            )}
          </div>
          {submitted && (
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-background/10 px-4 py-2 text-sm">
              <Check className="h-4 w-4" /> Proof received. Our team will verify within 12 hours.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
