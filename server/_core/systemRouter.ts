import { z } from "zod";
import { notifyOwner } from "./notification";
import { adminProcedure, publicProcedure, router } from "./trpc";

export const systemRouter = router({
  health: publicProcedure
    .input(
      z.object({
        timestamp: z.number().min(0, "timestamp cannot be negative"),
      })
    )
    .query(() => ({
      ok: true,
    })),

  dbStatus: publicProcedure.query(async () => {
    try {
      const { getDb } = await import("../db");
      const { sql } = await import("drizzle-orm");
      const db = await getDb();
      const isMock = !db || Boolean((db as any).__isMock);
      let dbName: string | null = null;
      let tables: string[] = [];
      let quantityColumn: any = null;
      let quoteItemsCount: number | null = null;
      let migrations: any[] = [];
      let dbError: string | null = null;

      if (!isMock) {
        try {
          const [dbRes] = await db.execute(sql`SELECT DATABASE() as db`);
          dbName = (dbRes as any)?.[0]?.db || null;

          const [tbls] = await db.execute(sql`SHOW TABLES LIKE 'quoteItems'`);
          tables = (tbls as any)?.map((t: any) => Object.values(t)[0]) || [];

          if (tables.length > 0) {
            const [col] = await db.execute(sql`SHOW COLUMNS FROM quoteItems LIKE 'quantity'`);
            quantityColumn = (col as any)?.[0] || null;

            const [cnt] = await db.execute(sql`SELECT COUNT(*) as total FROM quoteItems`);
            quoteItemsCount = Number((cnt as any)?.[0]?.total || 0);
          }

          const [migTbls] = await db.execute(sql`SHOW TABLES LIKE '__drizzle_migrations'`);
          if ((migTbls as any)?.length > 0) {
            const [migs] = await db.execute(sql`SELECT * FROM __drizzle_migrations ORDER BY id ASC`);
            migrations = (migs as any) || [];
          }
        } catch (queryErr: any) {
          dbError = JSON.stringify({
            message: queryErr?.message,
            code: queryErr?.code,
            errno: queryErr?.errno,
            sqlState: queryErr?.sqlState,
            cause: queryErr?.cause ? {
              message: queryErr.cause?.message,
              code: queryErr.cause?.code,
              errno: queryErr.cause?.errno,
              sqlState: queryErr.cause?.sqlState,
            } : null,
          });
        }
      }

      return {
        connected: !isMock,
        isMock,
        dbName,
        hasQuoteItemsTable: tables.length > 0,
        quantityColumn,
        quoteItemsCount,
        migrations,
        dbError,
      };
    } catch (e: any) {
      return {
        connected: false,
        isMock: true,
        error: e?.message || String(e),
      };
    }
  }),

  notifyOwner: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "title is required"),
        content: z.string().min(1, "content is required"),
      })
    )
    .mutation(async ({ input }) => {
      const delivered = await notifyOwner(input);
      return {
        success: delivered,
      } as const;
    }),
});
