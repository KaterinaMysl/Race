import { brands, models } from './models';
import {
  LENGTH_COLORNAME, HEX_BASE, HEX_ZERO, MIN_HEX_LENGTH,
} from '../constants';

export type CarDetails = {
  [key: string | number]: number | string;
  id: number;
  time: number;
  name: string;
  color: string;
  wins: number;
};

export const generateRandomCarName = () => {
  const getRandomIndex = (max: number) => Math.floor(Math.random() * max);
  const randomBrandIndex = getRandomIndex(brands.length);
  const randomModelIndex = getRandomIndex(models.length);

  return `${brands[randomBrandIndex]} ${models[randomModelIndex]}`;
};

export const generateRandomColor = () => {
  const randomRGBComponent = () => Math.floor(Math.random() * LENGTH_COLORNAME);
  const red = randomRGBComponent().toString(HEX_BASE).padStart(MIN_HEX_LENGTH, HEX_ZERO);
  const green = randomRGBComponent().toString(HEX_BASE).padStart(MIN_HEX_LENGTH, HEX_ZERO);
  const blue = randomRGBComponent().toString(HEX_BASE).padStart(MIN_HEX_LENGTH, HEX_ZERO);
  return `#${red}${green}${blue}`;
};
