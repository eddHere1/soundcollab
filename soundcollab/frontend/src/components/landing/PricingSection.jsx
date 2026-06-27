import { Link } from 'react-router-dom';

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    desc: 'Start your journey in the underground',
    features: ['Upload 5 beats/month', 'Basic analytics', 'Community feed access', 'Standard audio quality'],
    cta: 'Get Started',
    to: '/register',
    highlight: false,
  },
  {
    name: 'Producer',
    price: '$19',
    period: '/month',
    desc: 'For serious beat makers building their brand',
    features: ['Unlimited uploads', 'Beat marketplace listing', 'Advanced analytics', 'Priority collab matching', 'Custom producer page'],
    cta: 'Start Producing',
    to: '/register',
    highlight: true,
  },
  {
    name: 'Label',
    price: '$49',
    period: '/month',
    desc: 'Scale your roster and revenue',
    features: ['Everything in Producer', 'Multi-artist management', 'Revenue splits', 'White-label store', 'API access'],
    cta: 'Contact Sales',
    to: '/register',
    highlight: false,
  },
];

export default function PricingSection() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="section-title">Choose Your Plan</h2>
          <p className="section-subtitle mx-auto max-w-md">
            Invest in your sound. Cancel anytime.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl p-6 sm:p-8 transition-all duration-300 ${
                plan.highlight
                  ? 'gradient-border glass-card shadow-glow-lg scale-[1.02]'
                  : 'glass-card'
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1 text-xs font-bold uppercase tracking-wider">
                  Most Popular
                </span>
              )}
              <h3 className="font-heading text-lg font-semibold">{plan.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-heading text-4xl font-bold">{plan.price}</span>
                <span className="text-text-secondary">{plan.period}</span>
              </div>
              <p className="mt-2 text-sm text-text-secondary">{plan.desc}</p>
              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-text-secondary">
                    <svg className="h-4 w-4 shrink-0 text-success" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to={plan.to}
                className={`mt-8 w-full text-center ${plan.highlight ? 'btn-primary' : 'btn-secondary'}`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
