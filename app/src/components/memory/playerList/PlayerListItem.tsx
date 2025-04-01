import clsx from 'clsx';

type Props = {
  playerName: string;
  playerColor: string;
  points: number;
  isCurrent: boolean;
};

export function PlayerListItem({ playerName, playerColor, points, isCurrent }: Props) {
  return (
    <div>
      <div
        className={clsx(
          'relative rounded pt-[0.4rem] pb-[0.75rem] shadow-2xl transition-colors sm:rounded-xl sm:pt-[0.65rem] sm:pb-[0.9rem] sm:pl-[1rem] sm:pr-[1.3rem] xl:pl-[1.35rem] xl:pt-[1.5rem] xl:pb-[1.5rem]',
          isCurrent && 'shadow-[inset_0_0_0_100px]',
          playerColor,
        )}
      >
        <svg
          viewBox="0 0 10 5"
          className={clsx(
            'absolute top-0 left-1/2 w-4 -translate-x-1/2 -translate-y-full fill-current transition-triangle sm:w-6 2xl:w-10',
            isCurrent ? 'h-2 sm:h-3 2xl:h-5' : 'h-0',
          )}
        >
          <polygon points="0 5, 5 0, 10 5" />
        </svg>
        <div className={clsx('flex flex-col items-center  xl:flex-row xl:items-center xl:justify-between ', isCurrent && 'text-[white]')}>
          <span className="font-bold sm:text-[0.9375rem] xl:text-[1.125rem]">
            <span className="sm:hidden">P</span>
            <span className="hidden sm:inline">Игрок </span>
            {playerName}
          </span>
          <span
            className={clsx(
              'mt-[0.25rem] text-[1.5rem] font-bold transition-colors duration-[25ms] ease-linear sm:mt-[0.5rem] sm:text-[1.5rem] xl:mt-0 xl:text-[2rem]',
            )}
          >
            {points}
          </span>
        </div>
      </div>
      <p
        className={clsx(
          'mt-5 hidden text-center text-[0.8125rem] text-sm font-bold uppercase tracking-[0.375em] text-neutral-800 transition-opacity 2xl:block',
          { 'opacity-0': !isCurrent, 'opacity-100': isCurrent },
        )}
      >
        Активный игрок
      </p>
    </div>
  );
}
