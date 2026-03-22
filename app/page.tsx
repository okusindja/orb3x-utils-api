export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top_left,_#d9efe3,_transparent_32%),linear-gradient(180deg,_#f6f7f2_0%,_#eef1e4_100%)] px-6 py-12 text-stone-900 sm:px-10 lg:px-16">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8">
        <section className="rounded-[2rem] border border-stone-900/10 bg-white/85 p-8 shadow-[0_25px_80px_-40px_rgba(39,55,33,0.45)] backdrop-blur">
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-emerald-800">
            ORB3X Tax Verifier
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            JSON API for Angola NIF verification.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-stone-700 sm:text-lg">
            This service queries the public AGT contributor portal and returns the
            taxpayer fields needed for tax verification workflows.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-[2rem] border border-stone-900/10 bg-stone-950 p-7 text-stone-50 shadow-[0_25px_60px_-35px_rgba(17,24,39,0.8)]">
            <p className="text-sm uppercase tracking-[0.28em] text-emerald-300">
              Endpoint
            </p>
            <pre className="mt-4 overflow-x-auto rounded-2xl bg-white/10 p-4 text-sm leading-7 text-emerald-100">
              <code>GET /api/nif/[nif]</code>
            </pre>
            <p className="mt-5 text-sm leading-7 text-stone-300">Example:</p>
            <pre className="mt-3 overflow-x-auto rounded-2xl bg-white/10 p-4 text-sm leading-7 text-emerald-100">
              <code>/api/nif/5402162409</code>
            </pre>
          </article>

          <article className="rounded-[2rem] border border-stone-900/10 bg-white/90 p-7 shadow-[0_20px_60px_-40px_rgba(39,55,33,0.55)]">
            <p className="text-sm uppercase tracking-[0.28em] text-emerald-800">
              Response shape
            </p>
            <pre className="mt-4 overflow-x-auto rounded-2xl bg-stone-950 p-4 text-sm leading-7 text-emerald-100">
              <code>{`{
  "NIF": "5402162409",
  "Name": "ELFRAN - COMERCIO E PRESTACAO DE SERVICOS, LDA",
  "Type": "COLECTIVO - Empresa",
  "Status": "Suspenso",
  "Defaulting": "Sim",
  "VATRegime": "Sem actividade em IVA (Não factura IVA)",
  "isTaxResident": true
}`}</code>
            </pre>
          </article>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <article className="rounded-[2rem] border border-stone-900/10 bg-white/90 p-7">
            <h2 className="text-xl font-semibold tracking-tight">Behavior</h2>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-stone-700">
              <li>The API validates the NIF from the path parameter.</li>
              <li>The AGT portal response is fetched server-side with no caching.</li>
              <li>
                <code>isTaxResident</code> is <code>true</code> only when the portal
                returns <code>Residente Fiscal</code>.
              </li>
            </ul>
          </article>

          <article className="rounded-[2rem] border border-stone-900/10 bg-white/90 p-7">
            <h2 className="text-xl font-semibold tracking-tight">Errors</h2>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-stone-700">
              <li>Invalid path parameters return HTTP 400.</li>
              <li>Known upstream misses return HTTP 404.</li>
              <li>Portal failures, timeouts, or parsing issues return HTTP 502 or 504.</li>
            </ul>
          </article>
        </section>
      </div>
    </main>
  );
}
