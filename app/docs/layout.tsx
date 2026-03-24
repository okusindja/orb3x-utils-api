import { Sidebar } from '@/components/sidebar';

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="wide-shell py-8 sm:py-10 md:py-12">
      <div className="grid items-start gap-8 lg:grid-cols-[15rem_minmax(0,1fr)] xl:grid-cols-[16rem_minmax(0,1fr)] lg:gap-10">
        <Sidebar />
        <div className="min-w-0">
          <div className="mx-auto max-w-5xl">{children}</div>
        </div>
      </div>
    </div>
  );
}
