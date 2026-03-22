export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top_left,_rgba(254,240,138,0.55),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(110,231,183,0.35),_transparent_24%),linear-gradient(180deg,_#f8f4ea_0%,_#e8efe9_100%)] px-6 py-12 text-stone-900 sm:px-10 lg:px-16">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8">
        <section className="rounded-[2rem] border border-stone-900/10 bg-white/85 p-8 shadow-[0_30px_100px_-50px_rgba(34,64,51,0.5)] backdrop-blur">
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-emerald-800">
            ORB3X Utils API
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl">
            One API surface for tax verification, translation, and currency conversion.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-stone-700 sm:text-lg">
            Built for Vercel with dynamic server routes. The project now exposes ORB3X
            utility endpoints instead of a single-purpose tax checker.
          </p>
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <article className="rounded-[2rem] border border-stone-900/10 bg-stone-950 p-7 text-stone-50 shadow-[0_25px_60px_-35px_rgba(17,24,39,0.82)]">
            <p className="text-sm uppercase tracking-[0.28em] text-amber-300">Tax</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">NIF verification</h2>
            <pre className="mt-5 overflow-x-auto rounded-2xl bg-white/10 p-4 text-sm leading-7 text-emerald-100">
              <code>GET /api/nif/[nif]</code>
            </pre>
            <p className="mt-4 text-sm leading-7 text-stone-300">
              Returns NIF, Name, Type, Status, Defaulting, VAT regime, and
              <code className="ml-1">isTaxResident</code>.
            </p>
          </article>

          <article className="rounded-[2rem] border border-stone-900/10 bg-white/90 p-7 shadow-[0_20px_60px_-40px_rgba(39,55,33,0.55)]">
            <p className="text-sm uppercase tracking-[0.28em] text-emerald-800">
              Translate
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">Text translation</h2>
            <pre className="mt-5 overflow-x-auto rounded-2xl bg-stone-950 p-4 text-sm leading-7 text-emerald-100">
              <code>POST /api/translate</code>
            </pre>
            <p className="mt-4 text-sm leading-7 text-stone-700">
              Accepts <code>{`{"text","to","from?"}`}</code> and returns translated
              text with detected source language.
            </p>
          </article>

          <article className="rounded-[2rem] border border-stone-900/10 bg-emerald-900 p-7 text-emerald-50 shadow-[0_25px_60px_-35px_rgba(6,78,59,0.9)]">
            <p className="text-sm uppercase tracking-[0.28em] text-emerald-200">
              Exchange
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">
              Rates and direct conversion
            </h2>
            <pre className="mt-5 overflow-x-auto rounded-2xl bg-black/20 p-4 text-sm leading-7 text-emerald-100">
              <code>GET /api/exchange/[base]?amount=1000000</code>
            </pre>
            <p className="mt-4 text-sm leading-7 text-emerald-100/90">
              Without <code>amount</code> it returns unit rates. With <code>amount</code>
              it also returns all converted values.
            </p>
          </article>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="rounded-[2rem] border border-stone-900/10 bg-white/90 p-7">
            <p className="text-sm uppercase tracking-[0.28em] text-emerald-800">
              Translation Example
            </p>
            <pre className="mt-4 overflow-x-auto rounded-2xl bg-stone-950 p-4 text-sm leading-7 text-emerald-100">
              <code>{`POST /api/translate
{
  "text": "Olá mundo",
  "to": "en"
}`}</code>
            </pre>
            <pre className="mt-4 overflow-x-auto rounded-2xl bg-stone-100 p-4 text-sm leading-7 text-stone-800">
              <code>{`{
  "translatedText": "Hello world",
  "sourceLanguage": "pt",
  "targetLanguage": "en",
  "status": true,
  "message": ""
}`}</code>
            </pre>
          </article>

          <article className="rounded-[2rem] border border-stone-900/10 bg-white/90 p-7">
            <p className="text-sm uppercase tracking-[0.28em] text-emerald-800">
              Exchange Example
            </p>
            <pre className="mt-4 overflow-x-auto rounded-2xl bg-stone-950 p-4 text-sm leading-7 text-emerald-100">
              <code>/api/exchange/aoa?amount=1000000</code>
            </pre>
            <pre className="mt-4 overflow-x-auto rounded-2xl bg-stone-100 p-4 text-sm leading-7 text-stone-800">
              <code>{`{
  "baseCurrency": "AOA",
  "amount": 1000000,
  "ratesDate": "2026-03-21",
  "convertedRates": {
    "usd": 1089.4961,
    "eur": 939.90832,
    "brl": 5786.5844
  }
}`}</code>
            </pre>
          </article>
        </section>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <article className="rounded-[2rem] border border-stone-900/10 bg-white/90 p-7">
            <h2 className="text-xl font-semibold tracking-tight">Route summary</h2>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-stone-700">
              <li><code>GET /api/nif/[nif]</code> for Angola taxpayer verification.</li>
              <li><code>POST /api/translate</code> for text translation.</li>
              <li><code>GET /api/exchange/[base]</code> for live unit rates.</li>
              <li>
                <code>GET /api/exchange/[base]?amount=...</code> for direct conversion.
              </li>
            </ul>
          </article>

          <article className="rounded-[2rem] border border-stone-900/10 bg-white/90 p-7">
            <h2 className="text-xl font-semibold tracking-tight">Behavior</h2>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-stone-700">
              <li>Every route is dynamic and served on demand.</li>
              <li>External lookups use <code>no-store</code> caching.</li>
              <li>
                Currency conversion multiplies the upstream unit rate by the provided
                amount.
              </li>
              <li>
                Tax residency is <code>true</code> only when AGT returns
                <code className="ml-1">Residente Fiscal</code>.
              </li>
            </ul>
          </article>

          <article className="rounded-[2rem] border border-stone-900/10 bg-white/90 p-7">
            <h2 className="text-xl font-semibold tracking-tight">Errors</h2>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-stone-700">
              <li>Invalid inputs return HTTP 400.</li>
              <li>Known missing resources return HTTP 404 when upstream supports it.</li>
              <li>Upstream failures return HTTP 502 or 504.</li>
            </ul>
          </article>
        </section>
      </div>
    </main>
  );
}
