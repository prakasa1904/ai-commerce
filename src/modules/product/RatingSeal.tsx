import { Leaf, Star, StarHalf } from 'lucide-react';

interface RatingSealProps {
  score: number;
  reviews: number;
}

const RatingSeal = ({ score, reviews }: RatingSealProps) => {
  const fullStars = Math.floor(score);
  const hasHalf = score - fullStars >= 0.25;

  const stars = Array.from({ length: 5 }, (_, i) => {
    const index = i + 1;
    const className = index <= fullStars || (hasHalf && index === fullStars + 1) ? 'text-forest' : 'text-honey/40';
    const Icon = index === fullStars + 1 && hasHalf ? StarHalf : Star;
    return <Icon key={index} className={`h-4 w-4 ${className}`} aria-hidden="true" />;
  });

  return (
    <div
      role="img"
      aria-label={`Rated ${score.toFixed(1)} out of 5 from ${reviews} harvests`}
      className="inline-flex items-center gap-2.5 rounded-full bg-honey/95 px-4 py-2 shadow-md font-display text-forest"
      style={{ transform: 'rotate(-1.5deg)' }}
    >
      <Leaf className="h-3.5 w-3.5 shrink-0 text-forest/70" aria-hidden="true" />
      {stars}
      <span className="font-black text-lg leading-none">{score.toFixed(1)}</span>
      <span className="text-[0.68rem] font-semibold opacity-75">· {reviews} harvests</span>
    </div>
  );
};

export default RatingSeal;