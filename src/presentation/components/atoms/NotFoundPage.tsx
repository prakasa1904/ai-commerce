import React from 'react';
import { Link } from '@tanstack/react-router';
import { Button } from '../ui/button';
import WaxSeal from './WaxSeal';

const NotFoundPage: React.FC = () => (
  <div className="px-4 py-20 text-center">
    <WaxSeal className="relative mx-auto" />
    <p className="mt-8 font-display text-honey font-bold text-sm tracking-[0.3em] uppercase">404 · Not in today&apos;s haul</p>
    <h1 className="mt-3 text-4xl font-black text-forest font-display">That harvest hasn&apos;t arrived yet.</h1>
    <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">It&apos;s likely out of season or sold out — browse what&apos;s fresh below.</p>
    <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
      <Link to="/cat"><Button className="bg-pine/95 text-cream font-bold hover:bg-pine transition-colors px-6 py-3">Browse the market</Button></Link>
      <Link to="/" className="font-display text-xs font-black uppercase tracking-[0.18em] text-pine hover:text-clay transition-colors">Back to the square</Link>
    </div>
  </div>
);

export default NotFoundPage;