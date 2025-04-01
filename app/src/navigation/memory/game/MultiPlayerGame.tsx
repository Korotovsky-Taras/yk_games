import { useEffect, useState } from 'react';

import { MemorySettings } from '~/utils/memoryConfig';
import { GameMenuDialog, MultiPlayerGameOverDialog } from '~/components/memory/dialog';
import { PlayerList } from '~/components/memory/playerList';
import { useMemoryGame } from '~/hooks/useMemoryGame';
import { GameHeader } from './GameHeader';
import { GameGrid } from '~/components/memory/gameGrid';
import { Player } from '~/utils/memoryGame';

type DialogState = {
  players: Player[];
};

type Props = {
  settings: MemorySettings;
  goToSettings: () => void;
};

export function MultiPlayerGame({ settings, goToSettings }: Props) {
  const [isGameOverDialogOpen, setIsGameOverDialogOpen] = useState(false);
  const [isMenuDialogOpen, setIsMenuDialogOpen] = useState(false);
  const { state, isLocked, startNewGame, revealCard } = useMemoryGame(settings);
  const [dialogState, setDialogState] = useState<DialogState>({
    players: state.players,
  });

  useEffect(() => {
    if (state.pairsLeft === 0) {
      setDialogState({ players: state.players });
      setIsGameOverDialogOpen(true);
    }
  }, [state.pairsLeft, state.players]);

  const onRestart = () => {
    setIsGameOverDialogOpen(false);
    setIsMenuDialogOpen(false);
    startNewGame();
  };

  return (
    <>
      <GameMenuDialog open={isMenuDialogOpen} onClose={() => setIsMenuDialogOpen(false)} onRestart={onRestart} onNewGame={goToSettings} />

      <MultiPlayerGameOverDialog open={isGameOverDialogOpen} onRestart={onRestart} onSetupNewGame={goToSettings} players={dialogState.players} />

      <GameHeader onRestart={onRestart} goToSettings={goToSettings} />

      <main className="mx-auto flex w-grid flex-1 flex-col justify-center sm:w-grid-sm sm:px-[4.6rem] md:w-grid-md">
        <GameGrid cards={state.cards} gridSize={settings.grid} onCardClick={(index) => !isLocked && revealCard(index)} />
      </main>

      <footer>
        <PlayerList players={state.players} currentPlayer={state.currentPlayer} />
      </footer>
    </>
  );
}
