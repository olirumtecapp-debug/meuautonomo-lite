import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { lookupCep, formatCep } from "@/utils/cep";
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
import { ConfirmModal } from "@/components/ConfirmModal";
import {
  History,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import {
  Page,
  HelpButton,
  Field,
  EmptyState,
  StatusBadge,
  dateLabel,
  timeLabel,
  formatPhone,
} from "./Workspace";

export function ClientsPage() {
  const clients = trpc.customer.list.useQuery();
  const utils = trpc.useUtils();
  const create = trpc.customer.create.useMutation({
    onSuccess: () => {
      toast.success("Cliente salvo.");
      utils.customer.list.invalidate();
      setOpen(false);
      reset();
    },
    onError: (err) => {
      const msg = err.message || "";
      if (msg.includes("email") || msg.includes("Invalid email")) toast.error("E-mail do cliente inválido.");
      else if (msg.includes("name") || msg.includes("character")) toast.error("O nome do cliente deve ter pelo menos 2 caracteres.");
      else toast.error(msg || "Erro ao cadastrar cliente.");
    },
  });
  const update = trpc.customer.update.useMutation({
    onSuccess: () => {
      toast.success("Cliente atualizado.");
      utils.customer.list.invalidate();
      setOpen(false);
      reset();
    },
    onError: (err) => {
      const msg = err.message || "";
      if (msg.includes("email") || msg.includes("Invalid email")) toast.error("E-mail do cliente inválido.");
      else if (msg.includes("name") || msg.includes("character")) toast.error("O nome do cliente deve ter pelo menos 2 caracteres.");
      else toast.error(msg || "Erro ao atualizar cliente.");
    },
  });
  const remove = trpc.customer.remove.useMutation({
    onSuccess: () => {
      toast.success("Cliente removido ou arquivado.");
      utils.customer.list.invalidate();
      setSelectedId(null);
      setDeleteClientId(null);
    },
    onError: (err) => {
      toast.error(err.message || "Erro ao remover cliente.");
    },
  });

  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteClientId, setDeleteClientId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const empty = {
    name: "",
    phone: "",
    whatsapp: "",
    email: "",
    address: "",
    notes: "",
    cep: "",
    archived: false,
  };
  const [form, setForm] = useState(empty);
  const [cepLoading, setCepLoading] = useState(false);
  const history = trpc.customer.history.useQuery(
    { id: selectedId! },
    { enabled: Boolean(selectedId) }
  );

  const reset = () => {
    setForm(empty);
    setEditingId(null);
  };

  const openAdd = () => {
    reset();
    setOpen(true);
  };

  const openEdit = (client: any) => {
    setEditingId(client.id);
    const cepMatch = client.address?.match(/CEP:?\s*(\d{5}-?\d{3})/i);
    const extractedCep = cepMatch ? formatCep(cepMatch[1]) : "";
    setForm({
      name: client.name,
      phone: client.phone || "",
      whatsapp: client.whatsapp || "",
      email: client.email || "",
      address: client.address || "",
      notes: client.notes || "",
      cep: extractedCep,
      archived: client.archived,
    });
    setOpen(true);
  };

  const handleCepChange = async (val: string) => {
    const formatted = formatCep(val);
    setForm((f) => ({ ...f, cep: formatted }));
    const digits = val.replace(/\D/g, "");
    if (digits.length === 8) {
      setCepLoading(true);
      const res = await lookupCep(digits);
      setCepLoading(false);
      if (res) {
        setForm((f) => ({ ...f, address: res.formattedAddress }));
        toast.success("Endereço preenchido via CEP!");
      } else {
        toast.error("CEP não encontrado.");
      }
    }
  };

  const submit = () => {
    if (!form.name.trim() || form.name.trim().length < 2) {
      return toast.error("O nome do cliente deve ter pelo menos 2 caracteres.");
    }
    if (form.email && form.email.trim()) {
      const emailTrim = form.email.trim();
      if (!emailTrim.includes("@") || !emailTrim.includes(".")) {
        return toast.error("Informe um e-mail válido para o cliente.");
      }
    }
    if (form.phone && form.phone.trim()) {
      const clean = form.phone.replace(/\D/g, "");
      if (clean.length < 10 || clean.length > 11) {
        return toast.error("Telefone do cliente deve conter DDD e 8 ou 9 dígitos.");
      }
    }
    if (form.whatsapp && form.whatsapp.trim()) {
      const clean = form.whatsapp.replace(/\D/g, "");
      if (clean.length < 10 || clean.length > 11) {
        return toast.error("WhatsApp do cliente deve conter DDD e 8 ou 9 dígitos.");
      }
    }

    let finalAddress = form.address?.trim() || "";
    if (form.cep && form.cep.trim()) {
      const formattedCep = formatCep(form.cep.trim());
      if (formattedCep && !finalAddress.includes(formattedCep)) {
        finalAddress = finalAddress ? `${finalAddress} - CEP: ${formattedCep}` : `CEP: ${formattedCep}`;
      }
    }

    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim() || undefined,
      whatsapp: form.whatsapp.trim() || undefined,
      email: form.email.trim() || undefined,
      address: finalAddress || undefined,
      notes: form.notes.trim() || undefined,
    };

    if (editingId) update.mutate({ id: editingId, ...payload, archived: form.archived });
    else create.mutate(payload);
  };

  return (
    <Page
      title="Meus clientes"
      eyebrow="Relacionamentos"
      description="Tenha contatos, histórico e próximos passos acessíveis quando precisar."
      help={
        <HelpButton title="Como funciona Clientes?">
          <p>
            <strong>Clientes</strong> é onde você organiza todos os seus contatos.
            Cadastre nome, telefone, WhatsApp e endereço.
          </p>
          <p>
            <strong>Histórico:</strong> Clique em "Histórico" para ver todos os
            atendimentos, orçamentos e pagamentos de um cliente.
          </p>
          <p>
            <strong>Busca:</strong> Use a barra de pesquisa para encontrar
            rapidamente pelo nome, telefone ou e-mail.
          </p>
          <p>
            <strong>Arquivamento:</strong> Clientes inativos podem ser removidos
            da lista principal sem perder o histórico.
          </p>
        </HelpButton>
      }
      action={
        <Button
          onClick={openAdd}
          className="h-11 rounded-xl bg-[#173a34] text-white hover:bg-[#28564d]"
        >
          <Plus className="mr-2 h-4 w-4" /> Novo cliente
        </Button>
      }
    >
      <Dialog
        open={open}
        onOpenChange={(value) => {
          setOpen(value);
          if (!value) reset();
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[24px]">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Editar cliente" : "Novo cliente"}
            </DialogTitle>
            <DialogDescription>
              Dados salvos para agenda, orçamento e histórico.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-3 sm:grid-cols-2">
            <Field
              label="Nome"
              value={form.name}
              onChange={(value) => setForm({ ...form, name: value })}
            />
            <Field
              label="Telefone"
              value={form.phone}
              onChange={(value) => setForm({ ...form, phone: value })}
            />
            <Field
              label="WhatsApp"
              value={form.whatsapp}
              onChange={(value) => setForm({ ...form, whatsapp: value })}
            />
            <Field
              label="E-mail"
              value={form.email}
              onChange={(value) => setForm({ ...form, email: value })}
            />
            <div className="sm:col-span-2">
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <Label className="mb-2 block">
                    CEP{" "}
                    {cepLoading && (
                      <span className="text-xs text-[#8aa500]">(buscando...)</span>
                    )}
                  </Label>
                  <Input
                    placeholder="00000-000"
                    value={form.cep}
                    onChange={(e) => handleCepChange(e.target.value)}
                    className="h-10 rounded-xl border-[#dce5dc] bg-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Field
                    label="Endereço"
                    value={form.address}
                    onChange={(value) => setForm({ ...form, address: value })}
                    placeholder="Rua, número, bairro..."
                  />
                </div>
              </div>
            </div>
            <div className="sm:col-span-2">
              <Label className="mb-2 block">Observações</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={submit}
              disabled={create.isPending || update.isPending}
              className="rounded-xl bg-[#173a34] text-white"
            >
              Salvar cliente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(selectedId)}
        onOpenChange={(value) => !value && setSelectedId(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[24px]">
          <DialogHeader>
            <DialogTitle>
              {history.data?.client.name || "Histórico do cliente"}
            </DialogTitle>
            <DialogDescription>
              Relacionamentos reais registrados no seu espaço.
            </DialogDescription>
          </DialogHeader>
          {history.isLoading ? (
            <p className="py-8 text-sm text-[#82948e]">Carregando histórico…</p>
          ) : history.data ? (
            <div className="space-y-5 py-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-[#f5f8f2] p-3 text-center">
                  <p className="text-xl font-bold text-[#173a34]">
                    {history.data.appointments.length}
                  </p>
                  <p className="text-[11px] text-[#82948e]">atendimentos</p>
                </div>
                <div className="rounded-xl bg-[#f5f8f2] p-3 text-center">
                  <p className="text-xl font-bold text-[#173a34]">
                    {history.data.quotes.length}
                  </p>
                  <p className="text-[11px] text-[#82948e]">orçamentos</p>
                </div>
                <div className="rounded-xl bg-[#f5f8f2] p-3 text-center">
                  <p className="text-xl font-bold text-[#173a34]">
                    {history.data.payments.length}
                  </p>
                  <p className="text-[11px] text-[#82948e]">pagamentos</p>
                </div>
              </div>
              <div className="space-y-2">
                {history.data.appointments.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-[#edf1eb] p-3 text-sm"
                  >
                    <span className="text-[#526d64]">
                      {dateLabel(item.startsAt)} · {timeLabel(item.startsAt)}
                    </span>
                    <StatusBadge status={item.status} />
                  </div>
                ))}
                {!history.data.appointments.length && (
                  <p className="text-sm text-[#82948e]">
                    Nenhum atendimento registrado.
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmModal
        open={Boolean(deleteClientId)}
        onOpenChange={(v) => !v && setDeleteClientId(null)}
        title="Remover cliente"
        description="Deseja realmente remover ou arquivar este cliente? O histórico de atendimentos e orçamentos anteriores será preservado."
        confirmLabel="Remover cliente"
        variant="danger"
        onConfirm={() => {
          if (deleteClientId) remove.mutate({ id: deleteClientId });
        }}
      />

      <div className="mb-5 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa9a3]" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Pesquisar por nome, telefone ou e-mail"
            className="h-11 rounded-xl border-[#dce5dc] bg-white pl-9"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {clients.data
          ?.filter((client) =>
            `${client.name} ${client.phone || ""} ${client.email || ""}`
              .toLowerCase()
              .includes(search.toLowerCase())
          )
          .map((client) => (
            <Card
              key={client.id}
              className="rounded-[22px] border-0 shadow-[0_8px_26px_rgba(19,42,39,0.04)]"
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#eef5d2] font-bold text-[#819815]">
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-bold text-[#284b42]">
                      {client.name}
                    </h3>
                    <p className="mt-1 text-sm text-[#82948e]">
                      {client.phone
                        ? formatPhone(client.phone)
                        : client.email || "Contato sem telefone"}
                    </p>
                  </div>
                </div>
                <div className="mt-5 space-y-2 text-sm text-[#71867f]">
                  {client.whatsapp && (
                    <p>
                      <span className="font-semibold text-[#4f6c63]">
                        WhatsApp
                      </span>{" "}
                      · {formatPhone(client.whatsapp)}
                    </p>
                  )}
                  {client.address && (
                    <p className="flex gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#8aa500]" />
                      {client.address}
                    </p>
                  )}
                </div>
                <div className="mt-5 flex gap-2 border-t border-[#edf1eb] pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedId(client.id)}
                    className="h-9 flex-1 rounded-lg border-[#dce5dc] bg-white text-xs"
                  >
                    <History className="mr-1 h-3.5 w-3.5" /> Histórico
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => openEdit(client)}
                    className="h-9 rounded-lg text-xs"
                  >
                    <Pencil className="mr-1 h-3.5 w-3.5" /> Editar
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setDeleteClientId(client.id)}
                    className="h-9 rounded-lg text-xs text-[#9c4d43]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {!clients.isLoading && !clients.data?.length && (
        <EmptyState
          icon={Users}
          title="Você ainda não tem clientes"
          description="Cadastre alguém ou compartilhe seu cartão para começar a receber solicitações."
          action={
            <Button
              onClick={openAdd}
              className="rounded-xl bg-[#173a34] text-white"
            >
              <Plus className="mr-2 h-4 w-4" /> Cadastrar cliente
            </Button>
          }
        />
      )}
    </Page>
  );
}
