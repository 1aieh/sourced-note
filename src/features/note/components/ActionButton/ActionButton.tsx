import { Button } from '@mantine/core';
import type { ButtonProps, ElementProps } from '@mantine/core';
import classes from './ActionButton.module.css';

export type ActionTone = 'primary' | 'secondary' | 'quiet' | 'record';

type Props = ButtonProps & ElementProps<'button', keyof ButtonProps> & { tone?: ActionTone };

/** The product's pill button: Mantine's Button with the note's four tones. */
export function ActionButton({ tone = 'primary', className, ...props }: Props) {
  return (
    <Button
      {...props}
      data-tone={tone}
      className={className ? `${classes.button} ${className}` : classes.button}
      classNames={{ section: classes.section }}
    />
  );
}
