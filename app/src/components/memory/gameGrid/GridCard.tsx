import clsx from 'clsx';
import { ComponentProps } from 'react';
import { Card } from '~/utils/memoryGame';

type Props = {
  card: Card;
  size?: 'normal' | 'large';
} & ComponentProps<'button'>;

export function GridCard({ card, size = 'normal', onClick, ...rest }: Props) {
  return (
    <button
      tabIndex={card.state === 'hidden' ? 0 : -1}
      disabled={card.state !== 'hidden'}
      value={card.value}
      onClick={onClick}
      className={clsx(
        'transform-style-preserve-3d flex aspect-square items-center justify-center text-[2.5rem] font-bold transition-all duration-500 sm:text-[3.5rem]',
        {
          'rotate-y-180': card.state === 'visible' || card.state === 'revealed',
        },
        card.color,
      )}
      data-testid="grid-card"
      {...rest}
    >
      <div
        className={clsx('transform-style-preserve-3d relative h-full w-full rounded-[16px] transition-transform duration-500  focus:outline-none', {
          'text-neutral-700': card.state === 'hidden' || card.state === 'revealed',
          'bg-neutral-700': card.state === 'hidden' || card.state === 'revealed',
          'text-2xl sm:text-[2.75rem]': size === 'normal',
          'text-[2.5rem] sm:text-[3.5rem]': size === 'large',
        })}
      >
        <div className="backface-hidden absolute flex h-full w-full items-center justify-center rounded-[50%]"></div>
        <div className="backface-hidden transform-rotate-y-180 absolute flex h-full w-full items-center justify-center rounded-[16px] shadow-[inset_0_0_0_100px]">
         <img src={`./memory/${card.iconUrl}`} alt={card.value} className={'w-full h-full max-w-[95%] max-h-[95%] rounded-[14px]'} />
        </div>
      </div>
    </button>
  );
}
