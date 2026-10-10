import React from 'react';
import { Link } from '@tanstack/react-router';

interface PlanCard {
  eyebrow?: string;
  notice: string;
  noticeAccent?: string;
  title: string;
  desc: string;
  perks: string[];
  cta: string;
  ghost?: boolean;
}

const planCards: PlanCard[] = [
  {
    eyebrow: 'The market, weekly',
    notice: 'Notice &middot; stall 3',
    noticeAccent: 'text-clay',
    title: 'Weekly box, set once',
    desc: "A rotating box of whatever's best that week, delivered every weekend at 15% off. Set your size and pause a week whenever you need to.",
    perks: ['Curated by farmers', 'Skip or pause any week', '15% off every box'],
    cta: 'Start a subscription',
  },
  {
    notice: 'Notice &middot; stall 7',
    noticeAccent: 'text-honey',
    title: 'Wholesale for resellers',
    desc: 'Restaurants, grocers and resellers: order by the kilogram with an extra 5% off at 100 kg and above. Dedicated account support.',
    perks: ['Volume pricing tiers', '5% off 100 kg and up', 'Delivery scheduling'],
    cta: 'Request a quote',
    ghost: true,
  },
];

const PlanCardItem: React.FC<{ card: PlanCard }> = ({ card }) => (
  <div className="group relative overflow-hidden rounded-2xl border-2 border-moss/50 bg-cream p-6 md:p-8 flex flex-col justify-between transition-transform hover:-translate-y-0.5">
    <span aria-hidden="true" className="absolute -top-10 inset-x-0 h-14 bg-moss/10" style={{ backgroundImage: 'linear-gradient(rgba(31,59,44,0.5) 1px, transparent 1px)', backgroundSize: '14px 1px' }} />
    <div className="relative">
      {card.eyebrow && <p className="font-display text-honey font-bold text-sm tracking-[0.3em] uppercase">{card.eyebrow}</p>}
      <p className={`mt-3 font-display font-bold text-sm tracking-[0.3em] uppercase ${card.noticeAccent ?? 'text-clay'}`}>{card.notice}</p>
      <h3 className="mt-3 text-2xl font-black text-forest font-display">{card.title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-soil/80">{card.desc}</p>
    </div>
    <ul className="mt-5 space-y-3 text-sm text-soil/75">
      {card.perks.map((line) => (
        <li key={line} className="flex items-center gap-2 leading-tight">
          <span aria-hidden="true" className="text-honey">✓</span>
          {line}
        </li>
      ))}
    </ul>
    <Link to="/" className={card.ghost ? 'mt-7 w-full border-2 border-soil/40 hover:bg-soil/5 text-forest font-bold py-3 rounded-full transition-colors text-center' : 'mt-7 w-full bg-clay hover:bg-[#97502e] text-cream font-bold py-3 rounded-full transition-colors text-center'}>{card.cta}</Link>
  </div>
);

const SubscriptionBand: React.FC = () => (
  <section id="subscriptions" aria-label="Subscriptions and wholesale" className="relative px-4 py-24 scroll-mt-16">
    <div className="max-w-7xl mx-auto">
      <div className="grid md:grid-cols-2 gap-6">
        {planCards.map((card) => (
          <PlanCardItem key={card.notice} card={card} />
        ))}
      </div>
    </div>
  </section>
);

export default SubscriptionBand;