import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Check, Copy, ShieldCheck, X } from "lucide-react";
import { getVehicle, wallets, cryptoRails } from "@/lib/data";

type CheckoutSearch = {
  slug: string;
  color: number;
  wheel: number;
  interior: number;
  down: number;
  term: number;
  apr: number;
};

export const Route = createFileRoute("/checkout")({
  validateSearch: (search: Record<string, unknown>): CheckoutSearch => ({
    slug: String(search.slug ?? "model-s"),
    color: Number(search.color ?? 0),
    wheel: Number(search.wheel ?? 0),
    interior: Number(search.interior ?? 0),
    down: Number(search.down ?? 10000),
    term: Number(search.term ?? 60),
    apr: Number(search.apr ?? 5.99),
  }),
  head: () => ({
    meta: [
      { title: "Checkout — Zaxbyte" },
      { name: "description", content: "Complete your Tesla order with crypto: BTC, ETH, SOL or XRP." },
    ],
  }),
  component: CheckoutPage,
});

function currency(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function CheckoutPage() {
  const search = Route.useSearch();
  const vehicle = getVehicle(search.slug);
  const navigate = useNavigate();

  if (!vehicle) {
    return (
      <div className="mx-auto max-w-xl px-6 py-32 text-center">
        <h1 className="text-3xl">Vehicle not found</h1>
        <Link to="/vehicles" className="mt-6 inline-block text-sm underline">Back to showroom</Link>
      </div>
    );
  }

  const color = vehicle.colors[search.color] ?? vehicle.colors[0];
  const wheel = vehicle.wheels[search.wheel] ?? vehicle.wheels[0];
  const interior = vehicle.interiors[search.interior] ?? vehicle.interiors[0];

  const total = vehicle.basePrice + color.price + wheel.price + interior.price;
  const monthly = useMemo(() => {
    const principal = Math.max(total - search.down, 0);
    const r = search.apr / 100 / 12;
    if (r === 0) return principal / search.term;
    return (principal * r) / (1 - Math.pow(1 + r, -search.term));
  }, [total, search.down, search.apr, search.term]);

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-12 lg:px-12 lg:py-16">
      <button
        onClick={() => navigate({ to: "/vehicles" })}
        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Configurator
      </button>

      <div className="mt-6 max-w-3xl">
        <div className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Vehicle Checkout</div>
        <h1 className="mt-3 text-4xl md:text-5xl">Confirm your {vehicle.name}.</h1>
        <p className="mt-3 text-muted-foreground">
          Review your build, fund in crypto, and submit your receipt to lock the order.
        </p>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        {/* Order Summary */}
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
          <div className="rounded-xl bg-secondary p-6">
            <img
              key={color.image}
              src={color.image}
              alt={`${vehicle.name} in ${color.name}`}
              className="mx-auto w-full max-w-xl object-contain animate-fade-up"
            />
          </div>

          <div className="mt-8">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Order summary</div>
            <h2 className="mt-1 text-2xl font-medium">{vehicle.name}</h2>

            <dl className="mt-6 divide-y divide-border text-sm">
              {[
                { k: "Paint", v: color.name, p: color.price },
                { k: "Wheels", v: wheel.name, p: wheel.price },
                { k: "Interior", v: interior.name, p: interior.price },
                { k: "Base price", v: vehicle.name, p: vehicle.basePrice },
              ].map((row) => (
                <div key={row.k} className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">{row.k}</div>
                    <div className="font-medium">{row.v}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {row.p === 0 ? "Included" : `+ ${currency(row.p)}`}
                  </div>
                </div>
              ))}
            </dl>

            <div className="mt-6 rounded-xl bg-foreground p-5 text-background">
              <div className="flex items-baseline justify-between">
                <span className="text-xs uppercase tracking-widest text-background/70">Total</span>
                <span className="text-2xl font-medium">{currency(total)}</span>
              </div>
              <div className="mt-2 flex items-baseline justify-between border-t border-background/15 pt-3">
                <span className="text-xs uppercase tracking-widest text-background/70">
                  {search.term} mo · {search.apr.toFixed(2)}% APR · {currency(search.down)} down
                </span>
                <span className="text-lg font-medium">{currency(monthly)}<span className="text-xs text-background/70"> /mo</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment */}
        <div>
          <PaymentPanel total={total} down={search.down} />
        </div>
      </div>
    </div>
  );
}

function PaymentPanel({ total, down }: { total: number; down: number }) {
  const [active, setActive] = useState<(typeof cryptoRails)[number]["key"]>("BTC");
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const address = wallets[active];

  const copy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
      <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Crypto payment</div>
      <h2 className="mt-1 text-2xl font-medium">Fund {currency(total)}</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Choose your rail and send the equivalent of the total. Use only the matching asset.
      </p>

      {/* Down payment callout */}
      <div className="mt-5 rounded-xl border border-border bg-secondary p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Down payment to wallet</div>
            <div className="mt-1 text-2xl font-medium">{currency(down)}</div>
          </div>
          <div className="text-right">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Remaining</div>
            <div className="mt-1 text-sm font-medium text-muted-foreground">{currency(Math.max(total - down, 0))}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 inline-flex rounded-full border border-border bg-secondary p-1">
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

      {/* Address */}
      <div className="mt-5 rounded-xl border border-border bg-secondary p-4">
        <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {cryptoRails.find((c) => c.key === active)!.label} wallet address
        </div>
        <div className="mt-2 flex items-center justify-between gap-3">
          <code className="truncate font-mono text-sm">{address}</code>
          <button
            onClick={copy}
            aria-label="Copy address"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-foreground/20 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest transition-colors hover:bg-foreground hover:text-background"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      <p className="mt-6 text-sm font-semibold">
        Once payment has been made click the button below to verify payment and submit details.
      </p>

      <button
        onClick={() => setOpen(true)}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold uppercase tracking-widest text-white shadow-sm transition-opacity hover:opacity-90"
        style={{ backgroundColor: "var(--success)" }}
      >
        <ShieldCheck className="h-4 w-4" />
        Verify Payment
      </button>

      {open && <VerifyModal onClose={() => setOpen(false)} />}
    </div>
  );
}

function VerifyModal({ onClose }: { onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 animate-fade-up"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-2xl bg-background p-8 shadow-[var(--shadow-elevated)]"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        {!submitted ? (
          <>
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Submit payment receipt
            </div>
            <h3 className="mt-1 text-2xl">Verify your transaction.</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Upload your transaction hash, screenshot, or PDF receipt. Our desk reviews and activates your order within 12 hours.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
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
                <span className="text-muted-foreground">Transaction hash / reference</span>
                <input className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-xs" />
              </label>
              <label className="block text-sm">
                <span className="text-muted-foreground">Receipt (image or PDF)</span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-foreground file:px-3 file:py-1.5 file:text-xs file:font-semibold file:uppercase file:tracking-widest file:text-background"
                />
                {file && <div className="mt-1 text-xs text-muted-foreground">Attached: {file.name}</div>}
              </label>

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
            <h3 className="mt-5 text-2xl">Receipt received.</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Our team will verify your transaction and activate your order within 12 hours.
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
