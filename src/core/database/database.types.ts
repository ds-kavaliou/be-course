import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

/**
 * Drizzle database injected with `@InjectDrizzle()`.
 * Gets a schema type parameter once the first tables are defined.
 */
export type Database = NodePgDatabase;
