import {
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  passwordHash: text("passwordHash"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const professionalProfiles = mysqlTable("professionalProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  displayName: varchar("displayName", { length: 160 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  professionCategory: varchar("professionCategory", { length: 100 }),
  professionName: varchar("professionName", { length: 160 }).notNull(),
  bio: text("bio"),
  city: varchar("city", { length: 120 }),
  serviceRegion: varchar("serviceRegion", { length: 160 }),
  phone: varchar("phone", { length: 40 }),
  whatsapp: varchar("whatsapp", { length: 40 }),
  avatarUrl: text("avatarUrl"),
  pixKey: varchar("pixKey", { length: 140 }),
  pixKeyType: varchar("pixKeyType", { length: 30 }),
  showPrices: boolean("showPrices").default(true).notNull(),
  bookingEnabled: boolean("bookingEnabled").default(false).notNull(),
  accountType: mysqlEnum("accountType", ["individual", "equipe"]).default("individual").notNull(),
  plan: mysqlEnum("plan", ["free", "pro", "team"]).default("free").notNull(),
  isPro: boolean("isPro").default(false).notNull(),
  isVip: boolean("isVip").default(false).notNull(),
  planExpiresAt: timestamp("planExpiresAt"),
  referralCode: varchar("referralCode", { length: 50 }),
  referredBy: varchar("referredBy", { length: 50 }),
  referralCount: int("referralCount").default(0).notNull(),
  bonusDaysEarned: int("bonusDaysEarned").default(0).notNull(),
  quotesThisMonth: int("quotesThisMonth").default(0).notNull(),
  asaasCustomerId: varchar("asaasCustomerId", { length: 120 }),
  asaasPaymentId: varchar("asaasPaymentId", { length: 120 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const availability = mysqlTable("availability", {
  id: int("id").autoincrement().primaryKey(),
  profileId: int("profileId").notNull().unique(),
  schedule: text("schedule").notNull(),
  timezone: varchar("timezone", { length: 64 }).default("America/Sao_Paulo").notNull(),
  unavailableDays: text("unavailableDays"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const services = mysqlTable("services", {
  id: int("id").autoincrement().primaryKey(),
  profileId: int("profileId").notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  description: text("description"),
  durationMinutes: int("durationMinutes").default(60).notNull(),
  priceCents: int("priceCents").default(0).notNull(),
  modality: mysqlEnum("modality", ["presencial", "endereco", "online", "hibrido"]).default("presencial").notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  profileId: int("profileId").notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  phone: varchar("phone", { length: 40 }),
  whatsapp: varchar("whatsapp", { length: 40 }),
  email: varchar("email", { length: 320 }),
  address: text("address"),
  notes: text("notes"),
  archived: boolean("archived").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const teamMembers = mysqlTable("teamMembers", {
  id: int("id").autoincrement().primaryKey(),
  profileId: int("profileId").notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  role: varchar("role", { length: 120 }).notNull(),
  phone: varchar("phone", { length: 40 }),
  email: varchar("email", { length: 320 }),
  pixKey: varchar("pixKey", { length: 140 }),
  pixKeyType: varchar("pixKeyType", { length: 30 }),
  commissionPercent: int("commissionPercent").default(50).notNull(),
  color: varchar("color", { length: 30 }).default("#e11d48"),
  notes: text("notes"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const appointments = mysqlTable("appointments", {
  id: int("id").autoincrement().primaryKey(),
  profileId: int("profileId").notNull(),
  teamMemberId: int("teamMemberId"),
  clientId: int("clientId"),
  serviceId: int("serviceId"),
  startsAt: timestamp("startsAt").notNull(),
  durationMinutes: int("durationMinutes").default(60).notNull(),
  location: text("location"),
  amountCents: int("amountCents").default(0).notNull(),
  status: mysqlEnum("status", ["agendado", "confirmado", "andamento", "concluido", "cancelado", "faltou"]).default("agendado").notNull(),
  notes: text("notes"),
  paymentMethod: mysqlEnum("paymentMethod", ["pix", "dinheiro", "cartao", "transferencia", "outro"]),
  paymentStatus: mysqlEnum("paymentStatus", ["pendente", "parcial", "pago"]).default("pendente").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const requests = mysqlTable("requests", {
  id: int("id").autoincrement().primaryKey(),
  profileId: int("profileId").notNull(),
  clientId: int("clientId"),
  requesterName: varchar("requesterName", { length: 160 }).notNull(),
  requesterPhone: varchar("requesterPhone", { length: 40 }).notNull(),
  requesterEmail: varchar("requesterEmail", { length: 320 }),
  serviceId: int("serviceId"),
  description: text("description").notNull(),
  address: text("address"),
  desiredAt: timestamp("desiredAt"),
  preferredTime: varchar("preferredTime", { length: 80 }),
  status: mysqlEnum("status", ["nova", "em_analise", "orcamento_enviado", "proposta_aceita", "agendada", "arquivada"]).default("nova").notNull(),
  secureToken: varchar("secureToken", { length: 80 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const requestAttachments = mysqlTable("requestAttachments", {
  id: int("id").autoincrement().primaryKey(),
  requestId: int("requestId").notNull(),
  fileName: varchar("fileName", { length: 180 }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  mimeType: varchar("mimeType", { length: 120 }),
  fileSize: int("fileSize"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const quotes = mysqlTable("quotes", {
  id: int("id").autoincrement().primaryKey(),
  profileId: int("profileId").notNull(),
  clientId: int("clientId"),
  requestId: int("requestId"),
  serviceId: int("serviceId"),
  secureToken: varchar("secureToken", { length: 80 }).notNull().unique(),
  description: text("description"),
  subtotalCents: int("subtotalCents").default(0).notNull(),
  discountCents: int("discountCents").default(0).notNull(),
  totalCents: int("totalCents").default(0).notNull(),
  notes: text("notes"),
  paymentTerms: text("paymentTerms"),
  changeRequest: text("changeRequest"),
  clientName: varchar("clientName", { length: 160 }),
  clientEmail: varchar("clientEmail", { length: 320 }),
  validUntil: timestamp("validUntil"),
  status: mysqlEnum("status", ["rascunho", "enviado", "aceito", "recusado", "alteracao_solicitada", "expirado"]).default("rascunho").notNull(),
  respondedAt: timestamp("respondedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const quoteItems = mysqlTable("quoteItems", {
  id: int("id").autoincrement().primaryKey(),
  quoteId: int("quoteId").notNull(),
  description: varchar("description", { length: 180 }).notNull(),
  quantity: int("quantity").default(1).notNull(),
  unitPriceCents: int("unitPriceCents").default(0).notNull(),
  totalCents: int("totalCents").default(0).notNull(),
});

export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  profileId: int("profileId").notNull(),
  teamMemberId: int("teamMemberId"),
  appointmentId: int("appointmentId"),
  clientId: int("clientId"),
  serviceId: int("serviceId"),
  amountCents: int("amountCents").default(0).notNull(),
  commissionPercent: int("commissionPercent"),
  commissionAmountCents: int("commissionAmountCents").default(0).notNull(),
  studioAmountCents: int("studioAmountCents").default(0).notNull(),
  commissionPaid: boolean("commissionPaid").default(false).notNull(),
  method: mysqlEnum("method", ["pix", "dinheiro", "cartao", "transferencia", "outro"]).default("pix").notNull(),
  status: mysqlEnum("status", ["pago", "pendente", "parcial"]).default("pago").notNull(),
  paidAt: timestamp("paidAt"),
  note: text("note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const expenses = mysqlTable("expenses", {
  id: int("id").autoincrement().primaryKey(),
  profileId: int("profileId").notNull(),
  description: varchar("description", { length: 180 }).notNull(),
  category: varchar("category", { length: 100 }),
  amountCents: int("amountCents").default(0).notNull(),
  occurredAt: timestamp("occurredAt").defaultNow().notNull(),
  note: text("note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  profileId: int("profileId").notNull(),
  type: varchar("type", { length: 60 }).notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  body: text("body"),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const vouchers = mysqlTable("vouchers", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  description: varchar("description", { length: 255 }),
  days: int("days").default(0).notNull(), // Quantidade de dias adicionados ao plano
  plan: mysqlEnum("plan", ["pro", "team"]).default("pro").notNull(),
  isVipTotal: boolean("isVipTotal").default(false).notNull(), // VIP Total Vitalício
  maxUses: int("maxUses").default(1).notNull(), // -1 para ilimitado
  usedCount: int("usedCount").default(0).notNull(),
  expiresAt: timestamp("expiresAt"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const voucherRedemptions = mysqlTable("voucherRedemptions", {
  id: int("id").autoincrement().primaryKey(),
  voucherId: int("voucherId").notNull(),
  userId: int("userId").notNull(),
  profileId: int("profileId").notNull(),
  voucherCode: varchar("voucherCode", { length: 50 }).notNull(),
  redeemedAt: timestamp("redeemedAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type ProfessionalProfile = typeof professionalProfiles.$inferSelect;
export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = typeof teamMembers.$inferInsert;
export type Service = typeof services.$inferSelect;
export type Client = typeof clients.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type Request = typeof requests.$inferSelect;
export type Quote = typeof quotes.$inferSelect;
export type QuoteItem = typeof quoteItems.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type Voucher = typeof vouchers.$inferSelect;
export type VoucherRedemption = typeof voucherRedemptions.$inferSelect;
