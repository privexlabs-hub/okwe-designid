"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/design-system/components/core/Badge";
import { Button } from "@/design-system/components/core/Button";
import { Tag } from "@/design-system/components/core/Tag";
import { Field } from "@/design-system/components/forms/Field";
import { Input } from "@/design-system/components/forms/Input";
import { Select } from "@/design-system/components/forms/Select";
import { Switch } from "@/design-system/components/forms/Switch";
import { Tally } from "@/design-system/components/notation/Tally";
import {
  COSTS,
  REGISTER_INTRO,
  REGISTER_SEED,
  SOURCES,
  costLabel,
  priority,
} from "@/content/register";
import type { Cost, Question, QuestionSource } from "@/content/register";
import { HANDOFF_KEY, REGISTER_KEY, available, readRaw, writeRaw } from "@/lib/store";
import s from "./register.module.css";

type SourceFilter = "All" | QuestionSource;
type AnswerFilter = "All" | "Answerable" | "Not yet";

const SOURCE_FILTERS: SourceFilter[] = ["All", ...SOURCES];
const ANSWER_FILTERS: AnswerFilter[] = ["All", "Answerable", "Not yet"];

/** The tally is a fixed twelve-square block; the count is clamped into it.
 *  Tally renders `total` spans unconditionally, so an unclamped count would
 *  emit hundreds of nodes. */
const TALLY_TOTAL = 12;

const todayISO = () => new Date().toISOString().slice(0, 10);

