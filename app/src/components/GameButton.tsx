import { ComponentProps } from 'react';
import { useNavigate } from 'react-router-dom';

type ButtonProps = {
  path: string;
  title: string;
} & ComponentProps<'button'>;

export function GameButton({ path, title }: ButtonProps) {
  const navigate = useNavigate();

  const goesTo = (path: string) => {
    return () => navigate(path);
  };

  return (
    <button onClick={goesTo(`/${path}`)} className="relative  flex flex-col rounded-xl bg-white p-6 tracking-tight text-orange-50 sm:rounded-[1.25rem]">
      <img className="w-[10vw] min-w-[120px] max-w-[200px]" src={`./${path}.png`} alt={title} />
      <span className="absolute top-[100%] left-0 right-0 pt-[3vh] text-center text-[1.4em]">{title}</span>
    </button>
  );
}
