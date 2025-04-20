import { ComponentProps } from 'react';

const iconsById: { [key: string]: string } = {
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
};

function getIconUrl(iconId: string) {
  const icon = iconsById[iconId];
  if (!icon) {
    throw new Error(`There is no icon for the id ${iconId}`);
  }
  return `./memory/${icon}`;
}

type Props = {
  iconId: string;
} & ComponentProps<'img'>;

function Icon({ iconId, ...rest }: Props) {
  const iconUrl = getIconUrl(iconId);
  return <img src={iconUrl} alt={iconId} {...rest} />;
}

export { Icon };
