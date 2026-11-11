import type { AnchorHTMLAttributes, ReactNode } from 'react';
import classes from './AuthorPill.module.css';

/** A quiet pill where only the name is at full ink, e.g. "Prototype by **Laieh**". */
export function AuthorPill({
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode }) {
  return (
    <a className={classes.pill} {...props}>
      {children}
    </a>
  );
}
