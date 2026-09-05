import React, { useRef, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onExplore: () => void;
  onSignIn: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onExplore, onSignIn }) => {
  const overviewRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;

    let ticking = false;
    let rafId: number;

    const handleScroll = () => {
      if (!ticking) {
        rafId = window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;

          // 1. Direct Video Parallax (-0.28 scroll factor up to -140px)
          if (videoRef.current) {
            const videoOffset = -Math.min(scrollY * 0.28, 140);
            videoRef.current.style.transform = `translate3d(0, ${videoOffset}px, 0)`;
          }

          // 2. Direct Hero Content Parallax & Gentle Fade (-0.08 factor up to -40px)
          if (heroContentRef.current) {
            const contentOffset = -Math.min(scrollY * 0.08, 40);
            const contentOpacity = Math.max(1 - scrollY / 800, 0.2);
            heroContentRef.current.style.transform = `translate3d(0, ${contentOffset}px, 0)`;
            heroContentRef.current.style.opacity = `${contentOpacity}`;
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  const handleScrollToOverview = () => {
    if (overviewRef.current) {
      overviewRef.current.scrollIntoView({ behavior: 'smooth' });
    } else {
      onExplore();
    }
  };

  return (
    <div
      style={{
        background: '#0f332a',
        color: '#f8fafc',
        minHeight: '100vh',
        fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
        overflowX: 'hidden',
      }}
    >
      {/* ========================================================================= */}
      {/* 1. TOP NAVIGATION                                                         */}
      {/* ========================================================================= */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 68,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 3rem',
          background: 'rgba(15, 51, 42, 0.88)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(110, 231, 183, 0.15)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.5px', color: '#ffffff' }}>
            MEDION <span style={{ color: '#6ee7b7' }}>AGENT</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <button
            onClick={handleScrollToOverview}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.85)',
              fontSize: '0.88rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)')}
          >
            Platform Overview
          </button>
          <button
            onClick={onSignIn}
            style={{
              background: '#059669',
              color: '#ffffff',
              border: '1px solid rgba(110, 231, 183, 0.4)',
              padding: '0.5rem 1.25rem',
              borderRadius: 4,
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#10b981')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#059669')}
          >
            Sign In to Portal
          </button>
        </div>
      </nav>

      {/* ========================================================================= */}
      {/* 2. CINEMATIC HERO SECTION                                                 */}
      {/* ========================================================================= */}
      <section
        style={{
          position: 'relative',
          minHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          padding: '8rem 2rem 5rem',
          overflow: 'hidden',
          background: '#0d2d25',
        }}
      >
        {/* Background Video Layer with Vertical Buffer & Direct DOM Parallax Transform */}
        <div
          ref={videoRef}
          style={{
            position: 'absolute',
            top: '-15%',
            left: 0,
            right: 0,
            bottom: '-15%',
            height: '130%',
            zIndex: 0,
            overflow: 'hidden',
            pointerEvents: 'none',
            willChange: 'transform',
            transform: 'translate3d(0, 0px, 0)',
          }}
        >
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              filter: 'brightness(0.7) contrast(1.12) saturate(1.2)',
            }}
          >
            <source src="/videos/medion-hero.mp4" type="video/mp4" />
            <source src="/medion-hero.mp4" type="video/mp4" />
          </video>

          {/* Lighter Forest Green Gradient Overlay */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                'linear-gradient(180deg, rgba(15, 51, 42, 0.4) 0%, rgba(15, 51, 42, 0.55) 55%, #0f332a 100%)',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* Hero Foreground Content */}
        <div
          ref={heroContentRef}
          style={{
            position: 'relative',
            zIndex: 2,
            maxWidth: 940,
            margin: '0 auto',
            willChange: 'transform, opacity',
            transform: 'translate3d(0, 0px, 0)',
            transition: 'transform 0.05s linear',
          }}
        >
          <h1
            style={{
              fontSize: 'clamp(2.5rem, 5.5vw, 4.25rem)',
              lineHeight: 1.12,
              marginBottom: '1.5rem',
              letterSpacing: '-0.04em',
              fontWeight: 700,
              color: '#ffffff',
            }}
          >
            Healthcare, intelligently connected.
          </h1>

          <p
            style={{
              fontSize: 'clamp(1.05rem, 2vw, 1.2rem)',
              lineHeight: 1.6,
              marginBottom: '2.5rem',
              maxWidth: 780,
              margin: '0 auto 2.5rem',
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: 400,
            }}
          >
            MEDION AGENT brings healthcare workflows, patient information, clinical intelligence, appointments, laboratory operations and insurance processes into one connected platform.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={onSignIn}
              style={{
                padding: '0.85rem 2rem',
                fontSize: '0.95rem',
                background: '#059669',
                color: '#ffffff',
                border: '1px solid rgba(110, 231, 183, 0.45)',
                borderRadius: 4,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 8px 24px rgba(5, 150, 105, 0.35)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#10b981')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#059669')}
            >
              Explore MEDION <ArrowRight style={{ width: 16, height: 16 }} />
            </button>
            <button
              onClick={handleScrollToOverview}
              style={{
                padding: '0.85rem 2rem',
                fontSize: '0.95rem',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                borderRadius: 4,
                fontWeight: 500,
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
            >
              View Platform Architecture
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. EDITORIAL CORE FOUNDATIONS (Deep Evergreen Background)                 */}
      {/* ========================================================================= */}
      <section
        ref={overviewRef}
        style={{
          width: '100%',
          background: '#0f332a',
          padding: '7rem 0 8rem',
        }}
      >
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 3rem' }}>
          <div style={{ marginBottom: '4.5rem' }}>
            <div
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                color: '#6ee7b7',
                marginBottom: '0.75rem',
              }}
            >
              Core Foundations
            </div>
            <h2
              style={{
                fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
                fontWeight: 700,
                lineHeight: 1.2,
                letterSpacing: '-0.03em',
                color: '#ffffff',
                marginBottom: '1rem',
              }}
            >
              One platform. Every healthcare workflow.
            </h2>
            <p style={{ fontSize: '1.05rem', color: 'rgba(255, 255, 255, 0.78)', maxWidth: 680, lineHeight: 1.6 }}>
              Clinical data, intelligent orchestration, and role-specific experiences — connected through MEDION.
            </p>
          </div>

          {/* Editorial Rows */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[
              {
                num: '01',
                title: 'CLINICAL DATA PRIMACY',
                desc: 'Factual patient records, laboratory reference bounds, and clinical timelines remain un-manipulated source data.',
              },
              {
                num: '02',
                title: 'SNS WORKBENCH ORCHESTRATION',
                desc: 'Centralized routing, NLU intent recognition, and deterministic tool execution via SNS Agent Workbench.',
              },
              {
                num: '03',
                title: 'SIX ROLE-BASED EXPERIENCES',
                desc: 'Tailored, secure workspaces for Doctors, Nurses, Patients, Laboratories, Insurance Operations, and Hospital Administration.',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 1fr 1.6fr',
                  gap: '2rem',
                  alignItems: 'baseline',
                  padding: '2.5rem 0',
                  borderTop: '1px solid rgba(110, 231, 183, 0.15)',
                  borderBottom: idx === 2 ? '1px solid rgba(110, 231, 183, 0.15)' : 'none',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.paddingLeft = '0.5rem')}
                onMouseLeave={(e) => (e.currentTarget.style.paddingLeft = '0rem')}
              >
                <span style={{ fontSize: '1rem', fontWeight: 700, color: '#6ee7b7', letterSpacing: '0.5px' }}>
                  {item.num}
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#ffffff', letterSpacing: '-0.01em', margin: 0 }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.6, margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. FULL-WIDTH ARCHITECTURE DIVISION (Dark Charcoal-Evergreen #071914)     */}
      {/* ========================================================================= */}
      <section
        style={{
          width: '100%',
          background: '#071914',
          borderTop: '1px solid rgba(110, 231, 183, 0.12)',
          borderBottom: '1px solid rgba(110, 231, 183, 0.12)',
          padding: '7.5rem 0 8.5rem',
        }}
      >
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 3rem' }}>
          <div style={{ marginBottom: '5rem' }}>
            <div
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                color: '#6ee7b7',
                marginBottom: '0.85rem',
              }}
            >
              Architecture
            </div>
            <h2
              style={{
                fontSize: 'clamp(2.25rem, 4vw, 3rem)',
                fontWeight: 700,
                lineHeight: 1.18,
                letterSpacing: '-0.035em',
                color: '#ffffff',
                marginBottom: '1.25rem',
              }}
            >
              Five specialized agents.<br />One coordinated system.
            </h2>
            <p style={{ fontSize: '1.05rem', color: 'rgba(255, 255, 255, 0.72)', maxWidth: 740, lineHeight: 1.65 }}>
              MEDION separates healthcare responsibilities into focused agents while <strong style={{ color: '#ffffff' }}>SNS Agent Workbench</strong> coordinates the workflow as Master Orchestrator.
            </p>
          </div>

          {/* 5 Agents Full-Width Editorial Sequence */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[
              {
                num: '01',
                name: 'PATIENT AGENT',
                desc: 'Patient-domain information and lifecycle operations.',
                type: 'Rule / Data',
              },
              {
                num: '02',
                name: 'MEDICAL AGENT',
                desc: 'Laboratory analysis and medical information processing.',
                type: 'Hybrid / AI',
              },
              {
                num: '03',
                name: 'APPOINTMENT AGENT',
                desc: 'Appointment availability and lifecycle operations.',
                type: 'Rule / Data',
              },
              {
                num: '04',
                name: 'INSURANCE AGENT',
                desc: 'Insurance verification and claims processing.',
                type: 'Rule / Hybrid',
              },
              {
                num: '05',
                name: 'ASSISTANT AGENT',
                desc: 'Natural-language interaction, parameter extraction, and structured request creation.',
                type: 'AI / NLP',
              },
            ].map((agent, i) => (
              <div
                key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 1.4fr 2fr 120px',
                  gap: '2rem',
                  alignItems: 'center',
                  padding: '2.25rem 0',
                  borderTop: '1px solid rgba(110, 231, 183, 0.12)',
                  borderBottom: i === 4 ? '1px solid rgba(110, 231, 183, 0.12)' : 'none',
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.paddingLeft = '0.5rem')}
                onMouseLeave={(e) => (e.currentTarget.style.paddingLeft = '0rem')}
              >
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#6ee7b7' }}>
                  {agent.num}
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#ffffff', margin: 0 }}>
                  {agent.name}
                </h3>
                <p style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.78)', lineHeight: 1.55, margin: 0 }}>
                  {agent.desc}
                </p>
                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      color: '#6ee7b7',
                      padding: '0.25rem 0.65rem',
                      background: 'rgba(110, 231, 183, 0.08)',
                      borderRadius: 4,
                      border: '1px solid rgba(110, 231, 183, 0.2)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {agent.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. FINAL CALL TO ACTION                                                   */}
      {/* ========================================================================= */}
      <section
        style={{
          width: '100%',
          padding: '7.5rem 2rem 8.5rem',
          textAlign: 'center',
          background: 'linear-gradient(180deg, #0f332a 0%, #134035 100%)',
        }}
      >
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <h2
            style={{
              fontSize: 'clamp(2.25rem, 4.5vw, 3.25rem)',
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '-0.035em',
              marginBottom: '1rem',
            }}
          >
            Healthcare, intelligently connected.
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '2.5rem' }}>
            Enter the MEDION workspace.
          </p>
          <button
            onClick={onSignIn}
            style={{
              padding: '0.95rem 2.5rem',
              fontSize: '1rem',
              background: '#059669',
              color: '#ffffff',
              border: '1px solid rgba(110, 231, 183, 0.45)',
              borderRadius: 4,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              boxShadow: '0 8px 28px rgba(5, 150, 105, 0.4)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#10b981')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#059669')}
          >
            Enter MEDION <ArrowRight style={{ width: 16, height: 16 }} />
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. FOOTER                                                                 */}
      {/* ========================================================================= */}
      <footer
        style={{
          width: '100%',
          padding: '2.5rem 3rem',
          borderTop: '1px solid rgba(110, 231, 183, 0.15)',
          background: '#071914',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.8rem',
          color: 'rgba(255, 255, 255, 0.65)',
        }}
      >
        <div>
          <span style={{ fontWeight: 700, color: '#ffffff' }}>MEDION</span> • Multi-Agent Healthcare Management Platform
        </div>
        <div>
          Master Orchestrator: SNS Agent Workbench • FastAPI Tool Services
        </div>
      </footer>
    </div>
  );
};
