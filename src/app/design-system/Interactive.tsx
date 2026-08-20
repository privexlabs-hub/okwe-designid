"use client";

import { useState } from "react";
import { Button } from "@/design-system/components/core/Button";
import { Dialog } from "@/design-system/components/core/Dialog";
import { IconButton } from "@/design-system/components/core/IconButton";
import { Tabs } from "@/design-system/components/core/Tabs";
import { Tag } from "@/design-system/components/core/Tag";
import { Tooltip } from "@/design-system/components/core/Tooltip";
import { Checkbox } from "@/design-system/components/forms/Checkbox";
import { Field } from "@/design-system/components/forms/Field";
import { Input } from "@/design-system/components/forms/Input";
import { Radio } from "@/design-system/components/forms/Radio";
import { Select } from "@/design-system/components/forms/Select";
import { Switch } from "@/design-system/components/forms/Switch";
import { Tally } from "@/design-system/components/notation/Tally";

const row = {
  display: "flex",
  flexWrap: "wrap" as const,
  alignItems: "center",
  gap: "var(--space-6)",
};

const stack = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "var(--space-5)",
};

/** Tabs, driven by real state so a broken selection is visible immediately. */
export function TabsSpecimen() {
  const [register, setRegister] = useState("fact");
  const [block, setBlock] = useState("all");
  return (
    <div style={stack}>
      <Tabs
        items={[
          { id: "fact", label: "Fact", count: 12 },
          { id: "interpretation", label: "Interpretation", count: 4 },
          { id: "unknown", label: "Unknown" },
        ]}
        value={register}
        onChange={setRegister}
      />
      <Tabs
        variant="block"
        items={[
          { id: "all", label: "All" },
          { id: "desk", label: "The Trade Desk" },
          { id: "notes", label: "Field Notes" },
        ]}
        value={block}
        onChange={setBlock}
      />
      <span className="okwe-source">
        selected · register={register} · block={block}
      </span>
    </div>
  );
}

export function DialogSpecimen() {
  const [open, setOpen] = useState(false);
  return (
    <div style={row}>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open the dialog
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        callNumber="OKW·DS/01"
        title="Withdraw this entry"
        description="The entry stays in the register; only its published state changes."
        footer={
          <div style={{ display: "flex", gap: "var(--space-4)", marginLeft: "auto" }}>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="mark" size="sm" onClick={() => setOpen(false)}>
              Withdraw
            </Button>
          </div>
        }
      >
        <p style={{ font: "var(--type-body)", margin: 0, color: "var(--text-body)" }}>
          Click the scrim, or either footer control, to close. If this dialog cannot be
          dismissed the specimen has failed.
        </p>
      </Dialog>
    </div>
  );
}

export function TooltipSpecimen() {
  return (
    <div style={row}>
      <Tooltip label="Sourced · 2026-04">
        <Button variant="outline" size="sm">
          Hover or focus me (top)
        </Button>
      </Tooltip>
      <Tooltip label="Opens below" placement="bottom">
        <Button variant="ghost" size="sm">
          Hover or focus me (bottom)
        </Button>
      </Tooltip>
    </div>
  );
}

export function TagSpecimen() {
  const [tags, setTags] = useState(["Trade", "Logistics", "Tariffs"]);
  const [selected, setSelected] = useState("Trade");
  return (
    <div style={stack}>
      <div style={row}>
        {tags.map((t) => (
          <Tag key={t} selected={selected === t} onClick={() => setSelected(t)}>
            {t}
          </Tag>
        ))}
      </div>
      <div style={row}>
        {tags.map((t) => (
          <Tag key={t} removable onRemove={() => setTags(tags.filter((x) => x !== t))}>
            {t}
          </Tag>
        ))}
        {tags.length === 0 && (
          <Button variant="link" onClick={() => setTags(["Trade", "Logistics", "Tariffs"])}>
            Restore the tags
          </Button>
        )}
      </div>
    </div>
  );
}

