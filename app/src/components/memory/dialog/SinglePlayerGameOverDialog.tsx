import { formatTime } from '~/utils/time';
import { GameOverDialog } from './GameOverDialog';
import { InfoListItem } from './InfoListItem';
import { getStepsWord } from '~/utils/memoryWords';

type Props = {
  open: boolean;
  seconds: number;
  moves: number;
  onRestart: () => void;
  onSetupNewGame: () => void;
};

export function SinglePlayerGameOverDialog({ seconds, moves, ...rest }: Props) {
  return (
    <GameOverDialog title="Победа!" subtitle="Результаты игры:" {...rest}>
      <div className="mt-6 sm:mt-10">
        <InfoListItem appearance="secondary" label="Прошедшее время" value={formatTime(seconds)} valueClassName="timer" />
        <InfoListItem appearance="secondary" label="Предпринятые шаги" value={getStepsWord(moves)} />
      </div>
    </GameOverDialog>
  );
}
