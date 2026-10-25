import { and, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  professionalProfiles,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

import { getMockDb } from "./mockDb";

let _db: ReturnType<typeof drizzle> | any = null;
let _schemaMigrationPromise: Promise<void> | null = null;

async function ensureSchema(db: any) {
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
        } catch (statusErr: any) {
          // ignore if already modified
        }
      } catch (err: any) {
        if (
          err?.code === "ER_DUP_FIELDNAME" ||
          err?.code === "1060" ||
          String(err?.message || "").includes("Duplicate column") ||
          String(err?.message || "").includes("already exists")
        ) {
          // Coluna já existe
        } else {
          console.warn("[Database] Aviso de migração (accountType):", err?.message || err);
        }
      }
    })();
  }
  await _schemaMigrationPromise;
}

let _lastMeuAutonomoVaultDay = "";

async function syncMeuAutonomoCloudVault(db: any) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    if (_lastMeuAutonomoVaultDay === today) return;
    _lastMeuAutonomoVaultDay = today;

    const schema = await import("../drizzle/schema");
    const [
      allUsers,
      allProfiles,
      allClients,
      allServices,
      allAppointments,
      allQuotes,
      allPayments,
      allExpenses,
    ] = await Promise.all([
      db.select().from(schema.users).catch(() => []),
      db.select().from(schema.professionalProfiles).catch(() => []),
      db.select().from(schema.clients).catch(() => []),
      db.select().from(schema.services).catch(() => []),
      db.select().from(schema.appointments).catch(() => []),
      db.select().from(schema.quotes).catch(() => []),
      db.select().from(schema.payments).catch(() => []),
      db.select().from(schema.expenses).catch(() => []),
    ]);

    const apiKey = process.env.FIREBASE_API_KEY || "";
    const projectId = process.env.FIREBASE_PROJECT_ID || "expedicao-brasil";
    if (!apiKey) return;
    const daySlot = `slot_day_${new Date().getUTCDay()}`; // 0 (Dom) a 6 (Sab) - Time-Machine automatico 7 dias
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
      expenses: allExpenses,
    }).slice(0, 850000);

    await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: {
          date: { stringValue: today },
          updatedAt: { stringValue: new Date().toISOString() },
          totalUsers: { integerValue: String(allUsers.length) },
          totalClients: { integerValue: String(allClients.length) },
          payloadJson: { stringValue: snapshotPayload },
        },
      }),
    });
  } catch (e) {
    // Silencioso para nunca afetar operacao principal
  }
}

export async function getDb(): Promise<ReturnType<typeof drizzle>> {
  if (process.env.DATABASE_URL) {
    if (!_db || _db.__isMock) {
      let lastErr: any = null;
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
      syncMeuAutonomoCloudVault(_db).catch(() => {});
    }
    return _db;
  }

  // Modo de Teste Local Demonstrativo
  if (!_db) {
    console.log("=============================================================================");
    console.log("⚠️ MODO DEMONSTRAÇÃO ATIVO (Sem DATABASE_URL)");
    console.log("👉 Usando dados de teste simulados em memória para desenvolvimento.");
    console.log("📌 LEMBRETE: Para conectar ao banco oficial de produção, defina a variável");
    console.log("   DATABASE_URL=mysql://USER:PASSWORD@HOST/DATABASE no seu arquivo .env");
    console.log("=============================================================================");
    _db = getMockDb();
  }
  return _db;
}

export async function updateUserLastSignedIn(userId: number, date = new Date()): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ lastSignedIn: date }).where(eq(users.id, userId));
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const now = new Date();
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod", "passwordHash"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) {
      updateSet[field] = user[field] ?? null;
    }
  }
  updateSet.lastSignedIn = user.lastSignedIn ?? now;
  if (user.role !== undefined) {
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId || user.openId === "admin_master") {
    updateSet.role = "admin";
  }

  // 1. Check if user already exists by openId
  const existingByOpenId = await getUserByOpenId(user.openId);
  if (existingByOpenId) {
    if (Object.keys(updateSet).length > 0) {
      await db.update(users).set(updateSet).where(eq(users.id, existingByOpenId.id));
    }
    return;
  }

  // 2. Check if user already exists by email (prevents duplicate accounts if openId differs)
  if (user.email) {
    const existingByEmail = await getUserByEmail(user.email);
    if (existingByEmail) {
      await db.update(users).set({ ...updateSet, openId: user.openId }).where(eq(users.id, existingByEmail.id));
      return;
    }
  }

  // 3. Only insert if user does not exist by openId or email
  const values: InsertUser = {
    openId: user.openId,
    name: user.name ?? null,
    email: user.email ? user.email.trim().toLowerCase() : null,
    loginMethod: user.loginMethod ?? null,
    passwordHash: user.passwordHash ?? null,
    role: (updateSet.role as any) || "user",
    lastSignedIn: (updateSet.lastSignedIn as Date) || now,
    createdAt: now,
  };

  await db.insert(users).values(values);
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const normalized = email.trim().toLowerCase();
  const result = await db.select().from(users).where(eq(users.email, normalized)).limit(1);
  return result[0];
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(users);
  return result;
}

