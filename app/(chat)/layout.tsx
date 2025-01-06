import { SidebarProvider } from '@/components/ui/sidebar';
import Script from 'next/script';
import { VisualizationWindow } from '@/components/visualization-window';

export const experimental_ppr = true;

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
        strategy="beforeInteractive"
      />
      <SidebarProvider defaultOpen={false}>
        <div className="flex flex-row gap-6 px-6 py-4 h-dvh w-screen bg-background">
          <div className="w-1/2 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden shadow-sm">
            {children}
          </div>
          <div className="w-1/2 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden shadow-sm">
            <VisualizationWindow />
          </div>
        </div>
      </SidebarProvider>
    </>
  );
}