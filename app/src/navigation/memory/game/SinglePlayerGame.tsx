import { useEffect, useState } from 'react';

import { MemorySettings } from '~/utils/memoryConfig';
import { useTimer } from '~/hooks/useTimer';
import { useMemoryGame } from '~/hooks/useMemoryGame';
import { SinglePlayerGameOverDialog } from '~/components/memory/dialog';
import { GameInfo } from '~/components/memory/gameInfo';
import { GameGrid } from '~/components/memory/gameGrid';
import { GameHeader } from './GameHeader';

type DialogState = {
  seconds: number;
  moves: number;
};

type Props = {
  settings: MemorySettings;
  goToSettings: () => void;
};

export function SinglePlayerGame({ settings, goToSettings }: Props) {
  const [isGameOverDialogOpen, setIsGameOverDialogOpen] = useState(false);
  const [dialogState, setDialogState] = useState<DialogState>({
    seconds: 0,
    moves: 0,
  });
  const { timerSeconds, setIsTimerRunning, resetTimer } = useTimer();

  const { state, isLocked, startNewGame, revealCard } = useMemoryGame(settings);

  useEffect(() => {
    if (state.pairsLeft === 0) {
      setIsTimerRunning(false);
      setDialogState({ seconds: timerSeconds, moves: state.moves });
      setIsGameOverDialogOpen(true);
    }
  }, [state.pairsLeft, state.moves, timerSeconds, setIsTimerRunning]);

  const onRestart = () => {
    resetTimer();
    startNewGame();
    setIsGameOverDialogOpen(false);
  };

  return (
    <>
      <SinglePlayerGameOverDialog
        open={isGameOverDialogOpen}
        seconds={dialogState.seconds}
        moves={dialogState.moves}
        onRestart={onRestart}
        onSetupNewGame={goToSettings}
      />

      <GameHeader onRestart={onRestart} goToSettings={goToSettings} />

      <div className="mx-auto flex w-grid flex-1 flex-col sm:w-grid-sm sm:px-[2rem] sm:pb-[0.7rem] md:w-grid-md md:px-[4.6rem]">
        <main className="flex flex-1 flex-col justify-center">
          <GameGrid cards={state.cards} gridSize={settings.grid} onCardClick={(index) => !isLocked && revealCard(index)} />
        </main>

        <footer>
          <GameInfo seconds={timerSeconds} moves={state.moves} />
        </footer>
      </div>
    </>
  );
}
