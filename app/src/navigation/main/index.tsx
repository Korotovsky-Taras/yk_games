import {GameButton} from '~/components/GameButton';
import {UpdateButton} from '~/components/UpdateButton';

export function Main() {
  return (
    <div className="align-center flex min-h-screen w-full items-center justify-center gap-x-[2vw] bg-neutral-800 ">
      <GameButton path={'memory'} title={'Запоминания'} />
      <GameButton path={'puzzle'} title={'Пазлы'} />
      <GameButton path={'drawing'} title={'Разукрашка'} />
      <UpdateButton />
    </div>
  );
}
