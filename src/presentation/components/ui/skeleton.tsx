import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from './utils';

const skeletonVariants = cva('animate-pulse', {
  variants: {
    variant: {
      default: 'rounded-md bg-muted',
      card: 'rounded-2xl bg-wheat/50',
      image: 'aspect-[4/5] rounded-xl bg-wheat/50',
      text: 'h-4 w-full rounded-md bg-wheat/50',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof skeletonVariants> {}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, ...props }, ref) => (
    <div ref={ref} className={cn(skeletonVariants({ variant }), className)} {...props} />
  )
);
Skeleton.displayName = 'Skeleton';

const SkeletonImage = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(skeletonVariants({ variant: 'image' }), className)} {...props} />
  )
);
SkeletonImage.displayName = 'SkeletonImage';

const SkeletonText = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(skeletonVariants({ variant: 'text' }), className)} {...props} />
  )
);
SkeletonText.displayName = 'SkeletonText';

export { Skeleton, SkeletonImage, SkeletonText, skeletonVariants };