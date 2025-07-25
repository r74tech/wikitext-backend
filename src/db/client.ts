import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";
import type { Database } from "./types";
import type { Env } from "../types/bindings";

export function createDb(env: Env): Kysely<Database> {
    return new Kysely<Database>({
        dialect: new D1Dialect({ database: env.DB }),
    });
}
