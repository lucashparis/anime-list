import type { ComponentProps } from 'react';

const VARIANT_CLASS_NAMES = {
  solid: 'border-primary bg-primary text-white hover:bg-primary-light',
  outline: 'border-neutral-400 bg-white text-ink hover:bg-neutral-100',
  accent: 'border-warning bg-warning text-ink hover:brightness-95',
} as const;

const SIZE_CLASS_NAMES = {
  md: 'min-h-control-md pointer-coarse:min-h-control-touch',
  lg: 'min-h-control-lg',
} as const;

interface ButtonProps extends Omit<ComponentProps<'button'>, 'className'> {
  variant: keyof typeof VARIANT_CLASS_NAMES;
  size?: keyof typeof SIZE_CLASS_NAMES;
}

export function Button({ variant, size = 'md', type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex cursor-pointer items-center justify-center rounded-md border px-lg text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-safe:transition motion-safe:duration-150 motion-safe:active:scale-95 aria-disabled:cursor-not-allowed aria-disabled:opacity-60 aria-disabled:active:scale-100 ${SIZE_CLASS_NAMES[size]} ${VARIANT_CLASS_NAMES[variant]}`}
      {...props}
    />
  );
}
