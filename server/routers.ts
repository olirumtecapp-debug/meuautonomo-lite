import { and, desc, eq, gte, lt, lte, ne, like } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  appointments,
  availability,
  clients,
  expenses,
  notifications,
  payments,
  professionalProfiles,
  quoteItems,
  quotes,
  requestAttachments,
  requests,
  services,
  teamMembers,
  users,
  voucherRedemptions,
  vouchers,
} from "../drizzle/schema";
import { createNotification, getAllUsers, getDb, getProfileBySlug, getProfileByUserId, getUserByEmail, getUserByOpenId, upsertUser } from "./db";
import { storagePut } from "./storage";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { sdk } from "./_core/sdk";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { enviarEmail, modeloOrcamentoAprovado, modeloRecuperacaoSenha } from "./email";
import { getAdminEmail, getAdminPassword, getAdminUsername, isDemoMode, setDemoMode } from "./demoConfig";
import crypto from "node:crypto";
import { generateReceiptAuthCode } from "./receiptAuth";
import {
  associatePaymentsToAppointments,
  calculateCommissionAndStudio,
  calculateDeduplicatedMetrics,
  calculateTeamReport,
  isBillableAppointment,
  isCountableAppointment,
  isCommissionEligible,
} from "./billingRules";

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, key] = stored.split(":");
    if (!salt || !key) return false;
    const hash = crypto.scryptSync(password, salt, 64).toString("hex");
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(key, "hex"));
  } catch {
    return false;
  }
}

