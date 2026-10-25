var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// drizzle/schema.ts
var schema_exports = {};
__export(schema_exports, {
  appointments: () => appointments,
  availability: () => availability,
  clients: () => clients,
  expenses: () => expenses,
  notifications: () => notifications,
  payments: () => payments,
  professionalProfiles: () => professionalProfiles,
  quoteItems: () => quoteItems,
  quotes: () => quotes,
  requestAttachments: () => requestAttachments,
  requests: () => requests,
  services: () => services,
  teamMembers: () => teamMembers,
  users: () => users,
  voucherRedemptions: () => voucherRedemptions,
  vouchers: () => vouchers
});
import {
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar
} from "drizzle-orm/mysql-core";
var users, professionalProfiles, availability, services, clients, teamMembers, appointments, requests, requestAttachments, quotes, quoteItems, payments, expenses, notifications, vouchers, voucherRedemptions;
var init_schema = __esm({
  "drizzle/schema.ts"() {
    "use strict";
    users = mysqlTable("users", {
      id: int("id").autoincrement().primaryKey(),
      openId: varchar("openId", { length: 64 }).notNull().unique(),
      name: text("name"),
      email: varchar("email", { length: 320 }),
      passwordHash: text("passwordHash"),
      loginMethod: varchar("loginMethod", { length: 64 }),
      role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
      lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
    });
    professionalProfiles = mysqlTable("professionalProfiles", {
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
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    availability = mysqlTable("availability", {
      id: int("id").autoincrement().primaryKey(),
      profileId: int("profileId").notNull().unique(),
      schedule: text("schedule").notNull(),
      timezone: varchar("timezone", { length: 64 }).default("America/Sao_Paulo").notNull(),
      unavailableDays: text("unavailableDays"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    services = mysqlTable("services", {
      id: int("id").autoincrement().primaryKey(),
      profileId: int("profileId").notNull(),
      name: varchar("name", { length: 160 }).notNull(),
      description: text("description"),
      durationMinutes: int("durationMinutes").default(60).notNull(),
      priceCents: int("priceCents").default(0).notNull(),
      modality: mysqlEnum("modality", ["presencial", "endereco", "online", "hibrido"]).default("presencial").notNull(),
      active: boolean("active").default(true).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    clients = mysqlTable("clients", {
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
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    teamMembers = mysqlTable("teamMembers", {
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
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    appointments = mysqlTable("appointments", {
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
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    requests = mysqlTable("requests", {
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
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    requestAttachments = mysqlTable("requestAttachments", {
      id: int("id").autoincrement().primaryKey(),
      requestId: int("requestId").notNull(),
      fileName: varchar("fileName", { length: 180 }).notNull(),
      fileUrl: text("fileUrl").notNull(),
      mimeType: varchar("mimeType", { length: 120 }),
      fileSize: int("fileSize"),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    quotes = mysqlTable("quotes", {
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
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    quoteItems = mysqlTable("quoteItems", {
      id: int("id").autoincrement().primaryKey(),
      quoteId: int("quoteId").notNull(),
      description: varchar("description", { length: 180 }).notNull(),
      quantity: int("quantity").default(1).notNull(),
      unitPriceCents: int("unitPriceCents").default(0).notNull(),
      totalCents: int("totalCents").default(0).notNull()
    });
    payments = mysqlTable("payments", {
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
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    expenses = mysqlTable("expenses", {
      id: int("id").autoincrement().primaryKey(),
      profileId: int("profileId").notNull(),
      description: varchar("description", { length: 180 }).notNull(),
      category: varchar("category", { length: 100 }),
      amountCents: int("amountCents").default(0).notNull(),
      occurredAt: timestamp("occurredAt").defaultNow().notNull(),
      note: text("note"),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    notifications = mysqlTable("notifications", {
      id: int("id").autoincrement().primaryKey(),
      profileId: int("profileId").notNull(),
      type: varchar("type", { length: 60 }).notNull(),
      title: varchar("title", { length: 180 }).notNull(),
      body: text("body"),
      read: boolean("read").default(false).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    vouchers = mysqlTable("vouchers", {
      id: int("id").autoincrement().primaryKey(),
      code: varchar("code", { length: 50 }).notNull().unique(),
      description: varchar("description", { length: 255 }),
      days: int("days").default(0).notNull(),
      // Quantidade de dias adicionados ao plano
      plan: mysqlEnum("plan", ["pro", "team"]).default("pro").notNull(),
      isVipTotal: boolean("isVipTotal").default(false).notNull(),
      // VIP Total Vitalício
      maxUses: int("maxUses").default(1).notNull(),
      // -1 para ilimitado
      usedCount: int("usedCount").default(0).notNull(),
      expiresAt: timestamp("expiresAt"),
      active: boolean("active").default(true).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    voucherRedemptions = mysqlTable("voucherRedemptions", {
      id: int("id").autoincrement().primaryKey(),
      voucherId: int("voucherId").notNull(),
      userId: int("userId").notNull(),
      profileId: int("profileId").notNull(),
      voucherCode: varchar("voucherCode", { length: 50 }).notNull(),
      redeemedAt: timestamp("redeemedAt").defaultNow().notNull()
    });
  }
});

// server/mockDb.ts
var mockDb_exports = {};
__export(mockDb_exports, {
  getMockDb: () => getMockDb,
  resetMockDb: () => resetMockDb
});
import { getTableName } from "drizzle-orm";
import fs from "fs";
import path from "path";
function createCleanStore() {
  const now = /* @__PURE__ */ new Date();
  return {
    users: [
      {
        id: 1,
        openId: "dev-user-local",
        name: "Admin MeuAut\xF4nomo",
        email: "contato@meuautonomo.com.br",
        loginMethod: "local-dev",
        role: "admin",
        createdAt: now,
        updatedAt: now,
        lastSignedIn: now
      }
    ],
    professionalProfiles: [],
    availability: [],
    // Tabelas de negócio zeradas para testes reais do usuário:
    services: [],
    clients: [],
    appointments: [],
    requests: [],
    requestAttachments: [],
    quotes: [],
    quoteItems: [],
    payments: [],
    expenses: [],
    notifications: [],
    teamMembers: [],
    vouchers: [
      { id: 1, code: "VIP20DIAS", description: "Degusta\xE7\xE3o VIP 20 Dias para Testadora Beta", days: 20, plan: "pro", isVipTotal: false, maxUses: 100, usedCount: 0, active: true },
      { id: 2, code: "BETA20", description: "Acesso Beta de 20 Dias Gr\xE1tis", days: 20, plan: "pro", isVipTotal: false, maxUses: 100, usedCount: 0, active: true },
      { id: 3, code: "TESTE20", description: "Teste Especial 20 Dias", days: 20, plan: "pro", isVipTotal: false, maxUses: 100, usedCount: 0, active: true },
      { id: 4, code: "EQUIPE20", description: "Degusta\xE7\xE3o VIP 20 Dias M\xF3dulo Equipe / Est\xFAdio", days: 20, plan: "team", isVipTotal: false, maxUses: 100, usedCount: 0, active: true },
      { id: 5, code: "VIP-EQUIPE20", description: "Acesso Especial 20 Dias M\xF3dulo Equipe / Est\xFAdio", days: 20, plan: "team", isVipTotal: false, maxUses: 100, usedCount: 0, active: true },
      { id: 6, code: "PRO10", description: "B\xF4nus 10 Dias Plano PRO", days: 10, plan: "pro", isVipTotal: false, maxUses: 50, usedCount: 0, active: true },
      { id: 7, code: "PRO15", description: "B\xF4nus 15 Dias Plano PRO", days: 15, plan: "pro", isVipTotal: false, maxUses: 50, usedCount: 0, active: true },
      { id: 8, code: "PRO30", description: "B\xF4nus 30 Dias (1 M\xEAs Gr\xE1tis)", days: 30, plan: "pro", isVipTotal: false, maxUses: 50, usedCount: 0, active: true },
      { id: 9, code: "VIPTOTAL", description: "Acesso VIP Total Vital\xEDcio", days: 0, plan: "team", isVipTotal: true, maxUses: 10, usedCount: 0, active: true },
      { id: 10, code: "VIP-MEUAUTONOMO", description: "VIP Vital\xEDcio Fundador / Embaixador", days: 0, plan: "team", isVipTotal: true, maxUses: 10, usedCount: 0, active: true }
    ],
    voucherRedemptions: []
  };
}
function saveStoreToFile(data) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("[MockDb] Erro ao salvar banco persistido em disco:", err);
  }
}
function loadStoreFromFile() {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const content = fs.readFileSync(STORE_FILE, "utf-8");
      const parsed = JSON.parse(content);
      for (const table of Object.keys(parsed)) {
        if (Array.isArray(parsed[table])) {
          parsed[table].forEach((item) => {
            for (const key of Object.keys(item)) {
              if (typeof item[key] === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(item[key])) {
                item[key] = new Date(item[key]);
              }
            }
          });
        }
      }
      if (Array.isArray(parsed.users)) {
        const uniqueUsers = /* @__PURE__ */ new Map();
        for (const u of parsed.users) {
          const key = u.openId || u.email || String(u.id);
          if (!uniqueUsers.has(key)) {
            uniqueUsers.set(key, u);
          } else {
            Object.assign(uniqueUsers.get(key), u);
          }
        }
        parsed.users = Array.from(uniqueUsers.values());
      }
      if (!Array.isArray(parsed.teamMembers)) {
        parsed.teamMembers = [];
      }
      return parsed;
    }
  } catch (err) {
    console.warn("[MockDb] Falha ao carregar store existente, criando banco zerado:", err);
  }
  const clean = createCleanStore();
  saveStoreToFile(clean);
  return clean;
}
function resetMockDb() {
  store = createCleanStore();
  saveStoreToFile(store);
  console.log("[MockDb] \u{1F9F9} Banco de dados zerado com sucesso para novos testes!");
  return store;
}
function extractCondition(cond) {
  if (!cond) return null;
  if (!cond.queryChunks || !Array.isArray(cond.queryChunks)) return null;
  const chunks = cond.queryChunks;
  if (chunks.length === 3 && chunks[0]?.value?.[0] === "(" && chunks[2]?.value?.[0] === ")") {
    return extractCondition(chunks[1]);
  }
  const isAnd = chunks.some((c) => typeof c?.value?.[0] === "string" && c.value[0].includes(" and "));
  const isOr = chunks.some((c) => typeof c?.value?.[0] === "string" && c.value[0].includes(" or "));
  if (isAnd) {
    const subConds = chunks.filter((c) => c && c.queryChunks);
    return { type: "and", conditions: subConds.map(extractCondition).filter(Boolean) };
  }
  if (isOr) {
    const subConds = chunks.filter((c) => c && c.queryChunks);
    return { type: "or", conditions: subConds.map(extractCondition).filter(Boolean) };
  }
  let colName = null;
  let op = "=";
  let targetVal = void 0;
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    if (chunk && chunk.queryChunks) {
      const sub = extractCondition(chunk);
      if (sub && sub.colName) return sub;
      if (sub && (sub.type === "and" || sub.type === "or")) return sub;
    }
    if (chunk && chunk.name && typeof chunk.table !== "undefined") {
      colName = chunk.name;
    } else if (chunk && chunk.value && Array.isArray(chunk.value)) {
      const v = chunk.value[0];
      if (typeof v === "string") {
        if (v.includes("<=")) op = "<=";
        else if (v.includes(">=")) op = ">=";
        else if (v.includes("<>") || v.includes("!=")) op = "<>";
        else if (v.includes("<")) op = "<";
        else if (v.includes(">")) op = ">";
        else if (v.includes("=")) op = "=";
      }
    } else if (chunk !== null && typeof chunk !== "undefined") {
      if (typeof chunk === "object" && "value" in chunk && chunk.constructor?.name === "Param") {
        targetVal = chunk.value;
      } else if (typeof chunk !== "object" || chunk instanceof Date) {
        targetVal = chunk;
      }
    }
  }
  return { type: "single", colName, op, targetVal };
}
function evaluateParsed(item, parsed) {
  if (!parsed) return true;
  if (parsed.type === "and") {
    return parsed.conditions.every((c) => evaluateParsed(item, c));
  }
  if (parsed.type === "or") {
    return parsed.conditions.some((c) => evaluateParsed(item, c));
  }
  if (parsed.type === "single") {
    if (!parsed.colName) return true;
    const itemVal = item[parsed.colName];
    const targetVal = parsed.targetVal;
    const op = parsed.op;
    const itemTime = itemVal instanceof Date ? itemVal.getTime() : typeof itemVal === "string" && !isNaN(Date.parse(itemVal)) ? new Date(itemVal).getTime() : NaN;
    const targetTime = targetVal instanceof Date ? targetVal.getTime() : typeof targetVal === "string" && !isNaN(Date.parse(targetVal)) ? new Date(targetVal).getTime() : NaN;
    if (!isNaN(itemTime) && !isNaN(targetTime)) {
      if (op === "=") return itemTime === targetTime;
      if (op === "<>") return itemTime !== targetTime;
      if (op === ">=") return itemTime >= targetTime;
      if (op === "<=") return itemTime <= targetTime;
      if (op === ">") return itemTime > targetTime;
      if (op === "<") return itemTime < targetTime;
    }
    if (op === "=") {
      if (targetVal === false) return itemVal === false || itemVal === void 0 || itemVal === null;
      return itemVal === targetVal;
    }
    if (op === "<>") return itemVal !== targetVal;
    if (op === ">=") return itemVal >= targetVal;
    if (op === "<=") return itemVal <= targetVal;
    if (op === ">") return itemVal > targetVal;
    if (op === "<") return itemVal < targetVal;
  }
  return true;
}
function matchesCondition(item, condition) {
  if (!condition) return true;
  const parsed = extractCondition(condition);
  return evaluateParsed(item, parsed);
}
function getMockDb() {
  return {
    __isMock: true,
    select: (fields) => {
      let currentTable = null;
      let condition = null;
      let limitNum = null;
      let orders = [];
      const queryBuilder = {
        from: (table) => {
          currentTable = table;
          return queryBuilder;
        },
        where: (cond) => {
          condition = cond;
          return queryBuilder;
        },
        orderBy: (...orderList) => {
          orders = orderList;
          return queryBuilder;
        },
        limit: (n) => {
          limitNum = n;
          return queryBuilder;
        },
        then: (resolve, reject) => {
          try {
            const tableName = getTableName(currentTable);
            let list = [...store[tableName] || []];
            if (condition) {
              list = list.filter((item) => matchesCondition(item, condition));
            }
            if (orders.length > 0) {
              list.sort((a, b) => {
                const aTime = a.startsAt?.getTime?.() || a.createdAt?.getTime?.() || a.id || 0;
                const bTime = b.startsAt?.getTime?.() || b.createdAt?.getTime?.() || b.id || 0;
                return bTime - aTime;
              });
            }
            if (limitNum !== null) {
              list = list.slice(0, limitNum);
            }
            if (fields && typeof fields === "object" && !Array.isArray(fields)) {
              const fieldKeys = Object.keys(fields);
              list = list.map((item) => {
                const res = {};
                for (const k of fieldKeys) {
                  res[k] = item[k];
                }
                return res;
              });
            }
            return Promise.resolve(list).then(resolve, reject);
          } catch (err) {
            if (reject) return Promise.reject(err).catch(reject);
            throw err;
          }
        }
      };
      return queryBuilder;
    },
    insert: (table) => {
      return {
        values: (data) => {
          const tableName = getTableName(table);
          if (!store[tableName]) store[tableName] = [];
          let executed = false;
          const runInsert = (updateSet) => {
            if (executed) return [{ insertId: 0 }];
            executed = true;
            const items = Array.isArray(data) ? data : [data];
            let lastId = store[tableName].reduce((max, x) => Math.max(max, x.id || 0), 0) || 0;
            for (const item of items) {
              let existing = null;
              if (tableName === "users" && item.openId) {
                existing = store.users.find((u) => u.openId === item.openId);
              } else if (tableName === "professionalProfiles" && item.userId) {
                existing = store.professionalProfiles.find((p) => p.userId === item.userId);
              } else if (tableName === "availability" && item.profileId) {
                existing = store.availability.find((a) => a.profileId === item.profileId);
              }
              if (existing) {
                const changes = updateSet || item;
                Object.assign(existing, changes, { updatedAt: /* @__PURE__ */ new Date() });
                lastId = existing.id;
              } else {
                lastId++;
                const record = {
                  ...item,
                  id: item.id || lastId,
                  createdAt: item.createdAt || /* @__PURE__ */ new Date(),
                  updatedAt: item.updatedAt || /* @__PURE__ */ new Date()
                };
                store[tableName].push(record);
              }
            }
            saveStoreToFile(store);
            return [{ insertId: lastId }];
          };
          const builder = {
            onDuplicateKeyUpdate: (opts) => {
              const res = runInsert(opts?.set);
              return Promise.resolve(res);
            },
            then: (resolve, reject) => {
              try {
                const res = runInsert();
                return Promise.resolve(res).then(resolve, reject);
              } catch (e) {
                if (reject) return Promise.reject(e).catch(reject);
                throw e;
              }
            }
          };
          return builder;
        }
      };
    },
    update: (table) => {
      return {
        set: (values) => {
          return {
            where: (condition) => {
              const tableName = getTableName(table);
              const list = store[tableName] || [];
              let affected = 0;
              for (const item of list) {
                if (matchesCondition(item, condition)) {
                  Object.assign(item, values, { updatedAt: /* @__PURE__ */ new Date() });
                  affected++;
                }
              }
              if (affected > 0) {
                saveStoreToFile(store);
              }
              return Promise.resolve([{ affectedRows: affected }]);
            }
          };
        }
      };
    },
    delete: (table) => {
      return {
        where: (condition) => {
          const tableName = getTableName(table);
          const list = store[tableName] || [];
          const before = list.length;
          store[tableName] = list.filter((item) => !matchesCondition(item, condition));
          const affected = before - store[tableName].length;
          if (affected > 0) {
            saveStoreToFile(store);
          }
          return Promise.resolve([{ affectedRows: affected }]);
        }
      };
    }
  };
}
var IS_VERCEL, DATA_DIR, STORE_FILE, store;
var init_mockDb = __esm({
  "server/mockDb.ts"() {
    "use strict";
    IS_VERCEL = !!process.env.VERCEL;
    DATA_DIR = IS_VERCEL ? "/tmp" : path.resolve(process.cwd(), "server", "data");
    STORE_FILE = path.join(DATA_DIR, "db-store.json");
    store = loadStoreFromFile();
  }
});

// server/_core/vercel.ts
import "dotenv/config";

// server/_core/app.ts
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";
var OAUTH_STATE_COOKIE = "__Host-oauth_state";
var decodeOAuthState = (state) => {
  let decoded;
  try {
    decoded = atob(state);
  } catch {
    return { redirectUri: "" };
  }
  try {
    const parsed = JSON.parse(decoded);
    if (parsed && typeof parsed.redirectUri === "string") return parsed;
  } catch {
  }
  return { redirectUri: decoded };
};

// server/_core/oauth.ts
import { parse as parseCookieHeader2 } from "cookie";

// server/db.ts
init_schema();
import { and, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID || "meuautonomo",
  cookieSecret: process.env.JWT_SECRET || process.env.COOKIE_SECRET || "meuautonomo-production-fallback-secret-min-32-chars-key-2026",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
};

// server/db.ts
init_mockDb();
var _db = null;
var _schemaMigrationPromise = null;
async function ensureSchema(db) {
  if (!db || db.__isMock || typeof db.execute !== "function") return;
  if (!_schemaMigrationPromise) {
    _schemaMigrationPromise = (async () => {
      try {
        await db.execute(sql`
          ALTER TABLE \`professionalProfiles\`
          ADD COLUMN \`accountType\` ENUM('individual', 'equipe') NOT NULL DEFAULT 'individual'
        `);
        try {
          await db.execute(sql`
            ALTER TABLE \`requests\`
            MODIFY COLUMN \`status\` ENUM('nova', 'em_analise', 'orcamento_enviado', 'proposta_aceita', 'agendada', 'arquivada') NOT NULL DEFAULT 'nova'
          `);
        } catch (statusErr) {
        }
      } catch (err) {
        if (err?.code === "ER_DUP_FIELDNAME" || err?.code === "1060" || String(err?.message || "").includes("Duplicate column") || String(err?.message || "").includes("already exists")) {
        } else {
          console.warn("[Database] Aviso de migra\xE7\xE3o (accountType):", err?.message || err);
        }
      }
    })();
  }
  await _schemaMigrationPromise;
}
var _lastMeuAutonomoVaultDay = "";
async function syncMeuAutonomoCloudVault(db) {
  try {
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    if (_lastMeuAutonomoVaultDay === today) return;
    _lastMeuAutonomoVaultDay = today;
    const schema = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const [
      allUsers,
      allProfiles,
      allClients,
      allServices,
      allAppointments,
      allQuotes,
      allPayments,
      allExpenses
    ] = await Promise.all([
      db.select().from(schema.users).catch(() => []),
      db.select().from(schema.professionalProfiles).catch(() => []),
      db.select().from(schema.clients).catch(() => []),
      db.select().from(schema.services).catch(() => []),
      db.select().from(schema.appointments).catch(() => []),
      db.select().from(schema.quotes).catch(() => []),
      db.select().from(schema.payments).catch(() => []),
      db.select().from(schema.expenses).catch(() => [])
    ]);
    const apiKey = process.env.FIREBASE_API_KEY || "";
    const projectId = process.env.FIREBASE_PROJECT_ID || "expedicao-brasil";
    if (!apiKey) return;
    const daySlot = `slot_day_${(/* @__PURE__ */ new Date()).getUTCDay()}`;
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/meuautonomo_vault_snapshots/${daySlot}?key=${apiKey}`;
    const snapshotPayload = JSON.stringify({
      date: today,
      users: allUsers,
      professionalProfiles: allProfiles,
      clients: allClients,
      services: allServices,
      appointments: allAppointments,
      quotes: allQuotes,
      payments: allPayments,
      expenses: allExpenses
    }).slice(0, 85e4);
    await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: {
          date: { stringValue: today },
          updatedAt: { stringValue: (/* @__PURE__ */ new Date()).toISOString() },
          totalUsers: { integerValue: String(allUsers.length) },
          totalClients: { integerValue: String(allClients.length) },
          payloadJson: { stringValue: snapshotPayload }
        }
      })
    });
  } catch (e) {
  }
}
async function getDb() {
  if (process.env.DATABASE_URL) {
    if (!_db || _db.__isMock) {
      let lastErr = null;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          _db = drizzle(process.env.DATABASE_URL);
          ensureSchema(_db).catch((err) => console.warn("[Database] ensureSchema error:", err?.message || err));
          lastErr = null;
          break;
        } catch (error) {
          lastErr = error;
          await new Promise((r) => setTimeout(r, 400 * attempt));
        }
      }
      if (lastErr && (!_db || _db.__isMock)) {
        console.warn("[Database] Failed to connect to DATABASE_URL after 3 attempts:", lastErr);
        _db = getMockDb();
      }
    }
    if (_db && !_db.__isMock) {
      syncMeuAutonomoCloudVault(_db).catch(() => {
      });
    }
    return _db;
  }
  if (!_db) {
    console.log("=============================================================================");
    console.log("\u26A0\uFE0F MODO DEMONSTRA\xC7\xC3O ATIVO (Sem DATABASE_URL)");
    console.log("\u{1F449} Usando dados de teste simulados em mem\xF3ria para desenvolvimento.");
    console.log("\u{1F4CC} LEMBRETE: Para conectar ao banco oficial de produ\xE7\xE3o, defina a vari\xE1vel");
    console.log("   DATABASE_URL=mysql://USER:PASSWORD@HOST/DATABASE no seu arquivo .env");
    console.log("=============================================================================");
    _db = getMockDb();
  }
  return _db;
}
async function updateUserLastSignedIn(userId, date = /* @__PURE__ */ new Date()) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ lastSignedIn: date }).where(eq(users.id, userId));
}
async function upsertUser(user) {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const now = /* @__PURE__ */ new Date();
  const updateSet = {};
  const textFields = ["name", "email", "loginMethod", "passwordHash"];
  for (const field of textFields) {
    if (user[field] !== void 0) {
      updateSet[field] = user[field] ?? null;
    }
  }
  updateSet.lastSignedIn = user.lastSignedIn ?? now;
  if (user.role !== void 0) {
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId || user.openId === "admin_master") {
    updateSet.role = "admin";
  }
  const existingByOpenId = await getUserByOpenId(user.openId);
  if (existingByOpenId) {
    if (Object.keys(updateSet).length > 0) {
      await db.update(users).set(updateSet).where(eq(users.id, existingByOpenId.id));
    }
    return;
  }
  if (user.email) {
    const existingByEmail = await getUserByEmail(user.email);
    if (existingByEmail) {
      await db.update(users).set({ ...updateSet, openId: user.openId }).where(eq(users.id, existingByEmail.id));
      return;
    }
  }
  const values = {
    openId: user.openId,
    name: user.name ?? null,
    email: user.email ? user.email.trim().toLowerCase() : null,
    loginMethod: user.loginMethod ?? null,
    passwordHash: user.passwordHash ?? null,
    role: updateSet.role || "user",
    lastSignedIn: updateSet.lastSignedIn || now,
    createdAt: now
  };
  await db.insert(users).values(values);
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}
async function getUserByEmail(email) {
  const db = await getDb();
  if (!db) return void 0;
  const normalized = email.trim().toLowerCase();
  const result = await db.select().from(users).where(eq(users.email, normalized)).limit(1);
  return result[0];
}
async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(users);
  return result;
}
async function getProfileByUserId(userId) {
  const db = await getDb();
  if (!db) return void 0;
  try {
    const result = await db.select().from(professionalProfiles).where(eq(professionalProfiles.userId, userId)).limit(1);
    return result[0];
  } catch (err) {
    if (String(err?.message || "").includes("accountType") && typeof db.execute === "function") {
      try {
        await db.execute(sql`
          ALTER TABLE \`professionalProfiles\`
          ADD COLUMN \`accountType\` ENUM('individual', 'equipe') NOT NULL DEFAULT 'individual'
        `);
        const retryResult = await db.select().from(professionalProfiles).where(eq(professionalProfiles.userId, userId)).limit(1);
        return retryResult[0];
      } catch (retryErr) {
        console.error("[Database] Retry getProfileByUserId falhou:", retryErr);
      }
    }
    throw err;
  }
}
async function getProfileBySlug(slug) {
  const db = await getDb();
  if (!db) return void 0;
  try {
    const result = await db.select().from(professionalProfiles).where(eq(professionalProfiles.slug, slug)).limit(1);
    return result[0];
  } catch (err) {
    if (String(err?.message || "").includes("accountType") && typeof db.execute === "function") {
      try {
        await db.execute(sql`
          ALTER TABLE \`professionalProfiles\`
          ADD COLUMN \`accountType\` ENUM('individual', 'equipe') NOT NULL DEFAULT 'individual'
        `);
        const retryResult = await db.select().from(professionalProfiles).where(eq(professionalProfiles.slug, slug)).limit(1);
        return retryResult[0];
      } catch (retryErr) {
        console.error("[Database] Retry getProfileBySlug falhou:", retryErr);
      }
    }
    throw err;
  }
}
async function createNotification(profileId, title, body, type) {
  const db = await getDb();
  if (!db) return;
  const { notifications: notifications2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  await db.insert(notifications2).values({ profileId, title, body, type });
}

// server/demoConfig.ts
import fs2 from "fs";
import path2 from "path";
var CONFIG_FILE = path2.resolve(process.cwd(), "server", "data", "admin-config.json");
var _config = {
  demoMode: false,
  adminEmail: process.env.ADMIN_EMAIL || "",
  adminUsername: process.env.ADMIN_USERNAME || ""
};
try {
  if (fs2.existsSync(CONFIG_FILE)) {
    const raw = fs2.readFileSync(CONFIG_FILE, "utf-8");
    _config = { ..._config, ...JSON.parse(raw) };
  }
} catch (e) {
  console.warn("[AdminConfig] Could not load config file:", e);
}
function saveConfig() {
  try {
    const dir = path2.dirname(CONFIG_FILE);
    if (!fs2.existsSync(dir)) fs2.mkdirSync(dir, { recursive: true });
    fs2.writeFileSync(CONFIG_FILE, JSON.stringify(_config, null, 2), "utf-8");
  } catch (e) {
    console.warn("[AdminConfig] Could not save config file:", e);
  }
}
function isDemoMode() {
  return _config.demoMode;
}
function setDemoMode(value) {
  _config.demoMode = value;
  saveConfig();
}
var DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || "meuatonomomaster@creativeam.com.br";
var DEFAULT_ADMIN_USERNAME = process.env.ADMIN_USERNAME || "meuatonomomaster";
var DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
function getAdminEmail() {
  return _config.adminEmail || process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;
}
function getAdminUsername() {
  return _config.adminUsername || process.env.ADMIN_USERNAME || DEFAULT_ADMIN_USERNAME;
}
function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
}

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  const isSecure = isSecureRequest(req) || process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: isSecure
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    return decodeOAuthState(state).redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    if (!secret) {
      throw new Error("JWT_SECRET or COOKIE_SECRET must be configured.");
    }
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId || "meuautonomo",
        name: options.name || "Profissional"
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId || ENV.appId || "meuautonomo",
      name: payload.name || "Profissional"
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId)) {
        console.warn("[Auth] Session payload missing openId");
        return null;
      }
      return {
        openId,
        appId: typeof appId === "string" && appId.length > 0 ? appId : ENV.appId || "meuautonomo",
        name: typeof name === "string" && name.length > 0 ? name : "Profissional"
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    let sessionToken;
    const authHeader = req.headers.authorization;
    if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
      sessionToken = authHeader.slice(7).trim();
    }
    if (!sessionToken) {
      const cookies = this.parseCookies(req.headers.cookie);
      sessionToken = cookies.get(COOKIE_NAME);
    }
    let session = sessionToken ? await this.verifySession(sessionToken) : null;
    if (!session) {
      const cookies = this.parseCookies(req.headers.cookie);
      const cookieToken = cookies.get(COOKIE_NAME);
      if (cookieToken && cookieToken !== sessionToken) {
        session = await this.verifySession(cookieToken);
        if (session) sessionToken = cookieToken;
      }
    }
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    if (session.openId.startsWith(CRON_OPEN_ID_PREFIX)) {
      const userInfo = await this.getUserInfoWithJwt(sessionToken ?? "");
      const taskUid = userInfo.taskUid ?? null;
      if (!taskUid) {
        throw ForbiddenError("Cron session missing task_uid");
      }
      return buildCronUser(userInfo);
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionToken ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    try {
      await updateUserLastSignedIn(user.id, signedInAt);
    } catch (e) {
    }
    return user;
  }
};
var CRON_OPEN_ID_PREFIX = "cron_";
function buildCronUser(userInfo) {
  const now = /* @__PURE__ */ new Date();
  return {
    id: -1,
    openId: userInfo.openId,
    name: userInfo.name || "Manus Scheduled Task",
    email: null,
    loginMethod: null,
    role: "user",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
    taskUid: userInfo.taskUid ?? void 0,
    isCron: true
  };
}
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app2) {
  app2.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    const { nonce } = decodeOAuthState(state);
    const expectedNonce = parseCookieHeader2(req.headers.cookie ?? "")[OAUTH_STATE_COOKIE];
    if (!nonce || nonce !== expectedNonce) {
      res.status(403).json({ error: "invalid oauth state" });
      return;
    }
    res.clearCookie(OAUTH_STATE_COOKIE, { path: "/", secure: true, sameSite: "none" });
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/app");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
  app2.get("/api/dev-login", async (req, res) => {
    if (!isDemoMode()) {
      res.redirect("/?login=true");
      return;
    }
    try {
      const devOpenId = "dev-user-local";
      let devName = "Profissional Aut\xF4nomo";
      let devEmail = "contato@meuautonomo.com.br";
      const database = await getDb();
      if (database) {
        try {
          const { professionalProfiles: professionalProfiles2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
          const existingProfile = (await database.select().from(professionalProfiles2).limit(1))[0];
          if (existingProfile?.displayName) {
            devName = existingProfile.displayName;
          }
        } catch (e) {
          console.warn("[OAuth dev-login] Usando nome padr\xE3o:", e);
        }
      }
      await upsertUser({
        openId: devOpenId,
        name: devName,
        email: devEmail,
        loginMethod: "local-dev",
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(devOpenId, {
        name: devName,
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Entrando no MeuAut\xF4nomo...</title>
</head>
<body style="font-family: sans-serif; display: grid; min-height: 100vh; place-items: center; background: #f5f7f2; color: #173a34;">
  <p style="font-weight: bold;">Carregando seu espa\xE7o de teste...</p>
  <script>
    try {
      sessionStorage.setItem("manus-cookie", ${JSON.stringify(sessionToken)});
    } catch (e) {}
    window.location.replace("/app");
  </script>
</body>
</html>`);
    } catch (error) {
      console.error("[DevLogin] Failed:", error);
      res.status(500).json({ error: "Dev login failed" });
    }
  });
}

// server/_core/storageProxy.ts
function registerStorageProxy(app2) {
  app2.get("/manus-storage/*", async (req, res) => {
    const key = req.params[0];
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }
    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      res.status(500).send("Storage proxy not configured");
      return;
    }
    try {
      const forgeUrl = new URL(
        "v1/storage/presign/get",
        ENV.forgeApiUrl.replace(/\/+$/, "") + "/"
      );
      forgeUrl.searchParams.set("path", key);
      const forgeResp = await fetch(forgeUrl, {
        headers: { Authorization: `Bearer ${ENV.forgeApiKey}` }
      });
      if (!forgeResp.ok) {
        const body = await forgeResp.text().catch(() => "");
        console.error(`[StorageProxy] forge error: ${forgeResp.status} ${body}`);
        res.status(502).send("Storage backend error");
        return;
      }
      const { url } = await forgeResp.json();
      if (!url) {
        res.status(502).send("Empty signed URL from backend");
        return;
      }
      res.set("Cache-Control", "no-store");
      res.redirect(307, url);
    } catch (err) {
      console.error("[StorageProxy] failed:", err);
      res.status(502).send("Storage proxy error");
    }
  });
}

// server/routes/og-meta.ts
import fs3 from "fs";
import path3 from "path";
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}
var cachedIndexHtml = null;
var profileCache = /* @__PURE__ */ new Map();
function findIndexHtml() {
  if (cachedIndexHtml) return cachedIndexHtml;
  const possiblePaths = [
    path3.resolve(process.cwd(), "dist/public/index.html"),
    path3.resolve(process.cwd(), "public/index.html"),
    path3.resolve(process.cwd(), "client/index.html"),
    path3.resolve(__dirname, "../../dist/public/index.html"),
    path3.resolve(__dirname, "../public/index.html"),
    path3.resolve(__dirname, "public/index.html")
  ];
  for (const p of possiblePaths) {
    if (fs3.existsSync(p)) {
      try {
        cachedIndexHtml = fs3.readFileSync(p, "utf-8");
        return cachedIndexHtml;
      } catch (err) {
        console.error("[OG Meta] Erro ao ler index.html em", p, err);
      }
    }
  }
  return null;
}
async function getCachedProfile(slug) {
  const cached = profileCache.get(slug);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }
  const fresh = await getProfileBySlug(slug);
  if (fresh) {
    profileCache.set(slug, { data: fresh, expiresAt: Date.now() + 5 * 60 * 1e3 });
  }
  return fresh;
}
function registerOgMetaRoutes(app2) {
  app2.get("/api/og-preview", async (req, res) => {
    const slug = (req.query.slug || "").trim();
    const host = req.get("x-forwarded-host") || req.get("host") || "meuautonomo.creativeam.com.br";
    const protocol = req.get("x-forwarded-proto") || "https";
    const siteUrl = `${protocol}://${host}`;
    if (!slug) {
      return res.redirect("/");
    }
    try {
      const profilePromise = getCachedProfile(slug);
      const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 2500));
      const profile = await Promise.race([profilePromise, timeoutPromise]);
      const name = profile?.displayName || "Profissional";
      const profession = profile?.professionName || "Atendimento Profissional";
      const safeName = escapeHtml(name);
      const safeProfession = escapeHtml(profession);
      const title = `${safeName} \u2014 ${safeProfession} | Cart\xE3o Profissional`;
      const description = escapeHtml(
        profile?.bio || `Confira os servi\xE7os, valores e solicite seu agendamento direto com ${name} (${profession}).`
      );
      const pageUrl = `${siteUrl}/p/${encodeURIComponent(slug)}`;
      let ogImageUrl = `${siteUrl}/pwa-512.png`;
      if (profile?.avatarUrl && profile.avatarUrl.startsWith("http")) {
        ogImageUrl = profile.avatarUrl;
      } else if (profile?.avatarUrl && profile.avatarUrl.startsWith("/")) {
        ogImageUrl = `${siteUrl}${profile.avatarUrl}`;
      }
      const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta property="og:type" content="profile" />
  <meta property="og:locale" content="pt_BR" />
  <meta property="og:site_name" content="${safeName} \u2014 Cart\xE3o Profissional" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${pageUrl}" />
  <meta property="og:image" content="${ogImageUrl}" />
  <meta property="og:image:secure_url" content="${ogImageUrl}" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="512" />
  <meta property="og:image:height" content="512" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${ogImageUrl}" />
  <meta http-equiv="refresh" content="0;url=${pageUrl}" />
</head>
<body style="font-family:sans-serif;text-align:center;padding:40px;background:#fbfcf9;">
  <p>Carregando cart\xE3o de <strong>${safeName}</strong>...</p>
  <p><a href="${pageUrl}">Clique aqui se n\xE3o for redirecionado automaticamente</a></p>
</body>
</html>`;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=300, s-maxage=86400, stale-while-revalidate=604800");
      return res.send(html);
    } catch (err) {
      console.error("[OG Preview Error]:", err);
      return res.redirect(`/p/${encodeURIComponent(slug)}`);
    }
  });
  app2.get("/api/og/card/:slug", async (req, res) => {
    const { slug } = req.params;
    try {
      const profile = await getProfileBySlug(slug);
      const name = profile?.displayName || "Profissional Aut\xF4nomo";
      const profession = profile?.professionName || "Cart\xE3o Profissional";
      const initial = name.charAt(0).toUpperCase();
      const safeName = escapeXml(name);
      const safeProfession = escapeXml(profession);
      const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cardBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#12352f"/>
      <stop offset="60%" stop-color="#173a34"/>
      <stop offset="100%" stop-color="#0c201d"/>
    </linearGradient>
  </defs>
  
  <!-- Fundo com gradiente elegante -->
  <rect width="1200" height="630" fill="url(#cardBg)"/>
  
  <!-- Formas decorativas org\xE2nicas -->
  <circle cx="1120" cy="90" r="260" fill="#d9f56a" fill-opacity="0.08"/>
  <circle cx="80" cy="560" r="220" fill="#d9f56a" fill-opacity="0.05"/>
  
  <!-- Selo superior do Cart\xE3o -->
  <rect x="90" y="80" width="240" height="46" rx="23" fill="#d9f56a" fill-opacity="0.15"/>
  <text x="210" y="110" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700" fill="#d9f56a" text-anchor="middle" letter-spacing="1.5">CART\xC3O OFICIAL</text>

  <!-- Avatar com inicial de destaque -->
  <rect x="90" y="160" width="120" height="120" rx="34" fill="#d9f56a"/>
  <text x="150" y="242" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="64" font-weight="900" fill="#173a34" text-anchor="middle">${initial}</text>

  <!-- Nome do Profissional -->
  <text x="90" y="345" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="900" fill="#ffffff">${safeName}</text>

  <!-- Profiss\xE3o / Ramo de Atua\xE7\xE3o -->
  <text x="90" y="415" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="32" font-weight="700" fill="#d9f56a">${safeProfession}</text>

  <!-- Bot\xE3o de A\xE7\xE3o / Chamada -->
  <rect x="90" y="480" width="480" height="66" rx="20" fill="#d9f56a"/>
  <text x="330" y="522" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="800" fill="#173a34" text-anchor="middle">Agende seu atendimento online \u2192</text>

  <!-- Assinatura da plataforma -->
  <text x="1110" y="560" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="600" fill="#ffffff" fill-opacity="0.45" text-anchor="end">MeuAut\xF4nomo</text>
</svg>`.trim();
      res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=604800");
      return res.send(svg);
    } catch (err) {
      console.error("[OG Image Error]:", err);
      return res.status(500).send("Error generating card image");
    }
  });
  app2.get("/p/:slug", async (req, res) => {
    const { slug } = req.params;
    try {
      const profile = await getCachedProfile(slug);
      const html = findIndexHtml();
      if (!html) {
        return res.redirect("/");
      }
      if (!profile) {
        return res.send(html);
      }
      const host = req.get("x-forwarded-host") || req.get("host") || "meuautonomo.creativeam.com.br";
      const protocol = req.get("x-forwarded-proto") || "https";
      const siteUrl = `${protocol}://${host}`;
      const pageUrl = `${siteUrl}/p/${encodeURIComponent(profile.slug)}`;
      const safeName = escapeHtml(profile.displayName || "Profissional");
      const safeProfession = escapeHtml(profile.professionName || "Atendimento Profissional");
      const title = `${safeName} \u2014 ${safeProfession} | Cart\xE3o Profissional`;
      const description = escapeHtml(
        profile.bio || `Confira os servi\xE7os, valores e solicite seu agendamento direto com ${profile.displayName} (${profile.professionName || "Profissional"}).`
      );
      let ogImageUrl = "";
      if (profile.avatarUrl && profile.avatarUrl.startsWith("http")) {
        ogImageUrl = profile.avatarUrl;
      } else if (profile.avatarUrl && profile.avatarUrl.startsWith("/")) {
        ogImageUrl = `${siteUrl}${profile.avatarUrl}`;
      } else {
        ogImageUrl = `${siteUrl}/api/og/card/${encodeURIComponent(profile.slug)}`;
      }
      const ogTags = `
    <!-- Metatags do Profissional (WhatsApp, Facebook, Instagram, Twitter, Google) -->
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta property="og:type" content="profile" />
    <meta property="og:locale" content="pt_BR" />
    <meta property="og:site_name" content="${safeName} \u2014 Cart\xE3o Profissional" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${pageUrl}" />
    <meta property="og:image" content="${ogImageUrl}" />
    <meta property="og:image:secure_url" content="${ogImageUrl}" />
    <meta property="og:image:alt" content="${safeName}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${ogImageUrl}" />
      `.trim();
      const preloadedScript = `<script>window.__PRELOADED_PROFILE__ = ${JSON.stringify(profile)};</script>`;
      let personalizedHtml = html.replace(/<title>.*?<\/title>/i, "").replace(/<meta\s+name=["']description["'].*?>/i, "").replace("</head>", `  ${ogTags}
  ${preloadedScript}
  </head>`);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=300, s-maxage=86400, stale-while-revalidate=604800");
      return res.send(personalizedHtml);
    } catch (err) {
      console.error("[OG Route Error]:", err);
      const fallbackHtml = findIndexHtml();
      if (fallbackHtml) return res.send(fallbackHtml);
      return res.redirect("/");
    }
  });
}

// server/webhooks/asaas.ts
init_schema();
import { eq as eq2 } from "drizzle-orm";
async function handleAsaasWebhook(req, res) {
  try {
    const event = req.body?.event;
    const payment = req.body?.payment;
    console.log(`[Asaas Webhook] Recebido evento: ${event} para o pagamento:`, payment?.id);
    if (!payment) {
      return res.status(400).json({ error: "Dados de pagamento ausentes." });
    }
    const db = await getDb();
    const externalRef = payment.externalReference;
    const customerId = payment.customer;
    const paymentId = payment.id;
    const value = Number(payment.value || payment.netValue || 0);
    const isTeamPlan = value >= 70 || (payment.description || "").toLowerCase().includes("equipe");
    const targetPlan = isTeamPlan ? "team" : "pro";
    if (event === "PAYMENT_RECEIVED" || event === "PAYMENT_CONFIRMED") {
      console.log(`[Asaas Webhook] Ativando plano ${targetPlan} (isPro = true) para ref:`, externalRef);
      let profileUpdated = false;
      if (externalRef && !isNaN(Number(externalRef))) {
        const userId = Number(externalRef);
        await db.update(professionalProfiles).set({
          plan: targetPlan,
          isPro: true,
          asaasCustomerId: customerId,
          asaasPaymentId: paymentId,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq2(professionalProfiles.userId, userId));
        profileUpdated = true;
        await db.insert(notifications).values({
          profileId: 1,
          // Fallback se profileId não for conhecido diretamente
          type: "pagamento_aprovado",
          title: `\u{1F389} Plano ${isTeamPlan ? "PRO Equipe" : "PRO Solo"} Ativado!`,
          body: `Seu pagamento via PIX no valor de R$ ${value.toFixed(2)} foi confirmado pelo Asaas. Todos os recursos vitais j\xE1 est\xE3o liberados sem limites!`,
          read: false
        });
      } else {
        await db.update(professionalProfiles).set({
          plan: targetPlan,
          isPro: true,
          asaasCustomerId: customerId,
          asaasPaymentId: paymentId,
          updatedAt: /* @__PURE__ */ new Date()
        });
      }
      return res.status(200).json({
        success: true,
        message: `Plano ${targetPlan} liberado com sucesso via Webhook Asaas.`
      });
    }
    if (event === "PAYMENT_REFUNDED") {
      console.log(`[Asaas Webhook] Processando estorno (Art. 49 CDC) para ref:`, externalRef);
      if (externalRef && !isNaN(Number(externalRef))) {
        const userId = Number(externalRef);
        await db.update(professionalProfiles).set({
          plan: "free",
          isPro: false,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq2(professionalProfiles.userId, userId));
      } else {
        await db.update(professionalProfiles).set({
          plan: "free",
          isPro: false,
          updatedAt: /* @__PURE__ */ new Date()
        });
      }
      return res.status(200).json({
        success: true,
        message: "Estorno confirmado. Conta revertida para o plano gratuito."
      });
    }
    return res.status(200).json({ received: true, event });
  } catch (error) {
    console.error("[Asaas Webhook Error]:", error);
    return res.status(500).json({ error: error.message || "Erro interno no webhook." });
  }
}

// server/routes/asaas-checkout.ts
init_schema();
import { eq as eq3 } from "drizzle-orm";
var ASAAS_API_URL = "https://api.asaas.com/v3";
var ASAAS_API_KEY = process.env.ASAAS_API_KEY || "";
var ASAAS_PLANS = {
  solo: {
    plan: "solo",
    title: "MeuAut\xF4nomo PRO Individual \u2013 Vital\xEDcio",
    value: 59.9,
    paymentId: "pay_zhlfko0mdc480t69",
    invoiceUrl: "https://www.asaas.com/i/zhlfko0mdc480t69",
    payload: "00020101021226800014br.gov.bcb.pix2558pix.asaas.com/qr/cobv/b2cb693e-dfa7-47f6-a94a-641d9e4462ee5204000053039865802BR5924Murilo Ferreira da Silva6015Sao Bernardo do61080976105062070503***63041D9D",
    encodedImage: "iVBORw0KGgoAAAANSUhEUgAAAcIAAAHCAQAAAABUY/ToAAADh0lEQVR4Xu2XQW4cORAE+9b//9E+q29aRWQV2zKwkOE9uAwUZ4ZNZmbkHMgR7OvjN8c/18/Kr44lvxtLfjf+F/lcjvtz99y8UG42WgqYKm96yamkciFnTiLWxa4KO73kXBJJIlaeZuIdjVCnlxxOPsRzJwpt4QqPY27Jv4GshMvmq1ElTUvOJ5VliSXi3jIrSyOX9JJjSU48Z/4rr0ov+Z+vP0x+HXEMeO6PnRw9qx+CSw4lzZqo4Ef9stNRbV4DnFyIJceSWOx0kwP0ecS6ImfTv+wlx5FgGE37Nlq5rshXJJI7tORIEhtVJ/EkbQlT62RBl5xKVgbMJXRr6XUVh04LlhxK/qAjXoAERFxmd+6E+pJTyc4kZlGtXgWwr4fr9w4tOY00VE6yfixUiJRGQMeSQ0nsC6nFYlGqxS0Flie55FjSjGKO/cHJZKOqV+G0LjmXROmJ2QKF5K1lvNV3ftlLjiRhPk1jgZJy4TojTDJLjiXVnhN4quFQp7CqXC05lVQrFIe1EnRDNqQc7PEv9ZITSSS4MuEtIuUye7cKdi05mNQEv9OSB/PFMy1Pl6Ziyakkfo07tp8IhBRrcdQl38w88n79wL49+NwIrDyYn/6fzpLjyKweL4EzRZLs3hV9SaAtOZXE+HITNEjFouhDnr3GkqNJTP1y0xEmiGmmN7rkUDIeZtKE3UXB5aVZRXyWHEp2osSGzF1YvcvPvuclh5J10Ni3Uxw2VjZNE+XJLjmWvCKydRSnhHVoFme35GAy+6qI9RniSYFCqlW5D0tOJot56rzPwk72aW8Te8mxZI5cGscuD122meTONyw5lYxwIn3uJG9w5yxyDwwuOZbkvAOJc85GIrHoluIZS04lSyUMCCVJ0EYeaUhGdMmhJA4atudcwegpFRHiqbHkVPLRUfSX3UR1qBLpgZqbsORE0iQF9RTuHrvortaEnx/v0JKjyM9lqcSztSRVeNQE9yO85FCSbC5CpGR6dGnqmayvv9RLDiQJ864UBWZrJ57STrBeci7pYG9FSvKwJ4s0na9ZcigZifPNVEhTvbptP6slx5KlMb2cF6MEeGtP6ZV/SS05kiy/kuGw64qEt/PVlhxPminfpTfkRcPoL/l3kN4CFB/G6llucc/XX/aSo8iPTnvaPqrgsvX0pSrFS04liV+ILaMQr6QJZTPJLTmV/M2x5Hdjye/GHyH/BVAfLbkLV973AAAAAElFTkSuQmCC"
  },
  team: {
    plan: "team",
    title: "MeuAut\xF4nomo PRO Equipe & Est\xFAdio \u2013 Vital\xEDcio",
    value: 99.9,
    paymentId: "pay_44zhds3co79fyqe4",
    invoiceUrl: "https://www.asaas.com/i/44zhds3co79fyqe4",
    payload: "00020101021226800014br.gov.bcb.pix2558pix.asaas.com/qr/cobv/05bf6317-f01e-4d1e-a578-0f7e98c8c9095204000053039865802BR5924Murilo Ferreira da Silva6015Sao Bernardo do61080976105062070503***63041762",
    encodedImage: "iVBORw0KGgoAAAANSUhEUgAAAcIAAAHCAQAAAABUY/ToAAADjElEQVR4Xu2XwW7bMBBEedP//1E/izfX82aWcgIUDtJDNsDSFsWdnTc6kHKb9fjm+LM+K18dQ74bQ74b/0XuxbhU7nXtS8qz8qKWdLUs95BdSTOXqICXqkPRWAks95B9SUlFuDSCx3Zr1ZZvyOYkHnkP6prEZPEZ8leQD219lsU70YqThuxPItvh7uIN9kqRqtHks3vItqR23Hv+lU/cQ/7z88PkGVsCHfUv73tWnAedkjOGbEre3iwfebNdOFI4NHeFDtmUVOM67ToQLJznkQe43H6zh+xIstLOY+Qmh2czFcH5UP/8JgzZkBR4J8RyiZETJuvYVp2EIduR6vHWIgDZQemcwIrDft2/8UP2I6/Ya5YXjAK7EQLIGLIt6V4w7GqJx5IYtStS6pBNybS5b5+DVIZyNNxzuMaQTUmX+yOi8nZJwrB1DBav+JBNSRrBiVCvJkmO1VJCYoZsS0rBI7v2XjaWSSSS7XcE/JBdyafJAF0guwPQ9IHhi2fIrmQB1tWXUuBlIV178Q3Zl0zrQScraTdEAjlg2/9mD9mQ9EhNFwbvpU/d4stThuxKeocPSssHIjZSEnoihmxKbv36+he42lxHS7QXRx2yLemtvu8C+bLxHI87lnnnN37IfmT1bd611QpSFLJWyru1IXuTxb9WzA5yrK8hW5ObLVZfq7hxoJmqIyCNqCHbkjQeMLLLXHHGRDkqQbqGbEqacxN+cRTqupWEZx6yKbn9AqPJUwHEuUsHl5+gZw3ZlaRcmrGHYbabu+N0dzVkU9LW6BC0ntM5Ik4gfdVDhuxLqoE7+y13ZblWSCSHDdmWzFpd06SIMhKGQ3AOx5BdSZXSBEki6ERYlsGK04bsS6ZfzqWe7aiqPd+8xpBtSTvtSkZEYG5OOIFDtiXlQUfDr6XPBFboGJKYv3SGbEliPReNUq0B18AzZFeyjLKehmpWYM+1Cghc23/pDNmQ3HfbDkUk7UaJssGPGLIpKS8HIKw9VjSJvOPPI4bsSj6On03mANhom1MT79blkzBkT5IR8pjVVh4+x0XTd8iupCW2XpDNbDdUSYp7WQ3ZlozmK2UppIknG0pRy/+TGrIlmT6q9Gr7gLCCLm3pBR/yN5CoqnMcvDb6kjTkbyDF4n61CVZPbixa7U9v9pCdyLgRdImzb5Fqi8vih2xLnl03qzuGSFq5bSHikE3Jb44h340h340fIf8CbeG9KUGkMBgAAAAASUVORK5CYII="
  }
};
var pendingUserCheckouts = /* @__PURE__ */ new Map();
async function createPixPayment(req, res) {
  try {
    const plan = req.body?.plan;
    if (!plan || !ASAAS_PLANS[plan]) {
      return res.status(400).json({ error: "Plano inv\xE1lido. Use 'solo' ou 'team'." });
    }
    try {
      const authUser = await sdk.authenticateRequest(req);
      if (authUser?.id) {
        pendingUserCheckouts.set(authUser.id, { plan, timestamp: Date.now() });
      }
    } catch {
    }
    const planData = ASAAS_PLANS[plan];
    return res.status(200).json({
      paymentId: planData.paymentId,
      invoiceUrl: planData.invoiceUrl,
      encodedImage: planData.encodedImage,
      payload: planData.payload
    });
  } catch (error) {
    console.error("[Asaas CreatePix Error]:", error);
    return res.status(500).json({ error: error.message || "Erro ao carregar PIX." });
  }
}
async function getPaymentStatus(req, res) {
  try {
    const { paymentId } = req.params;
    try {
      const authUser = await sdk.authenticateRequest(req);
      if (authUser?.id) {
        const db = await getDb();
        const profiles = await db.select({ isPro: professionalProfiles.isPro, plan: professionalProfiles.plan }).from(professionalProfiles).where(eq3(professionalProfiles.userId, authUser.id)).limit(1);
        if (profiles.length > 0 && profiles[0].isPro) {
          return res.status(200).json({
            status: "CONFIRMED",
            confirmed: true,
            plan: profiles[0].plan
          });
        }
      }
    } catch {
    }
    if (paymentId && ASAAS_API_KEY) {
      try {
        const resAsaas = await fetch(`${ASAAS_API_URL}/payments/${paymentId}`, {
          headers: { access_token: ASAAS_API_KEY }
        });
        if (resAsaas.ok) {
          const payment = await resAsaas.json();
          const confirmed = payment.status === "RECEIVED" || payment.status === "CONFIRMED" || payment.status === "RECEIVED_IN_CASH";
          return res.status(200).json({
            status: payment.status,
            confirmed,
            value: payment.value
          });
        }
      } catch {
      }
    }
    return res.status(200).json({ status: "PENDING", confirmed: false });
  } catch (error) {
    console.error("[Asaas PaymentStatus Error]:", error);
    return res.status(500).json({ error: error.message || "Erro ao consultar status." });
  }
}

// server/routers.ts
init_schema();
import { and as and2, desc as desc2, eq as eq4, gte, lt, lte, ne, like } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z as z2 } from "zod";
import { TRPCError as TRPCError3 } from "@trpc/server";

// server/storage.ts
function getForgeConfig() {
  const forgeUrl = ENV.forgeApiUrl;
  const forgeKey = ENV.forgeApiKey;
  if (!forgeUrl || !forgeKey) {
    throw new Error(
      "Storage config missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }
  return { forgeUrl: forgeUrl.replace(/\/+$/, ""), forgeKey };
}
function normalizeKey(relKey) {
  return relKey.replace(/^\/+/, "");
}
function appendHashSuffix(relKey) {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}
async function storagePut(relKey, data, contentType = "application/octet-stream") {
  const { forgeUrl, forgeKey } = getForgeConfig();
  const key = appendHashSuffix(normalizeKey(relKey));
  const presignUrl = new URL("v1/storage/presign/put", forgeUrl + "/");
  presignUrl.searchParams.set("path", key);
  const presignResp = await fetch(presignUrl, {
    headers: { Authorization: `Bearer ${forgeKey}` }
  });
  if (!presignResp.ok) {
    const msg = await presignResp.text().catch(() => presignResp.statusText);
    throw new Error(`Storage presign failed (${presignResp.status}): ${msg}`);
  }
  const { url: s3Url } = await presignResp.json();
  if (!s3Url) throw new Error("Forge returned empty presign URL");
  const blob = typeof data === "string" ? new Blob([data], { type: contentType }) : new Blob([data], { type: contentType });
  const uploadResp = await fetch(s3Url, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: blob
  });
  if (!uploadResp.ok) {
    throw new Error(`Storage upload to S3 failed (${uploadResp.status})`);
  }
  return { key, url: `/manus-storage/${key}` };
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/email.ts
import nodemailer from "nodemailer";
var RESEND_API_URL = "https://api.resend.com/emails";
var GMAIL_USER = process.env.GMAIL_USER;
var GMAIL_PASS = process.env.GMAIL_PASS;
var _transporter = null;
function getTransporter() {
  if (!_transporter && GMAIL_USER && GMAIL_PASS) {
    _transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASS
      }
    });
  }
  return _transporter;
}
async function enviarEmail({ para, assunto, texto, html, replyTo }) {
  if (!para || !String(para).includes("@")) {
    console.warn("[Email] Destinat\xE1rio inv\xE1lido:", para);
    return { ok: false, error: "Destinat\xE1rio de e-mail inv\xE1lido." };
  }
  const transporter = getTransporter();
  if (transporter) {
    try {
      const remetenteNome = process.env.EMAIL_REMETENTE_NOME || "MeuAut\xF4nomo";
      const info = await transporter.sendMail({
        from: `"${remetenteNome}" <${GMAIL_USER}>`,
        to: para,
        subject: assunto,
        replyTo: replyTo || GMAIL_USER || void 0,
        text: texto || "",
        html: html || void 0,
        headers: {
          "X-Entity-Ref-ID": `quote-${Date.now()}`,
          "X-Auto-Response-Suppress": "OOF, AutoReply"
        }
      });
      console.log(`[Email Gmail] \u2705 E-mail enviado com sucesso para ${para} (ID: ${info.messageId})`);
      return { ok: true, id: info.messageId };
    } catch (err) {
      console.error("[Email Gmail] Falha no envio via Gmail SMTP, tentando fallback:", err?.message);
    }
  }
  const chave = process.env.RESEND_API_KEY;
  const remetente = process.env.EMAIL_REMETENTE || "MeuAut\xF4nomo <onboarding@resend.dev>";
  if (chave) {
    try {
      const resposta = await fetch(RESEND_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${chave}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: remetente,
          to: [para],
          subject: assunto,
          reply_to: replyTo || process.env.EMAIL_RESPOSTA || void 0,
          text: texto || "",
          html: html || void 0
        })
      });
      const corpo = await resposta.text();
      if (!resposta.ok) {
        console.error("[Email Resend] Falha no envio:", resposta.status, corpo.slice(0, 300));
        return { ok: false, error: `Falha ao enviar e-mail: ${resposta.statusText}` };
      }
      let id;
      try {
        id = JSON.parse(corpo).id;
      } catch {
        id = void 0;
      }
      console.log(`[Email Resend] \u2705 E-mail enviado com sucesso para ${para} (ID: ${id})`);
      return { ok: true, id };
    } catch (err) {
      console.error("[Email Resend] Erro de rede ao enviar:", err?.message);
      return { ok: false, error: "Erro de conex\xE3o ao enviar e-mail." };
    }
  }
  console.log("=============================================================================");
  console.log("\u{1F4E8} [E-MAIL SIMULADO] (Configure GMAIL_PASS ou RESEND_API_KEY no .env)");
  console.log(`\u{1F449} Para: ${para}`);
  console.log(`\u{1F4CC} Assunto: ${assunto}`);
  console.log(`\u{1F4C4} Conte\xFAdo:
${texto || "(HTML enviado)"}`);
  console.log("=============================================================================");
  return { ok: true, id: "simulated-" + Date.now() };
}
function modeloOrcamentoAprovado(params) {
  const totalFormatado = (params.totalCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const assunto = `Comprovante: Proposta #${params.orcamentoId} Aprovada \u2014 ${params.profissionalNome}`;
  const itensTexto = params.items.map((it) => `\u2022 ${it.description} (${it.quantity}x de R$ ${(it.unitPriceCents / 100).toFixed(2)}) = R$ ${(it.totalCents / 100).toFixed(2)}`).join("\n");
  const texto = [
    `Ol\xE1, ${params.clienteNome}!`,
    "",
    `Seu aceite na proposta de or\xE7amento #${params.orcamentoId} com ${params.profissionalNome} foi confirmado com sucesso.`,
    "",
    "--- RESUMO DA PROPOSTA ---",
    `Profissional: ${params.profissionalNome} ${params.profissionalProfissao ? `(${params.profissionalProfissao})` : ""}`,
    `Total Aprovado: ${totalFormatado}`,
    params.paymentTerms ? `Forma de pagamento: ${params.paymentTerms}` : "",
    params.notes ? `Observa\xE7\xF5es: ${params.notes}` : "",
    "",
    "Itens do servi\xE7o:",
    itensTexto,
    "",
    `Voc\xEA pode consultar esta proposta a qualquer momento pelo link:`,
    params.linkProposta,
    "",
    "Informa\xE7\xF5es Importantes:",
    "O pagamento deste servi\xE7o ser\xE1 combinado e realizado diretamente com o profissional.",
    params.profissionalWhatsapp ? `WhatsApp do profissional: ${params.profissionalWhatsapp}` : "",
    "",
    "Atenciosamente,",
    "MeuAut\xF4nomo \u2014 Gest\xE3o simples para quem trabalha por conta pr\xF3pria."
  ].filter(Boolean).join("\n");
  const itensHtml = params.items.map(
    (it) => `
      <tr style="border-bottom: 1px solid #edf1eb;">
        <td style="padding: 10px 8px; color: #284b42; font-weight: 500;">${it.description}</td>
        <td style="padding: 10px 8px; text-align: center; color: #71867f;">${it.quantity}</td>
        <td style="padding: 10px 8px; text-align: right; color: #173a34; font-weight: 600;">
          R$ ${(it.totalCents / 100).toFixed(2).replace(".", ",")}
        </td>
      </tr>`
  ).join("");
  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>${assunto}</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #f5f8f2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #284b42;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(19,42,39,0.06); border: 1px solid #e5ede3;">
          <!-- Topo -->
          <tr>
            <td style="background-color: #173a34; padding: 28px 32px; text-align: left;">
              <span style="display: inline-block; background-color: #d9f56a; color: #173a34; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; padding: 4px 10px; border-radius: 8px;">
                MeuAut\xF4nomo
              </span>
              <h1 style="color: #ffffff; font-size: 22px; margin: 12px 0 0 0; font-weight: 700;">
                Or\xE7amento Aprovado com Sucesso! \u{1F389}
              </h1>
              <p style="color: rgba(255,255,255,0.75); font-size: 13px; margin: 4px 0 0 0;">
                Comprovante oficial da proposta digital #${params.orcamentoId}
              </p>
            </td>
          </tr>

          <!-- Corpo -->
          <tr>
            <td style="padding: 32px;">
              <p style="font-size: 15px; line-height: 1.6; margin: 0 0 20px 0; color: #3a574f;">
                Ol\xE1, <strong>${params.clienteNome}</strong>!
              </p>
              <p style="font-size: 14px; line-height: 1.6; margin: 0 0 24px 0; color: #526d64;">
                Confirmamos que voc\xEA aprovou o or\xE7amento de <strong>${params.profissionalNome}</strong>${params.profissionalProfissao ? ` (${params.profissionalProfissao})` : ""}. Abaixo voc\xEA encontra os detalhes do servi\xE7o contratado:
              </p>

              <!-- Card Total -->
              <div style="background-color: #f4f8ed; border-radius: 16px; padding: 18px 20px; margin-bottom: 24px; border: 1px solid #dce8d5;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td>
                      <span style="font-size: 12px; color: #71867f; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Total da Proposta</span>
                      <div style="font-size: 26px; font-weight: 800; color: #173a34; margin-top: 2px;">
                        ${totalFormatado}
                      </div>
                    </td>
                    <td align="right">
                      <span style="display: inline-block; background-color: #e3f3e8; color: #2e6e4a; font-size: 12px; font-weight: 700; padding: 6px 12px; border-radius: 999px;">
                        \u2713 Aceito
                      </span>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Tabela de Itens -->
              <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.08em; color: #71867f; margin: 0 0 12px 0;">
                Itens e Servi\xE7os Aprovados
              </h3>
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px; font-size: 13px;">
                <thead>
                  <tr style="border-bottom: 2px solid #e5ede3; color: #71867f;">
                    <th align="left" style="padding: 8px;">Descri\xE7\xE3o</th>
                    <th align="center" style="padding: 8px;">Qtd</th>
                    <th align="right" style="padding: 8px;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itensHtml}
                </tbody>
              </table>

              ${params.paymentTerms ? `
              <div style="background-color: #f8faf7; border-radius: 14px; padding: 14px 16px; margin-bottom: 16px; border: 1px solid #e1ebe0;">
                <strong style="font-size: 12px; color: #284b42; display: block; margin-bottom: 4px;">Formas e Condi\xE7\xF5es de Pagamento:</strong>
                <p style="font-size: 13px; color: #4c6960; margin: 0; line-height: 1.5;">${params.paymentTerms}</p>
              </div>` : ""}

              ${params.notes ? `
              <div style="background-color: #fff9ed; border-radius: 14px; padding: 14px 16px; margin-bottom: 24px; border: 1px solid #f2e3c6;">
                <strong style="font-size: 12px; color: #7c6023; display: block; margin-bottom: 4px;">Observa\xE7\xF5es e Garantias:</strong>
                <p style="font-size: 13px; color: #6e5828; margin: 0; line-height: 1.5;">${params.notes}</p>
              </div>` : ""}

              <!-- Bot\xE3o de Acesso Online -->
              <div style="text-align: center; margin: 28px 0 20px 0;">
                <a href="${params.linkProposta}" target="_blank" style="display: inline-block; background-color: #173a34; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 14px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 12px rgba(23,58,52,0.2);">
                  Visualizar Proposta Online
                </a>
              </div>

              <!-- Aviso Legal -->
              <p style="font-size: 11px; line-height: 1.5; color: #8fa099; background-color: #f7f9f6; padding: 12px 14px; border-radius: 12px; margin: 24px 0 0 0;">
                \u{1F512} <strong>Pagamento Direto:</strong> O pagamento ser\xE1 realizado diretamente entre voc\xEA e o profissional (${params.profissionalNome}). A plataforma MeuAut\xF4nomo fornece a tecnologia de envio da proposta e n\xE3o ret\xE9m valores.
              </p>
            </td>
          </tr>

          <!-- Rodap\xE9 -->
          <tr>
            <td style="background-color: #f9fbf8; padding: 20px 32px; border-top: 1px solid #edf1eb; text-align: center; font-size: 12px; color: #8fa099;">
              Enviado por <strong>${params.profissionalNome}</strong> atrav\xE9s do <strong>MeuAut\xF4nomo</strong>.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
  return { assunto, texto, html };
}
function modeloRecuperacaoSenha(params) {
  const assunto = `C\xF3digo de Recupera\xE7\xE3o de Senha: ${params.codigo} \u2014 MeuAut\xF4nomo`;
  const texto = `Ol\xE1, ${params.nome}!

Recebemos uma solicita\xE7\xE3o para redefinir a senha da sua conta no MeuAut\xF4nomo.

Seu c\xF3digo de verifica\xE7\xE3o \xE9: ${params.codigo}

Este c\xF3digo \xE9 v\xE1lido por 20 minutos. Se voc\xEA n\xE3o solicitou esta altera\xE7\xE3o, ignore este e-mail.

Equipe MeuAut\xF4nomo \u2022 CreativeAM`;
  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Recupera\xE7\xE3o de Senha \u2014 MeuAut\xF4nomo</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7f1; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #173a34;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f7f1; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 40px rgba(23,58,52,0.08); border: 1px solid #dce5dc;">
          <tr>
            <td style="background-color: #173a34; padding: 28px 32px; text-align: center;">
              <span style="display: inline-block; background-color: #d9f56a; color: #173a34; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; padding: 4px 10px; border-radius: 8px;">
                MeuAut\xF4nomo
              </span>
              <h1 style="color: #ffffff; font-size: 20px; margin: 12px 0 0 0; font-weight: 700;">
                Recupera\xE7\xE3o de Senha
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px; text-align: left;">
              <p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px 0; color: #3a574f;">
                Ol\xE1, <strong>${params.nome}</strong>!
              </p>
              <p style="font-size: 14px; line-height: 1.6; margin: 0 0 24px 0; color: #526d64;">
                Recebemos um pedido para redefinir a senha de acesso \xE0 sua conta vinculada ao e-mail <strong>${params.email}</strong>.
              </p>

              <div style="background-color: #f4f8ed; border-radius: 16px; padding: 20px; text-align: center; margin: 24px 0; border: 1px solid #dce8d5;">
                <span style="font-size: 12px; color: #71867f; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; display: block; margin-bottom: 6px;">
                  Seu C\xF3digo de Confirma\xE7\xE3o
                </span>
                <div style="font-size: 32px; font-weight: 900; letter-spacing: 0.25em; color: #173a34; font-family: monospace;">
                  ${params.codigo}
                </div>
                <span style="font-size: 11px; color: #8aa500; font-weight: 600; display: block; margin-top: 6px;">
                  V\xE1lido por 20 minutos
                </span>
              </div>

              <p style="font-size: 13px; line-height: 1.6; margin: 0 0 16px 0; color: #698279;">
                Insira este c\xF3digo na tela do MeuAut\xF4nomo para cadastrar sua nova senha.
              </p>

              <p style="font-size: 11px; line-height: 1.5; color: #8fa099; background-color: #f7f9f6; padding: 12px 14px; border-radius: 12px; margin: 20px 0 0 0;">
                \u{1F512} Se voc\xEA n\xE3o solicitou a redefini\xE7\xE3o da sua senha, fique tranquilo: sua conta permanece segura e voc\xEA pode ignorar esta mensagem.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fbf8; padding: 18px 32px; border-top: 1px solid #edf1eb; text-align: center; font-size: 11px; color: #8fa099;">
              Desenvolvido com excel\xEAncia por <strong>CreativeAM</strong> \u2022 MeuAut\xF4nomo
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
  return { assunto, texto, html };
}

// server/routers.ts
import crypto3 from "node:crypto";

// server/receiptAuth.ts
import crypto2 from "crypto";
function generateReceiptAuthCode(type, id, profileId, amountCents) {
  const secretSalt = process.env.SESSION_SECRET || "meuautonomo-receipt-salt-2026";
  const hash = crypto2.createHmac("sha256", secretSalt).update(`${type}:${id}:${profileId}:${amountCents}`).digest("hex").slice(0, 6).toUpperCase();
  return `MA-REC-${type}${id}-${hash}`;
}

// server/billingRules.ts
function isBillableAppointment(status) {
  return status !== "cancelado" && status !== "faltou";
}
function isCountableAppointment(status) {
  return status !== "cancelado" && status !== "faltou";
}
function isCommissionEligible(status) {
  return status !== "cancelado" && status !== "faltou";
}
function calculateCommissionAndStudio(amountCents, commissionPercent) {
  const safePercent = Math.max(0, Math.min(100, Math.round(commissionPercent)));
  const commissionCents = Math.round(amountCents * safePercent / 100);
  const studioCents = amountCents - commissionCents;
  return { commissionCents, studioCents };
}
function calculateDeduplicatedMetrics(appointments2, payments2, expenses2 = []) {
  const billableApps = appointments2.filter((a) => isBillableAppointment(a.status));
  const appointmentCount = appointments2.filter((a) => isCountableAppointment(a.status)).length;
  const paymentsByAppId = /* @__PURE__ */ new Map();
  const unlinkedPayments = [];
  const explicitlyLinkedPaymentIds = /* @__PURE__ */ new Set();
  for (const pay of payments2) {
    if (pay.appointmentId) {
      if (!paymentsByAppId.has(pay.appointmentId)) {
        paymentsByAppId.set(pay.appointmentId, []);
      }
      paymentsByAppId.get(pay.appointmentId).push(pay);
      explicitlyLinkedPaymentIds.add(pay.id);
    }
  }
  for (const pay of payments2) {
    if (explicitlyLinkedPaymentIds.has(pay.id)) continue;
    let matchedApp;
    if (pay.clientId) {
      matchedApp = billableApps.find(
        (a) => a.clientId === pay.clientId && (!paymentsByAppId.has(a.id) || paymentsByAppId.get(a.id).length === 0) && (pay.serviceId ? a.serviceId === pay.serviceId : true)
      );
    }
    if (matchedApp) {
      if (!paymentsByAppId.has(matchedApp.id)) {
        paymentsByAppId.set(matchedApp.id, []);
      }
      paymentsByAppId.get(matchedApp.id).push(pay);
    } else {
      unlinkedPayments.push(pay);
    }
  }
  let faturamentoCents = 0;
  let recebidoCents = 0;
  let pendenteCents = 0;
  for (const app2 of billableApps) {
    const appGross = app2.amountCents || 0;
    faturamentoCents += appGross;
    const linkedPays = paymentsByAppId.get(app2.id) || [];
    if (linkedPays.length > 0) {
      const paidSum = linkedPays.filter((p) => p.status === "pago").reduce((sum, p) => sum + p.amountCents, 0);
      const appReceived = Math.min(appGross, paidSum);
      recebidoCents += appReceived;
      pendenteCents += Math.max(0, appGross - appReceived);
    } else {
      if (app2.paymentStatus === "pago" || app2.status === "concluido") {
        recebidoCents += appGross;
      } else {
        pendenteCents += appGross;
      }
    }
  }
  for (const pay of unlinkedPayments) {
    faturamentoCents += pay.amountCents;
    if (pay.status === "pago") {
      recebidoCents += pay.amountCents;
    } else {
      pendenteCents += pay.amountCents;
    }
  }
  const despesasCents = expenses2.reduce((sum, e) => sum + (e.amountCents || 0), 0);
  const saldoCents = recebidoCents - despesasCents;
  return {
    faturamentoCents,
    recebidoCents,
    pendenteCents,
    despesasCents,
    saldoCents,
    appointmentCount
  };
}
function calculateTeamReport(members, appointments2, payments2, expenses2 = []) {
  const billableApps = appointments2.filter((a) => isCommissionEligible(a.status));
  const paymentsByAppId = /* @__PURE__ */ new Map();
  const unlinkedPayments = [];
  const explicitlyLinkedPaymentIds = /* @__PURE__ */ new Set();
  for (const pay of payments2) {
    if (pay.appointmentId) {
      if (!paymentsByAppId.has(pay.appointmentId)) {
        paymentsByAppId.set(pay.appointmentId, []);
      }
      paymentsByAppId.get(pay.appointmentId).push(pay);
      explicitlyLinkedPaymentIds.add(pay.id);
    }
  }
  for (const pay of payments2) {
    if (explicitlyLinkedPaymentIds.has(pay.id)) continue;
    let matchedApp;
    if (pay.clientId) {
      matchedApp = billableApps.find(
        (a) => a.clientId === pay.clientId && (!paymentsByAppId.has(a.id) || paymentsByAppId.get(a.id).length === 0) && (pay.serviceId ? a.serviceId === pay.serviceId : true)
      );
    }
    if (matchedApp) {
      if (!paymentsByAppId.has(matchedApp.id)) {
        paymentsByAppId.set(matchedApp.id, []);
      }
      paymentsByAppId.get(matchedApp.id).push(pay);
    } else {
      unlinkedPayments.push(pay);
    }
  }
  const consolidatedPayments = [];
  for (const app2 of billableApps) {
    const linkedPays = paymentsByAppId.get(app2.id) || [];
    const effectiveTeamMemberId = app2.teamMemberId || linkedPays.find((p) => p.teamMemberId)?.teamMemberId || null;
    const member = members.find((m) => m.id === effectiveTeamMemberId);
    const commPct = member?.commissionPercent ?? 50;
    const commAmount = Math.round((app2.amountCents || 0) * commPct / 100);
    const studioAmount = (app2.amountCents || 0) - commAmount;
    let isPaid = app2.paymentStatus === "pago" || app2.status === "concluido";
    let paidSum = 0;
    if (linkedPays.length > 0) {
      paidSum = linkedPays.filter((p) => p.status === "pago").reduce((sum, p) => sum + p.amountCents, 0);
      isPaid = isPaid || paidSum >= app2.amountCents;
    }
    consolidatedPayments.push({
      id: linkedPays[0]?.id || -app2.id,
      profileId: app2.profileId,
      appointmentId: app2.id,
      clientId: app2.clientId,
      serviceId: app2.serviceId,
      teamMemberId: effectiveTeamMemberId,
      amountCents: app2.amountCents,
      commissionPercent: commPct,
      commissionAmountCents: commAmount,
      studioAmountCents: studioAmount,
      status: isPaid ? "pago" : "pendente",
      method: linkedPays[0]?.method || app2.paymentMethod || "pix",
      createdAt: linkedPays[0]?.createdAt || app2.startsAt
    });
  }
  for (const pay of unlinkedPayments) {
    consolidatedPayments.push(pay);
  }
  const breakdown = members.map((m) => {
    const memberItems = consolidatedPayments.filter((p) => p.teamMemberId === m.id);
    const grossCents = memberItems.reduce((sum, p) => sum + (p.amountCents || 0), 0);
    const receivedCents = memberItems.filter((p) => p.status === "pago").reduce((sum, p) => sum + (p.amountCents || 0), 0);
    const commissionCents = memberItems.reduce((sum, p) => {
      if (p.commissionAmountCents !== void 0 && p.commissionAmountCents !== null && p.commissionAmountCents > 0) {
        return sum + p.commissionAmountCents;
      }
      return sum + Math.round((p.amountCents || 0) * m.commissionPercent / 100);
    }, 0);
    const studioCents = grossCents - commissionCents;
    const count = memberItems.filter((p) => p.appointmentId).length;
    return {
      member: m,
      count,
      grossCents,
      receivedCents,
      commissionCents,
      studioCents,
      commissionPercent: m.commissionPercent
    };
  });
  const totalGrossCents = breakdown.reduce((sum, b) => sum + b.grossCents, 0);
  const totalReceivedCents = breakdown.reduce((sum, b) => sum + b.receivedCents, 0);
  const totalCommissionCents = breakdown.reduce((sum, b) => sum + b.commissionCents, 0);
  const totalStudioNetCents = totalGrossCents - totalCommissionCents;
  const totalExpensesCents = expenses2.reduce((sum, e) => sum + (e.amountCents || 0), 0);
  const finalProfitCents = totalStudioNetCents - totalExpensesCents;
  return {
    totalGrossCents,
    totalReceivedCents,
    totalCommissionCents,
    totalStudioNetCents,
    totalExpensesCents,
    finalProfitCents,
    breakdown,
    payments: consolidatedPayments
  };
}

// server/routers.ts
function hashPassword(password) {
  const salt = crypto3.randomBytes(16).toString("hex");
  const hash = crypto3.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}
function verifyPassword(password, stored) {
  try {
    const [salt, key] = stored.split(":");
    if (!salt || !key) return false;
    const hash = crypto3.scryptSync(password, salt, 64).toString("hex");
    return crypto3.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(key, "hex"));
  } catch {
    return false;
  }
}
function secureEquals(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && crypto3.timingSafeEqual(leftBuffer, rightBuffer);
}
var passwordResetMap = /* @__PURE__ */ new Map();
var modality = z2.enum(["presencial", "endereco", "online", "hibrido"]);
var paymentMethod = z2.enum(["pix", "dinheiro", "cartao", "transferencia", "outro"]);
var appointmentStatus = z2.enum(["agendado", "confirmado", "andamento", "concluido", "cancelado", "faltou"]);
var paymentStatus = z2.enum(["pendente", "parcial", "pago"]);
async function requireProfile(userId) {
  const profile = await getProfileByUserId(userId);
  if (!profile) throw new TRPCError3({ code: "PRECONDITION_FAILED", message: "Finalize seu perfil para continuar." });
  return profile;
}
async function getOwnedService(profileId, serviceId) {
  const db = await getDb();
  if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Banco de dados indispon\xEDvel." });
  const result = await db.select().from(services).where(and2(eq4(services.id, serviceId), eq4(services.profileId, profileId))).limit(1);
  if (!result[0]) throw new TRPCError3({ code: "NOT_FOUND", message: "Servi\xE7o n\xE3o encontrado." });
  return result[0];
}
async function getOwnedClient(profileId, clientId) {
  const db = await getDb();
  if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Banco de dados indispon\xEDvel." });
  const result = await db.select().from(clients).where(and2(eq4(clients.id, clientId), eq4(clients.profileId, profileId))).limit(1);
  if (!result[0]) throw new TRPCError3({ code: "NOT_FOUND", message: "Cliente n\xE3o encontrado." });
  return result[0];
}
async function getOwnedTeamMember(profileId, memberId) {
  const db = await getDb();
  if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Banco de dados indispon\xEDvel." });
  const result = await db.select().from(teamMembers).where(and2(eq4(teamMembers.id, memberId), eq4(teamMembers.profileId, profileId))).limit(1);
  if (!result[0]) throw new TRPCError3({ code: "NOT_FOUND", message: "Profissional parceiro(a) n\xE3o encontrado." });
  return result[0];
}
function dayStart(date = /* @__PURE__ */ new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}
function dayEnd(date = /* @__PURE__ */ new Date()) {
  const end = dayStart(date);
  end.setDate(end.getDate() + 1);
  return end;
}
function isWithinAvailability(start, durationMinutes, availabilityRow, timeZone = "America/Sao_Paulo") {
  if (!availabilityRow) return true;
  try {
    const config = JSON.parse(availabilityRow.schedule);
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      weekday: "short"
    });
    const parts = Object.fromEntries(dtf.formatToParts(start).map((p) => [p.type, p.value]));
    const dayNames = {
      Sun: "sun",
      Mon: "mon",
      Tue: "tue",
      Wed: "wed",
      Thu: "thu",
      Fri: "fri",
      Sat: "sat"
    };
    const day = dayNames[parts.weekday] || "mon";
    if (config.days?.length && !config.days.includes(day)) return false;
    const toMinutes = (value) => {
      const [hours, minutes] = value.split(":").map(Number);
      return hours * 60 + minutes;
    };
    const startMinutes = Number(parts.hour) * 60 + Number(parts.minute);
    const endMinutes = startMinutes + durationMinutes;
    if (config.start && startMinutes < toMinutes(config.start)) return false;
    if (config.end && endMinutes > toMinutes(config.end)) return false;
    if (config.breaks?.some((item) => startMinutes < toMinutes(item.end) && endMinutes > toMinutes(item.start))) return false;
    const unavailable = availabilityRow.unavailableDays ? JSON.parse(availabilityRow.unavailableDays) : [];
    const dateKey = `${parts.year}-${parts.month}-${parts.day}`;
    return !unavailable.includes(dateKey);
  } catch {
    return true;
  }
}
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    register: publicProcedure.input(
      z2.object({
        name: z2.string().min(2, "Informe seu nome completo ou profissional."),
        email: z2.string().email("Informe um e-mail v\xE1lido."),
        password: z2.string().min(6, "A senha deve ter no m\xEDnimo 6 caracteres.")
      })
    ).mutation(async ({ ctx, input }) => {
      const normalizedEmail = input.email.trim().toLowerCase();
      const existing = await getUserByEmail(normalizedEmail);
      if (existing) {
        throw new TRPCError3({
          code: "CONFLICT",
          message: "J\xE1 existe uma conta cadastrada com este e-mail. Fa\xE7a login ou use outro e-mail."
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
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const createdUser = await getUserByOpenId(openId);
      if (!createdUser) {
        throw new TRPCError3({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao criar conta no banco de dados."
        });
      }
      const sessionToken = await sdk.createSessionToken(openId, {
        name,
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      return {
        success: true,
        sessionToken,
        user: createdUser
      };
    }),
    login: publicProcedure.input(
      z2.object({
        email: z2.string().email("Informe um e-mail v\xE1lido."),
        password: z2.string().min(1, "Informe sua senha.")
      })
    ).mutation(async ({ ctx, input }) => {
      const normalizedEmail = input.email.trim().toLowerCase();
      const user = await getUserByEmail(normalizedEmail);
      if (!user) {
        throw new TRPCError3({
          code: "UNAUTHORIZED",
          message: "E-mail ou senha incorretos."
        });
      }
      if (user.passwordHash) {
        const isValid = verifyPassword(input.password, user.passwordHash);
        if (!isValid) {
          throw new TRPCError3({
            code: "UNAUTHORIZED",
            message: "E-mail ou senha incorretos."
          });
        }
      } else if (user.openId !== "dev-user-local") {
        throw new TRPCError3({
          code: "UNAUTHORIZED",
          message: "Esta conta foi registrada com outro m\xE9todo de acesso."
        });
      }
      await upsertUser({
        openId: user.openId,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(user.openId, {
        name: user.name || "Profissional",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      return {
        success: true,
        sessionToken,
        user
      };
    }),
    quickLogin: publicProcedure.input(z2.object({ openId: z2.string() })).mutation(async ({ ctx, input }) => {
      if (!isDemoMode()) {
        throw new TRPCError3({
          code: "FORBIDDEN",
          message: "O acesso de teste r\xE1pido est\xE1 desativado pelo administrador para proteger contas reais."
        });
      }
      const user = await getUserByOpenId(input.openId);
      if (!user) {
        throw new TRPCError3({
          code: "NOT_FOUND",
          message: "Usu\xE1rio n\xE3o encontrado."
        });
      }
      await upsertUser({
        openId: user.openId,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(user.openId, {
        name: user.name || "Profissional",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      return {
        success: true,
        sessionToken,
        user
      };
    }),
    listUsers: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user || ctx.user.role !== "admin") {
        return [];
      }
      const all = await getAllUsers();
      return all.map((u) => ({
        id: u.id,
        openId: u.openId,
        name: u.name || "Sem nome",
        email: u.email || "Sem e-mail"
      }));
    }),
    isDemoMode: publicProcedure.query(() => false),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, path: "/", maxAge: -1 });
      if (typeof ctx.res?.setHeader === "function") {
        ctx.res.setHeader("Set-Cookie", [
          `${COOKIE_NAME}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax`,
          `manus-auth-session-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax`
        ]);
      }
      return { success: true };
    }),
    requestPasswordReset: publicProcedure.input(z2.object({ email: z2.string().email("Informe um e-mail v\xE1lido.") })).mutation(async ({ input }) => {
      const normalizedEmail = input.email.trim().toLowerCase();
      const user = await getUserByEmail(normalizedEmail);
      if (!user) {
        return {
          success: true,
          message: "Se o e-mail estiver cadastrado, o c\xF3digo de recupera\xE7\xE3o foi enviado para sua caixa de entrada."
        };
      }
      const code = Math.floor(1e5 + Math.random() * 9e5).toString();
      const expiresAt = Date.now() + 20 * 60 * 1e3;
      passwordResetMap.set(normalizedEmail, {
        code,
        expiresAt,
        email: normalizedEmail,
        userId: user.id
      });
      const emailData = modeloRecuperacaoSenha({
        nome: user.name || "Profissional",
        email: normalizedEmail,
        codigo: code
      });
      try {
        await enviarEmail({
          para: normalizedEmail,
          assunto: emailData.assunto,
          texto: emailData.texto,
          html: emailData.html
        });
      } catch (err) {
        console.error("[Auth] Erro ao enviar e-mail de recupera\xE7\xE3o:", err);
      }
      return {
        success: true,
        message: "C\xF3digo de recupera\xE7\xE3o enviado com sucesso para seu e-mail!",
        email: normalizedEmail
      };
    }),
    resetPasswordWithCode: publicProcedure.input(
      z2.object({
        email: z2.string().email("Informe um e-mail v\xE1lido."),
        code: z2.string().min(4, "C\xF3digo inv\xE1lido."),
        newPassword: z2.string().min(6, "A nova senha deve ter no m\xEDnimo 6 caracteres.")
      })
    ).mutation(async ({ ctx, input }) => {
      const normalizedEmail = input.email.trim().toLowerCase();
      const entry = passwordResetMap.get(normalizedEmail);
      if (!entry || entry.code !== input.code.trim()) {
        throw new TRPCError3({
          code: "BAD_REQUEST",
          message: "C\xF3digo de recupera\xE7\xE3o incorreto ou n\xE3o encontrado."
        });
      }
      if (Date.now() > entry.expiresAt) {
        passwordResetMap.delete(normalizedEmail);
        throw new TRPCError3({
          code: "BAD_REQUEST",
          message: "O c\xF3digo de recupera\xE7\xE3o expirou. Solicite um novo c\xF3digo."
        });
      }
      const user = await getUserByEmail(normalizedEmail);
      if (!user) {
        throw new TRPCError3({
          code: "NOT_FOUND",
          message: "Usu\xE1rio n\xE3o encontrado."
        });
      }
      const newHash = hashPassword(input.newPassword);
      const db = await getDb();
      if (db) {
        await db.update(users).set({ passwordHash: newHash }).where(eq4(users.id, user.id));
      }
      passwordResetMap.delete(normalizedEmail);
      const sessionToken = await sdk.createSessionToken(user.openId, {
        name: user.name || "Profissional",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      return {
        success: true,
        message: "Senha alterada com sucesso! Voc\xEA j\xE1 est\xE1 conectado.",
        sessionToken,
        user
      };
    })
  }),
  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const profile = await getProfileByUserId(ctx.user.id);
      if (!profile) return null;
      if (profile.plan !== "free" && !profile.isVip && profile.planExpiresAt) {
        if (/* @__PURE__ */ new Date() > new Date(profile.planExpiresAt)) {
          const db = await getDb();
          if (db) {
            await db.update(professionalProfiles).set({ plan: "free", isPro: false }).where(eq4(professionalProfiles.id, profile.id));
          }
          return { ...profile, plan: "free", isPro: false };
        }
      }
      return profile;
    }),
    upsert: protectedProcedure.input(z2.object({
      displayName: z2.string().min(2).max(160),
      slug: z2.string().min(3).max(100).regex(/^[a-z0-9-]+$/, "Use apenas letras min\xFAsculas, n\xFAmeros e h\xEDfen."),
      professionCategory: z2.string().max(100).optional(),
      professionName: z2.string().min(2).max(160),
      bio: z2.string().max(1200).optional(),
      city: z2.string().max(120).optional(),
      serviceRegion: z2.string().max(160).optional(),
      phone: z2.string().max(40).optional(),
      whatsapp: z2.string().max(40).optional(),
      avatarUrl: z2.string().max(500).optional(),
      pixKey: z2.string().max(140).optional(),
      pixKeyType: z2.string().max(30).optional(),
      showPrices: z2.boolean().default(true),
      bookingEnabled: z2.boolean().default(false),
      accountType: z2.enum(["individual", "equipe"]).default("individual").optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Banco de dados indispon\xEDvel." });
      const current = await getProfileByUserId(ctx.user.id);
      if (current && input.slug && input.slug !== current.slug) {
        const slugOwner = await getProfileBySlug(input.slug);
        if (slugOwner && slugOwner.userId !== ctx.user.id) {
          throw new TRPCError3({ code: "CONFLICT", message: "Esse endere\xE7o p\xFAblico j\xE1 est\xE1 em uso por outro profissional." });
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
            pixKeyType: input.pixKeyType ?? null
          }).where(eq4(professionalProfiles.id, current.id));
        } else {
          const slugOwner = await getProfileBySlug(input.slug);
          const slug = slugOwner && slugOwner.userId !== ctx.user.id ? `${input.slug}-${nanoid(6).toLowerCase()}`.slice(0, 100) : input.slug;
          const refCode = `${slug.replace(/[^a-z0-9]/gi, "").slice(0, 8).toUpperCase()}-${nanoid(4).toUpperCase()}`;
          await db.insert(professionalProfiles).values({ ...input, slug, userId: ctx.user.id, referralCode: refCode, professionCategory: input.professionCategory ?? null, bio: input.bio ?? null, city: input.city ?? null, serviceRegion: input.serviceRegion ?? null, phone: input.phone ?? null, whatsapp: input.whatsapp ?? null, pixKey: input.pixKey ?? null, pixKeyType: input.pixKeyType ?? null });
        }
      } catch {
        throw new TRPCError3({ code: "CONFLICT", message: "Esse endere\xE7o p\xFAblico j\xE1 est\xE1 em uso." });
      }
      return getProfileByUserId(ctx.user.id);
    }),
    setAccountType: protectedProcedure.input(z2.object({ accountType: z2.enum(["individual", "equipe"]) })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(professionalProfiles).set({ accountType: input.accountType }).where(eq4(professionalProfiles.id, profile.id));
      return { success: true, accountType: input.accountType };
    }),
    saveAvailability: protectedProcedure.input(z2.object({ schedule: z2.string().min(2), unavailableDays: z2.string().optional() })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      const existing = await db.select().from(availability).where(eq4(availability.profileId, profile.id)).limit(1);
      if (existing[0]) await db.update(availability).set({ schedule: input.schedule, unavailableDays: input.unavailableDays ?? null }).where(eq4(availability.profileId, profile.id));
      else await db.insert(availability).values({ profileId: profile.id, schedule: input.schedule, unavailableDays: input.unavailableDays ?? null });
      return { success: true };
    }),
    getAvailability: protectedProcedure.query(async ({ ctx }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      const result = await db.select().from(availability).where(eq4(availability.profileId, profile.id)).limit(1);
      return result[0] ?? null;
    }),
    uploadAvatar: protectedProcedure.input(z2.object({ fileName: z2.string().max(180), mimeType: z2.enum(["image/jpeg", "image/png", "image/webp"]), dataUrl: z2.string().max(7e6) })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const encoded = input.dataUrl.split(",")[1];
      if (!encoded) throw new TRPCError3({ code: "BAD_REQUEST", message: "Arquivo inv\xE1lido." });
      const buffer = Buffer.from(encoded, "base64");
      if (buffer.length > 5e6) throw new TRPCError3({ code: "BAD_REQUEST", message: "A foto deve ter no m\xE1ximo 5 MB." });
      let avatarUrl = input.dataUrl;
      try {
        const stored = await storagePut(`profiles/${profile.id}/avatar-${input.fileName}`, buffer, input.mimeType);
        if (stored?.url) avatarUrl = stored.url;
      } catch (err) {
        console.warn("[uploadAvatar] Storage put failed, using dataUrl fallback:", err);
      }
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(professionalProfiles).set({ avatarUrl }).where(eq4(professionalProfiles.id, profile.id));
      return { success: true, avatarUrl };
    })
  }),
  service: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      return db.select().from(services).where(eq4(services.profileId, profile.id)).orderBy(desc2(services.active), desc2(services.createdAt));
    }),
    create: protectedProcedure.input(z2.object({ name: z2.string().min(2).max(160), description: z2.string().max(1e3).optional(), durationMinutes: z2.number().int().min(15).max(1440), priceCents: z2.number().int().min(0), modality })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      await db.insert(services).values({ ...input, profileId: profile.id, description: input.description ?? null });
      return { success: true };
    }),
    update: protectedProcedure.input(z2.object({ id: z2.number(), name: z2.string().min(2).max(160), description: z2.string().max(1e3).optional(), durationMinutes: z2.number().int().min(15).max(1440), priceCents: z2.number().int().min(0), modality, active: z2.boolean() })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      await getOwnedService(profile.id, input.id);
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(services).set({ name: input.name, description: input.description ?? null, durationMinutes: input.durationMinutes, priceCents: input.priceCents, modality: input.modality, active: input.active }).where(eq4(services.id, input.id));
      return { success: true };
    }),
    remove: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      await getOwnedService(profile.id, input.id);
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(services).set({ active: false }).where(eq4(services.id, input.id));
      return { success: true };
    })
  }),
  customer: router({
    list: protectedProcedure.input(z2.object({ includeArchived: z2.boolean().default(false) }).optional()).query(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      const conditions = input?.includeArchived ? eq4(clients.profileId, profile.id) : and2(eq4(clients.profileId, profile.id), eq4(clients.archived, false));
      return db.select().from(clients).where(conditions).orderBy(desc2(clients.createdAt));
    }),
    create: protectedProcedure.input(z2.object({ name: z2.string().min(2).max(160), phone: z2.string().max(40).optional(), whatsapp: z2.string().max(40).optional(), email: z2.string().email().optional().or(z2.literal("")), address: z2.string().max(600).optional(), notes: z2.string().max(1200).optional() })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      await db.insert(clients).values({ ...input, profileId: profile.id, archived: false, phone: input.phone ?? null, whatsapp: input.whatsapp ?? null, email: input.email || null, address: input.address ?? null, notes: input.notes ?? null });
      return { success: true };
    }),
    update: protectedProcedure.input(z2.object({ id: z2.number(), name: z2.string().min(2).max(160), phone: z2.string().max(40).optional(), whatsapp: z2.string().max(40).optional(), email: z2.string().email().optional().or(z2.literal("")), address: z2.string().max(600).optional(), notes: z2.string().max(1200).optional(), archived: z2.boolean().default(false) })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      await getOwnedClient(profile.id, input.id);
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(clients).set({ name: input.name, phone: input.phone ?? null, whatsapp: input.whatsapp ?? null, email: input.email || null, address: input.address ?? null, notes: input.notes ?? null, archived: input.archived }).where(eq4(clients.id, input.id));
      return { success: true };
    }),
    history: protectedProcedure.input(z2.object({ id: z2.number() })).query(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      const client = await getOwnedClient(profile.id, input.id);
      const [clientAppointments, clientQuotes, clientPayments] = await Promise.all([
        db.select().from(appointments).where(and2(eq4(appointments.profileId, profile.id), eq4(appointments.clientId, input.id))).orderBy(desc2(appointments.startsAt)),
        db.select().from(quotes).where(and2(eq4(quotes.profileId, profile.id), eq4(quotes.clientId, input.id))).orderBy(desc2(quotes.createdAt)),
        db.select().from(payments).where(and2(eq4(payments.profileId, profile.id), eq4(payments.clientId, input.id))).orderBy(desc2(payments.createdAt))
      ]);
      return { client, appointments: clientAppointments, quotes: clientQuotes, payments: clientPayments };
    }),
    remove: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      await getOwnedClient(profile.id, input.id);
      const related = await db.select({ id: appointments.id }).from(appointments).where(and2(eq4(appointments.profileId, profile.id), eq4(appointments.clientId, input.id))).limit(1);
      if (related[0]) {
        await db.update(clients).set({ archived: true }).where(eq4(clients.id, input.id));
      } else {
        await db.delete(clients).where(and2(eq4(clients.id, input.id), eq4(clients.profileId, profile.id)));
      }
      return { success: true };
    })
  }),
  appointment: router({
    list: protectedProcedure.input(z2.object({ from: z2.string().datetime().optional(), to: z2.string().datetime().optional() }).optional()).query(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      const conditions = [eq4(appointments.profileId, profile.id)];
      if (input?.from) conditions.push(gte(appointments.startsAt, new Date(input.from)));
      if (input?.to) conditions.push(lt(appointments.startsAt, new Date(input.to)));
      const rows = await db.select().from(appointments).where(and2(...conditions)).orderBy(appointments.startsAt);
      return rows.map((r) => ({
        ...r,
        receiptCode: generateReceiptAuthCode("A", r.id, r.profileId, r.amountCents)
      }));
    }),
    unresolvedPast: protectedProcedure.query(async ({ ctx }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      const rows = await db.select().from(appointments).where(
        and2(
          eq4(appointments.profileId, profile.id),
          ne(appointments.status, "cancelado")
        )
      ).orderBy(desc2(appointments.startsAt));
      const nowMs = Date.now();
      const past = rows.filter((r) => {
        const isPending = r.status === "agendado" || r.status === "confirmado" || r.status === "andamento";
        if (!isPending) return false;
        const startMs = new Date(r.startsAt).getTime();
        const endMs = startMs + (r.durationMinutes || 60) * 6e4;
        return endMs <= nowMs;
      });
      return past.slice(0, 20).map((r) => ({
        ...r,
        receiptCode: generateReceiptAuthCode("A", r.id, r.profileId, r.amountCents)
      }));
    }),
    create: protectedProcedure.input(z2.object({
      teamMemberId: z2.number().optional(),
      clientId: z2.number().optional(),
      serviceId: z2.number().optional(),
      startsAt: z2.string().datetime(),
      durationMinutes: z2.number().int().min(15).max(1440),
      location: z2.string().max(600).optional(),
      amountCents: z2.number().int().min(0),
      status: appointmentStatus.default("agendado"),
      notes: z2.string().max(1200).optional(),
      paymentMethod: paymentMethod.optional(),
      paymentStatus: paymentStatus.default("pendente")
    })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      if (input.clientId) await getOwnedClient(profile.id, input.clientId);
      if (input.serviceId) await getOwnedService(profile.id, input.serviceId);
      if (input.teamMemberId) await getOwnedTeamMember(profile.id, input.teamMemberId);
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      const start = new Date(input.startsAt);
      const availabilityRow = (await db.select().from(availability).where(eq4(availability.profileId, profile.id)).limit(1))[0];
      if (!isWithinAvailability(start, input.durationMinutes, availabilityRow)) {
        throw new TRPCError3({ code: "CONFLICT", message: "Esse hor\xE1rio est\xE1 fora da sua disponibilidade." });
      }
      const end = new Date(start.getTime() + input.durationMinutes * 6e4);
      const sameDay = await db.select().from(appointments).where(and2(eq4(appointments.profileId, profile.id), gte(appointments.startsAt, dayStart(start)), lt(appointments.startsAt, dayEnd(start)), ne(appointments.status, "cancelado")));
      const conflict = sameDay.some((item) => {
        const t1 = input.teamMemberId ?? 0;
        const t2 = item.teamMemberId ?? 0;
        if (t1 !== t2) {
          return false;
        }
        const itemStart = new Date(item.startsAt).getTime();
        const itemEnd = itemStart + item.durationMinutes * 6e4;
        return itemStart < end.getTime() && start.getTime() < itemEnd;
      });
      if (conflict) {
        throw new TRPCError3({ code: "CONFLICT", message: "Esse hor\xE1rio j\xE1 est\xE1 ocupado para este profissional." });
      }
      const insert = await db.insert(appointments).values({
        ...input,
        profileId: profile.id,
        teamMemberId: input.teamMemberId ?? null,
        startsAt: start,
        clientId: input.clientId ?? null,
        serviceId: input.serviceId ?? null,
        location: input.location ?? null,
        notes: input.notes ?? null,
        paymentMethod: input.paymentMethod ?? null
      });
      return { success: true, id: Number(insert[0]?.insertId) };
    }),
    updateStatus: protectedProcedure.input(z2.object({ id: z2.number(), status: appointmentStatus, paymentStatus: paymentStatus.optional(), paymentMethod: paymentMethod.optional() })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      const result = await db.select().from(appointments).where(and2(eq4(appointments.id, input.id), eq4(appointments.profileId, profile.id))).limit(1);
      if (!result[0]) throw new TRPCError3({ code: "NOT_FOUND" });
      await db.update(appointments).set({ status: input.status, paymentStatus: input.paymentStatus ?? result[0].paymentStatus, paymentMethod: input.paymentMethod ?? result[0].paymentMethod }).where(eq4(appointments.id, input.id));
      return { success: true };
    }),
    update: protectedProcedure.input(z2.object({ id: z2.number(), teamMemberId: z2.number().nullable().optional(), clientId: z2.number().optional(), serviceId: z2.number().optional(), startsAt: z2.string().datetime(), durationMinutes: z2.number().int().min(15).max(1440), location: z2.string().max(600).optional(), amountCents: z2.number().int().min(0), notes: z2.string().max(1200).optional() })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      if (input.clientId) await getOwnedClient(profile.id, input.clientId);
      if (input.serviceId) await getOwnedService(profile.id, input.serviceId);
      if (input.teamMemberId) await getOwnedTeamMember(profile.id, input.teamMemberId);
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      const existing = (await db.select().from(appointments).where(and2(eq4(appointments.id, input.id), eq4(appointments.profileId, profile.id))).limit(1))[0];
      if (!existing) throw new TRPCError3({ code: "NOT_FOUND", message: "Atendimento n\xE3o encontrado." });
      const start = new Date(input.startsAt);
      const availabilityRow = (await db.select().from(availability).where(eq4(availability.profileId, profile.id)).limit(1))[0];
      if (!isWithinAvailability(start, input.durationMinutes, availabilityRow)) throw new TRPCError3({ code: "CONFLICT", message: "Esse hor\xE1rio est\xE1 fora da sua disponibilidade." });
      const end = new Date(start.getTime() + input.durationMinutes * 6e4).getTime();
      const sameDay = await db.select().from(appointments).where(and2(eq4(appointments.profileId, profile.id), gte(appointments.startsAt, dayStart(start)), lt(appointments.startsAt, dayEnd(start)), ne(appointments.status, "cancelado"), ne(appointments.id, input.id)));
      const effectiveTeamMemberId = input.teamMemberId !== void 0 ? input.teamMemberId : existing.teamMemberId;
      if (sameDay.some((item) => {
        const t1 = effectiveTeamMemberId ?? 0;
        const t2 = item.teamMemberId ?? 0;
        if (t1 !== t2) return false;
        return new Date(item.startsAt).getTime() < end && start.getTime() < new Date(item.startsAt).getTime() + item.durationMinutes * 6e4;
      })) throw new TRPCError3({ code: "CONFLICT", message: "Esse hor\xE1rio j\xE1 est\xE1 ocupado para este profissional." });
      await db.update(appointments).set({ clientId: input.clientId ?? null, serviceId: input.serviceId ?? null, teamMemberId: input.teamMemberId !== void 0 ? input.teamMemberId : existing.teamMemberId, startsAt: start, durationMinutes: input.durationMinutes, location: input.location ?? null, amountCents: input.amountCents, notes: input.notes ?? null }).where(eq4(appointments.id, input.id));
      return { success: true };
    }),
    cancel: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(appointments).set({ status: "cancelado" }).where(and2(eq4(appointments.id, input.id), eq4(appointments.profileId, profile.id)));
      return { success: true };
    })
  }),
  request: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      const [rows, allQuotes] = await Promise.all([
        db.select().from(requests).where(eq4(requests.profileId, profile.id)).orderBy(desc2(requests.createdAt)),
        db.select().from(quotes).where(eq4(quotes.profileId, profile.id))
      ]);
      const quoteByRequestId = new Map(allQuotes.filter((q) => q.requestId).map((q) => [q.requestId, q]));
      return Promise.all(rows.map(async (request) => {
        const linkedQuote = quoteByRequestId.get(request.id);
        const attachments = await db.select().from(requestAttachments).where(eq4(requestAttachments.requestId, request.id));
        return {
          ...request,
          attachments,
          linkedQuote: linkedQuote ? { id: linkedQuote.id, status: linkedQuote.status, totalCents: linkedQuote.totalCents } : null,
          quoteStatus: linkedQuote?.status || null
        };
      }));
    }),
    createPublic: publicProcedure.input(z2.object({
      slug: z2.string(),
      requesterName: z2.string().min(1).max(160),
      requesterPhone: z2.string().min(6).max(40),
      requesterEmail: z2.string().max(320).optional().nullable(),
      serviceId: z2.number().optional().nullable(),
      description: z2.string().min(1).max(3e3),
      address: z2.string().max(600).optional().nullable(),
      desiredAt: z2.string().optional().nullable(),
      preferredTime: z2.string().max(80).optional().nullable(),
      attachments: z2.array(z2.object({
        name: z2.string().max(180),
        mimeType: z2.string().max(120).optional(),
        size: z2.number().int().positive().max(1e7).optional(),
        dataUrl: z2.string().max(1e7)
      })).max(5).optional()
    })).mutation(async ({ input }) => {
      const profile = await getProfileBySlug(input.slug);
      if (!profile) throw new TRPCError3({ code: "NOT_FOUND", message: "Profissional n\xE3o encontrado." });
      if (input.serviceId) {
        try {
          await getOwnedService(profile.id, input.serviceId);
        } catch {
          input.serviceId = null;
        }
      }
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Banco de dados indispon\xEDvel." });
      const cleanPhone = input.requesterPhone.trim();
      const cleanName = input.requesterName.trim();
      const cleanEmail = input.requesterEmail && input.requesterEmail.trim().includes("@") ? input.requesterEmail.trim() : null;
      const existingClient = await db.select().from(clients).where(and2(eq4(clients.profileId, profile.id), eq4(clients.phone, cleanPhone))).limit(1);
      let clientId = existingClient[0]?.id;
      if (!clientId) {
        try {
          const insert2 = await db.insert(clients).values({ profileId: profile.id, name: cleanName, phone: cleanPhone, email: cleanEmail });
          clientId = Number(insert2[0]?.insertId);
        } catch (e) {
          console.warn("[createPublic] Erro ao cadastrar cliente autom\xE1tico:", e);
        }
      }
      let parsedDesiredAt = null;
      if (input.desiredAt && input.desiredAt.trim()) {
        const d = new Date(input.desiredAt);
        if (!isNaN(d.getTime())) {
          parsedDesiredAt = d;
        }
      }
      const secureToken = nanoid(32);
      const insert = await db.insert(requests).values({
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
      });
      const requestId = Number(insert[0]?.insertId);
      for (const attachment of input.attachments ?? []) {
        try {
          const encoded = attachment.dataUrl.split(",")[1];
          if (!encoded) continue;
          const buffer = Buffer.from(encoded, "base64");
          if (buffer.length > 5e6) continue;
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
        await createNotification(profile.id, "Nova solicita\xE7\xE3o", `${cleanName} enviou um pedido de servi\xE7o.`, "request");
      } catch (notifErr) {
        console.warn("[createPublic] Erro ao criar notifica\xE7\xE3o:", notifErr);
      }
      return { success: true, id: requestId, token: secureToken };
    }),
    updateStatus: protectedProcedure.input(z2.object({ id: z2.number(), status: z2.enum(["nova", "em_analise", "orcamento_enviado", "agendada", "arquivada"]) })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(requests).set({ status: input.status }).where(and2(eq4(requests.id, input.id), eq4(requests.profileId, profile.id)));
      return { success: true };
    }),
    convertToClient: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      const request = (await db.select().from(requests).where(and2(eq4(requests.id, input.id), eq4(requests.profileId, profile.id))).limit(1))[0];
      if (!request) throw new TRPCError3({ code: "NOT_FOUND", message: "Solicita\xE7\xE3o n\xE3o encontrada." });
      if (request.clientId) return { success: true, clientId: request.clientId };
      const inserted = await db.insert(clients).values({ profileId: profile.id, name: request.requesterName, phone: request.requesterPhone, email: request.requesterEmail, address: request.address });
      const clientId = Number(inserted[0].insertId);
      await db.update(requests).set({ clientId }).where(eq4(requests.id, request.id));
      return { success: true, clientId };
    }),
    convertToAppointment: protectedProcedure.input(z2.object({
      id: z2.number(),
      startsAt: z2.string().optional(),
      serviceId: z2.number().optional().nullable(),
      teamMemberId: z2.number().optional().nullable(),
      durationMinutes: z2.number().int().positive().optional(),
      amountCents: z2.number().int().optional(),
      location: z2.string().optional().nullable(),
      notes: z2.string().optional().nullable()
    })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      const request = (await db.select().from(requests).where(and2(eq4(requests.id, input.id), eq4(requests.profileId, profile.id))).limit(1))[0];
      if (!request) throw new TRPCError3({ code: "NOT_FOUND", message: "Solicita\xE7\xE3o n\xE3o encontrada." });
      let effectiveClientId = request.clientId;
      if (!effectiveClientId) {
        const insertedClient = await db.insert(clients).values({
          profileId: profile.id,
          name: request.requesterName || "Cliente",
          phone: request.requesterPhone,
          email: request.requesterEmail,
          address: request.address
        });
        effectiveClientId = Number(insertedClient[0].insertId);
        await db.update(requests).set({ clientId: effectiveClientId }).where(eq4(requests.id, request.id));
      }
      const effectiveServiceId = input.serviceId ?? request.serviceId ?? void 0;
      const service = effectiveServiceId ? await getOwnedService(profile.id, effectiveServiceId) : void 0;
      let start;
      if (input.startsAt && !isNaN(new Date(input.startsAt).getTime())) {
        start = new Date(input.startsAt);
      } else if (request.desiredAt && !isNaN(new Date(request.desiredAt).getTime())) {
        start = new Date(request.desiredAt);
      } else {
        start = new Date(Date.now() + 24 * 3600 * 1e3);
      }
      const durationMinutes = input.durationMinutes ?? service?.durationMinutes ?? 60;
      const amountCents = input.amountCents ?? service?.priceCents ?? 0;
      const location = input.location ?? request.address ?? "";
      const notes = input.notes ?? request.description ?? "";
      const inserted = await db.insert(appointments).values({
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
        paymentStatus: "pendente"
      });
      await db.update(requests).set({ status: "agendada" }).where(eq4(requests.id, request.id));
      return { success: true, appointmentId: Number(inserted[0].insertId) };
    }),
    convertToQuote: protectedProcedure.input(z2.object({ id: z2.number(), discountCents: z2.number().int().min(0).default(0), sendNow: z2.boolean().default(true) })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      const request = (await db.select().from(requests).where(and2(eq4(requests.id, input.id), eq4(requests.profileId, profile.id))).limit(1))[0];
      if (!request) throw new TRPCError3({ code: "NOT_FOUND", message: "Solicita\xE7\xE3o n\xE3o encontrada." });
      const service = request.serviceId ? await getOwnedService(profile.id, request.serviceId) : void 0;
      const item = { description: service?.name || "Servi\xE7o solicitado", quantity: 1, unitPriceCents: service?.priceCents || 0 };
      const secureToken = nanoid(32);
      const insert = await db.insert(quotes).values({
        profileId: profile.id,
        clientId: request.clientId ?? null,
        requestId: request.id,
        serviceId: request.serviceId ?? null,
        description: request.description,
        subtotalCents: item.unitPriceCents,
        discountCents: input.discountCents,
        totalCents: Math.max(0, item.unitPriceCents - input.discountCents),
        notes: request.address ? `Endere\xE7o: ${request.address}` : null,
        clientName: request.requesterName || null,
        clientEmail: request.requesterEmail || null,
        validUntil: null,
        secureToken,
        status: input.sendNow ? "enviado" : "rascunho"
      });
      await db.insert(quoteItems).values({ quoteId: Number(insert[0].insertId), ...item, totalCents: item.unitPriceCents });
      await db.update(requests).set({ status: input.sendNow ? "orcamento_enviado" : "em_analise" }).where(eq4(requests.id, request.id));
      return { success: true, quoteId: Number(insert[0].insertId), token: secureToken };
    })
  }),
  quote: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      const [rows, profileAppointments, profileRequests] = await Promise.all([
        db.select().from(quotes).where(eq4(quotes.profileId, profile.id)).orderBy(desc2(quotes.createdAt)),
        db.select({ id: appointments.id, notes: appointments.notes, clientId: appointments.clientId, amountCents: appointments.amountCents, status: appointments.status }).from(appointments).where(eq4(appointments.profileId, profile.id)),
        db.select({ id: requests.id, status: requests.status }).from(requests).where(eq4(requests.profileId, profile.id))
      ]);
      return Promise.all(
        rows.map(async (q) => {
          let clientName = q.clientName;
          let clientEmail = q.clientEmail;
          let clientPhone = null;
          if (q.clientId) {
            const c = (await db.select().from(clients).where(eq4(clients.id, q.clientId)).limit(1))[0];
            if (c) {
              clientName = clientName || c.name;
              clientEmail = clientEmail || c.email;
              clientPhone = c.phone || null;
            }
          }
          if (q.requestId) {
            const r = (await db.select().from(requests).where(eq4(requests.id, q.requestId)).limit(1))[0];
            if (r) {
              clientName = clientName || r.requesterName;
              clientEmail = clientEmail || r.requesterEmail;
              clientPhone = clientPhone || r.requesterPhone;
            }
          }
          const matchedRequest = q.requestId ? profileRequests.find((r) => r.id === q.requestId) : null;
          const isScheduled = profileAppointments.some(
            (a) => a.notes?.includes(`[Or\xE7amento #${q.id}]`) || q.clientId && a.clientId === q.clientId && (a.amountCents === q.totalCents || q.description && a.notes?.includes(q.description.slice(0, 25))) || matchedRequest?.status === "agendada"
          );
          return {
            ...q,
            receiptCode: generateReceiptAuthCode("Q", q.id, q.profileId, q.totalCents),
            clientName: clientName || null,
            clientEmail: clientEmail || null,
            clientPhone: clientPhone || null,
            isScheduled: Boolean(isScheduled),
            items: await db.select().from(quoteItems).where(eq4(quoteItems.quoteId, q.id))
          };
        })
      );
    }),
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      const existing = (await db.select().from(quotes).where(and2(eq4(quotes.id, input.id), eq4(quotes.profileId, profile.id))).limit(1))[0];
      if (!existing) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Or\xE7amento n\xE3o encontrado." });
      }
      await db.delete(quoteItems).where(eq4(quoteItems.quoteId, input.id));
      await db.delete(quotes).where(and2(eq4(quotes.id, input.id), eq4(quotes.profileId, profile.id)));
      if (existing.requestId) {
        try {
          await db.update(requests).set({ status: "em_analise" }).where(and2(eq4(requests.id, existing.requestId), eq4(requests.profileId, profile.id)));
        } catch (e) {
        }
      }
      return { success: true };
    }),
    create: protectedProcedure.input(z2.object({ clientId: z2.number().optional(), requestId: z2.number().optional(), serviceId: z2.number().optional(), description: z2.string().max(1800).optional(), discountCents: z2.number().int().min(0).default(0), notes: z2.string().max(1800).optional(), paymentTerms: z2.string().max(1e3).optional(), validUntil: z2.string().datetime().optional(), sendNow: z2.boolean().default(false), items: z2.array(z2.object({ description: z2.string().min(1).max(180), quantity: z2.number().min(0.01).max(1e3), unitPriceCents: z2.number().int().min(0) })).min(1) })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      if (input.clientId) await getOwnedClient(profile.id, input.clientId);
      if (input.serviceId) await getOwnedService(profile.id, input.serviceId);
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      const subtotalCents = input.items.reduce((sum, item) => sum + Math.round(item.quantity * item.unitPriceCents), 0);
      const totalCents = Math.max(0, subtotalCents - input.discountCents);
      const secureToken = nanoid(32);
      const insert = await db.insert(quotes).values({ profileId: profile.id, clientId: input.clientId ?? null, requestId: input.requestId ?? null, serviceId: input.serviceId ?? null, description: input.description ?? null, subtotalCents, discountCents: input.discountCents, totalCents, notes: input.notes ?? null, paymentTerms: input.paymentTerms ?? null, changeRequest: null, validUntil: input.validUntil ? new Date(input.validUntil) : null, secureToken, status: input.sendNow ? "enviado" : "rascunho" });
      const quoteId = Number(insert[0].insertId);
      await db.insert(quoteItems).values(input.items.map((item) => ({ quoteId, description: item.description, quantity: item.quantity, unitPriceCents: item.unitPriceCents, totalCents: Math.round(item.quantity * item.unitPriceCents) })));
      if (input.requestId) await db.update(requests).set({ status: input.sendNow ? "orcamento_enviado" : "em_analise" }).where(and2(eq4(requests.id, input.requestId), eq4(requests.profileId, profile.id)));
      if (input.sendNow) await createNotification(profile.id, "Or\xE7amento enviado", "Seu or\xE7amento est\xE1 dispon\xEDvel por um link p\xFAblico.", "quote");
      return { success: true, quoteId, token: input.sendNow ? secureToken : null };
    }),
    update: protectedProcedure.input(z2.object({ id: z2.number(), description: z2.string().max(1800).optional(), discountCents: z2.number().int().min(0).default(0), notes: z2.string().max(1800).optional(), paymentTerms: z2.string().max(1e3).optional(), validUntil: z2.string().datetime().optional(), sendNow: z2.boolean().default(true), items: z2.array(z2.object({ description: z2.string().min(1).max(180), quantity: z2.number().min(0.01).max(1e3), unitPriceCents: z2.number().int().min(0) })).min(1) })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      const existing = (await db.select().from(quotes).where(and2(eq4(quotes.id, input.id), eq4(quotes.profileId, profile.id))).limit(1))[0];
      if (!existing) throw new TRPCError3({ code: "NOT_FOUND", message: "Or\xE7amento n\xE3o encontrado." });
      const subtotalCents = input.items.reduce((sum, item) => sum + Math.round(item.quantity * item.unitPriceCents), 0);
      const totalCents = Math.max(0, subtotalCents - input.discountCents);
      await db.delete(quoteItems).where(eq4(quoteItems.quoteId, input.id));
      await db.insert(quoteItems).values(input.items.map((item) => ({ quoteId: input.id, description: item.description, quantity: item.quantity, unitPriceCents: item.unitPriceCents, totalCents: Math.round(item.quantity * item.unitPriceCents) })));
      await db.update(quotes).set({ description: input.description ?? existing.description, subtotalCents, discountCents: input.discountCents, totalCents, notes: input.notes ?? existing.notes, paymentTerms: input.paymentTerms ?? existing.paymentTerms, changeRequest: null, validUntil: input.validUntil ? new Date(input.validUntil) : existing.validUntil, status: input.sendNow ? "enviado" : "rascunho", respondedAt: null }).where(eq4(quotes.id, input.id));
      if (input.sendNow) await createNotification(profile.id, "Or\xE7amento revisado e reenviado", "A proposta atualizada est\xE1 dispon\xEDvel no link do cliente.", "quote");
      return { success: true, token: input.sendNow ? existing.secureToken : null };
    }),
    publish: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      const existing = (await db.select().from(quotes).where(and2(eq4(quotes.id, input.id), eq4(quotes.profileId, profile.id))).limit(1))[0];
      if (!existing) throw new TRPCError3({ code: "NOT_FOUND", message: "Or\xE7amento n\xE3o encontrado." });
      await db.update(quotes).set({ status: "enviado" }).where(eq4(quotes.id, input.id));
      if (existing.requestId) {
        await db.update(requests).set({ status: "orcamento_enviado" }).where(and2(eq4(requests.id, existing.requestId), eq4(requests.profileId, profile.id)));
      }
      await createNotification(profile.id, "Or\xE7amento publicado", "O or\xE7amento foi publicado e o link do cliente foi ativado.", "quote");
      return { success: true, token: existing.secureToken };
    }),
    getPublic: publicProcedure.input(z2.object({ token: z2.string().min(10) })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      const quote = (await db.select().from(quotes).where(eq4(quotes.secureToken, input.token)).limit(1))[0];
      if (!quote || quote.status === "rascunho") throw new TRPCError3({ code: "NOT_FOUND", message: "Este or\xE7amento est\xE1 em rascunho e ainda n\xE3o foi liberado para visualiza\xE7\xE3o p\xFAblica." });
      const profile = (await db.select().from(professionalProfiles).where(eq4(professionalProfiles.id, quote.profileId)).limit(1))[0];
      const items = await db.select().from(quoteItems).where(eq4(quoteItems.quoteId, quote.id));
      return { quote, profile, items };
    }),
    respondPublic: publicProcedure.input(z2.object({ token: z2.string().min(10), action: z2.enum(["aceito", "recusado", "alteracao_solicitada"]), clientName: z2.string().optional(), clientEmail: z2.string().email().optional().or(z2.literal("")), changeRequestText: z2.string().max(1200).optional() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      const quote = (await db.select().from(quotes).where(eq4(quotes.secureToken, input.token)).limit(1))[0];
      if (!quote || quote.status === "rascunho") throw new TRPCError3({ code: "FORBIDDEN", message: "Este or\xE7amento est\xE1 em rascunho e n\xE3o pode receber respostas p\xFAblicas." });
      const updateData = { status: input.action, respondedAt: /* @__PURE__ */ new Date() };
      if (input.action === "alteracao_solicitada" && input.changeRequestText) {
        updateData.changeRequest = input.changeRequestText;
        await createNotification(quote.profileId, "Altera\xE7\xE3o solicitada no Or\xE7amento", `O cliente pediu ajuste: "${input.changeRequestText}". Acesse para revisar e reenviar a proposta.`, "quote_change_requested");
      } else if (input.action === "aceito") {
        if (input.clientName) updateData.clientName = input.clientName;
        if (input.clientEmail) updateData.clientEmail = input.clientEmail;
        if (!quote.clientId && input.clientName) {
          try {
            const inserted = await db.insert(clients).values({
              profileId: quote.profileId,
              name: input.clientName,
              email: input.clientEmail || null
            });
            if (inserted?.[0]?.insertId) {
              updateData.clientId = inserted[0].insertId;
            }
          } catch (e) {
            console.error("Erro ao registrar cliente no aceite do or\xE7amento:", e);
          }
        }
        await createNotification(
          quote.profileId,
          "\u{1F389} Or\xE7amento APROVADO!",
          `${input.clientName || "O cliente"} aceitou o or\xE7amento de R$ ${(quote.totalCents / 100).toFixed(2).replace(".", ",")}. Comprovante registrado para ${input.clientEmail || "o cliente"}.`,
          "quote_accepted"
        );
        if (input.clientEmail) {
          try {
            const profile = (await db.select().from(professionalProfiles).where(eq4(professionalProfiles.id, quote.profileId)).limit(1))[0];
            const items = await db.select().from(quoteItems).where(eq4(quoteItems.quoteId, quote.id));
            const publicUrl = process.env.APP_URL || process.env.PUBLIC_URL || "https://meuautonomo.creativeam.com.br";
            const linkProposta = `${publicUrl}/orcamento/${quote.secureToken}`;
            const emailData = modeloOrcamentoAprovado({
              clienteNome: input.clientName || "Cliente",
              clienteEmail: input.clientEmail,
              profissionalNome: profile?.displayName || "Profissional",
              profissionalProfissao: profile?.professionName || void 0,
              profissionalWhatsapp: profile?.whatsapp || void 0,
              orcamentoId: quote.id,
              totalCents: quote.totalCents,
              paymentTerms: quote.paymentTerms || void 0,
              notes: quote.notes || void 0,
              items: items.map((it) => ({
                description: it.description,
                quantity: it.quantity,
                unitPriceCents: it.unitPriceCents,
                totalCents: it.totalCents
              })),
              linkProposta
            });
            await enviarEmail({
              para: input.clientEmail,
              assunto: emailData.assunto,
              texto: emailData.texto,
              html: emailData.html
            });
          } catch (emailErr) {
            console.error("[Email] Erro ao enviar e-mail de confirma\xE7\xE3o:", emailErr);
          }
        }
      } else {
        await createNotification(quote.profileId, "Or\xE7amento recusado", "O cliente recusou a proposta.", "quote_response");
      }
      if (quote.requestId) {
        try {
          if (input.action === "aceito") {
            await db.update(requests).set({ status: "proposta_aceita" }).where(eq4(requests.id, quote.requestId));
          } else if (input.action === "alteracao_solicitada") {
            await db.update(requests).set({ status: "em_analise" }).where(eq4(requests.id, quote.requestId));
          }
        } catch (reqUpdateErr) {
          console.warn("[respondPublic] Erro ao sincronizar status da solicita\xE7\xE3o:", reqUpdateErr);
        }
      }
      await db.update(quotes).set(updateData).where(eq4(quotes.id, quote.id));
      return { success: true };
    }),
    convertToAppointment: protectedProcedure.input(z2.object({
      id: z2.number(),
      startsAt: z2.string().datetime(),
      durationMinutes: z2.number().int().min(15).max(1440).default(60),
      location: z2.string().max(600).optional(),
      notes: z2.string().max(1200).optional()
    })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      const quote = (await db.select().from(quotes).where(and2(eq4(quotes.id, input.id), eq4(quotes.profileId, profile.id))).limit(1))[0];
      if (!quote) throw new TRPCError3({ code: "NOT_FOUND", message: "Or\xE7amento n\xE3o encontrado." });
      let effectiveClientId = quote.clientId;
      if (!effectiveClientId && quote.clientName) {
        const existing = (await db.select().from(clients).where(and2(eq4(clients.profileId, profile.id), eq4(clients.name, quote.clientName))).limit(1))[0];
        if (existing) {
          effectiveClientId = existing.id;
        } else {
          const ins = await db.insert(clients).values({
            profileId: profile.id,
            name: quote.clientName,
            email: quote.clientEmail || null,
            phone: null
          });
          effectiveClientId = Number(ins[0].insertId);
          await db.update(quotes).set({ clientId: effectiveClientId }).where(eq4(quotes.id, quote.id));
        }
      }
      const notePrefix = `[Or\xE7amento #${quote.id}]`;
      const rawNotes = input.notes || quote.description || "";
      const finalNotes = rawNotes.includes(notePrefix) ? rawNotes : `${notePrefix} ${rawNotes}`.trim();
      const existingAppointment = (await db.select().from(appointments).where(and2(eq4(appointments.profileId, profile.id), like(appointments.notes, `%${notePrefix}%`))).limit(1))[0];
      if (existingAppointment) {
        await db.update(appointments).set({
          startsAt: new Date(input.startsAt),
          durationMinutes: input.durationMinutes,
          location: input.location || existingAppointment.location,
          notes: finalNotes,
          amountCents: quote.totalCents
        }).where(eq4(appointments.id, existingAppointment.id));
        return { success: true, appointmentId: existingAppointment.id, updated: true };
      }
      const inserted = await db.insert(appointments).values({
        profileId: profile.id,
        clientId: effectiveClientId ?? null,
        serviceId: quote.serviceId ?? null,
        startsAt: new Date(input.startsAt),
        durationMinutes: input.durationMinutes,
        location: input.location || "",
        amountCents: quote.totalCents,
        notes: finalNotes,
        status: "confirmado",
        paymentStatus: "pendente"
      });
      if (quote.requestId) {
        await db.update(requests).set({ status: "agendada" }).where(eq4(requests.id, quote.requestId));
      }
      await createNotification(
        profile.id,
        "Atendimento agendado",
        `O or\xE7amento #${quote.id} foi inclu\xEDdo na sua agenda para ${new Date(input.startsAt).toLocaleDateString("pt-BR")}.`,
        "appointment"
      );
      return { success: true, appointmentId: Number(inserted[0].insertId) };
    })
  }),
  payment: router({
    list: protectedProcedure.input(z2.object({ from: z2.string().datetime().optional(), to: z2.string().datetime().optional() }).optional()).query(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      const payConditions = [eq4(payments.profileId, profile.id)];
      if (input?.from) payConditions.push(gte(payments.createdAt, new Date(input.from)));
      if (input?.to) payConditions.push(lte(payments.createdAt, new Date(input.to)));
      const appConditions = [eq4(appointments.profileId, profile.id), ne(appointments.status, "cancelado")];
      if (input?.from) appConditions.push(gte(appointments.startsAt, new Date(input.from)));
      if (input?.to) appConditions.push(lte(appointments.startsAt, new Date(input.to)));
      const [rawPayments, periodAppointments, profileClients, profileServices] = await Promise.all([
        db.select().from(payments).where(and2(...payConditions)).orderBy(desc2(payments.createdAt)),
        db.select().from(appointments).where(and2(...appConditions)).orderBy(desc2(appointments.startsAt)),
        db.select({ id: clients.id, name: clients.name }).from(clients).where(eq4(clients.profileId, profile.id)),
        db.select({ id: services.id, name: services.name }).from(services).where(eq4(services.profileId, profile.id))
      ]);
      const clientMap = new Map(profileClients.map((c) => [c.id, c.name]));
      const serviceMap = new Map(profileServices.map((s) => [s.id, s.name]));
      const explicitlyLinkedAppIds = new Set(rawPayments.map((p) => p.appointmentId).filter(Boolean));
      const rows = rawPayments.map((r) => ({
        ...r,
        clientName: r.clientId ? clientMap.get(r.clientId) || null : null,
        serviceName: r.serviceId ? serviceMap.get(r.serviceId) || null : null
      }));
      for (const app2 of periodAppointments) {
        if (!isBillableAppointment(app2.status)) continue;
        if (explicitlyLinkedAppIds.has(app2.id)) continue;
        const hasUnlinkedMatch = rawPayments.some((p) => !p.appointmentId && p.clientId === app2.clientId && p.amountCents === app2.amountCents);
        if (hasUnlinkedMatch) continue;
        rows.push({
          id: -app2.id,
          profileId: app2.profileId,
          teamMemberId: app2.teamMemberId,
          appointmentId: app2.id,
          clientId: app2.clientId,
          serviceId: app2.serviceId,
          amountCents: app2.amountCents,
          commissionPercent: null,
          commissionAmountCents: 0,
          studioAmountCents: app2.amountCents,
          commissionPaid: false,
          method: app2.paymentMethod || "pix",
          status: app2.paymentStatus === "pago" || app2.status === "concluido" ? "pago" : "pendente",
          note: app2.notes || null,
          paidAt: app2.paymentStatus === "pago" ? app2.startsAt : null,
          createdAt: app2.startsAt,
          clientName: app2.clientId ? clientMap.get(app2.clientId) || null : null,
          serviceName: app2.serviceId ? serviceMap.get(app2.serviceId) || null : null
        });
      }
      rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return rows;
    }),
    create: protectedProcedure.input(z2.object({
      appointmentId: z2.number().optional(),
      clientId: z2.number().optional(),
      serviceId: z2.number().optional(),
      teamMemberId: z2.number().optional(),
      amountCents: z2.number().int().positive(),
      method: paymentMethod,
      status: paymentStatus,
      note: z2.string().max(600).optional(),
      paidAt: z2.string().datetime().optional()
    })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      const twoSecondsAgo = new Date(Date.now() - 2500);
      const recentDup = await db.select({ id: payments.id }).from(payments).where(and2(
        eq4(payments.profileId, profile.id),
        eq4(payments.amountCents, input.amountCents),
        eq4(payments.method, input.method),
        eq4(payments.status, input.status),
        gte(payments.createdAt, twoSecondsAgo)
      )).limit(1);
      if (recentDup.length > 0) {
        return { success: true };
      }
      if (input.clientId) await getOwnedClient(profile.id, input.clientId);
      if (input.serviceId) await getOwnedService(profile.id, input.serviceId);
      let resolvedAppointmentId = input.appointmentId ?? null;
      let resolvedClientId = input.clientId ?? null;
      let resolvedServiceId = input.serviceId ?? null;
      let resolvedTeamMemberId = input.teamMemberId ?? null;
      if (resolvedAppointmentId) {
        const appRow = (await db.select().from(appointments).where(and2(eq4(appointments.id, resolvedAppointmentId), eq4(appointments.profileId, profile.id))).limit(1))[0];
        if (appRow) {
          if (!resolvedClientId && appRow.clientId) resolvedClientId = appRow.clientId;
          if (!resolvedServiceId && appRow.serviceId) resolvedServiceId = appRow.serviceId;
          if (!resolvedTeamMemberId && appRow.teamMemberId) resolvedTeamMemberId = appRow.teamMemberId;
        }
      } else if (resolvedClientId) {
        const candidateApps = await db.select().from(appointments).where(and2(
          eq4(appointments.profileId, profile.id),
          eq4(appointments.clientId, resolvedClientId),
          ne(appointments.status, "cancelado")
        )).orderBy(desc2(appointments.startsAt));
        const matched = candidateApps.find((a) => (resolvedServiceId ? a.serviceId === resolvedServiceId : true) && a.amountCents === input.amountCents && a.paymentStatus !== "pago") || candidateApps.find((a) => (resolvedServiceId ? a.serviceId === resolvedServiceId : true) && a.paymentStatus !== "pago") || candidateApps.find((a) => a.paymentStatus !== "pago");
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
        paidAt: input.paidAt ? new Date(input.paidAt) : input.status === "pago" ? /* @__PURE__ */ new Date() : null
      });
      if (resolvedAppointmentId) {
        await db.update(appointments).set({
          paymentStatus: input.status,
          paymentMethod: input.method,
          teamMemberId: resolvedTeamMemberId ?? void 0
        }).where(and2(eq4(appointments.id, resolvedAppointmentId), eq4(appointments.profileId, profile.id)));
      }
      return { success: true };
    })
  }),
  team: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      return db.select().from(teamMembers).where(eq4(teamMembers.profileId, profile.id)).orderBy(desc2(teamMembers.createdAt));
    }),
    create: protectedProcedure.input(z2.object({
      name: z2.string().min(2, "Nome deve ter ao menos 2 caracteres").max(160),
      role: z2.string().min(2, "Fun\xE7\xE3o/especialidade \xE9 obrigat\xF3ria").max(120),
      phone: z2.string().max(40).optional(),
      email: z2.string().email("E-mail inv\xE1lido").max(320).optional().or(z2.literal("")),
      pixKey: z2.string().max(140).optional(),
      pixKeyType: z2.string().max(30).optional(),
      commissionPercent: z2.number().int().min(0).max(100).default(50),
      color: z2.string().max(30).optional(),
      notes: z2.string().max(600).optional()
    })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      const insert = await db.insert(teamMembers).values({
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
        active: true
      });
      return { success: true, id: Number(insert[0]?.insertId) };
    }),
    update: protectedProcedure.input(z2.object({
      id: z2.number(),
      name: z2.string().min(2).max(160),
      role: z2.string().min(2).max(120),
      phone: z2.string().max(40).optional(),
      email: z2.string().email().max(320).optional().or(z2.literal("")),
      pixKey: z2.string().max(140).optional(),
      pixKeyType: z2.string().max(30).optional(),
      commissionPercent: z2.number().int().min(0).max(100),
      color: z2.string().max(30).optional(),
      notes: z2.string().max(600).optional(),
      active: z2.boolean().optional()
    })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      await getOwnedTeamMember(profile.id, input.id);
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
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
        active: input.active !== void 0 ? input.active : true
      }).where(and2(eq4(teamMembers.id, input.id), eq4(teamMembers.profileId, profile.id)));
      return { success: true };
    }),
    toggleActive: protectedProcedure.input(z2.object({ id: z2.number(), active: z2.boolean() })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      await getOwnedTeamMember(profile.id, input.id);
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(teamMembers).set({ active: input.active }).where(and2(eq4(teamMembers.id, input.id), eq4(teamMembers.profileId, profile.id)));
      return { success: true };
    }),
    remove: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      await getOwnedTeamMember(profile.id, input.id);
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      await db.delete(teamMembers).where(and2(eq4(teamMembers.id, input.id), eq4(teamMembers.profileId, profile.id)));
      return { success: true };
    }),
    uploadAvatar: protectedProcedure.input(z2.object({
      fileName: z2.string().max(180),
      mimeType: z2.enum(["image/jpeg", "image/png", "image/webp"]),
      dataUrl: z2.string().max(7e6)
    })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const encoded = input.dataUrl.split(",")[1];
      if (!encoded) throw new TRPCError3({ code: "BAD_REQUEST", message: "Arquivo inv\xE1lido." });
      const buffer = Buffer.from(encoded, "base64");
      if (buffer.length > 5e6) throw new TRPCError3({ code: "BAD_REQUEST", message: "A foto deve ter no m\xE1ximo 5 MB." });
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
    report: protectedProcedure.input(z2.object({
      from: z2.string().datetime().optional(),
      to: z2.string().datetime().optional(),
      teamMemberId: z2.number().optional()
    }).optional()).query(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      const members = await db.select().from(teamMembers).where(eq4(teamMembers.profileId, profile.id));
      const payConditions = [eq4(payments.profileId, profile.id)];
      if (input?.from) payConditions.push(gte(payments.createdAt, new Date(input.from)));
      if (input?.to) payConditions.push(lt(payments.createdAt, new Date(input.to)));
      if (input?.teamMemberId) payConditions.push(eq4(payments.teamMemberId, input.teamMemberId));
      const periodPayments = await db.select().from(payments).where(and2(...payConditions)).orderBy(desc2(payments.createdAt));
      const appConditions = [eq4(appointments.profileId, profile.id), ne(appointments.status, "cancelado")];
      if (input?.from) appConditions.push(gte(appointments.startsAt, new Date(input.from)));
      if (input?.to) appConditions.push(lt(appointments.startsAt, new Date(input.to)));
      if (input?.teamMemberId) appConditions.push(eq4(appointments.teamMemberId, input.teamMemberId));
      const periodAppointments = await db.select().from(appointments).where(and2(...appConditions));
      const expConditions = [eq4(expenses.profileId, profile.id)];
      if (input?.from) expConditions.push(gte(expenses.occurredAt, new Date(input.from)));
      if (input?.to) expConditions.push(lt(expenses.occurredAt, new Date(input.to)));
      const periodExpenses = await db.select().from(expenses).where(and2(...expConditions));
      const targetMembers = input?.teamMemberId ? members.filter((m) => m.id === input.teamMemberId) : members;
      return calculateTeamReport(
        targetMembers,
        periodAppointments,
        periodPayments,
        periodExpenses
      );
    })
  }),
  expense: router({
    list: protectedProcedure.input(z2.object({ from: z2.string().datetime().optional(), to: z2.string().datetime().optional() }).optional()).query(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      const conditions = [eq4(expenses.profileId, profile.id)];
      if (input?.from) conditions.push(gte(expenses.occurredAt, new Date(input.from)));
      if (input?.to) conditions.push(lte(expenses.occurredAt, new Date(input.to)));
      return db.select().from(expenses).where(and2(...conditions)).orderBy(desc2(expenses.occurredAt));
    }),
    create: protectedProcedure.input(z2.object({ description: z2.string().min(2).max(180), category: z2.string().max(100).optional(), amountCents: z2.number().int().positive(), occurredAt: z2.string().datetime().optional(), note: z2.string().max(600).optional() })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      const twoSecondsAgo = new Date(Date.now() - 2500);
      const recentDup = await db.select({ id: expenses.id }).from(expenses).where(and2(
        eq4(expenses.profileId, profile.id),
        eq4(expenses.description, input.description),
        eq4(expenses.amountCents, input.amountCents),
        gte(expenses.createdAt, twoSecondsAgo)
      )).limit(1);
      if (recentDup.length > 0) {
        return { success: true };
      }
      await db.insert(expenses).values({ profileId: profile.id, description: input.description, category: input.category ?? null, amountCents: input.amountCents, occurredAt: input.occurredAt ? new Date(input.occurredAt) : /* @__PURE__ */ new Date(), note: input.note ?? null });
      return { success: true };
    }),
    remove: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      await db.delete(expenses).where(and2(eq4(expenses.id, input.id), eq4(expenses.profileId, profile.id)));
      return { success: true };
    })
  }),
  notification: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      return db.select().from(notifications).where(eq4(notifications.profileId, profile.id)).orderBy(desc2(notifications.createdAt)).limit(30);
    }),
    markRead: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(notifications).set({ read: true }).where(and2(eq4(notifications.id, input.id), eq4(notifications.profileId, profile.id)));
      return { success: true };
    }),
    markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(notifications).set({ read: true }).where(and2(eq4(notifications.profileId, profile.id), eq4(notifications.read, false)));
      return { success: true };
    }),
    unreadCount: protectedProcedure.query(async ({ ctx }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      const rows = await db.select({ id: notifications.id }).from(notifications).where(and2(eq4(notifications.profileId, profile.id), eq4(notifications.read, false)));
      return rows.length;
    })
  }),
  reports: router({
    summary: protectedProcedure.input(z2.object({ from: z2.string().datetime().optional(), to: z2.string().datetime().optional() }).optional()).query(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      const appConditions = [eq4(appointments.profileId, profile.id), ne(appointments.status, "cancelado")];
      const payConditions = [eq4(payments.profileId, profile.id)];
      const clientConditions = [eq4(clients.profileId, profile.id)];
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
        db.select().from(appointments).where(and2(...appConditions)),
        db.select().from(payments).where(and2(...payConditions)),
        db.select().from(clients).where(and2(...clientConditions)),
        db.select().from(services).where(eq4(services.profileId, profile.id))
      ]);
      const metrics = calculateDeduplicatedMetrics(periodAppointments, periodPayments);
      const counts = /* @__PURE__ */ new Map();
      for (const item of periodAppointments) if (item.serviceId) counts.set(item.serviceId, (counts.get(item.serviceId) || 0) + 1);
      const topServices = Array.from(counts.entries()).map(([serviceId, count]) => ({ serviceId, count, name: profileServices.find((service) => service.id === serviceId)?.name || "Servi\xE7o" })).sort((a, b) => b.count - a.count).slice(0, 5);
      const allClientAppointments = await db.select({ clientId: appointments.clientId }).from(appointments).where(and2(eq4(appointments.profileId, profile.id), ne(appointments.status, "cancelado")));
      const clientVisitCounts = /* @__PURE__ */ new Map();
      for (const item of allClientAppointments) if (item.clientId) clientVisitCounts.set(item.clientId, (clientVisitCounts.get(item.clientId) || 0) + 1);
      const recurringClientIds = Array.from(clientVisitCounts.values()).filter((count) => count > 1).length;
      return { from: input?.from ? new Date(input.from) : null, to: input?.to ? new Date(input.to) : null, revenueCents: metrics.faturamentoCents, receivedCents: metrics.recebidoCents, pendingCents: metrics.pendenteCents, appointmentCount: metrics.appointmentCount, newClients: periodClients.length, recurringClients: recurringClientIds, topServices };
    })
  }),
  dashboard: router({
    summary: protectedProcedure.input(z2.object({ from: z2.string().datetime().optional(), to: z2.string().datetime().optional() }).optional()).query(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      const today = await db.select().from(appointments).where(and2(eq4(appointments.profileId, profile.id), gte(appointments.startsAt, dayStart()), lt(appointments.startsAt, dayEnd()))).orderBy(appointments.startsAt);
      const recentRequests = await db.select().from(requests).where(and2(eq4(requests.profileId, profile.id), ne(requests.status, "arquivada"))).orderBy(desc2(requests.createdAt)).limit(4);
      const pendingQuotes = await db.select().from(quotes).where(and2(eq4(quotes.profileId, profile.id), eq4(quotes.status, "enviado"))).orderBy(desc2(quotes.createdAt)).limit(4);
      const appConditions = [eq4(appointments.profileId, profile.id), ne(appointments.status, "cancelado")];
      const payConditions = [eq4(payments.profileId, profile.id)];
      const expConditions = [eq4(expenses.profileId, profile.id)];
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
      const monthAppointments = await db.select().from(appointments).where(and2(...appConditions));
      const monthPayments = await db.select().from(payments).where(and2(...payConditions));
      const monthExpenses = await db.select().from(expenses).where(and2(...expConditions));
      const metrics = calculateDeduplicatedMetrics(monthAppointments, monthPayments, monthExpenses);
      const projected = today.reduce((sum, item) => sum + (isBillableAppointment(item.status) ? item.amountCents : 0), 0);
      const seriesMap = /* @__PURE__ */ new Map();
      const ensureDay = (date) => {
        const key = date.toISOString().slice(0, 10);
        if (!seriesMap.has(key)) seriesMap.set(key, { date: key, receitas: 0, pendentes: 0, despesas: 0 });
        return seriesMap.get(key);
      };
      const linkedAppIds = new Set(monthPayments.map((p) => p.appointmentId).filter(Boolean));
      for (const payment of monthPayments) {
        const day = ensureDay(new Date(payment.createdAt));
        if (payment.status === "pago") day.receitas += payment.amountCents;
        else day.pendentes += payment.amountCents;
      }
      for (const app2 of monthAppointments) {
        if (!linkedAppIds.has(app2.id) && isBillableAppointment(app2.status) && app2.amountCents > 0) {
          const day = ensureDay(new Date(app2.startsAt));
          if (app2.paymentStatus === "pago" || app2.status === "concluido") day.receitas += app2.amountCents;
          else day.pendentes += app2.amountCents;
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
          todayCount: today.filter((a) => isCountableAppointment(a.status)).length,
          todayProjectedCents: projected,
          receivedCents: metrics.recebidoCents,
          pendingCents: metrics.pendenteCents,
          monthRevenueCents: metrics.faturamentoCents,
          expensesCents: metrics.despesasCents,
          balanceCents: metrics.saldoCents
        }
      };
    })
  }),
  publicProfile: router({
    bySlug: publicProcedure.input(z2.object({ slug: z2.string() })).query(async ({ input }) => {
      const profile = await getProfileBySlug(input.slug);
      if (!profile) throw new TRPCError3({ code: "NOT_FOUND", message: "Profissional n\xE3o encontrado." });
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      const profileServices = await db.select().from(services).where(and2(eq4(services.profileId, profile.id), eq4(services.active, true))).orderBy(services.name);
      return { profile, services: profileServices };
    })
  }),
  database: router({
    reset: protectedProcedure.mutation(async () => {
      const { resetMockDb: resetMockDb2 } = await Promise.resolve().then(() => (init_mockDb(), mockDb_exports));
      resetMockDb2();
      return { success: true };
    })
  }),
  admin: router({
    login: publicProcedure.input(z2.object({ email: z2.string().min(1), password: z2.string().min(1) })).mutation(async ({ ctx, input }) => {
      const inputLogin = input.email.trim().toLowerCase();
      const inputPassword = input.password.trim();
      const adminEmail = getAdminEmail().trim().toLowerCase();
      const adminUser = getAdminUsername().trim().toLowerCase();
      const adminPassword = getAdminPassword().trim();
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
        "admin_master"
      ].filter(Boolean));
      const validLogin = allowedLogins.has(inputLogin);
      const validPassword = Boolean(adminPassword) && (secureEquals(input.password, adminPassword) || secureEquals(inputPassword, adminPassword));
      if (!validLogin || !validPassword) {
        throw new TRPCError3({ code: "UNAUTHORIZED", message: "Credenciais de administrador incorretas." });
      }
      const openId = "admin_master";
      await upsertUser({
        openId,
        name: "Administrador do Sistema",
        email: adminEmail,
        role: "admin",
        loginMethod: "admin-panel",
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(openId, {
        name: "Administrador",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      return { success: true, email: adminEmail, sessionToken };
    }),
    getMetrics: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Acesso restrito a administradores." });
      }
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      const allUsers = await db.select().from(users);
      const allProfiles = await db.select().from(professionalProfiles);
      const allQuotes = await db.select().from(quotes);
      const allClients = await db.select().from(clients);
      const allAppointments = await db.select().from(appointments);
      const allServices = await db.select().from(services);
      const adminEmail = getAdminEmail().toLowerCase();
      const validProfessionals = allUsers.filter(
        (u) => u.email && u.name && u.role !== "admin" && u.email.toLowerCase() !== adminEmail && u.openId !== "admin_master"
      );
      const totalQuotedCents = allQuotes.reduce((acc, q) => acc + (q.totalCents || 0), 0);
      const acceptedQuotes = allQuotes.filter((q) => q.status === "aceito");
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
        demoMode: isDemoMode()
      };
    }),
    listUsers: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Acesso restrito a administradores." });
      }
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      const allUsers = await db.select().from(users).orderBy(desc2(users.createdAt));
      const allProfiles = await db.select().from(professionalProfiles);
      const allClients = await db.select().from(clients);
      const allQuotes = await db.select().from(quotes);
      const allAppointments = await db.select().from(appointments);
      const adminEmail = getAdminEmail().toLowerCase();
      let seenAdmin = false;
      const filteredUsers = allUsers.filter((u) => {
        const isAdmin = u.openId === "admin_master" || u.email && u.email.toLowerCase() === adminEmail;
        if (isAdmin) {
          if (seenAdmin) return false;
          seenAdmin = true;
          return true;
        }
        return true;
      });
      return filteredUsers.map((u) => {
        const prof = allProfiles.find((p) => p.userId === u.id);
        const isIncomplete = !u.name && !u.email;
        const clientsCount = prof ? allClients.filter((c) => c.profileId === prof.id).length : 0;
        const quotesCount = prof ? allQuotes.filter((q) => q.profileId === prof.id).length : 0;
        const appointmentsCount = prof ? allAppointments.filter((a) => a.profileId === prof.id).length : 0;
        return {
          id: u.id,
          name: u.name || (isIncomplete ? "Cadastro Incompleto (Sess\xE3o Antiga)" : "Sem nome"),
          email: u.email || "Sem e-mail",
          role: u.role,
          loginMethod: u.loginMethod,
          createdAt: u.createdAt,
          lastSignedIn: u.lastSignedIn,
          profileName: prof?.displayName || (isIncomplete ? "\u2014" : "Sem perfil"),
          profession: prof?.professionName || "\u2014",
          city: prof?.city || "\u2014",
          slug: prof?.slug || "\u2014",
          isIncomplete,
          clientsCount,
          quotesCount,
          appointmentsCount
        };
      });
    }),
    cleanGhostSessions: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Acesso restrito a administradores." });
      }
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      const adminEmail = getAdminEmail().toLowerCase();
      const allProfiles = await db.select({ userId: professionalProfiles.userId }).from(professionalProfiles);
      const protectedUserIds = new Set(allProfiles.map((p) => p.userId));
      const allUsers = await db.select().from(users).orderBy(desc2(users.createdAt));
      const ghostUserIds = allUsers.filter((u) => !u.name && !u.email && u.role === "user" && !protectedUserIds.has(u.id)).map((u) => u.id);
      const adminRows = allUsers.filter((u) => u.openId === "admin_master" || u.email && u.email.toLowerCase() === adminEmail);
      const duplicateAdminIds = adminRows.slice(1).map((u) => u.id);
      const toDelete = [...ghostUserIds, ...duplicateAdminIds];
      if (toDelete.length > 0) {
        for (const id of toDelete) {
          await db.delete(users).where(eq4(users.id, id));
        }
      }
      return {
        success: true,
        deletedGhostCount: ghostUserIds.length,
        deletedAdminDuplicates: duplicateAdminIds.length,
        remainingUsersCount: allUsers.length - toDelete.length
      };
    }),
    resetDatabase: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Acesso restrito a administradores." });
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
      const { resetMockDb: resetMockDb2 } = await Promise.resolve().then(() => (init_mockDb(), mockDb_exports));
      resetMockDb2();
      return { success: true, message: "Banco de dados zerado com sucesso! Sua conta de administrador foi preservada." };
    }),
    setDemoMode: protectedProcedure.input(z2.object({ enabled: z2.boolean() })).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Acesso restrito a administradores." });
      }
      setDemoMode(input.enabled);
      return { success: true, demoMode: isDemoMode() };
    }),
    listVouchers: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Acesso restrito a administradores." });
      }
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      const allVouchers = await db.select().from(vouchers).orderBy(desc2(vouchers.createdAt));
      const allRedemptions = await db.select().from(voucherRedemptions).orderBy(desc2(voucherRedemptions.redeemedAt));
      const allUsers = await db.select().from(users);
      const allProfiles = await db.select().from(professionalProfiles);
      const redemptionsWithDetails = allRedemptions.map((r) => {
        const u = allUsers.find((user) => user.id === r.userId);
        const p = allProfiles.find((prof) => prof.id === r.profileId);
        return {
          id: r.id,
          voucherId: r.voucherId,
          voucherCode: r.voucherCode,
          userName: u?.name || "Usu\xE1rio",
          userEmail: u?.email || "Sem e-mail",
          profileName: p?.displayName || "Sem perfil",
          redeemedAt: r.redeemedAt
        };
      });
      return {
        vouchers: allVouchers,
        redemptions: redemptionsWithDetails
      };
    }),
    createVoucher: protectedProcedure.input(
      z2.object({
        code: z2.string().min(3).max(50),
        description: z2.string().max(255).optional(),
        days: z2.number().int().min(0).default(15),
        plan: z2.enum(["pro", "team"]).default("pro"),
        isVipTotal: z2.boolean().default(false),
        maxUses: z2.number().int().min(1).default(1),
        expiresAt: z2.string().optional()
      })
    ).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Acesso restrito a administradores." });
      }
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      const cleanCode = input.code.trim().toUpperCase().replace(/\s+/g, "-");
      const existing = await db.select().from(vouchers).where(eq4(vouchers.code, cleanCode)).limit(1);
      if (existing[0]) {
        throw new TRPCError3({ code: "CONFLICT", message: `O voucher ${cleanCode} j\xE1 existe no sistema.` });
      }
      await db.insert(vouchers).values({
        code: cleanCode,
        description: input.description || (input.isVipTotal ? "Acesso VIP Total Vital\xEDcio" : `${input.days} dias de Plano ${input.plan.toUpperCase()}`),
        days: input.isVipTotal ? 0 : input.days,
        plan: input.plan,
        isVipTotal: input.isVipTotal,
        maxUses: input.maxUses,
        usedCount: 0,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
        active: true
      });
      return { success: true, code: cleanCode };
    }),
    toggleVoucher: protectedProcedure.input(z2.object({ id: z2.number(), active: z2.boolean() })).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Acesso restrito a administradores." });
      }
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(vouchers).set({ active: input.active }).where(eq4(vouchers.id, input.id));
      return { success: true };
    }),
    deleteVoucher: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Acesso restrito a administradores." });
      }
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      await db.delete(voucherRedemptions).where(eq4(voucherRedemptions.voucherId, input.id));
      await db.delete(vouchers).where(eq4(vouchers.id, input.id));
      return { success: true };
    })
  }),
  voucher: router({
    redeem: protectedProcedure.input(z2.object({ code: z2.string().min(2, "Digite o c\xF3digo do voucher.") })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Banco indispon\xEDvel." });
      const cleanCode = input.code.trim().toUpperCase();
      const found = await db.select().from(vouchers).where(eq4(vouchers.code, cleanCode)).limit(1);
      const voucher = found[0];
      if (!voucher || !voucher.active) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Voucher n\xE3o encontrado ou inativo. Verifique o c\xF3digo digitado." });
      }
      if (voucher.expiresAt && /* @__PURE__ */ new Date() > new Date(voucher.expiresAt)) {
        throw new TRPCError3({ code: "BAD_REQUEST", message: "Este voucher j\xE1 expirou." });
      }
      const alreadyRedeemed = await db.select().from(voucherRedemptions).where(and2(eq4(voucherRedemptions.voucherId, voucher.id), eq4(voucherRedemptions.userId, ctx.user.id))).limit(1);
      if (alreadyRedeemed[0]) {
        throw new TRPCError3({ code: "CONFLICT", message: "Voc\xEA j\xE1 resgatou este voucher anteriormente." });
      }
      if (voucher.maxUses !== -1 && voucher.usedCount >= voucher.maxUses) {
        throw new TRPCError3({ code: "BAD_REQUEST", message: "Este voucher atingiu o limite m\xE1ximo de resgates." });
      }
      if (voucher.isVipTotal) {
        await db.update(professionalProfiles).set({
          isPro: true,
          isVip: true,
          plan: voucher.plan || "pro",
          planExpiresAt: null
        }).where(eq4(professionalProfiles.id, profile.id));
        await db.insert(voucherRedemptions).values({
          voucherId: voucher.id,
          userId: ctx.user.id,
          profileId: profile.id,
          voucherCode: cleanCode
        });
        await db.update(vouchers).set({ usedCount: voucher.usedCount + 1 }).where(eq4(vouchers.id, voucher.id));
        await createNotification(
          profile.id,
          "\u2B50 VIP Total Ativado!",
          "Voc\xEA resgatou o voucher VIP Total. Todos os recursos do MeuAut\xF4nomo est\xE3o liberados vitaliciamente para voc\xEA!",
          "voucher"
        );
        return {
          success: true,
          isVipTotal: true,
          message: "Parab\xE9ns! VIP Total Vital\xEDcio ativado! Todos os recursos est\xE3o liberados para voc\xEA para sempre."
        };
      }
      const days = voucher.days || 15;
      const now = Date.now();
      let newExpiresAt;
      if (profile.planExpiresAt && new Date(profile.planExpiresAt).getTime() > now) {
        newExpiresAt = new Date(new Date(profile.planExpiresAt).getTime() + days * 864e5);
      } else {
        newExpiresAt = new Date(now + days * 864e5);
      }
      await db.update(professionalProfiles).set({
        isPro: true,
        plan: voucher.plan || "pro",
        planExpiresAt: newExpiresAt
      }).where(eq4(professionalProfiles.id, profile.id));
      await db.insert(voucherRedemptions).values({
        voucherId: voucher.id,
        userId: ctx.user.id,
        profileId: profile.id,
        voucherCode: cleanCode
      });
      await db.update(vouchers).set({ usedCount: voucher.usedCount + 1 }).where(eq4(vouchers.id, voucher.id));
      await createNotification(
        profile.id,
        `\u{1F389} Voucher de ${days} Dias Ativado!`,
        `Voc\xEA ganhou ${days} dias de degusta\xE7\xE3o do Plano PRO. Aproveite todos os recursos avan\xE7ados!`,
        "voucher"
      );
      return {
        success: true,
        isVipTotal: false,
        days,
        planExpiresAt: newExpiresAt,
        message: `Voucher aplicado com sucesso! Voc\xEA ganhou ${days} dias de degusta\xE7\xE3o gratuita do Plano PRO.`
      };
    }),
    getStatus: protectedProcedure.query(async ({ ctx }) => {
      const profile = await getProfileByUserId(ctx.user.id);
      if (!profile) return null;
      const isVip = Boolean(profile.isVip);
      const isPro = Boolean(profile.isPro);
      const expiresAt = profile.planExpiresAt ? new Date(profile.planExpiresAt) : null;
      let daysRemaining = null;
      let isExpired = false;
      if (!isVip && expiresAt) {
        const diffMs = expiresAt.getTime() - Date.now();
        daysRemaining = Math.max(0, Math.ceil(diffMs / (1e3 * 60 * 60 * 24)));
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
        isExpired
      };
    })
  }),
  referral: router({
    getInfo: protectedProcedure.query(async ({ ctx }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      let code = profile.referralCode;
      if (!code) {
        code = `${profile.slug.replace(/[^a-z0-9]/gi, "").slice(0, 8).toUpperCase()}-${nanoid(4).toUpperCase()}`;
        await db.update(professionalProfiles).set({ referralCode: code }).where(eq4(professionalProfiles.id, profile.id));
      }
      const appBaseUrl = process.env.PUBLIC_URL || "https://meuautonomo.vercel.app";
      const referralLink = `${appBaseUrl}/r/${code}`;
      return {
        referralCode: code,
        referralLink,
        referralCount: profile.referralCount || 0,
        bonusDaysEarned: profile.bonusDaysEarned || 0
      };
    }),
    applyCode: protectedProcedure.input(z2.object({ code: z2.string().min(3) })).mutation(async ({ ctx, input }) => {
      const profile = await requireProfile(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      if (profile.referredBy) {
        throw new TRPCError3({ code: "BAD_REQUEST", message: "Voc\xEA j\xE1 utilizou um c\xF3digo de indica\xE7\xE3o anteriormente." });
      }
      const cleanCode = input.code.trim().toUpperCase();
      if (cleanCode === profile.referralCode) {
        throw new TRPCError3({ code: "BAD_REQUEST", message: "Voc\xEA n\xE3o pode utilizar seu pr\xF3prio c\xF3digo de indica\xE7\xE3o." });
      }
      const referrer = await db.select().from(professionalProfiles).where(eq4(professionalProfiles.referralCode, cleanCode)).limit(1);
      if (!referrer[0]) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "C\xF3digo de indica\xE7\xE3o n\xE3o encontrado. Verifique com seu colega." });
      }
      const bonusDays = 15;
      const now = Date.now();
      const newExpires = profile.planExpiresAt && new Date(profile.planExpiresAt).getTime() > now ? new Date(new Date(profile.planExpiresAt).getTime() + bonusDays * 864e5) : new Date(now + bonusDays * 864e5);
      await db.update(professionalProfiles).set({
        referredBy: cleanCode,
        isPro: true,
        plan: "pro",
        planExpiresAt: newExpires
      }).where(eq4(professionalProfiles.id, profile.id));
      await createNotification(
        profile.id,
        "\u{1F381} B\xF4nus de Indica\xE7\xE3o Ativado!",
        `Voc\xEA ganhou 15 dias de Plano PRO gr\xE1tis pela indica\xE7\xE3o de ${referrer[0].displayName}!`,
        "referral"
      );
      const refNewExpires = referrer[0].planExpiresAt && new Date(referrer[0].planExpiresAt).getTime() > now ? new Date(new Date(referrer[0].planExpiresAt).getTime() + bonusDays * 864e5) : new Date(now + bonusDays * 864e5);
      await db.update(professionalProfiles).set({
        isPro: true,
        plan: referrer[0].plan === "team" ? "team" : "pro",
        planExpiresAt: referrer[0].isVip ? null : refNewExpires,
        referralCount: (referrer[0].referralCount || 0) + 1,
        bonusDaysEarned: (referrer[0].bonusDaysEarned || 0) + bonusDays
      }).where(eq4(professionalProfiles.id, referrer[0].id));
      await createNotification(
        referrer[0].id,
        "\u{1F389} Amigo Indicado!",
        `${profile.displayName} se cadastrou pelo seu link! Voc\xEA ganhou +15 dias de Plano PRO gr\xE1tis!`,
        "referral"
      );
      return {
        success: true,
        message: `C\xF3digo de indica\xE7\xE3o aceito! Voc\xEA e ${referrer[0].displayName} ganharam 15 dias de Plano PRO gr\xE1tis!`,
        planExpiresAt: newExpires
      };
    })
  }),
  receipt: router({
    validate: publicProcedure.input(z2.object({ code: z2.string() })).query(async ({ input }) => {
      const rawCode = input.code.trim().toUpperCase().replace(/\s+/g, "");
      if (!rawCode) {
        return { valid: false, error: "Informe o c\xF3digo do recibo para validar." };
      }
      let type = "A";
      let id = null;
      let providedHash = null;
      const fullMatch = rawCode.match(/^MA-REC-([AQ])(\d+)(?:-([A-Z0-9]+))?$/);
      if (fullMatch) {
        type = fullMatch[1];
        id = parseInt(fullMatch[2], 10);
        providedHash = fullMatch[3] || null;
      } else {
        const friendlyMatch = rawCode.match(/^(?:REC-)?(?:([AQ])[-_]?)?(\d+)$/);
        if (friendlyMatch) {
          type = friendlyMatch[1] || "A";
          id = parseInt(friendlyMatch[2], 10);
        } else {
          return {
            valid: false,
            error: `Formato de c\xF3digo n\xE3o reconhecido: "${rawCode}". Exemplos v\xE1lidos: MA-REC-A12-XXXXXX ou REC-12.`
          };
        }
      }
      if (!id || isNaN(id) || id <= 0) {
        return { valid: false, error: "Identificador de recibo inv\xE1lido." };
      }
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      let appointment = type === "A" ? (await db.select().from(appointments).where(eq4(appointments.id, id)).limit(1))[0] : null;
      let quote = type === "Q" ? (await db.select().from(quotes).where(eq4(quotes.id, id)).limit(1))[0] : null;
      if (!appointment && !quote && !fullMatch) {
        appointment = (await db.select().from(appointments).where(eq4(appointments.id, id)).limit(1))[0];
        if (appointment) {
          type = "A";
        } else {
          quote = (await db.select().from(quotes).where(eq4(quotes.id, id)).limit(1))[0];
          if (quote) {
            type = "Q";
          }
        }
      }
      if (type === "A" && appointment) {
        const officialCode = generateReceiptAuthCode("A", appointment.id, appointment.profileId, appointment.amountCents);
        if (providedHash && officialCode.toUpperCase() !== rawCode) {
          return { valid: false, error: "C\xF3digo de autenticidade adulterado ou divergente do registro original." };
        }
        const profile = (await db.select().from(professionalProfiles).where(eq4(professionalProfiles.id, appointment.profileId)).limit(1))[0];
        const client = appointment.clientId ? (await db.select().from(clients).where(eq4(clients.id, appointment.clientId)).limit(1))[0] : null;
        const service = appointment.serviceId ? (await db.select().from(services).where(eq4(services.id, appointment.serviceId)).limit(1))[0] : null;
        return {
          valid: true,
          code: officialCode,
          receiptNumber: `REC-${String(appointment.id).padStart(4, "0")}`,
          type: "Comprovante de Atendimento Conclu\xEDdo",
          professionalName: profile?.displayName || "Profissional",
          profession: profile?.professionName || "Profissional Aut\xF4nomo",
          professionalCity: profile?.city && profile?.serviceRegion ? `${profile.city} (${profile.serviceRegion})` : profile?.city || profile?.serviceRegion || "",
          professionalPhone: profile?.whatsapp || profile?.phone || "",
          clientName: client?.name || (appointment.clientId ? `Cliente #${appointment.clientId}` : "Cliente"),
          serviceDescription: service?.name || appointment.notes || "Presta\xE7\xE3o de Servi\xE7os",
          amountCents: appointment.amountCents,
          date: appointment.startsAt || appointment.createdAt,
          issuedAt: appointment.updatedAt || appointment.createdAt,
          paymentMethod: appointment.paymentMethod ? appointment.paymentMethod.toUpperCase() : "Acerto direto com o prestador",
          paymentStatus: appointment.status === "concluido" ? "Quitado / Recebido" : "Confirmado",
          legalBasis: "Em conformidade com a Lei Federal n\xBA 14.063/2020 (Assinatura Eletr\xF4nica Simples) e Art. 320 do C\xF3digo Civil Brasileiro"
        };
      } else if (type === "Q" && quote) {
        const officialCode = generateReceiptAuthCode("Q", quote.id, quote.profileId, quote.totalCents);
        if (providedHash && officialCode.toUpperCase() !== rawCode) {
          return { valid: false, error: "C\xF3digo de autenticidade adulterado ou divergente do registro original." };
        }
        const profile = (await db.select().from(professionalProfiles).where(eq4(professionalProfiles.id, quote.profileId)).limit(1))[0];
        const client = quote.clientId ? (await db.select().from(clients).where(eq4(clients.id, quote.clientId)).limit(1))[0] : null;
        return {
          valid: true,
          code: officialCode,
          receiptNumber: `REC-${String(quote.id).padStart(4, "0")}`,
          type: "Comprovante de Proposta / Or\xE7amento Aprovado",
          professionalName: profile?.displayName || "Profissional",
          profession: profile?.professionName || "Profissional Aut\xF4nomo",
          professionalCity: profile?.city && profile?.serviceRegion ? `${profile.city} (${profile.serviceRegion})` : profile?.city || profile?.serviceRegion || "",
          professionalPhone: profile?.whatsapp || profile?.phone || "",
          clientName: quote.clientName || client?.name || "Cliente",
          serviceDescription: quote.description || "Presta\xE7\xE3o de Servi\xE7os",
          amountCents: quote.totalCents,
          date: quote.respondedAt || quote.createdAt,
          issuedAt: quote.respondedAt || quote.createdAt,
          paymentMethod: quote.paymentTerms || "Acerto direto com o prestador",
          paymentStatus: "Aprovado / Quitado",
          legalBasis: "Em conformidade com a Lei Federal n\xBA 14.063/2020 (Assinatura Eletr\xF4nica Simples) e Art. 320 do C\xF3digo Civil Brasileiro"
        };
      }
      return { valid: false, error: "Recibo ou atendimento n\xE3o localizado no sistema." };
    })
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/app.ts
function createExpressApp() {
  const app2 = express();
  app2.use(express.json({ limit: "50mb" }));
  app2.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app2);
  registerOAuthRoutes(app2);
  registerOgMetaRoutes(app2);
  app2.post("/api/webhooks/asaas", handleAsaasWebhook);
  app2.post("/api/asaas/create-pix", createPixPayment);
  app2.get("/api/asaas/payment-status/:paymentId", getPaymentStatus);
  app2.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  return app2;
}

// server/_core/vercel.ts
var app = createExpressApp();
var vercel_default = app;
export {
  vercel_default as default
};
