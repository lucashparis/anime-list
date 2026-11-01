import type { ComponentProps } from 'react';

const VARIANT_CLASS_NAMES = {
  solid: 'border-primary bg-primary text-white hover:bg-primary-light',
  outline: 'border-neutral-400 bg-white text-ink hover:bg-neutral-100',
} as const;

type ButtonVariant = keyof typeof VARIANT_CLASS_NAMES;

interface ButtonProps extends ComponentProps<'button'> {
  variant: ButtonVariant;
}

export function Button({ variant, type = 'button', className = '', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-control-md items-center justify-center rounded-md border px-lg text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary pointer-coarse:min-h-control-touch ${VARIANT_CLASS_NAMES[variant]} ${className}`}
      {...props}
    />
  );
}
