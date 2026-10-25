import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import AdminPage from "./pages/Admin";
import VideoDemoPage from "./pages/VideoDemoPage";
import PlansPage from "./pages/PlansPage";
import ValidateReceiptPage from "./pages/ValidateReceipt";
import { AppHome } from "./pages/Workspace";
import { PublicProfile } from "./pages/PublicProfile";
import { PublicQuote } from "./pages/PublicQuote";

function AuthenticatedRoute() {
  return <AppHome />;
}

function QuoteRoute({ params }: { params: { token: string } }) {
  return <PublicQuote token={params.token} />;
}

function ProfileRoute({ params }: { params: { slug: string } }) {
  return <PublicProfile slug={params.slug} />;
}

function ReferralRoute({ params }: { params: { code: string } }) {
  useEffect(() => {
    if (params.code) {
      const cleanCode = params.code.trim().toUpperCase();
      try {
        localStorage.setItem("meuautonomo_referral_code", cleanCode);
      } catch (e) {}
    }
    window.location.href = "/?ref=" + encodeURIComponent(params.code || "");
  }, [params.code]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f7f2]">
      <div className="text-center p-6">
        <div className="w-12 h-12 border-4 border-[#173a34] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="font-semibold text-[#173a34]">Processando seu convite...</p>
      </div>
    </div>
  );
}

function Router() {
  return <Switch>
    <Route path="/" component={Home} />
    <Route path="/admin" component={AdminPage} />
    <Route path="/demo" component={VideoDemoPage} />
    <Route path="/video" component={VideoDemoPage} />
    <Route path="/planos" component={PlansPage} />
    <Route path="/app" component={AuthenticatedRoute} />
    <Route path="/meu-dia" component={AuthenticatedRoute} />
    <Route path="/agenda" component={AuthenticatedRoute} />
    <Route path="/clientes" component={AuthenticatedRoute} />
    <Route path="/servicos" component={AuthenticatedRoute} />
    <Route path="/equipe" component={AuthenticatedRoute} />
    <Route path="/solicitacoes" component={AuthenticatedRoute} />
    <Route path="/orcamentos" component={AuthenticatedRoute} />
    <Route path="/financeiro" component={AuthenticatedRoute} />
    <Route path="/relatorios" component={AuthenticatedRoute} />
    <Route path="/cartao" component={AuthenticatedRoute} />
    <Route path="/tutorial" component={AuthenticatedRoute} />
    <Route path="/guia" component={AuthenticatedRoute} />
    <Route path="/configuracoes" component={AuthenticatedRoute} />
    <Route path="/orcamento/:token" component={QuoteRoute} />
    <Route path="/r/:code" component={ReferralRoute} />
    <Route path="/validar-recibo" component={() => <ValidateReceiptPage />} />
    <Route path="/validar-recibo/:code" component={({ params }) => <ValidateReceiptPage codeFromRoute={params.code} />} />
    <Route path="/p/:slug" component={ProfileRoute} />
    <Route path="/:slug" component={ProfileRoute} />
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch>;
}

export default function App() {
  return <ErrorBoundary>
    <ThemeProvider defaultTheme="light" switchable>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </ThemeProvider>
  </ErrorBoundary>;
}
