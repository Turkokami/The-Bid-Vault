"use client";

import { ReactNode } from "react";
import { InfoTip } from "@/components/info-tip";
import { describeNoticeType } from "@/lib/plain-language";

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

function FieldLabel({ children }: { children: ReactNode }) {
  return <label className="block space-y-2 text-sm text-slate-200">{children}</label>;
}

function LabelWithTip({
  label,
  tip,
}: {
  label: string;
  tip?: string;
}) {
  return (
    <span className="flex items-center gap-2">
      <span>{label}</span>
      {tip ? <InfoTip>{tip}</InfoTip> : null}
    </span>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  name,
  type = "text",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  name?: string;
  type?: string;
}) {
  return (
    <input
      name={name}
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20"
    />
  );
}

function CheckboxList({
  options,
  values,
  onToggle,
}: {
  options: Array<string | { label: string; value: string }>;
  values: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      {options.map((option) => {
        const value = typeof option === "string" ? option : option.value;
        const label = typeof option === "string" ? option : option.label;
        const checked = values.includes(value);
        return (
          <label
            key={value}
            className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.02] px-3 py-3 text-sm text-slate-200 transition hover:border-emerald-400/20 hover:bg-emerald-400/[0.04]"
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => onToggle(value)}
              className="mt-1 h-4 w-4 rounded border-white/20 bg-slate-950 text-emerald-400 focus:ring-emerald-300"
            />
            <span>{label}</span>
          </label>
        );
      })}
    </div>
  );
}

type FilterSidebarProps = {
  anyWords: string;
  allWords: string;
  exactPhrase: string;
  statuses: string[];
  noticeTypes: string[];
  departments: string[];
  subTiers: string[];
  offices: string[];
  states: string[];
  places: string[];
  naicsCodes: string[];
  pscCodes: string[];
  setAsides: string[];
  postedFrom: string;
  postedTo: string;
  responseFrom: string;
  responseTo: string;
  updatedFrom: string;
  updatedTo: string;
  options: {
    departments: string[];
    subTiers: string[];
    offices: string[];
    states: string[];
    places: string[];
    naicsCodes: string[];
    pscCodes: string[];
    setAsides: string[];
  };
  onAnyWordsChange: (value: string) => void;
  onAllWordsChange: (value: string) => void;
  onExactPhraseChange: (value: string) => void;
  onToggleStatus: (value: string) => void;
  onToggleNoticeType: (value: string) => void;
  onToggleDepartment: (value: string) => void;
  onToggleSubTier: (value: string) => void;
  onToggleOffice: (value: string) => void;
  onToggleState: (value: string) => void;
  onTogglePlace: (value: string) => void;
  onToggleNaics: (value: string) => void;
  onTogglePsc: (value: string) => void;
  onToggleSetAside: (value: string) => void;
  onPostedFromChange: (value: string) => void;
  onPostedToChange: (value: string) => void;
  onResponseFromChange: (value: string) => void;
  onResponseToChange: (value: string) => void;
  onUpdatedFromChange: (value: string) => void;
  onUpdatedToChange: (value: string) => void;
  children?: ReactNode;
};