function secureEquals(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

interface PasswordResetEntry {
  code: string;
  expiresAt: number;
  email: string;
  userId: number;
}
const passwordResetMap = new Map<string, PasswordResetEntry>();

const modality = z.enum(["presencial", "endereco", "online", "hibrido"]);
const paymentMethod = z.enum(["pix", "dinheiro", "cartao", "transferencia", "outro"]);
const appointmentStatus = z.enum(["agendado", "confirmado", "andamento", "concluido", "cancelado", "faltou"]);
const paymentStatus = z.enum(["pendente", "parcial", "pago"]);

async function requireProfile(userId: number) {
  const profile = await getProfileByUserId(userId);
  if (!profile) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Finalize seu perfil para continuar." });
  return profile;
}

async function getOwnedService(profileId: number, serviceId: number) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco de dados indisponível." });
  const result = await db.select().from(services).where(and(eq(services.id, serviceId), eq(services.profileId, profileId))).limit(1);
  if (!result[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Serviço não encontrado." });
  return result[0];
}

async function getOwnedClient(profileId: number, clientId: number) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco de dados indisponível." });
  const result = await db.select().from(clients).where(and(eq(clients.id, clientId), eq(clients.profileId, profileId))).limit(1);
  if (!result[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Cliente não encontrado." });
  return result[0];
}

async function getOwnedTeamMember(profileId: number, memberId: number) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco de dados indisponível." });
  const result = await db.select().from(teamMembers).where(and(eq(teamMembers.id, memberId), eq(teamMembers.profileId, profileId))).limit(1);
  if (!result[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Profissional parceiro(a) não encontrado." });
  return result[0];
}

function dayStart(date = new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

function dayEnd(date = new Date()) {
  const end = dayStart(date);
  end.setDate(end.getDate() + 1);
  return end;
}

export function isWithinAvailability(
  start: Date,
  durationMinutes: number,
  availabilityRow: { schedule: string; unavailableDays: string | null } | undefined,
  timeZone = "America/Sao_Paulo"
) {
  if (!availabilityRow) return true;
  try {
    const config = JSON.parse(availabilityRow.schedule) as {
      days?: string[];
      start?: string;
      end?: string;
      breaks?: Array<{ start: string; end: string }>;
    };

    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      weekday: "short",
    });
    const parts = Object.fromEntries(dtf.formatToParts(start).map(p => [p.type, p.value]));
    const dayNames: Record<string, string> = {
      Sun: "sun", Mon: "mon", Tue: "tue", Wed: "wed", Thu: "thu", Fri: "fri", Sat: "sat"
    };
    const day = dayNames[parts.weekday] || "mon";

    if (config.days?.length && !config.days.includes(day)) return false;

    const toMinutes = (value: string) => {
      const [hours, minutes] = value.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const startMinutes = Number(parts.hour) * 60 + Number(parts.minute);
    const endMinutes = startMinutes + durationMinutes;

    if (config.start && startMinutes < toMinutes(config.start)) return false;
    if (config.end && endMinutes > toMinutes(config.end)) return false;
    if (config.breaks?.some(item => startMinutes < toMinutes(item.end) && endMinutes > toMinutes(item.start))) return false;

    const unavailable = availabilityRow.unavailableDays ? JSON.parse(availabilityRow.unavailableDays) as string[] : [];
    const dateKey = `${parts.year}-${parts.month}-${parts.day}`;
    return !unavailable.includes(dateKey);
  } catch {
    return true;
  }
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),

    register: publicProcedure
      .input(
        z.object({
          name: z.string().min(2, "Informe seu nome completo ou profissional."),
          email: z.string().email("Informe um e-mail válido."),
          password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres."),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const normalizedEmail = input.email.trim().toLowerCase();
        const existing = await getUserByEmail(normalizedEmail);
        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Já existe uma conta cadastrada com este e-mail. Faça login ou use outro e-mail.",
          });
        }

        const passwordHash = hashPassword(input.password);
        const openId = `user_${nanoid(12)}`;
        const name = input.name.trim();

        await upsertUser({
          openId,
          name,
          email: normalizedEmail,
          passwordHash,
          loginMethod: "local-password",
          role: "user",
          lastSignedIn: new Date(),
        });

        const createdUser = await getUserByOpenId(openId);
        if (!createdUser) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao criar conta no banco de dados.",
          });
        }

        const sessionToken = await sdk.createSessionToken(openId, {
          name,
          expiresInMs: ONE_YEAR_MS,
        });

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

        return {
          success: true,
          sessionToken,
          user: createdUser,
        };
      }),

    login: publicProcedure
      .input(
        z.object({
          email: z.string().email("Informe um e-mail válido."),
          password: z.string().min(1, "Informe sua senha."),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const normalizedEmail = input.email.trim().toLowerCase();
        const user = await getUserByEmail(normalizedEmail);

        if (!user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "E-mail ou senha incorretos.",
          });
        }

        if (user.passwordHash) {
          const isValid = verifyPassword(input.password, user.passwordHash);
          if (!isValid) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "E-mail ou senha incorretos.",
            });
          }
        } else if (user.openId !== "dev-user-local") {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Esta conta foi registrada com outro método de acesso.",
          });
        }

        await upsertUser({
          openId: user.openId,
          lastSignedIn: new Date(),
        });

        const sessionToken = await sdk.createSessionToken(user.openId, {
          name: user.name || "Profissional",
          expiresInMs: ONE_YEAR_MS,
        });

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

        return {
          success: true,
          sessionToken,
          user,
        };
      }),

    quickLogin: publicProcedure
      .input(z.object({ openId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (!isDemoMode()) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "O acesso de teste rápido está desativado pelo administrador para proteger contas reais.",
          });
        }

        const user = await getUserByOpenId(input.openId);
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Usuário não encontrado.",
          });
        }

        await upsertUser({
          openId: user.openId,
          lastSignedIn: new Date(),
        });

        const sessionToken = await sdk.createSessionToken(user.openId, {
          name: user.name || "Profissional",
          expiresInMs: ONE_YEAR_MS,
        });

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

        return {
          success: true,
          sessionToken,
          user,
        };
      }),

    listUsers: publicProcedure.query(async ({ ctx }) => {
      // Por segurança de dados e privacidade, nunca expor lista de contas publicamente
      if (!ctx.user || ctx.user.role !== "admin") {
        return [];
      }
      const all = await getAllUsers();
      return all.map(u => ({
        id: u.id,
        openId: u.openId,
        name: u.name || "Sem nome",
        email: u.email || "Sem e-mail",
      }));
    }),

    isDemoMode: publicProcedure.query(() => false),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, path: "/", maxAge: -1 });
      if (typeof (ctx.res as any)?.setHeader === "function") {
        (ctx.res as any).setHeader("Set-Cookie", [
          `${COOKIE_NAME}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax`,
          `manus-auth-session-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax`,
        ]);
      }
      return { success: true } as const;
    }),

    requestPasswordReset: publicProcedure
      .input(z.object({ email: z.string().email("Informe um e-mail válido.") }))
      .mutation(async ({ input }) => {
        const normalizedEmail = input.email.trim().toLowerCase();
        const user = await getUserByEmail(normalizedEmail);

        if (!user) {
          return {
            success: true,
            message: "Se o e-mail estiver cadastrado, o código de recuperação foi enviado para sua caixa de entrada.",
          };
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 20 * 60 * 1000; // 20 minutos

        passwordResetMap.set(normalizedEmail, {
          code,
          expiresAt,
          email: normalizedEmail,
          userId: user.id,
        });

        const emailData = modeloRecuperacaoSenha({
          nome: user.name || "Profissional",
          email: normalizedEmail,
          codigo: code,
        });

        try {
          await enviarEmail({
            para: normalizedEmail,
            assunto: emailData.assunto,
            texto: emailData.texto,
            html: emailData.html,
          });
        } catch (err) {
          console.error("[Auth] Erro ao enviar e-mail de recuperação:", err);
        }

        return {
          success: true,
          message: "Código de recuperação enviado com sucesso para seu e-mail!",
          email: normalizedEmail,
        };
      }),

    resetPasswordWithCode: publicProcedure
      .input(
        z.object({
          email: z.string().email("Informe um e-mail válido."),
          code: z.string().min(4, "Código inválido."),
          newPassword: z.string().min(6, "A nova senha deve ter no mínimo 6 caracteres."),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const normalizedEmail = input.email.trim().toLowerCase();
        const entry = passwordResetMap.get(normalizedEmail);

        if (!entry || entry.code !== input.code.trim()) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Código de recuperação incorreto ou não encontrado.",
          });
        }

        if (Date.now() > entry.expiresAt) {
          passwordResetMap.delete(normalizedEmail);
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "O código de recuperação expirou. Solicite um novo código.",
          });
        }

        const user = await getUserByEmail(normalizedEmail);
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Usuário não encontrado.",
          });
        }

        const newHash = hashPassword(input.newPassword);
        const db = await getDb();
        if (db) {
          await db.update(users).set({ passwordHash: newHash }).where(eq(users.id, user.id));
        }

        passwordResetMap.delete(normalizedEmail);

        const sessionToken = await sdk.createSessionToken(user.openId, {
          name: user.name || "Profissional",
          expiresInMs: ONE_YEAR_MS,
        });

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

        return {
          success: true,
          message: "Senha alterada com sucesso! Você já está conectado.",
          sessionToken,
          user,
        };
      }),
  }),

  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const profile = await getProfileByUserId(ctx.user.id);
      if (!profile) return null;
      if (profile.plan !== "free" && !profile.isVip && profile.planExpiresAt) {
        if (new Date() > new Date(profile.planExpiresAt)) {
          const db = await getDb();
          if (db) {
            await db.update(professionalProfiles).set({ plan: "free", isPro: false }).where(eq(professionalProfiles.id, profile.id));
          }
          return { ...profile, plan: "free" as const, isPro: false };
        }
      }
      return profile;
    }),
    upsert: protectedProcedure
      .input(z.object({
        displayName: z.string().min(2).max(160),
        slug: z.string().min(3).max(100).regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífen."),
        professionCategory: z.string().max(100).optional(),
        professionName: z.string().min(2).max(160),
        bio: z.string().max(1200).optional(),
        city: z.string().max(120).optional(),
        serviceRegion: z.string().max(160).optional(),
        phone: z.string().max(40).optional(),
        whatsapp: z.string().max(40).optional(),
        avatarUrl: z.string().max(500).optional(),
        pixKey: z.string().max(140).optional(),
        pixKeyType: z.string().max(30).optional(),
        showPrices: z.boolean().default(true),
        bookingEnabled: z.boolean().default(false),
        accountType: z.enum(["individual", "equipe"]).default("individual").optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco de dados indisponível." });
        const current = await getProfileByUserId(ctx.user.id);
        if (current && input.slug && input.slug !== current.slug) {
          const slugOwner = await getProfileBySlug(input.slug);
          if (slugOwner && slugOwner.userId !== ctx.user.id) {
            throw new TRPCError({ code: "CONFLICT", message: "Esse endereço público já está em uso por outro profissional." });
          }
        }
        try {
          if (current) {
            await db.update(professionalProfiles).set({
              ...input,
              professionCategory: input.professionCategory ?? null,
              bio: input.bio ?? null,
              city: input.city ?? null,
              serviceRegion: input.serviceRegion ?? null,
              phone: input.phone && input.phone.trim() ? input.phone.trim() : null,
              whatsapp: input.whatsapp && input.whatsapp.trim() ? input.whatsapp.trim() : null,
              pixKey: input.pixKey && input.pixKey.trim() ? input.pixKey.trim() : null,
              pixKeyType: input.pixKeyType ?? null,
            }).where(eq(professionalProfiles.id, current.id));
          } else {
            const slugOwner = await getProfileBySlug(input.slug);
            const slug = slugOwner && slugOwner.userId !== ctx.user.id
              ? `${input.slug}-${nanoid(6).toLowerCase()}`.slice(0, 100)
              : input.slug;
            const refCode = `${slug.replace(/[^a-z0-9]/gi, "").slice(0, 8).toUpperCase()}-${nanoid(4).toUpperCase()}`;
            await db.insert(professionalProfiles).values({ ...input, slug, userId: ctx.user.id, referralCode: refCode, professionCategory: input.professionCategory ?? null, bio: input.bio ?? null, city: input.city ?? null, serviceRegion: input.serviceRegion ?? null, phone: input.phone ?? null, whatsapp: input.whatsapp ?? null, pixKey: input.pixKey ?? null, pixKeyType: input.pixKeyType ?? null });
          }
        } catch {
          throw new TRPCError({ code: "CONFLICT", message: "Esse endereço público já está em uso." });
        }
        return getProfileByUserId(ctx.user.id);
      }),
    setAccountType: protectedProcedure
      .input(z.object({ accountType: z.enum(["individual", "equipe"]) }))
      .mutation(async ({ ctx, input }) => {
        const profile = await requireProfile(ctx.user.id);
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db.update(professionalProfiles).set({ accountType: input.accountType }).where(eq(professionalProfiles.id, profile.id));
        return { success: true, accountType: input.accountType };
      }),
    saveAvailability: protectedProcedure
      .input(z.object({ schedule: z.string().min(2), unavailableDays: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        const profile = await requireProfile(ctx.user.id);
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const existing = await db.select().from(availability).where(eq(availability.profileId, profile.id)).limit(1);
        if (existing[0]) await db.update(availability).set({ schedule: input.schedule, unavailableDays: input.unavailableDays ?? null }).where(eq(availability.profileId, profile.id));
        else await db.insert(availability).values({ profileId: profile.id, schedule: input.schedule, unavailableDays: input.unavailableDays ?? null });
        return { success: true };
      }),
    getAvailability: protectedProcedure.query(async ({ ctx }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const result = await db.select().from(availability).where(eq(availability.profileId, profile.id)).limit(1);
      return result[0] ?? null;
    }),
    uploadAvatar: protectedProcedure.input(z.object({ fileName: z.string().max(180), mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]), dataUrl: z.string().max(7_000_000) })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const encoded = input.dataUrl.split(",")[1];
      if (!encoded) throw new TRPCError({ code: "BAD_REQUEST", message: "Arquivo inválido." });
      const buffer = Buffer.from(encoded, "base64");
      if (buffer.length > 5_000_000) throw new TRPCError({ code: "BAD_REQUEST", message: "A foto deve ter no máximo 5 MB." });
      let avatarUrl = input.dataUrl;
      try {
        const stored = await storagePut(`profiles/${profile.id}/avatar-${input.fileName}`, buffer, input.mimeType);
        if (stored?.url) avatarUrl = stored.url;
      } catch (err) {
        console.warn("[uploadAvatar] Storage put failed, using dataUrl fallback:", err);
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(professionalProfiles).set({ avatarUrl }).where(eq(professionalProfiles.id, profile.id));
      return { success: true, avatarUrl };
    }),
  }),

  service: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      return db.select().from(services).where(eq(services.profileId, profile.id)).orderBy(desc(services.active), desc(services.createdAt));
    }),
    create: protectedProcedure.input(z.object({ name: z.string().min(2).max(160), description: z.string().max(1000).optional(), durationMinutes: z.number().int().min(15).max(1440), priceCents: z.number().int().min(0), modality })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.insert(services).values({ ...input, profileId: profile.id, description: input.description ?? null });
      return { success: true };
    }),
    update: protectedProcedure.input(z.object({ id: z.number(), name: z.string().min(2).max(160), description: z.string().max(1000).optional(), durationMinutes: z.number().int().min(15).max(1440), priceCents: z.number().int().min(0), modality, active: z.boolean() })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      await getOwnedService(profile.id, input.id);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(services).set({ name: input.name, description: input.description ?? null, durationMinutes: input.durationMinutes, priceCents: input.priceCents, modality: input.modality, active: input.active }).where(eq(services.id, input.id));
      return { success: true };
    }),
    remove: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      await getOwnedService(profile.id, input.id);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(services).set({ active: false }).where(eq(services.id, input.id));
      return { success: true };
    }),
  }),

  customer: router({
    list: protectedProcedure.input(z.object({ includeArchived: z.boolean().default(false) }).optional()).query(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const conditions = input?.includeArchived ? eq(clients.profileId, profile.id) : and(eq(clients.profileId, profile.id), eq(clients.archived, false));
      return db.select().from(clients).where(conditions).orderBy(desc(clients.createdAt));
    }),
    create: protectedProcedure.input(z.object({ name: z.string().min(2).max(160), phone: z.string().max(40).optional(), whatsapp: z.string().max(40).optional(), email: z.string().email().optional().or(z.literal("")), address: z.string().max(600).optional(), notes: z.string().max(1200).optional() })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Evita duplicação acidental do mesmo contato mesmo quando o telefone
      // foi digitado com espaços, parênteses, hífen ou código do país.
      const digits = (value?: string | null) => (value || "").replace(/\\D/g, "");
      const normalizeName = (value: string) => value
        .normalize("NFD")
        .replace(/[\\u0300-\\u036f]/g, "")
        .trim()
        .replace(/\\s+/g, " ")
        .toLocaleLowerCase("pt-BR");
      const incomingPhone = digits(input.phone || input.whatsapp);
      if (incomingPhone) {
        const existingClients = await db.select({
          id: clients.id,
          name: clients.name,
          phone: clients.phone,
          whatsapp: clients.whatsapp,
        }).from(clients).where(and(
          eq(clients.profileId, profile.id),
          eq(clients.archived, false)
        ));
        const duplicate = existingClients.find(client =>
          digits(client.phone || client.whatsapp) === incomingPhone &&
          normalizeName(client.name) === normalizeName(input.name)
        );
        if (duplicate) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Este cliente já está cadastrado com esse telefone. Confira a lista de clientes antes de criar outro registro.",
          });
        }
      }

      await db.insert(clients).values({ ...input, profileId: profile.id, archived: false, phone: input.phone ?? null, whatsapp: input.whatsapp ?? null, email: input.email || null, address: input.address ?? null, notes: input.notes ?? null });
      return { success: true };
    }),
    update: protectedProcedure.input(z.object({ id: z.number(), name: z.string().min(2).max(160), phone: z.string().max(40).optional(), whatsapp: z.string().max(40).optional(), email: z.string().email().optional().or(z.literal("")), address: z.string().max(600).optional(), notes: z.string().max(1200).optional(), archived: z.boolean().default(false) })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      await getOwnedClient(profile.id, input.id);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(clients).set({ name: input.name, phone: input.phone ?? null, whatsapp: input.whatsapp ?? null, email: input.email || null, address: input.address ?? null, notes: input.notes ?? null, archived: input.archived }).where(eq(clients.id, input.id));
      return { success: true };
    }),
    history: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const client = await getOwnedClient(profile.id, input.id);
      const [clientAppointments, clientQuotes, clientPayments] = await Promise.all([
        db.select().from(appointments).where(and(eq(appointments.profileId, profile.id), eq(appointments.clientId, input.id))).orderBy(desc(appointments.startsAt)),
        db.select().from(quotes).where(and(eq(quotes.profileId, profile.id), eq(quotes.clientId, input.id))).orderBy(desc(quotes.createdAt)),
        db.select().from(payments).where(and(eq(payments.profileId, profile.id), eq(payments.clientId, input.id))).orderBy(desc(payments.createdAt)),
      ]);
      return { client, appointments: clientAppointments, quotes: clientQuotes, payments: clientPayments };
    }),
    remove: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await getOwnedClient(profile.id, input.id);
      const related = await db.select({ id: appointments.id }).from(appointments).where(and(eq(appointments.profileId, profile.id), eq(appointments.clientId, input.id))).limit(1);
      if (related[0]) {
        await db.update(clients).set({ archived: true }).where(eq(clients.id, input.id));
      } else {
        await db.delete(clients).where(and(eq(clients.id, input.id), eq(clients.profileId, profile.id)));
      }
      return { success: true };
    }),
  }),

  appointment: router({
    list: protectedProcedure.input(z.object({ from: z.string().datetime().optional(), to: z.string().datetime().optional() }).optional()).query(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const conditions = [eq(appointments.profileId, profile.id)];
      if (input?.from) conditions.push(gte(appointments.startsAt, new Date(input.from)));
      if (input?.to) conditions.push(lt(appointments.startsAt, new Date(input.to)));
      const rows = await db.select().from(appointments).where(and(...conditions)).orderBy(appointments.startsAt);
      return rows.map(r => ({
        ...r,
        receiptCode: generateReceiptAuthCode("A", r.id, r.profileId, r.amountCents),
      }));
    }),
    unresolvedPast: protectedProcedure.query(async ({ ctx }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const rows = await db
        .select()
        .from(appointments)
        .where(
          and(
            eq(appointments.profileId, profile.id),
            ne(appointments.status, "cancelado")
          )
        )
        .orderBy(desc(appointments.startsAt));

      const nowMs = Date.now();
      const past = rows.filter(r => {
        const isPending = r.status === "agendado" || r.status === "confirmado" || r.status === "andamento";
        if (!isPending) return false;
        const startMs = new Date(r.startsAt).getTime();
        const endMs = startMs + (r.durationMinutes || 60) * 60_000;
        return endMs <= nowMs;
      });

      return past.slice(0, 20).map(r => ({
        ...r,
        receiptCode: generateReceiptAuthCode("A", r.id, r.profileId, r.amountCents),
      }));
    }),
    create: protectedProcedure.input(z.object({
      teamMemberId: z.number().optional(),
      clientId: z.number().optional(),
      serviceId: z.number().optional(),
      startsAt: z.string().datetime(),
      durationMinutes: z.number().int().min(15).max(1440),
      location: z.string().max(600).optional(),
      amountCents: z.number().int().min(0),
      status: appointmentStatus.default("agendado"),
      notes: z.string().max(1200).optional(),
      paymentMethod: paymentMethod.optional(),
      paymentStatus: paymentStatus.default("pendente")
    })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      if (input.clientId) await getOwnedClient(profile.id, input.clientId);
      if (input.serviceId) await getOwnedService(profile.id, input.serviceId);
      if (input.teamMemberId) await getOwnedTeamMember(profile.id, input.teamMemberId);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const start = new Date(input.startsAt);
      const availabilityRow = (await db.select().from(availability).where(eq(availability.profileId, profile.id)).limit(1))[0];
      if (!isWithinAvailability(start, input.durationMinutes, availabilityRow)) {
        throw new TRPCError({ code: "CONFLICT", message: "Esse horário está fora da sua disponibilidade." });
      }
      const end = new Date(start.getTime() + input.durationMinutes * 60_000);
      const sameDay = await db.select().from(appointments).where(and(eq(appointments.profileId, profile.id), gte(appointments.startsAt, dayStart(start)), lt(appointments.startsAt, dayEnd(start)), ne(appointments.status, "cancelado")));
      const conflict = sameDay.some(item => {
        const t1 = input.teamMemberId ?? 0;
        const t2 = item.teamMemberId ?? 0;
        if (t1 !== t2) {
          return false;
        }
        const itemStart = new Date(item.startsAt).getTime();
        const itemEnd = itemStart + item.durationMinutes * 60_000;
        return itemStart < end.getTime() && start.getTime() < itemEnd;
      });
      if (conflict) {
        throw new TRPCError({ code: "CONFLICT", message: "Esse horário já está ocupado para este profissional." });
      }
      const insert = (await db.insert(appointments).values({
        ...input,
        profileId: profile.id,
        teamMemberId: input.teamMemberId ?? null,
        startsAt: start,
        clientId: input.clientId ?? null,
        serviceId: input.serviceId ?? null,
        location: input.location ?? null,
        notes: input.notes ?? null,
        paymentMethod: input.paymentMethod ?? null
      })) as unknown as [{ insertId: number }];
      return { success: true, id: Number(insert[0]?.insertId) };
    }),
    updateStatus: protectedProcedure.input(z.object({ id: z.number(), status: appointmentStatus, paymentStatus: paymentStatus.optional(), paymentMethod: paymentMethod.optional() })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const result = await db.select().from(appointments).where(and(eq(appointments.id, input.id), eq(appointments.profileId, profile.id))).limit(1);
      if (!result[0]) throw new TRPCError({ code: "NOT_FOUND" });
      await db.update(appointments).set({ status: input.status, paymentStatus: input.paymentStatus ?? result[0].paymentStatus, paymentMethod: input.paymentMethod ?? result[0].paymentMethod }).where(eq(appointments.id, input.id));
      return { success: true };
    }),
    update: protectedProcedure.input(z.object({ id: z.number(), teamMemberId: z.number().nullable().optional(), clientId: z.number().optional(), serviceId: z.number().optional(), startsAt: z.string().datetime(), durationMinutes: z.number().int().min(15).max(1440), location: z.string().max(600).optional(), amountCents: z.number().int().min(0), notes: z.string().max(1200).optional() })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      if (input.clientId) await getOwnedClient(profile.id, input.clientId);
      if (input.serviceId) await getOwnedService(profile.id, input.serviceId);
      if (input.teamMemberId) await getOwnedTeamMember(profile.id, input.teamMemberId);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const existing = (await db.select().from(appointments).where(and(eq(appointments.id, input.id), eq(appointments.profileId, profile.id))).limit(1))[0];
      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Atendimento não encontrado." });
      const start = new Date(input.startsAt);
      const availabilityRow = (await db.select().from(availability).where(eq(availability.profileId, profile.id)).limit(1))[0];
      if (!isWithinAvailability(start, input.durationMinutes, availabilityRow)) throw new TRPCError({ code: "CONFLICT", message: "Esse horário está fora da sua disponibilidade." });
      const end = new Date(start.getTime() + input.durationMinutes * 60_000).getTime();
      const sameDay = await db.select().from(appointments).where(and(eq(appointments.profileId, profile.id), gte(appointments.startsAt, dayStart(start)), lt(appointments.startsAt, dayEnd(start)), ne(appointments.status, "cancelado"), ne(appointments.id, input.id)));
      const effectiveTeamMemberId = input.teamMemberId !== undefined ? input.teamMemberId : existing.teamMemberId;
      if (sameDay.some(item => {
        const t1 = effectiveTeamMemberId ?? 0;
        const t2 = item.teamMemberId ?? 0;
        if (t1 !== t2) return false;
        return new Date(item.startsAt).getTime() < end && start.getTime() < new Date(item.startsAt).getTime() + item.durationMinutes * 60_000;
      })) throw new TRPCError({ code: "CONFLICT", message: "Esse horário já está ocupado para este profissional." });
      await db.update(appointments).set({ clientId: input.clientId ?? null, serviceId: input.serviceId ?? null, teamMemberId: input.teamMemberId !== undefined ? input.teamMemberId : existing.teamMemberId, startsAt: start, durationMinutes: input.durationMinutes, location: input.location ?? null, amountCents: input.amountCents, notes: input.notes ?? null }).where(eq(appointments.id, input.id));
      return { success: true };
    }),
    cancel: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(appointments).set({ status: "cancelado" }).where(and(eq(appointments.id, input.id), eq(appointments.profileId, profile.id)));
      return { success: true };
    }),
  }),

  request: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const [rows, allQuotes] = await Promise.all([
        db.select().from(requests).where(eq(requests.profileId, profile.id)).orderBy(desc(requests.createdAt)),
        db.select().from(quotes).where(eq(quotes.profileId, profile.id)),
      ]);
      const quoteByRequestId = new Map(allQuotes.filter(q => q.requestId).map(q => [q.requestId!, q]));
      return Promise.all(rows.map(async request => {
        const linkedQuote = quoteByRequestId.get(request.id);
        const attachments = await db.select().from(requestAttachments).where(eq(requestAttachments.requestId, request.id));
        return {
          ...request,
          attachments,
          linkedQuote: linkedQuote ? { id: linkedQuote.id, status: linkedQuote.status, totalCents: linkedQuote.totalCents } : null,
          quoteStatus: linkedQuote?.status || null
        };
      }));
    }),
    createPublic: publicProcedure.input(z.object({
      slug: z.string(),
      requesterName: z.string().min(1).max(160),
      requesterPhone: z.string().min(6).max(40),
      requesterEmail: z.string().max(320).optional().nullable(),
      serviceId: z.number().optional().nullable(),
      description: z.string().min(1).max(3000),
      address: z.string().max(600).optional().nullable(),
      desiredAt: z.string().optional().nullable(),
      preferredTime: z.string().max(80).optional().nullable(),
      attachments: z.array(z.object({
        name: z.string().max(180),
        mimeType: z.string().max(120).optional(),
        size: z.number().int().positive().max(10_000_000).optional(),
        dataUrl: z.string().max(10_000_000)
      })).max(5).optional()
    })).mutation(async ({ input }) => {
      const profile = await getProfileBySlug(input.slug);
      if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "Profissional não encontrado." });
      if (input.serviceId) {
        try {
          await getOwnedService(profile.id, input.serviceId);
        } catch {
          input.serviceId = null;
        }
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco de dados indisponível." });

      const cleanPhone = input.requesterPhone.trim();
      const cleanName = input.requesterName.trim();
      const cleanEmail = input.requesterEmail && input.requesterEmail.trim().includes("@") ? input.requesterEmail.trim() : null;

      const existingClient = await db.select().from(clients).where(and(eq(clients.profileId, profile.id), eq(clients.phone, cleanPhone))).limit(1);
      let clientId = existingClient[0]?.id;
      if (!clientId) {
        try {
          const insert = (await db.insert(clients).values({ profileId: profile.id, name: cleanName, phone: cleanPhone, email: cleanEmail })) as unknown as [{ insertId: number }];
          clientId = Number(insert[0]?.insertId);
        } catch (e) {
          console.warn("[createPublic] Erro ao cadastrar cliente automático:", e);
        }
      }

      let parsedDesiredAt: Date | null = null;
      if (input.desiredAt && input.desiredAt.trim()) {
        const d = new Date(input.desiredAt);
        if (!isNaN(d.getTime())) {
          parsedDesiredAt = d;
        }
      }

      const secureToken = nanoid(32);
      const insert = (await db.insert(requests).values({
        profileId: profile.id,
        clientId: clientId || null,
        requesterName: cleanName,
        requesterPhone: cleanPhone,
        requesterEmail: cleanEmail,
        serviceId: input.serviceId ?? null,
        description: input.description.trim(),
        address: input.address?.trim() || null,
        desiredAt: parsedDesiredAt,
        preferredTime: input.preferredTime?.trim() || null,
        secureToken
      })) as unknown as [{ insertId: number }];
      const requestId = Number(insert[0]?.insertId);

      for (const attachment of input.attachments ?? []) {
        try {
          const encoded = attachment.dataUrl.split(",")[1];
          if (!encoded) continue;
          const buffer = Buffer.from(encoded, "base64");
          if (buffer.length > 5_000_000) continue;
          let fileUrl = "";
          try {
            const stored = await storagePut(`requests/${profile.id}/${requestId}/${attachment.name}`, buffer, attachment.mimeType || "application/octet-stream");
            fileUrl = stored.url;
          } catch (storageErr) {
            console.warn("[createPublic] Storage put failed, saving fallback:", storageErr);
            fileUrl = attachment.dataUrl;
          }
          await db.insert(requestAttachments).values({
            requestId,
            fileName: attachment.name,
            fileUrl: fileUrl || attachment.name,
            mimeType: attachment.mimeType || "application/octet-stream",
            fileSize: buffer.length
          });
        } catch (attErr) {
          console.warn("[createPublic] Erro ao processar anexo:", attErr);
        }
      }

      try {
        await createNotification(profile.id, "Nova solicitação", `${cleanName} enviou um pedido de serviço.`, "request");
      } catch (notifErr) {
        console.warn("[createPublic] Erro ao criar notificação:", notifErr);
      }

      return { success: true, id: requestId, token: secureToken };
    }),
    updateStatus: protectedProcedure.input(z.object({ id: z.number(), status: z.enum(["nova", "em_analise", "orcamento_enviado", "agendada", "arquivada"]) })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(requests).set({ status: input.status }).where(and(eq(requests.id, input.id), eq(requests.profileId, profile.id)));
      return { success: true };
    }),
    convertToClient: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const request = (await db.select().from(requests).where(and(eq(requests.id, input.id), eq(requests.profileId, profile.id))).limit(1))[0];
      if (!request) throw new TRPCError({ code: "NOT_FOUND", message: "Solicitação não encontrada." });
      if (request.clientId) return { success: true, clientId: request.clientId };
      const inserted = (await db.insert(clients).values({ profileId: profile.id, name: request.requesterName, phone: request.requesterPhone, email: request.requesterEmail, address: request.address })) as unknown as [{ insertId: number }];
      const clientId = Number(inserted[0].insertId);
      await db.update(requests).set({ clientId }).where(eq(requests.id, request.id));
      return { success: true, clientId };
    }),
    convertToAppointment: protectedProcedure.input(z.object({
      id: z.number(),
      startsAt: z.string().optional(),
      serviceId: z.number().optional().nullable(),
      teamMemberId: z.number().optional().nullable(),
      durationMinutes: z.number().int().positive().optional(),
      amountCents: z.number().int().optional(),
      location: z.string().optional().nullable(),
      notes: z.string().optional().nullable(),
    })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const request = (await db.select().from(requests).where(and(eq(requests.id, input.id), eq(requests.profileId, profile.id))).limit(1))[0];
      if (!request) throw new TRPCError({ code: "NOT_FOUND", message: "Solicitação não encontrada." });
      
      let effectiveClientId = request.clientId;
      if (!effectiveClientId) {
        const insertedClient = (await db.insert(clients).values({
          profileId: profile.id,
          name: request.requesterName || "Cliente",
          phone: request.requesterPhone,
          email: request.requesterEmail,
          address: request.address,
        })) as unknown as [{ insertId: number }];
        effectiveClientId = Number(insertedClient[0].insertId);
        await db.update(requests).set({ clientId: effectiveClientId }).where(eq(requests.id, request.id));
      }

      const effectiveServiceId = input.serviceId ?? request.serviceId ?? undefined;
      const service = effectiveServiceId ? await getOwnedService(profile.id, effectiveServiceId) : undefined;
      
      let start: Date;
      if (input.startsAt && !isNaN(new Date(input.startsAt).getTime())) {
        start = new Date(input.startsAt);
      } else if (request.desiredAt && !isNaN(new Date(request.desiredAt).getTime())) {
        start = new Date(request.desiredAt);
      } else {
        start = new Date(Date.now() + 24 * 3600 * 1000);
      }

      const durationMinutes = input.durationMinutes ?? service?.durationMinutes ?? 60;
      const amountCents = input.amountCents ?? service?.priceCents ?? 0;
      const location = input.location ?? request.address ?? "";
      const notes = input.notes ?? request.description ?? "";

      const inserted = (await db.insert(appointments).values({
        profileId: profile.id,
        clientId: effectiveClientId,
        serviceId: effectiveServiceId,
        teamMemberId: input.teamMemberId ?? null,
        startsAt: start,
        durationMinutes,
        location,
        amountCents,
        notes,
        status: "confirmado",
        paymentStatus: "pendente",
      })) as unknown as [{ insertId: number }];

      await db.update(requests).set({ status: "agendada" }).where(eq(requests.id, request.id));
      return { success: true, appointmentId: Number(inserted[0].insertId) };
    }),
    convertToQuote: protectedProcedure.input(z.object({ id: z.number(), discountCents: z.number().int().min(0).default(0), sendNow: z.boolean().default(true) })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const request = (await db.select().from(requests).where(and(eq(requests.id, input.id), eq(requests.profileId, profile.id))).limit(1))[0];
      if (!request) throw new TRPCError({ code: "NOT_FOUND", message: "Solicitação não encontrada." });
      const service = request.serviceId ? await getOwnedService(profile.id, request.serviceId) : undefined;
      const item = { description: service?.name || "Serviço solicitado", quantity: 1, unitPriceCents: service?.priceCents || 0 };
      const secureToken = nanoid(32);
      const insert = (await db.insert(quotes).values({
        profileId: profile.id,
        clientId: request.clientId ?? null,
        requestId: request.id,
        serviceId: request.serviceId ?? null,
        description: request.description,
        subtotalCents: item.unitPriceCents,
        discountCents: input.discountCents,
        totalCents: Math.max(0, item.unitPriceCents - input.discountCents),
        notes: request.address ? `Endereço: ${request.address}` : null,
        clientName: request.requesterName || null,
        clientEmail: request.requesterEmail || null,
        validUntil: null,
        secureToken,
        status: input.sendNow ? "enviado" : "rascunho",
      })) as unknown as [{ insertId: number }];
      await db.insert(quoteItems).values({ quoteId: Number(insert[0].insertId), ...item, totalCents: item.unitPriceCents });
      await db.update(requests).set({ status: input.sendNow ? "orcamento_enviado" : "em_analise" }).where(eq(requests.id, request.id));
      return { success: true, quoteId: Number(insert[0].insertId), token: secureToken };
    }),
  }),

  quote: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const [rows, profileAppointments, profileRequests] = await Promise.all([
        db.select().from(quotes).where(eq(quotes.profileId, profile.id)).orderBy(desc(quotes.createdAt)),
        db.select({ id: appointments.id, notes: appointments.notes, clientId: appointments.clientId, amountCents: appointments.amountCents, status: appointments.status }).from(appointments).where(eq(appointments.profileId, profile.id)),
        db.select({ id: requests.id, status: requests.status }).from(requests).where(eq(requests.profileId, profile.id)),
      ]);

      return Promise.all(
        rows.map(async (q) => {
          let clientName = q.clientName;
          let clientEmail = q.clientEmail;
          let clientPhone: string | null = null;

          if (q.clientId) {
            const c = (await db.select().from(clients).where(eq(clients.id, q.clientId)).limit(1))[0];
            if (c) {
              clientName = clientName || c.name;
              clientEmail = clientEmail || c.email;
              clientPhone = c.phone || null;
            }
          }
          if (q.requestId) {
            const r = (await db.select().from(requests).where(eq(requests.id, q.requestId)).limit(1))[0];
            if (r) {
              clientName = clientName || r.requesterName;
              clientEmail = clientEmail || r.requesterEmail;
              clientPhone = clientPhone || r.requesterPhone;
            }
          }

          const matchedRequest = q.requestId ? profileRequests.find(r => r.id === q.requestId) : null;
          const isScheduled = profileAppointments.some(a =>
            a.notes?.includes(`[Orçamento #${q.id}]`) ||
            (q.clientId && a.clientId === q.clientId && (a.amountCents === q.totalCents || (q.description && a.notes?.includes(q.description.slice(0, 25))))) ||
            (matchedRequest?.status === "agendada")
          );

          return {
            ...q,
            receiptCode: generateReceiptAuthCode("Q", q.id, q.profileId, q.totalCents),
            clientName: clientName || null,
            clientEmail: clientEmail || null,
            clientPhone: clientPhone || null,
            isScheduled: Boolean(isScheduled),
            items: await db.select().from(quoteItems).where(eq(quoteItems.quoteId, q.id)),
          };
        })
      );
    }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const profile = await requireProfile(ctx.user.id);
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const existing = (
          await db
            .select()
            .from(quotes)
            .where(and(eq(quotes.id, input.id), eq(quotes.profileId, profile.id)))
            .limit(1)
        )[0];
        if (!existing) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Orçamento não encontrado." });
        }

        await db.delete(quoteItems).where(eq(quoteItems.quoteId, input.id));
        await db.delete(quotes).where(and(eq(quotes.id, input.id), eq(quotes.profileId, profile.id)));

        if (existing.requestId) {
          try {
            await db
              .update(requests)
              .set({ status: "em_analise" })
              .where(and(eq(requests.id, existing.requestId), eq(requests.profileId, profile.id)));
          } catch (e) {
            // ignore
          }
        }
        return { success: true };
      }),
    create: protectedProcedure.input(z.object({ clientId: z.number().optional(), requestId: z.number().optional(), serviceId: z.number().optional(), description: z.string().max(1800).optional(), discountCents: z.number().int().min(0).default(0), notes: z.string().max(1800).optional(), paymentTerms: z.string().max(1000).optional(), validUntil: z.string().datetime().optional(), sendNow: z.boolean().default(false), items: z.array(z.object({ description: z.string().min(1).max(180), quantity: z.number().min(0.01).max(1000), unitPriceCents: z.number().int().min(0) })).min(1) })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      if (input.clientId) await getOwnedClient(profile.id, input.clientId);
      if (input.serviceId) await getOwnedService(profile.id, input.serviceId);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const subtotalCents = input.items.reduce((sum, item) => sum + Math.round(item.quantity * item.unitPriceCents), 0);
      const totalCents = Math.max(0, subtotalCents - input.discountCents);
      const secureToken = nanoid(32);
      const insert = (await db.insert(quotes).values({ profileId: profile.id, clientId: input.clientId ?? null, requestId: input.requestId ?? null, serviceId: input.serviceId ?? null, description: input.description ?? null, subtotalCents, discountCents: input.discountCents, totalCents, notes: input.notes ?? null, paymentTerms: input.paymentTerms ?? null, changeRequest: null, validUntil: input.validUntil ? new Date(input.validUntil) : null, secureToken, status: input.sendNow ? "enviado" : "rascunho" })) as unknown as [{ insertId: number }];
      const quoteId = Number(insert[0].insertId);
      await db.insert(quoteItems).values(input.items.map(item => ({ quoteId, description: item.description, quantity: item.quantity, unitPriceCents: item.unitPriceCents, totalCents: Math.round(item.quantity * item.unitPriceCents) })));
      if (input.requestId) await db.update(requests).set({ status: input.sendNow ? "orcamento_enviado" : "em_analise" }).where(and(eq(requests.id, input.requestId), eq(requests.profileId, profile.id)));
      if (input.sendNow) await createNotification(profile.id, "Orçamento enviado", "Seu orçamento está disponível por um link público.", "quote");
      return { success: true, quoteId, token: input.sendNow ? secureToken : null };
    }),
    update: protectedProcedure.input(z.object({ id: z.number(), description: z.string().max(1800).optional(), discountCents: z.number().int().min(0).default(0), notes: z.string().max(1800).optional(), paymentTerms: z.string().max(1000).optional(), validUntil: z.string().datetime().optional(), sendNow: z.boolean().default(true), items: z.array(z.object({ description: z.string().min(1).max(180), quantity: z.number().min(0.01).max(1000), unitPriceCents: z.number().int().min(0) })).min(1) })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const existing = (await db.select().from(quotes).where(and(eq(quotes.id, input.id), eq(quotes.profileId, profile.id))).limit(1))[0];
      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Orçamento não encontrado." });
      const subtotalCents = input.items.reduce((sum, item) => sum + Math.round(item.quantity * item.unitPriceCents), 0);
      const totalCents = Math.max(0, subtotalCents - input.discountCents);
      await db.delete(quoteItems).where(eq(quoteItems.quoteId, input.id));
      await db.insert(quoteItems).values(input.items.map(item => ({ quoteId: input.id, description: item.description, quantity: item.quantity, unitPriceCents: item.unitPriceCents, totalCents: Math.round(item.quantity * item.unitPriceCents) })));
      await db.update(quotes).set({ description: input.description ?? existing.description, subtotalCents, discountCents: input.discountCents, totalCents, notes: input.notes ?? existing.notes, paymentTerms: input.paymentTerms ?? existing.paymentTerms, changeRequest: null, validUntil: input.validUntil ? new Date(input.validUntil) : existing.validUntil, status: input.sendNow ? "enviado" : "rascunho", respondedAt: null }).where(eq(quotes.id, input.id));
      if (input.sendNow) await createNotification(profile.id, "Orçamento revisado e reenviado", "A proposta atualizada está disponível no link do cliente.", "quote");
      return { success: true, token: input.sendNow ? existing.secureToken : null };
    }),
    publish: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const existing = (await db.select().from(quotes).where(and(eq(quotes.id, input.id), eq(quotes.profileId, profile.id))).limit(1))[0];
      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Orçamento não encontrado." });
      await db.update(quotes).set({ status: "enviado" }).where(eq(quotes.id, input.id));
      if (existing.requestId) {
        await db.update(requests).set({ status: "orcamento_enviado" }).where(and(eq(requests.id, existing.requestId), eq(requests.profileId, profile.id)));
      }
      await createNotification(profile.id, "Orçamento publicado", "O orçamento foi publicado e o link do cliente foi ativado.", "quote");
      return { success: true, token: existing.secureToken };
    }),
    getPublic: publicProcedure.input(z.object({ token: z.string().min(10) })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const quote = (await db.select().from(quotes).where(eq(quotes.secureToken, input.token)).limit(1))[0];
      if (!quote || quote.status === "rascunho") throw new TRPCError({ code: "NOT_FOUND", message: "Este orçamento está em rascunho e ainda não foi liberado para visualização pública." });
      const profile = (await db.select().from(professionalProfiles).where(eq(professionalProfiles.id, quote.profileId)).limit(1))[0];
      const items = await db.select().from(quoteItems).where(eq(quoteItems.quoteId, quote.id));
      return { quote, profile, items };
    }),
    respondPublic: publicProcedure.input(z.object({ token: z.string().min(10), action: z.enum(["aceito", "recusado", "alteracao_solicitada"]), clientName: z.string().optional(), clientEmail: z.string().email().optional().or(z.literal("")), changeRequestText: z.string().max(1200).optional() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const quote = (await db.select().from(quotes).where(eq(quotes.secureToken, input.token)).limit(1))[0];
      if (!quote || quote.status === "rascunho") throw new TRPCError({ code: "FORBIDDEN", message: "Este orçamento está em rascunho e não pode receber respostas públicas." });
      const updateData: Record<string, unknown> = { status: input.action, respondedAt: new Date() };
      if (input.action === "alteracao_solicitada" && input.changeRequestText) {
        updateData.changeRequest = input.changeRequestText;
        await createNotification(quote.profileId, "Alteração solicitada no Orçamento", `O cliente pediu ajuste: "${input.changeRequestText}". Acesse para revisar e reenviar a proposta.`, "quote_change_requested");
      } else if (input.action === "aceito") {
        if (input.clientName) updateData.clientName = input.clientName;
        if (input.clientEmail) updateData.clientEmail = input.clientEmail;
        if (!quote.clientId && input.clientName) {
          try {
            const inserted = (await db.insert(clients).values({
              profileId: quote.profileId,
              name: input.clientName,
              email: input.clientEmail || null,
            })) as unknown as [{ insertId: number }];
            if (inserted?.[0]?.insertId) {
              updateData.clientId = inserted[0].insertId;
            }
          } catch (e) {
            console.error("Erro ao registrar cliente no aceite do orçamento:", e);
          }
        }
        await createNotification(
          quote.profileId,
          "🎉 Orçamento APROVADO!",
          `${input.clientName || "O cliente"} aceitou o orçamento de R$ ${(quote.totalCents / 100).toFixed(2).replace(".", ",")}. Comprovante registrado para ${input.clientEmail || "o cliente"}.`,
          "quote_accepted"
        );

        // Disparo automático do e-mail de comprovação ao cliente (mesmo esquema do Catecismo com Resend)
        if (input.clientEmail) {
          try {
            const profile = (await db.select().from(professionalProfiles).where(eq(professionalProfiles.id, quote.profileId)).limit(1))[0];
            const items = await db.select().from(quoteItems).where(eq(quoteItems.quoteId, quote.id));
            const publicUrl = process.env.APP_URL || process.env.PUBLIC_URL || "https://meuautonomo.creativeam.com.br";
            const linkProposta = `${publicUrl}/orcamento/${quote.secureToken}`;

            const emailData = modeloOrcamentoAprovado({
              clienteNome: input.clientName || "Cliente",
              clienteEmail: input.clientEmail,
              profissionalNome: profile?.displayName || "Profissional",
              profissionalProfissao: profile?.professionName || undefined,
              profissionalWhatsapp: profile?.whatsapp || undefined,
              orcamentoId: quote.id,
              totalCents: quote.totalCents,
              paymentTerms: quote.paymentTerms || undefined,
              notes: quote.notes || undefined,
              items: items.map(it => ({
                description: it.description,
                quantity: it.quantity,
                unitPriceCents: it.unitPriceCents,
                totalCents: it.totalCents,
              })),
              linkProposta,
            });

            await enviarEmail({
              para: input.clientEmail,
              assunto: emailData.assunto,
              texto: emailData.texto,
              html: emailData.html,
            });
          } catch (emailErr) {
            console.error("[Email] Erro ao enviar e-mail de confirmação:", emailErr);
          }
        }
      } else {
        await createNotification(quote.profileId, "Orçamento recusado", "O cliente recusou a proposta.", "quote_response");
      }
      if (quote.requestId) {
        try {
          if (input.action === "aceito") {
            await db.update(requests).set({ status: "proposta_aceita" }).where(eq(requests.id, quote.requestId));
          } else if (input.action === "alteracao_solicitada") {
            await db.update(requests).set({ status: "em_analise" }).where(eq(requests.id, quote.requestId));
          }
        } catch (reqUpdateErr) {
          console.warn("[respondPublic] Erro ao sincronizar status da solicitação:", reqUpdateErr);
        }
      }
      await db.update(quotes).set(updateData).where(eq(quotes.id, quote.id));
      return { success: true };
    }),

    convertToAppointment: protectedProcedure
      .input(z.object({
        id: z.number(),
        startsAt: z.string().datetime(),
        durationMinutes: z.number().int().min(15).max(1440).default(60),
        location: z.string().max(600).optional(),
        notes: z.string().max(1200).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const profile = await requireProfile(ctx.user.id);
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const quote = (await db.select().from(quotes).where(and(eq(quotes.id, input.id), eq(quotes.profileId, profile.id))).limit(1))[0];
        if (!quote) throw new TRPCError({ code: "NOT_FOUND", message: "Orçamento não encontrado." });

        let effectiveClientId = quote.clientId;
        if (!effectiveClientId && quote.clientName) {
          const existing = (await db.select().from(clients).where(and(eq(clients.profileId, profile.id), eq(clients.name, quote.clientName))).limit(1))[0];
          if (existing) {
            effectiveClientId = existing.id;
          } else {
            const ins = (await db.insert(clients).values({
              profileId: profile.id,
              name: quote.clientName,
              email: quote.clientEmail || null,
              phone: null,
            })) as unknown as [{ insertId: number }];
            effectiveClientId = Number(ins[0].insertId);
            await db.update(quotes).set({ clientId: effectiveClientId }).where(eq(quotes.id, quote.id));
          }
        }

        const notePrefix = `[Orçamento #${quote.id}]`;
        const rawNotes = input.notes || quote.description || "";
        const finalNotes = rawNotes.includes(notePrefix) ? rawNotes : `${notePrefix} ${rawNotes}`.trim();

        const existingAppointment = (await db.select().from(appointments).where(and(eq(appointments.profileId, profile.id), like(appointments.notes, `%${notePrefix}%`))).limit(1))[0];
        if (existingAppointment) {
          await db.update(appointments).set({
            startsAt: new Date(input.startsAt),
            durationMinutes: input.durationMinutes,
            location: input.location || existingAppointment.location,
            notes: finalNotes,
            amountCents: quote.totalCents,
          }).where(eq(appointments.id, existingAppointment.id));

          return { success: true, appointmentId: existingAppointment.id, updated: true };
        }

        const inserted = (await db.insert(appointments).values({
          profileId: profile.id,
          clientId: effectiveClientId ?? null,
          serviceId: quote.serviceId ?? null,
          startsAt: new Date(input.startsAt),
          durationMinutes: input.durationMinutes,
          location: input.location || "",
          amountCents: quote.totalCents,
          notes: finalNotes,
          status: "confirmado",
          paymentStatus: "pendente",
        })) as unknown as [{ insertId: number }];

        if (quote.requestId) {
          await db.update(requests).set({ status: "agendada" }).where(eq(requests.id, quote.requestId));
        }

        await createNotification(
          profile.id,
          "Atendimento agendado",
          `O orçamento #${quote.id} foi incluído na sua agenda para ${new Date(input.startsAt).toLocaleDateString("pt-BR")}.`,
          "appointment"
        );

        return { success: true, appointmentId: Number(inserted[0].insertId) };
      }),
  }),

  payment: router({
    list: protectedProcedure.input(z.object({ from: z.string().datetime().optional(), to: z.string().datetime().optional() }).optional()).query(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const payConditions = [eq(payments.profileId, profile.id)];
      if (input?.from) payConditions.push(gte(payments.createdAt, new Date(input.from)));
      if (input?.to) payConditions.push(lte(payments.createdAt, new Date(input.to)));

      const appConditions = [eq(appointments.profileId, profile.id), ne(appointments.status, "cancelado")];
      if (input?.from) appConditions.push(gte(appointments.startsAt, new Date(input.from)));
      if (input?.to) appConditions.push(lte(appointments.startsAt, new Date(input.to)));

      const [rawPayments, periodAppointments, profileClients, profileServices] = await Promise.all([
        db.select().from(payments).where(and(...payConditions)).orderBy(desc(payments.createdAt)),
        db.select().from(appointments).where(and(...appConditions)).orderBy(desc(appointments.startsAt)),
        db.select({ id: clients.id, name: clients.name }).from(clients).where(eq(clients.profileId, profile.id)),
        db.select({ id: services.id, name: services.name }).from(services).where(eq(services.profileId, profile.id)),
      ]);

      const clientMap = new Map(profileClients.map(c => [c.id, c.name]));
      const serviceMap = new Map(profileServices.map(s => [s.id, s.name]));

      const { paymentsByAppointmentId } = associatePaymentsToAppointments(
        periodAppointments as any,
        rawPayments as any
      );
      const appointmentIdByPaymentId = new Map<number, number>();
      for (const [appointmentId, linkedPayments] of paymentsByAppointmentId) {
        for (const payment of linkedPayments) appointmentIdByPaymentId.set(payment.id, appointmentId);
      }

      const rows: any[] = rawPayments.map(r => ({
        ...r,
        // Expõe o vínculo inferido também na listagem, sem alterar o registro no banco.
        appointmentId: r.appointmentId ?? appointmentIdByPaymentId.get(r.id) ?? null,
        clientName: r.clientId ? clientMap.get(r.clientId) || null : null,
        serviceName: r.serviceId ? serviceMap.get(r.serviceId) || null : null,
      }));

      for (const app of periodAppointments) {
        if (!isBillableAppointment(app.status)) continue;

        const linkedPayments = paymentsByAppointmentId.get(app.id) || [];
        const recordedAmount = linkedPayments.reduce((sum, payment) => sum + payment.amountCents, 0);
        const remainingCents = linkedPayments.length > 0
          ? Math.max(0, app.amountCents - recordedAmount)
          : app.amountCents;
        if (remainingCents <= 0) continue;

        const hasLegacyPaidState =
          app.paymentStatus === "pago" ||
          (app.paymentStatus == null && app.status === "concluido");
        // Quando já há lançamentos financeiros, eles são a fonte de verdade:
        // o saldo ainda não coberto permanece pendente.
        const status = linkedPayments.length > 0 ? "pendente" : hasLegacyPaidState ? "pago" : "pendente";

        rows.push({
          id: -app.id,
          profileId: app.profileId,
          teamMemberId: app.teamMemberId,
          appointmentId: app.id,
          clientId: app.clientId,
          serviceId: app.serviceId,
          amountCents: remainingCents,
          commissionPercent: null,
          commissionAmountCents: 0,
          studioAmountCents: remainingCents,
          commissionPaid: false,
          method: (app.paymentMethod as any) || "pix",
          status,
          note: linkedPayments.length > 0
            ? `Saldo pendente do atendimento #${app.id}`
            : app.notes || null,
          paidAt: status === "pago" ? app.startsAt : null,
          createdAt: app.startsAt,
          clientName: app.clientId ? clientMap.get(app.clientId) || null : null,
          serviceName: app.serviceId ? serviceMap.get(app.serviceId) || null : null,
        });
      }

      rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return rows;
    }),
    create: protectedProcedure.input(z.object({
      appointmentId: z.number().optional(),
      clientId: z.number().optional(),
      serviceId: z.number().optional(),
      teamMemberId: z.number().optional(),
      amountCents: z.number().int().positive(),
      method: paymentMethod,
      status: paymentStatus,
      note: z.string().max(600).optional(),
      paidAt: z.string().datetime().optional()
    })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      if (input.clientId) await getOwnedClient(profile.id, input.clientId);
      if (input.serviceId) await getOwnedService(profile.id, input.serviceId);

      let resolvedAppointmentId = input.appointmentId ?? null;
      let resolvedClientId = input.clientId ?? null;
      let resolvedServiceId = input.serviceId ?? null;
      let resolvedTeamMemberId = input.teamMemberId ?? null;

      // Se appointmentId foi fornecido explicitamente, herdar dados ausentes do agendamento
      if (resolvedAppointmentId) {
        const appRow = (await db.select().from(appointments).where(and(eq(appointments.id, resolvedAppointmentId), eq(appointments.profileId, profile.id))).limit(1))[0];
        if (!appRow) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Atendimento não encontrado para este lançamento." });
        }
        if (!resolvedClientId && appRow.clientId) resolvedClientId = appRow.clientId;
        if (!resolvedServiceId && appRow.serviceId) resolvedServiceId = appRow.serviceId;
        if (!resolvedTeamMemberId && appRow.teamMemberId) resolvedTeamMemberId = appRow.teamMemberId;
      } else if (resolvedClientId) {
        // Se appointmentId NÃO foi fornecido, mas temos clientId:
        // Procurar agendamento compatível não cancelado e ainda não totalmente pago
        const candidateApps = await db.select().from(appointments).where(and(
          eq(appointments.profileId, profile.id),
          eq(appointments.clientId, resolvedClientId),
          ne(appointments.status, "cancelado")
        )).orderBy(desc(appointments.startsAt));

        // Priorizar: 1) mesmo serviço e valor exato; 2) mesmo serviço; 3) valor exato; 4) primeiro agendamento pendente
        const matched = candidateApps.find(a => (resolvedServiceId ? a.serviceId === resolvedServiceId : true) && a.amountCents === input.amountCents && a.paymentStatus !== "pago")
          || candidateApps.find(a => (resolvedServiceId ? a.serviceId === resolvedServiceId : true) && a.paymentStatus !== "pago")
          || candidateApps.find(a => a.paymentStatus !== "pago");

        if (matched) {
          resolvedAppointmentId = matched.id;
          if (!resolvedServiceId && matched.serviceId) resolvedServiceId = matched.serviceId;
          if (!resolvedTeamMemberId && matched.teamMemberId) resolvedTeamMemberId = matched.teamMemberId;
        }
      }
      
      let commissionPercent = 0;
      let commissionAmountCents = 0;
      let studioAmountCents = input.amountCents;

      if (resolvedTeamMemberId) {
        const member = await getOwnedTeamMember(profile.id, resolvedTeamMemberId);
        commissionPercent = member.commissionPercent;
        const comm = calculateCommissionAndStudio(input.amountCents, commissionPercent);
        commissionAmountCents = comm.commissionCents;
        studioAmountCents = comm.studioCents;
      }

      await db.insert(payments).values({
        profileId: profile.id,
        teamMemberId: resolvedTeamMemberId,
        appointmentId: resolvedAppointmentId,
        clientId: resolvedClientId,
        serviceId: resolvedServiceId,
        amountCents: input.amountCents,
        commissionPercent: commissionPercent || null,
        commissionAmountCents,
        studioAmountCents,
        commissionPaid: false,
        method: input.method,
        status: input.status,
        note: input.note ?? null,
        paidAt: input.paidAt ? new Date(input.paidAt) : input.status === "pago" ? new Date() : null
      });

      if (resolvedAppointmentId) {
        const [appointmentRow] = await db.select({
          amountCents: appointments.amountCents,
        }).from(appointments).where(and(
          eq(appointments.id, resolvedAppointmentId),
          eq(appointments.profileId, profile.id)
        )).limit(1);
        const linkedPayments = await db.select({
          amountCents: payments.amountCents,
          status: payments.status,
        }).from(payments).where(and(
          eq(payments.profileId, profile.id),
          eq(payments.appointmentId, resolvedAppointmentId)
        ));
        const paidCents = linkedPayments
          .filter(payment => payment.status === "pago")
          .reduce((sum, payment) => sum + payment.amountCents, 0);
        const nextPaymentStatus = paidCents >= (appointmentRow?.amountCents || 0)
          ? "pago"
          : paidCents > 0
            ? "parcial"
            : "pendente";

        await db.update(appointments).set({
          paymentStatus: nextPaymentStatus,
          paymentMethod: input.method,
          teamMemberId: resolvedTeamMemberId ?? undefined
        }).where(and(eq(appointments.id, resolvedAppointmentId), eq(appointments.profileId, profile.id)));
      }
      return { success: true };
    }),
  }),

  team: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      return db.select().from(teamMembers).where(eq(teamMembers.profileId, profile.id)).orderBy(desc(teamMembers.createdAt));
    }),

    create: protectedProcedure.input(z.object({
      name: z.string().min(2, "Nome deve ter ao menos 2 caracteres").max(160),
      role: z.string().min(2, "Função/especialidade é obrigatória").max(120),
      phone: z.string().max(40).optional(),
      email: z.string().email("E-mail inválido").max(320).optional().or(z.literal("")),
      pixKey: z.string().max(140).optional(),
      pixKeyType: z.string().max(30).optional(),
      commissionPercent: z.number().int().min(0).max(100).default(50),
      color: z.string().max(30).optional(),
      notes: z.string().max(600).optional(),
    })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const insert = (await db.insert(teamMembers).values({
        profileId: profile.id,
        name: input.name.trim(),
        role: input.role.trim(),
        phone: input.phone?.trim() || null,
        email: input.email ? input.email.trim() : null,
        pixKey: input.pixKey?.trim() || null,
        pixKeyType: input.pixKeyType || null,
        commissionPercent: input.commissionPercent,
        color: input.color || "#e11d48",
        notes: input.notes?.trim() || null,
        active: true,
      })) as unknown as [{ insertId: number }];
      return { success: true, id: Number(insert[0]?.insertId) };
    }),

    update: protectedProcedure.input(z.object({
      id: z.number(),
      name: z.string().min(2).max(160),
      role: z.string().min(2).max(120),
      phone: z.string().max(40).optional(),
      email: z.string().email().max(320).optional().or(z.literal("")),
      pixKey: z.string().max(140).optional(),
      pixKeyType: z.string().max(30).optional(),
      commissionPercent: z.number().int().min(0).max(100),
      color: z.string().max(30).optional(),
      notes: z.string().max(600).optional(),
      active: z.boolean().optional(),
    })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      await getOwnedTeamMember(profile.id, input.id);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(teamMembers).set({
        name: input.name.trim(),
        role: input.role.trim(),
        phone: input.phone?.trim() || null,
        email: input.email ? input.email.trim() : null,
        pixKey: input.pixKey?.trim() || null,
        pixKeyType: input.pixKeyType || null,
        commissionPercent: input.commissionPercent,
        color: input.color || "#e11d48",
        notes: input.notes?.trim() || null,
        active: input.active !== undefined ? input.active : true,
      }).where(and(eq(teamMembers.id, input.id), eq(teamMembers.profileId, profile.id)));
      return { success: true };
    }),

    toggleActive: protectedProcedure.input(z.object({ id: z.number(), active: z.boolean() })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      await getOwnedTeamMember(profile.id, input.id);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(teamMembers).set({ active: input.active }).where(and(eq(teamMembers.id, input.id), eq(teamMembers.profileId, profile.id)));
      return { success: true };
    }),

    remove: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      await getOwnedTeamMember(profile.id, input.id);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.delete(teamMembers).where(and(eq(teamMembers.id, input.id), eq(teamMembers.profileId, profile.id)));
      return { success: true };
    }),

    uploadAvatar: protectedProcedure.input(z.object({
      fileName: z.string().max(180),
      mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
      dataUrl: z.string().max(7_000_000)
    })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const encoded = input.dataUrl.split(",")[1];
      if (!encoded) throw new TRPCError({ code: "BAD_REQUEST", message: "Arquivo inválido." });
      const buffer = Buffer.from(encoded, "base64");
      if (buffer.length > 5_000_000) throw new TRPCError({ code: "BAD_REQUEST", message: "A foto deve ter no máximo 5 MB." });
      const sanitizedName = input.fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
      let avatarUrl = input.dataUrl;
      try {
        const stored = await storagePut(`profiles/${profile.id}/team-avatar-${Date.now()}-${sanitizedName}`, buffer, input.mimeType);
        if (stored?.url) avatarUrl = stored.url;
      } catch (err) {
        console.warn("[team.uploadAvatar] Storage put failed, using dataUrl fallback:", err);
      }
      return { success: true, avatarUrl };
    }),

    report: protectedProcedure.input(z.object({
      from: z.string().datetime().optional(),
      to: z.string().datetime().optional(),
      teamMemberId: z.number().optional(),
    }).optional()).query(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const members = await db.select().from(teamMembers).where(eq(teamMembers.profileId, profile.id));

      const payConditions = [eq(payments.profileId, profile.id)];
      if (input?.from) payConditions.push(gte(payments.createdAt, new Date(input.from)));
      if (input?.to) payConditions.push(lt(payments.createdAt, new Date(input.to)));
      // Não filtrar pagamentos pelo teamMemberId antes de tentar associá-los:
      // lançamentos antigos feitos pelo Financeiro podem não ter esse campo preenchido,
      // embora pertençam a um atendimento de um parceiro.
      const periodPayments = await db.select().from(payments).where(and(...payConditions)).orderBy(desc(payments.createdAt));

      const appConditions = [eq(appointments.profileId, profile.id), ne(appointments.status, "cancelado")];
      if (input?.from) appConditions.push(gte(appointments.startsAt, new Date(input.from)));
      if (input?.to) appConditions.push(lt(appointments.startsAt, new Date(input.to)));
      if (input?.teamMemberId) appConditions.push(eq(appointments.teamMemberId, input.teamMemberId));
      const periodAppointments = await db.select().from(appointments).where(and(...appConditions));

      const expConditions = [eq(expenses.profileId, profile.id)];
      if (input?.from) expConditions.push(gte(expenses.occurredAt, new Date(input.from)));
      if (input?.to) expConditions.push(lt(expenses.occurredAt, new Date(input.to)));
      const periodExpenses = await db.select().from(expenses).where(and(...expConditions));

      const targetMembers = input?.teamMemberId
        ? members.filter(m => m.id === input.teamMemberId)
        : members;
      const reportPayments = input?.teamMemberId
        ? periodPayments.filter(payment =>
            payment.teamMemberId === input.teamMemberId ||
            periodAppointments.some(app =>
              app.id === payment.appointmentId ||
              (payment.clientId != null &&
                app.clientId === payment.clientId &&
                (!payment.serviceId || app.serviceId === payment.serviceId))
            )
          )
        : periodPayments;

      return calculateTeamReport(
        targetMembers,
        periodAppointments as any,
        reportPayments as any,
        periodExpenses as any
      );
    }),
  }),

  expense: router({
    list: protectedProcedure.input(z.object({ from: z.string().datetime().optional(), to: z.string().datetime().optional() }).optional()).query(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const conditions = [eq(expenses.profileId, profile.id)];
      if (input?.from) conditions.push(gte(expenses.occurredAt, new Date(input.from)));
      if (input?.to) conditions.push(lte(expenses.occurredAt, new Date(input.to)));
      return db.select().from(expenses).where(and(...conditions)).orderBy(desc(expenses.occurredAt));
    }),
    create: protectedProcedure.input(z.object({ description: z.string().min(2).max(180), category: z.string().max(100).optional(), amountCents: z.number().int().positive(), occurredAt: z.string().datetime().optional(), note: z.string().max(600).optional() })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db.insert(expenses).values({ profileId: profile.id, description: input.description, category: input.category ?? null, amountCents: input.amountCents, occurredAt: input.occurredAt ? new Date(input.occurredAt) : new Date(), note: input.note ?? null });
      return { success: true };
    }),
    remove: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.delete(expenses).where(and(eq(expenses.id, input.id), eq(expenses.profileId, profile.id)));
      return { success: true };
    }),
  }),

  notification: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      return db.select().from(notifications).where(eq(notifications.profileId, profile.id)).orderBy(desc(notifications.createdAt)).limit(30);
    }),
    markRead: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(notifications).set({ read: true }).where(and(eq(notifications.id, input.id), eq(notifications.profileId, profile.id)));
      return { success: true };
    }),
    markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(notifications).set({ read: true }).where(and(eq(notifications.profileId, profile.id), eq(notifications.read, false)));
      return { success: true };
    }),
    unreadCount: protectedProcedure.query(async ({ ctx }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const rows = await db.select({ id: notifications.id }).from(notifications).where(and(eq(notifications.profileId, profile.id), eq(notifications.read, false)));
      return rows.length;
    }),
  }),

  reports: router({
    summary: protectedProcedure.input(z.object({ from: z.string().datetime().optional(), to: z.string().datetime().optional() }).optional()).query(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const appConditions = [eq(appointments.profileId, profile.id), ne(appointments.status, "cancelado")];
      const payConditions = [eq(payments.profileId, profile.id)];
      const clientConditions = [eq(clients.profileId, profile.id)];

      if (input?.from) {
        const fromDate = new Date(input.from);
        appConditions.push(gte(appointments.startsAt, fromDate));
        payConditions.push(gte(payments.createdAt, fromDate));
        clientConditions.push(gte(clients.createdAt, fromDate));
      }
      if (input?.to) {
        const toDate = new Date(input.to);
        appConditions.push(lte(appointments.startsAt, toDate));
        payConditions.push(lte(payments.createdAt, toDate));
        clientConditions.push(lte(clients.createdAt, toDate));
      }

      const [periodAppointments, periodPayments, periodClients, profileServices] = await Promise.all([
        db.select().from(appointments).where(and(...appConditions)),
        db.select().from(payments).where(and(...payConditions)),
        db.select().from(clients).where(and(...clientConditions)),
        db.select().from(services).where(eq(services.profileId, profile.id)),
      ]);
      const metrics = calculateDeduplicatedMetrics(periodAppointments as any, periodPayments as any);
      const counts = new Map<number, number>();
      for (const item of periodAppointments) if (item.serviceId) counts.set(item.serviceId, (counts.get(item.serviceId) || 0) + 1);
      const topServices = Array.from(counts.entries()).map(([serviceId, count]) => ({ serviceId, count, name: profileServices.find(service => service.id === serviceId)?.name || "Serviço" })).sort((a, b) => b.count - a.count).slice(0, 5);
      const allClientAppointments = await db.select({ clientId: appointments.clientId }).from(appointments).where(and(eq(appointments.profileId, profile.id), ne(appointments.status, "cancelado")));
      const clientVisitCounts = new Map<number, number>();
      for (const item of allClientAppointments) if (item.clientId) clientVisitCounts.set(item.clientId, (clientVisitCounts.get(item.clientId) || 0) + 1);
      const recurringClientIds = Array.from(clientVisitCounts.values()).filter(count => count > 1).length;
      return { from: input?.from ? new Date(input.from) : null, to: input?.to ? new Date(input.to) : null, revenueCents: metrics.faturamentoCents, receivedCents: metrics.recebidoCents, pendingCents: metrics.pendenteCents, appointmentCount: metrics.appointmentCount, newClients: periodClients.length, recurringClients: recurringClientIds, topServices };
    }),
  }),

  dashboard: router({
    summary: protectedProcedure.input(z.object({ from: z.string().datetime().optional(), to: z.string().datetime().optional() }).optional()).query(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const today = await db.select().from(appointments).where(and(eq(appointments.profileId, profile.id), gte(appointments.startsAt, dayStart()), lt(appointments.startsAt, dayEnd()))).orderBy(appointments.startsAt);
      const recentRequests = await db.select().from(requests).where(and(eq(requests.profileId, profile.id), ne(requests.status, "arquivada"))).orderBy(desc(requests.createdAt)).limit(4);
      const pendingQuotes = await db.select().from(quotes).where(and(eq(quotes.profileId, profile.id), eq(quotes.status, "enviado"))).orderBy(desc(quotes.createdAt)).limit(4);
      const appConditions = [eq(appointments.profileId, profile.id), ne(appointments.status, "cancelado")];
      const payConditions = [eq(payments.profileId, profile.id)];
      const expConditions = [eq(expenses.profileId, profile.id)];

      if (input?.from) {
        const fromDate = new Date(input.from);
        appConditions.push(gte(appointments.startsAt, fromDate));
        payConditions.push(gte(payments.createdAt, fromDate));
        expConditions.push(gte(expenses.occurredAt, fromDate));
      }
      if (input?.to) {
        const toDate = new Date(input.to);
        appConditions.push(lte(appointments.startsAt, toDate));
        payConditions.push(lte(payments.createdAt, toDate));
        expConditions.push(lte(expenses.occurredAt, toDate));
      }

      const monthAppointments = await db.select().from(appointments).where(and(...appConditions));
      const monthPayments = await db.select().from(payments).where(and(...payConditions));
      const monthExpenses = await db.select().from(expenses).where(and(...expConditions));

      const metrics = calculateDeduplicatedMetrics(monthAppointments as any, monthPayments as any, monthExpenses as any);
      const projected = today.reduce((sum, item) => sum + (isBillableAppointment(item.status) ? item.amountCents : 0), 0);

      const seriesMap = new Map<string, { date: string; receitas: number; pendentes: number; despesas: number }>();
      const ensureDay = (date: Date) => { const key = date.toISOString().slice(0, 10); if (!seriesMap.has(key)) seriesMap.set(key, { date: key, receitas: 0, pendentes: 0, despesas: 0 }); return seriesMap.get(key)!; };

      const { paymentsByAppointmentId } = associatePaymentsToAppointments(
        monthAppointments as any,
        monthPayments as any
      );

      // Lançamentos financeiros aparecem na data em que foram registrados.
      // A associação compartilhada impede que pagamento + atendimento sejam somados duas vezes.
      for (const payment of monthPayments) {
        const day = ensureDay(new Date(payment.createdAt));
        if (payment.status === "pago") day.receitas += payment.amountCents;
        else day.pendentes += payment.amountCents;
      }

      for (const app of monthAppointments) {
        if (!isBillableAppointment(app.status) || app.amountCents <= 0) continue;
        const linkedPayments = paymentsByAppointmentId.get(app.id) || [];
        const recordedAmount = linkedPayments.reduce((sum, payment) => sum + payment.amountCents, 0);
        const remainingCents = linkedPayments.length > 0
          ? Math.max(0, app.amountCents - recordedAmount)
          : app.amountCents;

        if (remainingCents > 0) {
          const day = ensureDay(new Date(app.startsAt));
          // Se já existem pagamentos lançados, o saldo não coberto permanece pendente.
          const legacyPaid =
            linkedPayments.length === 0 &&
            (app.paymentStatus === "pago" ||
              (app.paymentStatus == null && app.status === "concluido"));
          if (legacyPaid) day.receitas += remainingCents;
          else day.pendentes += remainingCents;
        }
      }
      for (const expense of monthExpenses) {
        const day = ensureDay(new Date(expense.occurredAt));
        day.despesas += expense.amountCents;
      }
      const monthlySeries = Array.from(seriesMap.values()).sort((a, b) => a.date.localeCompare(b.date)).map((day, index, rows) => ({ ...day, saldo: rows.slice(0, index + 1).reduce((sum, item) => sum + item.receitas - item.despesas, 0) }));

      return {
        profile,
        today,
        recentRequests,
        pendingQuotes,
        monthlySeries,
        metrics: {
          todayCount: today.filter(a => isCountableAppointment(a.status)).length,
          todayProjectedCents: projected,
          receivedCents: metrics.recebidoCents,
          pendingCents: metrics.pendenteCents,
          monthRevenueCents: metrics.faturamentoCents,
          expensesCents: metrics.despesasCents,
          balanceCents: metrics.saldoCents,
        }
      };
    }),
  }),

  publicProfile: router({
    bySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
      const profile = await getProfileBySlug(input.slug);
      if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "Profissional não encontrado." });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const profileServices = await db.select().from(services).where(and(eq(services.profileId, profile.id), eq(services.active, true))).orderBy(services.name);
      return { profile, services: profileServices };
    }),
  }),

  database: router({
    reset: protectedProcedure.mutation(async () => {
      const { resetMockDb } = await import("./mockDb");
      resetMockDb();
      return { success: true };
    }),
  }),

  admin: router({
    login: publicProcedure
      .input(z.object({ email: z.string().min(1), password: z.string().min(1) }))
      .mutation(async ({ ctx, input }) => {
        const inputLogin = input.email.trim().toLowerCase();
        const inputPassword = input.password.trim();
        const adminEmail = getAdminEmail().trim().toLowerCase();
        const adminUser = getAdminUsername().trim().toLowerCase();
        const adminPassword = getAdminPassword().trim();

        // Identificadores válidos para o administrador mestre
        const allowedLogins = new Set([
          adminEmail,
          adminUser,
          "meuautonomomaster",
          "meuatonomomaster",
          "meuautonomomaster@creativeam.com.br",
          "meuatonomomaster@creativeam.com.br",
          "admin",
          "admin@meuautonomo.com.br",
          "contato@meuautonomo.com.br",
          "olirumtecapp@gmail.com",
          "admin_master",
        ].filter(Boolean));

        const validLogin = allowedLogins.has(inputLogin);
        const validPassword =
          Boolean(adminPassword) &&
          (secureEquals(input.password, adminPassword) || secureEquals(inputPassword, adminPassword));

        if (!validLogin || !validPassword) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Credenciais de administrador incorretas." });
        }
        const openId = "admin_master";
        await upsertUser({
          openId,
          name: "Administrador do Sistema",
          email: adminEmail,
          role: "admin",
          loginMethod: "admin-panel",
          lastSignedIn: new Date(),
        });
        const sessionToken = await sdk.createSessionToken(openId, {
          name: "Administrador",
          expiresInMs: ONE_YEAR_MS,
        });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        return { success: true, email: adminEmail, sessionToken };
      }),

    getMetrics: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a administradores." });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const allUsers = await db.select().from(users);
      const allProfiles = await db.select().from(professionalProfiles);
      const allQuotes = await db.select().from(quotes);
      const allClients = await db.select().from(clients);
      const allAppointments = await db.select().from(appointments);
      const allServices = await db.select().from(services);

      const adminEmail = getAdminEmail().toLowerCase();
      // Contar apenas profissionais válidos cadastrados (excluindo resíduos técnicos sem identificação e a conta mestre do admin)
      const validProfessionals = allUsers.filter(u =>
        u.email &&
        u.name &&
        u.role !== "admin" &&
        u.email.toLowerCase() !== adminEmail &&
        u.openId !== "admin_master"
      );

      const totalQuotedCents = allQuotes.reduce((acc, q) => acc + (q.totalCents || 0), 0);
      const acceptedQuotes = allQuotes.filter(q => q.status === "aceito");
      const acceptedQuotedCents = acceptedQuotes.reduce((acc, q) => acc + (q.totalCents || 0), 0);

      return {
        usersCount: validProfessionals.length,
        totalRawUsersCount: allUsers.length,
        profilesCount: allProfiles.length,
        quotesCount: allQuotes.length,
        acceptedQuotesCount: acceptedQuotes.length,
        totalQuotedCents,
        acceptedQuotedCents,
        clientsCount: allClients.length,
        appointmentsCount: allAppointments.length,
        servicesCount: allServices.length,
        demoMode: isDemoMode(),
      };
    }),

    listUsers: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a administradores." });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
      const allProfiles = await db.select().from(professionalProfiles);
      const allClients = await db.select().from(clients);
      const allQuotes = await db.select().from(quotes);
      const allAppointments = await db.select().from(appointments);
      const adminEmail = getAdminEmail().toLowerCase();

      // Deduplica visualmente registros de admin (mantendo o mais recente)
      let seenAdmin = false;
      const filteredUsers = allUsers.filter(u => {
        const isAdmin = u.openId === "admin_master" || (u.email && u.email.toLowerCase() === adminEmail);
        if (isAdmin) {
          if (seenAdmin) return false;
          seenAdmin = true;
          return true;
        }
        return true;
      });

      return filteredUsers.map(u => {
        const prof = allProfiles.find(p => p.userId === u.id);
        const isIncomplete = !u.name && !u.email;
        const clientsCount = prof ? allClients.filter(c => c.profileId === prof.id).length : 0;
        const quotesCount = prof ? allQuotes.filter(q => q.profileId === prof.id).length : 0;
        const appointmentsCount = prof ? allAppointments.filter(a => a.profileId === prof.id).length : 0;
        return {
          id: u.id,
          name: u.name || (isIncomplete ? "Cadastro Incompleto (Sessão Antiga)" : "Sem nome"),
          email: u.email || "Sem e-mail",
          role: u.role,
          loginMethod: u.loginMethod,
          createdAt: u.createdAt,
          lastSignedIn: u.lastSignedIn,
          profileName: prof?.displayName || (isIncomplete ? "—" : "Sem perfil"),
          profession: prof?.professionName || "—",
          city: prof?.city || "—",
          slug: prof?.slug || "—",
          isIncomplete,
          clientsCount,
          quotesCount,
          appointmentsCount,
        };
      });
    }),

    cleanGhostSessions: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a administradores." });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const adminEmail = getAdminEmail().toLowerCase();

      const allProfiles = await db.select({ userId: professionalProfiles.userId }).from(professionalProfiles);
      const protectedUserIds = new Set(allProfiles.map(p => p.userId));

      const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));

      // Sessões fantasmas sem nome e sem e-mail e sem perfil
      const ghostUserIds = allUsers
        .filter(u => !u.name && !u.email && u.role === "user" && !protectedUserIds.has(u.id))
        .map(u => u.id);

      // Duplicatas antigas do admin (preserva apenas o mais recente)
      const adminRows = allUsers.filter(u => u.openId === "admin_master" || (u.email && u.email.toLowerCase() === adminEmail));
      const duplicateAdminIds = adminRows.slice(1).map(u => u.id);

      const toDelete = [...ghostUserIds, ...duplicateAdminIds];

      if (toDelete.length > 0) {
        for (const id of toDelete) {
          await db.delete(users).where(eq(users.id, id));
        }
      }

      return {
        success: true,
        deletedGhostCount: ghostUserIds.length,
        deletedAdminDuplicates: duplicateAdminIds.length,
        remainingUsersCount: allUsers.length - toDelete.length,
      };
    }),

    resetDatabase: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a administradores." });
      }
      const db = await getDb();
      if (db && process.env.DATABASE_URL) {
        await db.delete(quoteItems);
        await db.delete(quotes);
        await db.delete(requestAttachments);
        await db.delete(requests);
        await db.delete(appointments);
        await db.delete(payments);
        await db.delete(expenses);
        await db.delete(teamMembers);
        await db.delete(services);
        await db.delete(availability);
        await db.delete(clients);
        await db.delete(notifications);
        await db.delete(voucherRedemptions);
        await db.delete(professionalProfiles);
        await db.delete(users).where(ne(users.id, ctx.user.id));
      }
      const { resetMockDb } = await import("./mockDb");
      resetMockDb();
      return { success: true, message: "Banco de dados zerado com sucesso! Sua conta de administrador foi preservada." };
    }),

    setDemoMode: protectedProcedure
      .input(z.object({ enabled: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a administradores." });
        }
        setDemoMode(input.enabled);
        return { success: true, demoMode: isDemoMode() };
      }),

    listVouchers: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a administradores." });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const allVouchers = await db.select().from(vouchers).orderBy(desc(vouchers.createdAt));
      const allRedemptions = await db.select().from(voucherRedemptions).orderBy(desc(voucherRedemptions.redeemedAt));
      const allUsers = await db.select().from(users);
      const allProfiles = await db.select().from(professionalProfiles);

      const redemptionsWithDetails = allRedemptions.map(r => {
        const u = allUsers.find(user => user.id === r.userId);
        const p = allProfiles.find(prof => prof.id === r.profileId);
        return {
          id: r.id,
          voucherId: r.voucherId,
          voucherCode: r.voucherCode,
          userName: u?.name || "Usuário",
          userEmail: u?.email || "Sem e-mail",
          profileName: p?.displayName || "Sem perfil",
          redeemedAt: r.redeemedAt,
        };
      });

      return {
        vouchers: allVouchers,
        redemptions: redemptionsWithDetails,
      };
    }),

    createVoucher: protectedProcedure
      .input(
        z.object({
          code: z.string().min(3).max(50),
          description: z.string().max(255).optional(),
          days: z.number().int().min(0).default(15),
          plan: z.enum(["pro", "team"]).default("pro"),
          isVipTotal: z.boolean().default(false),
          maxUses: z.number().int().min(1).default(1),
          expiresAt: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a administradores." });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const cleanCode = input.code.trim().toUpperCase().replace(/\s+/g, "-");
        const existing = await db.select().from(vouchers).where(eq(vouchers.code, cleanCode)).limit(1);
        if (existing[0]) {
          throw new TRPCError({ code: "CONFLICT", message: `O voucher ${cleanCode} já existe no sistema.` });
        }

        await db.insert(vouchers).values({
          code: cleanCode,
          description: input.description || (input.isVipTotal ? "Acesso VIP Total Vitalício" : `${input.days} dias de Plano ${input.plan.toUpperCase()}`),
          days: input.isVipTotal ? 0 : input.days,
          plan: input.plan,
          isVipTotal: input.isVipTotal,
          maxUses: input.maxUses,
          usedCount: 0,
          expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
          active: true,
        });

        return { success: true, code: cleanCode };
      }),

    toggleVoucher: protectedProcedure
      .input(z.object({ id: z.number(), active: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a administradores." });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db.update(vouchers).set({ active: input.active }).where(eq(vouchers.id, input.id));
        return { success: true };
      }),

    deleteVoucher: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a administradores." });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db.delete(voucherRedemptions).where(eq(voucherRedemptions.voucherId, input.id));
        await db.delete(vouchers).where(eq(vouchers.id, input.id));
        return { success: true };
      }),
  }),

  voucher: router({
    redeem: protectedProcedure
      .input(z.object({ code: z.string().min(2, "Digite o código do voucher.") }))
      .mutation(async ({ ctx, input }) => {
        const profile = await requireProfile(ctx.user.id);
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco indisponível." });

        const cleanCode = input.code.trim().toUpperCase();
        const found = await db.select().from(vouchers).where(eq(vouchers.code, cleanCode)).limit(1);
        const voucher = found[0];

        if (!voucher || !voucher.active) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Voucher não encontrado ou inativo. Verifique o código digitado." });
        }

        if (voucher.expiresAt && new Date() > new Date(voucher.expiresAt)) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Este voucher já expirou." });
        }

        const alreadyRedeemed = await db
          .select()
          .from(voucherRedemptions)
          .where(and(eq(voucherRedemptions.voucherId, voucher.id), eq(voucherRedemptions.userId, ctx.user.id)))
          .limit(1);

        if (alreadyRedeemed[0]) {
          throw new TRPCError({ code: "CONFLICT", message: "Você já resgatou este voucher anteriormente." });
        }

        if (voucher.maxUses !== -1 && voucher.usedCount >= voucher.maxUses) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Este voucher atingiu o limite máximo de resgates." });
        }

        if (voucher.isVipTotal) {
          await db
            .update(professionalProfiles)
            .set({
              isPro: true,
              isVip: true,
              plan: voucher.plan || "pro",
              planExpiresAt: null,
            })
            .where(eq(professionalProfiles.id, profile.id));

          await db.insert(voucherRedemptions).values({
            voucherId: voucher.id,
            userId: ctx.user.id,
            profileId: profile.id,
            voucherCode: cleanCode,
          });

          await db
            .update(vouchers)
            .set({ usedCount: voucher.usedCount + 1 })
            .where(eq(vouchers.id, voucher.id));

          await createNotification(
            profile.id,
            "⭐ VIP Total Ativado!",
            "Você resgatou o voucher VIP Total. Todos os recursos do MeuAutônomo estão liberados vitaliciamente para você!",
            "voucher"
          );

          return {
            success: true,
            isVipTotal: true,
            message: "Parabéns! VIP Total Vitalício ativado! Todos os recursos estão liberados para você para sempre.",
          };
        }

        const days = voucher.days || 15;
        const now = Date.now();
        let newExpiresAt: Date;

        if (profile.planExpiresAt && new Date(profile.planExpiresAt).getTime() > now) {
          newExpiresAt = new Date(new Date(profile.planExpiresAt).getTime() + days * 86400000);
        } else {
          newExpiresAt = new Date(now + days * 86400000);
        }

        await db
          .update(professionalProfiles)
          .set({
            isPro: true,
            plan: voucher.plan || "pro",
            planExpiresAt: newExpiresAt,
          })
          .where(eq(professionalProfiles.id, profile.id));

        await db.insert(voucherRedemptions).values({
          voucherId: voucher.id,
          userId: ctx.user.id,
          profileId: profile.id,
          voucherCode: cleanCode,
        });

        await db
          .update(vouchers)
          .set({ usedCount: voucher.usedCount + 1 })
          .where(eq(vouchers.id, voucher.id));

        await createNotification(
          profile.id,
          `🎉 Voucher de ${days} Dias Ativado!`,
          `Você ganhou ${days} dias de degustação do Plano PRO. Aproveite todos os recursos avançados!`,
          "voucher"
        );

        return {
          success: true,
          isVipTotal: false,
          days,
          planExpiresAt: newExpiresAt,
          message: `Voucher aplicado com sucesso! Você ganhou ${days} dias de degustação gratuita do Plano PRO.`,
        };
      }),

    getStatus: protectedProcedure.query(async ({ ctx }) => {
      const profile = await getProfileByUserId(ctx.user.id);
      if (!profile) return null;

      const isVip = Boolean(profile.isVip);
      const isPro = Boolean(profile.isPro);
      const expiresAt = profile.planExpiresAt ? new Date(profile.planExpiresAt) : null;
      let daysRemaining: number | null = null;
      let isExpired = false;

      if (!isVip && expiresAt) {
        const diffMs = expiresAt.getTime() - Date.now();
        daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        if (diffMs <= 0) {
          isExpired = true;
        }
      }

      return {
        plan: profile.plan,
        isPro,
        isVip,
        planExpiresAt: expiresAt,
        daysRemaining,
        isExpired,
      };
    }),
  }),

  referral: router({
    getInfo: protectedProcedure.query(async ({ ctx }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      let code = profile.referralCode;
      if (!code) {
        code = `${profile.slug.replace(/[^a-z0-9]/gi, "").slice(0, 8).toUpperCase()}-${nanoid(4).toUpperCase()}`;
        await db.update(professionalProfiles).set({ referralCode: code }).where(eq(professionalProfiles.id, profile.id));
      }

      const appBaseUrl = process.env.PUBLIC_URL || "https://meuautonomo.vercel.app";
      const referralLink = `${appBaseUrl}/r/${code}`;

      return {
        referralCode: code,
        referralLink,
        referralCount: profile.referralCount || 0,
        bonusDaysEarned: profile.bonusDaysEarned || 0,
      };
    }),

    applyCode: protectedProcedure
      .input(z.object({ code: z.string().min(3) }))
      .mutation(async ({ ctx, input }) => {
        const profile = await requireProfile(ctx.user.id);
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        if (profile.referredBy) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Você já utilizou um código de indicação anteriormente." });
        }

        const cleanCode = input.code.trim().toUpperCase();
        if (cleanCode === profile.referralCode) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Você não pode utilizar seu próprio código de indicação." });
        }

        const referrer = await db
          .select()
          .from(professionalProfiles)
          .where(eq(professionalProfiles.referralCode, cleanCode))
          .limit(1);

        if (!referrer[0]) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Código de indicação não encontrado. Verifique com seu colega." });
        }

        const bonusDays = 15;
        const now = Date.now();
        const newExpires = profile.planExpiresAt && new Date(profile.planExpiresAt).getTime() > now
          ? new Date(new Date(profile.planExpiresAt).getTime() + bonusDays * 86400000)
          : new Date(now + bonusDays * 86400000);

        await db
          .update(professionalProfiles)
          .set({
            referredBy: cleanCode,
            isPro: true,
            plan: "pro",
            planExpiresAt: newExpires,
          })
          .where(eq(professionalProfiles.id, profile.id));

        await createNotification(
          profile.id,
          "🎁 Bônus de Indicação Ativado!",
          `Você ganhou 15 dias de Plano PRO grátis pela indicação de ${referrer[0].displayName}!`,
          "referral"
        );

        const refNewExpires = referrer[0].planExpiresAt && new Date(referrer[0].planExpiresAt).getTime() > now
          ? new Date(new Date(referrer[0].planExpiresAt).getTime() + bonusDays * 86400000)
          : new Date(now + bonusDays * 86400000);

        await db
          .update(professionalProfiles)
          .set({
            isPro: true,
            plan: referrer[0].plan === "team" ? "team" : "pro",
            planExpiresAt: referrer[0].isVip ? null : refNewExpires,
            referralCount: (referrer[0].referralCount || 0) + 1,
            bonusDaysEarned: (referrer[0].bonusDaysEarned || 0) + bonusDays,
          })
          .where(eq(professionalProfiles.id, referrer[0].id));

        await createNotification(
          referrer[0].id,
          "🎉 Amigo Indicado!",
          `${profile.displayName} se cadastrou pelo seu link! Você ganhou +15 dias de Plano PRO grátis!`,
          "referral"
        );

        return {
          success: true,
          message: `Código de indicação aceito! Você e ${referrer[0].displayName} ganharam 15 dias de Plano PRO grátis!`,
          planExpiresAt: newExpires,
        };
      }),
  }),

  receipt: router({
    validate: publicProcedure
      .input(z.object({ code: z.string() }))
      .query(async ({ input }) => {
        const rawCode = input.code.trim().toUpperCase().replace(/\s+/g, "");
        if (!rawCode) {
          return { valid: false, error: "Informe o código do recibo para validar." };
        }

        let type: "A" | "Q" = "A";
        let id: number | null = null;
        let providedHash: string | null = null;

        const fullMatch = rawCode.match(/^MA-REC-([AQ])(\d+)(?:-([A-Z0-9]+))?$/);
        if (fullMatch) {
          type = fullMatch[1] as "A" | "Q";
          id = parseInt(fullMatch[2], 10);
          providedHash = fullMatch[3] || null;
        } else {
          const friendlyMatch = rawCode.match(/^(?:REC-)?(?:([AQ])[-_]?)?(\d+)$/);
          if (friendlyMatch) {
            type = (friendlyMatch[1] as "A" | "Q") || "A";
            id = parseInt(friendlyMatch[2], 10);
          } else {
            return {
              valid: false,
              error: `Formato de código não reconhecido: "${rawCode}". Exemplos válidos: MA-REC-A12-XXXXXX ou REC-12.`
            };
          }
        }

        if (!id || isNaN(id) || id <= 0) {
          return { valid: false, error: "Identificador de recibo inválido." };
        }

        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        let appointment = type === "A" ? (await db.select().from(appointments).where(eq(appointments.id, id)).limit(1))[0] : null;
        let quote = type === "Q" ? (await db.select().from(quotes).where(eq(quotes.id, id)).limit(1))[0] : null;

        // Fallback cruzado se o usuário informou código numérico sem prefixo
        if (!appointment && !quote && !fullMatch) {
          appointment = (await db.select().from(appointments).where(eq(appointments.id, id)).limit(1))[0];
          if (appointment) {
            type = "A";
          } else {
            quote = (await db.select().from(quotes).where(eq(quotes.id, id)).limit(1))[0];
            if (quote) {
              type = "Q";
            }
          }
        }

        if (type === "A" && appointment) {
          const officialCode = generateReceiptAuthCode("A", appointment.id, appointment.profileId, appointment.amountCents);
          if (providedHash && officialCode.toUpperCase() !== rawCode) {
            return { valid: false, error: "Código de autenticidade adulterado ou divergente do registro original." };
          }
          const profile = (await db.select().from(professionalProfiles).where(eq(professionalProfiles.id, appointment.profileId)).limit(1))[0];
          const client = appointment.clientId ? (await db.select().from(clients).where(eq(clients.id, appointment.clientId)).limit(1))[0] : null;
          const service = appointment.serviceId ? (await db.select().from(services).where(eq(services.id, appointment.serviceId)).limit(1))[0] : null;

          return {
            valid: true,
            code: officialCode,
            receiptNumber: `REC-${String(appointment.id).padStart(4, "0")}`,
            type: "Comprovante de Atendimento Concluído",
            professionalName: profile?.displayName || "Profissional",
            profession: profile?.professionName || "Profissional Autônomo",
            professionalCity: profile?.city && profile?.serviceRegion ? `${profile.city} (${profile.serviceRegion})` : (profile?.city || profile?.serviceRegion || ""),
            professionalPhone: profile?.whatsapp || profile?.phone || "",
            clientName: client?.name || (appointment.clientId ? `Cliente #${appointment.clientId}` : "Cliente"),
            serviceDescription: service?.name || appointment.notes || "Prestação de Serviços",
            amountCents: appointment.amountCents,
            date: appointment.startsAt || appointment.createdAt,
            issuedAt: appointment.updatedAt || appointment.createdAt,
            paymentMethod: appointment.paymentMethod ? appointment.paymentMethod.toUpperCase() : "Acerto direto com o prestador",
            paymentStatus: appointment.status === "concluido" ? "Quitado / Recebido" : "Confirmado",
            legalBasis: "Em conformidade com a Lei Federal nº 14.063/2020 (Assinatura Eletrônica Simples) e Art. 320 do Código Civil Brasileiro"
          };
        } else if (type === "Q" && quote) {
          const officialCode = generateReceiptAuthCode("Q", quote.id, quote.profileId, quote.totalCents);
          if (providedHash && officialCode.toUpperCase() !== rawCode) {
            return { valid: false, error: "Código de autenticidade adulterado ou divergente do registro original." };
          }
          const profile = (await db.select().from(professionalProfiles).where(eq(professionalProfiles.id, quote.profileId)).limit(1))[0];
          const client = quote.clientId ? (await db.select().from(clients).where(eq(clients.id, quote.clientId)).limit(1))[0] : null;

          return {
            valid: true,
            code: officialCode,
            receiptNumber: `REC-${String(quote.id).padStart(4, "0")}`,
            type: "Comprovante de Proposta / Orçamento Aprovado",
            professionalName: profile?.displayName || "Profissional",
            profession: profile?.professionName || "Profissional Autônomo",
            professionalCity: profile?.city && profile?.serviceRegion ? `${profile.city} (${profile.serviceRegion})` : (profile?.city || profile?.serviceRegion || ""),
            professionalPhone: profile?.whatsapp || profile?.phone || "",
            clientName: quote.clientName || client?.name || "Cliente",
            serviceDescription: quote.description || "Prestação de Serviços",
            amountCents: quote.totalCents,
            date: quote.respondedAt || quote.createdAt,
            issuedAt: quote.respondedAt || quote.createdAt,
            paymentMethod: quote.paymentTerms || "Acerto direto com o prestador",
            paymentStatus: "Aprovado / Quitado",
            legalBasis: "Em conformidade com a Lei Federal nº 14.063/2020 (Assinatura Eletrônica Simples) e Art. 320 do Código Civil Brasileiro"
          };
        }

        return { valid: false, error: "Recibo ou atendimento não localizado no sistema." };
      })
  }),
});

export type AppRouter = typeof appRouter;
