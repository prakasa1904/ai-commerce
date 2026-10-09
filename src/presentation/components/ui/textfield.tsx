import * as React from 'react';

import { Input } from './input';
import { cn } from './utils';

export interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'label'> {
  label?: string;
  error?: string;
  hint?: string;
}

const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const autoId = React.useId().toString();
    const inputId = id ?? autoId;
    const helpText = error || hint;

    return (
      <label className="flex flex-col gap-1.5">
        {label ? (
          <span className="text-xs font-display font-black uppercase tracking-wider text-soil/70">{label}</span>
        ) : null}
        <Input
          ref={ref}
          id={label ? inputId : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={helpText ? `${inputId}-help` : undefined}
          className={cn(error && 'border-rose text-rose', className)}
          {...props}
        />
        {helpText ? (
          <span id={`${inputId}-help`} className={cn('text-xs', error ? 'text-rose font-medium' : 'text-soil/50')}>
            {helpText}
          </span>
        ) : null}
      </label>
    );
  }
);
TextField.displayName = 'TextField';

export { TextField };