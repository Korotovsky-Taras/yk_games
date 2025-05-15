import { MemorySettings } from '~/utils/memoryConfig';

export const CardIcons = {
  '0': 'image-01.png',
  '1': 'image-02.png',
  '2': 'image-03.png',
  '3': 'image-04.png',
  '4': 'image-05.png',
  '5': 'image-06.png',
  '6': 'image-07.png',
  '7': 'image-08.png',
  '8': 'image-09.png',
  '9': 'image-10.png',
  '10': 'image-11.png',
  '11': 'image-12.png',
  '12': 'image-13.png',
  '13': 'image-14.png',
  '14': 'image-15.png',
  '15': 'image-16.png',
  '16': 'image-17.png',
  '17': 'image-18.png',
  '18': 'image-19.png',
  '19': 'image-20.png',
  '20': 'image-21.png',
  '21': 'image-22.png',
  '22': 'image-23.png',
  '23': 'image-24.png',
  '24': 'image-25.png',
  '25': 'image-26.png',
}

export type Card = {
  id: string;
  value: string;
  state: 'hidden' | 'revealed' | 'visible';
  iconUrl: string;
  color?: string;
};

export type Player = {
  name: string;
  points: number;
  color: string;
};

export type GameState = {
  players: Player[];
  currentPlayer: number;
  cards: Card[];
  pairsLeft: number;
  revealed: number[];
  moves: number;
};

export function createGame(settings: MemorySettings): GameState {
  const pairCount = getPairCount(settings);

  return {
    players: getPlayers(settings),
    currentPlayer: 0,
    cards: randomizeCards(getCards(pairCount)),
    pairsLeft: pairCount,
    revealed: [],
    moves: 0,
  };
}

export function getPairCount(settings: MemorySettings) {
  switch (settings.grid) {
    case '4x4':
      return (4 * 4) / 2;
    case '6x6':
      return (6 * 6) / 2;
  }
}

export function getPlayerColor(index: number): string {
  return ['text-green-500', 'text-blue-500', 'text-purple-500', 'text-red-500'][index] || 'text-blue-500';
}

export function getPlayers(settings: MemorySettings) {
  const players: Player[] = [];
  const playerCount = parseInt(settings.players);

  for (let i = 1; i <= playerCount; i++) {
    players.push({ name: String(i), points: 0, color: getPlayerColor(i - 1) });
  }

  return players;
}

function getRandomIconKeys(count: number): string[] {
  const allKeys = Object.keys(CardIcons);
  const shuffled = [...allKeys].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export function getCards(pairs: number): Card[] {
  const cards: Card[] = [];
  const randomIconKeys = getRandomIconKeys(pairs);

  for (const iconKey of randomIconKeys) {
    const iconUrl = CardIcons[iconKey as keyof typeof CardIcons];
    cards.push(
        { id: `${iconKey}-1`, value: iconKey, state: 'hidden', iconUrl },
        { id: `${iconKey}-2`, value: iconKey, state: 'hidden', iconUrl }
    );
  }
  return cards;
}

export function randomizeCards(cards: Card[]) {
  const copy = [...cards];

  const randomized: Card[] = [];

  let i = copy.length;
  while (i > 0) {
    const rIndex = Math.floor(Math.random() * i);
    randomized.push(copy[rIndex]);
    copy.splice(rIndex, 1);
    i--;
  }

  return randomized;
}
