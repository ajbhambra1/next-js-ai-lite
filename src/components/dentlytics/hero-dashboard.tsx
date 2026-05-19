"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

function pad(n: number, w = 2) {
  const s = String(Math.floor(n));
  return s.length >= w ? s : "0".repeat(w - s.length) + s;
}

function minsToMMSS(mins: number) {
  const m = Math.floor(mins);
  const s = Math.round((mins - m) * 60);
  return `${pad(m)}:${pad(s)}`;
}

function GridBackdrop({ id }: { id: string }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-40 pointer-events-none"
      viewBox="0 0 400 400"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <pattern id={id} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1F2227" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="400" height="400" fill={`url(#${id})`} />
    </svg>
  );
}

function RadialGauge({
  pct,
  label,
  primary,
  sub,
  size = 200,
  color = "#00E5A0",
}: {
  pct: number;
  label: string;
  primary: string;
  sub?: string;
  size?: number;
  color?: string;
}) {
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * Math.max(0, Math.min(1, pct));
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1F2227" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          strokeDashoffset={c / 4}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dasharray 900ms cubic-bezier(0.16, 1, 0.3, 1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-3 leading-tight">
        <div className="label-mono text-[10px] text-mute mb-2 whitespace-nowrap">{label}</div>
        <div className="font-mono text-ink h-tight leading-none" style={{ fontSize: 34 }}>
          {primary}
        </div>
        {sub && <div className="label-mono text-[10px] text-mute mt-2.5 whitespace-nowrap">{sub}</div>}
      </div>
    </div>
  );
}

