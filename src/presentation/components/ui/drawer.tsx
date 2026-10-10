import * as React from 'react';
import { Dialog } from './dialog';
import { cn } from './utils';

interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  side?: 'right' | 'left';
  children: React.ReactNode;
}

export const Drawer = ({ open, onOpenChange, title, side = 'right', children }: DrawerProps) => {
  const placement =
    side === 'right'
      ? 'sm:max-md:absolute sm:max-md:right-0 sm:max-md:top-0 sm:max-md:h-full sm:max-md:w-72 sm:max-md:mx-0 sm:max-md:max-w-none sm:max-md:rounded-none sm:max-md:border-l-0 sm:max-md:border-b-0 sm:max-md:shadow-[0_10px_40px_rgba(74,54,40,.35)] sm:max-md:animate-drawer-in'
      : 'sm:max-md:absolute sm:max-md:left-0 sm:max-md:top-0 sm:max-md:h-full sm:max-md:w-72 sm:max-md:mx-0 sm:max-md:max-w-none sm:max-md:rounded-none sm:max-md:border-r-0 sm:max-md:border-b-0 sm:max-md:shadow-[-10px_10px_40px_rgba(74,54,40,.35)] sm:max-md:animate-drawer-in-left';
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      className={cn(placement)}
    >
      {children}
    </Dialog>
  );
};