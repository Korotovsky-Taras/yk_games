import { AppDialog } from '~/components/AppDialog';
import { Button } from '~/components/Button';

type Props = {
  open: boolean;
  onClose: () => void;
  onRestart: () => void;
  onNewGame: () => void;
};

export function GameMenuDialog({ open, onClose, onRestart, onNewGame }: Props) {
  const handleRestart = () => {
    onRestart();
    onClose();
  };
  return (
    <AppDialog open={open} onClose={onClose}>
      <Button onClick={handleRestart}>Начать заново</Button>
      <Button appearance="secondary" onClick={onNewGame} className="mt-3">
        Новая игра
      </Button>
      <Button appearance="secondary" onClick={onClose} className="mt-3">
        Вернуться в игру
      </Button>
    </AppDialog>
  );
}
