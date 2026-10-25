import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { formatBrl } from "@/utils/currency";
import { checkServiceSpelling } from "@/utils/serviceSpellcheck";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Loader2,
  MapPin,
  Paperclip,
  RefreshCcw,
  Send,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const money = (cents = 0) => formatBrl(cents);

const formatPhone = (val: string = "") => {
  if (!val) return "";
  const clean = val.replace(/\D/g, "");
  if (clean.length <= 10) {
    return clean.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "");
  }
  return clean.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "");
};

const modalityLabel: Record<string, string> = {
  presencial: "No seu espaço",
  endereco: "No endereço do cliente",
  online: "Online",
  hibrido: "Híbrido",
};

function LoadingScreen() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#f5f7f2]">
      <div className="flex items-center gap-3 text-[#58716b]">
        <RefreshCcw className="h-5 w-5 animate-spin" /> Carregando seu espaço.
      </div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: typeof BriefcaseBusiness;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="grid place-items-center rounded-[24px] border border-dashed border-[#cddbcf] bg-white/60 px-6 py-16 text-center">
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[#eef5d2] text-[#829a14]">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-bold text-[#173a34]">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-[#78908a]">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <Label className="mb-2 block">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function FormSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Selecionar",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  const internalValue = !value || value === "" ? "__empty__" : value;
  const normalizedOptions = options.map((opt) => ({
    ...opt,
    internalValue: opt.value === "" ? "__empty__" : opt.value,
  }));

  return (
    <div>
      <Label className="mb-2 block">{label}</Label>
      <Select
        value={internalValue}
        onValueChange={(val) => {
          onChange(val === "__empty__" ? "" : val);
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {normalizedOptions.map((opt) => (
            <SelectItem key={opt.internalValue} value={opt.internalValue}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function PublicProfile({ slug }: { slug: string }) {
  // Pré-carregamento instantâneo vindo do SSR/Edge da Vercel (carregamento imediato no WhatsApp)
  const preloaded = typeof window !== "undefined" ? (window as any).__PRELOADED_PROFILE__ : null;
  const initialData =
    preloaded && preloaded.slug === slug
      ? { profile: preloaded, services: [] }
      : undefined;

  const query = trpc.publicProfile.bySlug.useQuery(
    { slug },
    {
      initialData,
      staleTime: 30_000,
    }
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    requesterName: "",
    requesterPhone: "",
    requesterEmail: "",
    serviceId: "",
    description: "",
    address: "",
    desiredAt: "",
    preferredTime: "",
  });
  const [files, setFiles] = useState<File[]>([]);

  const create = trpc.request.createPublic.useMutation({
    onSuccess: () => {
      toast.success("Solicitação enviada com sucesso!");
      setSent(true);
    },
    onError: (err) => {
      toast.error(err.message || "Não foi possível enviar a solicitação. Verifique os dados.");
    },
  });

  // Atualiza dinamicamente o título da aba do navegador para o nome do profissional
  useEffect(() => {
    if (query.data?.profile?.displayName) {
      const prof = query.data.profile;
      document.title = `${prof.displayName} — ${prof.professionName || "Cartão Profissional"}`;
    }
    return () => {
      document.title = "MeuAutônomo — Seu trabalho. Mais leve.";
    };
  }, [query.data?.profile?.displayName, query.data?.profile?.professionName]);

  if (query.isLoading) return <LoadingScreen />;
  if (!query.data)
    return (
      <div className="grid min-h-screen place-items-center bg-[#f5f7f2] text-[#58716b]">
        Profissional não encontrado.
      </div>
    );

  const { profile, services } = query.data;

  const submit = async () => {
    const cleanName = form.requesterName.trim();
    const cleanPhone = form.requesterPhone.trim();
    const cleanDesc = form.description.trim();

    if (!cleanName) {
      return toast.error("Por favor, informe seu nome.");
    }
    if (!cleanPhone) {
      return toast.error("Por favor, informe seu WhatsApp ou telefone de contato.");
    }
    if (cleanPhone.replace(/\D/g, "").length < 8 && cleanPhone.length < 8) {
      return toast.error("Informe um número de telefone ou WhatsApp válido com DDD.");
    }
    if (!cleanDesc) {
      return toast.error("Por favor, conte o que você precisa.");
    }

    const cleanEmail = form.requesterEmail.trim();
    if (cleanEmail && !cleanEmail.includes("@")) {
      return toast.error("Informe um e-mail válido ou deixe o campo em branco.");
    }

    setIsSubmitting(true);
    try {
      let attachments: any[] = [];
      if (files.length > 0) {
        try {
          attachments = await Promise.all(
            files.map(
              (file) =>
                new Promise<any>((resolve) => {
                  const reader = new FileReader();
                  reader.onload = () =>
                    resolve({
                      name: file.name,
                      mimeType: file.type || "application/octet-stream",
                      size: file.size,
                      dataUrl: String(reader.result),
                    });
                  reader.onerror = () => resolve(null);
                  reader.readAsDataURL(file);
                })
            )
          );
          attachments = attachments.filter(Boolean);
        } catch (e) {
          console.warn("Erro ao ler anexos:", e);
          attachments = [];
        }
      }

      const spellDesc = checkServiceSpelling(cleanDesc);
      const finalDescription = spellDesc?.hasCorrection ? spellDesc.correctedText : cleanDesc;

      let safeDesiredAt: string | undefined = undefined;
      if (form.desiredAt && form.desiredAt.trim()) {
        try {
          const d = new Date(form.desiredAt);
          if (!isNaN(d.getTime())) {
            safeDesiredAt = d.toISOString();
          }
        } catch {
          safeDesiredAt = undefined;
        }
      }

      await create.mutateAsync({
        slug,
        requesterName: cleanName,
        requesterPhone: cleanPhone,
        requesterEmail: cleanEmail || undefined,
        serviceId: form.serviceId ? Number(form.serviceId) : undefined,
        description: finalDescription,
        address: form.address.trim() || undefined,
        desiredAt: safeDesiredAt,
        preferredTime: form.preferredTime.trim() || undefined,
        attachments,
      });
    } catch (err: any) {
      console.error("Erro no envio da solicitação:", err);
      toast.error(err?.message || "Não foi possível enviar a solicitação. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7f2]">
      {/* Topo personalizado com foco total no profissional */}
      <header className="border-b border-[#dce5dc] bg-white sticky top-0 z-30 shadow-xs">
        <div className="container flex h-16 sm:h-20 items-center justify-between py-2">
          {/* Identidade em destaque: Foto, Nome e Especialidade do Autônomo */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="grid h-10 w-10 sm:h-12 sm:w-12 place-items-center rounded-xl sm:rounded-2xl bg-[#173a34] text-white font-extrabold text-base sm:text-lg shrink-0 overflow-hidden shadow-xs">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                profile.displayName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <h2 className="font-extrabold text-sm sm:text-base text-[#173a34] truncate leading-tight">
                {profile.displayName}
              </h2>
              <p className="text-xs text-[#628076] truncate font-medium">
                {profile.professionName || "Cartão Profissional"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-[#305e50] bg-[#eef7f0] border border-[#cbe4d1] px-2.5 py-1 rounded-full">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#2d7d54]" /> Oficial
            </span>
            <div
              className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity"
              title="MeuAutônomo"
            >
              <img
                src="/logo.png"
                alt="MeuAutônomo"
                className="h-5 sm:h-6 w-auto object-contain"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-5xl py-8 md:py-14">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <Card className="overflow-hidden rounded-[28px] border-0 bg-[#173a34] text-white shadow-[0_18px_55px_rgba(19,42,39,0.16)]">
            <CardContent className="p-7 sm:p-10">
              <div className="grid h-20 w-20 place-items-center rounded-[24px] bg-[#d9f56a] text-3xl font-bold text-[#173a34]">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.displayName}
                    className="h-full w-full rounded-[24px] object-cover"
                  />
                ) : (
                  profile.displayName.charAt(0).toUpperCase()
                )}
              </div>
              <h1 className="mt-6 text-3xl font-bold tracking-tight">
                {profile.displayName}
              </h1>
              <p className="mt-2 text-xl text-[#d9f56a]">{profile.professionName}</p>
              <p className="mt-6 text-sm leading-7 text-white/70">
                {profile.bio || "Profissional autônomo pronto para ajudar você."}
              </p>
              <div className="mt-8 space-y-3 text-sm text-white/70">
                {profile.serviceRegion && (
                  <p>
                    <MapPin className="mr-2 inline h-4 w-4 text-[#d9f56a]" />
                    Atende em {profile.serviceRegion}
                  </p>
                )}
                {profile.whatsapp && (
                  <p>
                    <Share2 className="mr-2 inline h-4 w-4 text-[#d9f56a]" />
                    {formatPhone(profile.whatsapp)}
                  </p>
                )}
              </div>
              <Button
                onClick={() => setOpen(true)}
                className="mt-8 h-12 w-full rounded-xl bg-[#d9f56a] text-[#173a34] hover:bg-[#e8ff8e]"
              >
                Solicitar serviço <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              {profile.whatsapp && (
                <Button
                  variant="outline"
                  onClick={() =>
                    window.open(
                      `https://wa.me/${profile.whatsapp?.replace(/\D/g, "")}`,
                      "_blank"
                    )
                  }
                  className="mt-3 h-12 w-full rounded-xl border-white/20 bg-transparent text-white hover:bg-white/10"
                >
                  Falar pelo WhatsApp
                </Button>
              )}
            </CardContent>
          </Card>

          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#8aa500]">
              Serviços
            </p>
            <h2 className="mb-6 text-2xl font-bold text-[#173a34]">Como posso ajudar?</h2>
            <div className="space-y-3">
              {services.length ? (
                services.map((service) => (
                  <Card
                    key={service.id}
                    className="rounded-[22px] border-0 bg-white shadow-[0_8px_26px_rgba(19,42,39,0.04)]"
                  >
                    <CardContent className="flex items-center gap-4 p-5">
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#eef5d2] text-[#819815]">
                        <BriefcaseBusiness className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-[#284b42]">{service.name}</h3>
                        <p className="mt-1 text-sm text-[#82948e]">
                          {service.description || modalityLabel[service.modality]}
                        </p>
                      </div>
                      {profile.showPrices && (
                        <strong className="text-[#173a34]">
                          {money(service.priceCents)}
                        </strong>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <EmptyState
                  icon={BriefcaseBusiness}
                  title="Serviços em atualização"
                  description="Entre em contato para saber mais."
                />
              )}
            </div>
            <p className="mt-8 text-center text-xs text-[#9aa9a3]">
              Ao solicitar, você não precisa criar uma conta.
            </p>
          </div>
        </div>
      </main>

      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen && sent) {
            setSent(false);
            setForm({
              requesterName: "",
              requesterPhone: "",
              requesterEmail: "",
              serviceId: "",
              description: "",
              address: "",
              desiredAt: "",
              preferredTime: "",
            });
            setFiles([]);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[24px]">
          <DialogHeader>
            <DialogTitle>
              {sent ? "Solicitação enviada com sucesso" : "Solicitar serviço"}
            </DialogTitle>
            <DialogDescription>
              {sent
                ? "Obrigado! O profissional recebeu seu pedido com prioridade e entrará em contato com você."
                : `Conte para ${profile.displayName.split(" ")[0]} o que você precisa.`}
            </DialogDescription>
          </DialogHeader>
          {sent ? (
            <div className="py-8 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#e3f3e8] text-[#3e885c]">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <p className="mt-4 font-semibold text-[#173a34]">Pedido recebido!</p>
              <p className="mt-1 text-sm text-[#71867f]">Você já pode fechar esta janela.</p>
              <Button
                onClick={() => {
                  setOpen(false);
                  setSent(false);
                }}
                className="mt-6 rounded-xl bg-[#173a34] text-white px-6"
              >
                Concluir
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 py-3">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Seu nome"
                  value={form.requesterName}
                  onChange={(value) => setForm({ ...form, requesterName: value })}
                />
                <Field
                  label="WhatsApp ou telefone"
                  value={form.requesterPhone}
                  onChange={(value) => setForm({ ...form, requesterPhone: value })}
                />
              </div>
              <Field
                label="E-mail (opcional)"
                value={form.requesterEmail}
                onChange={(value) => setForm({ ...form, requesterEmail: value })}
              />
              <FormSelect
                label="Serviço desejado"
                value={form.serviceId}
                onChange={(value) => setForm({ ...form, serviceId: value })}
                placeholder="Ainda não sei / Outro serviço"
                options={[
                  { value: "", label: "Ainda não sei / Outro serviço" },
                  ...services.map((s) => ({ value: String(s.id), label: s.name })),
                ]}
              />
              <div>
                <Label className="mb-2 block">O que você precisa?</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Descreva o serviço, medidas, contexto…"
                  className="min-h-28"
                />
              </div>
              <Field
                label="Endereço (se necessário)"
                value={form.address}
                onChange={(value) => setForm({ ...form, address: value })}
              />
              <div>
                <Label className="mb-2 block">
                  Fotos ou anexos{" "}
                  <span className="font-normal text-[#9bad9a]">
                    (até 3 arquivos de 5 MB)
                  </span>
                </Label>
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  multiple
                  onChange={(event) => {
                    const selected = Array.from(event.target.files || [])
                      .filter((file) => file.size <= 5_000_000)
                      .slice(0, 3);
                    setFiles(selected);
                  }}
                  className="rounded-xl border-[#dce5dc] bg-[#fbfcf9]"
                />
                {files.length > 0 && (
                  <p className="mt-2 text-xs text-[#82948e]">
                    <Paperclip className="mr-1 inline h-3.5 w-3.5" />
                    {files.length} arquivo(s) selecionado(s)
                  </p>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="mb-2 block">Data desejada</Label>
                  <Input
                    type="date"
                    value={form.desiredAt}
                    onChange={(e) => setForm({ ...form, desiredAt: e.target.value })}
                  />
                </div>
                <Field
                  label="Horário preferencial"
                  value={form.preferredTime}
                  onChange={(value) => setForm({ ...form, preferredTime: value })}
                  placeholder="Ex.: à tarde"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            {!sent && (
              <Button
                onClick={submit}
                disabled={create.isPending || isSubmitting}
                className="rounded-xl bg-[#173a34] text-white hover:bg-[#28564d] cursor-pointer"
              >
                {create.isPending || isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando
                    solicitação...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" /> Enviar solicitação
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
export default PublicProfile;
