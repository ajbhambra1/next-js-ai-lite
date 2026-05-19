"use client";

import { useState, type ReactNode } from "react";

const SURVEY_OPTIONS = [
  "Patient waiting time in the waiting room",
  "Number of patient waiting at any given time",
  "Decontamination room turnaround time",
  "Whether reception is consistently staffed during opening hours",
  "Duration and frequency of calls taken by reception",
  "Time from patient arrival to first contact with reception",
  "Time from patient finishing appointment to contact and payment with reception",
  "Average appointment time overrun by clinician",
  "Per-staff-member daily activity summaries",
  "Visible patient anxiety in the waiting area before treatment",
  "Footfall patterns by hour/daily/weekly",
  "Daily evidence I could show CQC during an inspection",
  "Side-by-side comparison across my different practices (multi-site owners only)",
];

const PRACTICES_OPTIONS = ["1", "2–3", "4–9", "10+"];

const COST_OPTIONS = ["Under £500", "£500 – £2,000", "£2,000 – £5,000", "£5,000+"];

function CheckIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
      <path
        d="M2 5.5 L4.5 8 L9 3"
        stroke="#0A0B0D"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-start gap-3 py-2.5 cursor-pointer group">
      <span className={`check-box mt-0.5 ${checked ? "checked" : ""}`}>
        <CheckIcon />
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
        aria-label={label}
      />
      <span className="text-[15px] text-ink/90 leading-snug group-hover:text-ink transition-colors">
        {label}
      </span>
    </label>
  );
}

function RadioRow({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-active={active}
      className="radio-row w-full text-left px-4 py-3.5 border hairline flex items-center gap-3 hover:border-[#2A2E35]"
    >
      <span
        className="w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center"
        style={{ borderColor: active ? "#00E5A0" : "#2A2E35" }}
      >
        {active && <span className="w-2 h-2 rounded-full bg-mint" />}
      </span>
      <span className="text-[15px] text-ink/90">{label}</span>
    </button>
  );
}

function ErrorMsg({ show, children }: { show: boolean; children: ReactNode }) {
  if (!show) return null;
  return <div className="label-mono text-[10px] text-warn mt-4">{children}</div>;
}

function Card({
  title,
  subtitle,
  children,
  id,
  required,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  id: string;
  required?: boolean;
}) {
  return (
    <div id={id} className="bg-surface border hairline p-6 md:p-8 scroll-mt-24">
      <div className="label-mono text-[11px] text-mint mb-1" style={{ fontSize: "15px" }}>
        {title}
        {required && (
          <span aria-hidden="true" className="text-warn ml-1">
            *
          </span>
        )}
      </div>
      {subtitle && (
        <div className="text-[14px] text-mute mb-5 mt-2 leading-relaxed">{subtitle}</div>
      )}
      <div className={subtitle ? "" : "mt-4"}>{children}</div>
    </div>
  );
}

