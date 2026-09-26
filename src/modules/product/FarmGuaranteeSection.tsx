import { Leaf } from 'lucide-react';

const guarantees = [
  {
    head: 'Picked at first light',
    desc: 'The seller harvests the morning of your order — nothing from a warehouse shelf.',
  },
  {
    head: 'Free delivery, same day',
    desc: 'From the stall to your doorstep the same afternoon. We only use farmers within the valley.',
  },
  {
    head: 'Packed to order',
    desc: 'No middlemen, no pre-packed crates. Your bundle is tied and weighed when you buy.',
  },
];

const FarmGuaranteeSection = () => (
  <section aria-label="Why shop farm fresh" className="mt-2">
    <div className="overflow-hidden rounded-2xl border-2 border-wheat-800/50 bg-kraft p-5 lg:p-6 relative">
      {/* notebook spine */}
      <span aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-2.5 bg-pine shadow-sm" />

      <div className="relative">
        <p className="font-display font-black text-[0.72rem] uppercase tracking-[0.3em] text-moss">
          Field notes
        </p>
        <h2 className="mt-1 text-2xl font-display font-black text-forest">Why people buy from the field</h2>
        <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-soil/70">
          A stall is a promise between a farmer and a cook. Here&apos;s what that means on every order.
        </p>
      </div>

      <ul className="mt-6 space-y-7">
        {guarantees.map((g) => (
          <li key={g.head} className="flex gap-4">
            {/* hand-stamped chalk tick */}
            <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-honey/70 shadow-md">
              <span className="text-forest font-display font-extrabold text-lg leading-none">&#10003;</span>
            </span>
            <div>
              <h3 className="font-display font-black text-lg text-forest">{g.head}</h3>
              <p className="mt-1 leading-relaxed text-sm text-soil/70">{g.desc}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-2 flex items-center gap-1.5 pt-5 border-t border-wheat-800/30">
        <Leaf className="h-4 w-4 text-moss/70" aria-hidden="true" />
        <span className="italic text-[0.75rem] text-soil/60 font-display">
          Written up and sealed by the farmer, not a marketing desk.
        </span>
      </div>
    </div>
  </section>
);

export default FarmGuaranteeSection;