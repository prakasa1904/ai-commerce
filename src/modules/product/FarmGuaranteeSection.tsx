import { Leaf, ShieldCheck, Truck } from 'lucide-react';

const guarantees = [
  { icon: Leaf, label: 'Hand-picked', desc: 'Picked at first light by local farmers' },
  { icon: Truck, label: 'Free delivery', desc: 'Doorstep delivery on every order' },
  { icon: ShieldCheck, label: 'Farm fresh', desc: 'Harvested to order, not to shelf' },
];

const FarmGuaranteeSection = () => (
  <section className="bg-cream/50 rounded-2xl border border-wheat/60 p-6 lg:p-8 max-w-5xl">
    <h2 className="font-display text-sm font-black text-forest uppercase tracking-[0.25em] mb-5">
      Why farm fresh?
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-8">
      {guarantees.map((g) => (
        <div key={g.label} className="flex gap-4 items-start">
          <div className="shrink-0 mt-0.5 h-10 w-10 rounded-full bg-forest/10 text-forest flex items-center justify-center">
            <g.icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-display font-black text-lg text-forest">{g.label}</h3>
            <p className="mt-1 text-sm leading-relaxed text-soil/70">{g.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default FarmGuaranteeSection;