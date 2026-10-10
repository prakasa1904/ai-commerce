import React from 'react';
import { Skeleton, SkeletonImage, SkeletonText } from '../ui/skeleton';

export const ProductSkeletonCard: React.FC = () => (
  <div className="flex flex-col bg-card border border-wheat/60 rounded-2xl overflow-hidden">
    <SkeletonImage className="h-48 sm:h-52 w-full rounded-t-2xl" />
    <div className="flex-1 flex flex-col gap-2 p-4 pb-2">
      <SkeletonText className="w-3/4" />
      <SkeletonText className="w-2/3" />
      <div className="mt-auto flex items-center justify-between pt-4">
        <SkeletonText className="w-20" />
      </div>
    </div>
  </div>
);

export const ProductSkeletonRow: React.FC = () => (
  <li className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-card border border-wheat/60">
    <SkeletonImage className="h-40 w-40 rounded-xl shrink-0" />
    <div className="flex-1 flex flex-col gap-3 pt-1">
      <SkeletonText className="w-1/2" />
      <SkeletonText className="w-full" />
      <SkeletonText className="w-3/4" />
    </div>
    <Skeleton className="h-10 w-40 rounded-full shrink-0" />
  </li>
);