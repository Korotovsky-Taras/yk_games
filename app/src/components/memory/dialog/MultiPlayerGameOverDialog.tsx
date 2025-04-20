import { Player } from '~/utils/memoryGame';
import { getPointsWord } from '~/utils/memoryWords';
import { GameOverDialog } from './GameOverDialog';
import { InfoListItem } from './InfoListItem';

type Props = {
  open: boolean;
  onRestart: () => void;
  onSetupNewGame: () => void;
  players: Player[];
};

export function MultiPlayerGameOverDialog({ players, ...rest }: Props) {
  const sortedPlayers = players.slice().sort((a, b) => b.points - a.points);
  const winnerPoints = sortedPlayers[0].points;
  const isDraw = sortedPlayers[0].points === sortedPlayers[1].points;

  return (
    <GameOverDialog title={isDraw ? 'Нічыя!' : `Перамога гульца ${sortedPlayers[0].name}!`} subtitle="Вынікі гульні:" {...rest}>
      <div className="mt-[1.375rem] md:mt-[2.5rem] md:mb-4">
        {sortedPlayers.map((player) => {
          const isWinner = player.points === winnerPoints;

          return (
            <InfoListItem
              appearance={isWinner ? 'primary' : 'secondary'}
              key={player.name}
              label={`Гулец ${player.name}${isWinner ? ' (Пераможца!)' : ''}`}
              value={getPointsWord(player.points)}
            ></InfoListItem>
          );
        })}
      </div>
    </GameOverDialog>
  );
}
