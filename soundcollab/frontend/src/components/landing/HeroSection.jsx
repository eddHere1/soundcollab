import { Link } from 'react-router-dom';
import WaveformVisual from '../music/WaveformVisual';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-12 sm:px-6 lg:px-8 lg:pt-20">
      <div className="pointer-events-none absolute inset-0 bg-hero-glow" />
      <div className="pointer-events-none absolute -left-32 top-20 h-64 w-64 rounded-full bg-accent/20 blur-[100px] animate-pulse-glow" />
      <div className="pointer-events-none absolute -right-32 top-40 h-48 w-48 rounded-full bg-cyan/15 blur-[80px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        <div className="animate-slide-up">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-semibold text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            Underground creators platform
          </div>
          <h1 className="font-heading text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            Where trap meets{' '}
            <span className="neon-text">the future</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg text-text-secondary leading-relaxed">
            Buy exclusive beats, connect with producers, and build your sound in a premium
            marketplace built for late-night studio sessions.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/marketplace" className="btn-primary !px-8 !py-3.5 !text-base play-btn-pulse">
              Explore Beats
            </Link>
            <Link to="/register" className="btn-secondary !px-8 !py-3.5 !text-base">
              Start Creating
            </Link>
          </div>
          <div className="mt-10 flex items-center gap-8 text-sm text-text-secondary">
            <div>
              <p className="font-heading text-2xl font-bold text-text-primary">12K+</p>
              <p>Beats uploaded</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <p className="font-heading text-2xl font-bold text-text-primary">3.2K</p>
              <p>Active producers</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <p className="font-heading text-2xl font-bold text-text-primary">890</p>
              <p>Collabs this month</p>
            </div>
          </div>
        </div>

        <div className="relative animate-fade-in lg:pl-8">
          <div className="gradient-border glass-card relative overflow-hidden p-6 sm:p-8">
            <div className="absolute inset-0 bg-card-shine" />
            <div className="relative">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-accent">Now Playing</p>
                  <p className="mt-1 font-heading text-xl font-bold">Midnight Trap Vol. 3</p>
                  <p className="text-sm text-text-secondary">@darkwavebeats</p>
                </div>
                <div className="play-btn play-btn-pulse h-14 w-14">
                  <svg className="ml-1 h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7L8 5z" />
                  </svg>
                </div>
              </div>
              <WaveformVisual seed="hero-preview" active className="!h-24 w-full" variant="hero" />
              <div className="mt-6 grid grid-cols-3 gap-3">
                {['Trap', '808', 'Dark'].map((tag) => (
                  <span key={tag} className="rounded-lg bg-surface/80 py-2 text-center text-xs font-medium text-text-secondary">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute -bottom-4 -left-4 glass-card !rounded-xl px-4 py-3 animate-float">
            <p className="text-xs text-text-secondary">Live session</p>
            <p className="font-semibold text-success">● 247 producers online</p>
          </div>
        </div>
      </div>
    </section>
  );
}
