import React from 'react';

const SubscriptionBand: React.FC = () => (
  <section id="subscriptions" className="relative overflow-hidden px-4 py-16">
    <div className="absolute -top-10 -right-24 w-64 h-64 bg-moss/15 rounded-full blur-2xl pointer-events-none" aria-hidden="true" />
    <div className="absolute -bottom-16 -left-20 w-48 h-48 bg-honey/20 rounded-full blur-2xl pointer-events-none" aria-hidden="true" />
    <div className="max-w-7xl mx-auto">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-honey/15 border border-honey/40 p-8 flex flex-col justify-between">
          <div>
            <p className="font-display text-clay font-bold text-sm tracking-[0.2em] uppercase">For weekly cooks</p>
            <h3 className="mt-3 font-display text-2xl font-black text-forest">Weekly subscription</h3>
            <p className="mt-3 text-soil/80">A rotating box of seasonal produce, delivered every weekend at 15% off. Set your box size and pause any week.</p>
          </div>
          <ul className="mt-4 space-y-1.5 text-sm text-soil/70">
            <li className="flex items-center gap-2"><span aria-hidden="true">✓</span> Curated by farmers</li>
            <li className="flex items-center gap-2"><span aria-hidden="true">✓</span> Skip or pause anytime</li>
            <li className="flex items-center gap-2"><span aria-hidden="true">✓</span> 15% off every order</li>
          </ul>
          <button type="button" className="mt-6 w-full bg-clay hover:bg-[#97502e] text-cream font-bold py-3 rounded-full transition-colors">Start a subscription</button>
        </div>

        <div className="rounded-2xl bg-forest text-cream p-8 flex flex-col justify-between">
          <div>
            <p className="font-display text-honey font-bold text-sm tracking-[0.2em] uppercase">For resellers</p>
            <h3 className="mt-3 font-display text-2xl font-black">Wholesale &amp; bulk</h3>
            <p className="mt-3 text-cream/80">Restaurants, grocers and resellers: order by the kilogram with an extra 5% off on 100 kg and above. Dedicated account support.</p>
          </div>
          <ul className="mt-4 space-y-1.5 text-sm text-cream/70">
            <li className="flex items-center gap-2"><span aria-hidden="true">✓</span> Volume pricing tiers</li>
            <li className="flex items-center gap-2"><span aria-hidden="true">✓</span> 5% off 100 kg +</li>
            <li className="flex items-center gap-2"><span aria-hidden="true">✓</span> Delivery scheduling</li>
          </ul>
          <button type="button" className="mt-6 w-full border border-cream/40 hover:bg-pine/50 text-cream font-bold py-3 rounded-full transition-colors">Request a quote</button>
        </div>
      </div>
    </div>
  </section>
);

export default SubscriptionBand;