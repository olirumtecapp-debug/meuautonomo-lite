import { trpc } from "@/lib/trpc";
import { COOKIE_NAME, UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { startLogin } from "./const";
import "./index.css";

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(error => {
      console.warn("[PWA] Service worker registration failed", error);
    });
  });
}

const queryClient = new QueryClient();

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  const lastRedirect = sessionStorage.getItem("last_auth_redirect");
  const now = Date.now();
  if (lastRedirect && now - parseInt(lastRedirect, 10) < 4000) {
    console.warn("[Auth] Redirect loop detected, throttling...");
    return;
  }
  sessionStorage.setItem("last_auth_redirect", now.toString());

  // Não redireciona se já estiver em páginas públicas (landing, perfil público, orçamento público) ou no painel admin
  if (
    window.location.pathname === "/" ||
    window.location.pathname.startsWith("/p/") ||
    window.location.pathname.startsWith("/orcamento/") ||
    window.location.pathname.startsWith("/r/") ||
    window.location.pathname.startsWith("/admin")
  ) {
    return;
  }

  startLogin();
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      headers() {
        // Preview auto-login fallback: when the browser blocks iframe cookies
        // (Safari ITP / private browsing / WebView), the runtime mirrors the
        // session into sessionStorage so we can forward it as a Bearer token.
        // The regular OAuth cookie flow keeps working and takes priority server-side.
        try {
          const raw =
            localStorage.getItem("manus-token") ||
            sessionStorage.getItem("manus-token") ||
            sessionStorage.getItem("manus-cookie");

          if (raw) {
            const prefix = `${COOKIE_NAME}=`;
            let token = raw;
            if (raw.includes(prefix)) {
              const pair = raw.split(";").find(s => s.trim().startsWith(prefix));
              token = pair ? pair.trim().slice(prefix.length) : raw;
            }
            token = token.trim();
            if (token) {
              return { Authorization: `Bearer ${token}` };
            }
          }
        } catch {
          // storage unavailable
        }
        return {};
      },
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
