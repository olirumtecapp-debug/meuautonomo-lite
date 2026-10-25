import { getTableName } from "drizzle-orm";
import fs from "fs";
import path from "path";

export interface MockStore {
  users: any[];
  professionalProfiles: any[];
  availability: any[];
  services: any[];
  clients: any[];
  appointments: any[];
  requests: any[];
  requestAttachments: any[];
  quotes: any[];
  quoteItems: any[];
  payments: any[];
  expenses: any[];
  notifications: any[];
  teamMembers: any[];
  vouchers: any[];
  voucherRedemptions: any[];
}

const IS_VERCEL = !!process.env.VERCEL;
const DATA_DIR = IS_VERCEL ? "/tmp" : path.resolve(process.cwd(), "server", "data");
const STORE_FILE = path.join(DATA_DIR, "db-store.json");

function createCleanStore(): MockStore {
  const now = new Date();
  return {
    users: [
      {
        id: 1,
        openId: "dev-user-local",
        name: "Admin MeuAutônomo",
        email: "contato@meuautonomo.com.br",
        loginMethod: "local-dev",
        role: "admin",
        createdAt: now,
        updatedAt: now,
        lastSignedIn: now,
      },
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
      { id: 1, code: "VIP20DIAS", description: "Degustação VIP 20 Dias para Testadora Beta", days: 20, plan: "pro", isVipTotal: false, maxUses: 100, usedCount: 0, active: true },
      { id: 2, code: "BETA20", description: "Acesso Beta de 20 Dias Grátis", days: 20, plan: "pro", isVipTotal: false, maxUses: 100, usedCount: 0, active: true },
      { id: 3, code: "TESTE20", description: "Teste Especial 20 Dias", days: 20, plan: "pro", isVipTotal: false, maxUses: 100, usedCount: 0, active: true },
      { id: 4, code: "EQUIPE20", description: "Degustação VIP 20 Dias Módulo Equipe / Estúdio", days: 20, plan: "team", isVipTotal: false, maxUses: 100, usedCount: 0, active: true },
      { id: 5, code: "VIP-EQUIPE20", description: "Acesso Especial 20 Dias Módulo Equipe / Estúdio", days: 20, plan: "team", isVipTotal: false, maxUses: 100, usedCount: 0, active: true },
      { id: 6, code: "PRO10", description: "Bônus 10 Dias Plano PRO", days: 10, plan: "pro", isVipTotal: false, maxUses: 50, usedCount: 0, active: true },
      { id: 7, code: "PRO15", description: "Bônus 15 Dias Plano PRO", days: 15, plan: "pro", isVipTotal: false, maxUses: 50, usedCount: 0, active: true },
      { id: 8, code: "PRO30", description: "Bônus 30 Dias (1 Mês Grátis)", days: 30, plan: "pro", isVipTotal: false, maxUses: 50, usedCount: 0, active: true },
      { id: 9, code: "VIPTOTAL", description: "Acesso VIP Total Vitalício", days: 0, plan: "team", isVipTotal: true, maxUses: 10, usedCount: 0, active: true },
      { id: 10, code: "VIP-MEUAUTONOMO", description: "VIP Vitalício Fundador / Embaixador", days: 0, plan: "team", isVipTotal: true, maxUses: 10, usedCount: 0, active: true }
    ],
    voucherRedemptions: [],
  };
}

function saveStoreToFile(data: MockStore) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("[MockDb] Erro ao salvar banco persistido em disco:", err);
  }
}

