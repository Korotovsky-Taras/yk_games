import { ComponentProps, useState } from 'react';
import clsx from 'clsx';

import { MemorySettings, playersSettings, gridSettings } from '~/utils/memoryConfig';
import { Button } from '~/components/Button';
import { Selector } from '~/components/selector';
import { SettingLabel } from './SettingLabel';

type Props = { onDone: (settings: MemorySettings) => void } & Omit<ComponentProps<'div'>, 'children'>;

export function SettingsCard({ onDone, className, ...rest }: Props) {
  const [players, setPlayers] = useState<MemorySettings['players']>(playersSettings[0]);
  const [grid, setGrid] = useState<MemorySettings['grid']>(gridSettings[0]);

  const onStartClick = () => {
    onDone({ players, grid });
  };

  return (
    <div
      className={clsx(
        'flex flex-col rounded-xl bg-white px-6 pt-[1.3rem] pb-[1.5rem] tracking-tight sm:rounded-[1.25rem] sm:px-14 sm:pt-[3.6rem] sm:pb-[3.5rem]',
        className,
      )}
      {...rest}
    >
      <SettingLabel>Выберите число игроков</SettingLabel>
      <Selector name="players" options={playersSettings} value={players} onChange={setPlayers} groupAriaLabel="Select number of players" />

      <SettingLabel>Размер игры</SettingLabel>
      <Selector name="grid-size" options={gridSettings} value={grid} onChange={setGrid} groupAriaLabel="Select grid size" />

      <Button onClick={onStartClick} className="mt-[3rem]">
        Начать игру
      </Button>
    </div>
  );
}
