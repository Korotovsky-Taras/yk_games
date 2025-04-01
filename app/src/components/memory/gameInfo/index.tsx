import { formatTime } from '~/utils/time';
import { GameInfoItem } from './GameInfoItem';

type Props = { seconds: number; moves: number };

export function GameInfo({ seconds, moves }: Props) {
  return (
    <div className="grid grid-cols-2 gap-[1.4rem] sm:gap-[1.7rem]">
      <GameInfoItem valueClassName="timer" label="Время" value={formatTime(seconds)} />
      <GameInfoItem label="Шаги" value={moves.toString()} />
    </div>
  );
}
