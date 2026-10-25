import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LogIn,
  Mail,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  User,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "register" | "login" | "forgot";
}

export function AuthModal({ open, onOpenChange, defaultTab = "register" }: AuthModalProps) {
  const [tab, setTab] = useState<"register" | "login" | "forgot">(defaultTab);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTab(defaultTab);
      setErrorMessage(null);
    }
  }, [open, defaultTab]);

  // Formulário de Cadastro
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Formulário de Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Formulário de Recuperação de Senha
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotCode, setForgotCode] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1); // 1 = pedir e-mail, 2 = digitar código e nova senha

  const utils = trpc.useUtils();

  const handleTabChange = (newTab: "register" | "login" | "forgot") => {
    setTab(newTab);
    setErrorMessage(null);
    if (newTab === "forgot") {
      setForgotStep(1);
      if (loginEmail) setForgotEmail(loginEmail);
    }
  };

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      setErrorMessage(null);
      if (data.sessionToken) {
        try {
          localStorage.setItem("manus-token", data.sessionToken);
          sessionStorage.setItem("manus-token", data.sessionToken);
        } catch (e) {}
      }
      utils.auth.me.setData(undefined, data.user);
      toast.success("Conta criada com sucesso! Redirecionando para seu espaço...");
      onOpenChange(false);
      window.location.href = "/app";
    },
    onError: (err) => {
      const msg = err.message || "Não foi possível criar sua conta. Verifique os dados.";
      setErrorMessage(msg);
      toast.error(msg);
    },
  });

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      setErrorMessage(null);
      if (data.sessionToken) {
        try {
          localStorage.setItem("manus-token", data.sessionToken);
          sessionStorage.setItem("manus-token", data.sessionToken);
        } catch (e) {}
      }
      utils.auth.me.setData(undefined, data.user);
      toast.success("Login realizado com sucesso! Redirecionando...");
      onOpenChange(false);
      window.location.href = "/app";
    },
    onError: (err) => {
      const msg = err.message || "E-mail ou senha incorretos. Verifique e tente novamente.";
      setErrorMessage(msg);
      toast.error(msg);
    },
  });

  const requestResetMutation = trpc.auth.requestPasswordReset.useMutation({
    onSuccess: (data) => {
      toast.success(data.message || "Código enviado para seu e-mail!");
      setForgotStep(2);
      setErrorMessage(null);
    },
    onError: (err) => {
      const msg = err.message || "Erro ao solicitar recuperação de senha.";
      setErrorMessage(msg);
      toast.error(msg);
    },
  });

  const resetPasswordMutation = trpc.auth.resetPasswordWithCode.useMutation({
    onSuccess: (data) => {
      toast.success("Senha alterada com sucesso! Conectando...");
      if (data.sessionToken) {
        try {
          localStorage.setItem("manus-token", data.sessionToken);
          sessionStorage.setItem("manus-token", data.sessionToken);
        } catch (e) {}
      }
      utils.auth.me.setData(undefined, data.user);
      onOpenChange(false);
      window.location.href = "/app";
    },
    onError: (err) => {
      const msg = err.message || "Erro ao redefinir senha. Verifique o código.";
      setErrorMessage(msg);
      toast.error(msg);
    },
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = regName.trim();
    const trimmedEmail = regEmail.trim();

    if (!trimmedName || trimmedName.length < 2) {
      const msg = "Informe seu nome completo ou profissional (mínimo 2 caracteres).";
      setErrorMessage(msg);
      return toast.error(msg);
    }
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      const msg = "Informe um e-mail válido.";
      setErrorMessage(msg);
      return toast.error(msg);
    }
    if (regPassword.length < 6) {
      const msg = "A senha deve ter pelo menos 6 caracteres.";
      setErrorMessage(msg);
      return toast.error(msg);
    }

    registerMutation.mutate({
      name: trimmedName,
      email: trimmedEmail,
      password: regPassword,
    });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = loginEmail.trim();

    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      const msg = "Informe seu e-mail cadastrado.";
      setErrorMessage(msg);
      return toast.error(msg);
    }
    if (!loginPassword) {
      const msg = "Informe sua senha de acesso.";
      setErrorMessage(msg);
      return toast.error(msg);
    }

    loginMutation.mutate({
      email: trimmedEmail,
      password: loginPassword,
    });
  };

  const handleRequestReset = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmed = forgotEmail.trim();
    if (!trimmed || !trimmed.includes("@")) {
      const msg = "Informe um e-mail válido cadastrado.";
      setErrorMessage(msg);
      return toast.error(msg);
    }

    requestResetMutation.mutate({ email: trimmed });
  };

  const handleConfirmReset = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmed = forgotEmail.trim();
    const code = forgotCode.trim();

    if (!code || code.length < 4) {
      const msg = "Informe o código de 6 dígitos recebido por e-mail.";
      setErrorMessage(msg);
      return toast.error(msg);
    }

    if (forgotNewPassword.length < 6) {
      const msg = "A nova senha deve ter pelo menos 6 caracteres.";
      setErrorMessage(msg);
      return toast.error(msg);
    }

    resetPasswordMutation.mutate({
      email: trimmed,
      code,
      newPassword: forgotNewPassword,
    });
  };

  const isSubmitting =
    registerMutation.isPending ||
    loginMutation.isPending ||
    requestResetMutation.isPending ||
    resetPasswordMutation.isPending;

  const whatsappDevUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(
    "Olá! Estou com dificuldades para acessar minha conta no MeuAutônomo e gostaria de suporte com a equipe CreativeAM."
  )}`;

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!isSubmitting) {
          setErrorMessage(null);
          onOpenChange(val);
        }
      }}
    >
      <DialogContent className="max-h-[95vh] w-[95vw] max-w-lg overflow-y-auto rounded-[28px] border-0 bg-white p-4 shadow-[0_25px_70px_rgba(19,42,39,0.18)] sm:p-8">
        <DialogHeader className="text-center sm:text-left">
          <div className="flex items-center justify-between">
            <img src="/logo.png" alt="MeuAutônomo" className="h-10 w-auto object-contain" />
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#f1f7dd] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#6e8313]">
              <Sparkles className="h-3 w-3 text-[#8aa500]" /> Acesso
            </div>
          </div>
          <DialogTitle className="mt-4 text-2xl font-bold tracking-tight text-[#173a34] sm:text-3xl">
            {tab === "register"
              ? "Crie sua conta profissional"
              : tab === "login"
              ? "Acesse seu espaço"
              : "Recuperar sua senha"}
          </DialogTitle>
          <DialogDescription className="text-sm text-[#627b72]">
            {tab === "register"
              ? "Cadastre-se para começar a organizar atendimentos, clientes e orçamentos."
              : tab === "login"
              ? "Entre com seu e-mail e senha cadastrados para acessar seu painel."
              : "Informe seu e-mail para receber as instruções e o código de recuperação."}
          </DialogDescription>
        </DialogHeader>

        {/* Abas Alternáveis */}
        {tab !== "forgot" && (
          <div className="mt-4 grid grid-cols-2 rounded-2xl bg-[#f5f7f2] p-1.5 text-xs sm:text-sm font-semibold">
            <button
              type="button"
              onClick={() => handleTabChange("register")}
              className={cn(
                "flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl py-2 sm:py-2.5 transition truncate",
                tab === "register"
                  ? "bg-[#173a34] text-white shadow-sm"
                  : "text-[#5b736b] hover:text-[#173a34]"
              )}
            >
              <UserPlus className="h-4 w-4 shrink-0" /> <span className="truncate">Criar Conta</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("login")}
              className={cn(
                "flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl py-2 sm:py-2.5 transition truncate",
                tab === "login"
                  ? "bg-[#173a34] text-white shadow-sm"
                  : "text-[#5b736b] hover:text-[#173a34]"
              )}
            >
              <LogIn className="h-4 w-4" /> Entrar
            </button>
          </div>
        )}

        {/* Mensagem de Erro Inline Clara e Visível */}
        {errorMessage && (
          <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            <div className="flex-1 leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* Formulário: Criar Conta */}
        {tab === "register" && (
          <form onSubmit={handleRegister} className="mt-5 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-[#38584f]">
                Seu Nome ou Nome do Negócio
              </Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#92a39d]" />
                <Input
                  value={regName}
                  onChange={(e) => {
                    setRegName(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Ex.: Carlos Ferreira ou Studio Bella"
                  spellCheck={true}
                  lang="pt-BR"
                  className="h-12 rounded-xl border-[#dce5dc] bg-[#fbfcf9] pl-10 text-sm focus:border-[#173a34]"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-[#38584f]">
                Seu E-mail
              </Label>
              <Input
                type="email"
                value={regEmail}
                onChange={(e) => {
                  setRegEmail(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="seuemail@exemplo.com.br"
                className="h-12 rounded-xl border-[#dce5dc] bg-[#fbfcf9] text-sm focus:border-[#173a34]"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-[#38584f]">
                Crie uma Senha
              </Label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#92a39d]" />
                <Input
                  type={showRegPassword ? "text" : "password"}
                  value={regPassword}
                  onChange={(e) => {
                    setRegPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Mínimo 6 caracteres"
                  className="h-12 rounded-xl border-[#dce5dc] bg-[#fbfcf9] pl-10 pr-11 text-sm focus:border-[#173a34]"
                  disabled={isSubmitting}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#92a39d] hover:text-[#173a34] transition cursor-pointer p-1"
                  tabIndex={-1}
                  aria-label={showRegPassword ? "Ocultar senha" : "Ver senha"}
                  title={showRegPassword ? "Ocultar senha" : "Ver senha"}
                >
                  {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4 text-[#71867f]" />}
                </button>
              </div>
            </div>

            <div className="rounded-xl bg-[#f4f7f1] p-3 text-xs text-[#59746c] flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#8aa500] shrink-0" />
              Ao criar a conta, você configurará sua profissão, serviços e horários no assistente guiado.
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-12 w-full rounded-xl bg-[#173a34] text-base font-bold text-white hover:bg-[#28564d]"
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Criando sua conta...
                </>
              ) : (
                <>
                  Criar minha conta e começar <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        )}

        {/* Formulário: Entrar */}
        {tab === "login" && (
          <form onSubmit={handleLogin} className="mt-5 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-[#38584f]">
                Seu E-mail
              </Label>
              <Input
                type="email"
                value={loginEmail}
                onChange={(e) => {
                  setLoginEmail(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="seuemail@exemplo.com.br"
                className="h-12 rounded-xl border-[#dce5dc] bg-[#fbfcf9] text-sm focus:border-[#173a34]"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase tracking-wider text-[#38584f]">
                  Sua Senha
                </Label>
                <button
                  type="button"
                  onClick={() => handleTabChange("forgot")}
                  className="text-xs font-semibold text-[#8aa500] hover:text-[#173a34] hover:underline cursor-pointer transition"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#92a39d]" />
                <Input
                  type={showLoginPassword ? "text" : "password"}
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Sua senha de acesso"
                  className="h-12 rounded-xl border-[#dce5dc] bg-[#fbfcf9] pl-10 pr-11 text-sm focus:border-[#173a34]"
                  disabled={isSubmitting}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#92a39d] hover:text-[#173a34] transition cursor-pointer p-1"
                  tabIndex={-1}
                  aria-label={showLoginPassword ? "Ocultar senha" : "Ver senha"}
                  title={showLoginPassword ? "Ocultar senha" : "Ver senha"}
                >
                  {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4 text-[#71867f]" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-12 w-full rounded-xl bg-[#173a34] text-base font-bold text-white hover:bg-[#28564d]"
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Entrando...
                </>
              ) : (
                <>
                  Entrar no meu espaço <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        )}

        {/* Formulário: Recuperar Senha */}
        {tab === "forgot" && (
          <div className="mt-4 space-y-4">
            <button
              type="button"
              onClick={() => handleTabChange("login")}
              className="inline-flex items-center text-xs font-semibold text-[#5b736b] hover:text-[#173a34] transition cursor-pointer mb-2"
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Voltar para o login
            </button>

            {forgotStep === 1 ? (
              <form onSubmit={handleRequestReset} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-[#38584f]">
                    E-mail da sua conta
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#92a39d]" />
                    <Input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => {
                        setForgotEmail(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      placeholder="Digite seu e-mail cadastrado"
                      className="h-12 rounded-xl border-[#dce5dc] bg-[#fbfcf9] pl-10 text-sm focus:border-[#173a34]"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  <p className="text-[11px] text-[#71867f]">
                    Enviaremos um código de 6 dígitos com validade de 20 minutos para você redefinir sua senha com segurança.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 w-full rounded-xl bg-[#173a34] text-sm font-bold text-white hover:bg-[#28564d]"
                >
                  {requestResetMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando código...
                    </>
                  ) : (
                    <>
                      Enviar Código de Recuperação <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleConfirmReset} className="space-y-4">
                <div className="rounded-xl bg-[#eef7ee] border border-[#cbe4d1] p-3 text-xs text-[#2d6e49]">
                  Código enviado para <strong>{forgotEmail}</strong>. Verifique sua caixa de entrada ou spam.
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-[#38584f]">
                    Código de 6 Dígitos
                  </Label>
                  <Input
                    type="text"
                    value={forgotCode}
                    onChange={(e) => {
                      setForgotCode(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Ex: 123456"
                    maxLength={8}
                    className="h-12 rounded-xl border-[#dce5dc] bg-[#fbfcf9] text-center text-lg font-mono tracking-widest font-bold text-[#173a34] focus:border-[#173a34]"
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-[#38584f]">
                    Nova Senha
                  </Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#92a39d]" />
                    <Input
                      type={showForgotNewPassword ? "text" : "password"}
                      value={forgotNewPassword}
                      onChange={(e) => {
                        setForgotNewPassword(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      placeholder="Mínimo 6 caracteres"
                      className="h-12 rounded-xl border-[#dce5dc] bg-[#fbfcf9] pl-10 pr-11 text-sm focus:border-[#173a34]"
                      disabled={isSubmitting}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#92a39d] hover:text-[#173a34] transition cursor-pointer p-1"
                      tabIndex={-1}
                      aria-label={showForgotNewPassword ? "Ocultar senha" : "Ver senha"}
                    >
                      {showForgotNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4 text-[#71867f]" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 w-full rounded-xl bg-[#173a34] text-sm font-bold text-white hover:bg-[#28564d]"
                >
                  {resetPasswordMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando nova senha...
                    </>
                  ) : (
                    <>
                      Redefinir Senha e Entrar <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => setForgotStep(1)}
                  className="w-full text-center text-xs font-semibold text-[#71867f] hover:text-[#173a34] transition pt-1 cursor-pointer"
                >
                  Reenviar código para outro e-mail
                </button>
              </form>
            )}

            {/* Suporte Direto com o Desenvolvedor */}
            <div className="pt-3 border-t border-[#edf1eb]">
              <div className="rounded-2xl bg-[#f7faf5] p-3 text-xs text-[#527065] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-[#25d366] shrink-0" />
                  <span>Dificuldade para acessar?</span>
                </div>
                <a
                  href={whatsappDevUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-[#173a34] hover:text-[#8aa500] hover:underline shrink-0"
                >
                  Falar no WhatsApp →
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Rodapé Oficial: Criado por CreativeAM */}
        <div className="mt-5 pt-3 border-t border-[#edf1eb] text-center">
          <p className="text-[11px] text-[#8fa099]">
            Desenvolvido com excelência por <strong className="text-[#59746c]">CreativeAM</strong>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
