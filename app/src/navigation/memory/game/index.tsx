import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import { MemorySettings } from '~/utils/memoryConfig';
import { MultiPlayerGame } from './MultiPlayerGame';
import { SinglePlayerGame } from './SinglePlayerGame';
import { HomeButton } from '~/components/HomeButton';

export function MemoryGame() {
  const location = useLocation();
  const settings = location.state as MemorySettings;
  const navigate = useNavigate();

  if (!settings) {
    return <Navigate to="/" replace />;
  }

  const goToSettings = () => navigate('/memory', { replace: true });

  return (
    <div className="relative mx-auto flex min-h-screen w-content flex-col py-6 xs:w-content-xs sm:w-content-sm sm:pt-9 sm:pb-[2.35rem] md:w-content-md lg:w-content-lg 2xl:w-content-2xl 2xl:pt-[4.2rem] 2xl:pb-[2.05rem]">
      <HomeButton />
      {settings.players === '1' ? (
        <SinglePlayerGame settings={settings} goToSettings={goToSettings} />
      ) : (
        <MultiPlayerGame settings={settings} goToSettings={goToSettings} />
      )}
    </div>
  );
}
