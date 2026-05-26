"use client";

import { useEffect, useState, type ReactNode } from "react";

function ArrowUp() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M3 7 L6 4 L9 7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M6 4 L6 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
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
  size,
  color = "#00E5A0",
}: {
  pct: number;
  label: string;
  primary: string;
  sub?: string;
  size: number;
  color?: string;
}) {
  const stroke = 11;
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
        <div
          className="font-mono text-ink h-tight leading-none"
          style={{ fontSize: size > 160 ? 32 : 28 }}
        >
          {primary}
        </div>
        {sub && (
          <div className="label-mono text-[10px] text-mute mt-2.5 whitespace-nowrap">{sub}</div>
        )}
      </div>
    </div>
  );
}

function MiniBarChart({
  values,
  color = "#00E5A0",
}: {
  values: number[];
  color?: string;
}) {
  const w = 100;
  const h = 32;
  const max = Math.max(...values) * 1.05;
  const n = values.length;
  const barWidth = (w / n) * 0.65;
  const gap = (w - barWidth * n) / (n - 1);
  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {values.map((v, i) => {
        const bh = (v / max) * h;
        const x = i * (barWidth + gap);
        const isLast = i === n - 1;
        return (
          <rect
            key={i}
            x={x}
            y={h - bh}
            width={barWidth}
            height={bh}
            fill={color}
            opacity={isLast ? 1 : 0.35 + (i / n) * 0.45}
            rx="0.5"
          />
        );
      })}
    </svg>
  );
}

function MetricCard({
  label,
  value,
  chart,
  trend,
  period,
}: {
  label: string;
  value: string;
  chart: ReactNode;
  trend: string;
  period: string;
}) {
  return (
    <div className="bg-[#13171E] border border-hairline rounded-xl p-4">
      <div className="text-[12px] text-mute mb-1">{label}</div>
      <div className="text-[22px] sm:text-[24px] font-semibold text-ink h-tight leading-none mb-2.5">
        {value}
      </div>
      <div className="h-8 mb-2.5">{chart}</div>
      <div className="flex items-center gap-1.5 text-[11px] text-mint mb-0.5">
        <span>{trend}</span>
        <ArrowUp />
      </div>
      <div className="text-[10px] text-mute leading-snug">{period}</div>
    </div>
  );
}

function MiniMetric({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  delta: string;
}) {
  return (
    <div className="bg-[#13171E] border border-hairline rounded-xl p-3 sm:p-4">
      <div className="text-[11px] text-mute mb-2 leading-tight">{label}</div>
      <div className="flex items-end justify-between gap-2">
        <div>
          <div className="label-mono text-[9px] text-mute mb-0.5">AVG</div>
          <div className="font-mono text-[17px] sm:text-[19px] font-semibold text-ink h-tight leading-none">
            {value}
          </div>
        </div>
        <div className="flex items-center gap-1 text-[12px] sm:text-[13px] text-mint font-semibold">
          <span>{delta}</span>
          <ArrowUp />
        </div>
      </div>
    </div>
  );
}

export default function HeroDashboard() {
  const [tick, setTick] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 100), 100);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const wobble = Math.sin(tick / 1900) * 0.4;
  const efficiency = 84 + wobble;
  const efficiencyRounded = Math.round(efficiency);
  const target = 80;
  const pct = efficiency / 100;
  const gaugeSize = isMobile ? 150 : 175;

  const efficiencySeries = [76, 78, 81, 80, 79, 82, 83, efficiencyRounded];

  return (
    <div
      role="img"
      aria-label="Live preview of the Dentlytics dashboard showing efficiency score, profit trend, and monthly efficiency"
      className="relative w-full rounded-3xl overflow-hidden bg-[#0B0D10] border border-mint/20"
      style={{
        boxShadow:
          "0 0 0 1px rgba(0,229,160,0.08), 0 0 80px -20px rgba(0,229,160,0.15), inset 0 0 60px -20px rgba(0,229,160,0.06)",
      }}
    >
      <div className="h-8 flex items-center justify-between px-4 border-b border-hairline bg-[#0E1013]/60 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-mint mint-pulse" />
          <span className="label-mono text-[9px] text-ink/85">DENTLYTICS · LIVE OPS</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="label-mono text-[9px] text-mute hidden md:inline">
            BLOOM DENTAL · LONDON
          </span>
          <span className="label-mono text-[9px] text-mute">SYNC 00:00:02 AGO</span>
        </div>
      </div>

      <div className="relative p-5 sm:p-6 lg:p-7">
        <GridBackdrop id="bg-efficiency" />

        <div className="relative flex items-start justify-between mb-4 sm:mb-5">
          <div>
            <div className="label-mono text-[10px] text-mute mb-1">METRIC</div>
            <div className="text-ink text-[15px] h-tight font-semibold">OVERALL EFFICIENCY</div>
          </div>
          <div className="text-right">
            <div className="label-mono text-[10px] text-mute mb-1">SCOPE</div>
            <div className="label-mono text-[10px] text-ink/85">DECON + FLOW + COVERAGE</div>
          </div>
        </div>

        <div className="relative grid grid-cols-1 sm:grid-cols-[auto_1fr] items-center gap-5 sm:gap-6">
          <div className="flex items-center justify-center">
            <RadialGauge
              pct={pct}
              label="EFFICIENCY SCORE"
              primary={`${efficiencyRounded}%`}
              sub={`TARGET ${target}%`}
              size={gaugeSize}
            />
          </div>

          <div className="flex flex-col gap-3 w-full">
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <MiniMetric label="Waiting room turnover" value="6m 14s" delta="+40%" />
              <MiniMetric label="Decon" value="4m 20s" delta="+23%" />
            </div>
            <MetricCard
              label="Efficiency this month"
              value={`${efficiencyRounded}%`}
              chart={<MiniBarChart values={efficiencySeries} />}
              trend="Up 7% from last month"
              period="Showing weekly efficiency for the last 8 weeks"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
