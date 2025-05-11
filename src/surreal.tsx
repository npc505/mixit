import { RecordId } from "surrealdb";

export { Surreal } from "surrealdb";
export { getDb } from "./surreal/client.ts";
export { login } from "./surreal/auth.ts";
export { DbContext } from "./surreal/ctx.ts";

type Record = { [x: string]: unknown; id: RecordId<string> };
export type { Record, RecordId };