export function FilterSidebar(props: FilterSidebarProps) {
  return (
    <aside className="sticky top-36 h-fit space-y-4 rounded-[2rem] border border-white/10 bg-slate-950/80 p-5 shadow-[0_16px_50px_rgba(0,0,0,0.35)] backdrop-blur">
      <div className="mb-2">
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">Narrow your results</p>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Use these filters to quickly find contracts that match your business.
        </p>
      </div>

      <Section title="Search words">
        <FieldLabel>
          <LabelWithTip
            label="Match any of these words"
            tip="Use this for a broad search. Example: pest control, wildlife, exclusion."
          />
          <Input value={props.anyWords} onChange={props.onAnyWordsChange} placeholder="Type what you do, like pest control or roofing" />
        </FieldLabel>
        <FieldLabel>
          <LabelWithTip
            label="Match all of these words"
            tip="Use this when every word must appear in the result."
          />
          <Input value={props.allWords} onChange={props.onAllWordsChange} placeholder="Example: federal service contract" />
        </FieldLabel>
        <FieldLabel>
          <LabelWithTip
            label="Match this exact phrase"
            tip="Use this when you want the result to contain one exact phrase."
          />
          <Input value={props.exactPhrase} onChange={props.onExactPhraseChange} placeholder='Example: "bird exclusion"' />
        </FieldLabel>
      </Section>

      <Section title="Opportunity status">
        <CheckboxList options={["Active", "Inactive"]} values={props.statuses} onToggle={props.onToggleStatus} />
      </Section>

      <Section title="Type of opportunity">
        <CheckboxList
          options={[
            { value: "Sources Sought", label: describeNoticeType("Sources Sought") },
            { value: "Solicitation", label: describeNoticeType("Solicitation") },
            { value: "Award", label: describeNoticeType("Award") },
            { value: "Presolicitation", label: describeNoticeType("Presolicitation") },
          ]}
          values={props.noticeTypes}
          onToggle={props.onToggleNoticeType}
        />
      </Section>

      <Section title="Government office">
        <FieldLabel>
          <LabelWithTip
            label="Government agency"
            tip="This is the main government organization offering the work."
          />
          <CheckboxList options={props.options.departments} values={props.departments} onToggle={props.onToggleDepartment} />
        </FieldLabel>
        <FieldLabel>
          <LabelWithTip
            label="Department"
            tip="This is the division inside the larger government agency."
          />
          <CheckboxList options={props.options.subTiers} values={props.subTiers} onToggle={props.onToggleSubTier} />
        </FieldLabel>
        <FieldLabel>
          <LabelWithTip
            label="Office"
            tip="This is the specific office handling the contract."
          />
          <CheckboxList options={props.options.offices} values={props.offices} onToggle={props.onToggleOffice} />
        </FieldLabel>
      </Section>

      <Section title="Work location">
        <FieldLabel>
          <span>State</span>
          <CheckboxList options={props.options.states} values={props.states} onToggle={props.onToggleState} />
        </FieldLabel>
        <FieldLabel>
          <LabelWithTip
            label="Work location"
            tip="This is where the work will be done."
          />
          <CheckboxList options={props.options.places} values={props.places} onToggle={props.onTogglePlace} />
        </FieldLabel>
      </Section>

      <Section title="Work type">
        <FieldLabel>
          <LabelWithTip
            label="Industry Type (NAICS Code)"
            tip="This is the industry classification the government uses to describe the type of work."
          />
          <CheckboxList options={props.options.naicsCodes} values={props.naicsCodes} onToggle={props.onToggleNaics} />
        </FieldLabel>
        <FieldLabel>
          <LabelWithTip
            label="Service Category (PSC Code)"
            tip="This describes the specific type of service or product the contract is for."
          />
          <CheckboxList options={props.options.pscCodes} values={props.pscCodes} onToggle={props.onTogglePsc} />
        </FieldLabel>
        <FieldLabel>
          <LabelWithTip
            label="Reserved for Small Businesses?"
            tip="This shows whether the government limited this opportunity to certain business types."
          />
          <CheckboxList options={props.options.setAsides} values={props.setAsides} onToggle={props.onToggleSetAside} />
        </FieldLabel>
      </Section>

      <Section title="Important dates">
        <div className="grid gap-3">
          <FieldLabel>
            <LabelWithTip
              label="Posted date"
              tip="This is when the opportunity first appeared."
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input type="date" value={props.postedFrom} onChange={props.onPostedFromChange} />
              <Input type="date" value={props.postedTo} onChange={props.onPostedToChange} />
            </div>
          </FieldLabel>
          <FieldLabel>
            <LabelWithTip
              label="Response deadline"
              tip="This is the deadline to submit your bid or response."
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input type="date" value={props.responseFrom} onChange={props.onResponseFromChange} />
              <Input type="date" value={props.responseTo} onChange={props.onResponseToChange} />
            </div>
          </FieldLabel>
          <FieldLabel>
            <LabelWithTip
              label="Updated date"
              tip="This is the last time the government changed the posting."
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input type="date" value={props.updatedFrom} onChange={props.onUpdatedFromChange} />
              <Input type="date" value={props.updatedTo} onChange={props.onUpdatedToChange} />
            </div>
          </FieldLabel>
        </div>
      </Section>

      <Section title="Other">
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-4 text-sm text-slate-400">
          More filters, like contract value and advanced small-business rules, can be added here later.
        </div>
      </Section>

      {props.children}
    </aside>
  );
}
