"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/design-system/components/core/Badge";
import { Button } from "@/design-system/components/core/Button";
import { Dialog } from "@/design-system/components/core/Dialog";
import { Input } from "@/design-system/components/forms/Input";
import {
  available,
  deleteDraft,
  duplicateDraft,
  listDrafts,
  quotaExhausted,
  readDraft,
  renameDraft,
  saveDraft,
  type DraftKind,
  type IndexRow,
} from "@/lib/store";
import styles from "./drafts.module.css";

export interface DraftsDialogProps<T> {
  kind: DraftKind;
  /** The working document, offered for saving under a name. */
  current: T;
  /** A suggested name, usually derived from the piece's own headline. */
  suggestedName: string;
  onOpen: (doc: T) => void;
  onClose: () => void;
}

/**
 * The drafts shelf.
 *
 * A register, not a table of boxes: each row is opened by a hairline, indexed
 * by a mono number, and acted on with plain text buttons. No icons — the system
 * names things rather than pictogramming them.
 *
 * Everything is kept in this browser. There is no account and no sync.
 */
export function DraftsDialog<T>({
  kind,
  current,
  suggestedName,
  onOpen,
  onClose,
}: DraftsDialogProps<T>) {
  const [rows, setRows] = useState<IndexRow[]>([]);
  const [name, setName] = useState(suggestedName);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameTo, setRenameTo] = useState("");
  const [confirming, setConfirming] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [canStore, setCanStore] = useState(true);

  const refresh = useCallback(() => setRows(listDrafts(kind)), [kind]);

  useEffect(() => {
    setCanStore(available());
    refresh();
  }, [refresh]);

  const save = () => {
    const result = saveDraft(kind, name, current);
    if (result.ok) {
      setMessage(`Saved as “${result.value.name}”.`);
      refresh();
    } else {
      setMessage(
        result.reason === "quota"
          ? "Not saved — this browser's storage is full."
          : "Not saved — this browser will not store anything.",
      );
    }
  };

  const open = (id: string) => {
    const doc = readDraft<T>(kind, id);
    if (!doc) {
      setMessage("That draft could not be read. It was written by an older version.");
      return;
    }
    onOpen(doc);
  };

  const label = kind === "post" ? "piece" : "carousel";

  return (
    <Dialog
      callNumber="OKW · DRAFTS"
      title="Drafts"
      description={`Kept in this browser. Nothing is uploaded. ${rows.length} saved.`}
      width="640px"
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="mark" onClick={save} disabled={!canStore || quotaExhausted()}>
            Save this {label}
          </Button>
        </>
      }
    >
      <div className={styles.wrap}>
        <label className={styles.saveRow}>
          <span className={styles.label}>Name</span>
          <Input
            size="sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Untitled draft"
          />
        </label>

        {!canStore && (
          <Badge tone="unknown">This browser will not store anything — drafts are unavailable.</Badge>
        )}
        {message && <span className={styles.message}>{message}</span>}

        <div className={styles.list}>
          <span className={styles.label}>Saved</span>
          {rows.length === 0 && (
            <p className={styles.empty}>
              Nothing saved yet. Save the piece you are working on and it will be here after a
              reload.
            </p>
          )}

          {rows.map((row, i) => (
            <div key={row.id} className={styles.row}>
              <span className={styles.num}>{String(i + 1).padStart(2, "0")}</span>

              <div className={styles.body}>
                {renaming === row.id ? (
                  <Input
                    size="sm"
                    value={renameTo}
                    onChange={(e) => setRenameTo(e.target.value)}
                    aria-label={`Rename ${row.name}`}
                  />
                ) : (
                  <span className={styles.name}>{row.name}</span>
                )}
                <span className={styles.meta}>
                  {new Date(row.updated).toLocaleDateString()} ·{" "}
                  {new Date(row.updated).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <div className={styles.actions}>
                {renaming === row.id ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        renameDraft(row.id, renameTo);
                        setRenaming(null);
                        refresh();
                      }}
                    >
                      Save name
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setRenaming(null)}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => open(row.id)}>
                      Open
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setRenaming(row.id);
                        setRenameTo(row.name);
                      }}
                    >
                      Rename
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        duplicateDraft(kind, row.id);
                        refresh();
                      }}
                    >
                      Duplicate
                    </Button>
                    {/* Two-press confirm rather than a second dialog. */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirming === row.id) {
                          deleteDraft(row.id);
                          setConfirming(null);
                          refresh();
                        } else {
                          setConfirming(row.id);
                        }
                      }}
                      onBlur={() => setConfirming((c) => (c === row.id ? null : c))}
                    >
                      {confirming === row.id ? "Delete?" : "Delete"}
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Dialog>
  );
}
