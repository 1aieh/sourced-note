import type { ReactNode } from 'react';
import { ArrowUpRight, LinkedinLogo } from '@phosphor-icons/react';
import ljMark from './assets/lj-mark.png';
import { LINKEDIN, PORTFOLIO } from './links';
import classes from './OutLink.module.css';

/** An outbound link card: icon, title, a quiet line under it, and an arrow. */
export function OutLink({
  href,
  icon,
  title,
  sub,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  sub: string;
}) {
  return (
    <a className={classes.link} href={href} target="_blank" rel="noreferrer">
      <span className={classes.icon}>{icon}</span>
      <span className={classes.text}>
        <span className={classes.title}>{title}</span>
        <span className={classes.sub}>{sub}</span>
      </span>
      <ArrowUpRight className={classes.go} size={14} weight="bold" />
    </a>
  );
}

/** LinkedIn and the portfolio, side by side. */
export function AuthorLinks({ className, big }: { className?: string | undefined; big?: boolean }) {
  return (
    <div className={`${classes.pair} ${className ?? ''}`} data-big={big || undefined}>
      <OutLink
        href={LINKEDIN}
        icon={<LinkedinLogo size={22} weight="fill" />}
        title="LinkedIn"
        sub="Let's connect"
      />
      <OutLink
        href={PORTFOLIO}
        icon={<img src={ljMark} alt="" width={24} height={24} />}
        title="laieh.com"
        sub="Design portfolio"
      />
    </div>
  );
}