function FiveDayBars({
  values,
  target,
  format,
  color = "#00E5A0",
  lowerIsBetter = true,
  days = ["THU", "FRI", "SAT", "SUN", "MON"],
}: {
  values: number[];
  target?: number;
  format?: (v: number) => string;
  color?: string;
  lowerIsBetter?: boolean;
  days?: string[];
}) {
  const max = Math.max(...values, target ?? 0) * 1.18;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between mb-3">
        <span className="label-mono text-[10px] text-mute">LAST 5 DAYS</span>
        <span className="label-mono text-[10px] text-mute">AVG {format ? format(avg) : avg.toFixed(0)}</span>
      </div>
      <div className="relative h-[100px]">
        <div
          className="absolute left-0 right-0 border-t border-dashed border-[#3A3F47]"
          style={{ bottom: `${(avg / max) * 100}%` }}
        />
        <div className="absolute inset-0 flex items-end gap-2.5">
          {values.map((v, i) => {
            const isToday = i === values.length - 1;
            const good = target == null ? true : lowerIsBetter ? v <= target : v >= target;
            const bad = target == null ? false : lowerIsBetter ? v > target * 1.1 : v < target * 0.9;
            const fill = isToday ? color : bad ? "#FF5C5C" : good ? "#2F8F6E" : "#3A3F47";
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="label-mono text-[9px]" style={{ color: isToday ? color : "#5C616A" }}>
                  {format ? format(v) : v}
                </span>
                <div
                  className="w-full"
                  style={{
                    height: `${(v / max) * 78}px`,
                    background: fill,
                    opacity: isToday ? 1 : 0.85,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex items-center gap-2.5 mt-2.5">
        {days.map((d, i) => (
          <div
            key={d + i}
            className="flex-1 text-center label-mono text-[9px]"
            style={{ color: i === days.length - 1 ? color : "#5C616A" }}
          >
            {d}
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricLayout({
  gauge,
  bars,
  headline,
  headlineMeta,
}: {
  gauge: ReactNode;
  bars: ReactNode;
  headline: string;
  headlineMeta: string;
}) {
  return (
    <div className="absolute inset-0 p-7 lg:p-9 flex flex-col">
      <GridBackdrop id={`bg-${headline.replace(/\s+/g, "-").toLowerCase()}`} />

      <div className="relative flex items-start justify-between mb-3">
        <div>
          <div className="label-mono text-[10px] text-mute mb-1">METRIC</div>
          <div className="text-ink text-[15px] h-tight font-semibold">{headline}</div>
        </div>
        <div className="text-right">
          <div className="label-mono text-[10px] text-mute mb-1">SCOPE</div>
          <div className="label-mono text-[10px] text-ink/85">{headlineMeta}</div>
        </div>
      </div>

      <div className="relative flex-1 grid grid-cols-1 sm:grid-cols-[auto_1px_1fr] items-center gap-6 sm:gap-10">
        <div className="flex items-center justify-center">{gauge}</div>
        <div className="hidden sm:block w-px h-[60%] bg-hairline" />
        <div className="flex flex-col justify-center">{bars}</div>
      </div>
    </div>
  );
}

function DeconView({ tick }: { tick: number }) {
  const wobble = Math.sin(tick / 1400) * 0.03;
  const today = 8.9 + wobble;
  const series = [9.4, 9.2, 8.7, 9.1, today];
  const target = 9.0;
  const pct = Math.max(0, Math.min(1, 1 - (today - target) / target + 0.5));
  return (
    <MetricLayout
      gauge={<RadialGauge pct={pct} label="TIME IN DECON" primary={minsToMMSS(today)} sub={`TARGET ${minsToMMSS(target)}`} />}
      bars={<FiveDayBars values={series} target={target} format={minsToMMSS} />}
      headline="DECON TURNAROUND"
      headlineMeta="ZONE A → ZONE B"
    />
  );
}

function ReceptionView({ tick }: { tick: number }) {
  const wobble = Math.sin(tick / 1700) * 0.04;
  const today = 12.1 + wobble;
  const series = [14.4, 13.8, 12.6, 13.2, today];
  const target = 12.0;
  const pct = Math.max(0, Math.min(1, 1 - (today - target) / (target * 0.6)));
  return (
    <MetricLayout
      gauge={<RadialGauge pct={pct} label="RECEPTION WAIT" primary={minsToMMSS(today)} sub={`TARGET ${minsToMMSS(target)}`} />}
      bars={<FiveDayBars values={series} target={target} format={minsToMMSS} />}
      headline="AVG PATIENT WAIT"
      headlineMeta="ALL CAMERAS · TODAY"
    />
  );
}

function EfficiencyView({ tick }: { tick: number }) {
  const wobble = Math.sin(tick / 1900) * 0.4;
  const today = 84 + wobble;
  const series = [76, 78, 81, 79, today];
  const target = 80;
  const pct = today / 100;
  return (
    <MetricLayout
      gauge={<RadialGauge pct={pct} label="EFFICIENCY SCORE" primary={`${Math.round(today)}%`} sub={`TARGET ${target}%`} />}
      bars={<FiveDayBars values={series} target={target} format={(v) => `${Math.round(v)}%`} lowerIsBetter={false} />}
      headline="OVERALL EFFICIENCY"
      headlineMeta="DECON + FLOW + COVERAGE"
    />
  );
}

function ScanLine({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      <div
        className="absolute left-0 right-0 h-24"
        style={{
          animation: "scan 600ms ease-in-out forwards",
          background:
            "linear-gradient(to bottom, rgba(0,229,160,0) 0%, rgba(0,229,160,0.18) 50%, rgba(0,229,160,0) 100%)",
        }}
      />
    </div>
  );
}

export default function HeroDashboard() {
  const [tick, setTick] = useState(0);
  const [viewIdx, setViewIdx] = useState(0);
  const [scanning, setScanning] = useState(false);
  const prefersReduced = useRef(false);

  useEffect(() => {
    prefersReduced.current =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 100), 100);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (prefersReduced.current) return;
    const id = setInterval(() => {
      setScanning(true);
      setTimeout(() => setViewIdx((i) => (i + 1) % 3), 200);
      setTimeout(() => setScanning(false), 700);
    }, 6500);
    return () => clearInterval(id);
  }, []);

  const views = [
    <EfficiencyView tick={tick} key="e" />,
    <DeconView tick={tick} key="d" />,
    <ReceptionView tick={tick} key="r" />,
  ];

  const pipLabels = ["EFFICIENCY SCORE", "DECON", "RECEPTION"];

  return (
    <div
      role="img"
      aria-label="Animated preview of Dentlytics dashboard cycling through decon time, reception wait and efficiency score"
      className="relative w-full aspect-[8/5] rounded-3xl overflow-hidden bg-[#0B0D10] border border-mint/20"
      style={{
        boxShadow:
          "0 0 0 1px rgba(0,229,160,0.08), 0 0 80px -20px rgba(0,229,160,0.15), inset 0 0 60px -20px rgba(0,229,160,0.06)",
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-8 z-20 flex items-center justify-between px-4 border-b border-hairline bg-[#0E1013]/60 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-mint mint-pulse" />
          <span className="label-mono text-[9px] text-ink/85">DENTLYTICS · LIVE OPS</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="label-mono text-[9px] text-mute hidden md:inline">BLOOM DENTAL · LONDON</span>
          <span className="label-mono text-[9px] text-mute">SYNC 00:00:02 AGO</span>
        </div>
      </div>

      <div className="absolute top-8 left-0 right-0 z-20 flex items-center justify-center gap-2 sm:gap-3 px-4 py-2.5 border-b border-hairline bg-[#0E1013]/40">
        {[0, 1, 2].map((i) => {
          const active = i === viewIdx;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setViewIdx(i)}
              aria-pressed={active}
              aria-label={`Show ${pipLabels[i]} metric`}
              className="label-mono text-[10px] sm:text-[11px] rounded-md transition-all duration-200 px-3 sm:px-4 py-2 border"
              style={{
                background: active ? "#00E5A0" : "transparent",
                borderColor: active ? "#00E5A0" : "rgba(0,229,160,0.45)",
                color: active ? "#0A0B0D" : "#F5F6F7",
              }}
            >
              {pipLabels[i]}
            </button>
          );
        })}
      </div>

      <div className="absolute top-[72px] left-0 right-0 bottom-0">
        {views.map((v, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-[600ms]"
            style={{ opacity: i === viewIdx ? 1 : 0, pointerEvents: i === viewIdx ? "auto" : "none" }}
          >
            {v}
          </div>
        ))}
        <ScanLine active={scanning} />
      </div>
    </div>
  );
}