const newId = () => `q-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

function byPriority(a: Question, b: Question) {
  const d = priority(b) - priority(a);
  if (d !== 0) return d;
  if (b.count !== a.count) return b.count - a.count;
  return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
}

/** A filter chip: the Tag skin inside a real button, so it is a real control. */
function Chip({
  on,
  onPress,
  children,
}: {
  on: boolean;
  onPress: () => void;
  children: string;
}) {
  return (
    <button type="button" className={s.chip} aria-pressed={on} onClick={onPress}>
      <Tag selected={on} style={{ textTransform: "uppercase" }}>
        {children}
      </Tag>
    </button>
  );
}

interface RowProps {
  q: Question;
  onChange: (id: string, patch: Partial<Question>) => void;
  onDelete: (id: string) => void;
  onPromote: (q: Question) => void;
  canPromote: boolean;
}

function Row({ q, onChange, onDelete, onPromote, canPromote }: RowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(q.text);
  const [armed, setArmed] = useState(false);

  return (
    <article className={s.row}>
      <div className={s.rail}>
        <span className={s.priority} title="frequency × cost of getting it wrong">
          {priority(q)}
        </span>
        <span className={s.priorityLabel}>
          {q.source} · {costLabel(q.cost)}
        </span>
      </div>

      <div className={s.field}>
        {editing ? (
          <>
            <Input
              multiline
              rows={2}
              value={draft}
              aria-label="Edit the question"
              onChange={(e) => setDraft(e.target.value)}
            />
            <div className={s.actions}>
              <Button
                variant="mark"
                size="sm"
                onClick={() => {
                  const text = draft.trim();
                  if (!text) return;
                  onChange(q.id, { text });
                  setEditing(false);
                }}
              >
                Save
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDraft(q.text);
                  setEditing(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <p className={s.question}>{q.text}</p>
        )}

        {q.note && !editing && <p className={s.note}>{q.note}</p>}

        <div className={s.tallyRow}>
          <Tally
            filled={Math.min(q.count, TALLY_TOTAL)}
            total={TALLY_TOTAL}
            rows={2}
            unit="9px"
          />
          <span className={s.mono}>×{q.count}</span>
        </div>

        {!editing && (
          <div className={s.actions}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange(q.id, { count: q.count + 1 })}
            >
              +1 occurrence
            </Button>
            <Switch
              checked={q.answerable}
              onChange={(e) => onChange(q.id, { answerable: e.target.checked })}
              label="Answerable with evidence"
            />
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (!armed) {
                  setArmed(true);
                  return;
                }
                onDelete(q.id);
              }}
            >
              {armed ? "Delete?" : "Delete"}
            </Button>
            <Button
              variant="mark"
              size="sm"
              disabled={!canPromote}
              onClick={() => canPromote && onPromote(q)}
            >
              Promote to draft
            </Button>
          </div>
        )}
      </div>

      <div className={s.margin}>
        <span className={s.marginLine}>Arrived {q.date}</span>
        <span className={s.marginLine}>
          {q.count} {q.count === 1 ? "occurrence" : "occurrences"}
        </span>
        <span>
          <Badge tone={q.answerable ? "fact" : "unknown"}>
            {q.answerable ? "Answerable" : "Not yet"}
          </Badge>
        </span>
      </div>
    </article>
  );
}

/** OKW-REG-01 — the question register. */
export function Register() {
  const router = useRouter();
  const [qs, setQs] = useState<Question[]>(REGISTER_SEED);
  const [source, setSource] = useState<SourceFilter>("All");
  const [answer, setAnswer] = useState<AnswerFilter>("All");
  const [canStore, setCanStore] = useState(true);

  const [text, setText] = useState("");
  const [newSource, setNewSource] = useState<QuestionSource>("Comment");
  const [date, setDate] = useState("");
  const [cost, setCost] = useState<Cost>(2);
  const [answerable, setAnswerable] = useState(false);
  const [invalid, setInvalid] = useState(false);

  const hydrated = useRef(false);

  // Never seed useState from storage — under static export the server-rendered
  // HTML would not match. Read on mount instead.
  useEffect(() => {
    setCanStore(available());
    setDate(todayISO());
    const saved = readRaw<{ questions: Question[] }>(REGISTER_KEY);
    if (saved && Array.isArray(saved.questions)) {
      setQs(saved.questions);
    } else {
      writeRaw(REGISTER_KEY, { questions: REGISTER_SEED });
    }
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    const id = setTimeout(() => writeRaw(REGISTER_KEY, { questions: qs }), 600);
    return () => clearTimeout(id);
  }, [qs]);

  const onChange = useCallback((id: string, patch: Partial<Question>) => {
    setQs((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  }, []);

  const onDelete = useCallback((id: string) => {
    setQs((prev) => prev.filter((q) => q.id !== id));
  }, []);

  const onPromote = useCallback(
    (q: Question) => {
      writeRaw(HANDOFF_KEY, {
        kind: "post",
        seed: { title: q.text, eyebrow: "The question", date: todayISO() },
      });
      router.push("/post-editor/?seed=register");
    },
    [router],
  );

  const add = useCallback(() => {
    const clean = text.trim();
    if (!clean) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    setQs((prev) => [
      ...prev,
      {
        id: newId(),
        text: clean,
        source: newSource,
        date: date || todayISO(),
        count: 1,
        answerable,
        cost,
      },
    ]);
    setText("");
    setAnswerable(false);
  }, [text, newSource, date, cost, answerable]);

  const shown = qs
    .filter((q) => (source === "All" ? true : q.source === source))
    .filter((q) =>
      answer === "All" ? true : answer === "Answerable" ? q.answerable : !q.answerable,
    )
    .sort(byPriority);

  return (
    <main className={s.page}>
      <header className={s.header}>
        <Link href="/" className={`okwe-block-link ${s.back}`}>
          ← Operating system
        </Link>
        <span className={s.eyebrow}>
          {REGISTER_INTRO.code} · Question register
        </span>
        <h1>{REGISTER_INTRO.title}</h1>
        <p className={s.lede}>{REGISTER_INTRO.lede}</p>
        <span className={s.mono}>{REGISTER_INTRO.foot}</span>
      </header>

      <aside className={s.aside}>
        <span className={s.asideHead}>Cost of getting it wrong</span>
        <p className={s.formula}>priority = frequency × cost of getting it wrong</p>
        <div className={s.scale}>
          {COSTS.map((c) => (
            <div key={c.value} className={s.scaleItem}>
              <span className={s.scaleValue}>
                {c.value} · {c.label}
              </span>
              <span className={s.scaleNote}>{c.note}</span>
            </div>
          ))}
        </div>
      </aside>

      <section className={s.section}>
        <h2 className={s.h2}>The register</h2>

        <div className={s.filters}>
          <div role="group" aria-label="Filter by source" className={s.filterGroup}>
            {SOURCE_FILTERS.map((f) => (
              <Chip key={f} on={source === f} onPress={() => setSource(f)}>
                {f}
              </Chip>
            ))}
          </div>
          <div role="group" aria-label="Filter by answerability" className={s.filterGroup}>
            {ANSWER_FILTERS.map((f) => (
              <Chip key={f} on={answer === f} onPress={() => setAnswer(f)}>
                {f}
              </Chip>
            ))}
          </div>
          <span className={`okwe-source ${s.count}`} aria-live="polite">
            {shown.length} of {qs.length} questions
          </span>
        </div>

        {!canStore && (
          <p className={`okwe-source ${s.mono}`}>
            This browser will not let a page store anything, so edits last until you reload and
            Promote to draft is disabled — the editor is handed its seed through storage.
          </p>
        )}

        <div className={s.rows}>
          {shown.map((q) => (
            <Row
              key={q.id}
              q={q}
              onChange={onChange}
              onDelete={onDelete}
              onPromote={onPromote}
              canPromote={canStore}
            />
          ))}
          {shown.length === 0 && (
            <p className={`okwe-source ${s.mono}`}>No question in the register matches.</p>
          )}
        </div>
      </section>

      <section className={s.section}>
        <h2 className={s.h2}>Log a question</h2>
        <div className={s.form}>
          <Field
            className={s.formWide}
            index={1}
            label="The question"
            required
            error={invalid ? "A question has to have words in it." : undefined}
            hint="In the reader's words, not ours."
          >
            <Input
              multiline
              rows={2}
              value={text}
              invalid={invalid}
              placeholder="What did they actually ask?"
              onChange={(e) => {
                setText(e.target.value);
                if (invalid) setInvalid(false);
              }}
            />
          </Field>

          <Field index={2} label="Where it came from">
            <Select
              value={newSource}
              options={[...SOURCES]}
              onChange={(e) => setNewSource(e.target.value as QuestionSource)}
            />
          </Field>

          <Field index={3} label="The date">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>

          <Field
            className={s.formWide}
            index={4}
            label="Cost of getting it wrong"
            hint={COSTS.find((c) => c.value === cost)?.note}
          >
            <Select
              value={String(cost)}
              options={COSTS.map((c) => ({
                value: String(c.value),
                label: `${c.value} · ${c.label} — ${c.note}`,
              }))}
              onChange={(e) => setCost(Number(e.target.value) as Cost)}
            />
          </Field>

          <div className={s.formWide}>
            <Switch
              checked={answerable}
              onChange={(e) => setAnswerable(e.target.checked)}
              label="We can answer it with evidence"
            />
          </div>

          <div className={s.formWide}>
            <Button variant="mark" onClick={add}>
              Log it
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
