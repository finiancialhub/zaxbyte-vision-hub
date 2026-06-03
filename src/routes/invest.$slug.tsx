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


const railMeta: Record<string, { symbol: string; network: string; color: string }> = {
  BTC: { symbol: "₿", network: "Bitcoin (BTC) network", color: "#F7931A" },
  ETH: { symbol: "Ξ", network: "Ethereum (ERC-20) network", color: "#627EEA" },
  SOL: { symbol: "◎", network: "Solana (SPL) network", color: "#14F195" },
  XRP: { symbol: "✕", network: "XRP Ledger (XRPL) network", color: "#23292F" },
};

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
          Select your rail. Send only the matching asset to the displayed address.
        </p>

        <CryptoPanel />
      </section>

      {/* Verify */}
      <section className="mx-auto max-w-[1400px] px-6 pb-24 pt-6 lg:px-12">
        <div className="rounded-3xl bg-foreground p-8 text-background md:p-14">
          <p className="text-xl font-semibold md:text-2xl">
            Once you've made your transaction, click the button below to send proof of
            payment to enable your investment plan.
          </p>
          <button
            onClick={() => setSubmitted(true)}
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold uppercase tracking-widest text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--success)" }}
          >
            <ShieldCheck className="h-4 w-4" />
            Verify Payment
          </button>

          {submitted && (
            <VerifyModal
              entityName={entity.name}
              planName={entity.plans[planIdx].name}
              minimum={entity.plans[planIdx].minimum}
              onClose={() => {
                setSubmitted(false);
                setFile(null);
              }}
              file={file}
              setFile={setFile}
            />
          )}
        </div>
      </section>
    </div>
  );
}

function CryptoPanel() {
  const [active, setActive] = useState<(typeof cryptoRails)[number]["key"]>("BTC");
  const [copied, setCopied] = useState(false);
  const address = wallets[active];

  return (
    <div className="mt-6">
      <div className="inline-flex rounded-full border border-border bg-secondary p-1">
        {cryptoRails.map((c) => (
          <button
            key={c.key}
            onClick={() => setActive(c.key)}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-colors ${
              active === c.key ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {c.ticker}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-3 rounded-xl border border-border bg-secondary p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {cryptoRails.find((c) => c.key === active)!.label} ({active}) wallet
          </div>
          <div className="mt-1 truncate font-mono text-sm">{address}</div>
        </div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          aria-label="Copy address"
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-foreground/20 px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-colors hover:bg-foreground hover:text-background"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy Address"}
        </button>
      </div>
    </div>
  );
}

function VerifyModal({
  entityName,
  planName,
  minimum,
  onClose,
  file,
  setFile,
}: {
  entityName: string;
  planName: string;
  minimum: number;
  onClose: () => void;
  file: File | null;
  setFile: (f: File | null) => void;
}) {
  const [done, setDone] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 animate-fade-up"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-2xl bg-background p-8 text-foreground shadow-[var(--shadow-elevated)]"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        {!done ? (
          <>
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {entityName} · {planName} · {currency(minimum)}+
            </div>
            <h3 className="mt-1 text-2xl">Submit your transaction.</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Provide your details and upload the on-chain receipt so we can activate your plan.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setDone(true);
              }}
              className="mt-6 space-y-4"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="text-muted-foreground">Full name</span>
                  <input required className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                </label>
                <label className="block text-sm">
                  <span className="text-muted-foreground">Email</span>
                  <input required type="email" className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                </label>
              </div>
              <label className="block text-sm">
                <span className="text-muted-foreground">Transaction hash</span>
                <input className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-xs" />
              </label>
              <label className="inline-flex cursor-pointer items-center gap-3 rounded-full border border-border px-5 py-2.5 text-xs font-semibold uppercase tracking-widest transition-colors hover:bg-secondary">
                <Upload className="h-4 w-4" />
                {file ? "Replace receipt" : "Upload receipt"}
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </label>
              {file && <div className="text-xs text-muted-foreground">Attached: {file.name}</div>}

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold uppercase tracking-widest text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: "var(--success)" }}
              >
                <ShieldCheck className="h-4 w-4" />
                Submit for Verification
              </button>
            </form>
          </>
        ) : (
          <div className="py-6 text-center">
            <div
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
              style={{ backgroundColor: "var(--success)" }}
            >
              <Check className="h-7 w-7 text-white" />
            </div>
            <h3 className="mt-5 text-2xl">Proof received.</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Our desk will verify the transaction and activate your {planName} plan within 12 hours.
            </p>
            <button
              onClick={onClose}
              className="mt-6 rounded-full bg-foreground px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-background"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
