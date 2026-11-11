import { UnstyledButton, useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import { Moon, Sun } from '@phosphor-icons/react';
import classes from './ThemeToggle.module.css';

/** Light by default. Mantine keeps the choice in this browser. */
export function ThemeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const scheme = useComputedColorScheme('light');
  const next = scheme === 'dark' ? 'light' : 'dark';
  return (
    <UnstyledButton
      className={classes.toggle}
      onClick={() => setColorScheme(next)}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
    >
      <span className={classes.icon} data-on={scheme === 'light' || undefined}>
        <Sun size={16} weight="fill" />
      </span>
      <span className={classes.icon} data-on={scheme === 'dark' || undefined}>
        <Moon size={16} weight="fill" />
      </span>
    </UnstyledButton>
  );
}
