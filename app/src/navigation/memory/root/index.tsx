import { SettingsCard } from '~/components/memory/settings/SettingsCard';
import { useNavigate } from 'react-router-dom';
import { HomeButton } from '~/components/HomeButton';

export function MemoryRoot() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen w-full items-center bg-neutral-800 px-6 sm:px-0">
      <HomeButton />
      <div className="sm:max-h-unset mx-auto flex w-content flex-col justify-center pt-[0.875] pb-[2.625rem] sm:w-content-sm sm:pt-[1.5rem] sm:pb-[0.75rem] md:w-content-md">
        <header>
          <h1 className="flex items-center justify-center text-center text-[2rem] font-bold text-white sm:text-[2.5rem]">
            <img className="w-[60px]" src={`./memory.png`} alt="Запамінанні" />
            <span className="pl-[20px]">Запамінанні</span>
          </h1>
        </header>
        <main className="mt-[3.25rem] sm:px-[1rem] md:mt-[4rem]">
          <SettingsCard
            onDone={(settings) => {
              navigate('/memory/game', { state: settings });
            }}
          />
        </main>
      </div>
    </div>
  );
}
