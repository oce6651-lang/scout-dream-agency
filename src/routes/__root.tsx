import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
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
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-zinc-100">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold">404</h1>
        <p className="mt-4 text-sm text-zinc-500">Página não encontrada.</p>
        <a href="/" className="mt-6 inline-flex rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-zinc-950">
          Voltar ao menu
        </a>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-zinc-100">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Algo deu errado</h1>
        <p className="mt-2 text-sm text-zinc-500">Tente novamente ou volte ao menu.</p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-zinc-950"
          >
            Tentar de novo
          </button>
          <a href="/" className="rounded-lg border border-white/10 px-4 py-2 text-sm">Menu</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Sua carreira de empresário de futebol" },
      { name: "description", content: "Construa sua agência de futebol do zero. Descubra jovens talentos, feche contratos e ganhe prestígio mundial." },
      { name: "theme-color", content: "#09090b" },
      { property: "og:title", content: "Sua carreira de empresário de futebol" },
      { property: "og:description", content: "Construa sua agência de futebol do zero. Descubra jovens talentos, feche contratos e ganhe prestígio mundial." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Sua carreira de empresário de futebol" },
      { name: "twitter:description", content: "Construa sua agência de futebol do zero. Descubra jovens talentos, feche contratos e ganhe prestígio mundial." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/be5946da-76a6-44d0-8d8b-d1e14ee623cf/id-preview-b702a1d9--f6789aaf-4967-426b-8e63-970f799725c9.lovable.app-1784746854738.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/be5946da-76a6-44d0-8d8b-d1e14ee623cf/id-preview-b702a1d9--f6789aaf-4967-426b-8e63-970f799725c9.lovable.app-1784746854738.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap" },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body className="bg-zinc-950 text-zinc-100">
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