export default function Survey() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [practice, setPractice] = useState("");
  const [practicesOwned, setPracticesOwned] = useState("");
  const [bothered, setBothered] = useState("");
  const [wishKnew, setWishKnew] = useState("");
  const [useful, setUseful] = useState<Set<string>>(new Set());
  const [noneOf, setNoneOf] = useState(false);
  const [mostImportant, setMostImportant] = useState<string | null>(null);
  const [monthlyCost, setMonthlyCost] = useState<string | null>(null);
  const [missing, setMissing] = useState("");
  const [pilot, setPilot] = useState<"yes" | "no" | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  function toggleUseful(opt: string) {
    setNoneOf(false);
    setUseful((prev) => {
      const next = new Set(prev);
      if (next.has(opt)) next.delete(opt);
      else next.add(opt);
      return next;
    });
  }

  function toggleNone() {
    setNoneOf((v) => {
      const nv = !v;
      if (nv) setUseful(new Set());
      return nv;
    });
  }

  function firstIncompleteId(): string | null {
    if (!name.trim() || !email.trim() || !phone.trim() || !practice.trim() || !practicesOwned) return "q01";
    if (!bothered.trim()) return "q02";
    if (!wishKnew.trim()) return "q03";
    if (useful.size === 0 && !noneOf) return "q04";
    if (!mostImportant) return "q05";
    if (!monthlyCost) return "q07";
    if (!pilot) return "q08";
    return null;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTouched(true);
    const firstBad = firstIncompleteId();
    if (firstBad) {
      const el = document.getElementById(firstBad);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: "smooth" });
      }
      return;
    }
    const payload = {
      name,
      email,
      phone,
      practice,
      practicesOwned,
      bothered,
      wishKnew,
      useful: noneOf ? ["__none__"] : Array.from(useful),
      mostImportant,
      monthlyCost,
      missing,
      pilot,
      ts: new Date().toISOString(),
    };

    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/submit-survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok || !result.ok) {
        throw new Error(result.error || `HTTP ${res.status}`);
      }
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Submission failed");
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="bg-surface border hairline px-8 py-14 text-center max-w-[640px] mx-auto">
        <div className="w-2.5 h-2.5 rounded-full bg-mint mint-pulse mx-auto mb-6" aria-hidden="true" />
        <div className="text-[22px] md:text-[26px] h-tight font-semibold mb-3 leading-snug">
          Thanks — we&apos;ll be in touch within 5 working days.
        </div>
        <div className="label-mono text-[11px] text-mute mt-6">RESPONSE LOGGED</div>
      </div>
    );
  }

  const missingContact =
    touched && (!name.trim() || !email.trim() || !phone.trim() || !practice.trim() || !practicesOwned);

  return (
    <form onSubmit={handleSubmit} className="max-w-[640px] mx-auto space-y-6">
      <Card id="q01" required title="01 · ABOUT YOU">
        <div className="space-y-5">
          <div>
            <label htmlFor="f-name" className="label-mono text-[10px] text-mute block mb-1">
              FULL NAME
            </label>
            <input
              id="f-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div>
            <label htmlFor="f-email" className="label-mono text-[10px] text-mute block mb-1">
              WORK EMAIL
            </label>
            <input
              id="f-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@practice.co.uk"
            />
          </div>
          <div>
            <label htmlFor="f-phone-contact" className="label-mono text-[10px] text-mute block mb-1">
              PHONE NUMBER
            </label>
            <input
              id="f-phone-contact"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+44 …"
            />
          </div>
          <div>
            <label htmlFor="f-practice" className="label-mono text-[10px] text-mute block mb-1">
              PRACTICE NAME
            </label>
            <input
              id="f-practice"
              type="text"
              required
              value={practice}
              onChange={(e) => setPractice(e.target.value)}
              placeholder="e.g. Bloom Dental"
            />
          </div>
          <div>
            <label className="label-mono text-[10px] text-mute block mb-2">
              NUMBER OF PRACTICES OWNED
            </label>
            <div className="grid grid-cols-4 gap-2">
              {PRACTICES_OPTIONS.map((opt) => {
                const active = practicesOwned === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setPracticesOwned(opt)}
                    aria-pressed={active}
                    className="py-3 border text-center label-mono text-[12px] transition-all"
                    style={{
                      borderColor: active ? "#00E5A0" : "#2A2E35",
                      background: active ? "rgba(0,229,160,0.06)" : "transparent",
                      color: active ? "#00E5A0" : "#F5F6F7",
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
          {missingContact && (
            <div className="label-mono text-[10px] text-warn">PLEASE COMPLETE ALL FIELDS ABOVE.</div>
          )}
        </div>
      </Card>

      <Card
        id="q02"
        required
        title="02 · WHAT'S BOTHERED YOU MOST?"
        subtitle="What are the operational problems about running your practice that's bothered you most in the last 3 months?"
      >
        <label htmlFor="f-bothered" className="sr-only">
          Operational issue that has bothered you most
        </label>
        <textarea
          id="f-bothered"
          rows={4}
          required
          value={bothered}
          onChange={(e) => setBothered(e.target.value)}
          placeholder="please describe in as much detail."
        />
        <ErrorMsg show={touched && !bothered.trim()}>THIS FIELD IS REQUIRED.</ErrorMsg>
      </Card>

      <Card
        id="q03"
        required
        title="03 · WHAT YOU WISH YOU KNEW"
        subtitle="Thinking specifically about what happens in your practice's physical spaces — waiting room, reception, decontamination area etc — what's something you wish you could measure in these spaces?"
      >
        <label htmlFor="f-wish-knew" className="sr-only">
          Something you wish you knew more about
        </label>
        <textarea
          id="f-wish-knew"
          rows={4}
          required
          value={wishKnew}
          onChange={(e) => setWishKnew(e.target.value)}
          placeholder="please describe in as much detail."
        />
        <ErrorMsg show={touched && !wishKnew.trim()}>THIS FIELD IS REQUIRED.</ErrorMsg>
      </Card>

      <Card
        id="q04"
        required
        title="04 · WHICH OF THESE WOULD BE USEFUL TO MEASURE IN YOUR PRACTICE?"
        subtitle="Select any that apply."
      >
        <div className="divide-y divide-[#1F2227]">
          {SURVEY_OPTIONS.map((opt) => (
            <Checkbox key={opt} label={opt} checked={useful.has(opt)} onChange={() => toggleUseful(opt)} />
          ))}
          <Checkbox label="None of the above" checked={noneOf} onChange={toggleNone} />
        </div>
        <ErrorMsg show={touched && useful.size === 0 && !noneOf}>
          PLEASE SELECT AT LEAST ONE OPTION.
        </ErrorMsg>
      </Card>

      <Card
        id="q05"
        required
        title="05 · WHICH ONE MATTERS MOST?"
        subtitle="Of everything above, pick the single metric that would change how you run your practice tomorrow."
      >
        <div className="space-y-2">
          {SURVEY_OPTIONS.map((opt) => (
            <RadioRow
              key={opt}
              active={mostImportant === opt}
              onClick={() => setMostImportant(opt)}
              label={opt}
            />
          ))}
          <RadioRow
            active={mostImportant === "None of the above"}
            onClick={() => setMostImportant("None of the above")}
            label="None of the above"
          />
        </div>
        <ErrorMsg show={touched && !mostImportant}>PLEASE PICK ONE OPTION.</ErrorMsg>
      </Card>

      <Card
        id="q06"
        title="06 · WHAT'S MISSING?"
        subtitle="Is there anything else you'd want measured that we haven't listed? (Optional)"
      >
        <label htmlFor="f-missing" className="sr-only">
          What&apos;s missing
        </label>
        <textarea
          id="f-missing"
          rows={4}
          value={missing}
          onChange={(e) => setMissing(e.target.value)}
          placeholder="Type here — one line is fine."
        />
      </Card>

      <Card
        id="q07"
        required
        title="07 · ROUGHLY HOW MUCH DO YOU THINK OPERATIONAL INEFFICIENCY COSTS YOUR PRACTICE PER MONTH?"
        subtitle="A rough estimate is fine — we're trying to understand the scale of the problem, not audit it."
      >
        <div className="space-y-2">
          {COST_OPTIONS.map((opt) => (
            <RadioRow
              key={opt}
              active={monthlyCost === opt}
              onClick={() => setMonthlyCost(opt)}
              label={opt}
            />
          ))}
        </div>
        <ErrorMsg show={touched && !monthlyCost}>PLEASE PICK ONE OPTION.</ErrorMsg>
      </Card>

      <Card
        id="q08"
        required
        title="08 · PILOT INTEREST"
        subtitle="We would love for you to test the product for FREE. Would you be open to testing Dentlytics and giving feedback during development?"
      >
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setPilot("yes")}
            className="py-4 px-3 border text-left label-mono text-[11px] transition-all"
            style={{
              borderColor: pilot === "yes" ? "#00E5A0" : "#2A2E35",
              background: pilot === "yes" ? "rgba(0,229,160,0.05)" : "transparent",
              color: pilot === "yes" ? "#00E5A0" : "#F5F6F7",
            }}
          >
            YES, COUNT ME IN
          </button>
          <button
            type="button"
            onClick={() => setPilot("no")}
            className="py-4 px-3 border text-left label-mono text-[11px] transition-all"
            style={{
              borderColor: pilot === "no" ? "#F5F6F7" : "#2A2E35",
              background: pilot === "no" ? "rgba(245,246,247,0.04)" : "transparent",
              color: "#F5F6F7",
            }}
          >
            NOT RIGHT NOW
          </button>
        </div>
        <ErrorMsg show={touched && !pilot}>PLEASE PICK ONE OPTION.</ErrorMsg>
      </Card>

      <div className="pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="cta-mint w-full h-14 bg-mint label-mono text-[13px] flex items-center justify-center gap-3 text-black disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span>{submitting ? "SUBMITTING…" : "SUBMIT RESPONSE"}</span>
          {!submitting && <span aria-hidden="true">→</span>}
        </button>
        {submitError && (
          <p className="label-mono text-[10px] text-warn mt-3 leading-relaxed">
            SUBMISSION FAILED — {submitError}. PLEASE TRY AGAIN OR EMAIL HELLO@DENTLYTICS.CO.UK
          </p>
        )}
        <p className="text-[12px] text-mute mt-4 leading-relaxed">
          Your responses are used only for product research. We don&apos;t share, sell, or add you to any
          marketing list without consent.
        </p>
      </div>
    </form>
  );
}
