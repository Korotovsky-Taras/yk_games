import { useNavigate } from 'react-router-dom';

export function HomeButton() {
  const navigate = useNavigate();

  return (
    <button onClick={() => navigate('/', { replace: true })} className="fixed top-[2em] left-[3em]">
      <img className="w-[60px]" src={`./home.svg`} alt="Домой" />
    </button>
  );
}