export function IconButtonSpecimen() {
  const [selected, setSelected] = useState(false);
  return (
    <div style={row}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <IconButton key={size} label={`Ghost ${size}`} size={size}>
          ×
        </IconButton>
      ))}
      <IconButton label="Solid" variant="solid">
        ↓
      </IconButton>
      <IconButton label="Outline" variant="outline">
        ↑
      </IconButton>
      <IconButton
        label="Toggle selection"
        variant="outline"
        selected={selected}
        onClick={() => setSelected((s) => !s)}
      >
        ●
      </IconButton>
      <IconButton label="Disabled" variant="outline" disabled>
        ✕
      </IconButton>
    </div>
  );
}

export function FormsSpecimen() {
  const [title, setTitle] = useState("Why the port queue is a pricing signal");
  const [note, setNote] = useState("A working note, still unsourced.");
  const [series, setSeries] = useState("field-notes");
  const [checks, setChecks] = useState({ sourced: true, reviewed: false });
  const [klass, setKlass] = useState("fact");
  const [published, setPublished] = useState(false);

  return (
    <div style={{ display: "grid", gap: "var(--space-8)", gridTemplateColumns: "repeat(auto-fit,minmax(min(280px,100%),1fr))" }}>
      <div style={stack}>
        <Field label="Entry title" index="01" htmlFor="ds-title" required hint="Sentence case, no full stop.">
          <Input
            id="ds-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            prefix="FN·004"
          />
        </Field>
        <Field label="Invalid state" index="02" htmlFor="ds-invalid" error="A source is required.">
          <Input id="ds-invalid" invalid value="" readOnly />
        </Field>
        <Field label="Working note" index="03" htmlFor="ds-note">
          <Input
            multiline
            id="ds-note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </Field>
        <div style={row}>
          <Input size="sm" defaultValue="Small" />
          <Input size="md" defaultValue="Medium" />
          <Input size="lg" defaultValue="Large" />
        </div>
      </div>

      <div style={stack}>
        <Field label="Series" index="04" htmlFor="ds-series">
          <Select
            id="ds-series"
            value={series}
            onChange={(e) => setSeries(e.target.value)}
            options={[
              { value: "field-notes", label: "Field Notes" },
              { value: "trade-desk", label: "The Trade Desk" },
              { value: "numbers", label: "Numbers" },
            ]}
          />
        </Field>
        <Field label="Checks" index="05">
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <Checkbox
              label="Sourced"
              checked={checks.sourced}
              onChange={(e) => setChecks({ ...checks, sourced: e.target.checked })}
            />
            <Checkbox
              label="Reviewed"
              checked={checks.reviewed}
              onChange={(e) => setChecks({ ...checks, reviewed: e.target.checked })}
            />
            <Checkbox label="Indeterminate" indeterminate checked={false} readOnly />
            <Checkbox label="Disabled" disabled checked readOnly />
          </div>
        </Field>
        <Field label="Classification" index="06">
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {[
              { value: "fact", label: "Fact", description: "Sourced and checked." },
              { value: "interpretation", label: "Interpretation", description: "Our reading of the sources." },
              { value: "opinion", label: "Opinion", description: "Our view, stated as such." },
            ].map((o) => (
              <Radio
                key={o.value}
                name="ds-class"
                value={o.value}
                label={o.label}
                description={o.description}
                checked={klass === o.value}
                onChange={() => setKlass(o.value)}
              />
            ))}
          </div>
        </Field>
        <Field label="State" index="07">
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <Switch
              label={published ? "Published" : "Held"}
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
            />
            <Switch label="Disabled" disabled checked readOnly />
          </div>
        </Field>
        <span className="okwe-source">
          state · series={series} · sourced={String(checks.sourced)} · class={klass} ·
          published={String(published)}
        </span>
      </div>
    </div>
  );
}

/** Tally is a client component in its own right; `animate` is only exercised here. */
export function TallySpecimen() {
  return (
    <div style={row}>
      <Tally filled={62} total={100} label="62 of 100 entries sourced" />
      <Tally filled={18} total={40} rows={4} label="18 of 40 · four rows" />
      <Tally filled={74} total={100} animate label="74 of 100 · animated on mount" />
    </div>
  );
}
