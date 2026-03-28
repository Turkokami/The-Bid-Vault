"use client";

import { ReactNode } from "react";
import { InfoTip } from "@/components/info-tip";

function Section({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-white marker:hidden">
        {title}
        <span className="text-xs text-emerald-300 transition group-open:rotate-45">+</span>
      </summary>
      <div className="mt-4 space-y-3">{children}</div>
    </details>
  );
}

function CheckboxList({
  options,
  values,
  onToggle,
}: {
  options: string[];
  values: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      {options.map((option) => {
        const checked = values.includes(option);
        return (
          <label
            key={option}
            className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.02] px-3 py-3 text-sm text-slate-200 transition hover:border-emerald-400/20 hover:bg-emerald-400/[0.04]"
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => onToggle(option)}
              className="mt-1 h-4 w-4 rounded border-white/20 bg-slate-950 text-emerald-400 focus:ring-emerald-300"
            />
            <span>{option}</span>
          </label>
        );
      })}
    </div>
  );
}

function Field({
  label,
  tip,
  children,
}: {
  label: string;
  tip?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-2 text-sm text-slate-200">
      <span className="flex items-center gap-2">
        <span>{label}</span>
        {tip ? <InfoTip>{tip}</InfoTip> : null}
      </span>
      {children}
    </label>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20"
    />
  );
}

type Props = {
  keywords: string;
  states: string[];
  sources: string[];
  opportunityTypes: string[];
  entities: string[];
  statuses: string[];
  categoryCodes: string[];
  registration: string[];
  dueFrom: string;
  dueTo: string;
  options: {
    states: string[];
    sources: string[];
    opportunityTypes: string[];
    entities: string[];
    statuses: string[];
    categoryCodes: string[];
  };
  onKeywordsChange: (value: string) => void;
  onToggleState: (value: string) => void;
  onToggleSource: (value: string) => void;
  onToggleOpportunityType: (value: string) => void;
  onToggleEntity: (value: string) => void;
  onToggleStatus: (value: string) => void;
  onToggleCategoryCode: (value: string) => void;
  onToggleRegistration: (value: string) => void;
  onDueFromChange: (value: string) => void;
  onDueToChange: (value: string) => void;
  children?: ReactNode;
};

export function StateLocalFilterSidebar(props: Props) {
  return (
    <aside className="sticky top-36 h-fit space-y-4 rounded-[2rem] border border-white/10 bg-slate-950/80 p-5 shadow-[0_16px_50px_rgba(0,0,0,0.35)] backdrop-blur">
      <div className="mb-2">
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">Narrow your results</p>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Use these filters to quickly find state and local contracts that match your business.
        </p>
      </div>

      <Section title="Search words">
        <Field
          label="What should we search for?"
          tip="Type what your business does. Example: pest control, roofing, janitorial, landscaping."
        >
          <TextInput
            value={props.keywords}
            onChange={props.onKeywordsChange}
            placeholder="Type words like pest control or wildlife exclusion"
          />
        </Field>
      </Section>

      <Section title="Where this came from">
        <Field label="State">
          <CheckboxList options={props.options.states} values={props.states} onToggle={props.onToggleState} />
        </Field>
        <Field
          label="Source system"
          tip="This is the original portal or feed where the opportunity was found."
        >
          <CheckboxList options={props.options.sources} values={props.sources} onToggle={props.onToggleSource} />
        </Field>
      </Section>

      <Section title="Type of opportunity">
        <CheckboxList
          options={props.options.opportunityTypes}
          values={props.opportunityTypes}
          onToggle={props.onToggleOpportunityType}
        />
      </Section>

      <Section title="Who posted this">
        <CheckboxList
          options={props.options.entities}
          values={props.entities}
          onToggle={props.onToggleEntity}
        />
      </Section>

      <Section title="Status">
        <CheckboxList
          options={props.options.statuses}
          values={props.statuses}
          onToggle={props.onToggleStatus}
        />
      </Section>

      <Section title="Work type">
        <Field
          label="Work Category Code"
          tip="This is the category code the source system uses to group the type of work."
        >
          <CheckboxList
            options={props.options.categoryCodes}
            values={props.categoryCodes}
            onToggle={props.onToggleCategoryCode}
          />
        </Field>
      </Section>

      <Section title="Important dates">
        <Field label="Due date from">
          <TextInput type="date" value={props.dueFrom} onChange={props.onDueFromChange} />
        </Field>
        <Field label="Due date to">
          <TextInput type="date" value={props.dueTo} onChange={props.onDueToChange} />
        </Field>
      </Section>

      <Section title="Before you bid">
        <Field
          label="Need to register before bidding?"
          tip="Some source systems require registration before you can submit a bid."
        >
          <CheckboxList
            options={["yes", "no"]}
            values={props.registration}
            onToggle={props.onToggleRegistration}
          />
        </Field>
      </Section>

      {props.children}
    </aside>
  );
}
