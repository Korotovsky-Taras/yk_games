import { ReactNode } from 'react';
import { Dialog } from '@headlessui/react';
import { Button } from '~/components/Button';
import { AppDialog } from '~/components/AppDialog';

type Props = {
  open: boolean;
  title: string;
  subtitle: string;
  onRestart: () => void;
  onSetupNewGame: () => void;
  children: ReactNode;
};

export function GameOverDialog({ open, title, subtitle, onRestart, onSetupNewGame, children }: Props) {
  return (
     
    <AppDialog open={open} onClose={() => {}}>
      <Dialog.Title className="mt-[0.45rem] text-center text-2xl font-bold text-neutral-800 sm:text-[3rem]">{title}</Dialog.Title>
      <p className="mt-[0.45rem] text-center text-sm font-bold text-neutral-500 sm:mt-[2rem] sm:text-[1.125rem]">{subtitle}</p>
      {children}

      <div className="flex flex-col">
        <Button onClick={onRestart} className="mt-6">
          Пачаць нанова
        </Button>
        <Button onClick={onSetupNewGame} className="mt-4" appearance="secondary">
           Новая гульня
        </Button>
      </div>

    </AppDialog>
  );
}
