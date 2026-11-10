'use client';
import { Popover as BasePopover } from '@base-ui/react/popover';
import type { ComponentProps } from 'react';
import styles from './popover.module.css';

// shadcn/ui popover (Base UI flavour); styles adapted to this project's CSS tokens.
// Base UI handles outside clicks, Escape, focus return and touch: hover opening applies
// to mouse only, a tap toggles the popup.
type Styled<Props> = Omit<Props, 'className'> & { className?: string };
const merge = (...names: (string | undefined)[]) => names.filter(Boolean).join(' ');

export const Popover = BasePopover.Root;

export function PopoverTrigger({ className, ...props }: Styled<ComponentProps<typeof BasePopover.Trigger>>) {
  return <BasePopover.Trigger {...props} className={merge(styles.trigger, className)} />;
}

type ContentProps = Styled<ComponentProps<typeof BasePopover.Popup>> & Pick<ComponentProps<typeof BasePopover.Positioner>, 'side' | 'align' | 'sideOffset' | 'collisionPadding'> & {
  layer?: number;
};
export function PopoverContent({ className, side = 'top', align = 'center', sideOffset = 8, collisionPadding = 12, layer = 50, ...props }: ContentProps) {
  return <BasePopover.Portal>
    <BasePopover.Positioner side={side} align={align} sideOffset={sideOffset} collisionPadding={collisionPadding} style={{ zIndex: layer }}>
      <BasePopover.Popup {...props} className={merge(styles.content, className)} />
    </BasePopover.Positioner>
  </BasePopover.Portal>;
}
