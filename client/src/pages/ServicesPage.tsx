import React, { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatBrlInput, parseBrlToCents } from "@/utils/currency";
import { checkServiceSpelling } from "@/utils/serviceSpellcheck";
import {
  SERVICE_CATALOG,
  getRecommendedServicesForProfession,
  getServicePlaceholderForProfession,
} from "@/data/servicesCatalog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  BriefcaseBusiness,
  Clock3,
  Pencil,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";
import {
  Page,
  HelpButton,
  Field,
  FormSelect,
  EmptyState,
  StatusBadge,
  ServiceNameField,
  money,
  modalityLabel,
} from "./Workspace";

export function CatalogPicker({
  onSelect,
}: {
  onSelect: (
    name: string,
    description: string,
    price?: string,
    duration?: string
  ) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const close = () => {
    setOpen(false);
    setSelected(null);
    setSearch("");
  };

  const filtered = SERVICE_CATALOG.filter(
    (p) =>
      p.label.toLowerCase().includes(search.toLowerCase()) ||
      p.services.some((s) => s.name.toLowerCase().includes(search.toLowerCase()))
  );

  const profession = SERVICE_CATALOG.find((p) => p.id === selected);

  const subServices =
    profession?.services.filter(
      (s) =>
        !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        profession.label.toLowerCase().includes(search.toLowerCase())
    ) ?? [];

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="h-11 rounded-xl border-[#dce5dc] bg-white text-[#4c6960] hover:bg-[#f5f8f2]"
      >
        <BookOpen className="mr-2 h-4 w-4" /> Usar catálogo
      </Button>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v) close();
          else setOpen(true);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[24px] sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-[#173a34]">
              Catálogo de serviços sugeridos
            </DialogTitle>
            <DialogDescription>
              Escolha uma profissão para carregar serviços prontos ou cadastre um
              serviço do seu jeito.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9bad9a]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar profissão ou serviço (ex: encanador, pintura...)"
                className="h-10 w-full rounded-xl border border-[#dce5dc] bg-[#f5f8f2] pl-9 pr-4 text-sm text-[#284b42] outline-none focus:border-[#8aa500]"
              />
            </div>

            {search.trim().length > 0 && (
              <div className="flex items-center justify-between rounded-xl bg-[#f0f7ea] px-3.5 py-2.5 text-xs text-[#3d5e4b] border border-[#d2e4c4]">
                <span>Não achou na lista o que precisa?</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs font-semibold text-[#6d8315] hover:bg-[#e4eed7]"
                  onClick={() => {
                    onSelect(search.trim(), "", "", "");
                    close();
                  }}
                >
                  <Plus className="mr-1 h-3.5 w-3.5" /> Criar "{search.trim()}"
                </Button>
              </div>
            )}

            {!selected ? (
              <>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {filtered.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelected(p.id)}
                      className="flex flex-col items-center gap-1 rounded-2xl border border-[#dce5dc] bg-white p-4 text-center transition hover:border-[#8aa500] hover:bg-[#f5f8f2]"
                    >
                      <span className="text-2xl">{p.emoji}</span>
                      <span className="text-xs font-semibold text-[#284b42]">
                        {p.label}
                      </span>
                    </button>
                  ))}
                </div>
                {filtered.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-[#dce5dc] p-6 text-center">
                    <p className="text-sm text-[#82948e]">
                      Nenhuma profissão correspondente encontrada.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-3 h-9 rounded-xl border-[#8aa500] text-sm text-[#8aa500] hover:bg-[#f5f8f2]"
                      onClick={() => {
                        onSelect(search, "", "", "");
                        close();
                      }}
                    >
                      <Plus className="mr-1.5 h-4 w-4" /> Cadastrar "{search}"
                      manualmente
                    </Button>
                  </div>
                )}
                <div className="mt-4 rounded-2xl border border-dashed border-[#dce5dc] bg-[#fdfefd] p-4 text-center">
                  <p className="text-xs text-[#71867f]">
                    Sua área de atuação não está na lista?
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 h-8 rounded-lg border-[#dce5dc] text-xs text-[#284b42]"
                    onClick={() => {
                      onSelect(
                        search || "Serviço personalizado",
                        "",
                        "",
                        ""
                      );
                      close();
                    }}
                  >
                    Cadastrar serviço personalizado
                  </Button>
                </div>
              </>
            ) : (
              <div>
                <div className="mb-3 flex items-center justify-between border-b border-[#edf1eb] pb-2">
                  <button
                    onClick={() => setSelected(null)}
                    className="text-xs font-medium text-[#8aa500] hover:underline"
                  >
                    ← Voltar às profissões
                  </button>
                  <span className="text-sm font-bold text-[#173a34]">
                    {profession?.emoji} {profession?.label}
                  </span>
                </div>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {subServices.map((s) => (
                    <div
                      key={s.name}
                      className="flex items-center justify-between rounded-xl border border-[#edf1eb] p-3 transition hover:border-[#8aa500] hover:bg-[#f5f8f2]"
                    >
                      <div className="min-w-0 pr-3">
                        <p className="text-sm font-semibold text-[#284b42]">
                          {s.name}
                        </p>
                        <p className="text-xs text-[#82948e]">{s.description}</p>
                        <div className="mt-1 flex gap-3 text-xs text-[#5a7369]">
                          <span>
                            Duração sugerida:{" "}
                            <strong>{s.durationMinutes} min</strong>
                          </span>
                          <span>
                            Valor sugerido:{" "}
                            <strong>R$ {s.price}</strong>
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="shrink-0 rounded-lg bg-[#173a34] text-xs text-white hover:bg-[#28564d]"
                        onClick={() => {
                          onSelect(
                            s.name,
                            s.description,
                            s.price,
                            s.durationMinutes
                          );
                          close();
                        }}
                      >
                        Usar este
                      </Button>
                    </div>
                  ))}
                  {subServices.length === 0 && (
                    <p className="py-4 text-center text-xs text-[#82948e]">
                      Nenhum serviço correspondente encontrado para esta busca.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ServiceDialog({
  form,
  setForm,
  submit,
  pending,
  editing,
  professionName,
}: {
  form: any;
  setForm: (form: any) => void;
  submit: () => void;
  pending: boolean;
  editing: boolean;
  professionName?: string;
}) {
  const dynamicPlaceholder = useMemo(
    () => getServicePlaceholderForProfession(professionName || ""),
    [professionName]
  );
  const suggestions = useMemo(
    () => (!professionName ? [] : getRecommendedServicesForProfession(professionName)),
    [professionName]
  );

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[24px]">
      <DialogHeader>
        <DialogTitle>{editing ? "Editar serviço" : "Novo serviço"}</DialogTitle>
        <DialogDescription>
          {professionName
            ? `Cadastrando para ${professionName}. As alterações refletem na agenda e na página pública.`
            : "As alterações refletem na agenda e na página pública."}
        </DialogDescription>
      </DialogHeader>

      {!editing && suggestions.length > 0 && (
        <div className="rounded-2xl border border-[#dce5dc] bg-[#fbfcf9] p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#173a34] flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#708818]" />
              Sugestões para {professionName}
            </span>
            <span className="text-[11px] text-[#71867f]">
              Preenche tudo em 1 toque
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
            {suggestions.map((sug) => {
              const isSelected =
                form.name.trim().toLowerCase() === sug.name.trim().toLowerCase();
              return (
                <button
                  key={sug.name}
                  type="button"
                  onClick={() => {
                    setForm({
                      ...form,
                      name: sug.name,
                      description: sug.description || form.description,
                      price: sug.price || form.price,
                      durationMinutes:
                        sug.durationMinutes || form.durationMinutes,
                    });
                  }}
                  className={cn(
                    "rounded-lg border px-2.5 py-1 text-xs font-medium transition text-left cursor-pointer",
                    isSelected
                      ? "border-[#173a34] bg-[#173a34] text-[#d9f56a] shadow-xs"
                      : "border-[#dce5dc] bg-white text-[#284b42] hover:border-[#173a34] hover:bg-[#f4f7f2]"
                  )}
                  title={sug.description}
                >
                  + {sug.name} {sug.price ? `(R$ ${sug.price})` : ""}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid gap-4 py-3">
        <ServiceNameField
          label="Nome do serviço"
          value={form.name}
          onChange={(value) => setForm({ ...form, name: value })}
          onSelectCatalog={(name, description, price, duration) =>
            setForm({
              ...form,
              name,
              description: description || form.description,
              price: price || form.price,
              durationMinutes: duration || form.durationMinutes,
            })
          }
          professionName={professionName}
          placeholder={dynamicPlaceholder}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Preço"
            prefix="R$ "
            value={form.price}
            onChange={(value) => setForm({ ...form, price: value })}
          />
          <Field
            label="Duração (min)"
            value={form.durationMinutes}
            onChange={(value) => setForm({ ...form, durationMinutes: value })}
          />
        </div>
        <FormSelect
          label="Modalidade"
          value={form.modality}
          onChange={(value) => setForm({ ...form, modality: value })}
          options={Object.entries(modalityLabel).map(([value, label]) => ({
            value,
            label,
          }))}
        />
        <div>
          <Label className="mb-2 block">Descrição</Label>
          <Textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Detalhes ou observações sobre o serviço..."
          />
        </div>
      </div>
      <DialogFooter>
        <Button
          onClick={submit}
          disabled={pending}
          className="rounded-xl bg-[#173a34] text-white"
        >
          {editing ? "Salvar alterações" : "Salvar serviço"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

export function ServicesPage() {
  const services = trpc.service.list.useQuery();
  const profile = trpc.profile.get.useQuery();
  const utils = trpc.useUtils();
  const create = trpc.service.create.useMutation({
    onSuccess: () => {
      toast.success("Serviço salvo.");
      utils.service.list.invalidate();
      setOpen(false);
      reset();
    },
    onError: (err) => {
      toast.error(err.message || "Erro ao criar serviço.");
    },
  });
  const update = trpc.service.update.useMutation({
    onSuccess: () => {
      toast.success("Serviço atualizado.");
      utils.service.list.invalidate();
      setOpen(false);
      reset();
    },
    onError: (err) => {
      toast.error(err.message || "Erro ao atualizar serviço.");
    },
  });
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const empty = {
    name: "",
    description: "",
    durationMinutes: "60",
    price: "",
    modality: "presencial" as "presencial" | "endereco" | "online" | "hibrido",
    active: true,
  };
  const [form, setForm] = useState(empty);
  const reset = () => {
    setForm(empty);
    setEditingId(null);
  };
  const openAdd = () => {
    reset();
    setOpen(true);
  };
  const openEdit = (service: any) => {
    setEditingId(service.id);
    setForm({
      name: service.name,
      description: service.description || "",
      durationMinutes: String(service.durationMinutes),
      price: formatBrlInput(service.priceCents),
      modality: service.modality,
      active: service.active,
    });
    setOpen(true);
  };
  const submit = () => {
    if (!form.name.trim()) return toast.error("Informe o nome do serviço.");
    const dur = Number(form.durationMinutes);
    if (isNaN(dur) || !Number.isInteger(dur) || dur < 15) {
      return toast.error("Duração deve ser um número inteiro de no mínimo 15 minutos.");
    }
    if (dur > 1440) {
      return toast.error("Duração máxima permitida é de 1440 minutos (24 horas).");
    }
    if (form.price && /[a-zA-Z]/.test(form.price)) {
      return toast.error("Preço do serviço contém caracteres inválidos.");
    }
    const priceCents = parseBrlToCents(form.price);
    if (priceCents < 0) {
      return toast.error("Preço do serviço não pode ser negativo.");
    }
    if (priceCents > 100_000_000) {
      return toast.error("Preço máximo permitido é de R$ 1.000.000,00.");
    }

    const spell = checkServiceSpelling(form.name);
    const finalName = spell.hasCorrection ? spell.correctedText : form.name;
    const payload = {
      name: finalName,
      description: form.description || undefined,
      durationMinutes: dur,
      priceCents,
      modality: form.modality,
    };
    if (editingId) update.mutate({ id: editingId, ...payload, active: form.active });
    else create.mutate(payload);
  };
  const toggle = (service: any) =>
    update.mutate({
      id: service.id,
      name: service.name,
      description: service.description || undefined,
      durationMinutes: service.durationMinutes,
      priceCents: service.priceCents,
      modality: service.modality,
      active: !service.active,
    });

  return (
    <Page
      title="Meus serviços"
      eyebrow="O que você oferece"
      description="Mantenha seu catálogo pronto para a agenda e para a página pública."
      help={
        <HelpButton title="Como funciona Serviços?">
          <p>
            <strong>Serviços</strong> é o catálogo do que você oferece. Cada
            serviço tem nome, preço, duração e modalidade.
          </p>
          <p>
            <strong>Modalidades:</strong> Presencial (no seu local), no endereço do
            cliente, online ou híbrido.
          </p>
          <p>
            <strong>Ativar/Desativar:</strong> Serviços desativados não aparecem
            para novos clientes, mas ficam preservados no histórico.
          </p>
          <p>
            Os serviços cadastrados alimentam a <strong>Agenda</strong>, os{" "}
            <strong>Orçamentos</strong> e sua <strong>página pública</strong>.
          </p>
        </HelpButton>
      }
      action={
        <div className="flex flex-wrap items-center gap-2">
          <CatalogPicker
            onSelect={(name, desc, price, duration) => {
              setForm({
                ...empty,
                name,
                description: desc,
                price: price || "",
                durationMinutes: duration || "60",
              });
              setEditingId(null);
              setOpen(true);
            }}
          />
          <Button
            onClick={openAdd}
            className="h-11 rounded-xl bg-[#173a34] text-white hover:bg-[#28564d]"
          >
            <Plus className="mr-2 h-4 w-4" /> Novo serviço
          </Button>
        </div>
      }
    >
      <Dialog
        open={open}
        onOpenChange={(value) => {
          setOpen(value);
          if (!value) reset();
        }}
      >
        <ServiceDialog
          form={form}
          setForm={setForm}
          submit={submit}
          pending={create.isPending || update.isPending}
          editing={Boolean(editingId)}
          professionName={profile.data?.professionName}
        />
      </Dialog>
      <div className="mb-5 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa9a3]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por nome ou descrição..."
            className="h-11 rounded-xl border-[#dce5dc] bg-white pl-9"
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {services.data
          ?.filter((service) =>
            `${service.name} ${service.description || ""}`
              .toLowerCase()
              .includes(search.toLowerCase())
          )
          .map((service) => (
            <Card
              key={service.id}
              className="rounded-[22px] border-0 shadow-[0_8px_26px_rgba(19,42,39,0.04)]"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#e8f1f5] text-[#3f738e]">
                    <BriefcaseBusiness className="h-5 w-5" />
                  </div>
                  <StatusBadge status={service.active ? "aceito" : "cancelado"} />
                </div>
                <h3 className="mt-5 font-bold text-[#284b42]">{service.name}</h3>
                <p className="mt-2 min-h-10 text-sm leading-5 text-[#82948e]">
                  {service.description || "Sem descrição adicionada."}
                </p>
                <div className="mt-5 flex items-center justify-between border-t border-[#edf1eb] pt-4">
                  <span className="text-sm text-[#71867f]">
                    <Clock3 className="mr-1 inline h-4 w-4" />
                    {service.durationMinutes} min
                  </span>
                  <strong className="text-lg text-[#173a34]">
                    {money(service.priceCents)}
                  </strong>
                </div>
                <p className="mt-2 text-xs text-[#9aa9a3]">
                  {modalityLabel[service.modality]}
                </p>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => openEdit(service)}
                    className="h-9 flex-1 rounded-lg border-[#dce5dc] bg-white text-xs"
                  >
                    <Pencil className="mr-1 h-3.5 w-3.5" /> Editar
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => toggle(service)}
                    className="h-9 rounded-lg text-xs text-[#71867f]"
                  >
                    {service.active ? "Desativar" : "Ativar"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
      {!services.isLoading && !services.data?.length && (
        <EmptyState
          icon={BriefcaseBusiness}
          title="Adicione seu primeiro serviço"
          description="Seu catálogo alimenta a página pública, os pedidos e os orçamentos."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <CatalogPicker
                onSelect={(name, desc, price, duration) => {
                  setForm({
                    ...empty,
                    name,
                    description: desc,
                    price: price || "",
                    durationMinutes: duration || "60",
                  });
                  setEditingId(null);
                  setOpen(true);
                }}
              />
              <Button
                onClick={openAdd}
                className="rounded-xl bg-[#173a34] text-white"
              >
                <Plus className="mr-2 h-4 w-4" /> Novo serviço
              </Button>
            </div>
          }
        />
      )}
    </Page>
  );
}
