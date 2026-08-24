"use client";

/**
 * Browser-local storage for the publishing tools.
 *
 * The playbook's file system puts drafts at `04 CONTENT / 02 drafts`, and
 * governance says "nothing important lives only in a chat thread". Until now a
 * reload discarded every edit in the editor and the carousel.
 *
 * This module stores an opaque `T` inside a versioned envelope. It deliberately
 * does not know what an `EditorDoc` or a `CarouselDraft` is — the two document
 * models are incompatible and stay that way, served side by side by `kind`.
 *
 * Frontend only. No backend, no sync, no cloud. Everything here is one browser.
 */

export const STORE_VERSION = 1;

/** "post" = EditorDoc, "carousel" = CarouselDraft. Add kinds; never merge them. */
export type DraftKind = "post" | "carousel";

export interface Envelope<T> {
  /** STORE_VERSION at write time. */
  v: number;
  kind: DraftKind;
  id: string;
  name: string;
  /** ISO timestamps. */
  created: string;
  updated: string;
  doc: T;
}

/** What the drafts shelf lists. Reading a row never parses the document. */
export interface IndexRow {
  id: string;
  kind: DraftKind;
  name: string;
  created: string;
  updated: string;
  /** Written by an older store version; readable only to be deleted. */
  stale?: boolean;
}

export type StoreResult<T = void> =
  | { ok: true; value: T }
  | { ok: false; reason: "unavailable" | "quota" | "corrupt" };

const INDEX_KEY = `okwe:v${STORE_VERSION}:index`;
const draftKey = (kind: DraftKind, id: string) => `okwe:v${STORE_VERSION}:draft:${kind}:${id}`;
const autosaveKey = (kind: DraftKind) => `okwe:v${STORE_VERSION}:autosave:${kind}`;
export const HANDOFF_KEY = `okwe:v${STORE_VERSION}:handoff`;
export const REGISTER_KEY = `okwe:v${STORE_VERSION}:register`;

/**
 * Set once a write has failed for want of space.
 *
 * INTENTIONAL: this silences autosave for the rest of the tab session, even if
 * the user later frees space. That is the point — an autosave that retries on
 * every keystroke against a full quota is a write-storm. Do not "fix" this into
 * a retry loop.
 */
let quotaHit = false;

/** True when we are in a browser and it will actually let us write. */
export function available(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const probe = "okwe:probe";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

function readJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    // One corrupt key must never take the app down.
    return null;
  }
}

function writeJson(key: string, value: unknown): StoreResult {
  if (typeof window === "undefined") return { ok: false, reason: "unavailable" };
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return { ok: true, value: undefined };
  } catch {
    quotaHit = true;
    return { ok: false, reason: "quota" };
  }
}

export function quotaExhausted(): boolean {
  return quotaHit;
}

const now = () => new Date().toISOString();

function newId(): string {
  const rand = Math.random().toString(36).slice(2, 6);
  return `d-${Date.now().toString(36)}-${rand}`;
}

/** Unwrap an envelope, discarding anything written by another store version. */
function unwrap<T>(env: Envelope<T> | null): T | null {
  if (!env || typeof env !== "object") return null;
  if (env.v !== STORE_VERSION) return null;
  return env.doc ?? null;
}

/* ---------------------------------------------------------------- autosave */

/** The working document for a tool — one per kind, overwritten as you type. */
export function readAutosave<T>(kind: DraftKind): T | null {
  return unwrap(readJson<Envelope<T>>(autosaveKey(kind)));
}

export function writeAutosave<T>(kind: DraftKind, doc: T): StoreResult {
  if (quotaHit) return { ok: false, reason: "quota" };
  const env: Envelope<T> = {
    v: STORE_VERSION,
    kind,
    id: `autosave:${kind}`,
    name: "Working document",
    created: now(),
    updated: now(),
    doc,
  };
  return writeJson(autosaveKey(kind), env);
}

/* ------------------------------------------------------------ named drafts */

export function listDrafts(kind?: DraftKind): IndexRow[] {
  const rows = readJson<IndexRow[]>(INDEX_KEY) ?? [];
  if (!Array.isArray(rows)) return [];
  const filtered = kind ? rows.filter((r) => r && r.kind === kind) : rows;
  return filtered
    .filter((r): r is IndexRow => !!r && typeof r.id === "string")
    .sort((a, b) => (a.updated < b.updated ? 1 : -1));
}

function writeIndex(rows: IndexRow[]): StoreResult {
  return writeJson(INDEX_KEY, rows);
}

/** Save under a name. Pass `id` to overwrite an existing draft. */
export function saveDraft<T>(
  kind: DraftKind,
  name: string,
  doc: T,
  id?: string,
): StoreResult<IndexRow> {
  if (!available()) return { ok: false, reason: "unavailable" };
  const rows = listDrafts();
  const existing = id ? rows.find((r) => r.id === id) : undefined;
  const row: IndexRow = {
    id: existing?.id ?? newId(),
    kind,
    name: name.trim() || "Untitled draft",
    created: existing?.created ?? now(),
    updated: now(),
  };
  const env: Envelope<T> = { ...row, v: STORE_VERSION, doc };

  const wrote = writeJson(draftKey(kind, row.id), env);
  if (!wrote.ok) return wrote;

  const next = [row, ...rows.filter((r) => r.id !== row.id)];
  const indexed = writeIndex(next);
  if (!indexed.ok) return indexed;
  return { ok: true, value: row };
}

export function readDraft<T>(kind: DraftKind, id: string): T | null {
  return unwrap(readJson<Envelope<T>>(draftKey(kind, id)));
}

export function renameDraft(id: string, name: string): StoreResult {
  const rows = listDrafts();
  const row = rows.find((r) => r.id === id);
  if (!row) return { ok: false, reason: "corrupt" };

  const env = readJson<Envelope<unknown>>(draftKey(row.kind, id));
  const clean = name.trim() || row.name;
  if (env) writeJson(draftKey(row.kind, id), { ...env, name: clean, updated: now() });

  return writeIndex(rows.map((r) => (r.id === id ? { ...r, name: clean, updated: now() } : r)));
}

export function duplicateDraft(kind: DraftKind, id: string): StoreResult<IndexRow> {
  const row = listDrafts(kind).find((r) => r.id === id);
  const doc = readDraft<unknown>(kind, id);
  if (!row || doc === null) return { ok: false, reason: "corrupt" };
  return saveDraft(kind, `${row.name} copy`, doc);
}

export function deleteDraft(id: string): StoreResult {
  const rows = listDrafts();
  const row = rows.find((r) => r.id === id);
  if (typeof window !== "undefined" && row) {
    try {
      window.localStorage.removeItem(draftKey(row.kind, id));
    } catch {
      /* removing can only fail if storage is gone; the index write below reports it */
    }
  }
  return writeIndex(rows.filter((r) => r.id !== id));
}

/* --------------------------------------------------------------- raw + once */

export function writeRaw(key: string, value: unknown): StoreResult {
  return writeJson(key, value);
}

export function readRaw<T>(key: string): T | null {
  return readJson<T>(key);
}

/**
 * Read a key and delete it in the same breath.
 *
 * Used for the register → editor handoff: the payload must be consumed exactly
 * once, or every later visit to the editor would re-seed itself.
 */
export function readOnce<T>(key: string): T | null {
  const value = readJson<T>(key);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* nothing to do — the caller already has its value */
    }
  }
  return value;
}
