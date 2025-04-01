import { useEffect, useState } from 'react';
import { Button } from '~/components/Button';
import { GameMenuDialog } from '~/components/memory/dialog';

type Props = {
  onRestart: () => void;
  goToSettings: () => void;
};

export function GameHeader({ onRestart, goToSettings }: Props) {
  const [isMenuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onResize = () => isMenuOpen && setMenuOpen(false);

    window.addEventListener('resize', onResize);

    return () => window.removeEventListener('resize', onResize);
  }, [isMenuOpen]);

  return (
    <header className="flex items-center justify-between">
      <Button className="fixed top-[2em] right-[2em]" size="small" onClick={() => setMenuOpen(true)}>
        Меню
      </Button>
      <GameMenuDialog open={isMenuOpen} onClose={() => setMenuOpen(false)} onRestart={onRestart} onNewGame={goToSettings} />
    </header>
  );
}