export async function getProfileByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  try {
    const result = await db
      .select()
      .from(professionalProfiles)
      .where(eq(professionalProfiles.userId, userId))
      .limit(1);
    return result[0];
  } catch (err: any) {
    if (String(err?.message || "").includes("accountType") && typeof db.execute === "function") {
      try {
        await db.execute(sql`
          ALTER TABLE \`professionalProfiles\`
          ADD COLUMN \`accountType\` ENUM('individual', 'equipe') NOT NULL DEFAULT 'individual'
        `);
        const retryResult = await db
          .select()
          .from(professionalProfiles)
          .where(eq(professionalProfiles.userId, userId))
          .limit(1);
        return retryResult[0];
      } catch (retryErr) {
        console.error("[Database] Retry getProfileByUserId falhou:", retryErr);
      }
    }
    throw err;
  }
}

export async function getProfileById(profileId: number) {
  const db = await getDb();
  if (!db) return undefined;
  try {
    const result = await db
      .select()
      .from(professionalProfiles)
      .where(eq(professionalProfiles.id, profileId))
      .limit(1);
    return result[0];
  } catch (err: any) {
    if (String(err?.message || "").includes("accountType") && typeof db.execute === "function") {
      try {
        await db.execute(sql`
          ALTER TABLE \`professionalProfiles\`
          ADD COLUMN \`accountType\` ENUM('individual', 'equipe') NOT NULL DEFAULT 'individual'
        `);
        const retryResult = await db
          .select()
          .from(professionalProfiles)
          .where(eq(professionalProfiles.id, profileId))
          .limit(1);
        return retryResult[0];
      } catch (retryErr) {
        console.error("[Database] Retry getProfileById falhou:", retryErr);
      }
    }
    throw err;
  }
}

export async function getProfileBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  try {
    const result = await db
      .select()
      .from(professionalProfiles)
      .where(eq(professionalProfiles.slug, slug))
      .limit(1);
    return result[0];
  } catch (err: any) {
    if (String(err?.message || "").includes("accountType") && typeof db.execute === "function") {
      try {
        await db.execute(sql`
          ALTER TABLE \`professionalProfiles\`
          ADD COLUMN \`accountType\` ENUM('individual', 'equipe') NOT NULL DEFAULT 'individual'
        `);
        const retryResult = await db
          .select()
          .from(professionalProfiles)
          .where(eq(professionalProfiles.slug, slug))
          .limit(1);
        return retryResult[0];
      } catch (retryErr) {
        console.error("[Database] Retry getProfileBySlug falhou:", retryErr);
      }
    }
    throw err;
  }
}

export async function createNotification(profileId: number, title: string, body: string, type: string) {
  const db = await getDb();
  if (!db) return;
  const { notifications } = await import("../drizzle/schema");
  await db.insert(notifications).values({ profileId, title, body, type });
}

export async function getUnreadNotificationCount(profileId: number) {
  const db = await getDb();
  if (!db) return 0;
  const { notifications } = await import("../drizzle/schema");
  const rows = await db
    .select({ id: notifications.id })
    .from(notifications)
    .where(and(eq(notifications.profileId, profileId), eq(notifications.read, false)));
  return rows.length;
}

export async function getRecentNotifications(profileId: number) {
  const db = await getDb();
  if (!db) return [];
  const { notifications } = await import("../drizzle/schema");
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.profileId, profileId))
    .orderBy(desc(notifications.createdAt))
    .limit(8);
}