function loadStoreFromFile(): MockStore {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const content = fs.readFileSync(STORE_FILE, "utf-8");
      const parsed = JSON.parse(content);
      // Re-converte strings ISO para Date e deduplica users
      for (const table of Object.keys(parsed)) {
        if (Array.isArray(parsed[table])) {
          parsed[table].forEach((item: any) => {
            for (const key of Object.keys(item)) {
              if (typeof item[key] === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(item[key])) {
                item[key] = new Date(item[key]);
              }
            }
          });
        }
      }
      if (Array.isArray(parsed.users)) {
        const uniqueUsers = new Map<string, any>();
        for (const u of parsed.users) {
          const key = u.openId || u.email || String(u.id);
          if (!uniqueUsers.has(key)) {
            uniqueUsers.set(key, u);
          } else {
            // merge data
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

let store: MockStore = loadStoreFromFile();

export function resetMockDb() {
  store = createCleanStore();
  saveStoreToFile(store);
  console.log("[MockDb] 🧹 Banco de dados zerado com sucesso para novos testes!");
  return store;
}

function extractCondition(cond: any): any {
  if (!cond) return null;
  if (!cond.queryChunks || !Array.isArray(cond.queryChunks)) return null;

  const chunks = cond.queryChunks;

  // Se estiver envolvido em parênteses: [ '(', SQL, ')' ]
  if (chunks.length === 3 && chunks[0]?.value?.[0] === "(" && chunks[2]?.value?.[0] === ")") {
    return extractCondition(chunks[1]);
  }

  // Verifica se há separador ' and ' ou ' or ' entre os chunks
  const isAnd = chunks.some((c: any) => typeof c?.value?.[0] === "string" && c.value[0].includes(" and "));
  const isOr = chunks.some((c: any) => typeof c?.value?.[0] === "string" && c.value[0].includes(" or "));

  if (isAnd) {
    const subConds = chunks.filter((c: any) => c && c.queryChunks);
    return { type: "and", conditions: subConds.map(extractCondition).filter(Boolean) };
  }
  if (isOr) {
    const subConds = chunks.filter((c: any) => c && c.queryChunks);
    return { type: "or", conditions: subConds.map(extractCondition).filter(Boolean) };
  }

  let colName: string | null = null;
  let op = "=";
  let targetVal: any = undefined;

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

function evaluateParsed(item: any, parsed: any): boolean {
  if (!parsed) return true;
  if (parsed.type === "and") {
    return parsed.conditions.every((c: any) => evaluateParsed(item, c));
  }
  if (parsed.type === "or") {
    return parsed.conditions.some((c: any) => evaluateParsed(item, c));
  }
  if (parsed.type === "single") {
    if (!parsed.colName) return true;
    const itemVal = item[parsed.colName];
    const targetVal = parsed.targetVal;
    const op = parsed.op;

    const itemTime = itemVal instanceof Date ? itemVal.getTime() : (typeof itemVal === "string" && !isNaN(Date.parse(itemVal)) ? new Date(itemVal).getTime() : NaN);
    const targetTime = targetVal instanceof Date ? targetVal.getTime() : (typeof targetVal === "string" && !isNaN(Date.parse(targetVal)) ? new Date(targetVal).getTime() : NaN);

    if (!isNaN(itemTime) && !isNaN(targetTime)) {
      if (op === "=") return itemTime === targetTime;
      if (op === "<>") return itemTime !== targetTime;
      if (op === ">=") return itemTime >= targetTime;
      if (op === "<=") return itemTime <= targetTime;
      if (op === ">") return itemTime > targetTime;
      if (op === "<") return itemTime < targetTime;
    }
    if (op === "=") {
      if (targetVal === false) return itemVal === false || itemVal === undefined || itemVal === null;
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

function matchesCondition(item: any, condition: any): boolean {
  if (!condition) return true;
  const parsed = extractCondition(condition);
  return evaluateParsed(item, parsed);
}

export function getMockDb() {
  return {
    __isMock: true,
    select: (fields?: any) => {
      let currentTable: any = null;
      let condition: any = null;
      let limitNum: number | null = null;
      let orders: any[] = [];

      const queryBuilder: any = {
        from: (table: any) => {
          currentTable = table;
          return queryBuilder;
        },
        where: (cond: any) => {
          condition = cond;
          return queryBuilder;
        },
        orderBy: (...orderList: any[]) => {
          orders = orderList;
          return queryBuilder;
        },
        limit: (n: number) => {
          limitNum = n;
          return queryBuilder;
        },
        then: (resolve: any, reject: any) => {
          try {
            const tableName = getTableName(currentTable) as keyof MockStore;
            let list = [...(store[tableName] || [])];

            if (condition) {
              list = list.filter(item => matchesCondition(item, condition));
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
              list = list.map(item => {
                const res: any = {};
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
        },
      };
      return queryBuilder;
    },

    insert: (table: any) => {
      return {
        values: (data: any) => {
          const tableName = getTableName(table) as keyof MockStore;
          if (!store[tableName]) store[tableName] = [];

          let executed = false;
          const runInsert = (updateSet?: any) => {
            if (executed) return [{ insertId: 0 }];
            executed = true;

            const items = Array.isArray(data) ? data : [data];
            let lastId = store[tableName].reduce((max, x) => Math.max(max, x.id || 0), 0) || 0;

            for (const item of items) {
              let existing: any = null;
              if (tableName === "users" && item.openId) {
                existing = store.users.find(u => u.openId === item.openId);
              } else if (tableName === "professionalProfiles" && item.userId) {
                existing = store.professionalProfiles.find(p => p.userId === item.userId);
              } else if (tableName === "availability" && item.profileId) {
                existing = store.availability.find(a => a.profileId === item.profileId);
              }

              if (existing) {
                const changes = updateSet || item;
                Object.assign(existing, changes, { updatedAt: new Date() });
                lastId = existing.id;
              } else {
                lastId++;
                const record = {
                  ...item,
                  id: item.id || lastId,
                  createdAt: item.createdAt || new Date(),
                  updatedAt: item.updatedAt || new Date(),
                };
                store[tableName].push(record);
              }
            }

            saveStoreToFile(store);
            return [{ insertId: lastId }];
          };

          const builder: any = {
            onDuplicateKeyUpdate: (opts: any) => {
              const res = runInsert(opts?.set);
              return Promise.resolve(res);
            },
            then: (resolve: any, reject: any) => {
              try {
                const res = runInsert();
                return Promise.resolve(res).then(resolve, reject);
              } catch (e) {
                if (reject) return Promise.reject(e).catch(reject);
                throw e;
              }
            },
          };
          return builder;
        },
      };
    },

    update: (table: any) => {
      return {
        set: (values: any) => {
          return {
            where: (condition: any) => {
              const tableName = getTableName(table) as keyof MockStore;
              const list = store[tableName] || [];
              let affected = 0;

              for (const item of list) {
                if (matchesCondition(item, condition)) {
                  Object.assign(item, values, { updatedAt: new Date() });
                  affected++;
                }
              }

              if (affected > 0) {
                saveStoreToFile(store);
              }

              return Promise.resolve([{ affectedRows: affected }]);
            },
          };
        },
      };
    },

    delete: (table: any) => {
      return {
        where: (condition: any) => {
          const tableName = getTableName(table) as keyof MockStore;
          const list = store[tableName] || [];
          const before = list.length;
          store[tableName] = list.filter(item => !matchesCondition(item, condition));
          const affected = before - store[tableName].length;

          if (affected > 0) {
            saveStoreToFile(store);
          }

          return Promise.resolve([{ affectedRows: affected }]);
        },
      };
    },
  };
}
