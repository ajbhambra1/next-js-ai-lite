"use client";

import {
  useEffect,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from "react";
import HeroDashboard from "./hero-dashboard";
import Survey from "./survey";

function Reveal({
  children,
  className = "",
  delay = 0,
  as: As = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: ElementType;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.12 }
    );
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <As
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 600ms ease-out ${delay}ms, transform 600ms ease-out ${delay}ms`,
      }}
    >
      {children}
    </As>
  );
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        height: 64,
        background: scrolled ? "rgba(10,11,13,0.78)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid #1F2227" : "1px solid transparent",
      }}
    >
      <div className="max-w-container mx-auto h-full flex items-center justify-between px-6 md:px-8">
        <a href="#top" className="flex items-center gap-2.5 group">
          <span className="w-1.5 h-1.5 rounded-full bg-mint mint-pulse" />
          <span className="text-[15px] tracking-tightish font-semibold text-ink">Dentlytics</span>
        </a>
      </div>
    </nav>
  );
}

function Hero({ onCTA }: { onCTA: () => void }) {
  return (
    <section className="relative pt-32 md:pt-36 pb-20 md:pb-32" id="top">
      <div className="absolute inset-0 grid-overlay grid-breathe pointer-events-none" aria-hidden="true" />
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-hairline to-transparent"
        aria-hidden="true"
      />
      <div className="relative max-w-container mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[45fr_55fr] gap-10 lg:gap-16 items-center">
          <Reveal>
            <div className="label-mono text-[11px] text-mint mb-6">
              OPERATIONAL INTELLIGENCE FOR DENTAL PRACTICES
            </div>
            <h1
              className="font-semibold h-tight leading-[1.02] text-ink mb-8"
              style={{ fontSize: "clamp(40px, 6.8vw, 72px)" }}
            >
              Run your practice on signals, not guesswork.
            </h1>
            <p className="text-[18px] md:text-[19px] text-ink/85 leading-relaxed mb-5 max-w-[520px]">
              We help dental practices improve operational efficiency and patient flow by turning everyday
              practice activity into live business insights.
            </p>
            <p className="text-[15px] text-mute leading-relaxed mb-10 max-w-[520px]">
              Dentlytics connects to the cameras you already own and converts them into a live operations
              dashboard. Waiting times, decon turnaround, reception activity — measured continuously,
              surfaced cleanly.
            </p>
            <button
              onClick={onCTA}
              className="cta-mint inline-flex items-center gap-4 bg-mint text-black px-9 label-mono text-[15px]"
              style={{ height: 64 }}
            >
              <span>MARKET RESEARCH FORM</span>
              <span aria-hidden="true">→</span>
            </button>
          </Reveal>

          <Reveal delay={150}>
            <HeroDashboard />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function HowItWorks({ onCTA }: { onCTA: () => void }) {
  const steps = [
    {
      num: "01",
      title: "Connect",
      body: "We integrate via your camera provider's API. Setup takes under an hour, remotely.",
    },
    {
      num: "02",
      title: "Measure",
      body: "Activity in each room is converted into live anonymous operational metrics — data never leaves the practice. CQC compliant",
    },
    {
      num: "03",
      title: "Decide",
      body: "Your dashboard shows you live feed data to the minute. Compare it against yesterday or the week before. Weekly report sent to your inbox.",
    },
  ];
  return (
    <section className="py-20 md:py-[120px]">
      <div className="max-w-container mx-auto px-6 md:px-8">
        <div className="max-w-[820px] mb-14 md:mb-20">
          <Reveal>
            <h2
              className="font-semibold h-tight leading-[1.05] text-ink mb-5"
              style={{ fontSize: "clamp(28px, 4.2vw, 40px)" }}
            >
              Built on the system you already have.
            </h2>
            <p className="text-[17px] md:text-[18px] text-mute max-w-[620px] leading-relaxed">
              Dentlytics plugs into any existing cameras. No new hardware. No new wiring.
            </p>
          </Reveal>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-hairline border hairline">
          {steps.map((s, i) => (
            <Reveal key={s.num} delay={i * 100} className="bg-[#0A0B0D] p-7 md:p-9">
              <div className="label-mono text-[12px] text-mint mb-6">
                {s.num} · {s.title.toUpperCase()}
              </div>
              <div className="text-[18px] md:text-[20px] text-ink h-tight font-semibold mb-3 leading-tight">
                {s.title}
              </div>
              <p className="text-[15px] text-mute leading-relaxed">{s.body}</p>
            </Reveal>
          ))}
        </div>
        <Reveal delay={200} className="mt-12 md:mt-16 flex justify-center">
          <button
            onClick={onCTA}
            className="cta-mint inline-flex items-center gap-4 bg-mint text-black px-9 label-mono text-[15px]"
            style={{ height: 64 }}
          >
            <span>MARKET RESEARCH FORM</span>
            <span aria-hidden="true">→</span>
          </button>
        </Reveal>
      </div>
    </section>
  );
}

function SurveySection({ surveyRef }: { surveyRef: React.RefObject<HTMLElement> }) {
  return (
    <section
      ref={surveyRef}
      id="survey"
      className="py-20 md:py-[120px] border-t hairline relative"
    >
      <div className="absolute inset-0 grid-overlay opacity-50 pointer-events-none" aria-hidden="true" />
      <div className="relative max-w-container mx-auto px-6 md:px-8">
        <div className="text-center max-w-[680px] mx-auto mb-14 md:mb-16">
          <Reveal>
            <div className="label-mono text-mint mb-5" style={{ fontSize: "25px" }}>
              MARKET RESEARCH
            </div>
            <h2
              className="font-semibold h-tight leading-[1.05] text-ink mb-5"
              style={{ fontSize: "clamp(28px, 4.2vw, 40px)" }}
            >
              Help us build it right.
            </h2>
            <p className="text-[17px] md:text-[18px] text-mute leading-relaxed">
              We are speaking to UK practice owners to help build our prototype. Tell us what you&apos;re
              looking to solve. We would love for you to test the product for FREE and provide feedback
              throughout our journey.
            </p>
          </Reveal>
        </div>
        <Reveal delay={120}>
          <Survey />
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t hairline">
      <div className="max-w-container mx-auto px-6 md:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[14px] text-mute font-semibold">Dentlytics</span>
          <span className="label-mono text-[10px] text-mute">© 2026 · UK</span>
        </div>
        <a
          href="mailto:hello@dentlytics.co.uk"
          className="text-link label-mono text-[10px] text-mute"
        >
          HELLO@DENTLYTICS.CO.UK
        </a>
      </div>
    </footer>
  );
}

export default function DentlyticsLanding() {
  const surveyRef = useRef<HTMLElement>(null);
  const scrollToSurvey = () => {
    if (!surveyRef.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const top = surveyRef.current.getBoundingClientRect().top + window.scrollY - 24;
    window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
  };
  return (
    <div className="dentlytics-root min-h-screen bg-[#0A0B0D] text-ink">
      <Nav />
      <main>
        <Hero onCTA={scrollToSurvey} />
        <HowItWorks onCTA={scrollToSurvey} />
        <SurveySection surveyRef={surveyRef} />
      </main>
      <Footer />
    </div>
  );
}
