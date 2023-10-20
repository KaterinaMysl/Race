import { getWinners, countAllWinners, getCarApi } from '../api/api';
import { createWinnerUI } from '../main';
import { CarDetails } from '../garage/additions';
import { PAGE_SIZE } from '../constants';

export let currentPageIndex = 1;

const winnersListContainer = <HTMLElement>document.querySelector('.container-win');
const numberOfWinners = <HTMLElement>document.querySelector('.count-winner');
const buttonPrevWinners = <HTMLButtonElement>document.querySelector('.prev-win');
const buttonNextWinners = <HTMLButtonElement>document.querySelector('.next-win');
const numPageWinners = <HTMLElement>document.querySelector('.count-page_winner');

const winsHeader: Element | null = document.querySelector('.table-winner thead th[data-sort-by="wins"]');
const bestTimeHeader: Element | null = document.querySelector('.table-winner thead th[data-sort-by="bestTime"]');

let sortByWins: 'asc' | 'desc' | undefined;
let sortByBestTime: 'asc' | 'desc' | undefined;

export const renderWinnersView = () => {
  let number = currentPageIndex * PAGE_SIZE - PAGE_SIZE;
  let sortBy: 'wins' | 'time' | undefined;
  if (sortByWins) {
    sortBy = 'wins';
  } else if (sortByBestTime) {
    sortBy = 'time';
  } else {
    sortBy = undefined;
  }

  getWinners(currentPageIndex, sortBy, sortByWins === 'desc' || sortByBestTime === 'desc').then((arr: CarDetails[]) => {
    winnersListContainer.innerHTML = '';

    arr.forEach((car) => {
      let name = '';
      let color = '';
      getCarApi(car.id).then((oneCar) => {
        name = oneCar.name;
        color = oneCar.color;
        number += 1;

        const winnerItem = createWinnerUI(number, color, name, car.wins, car.time);
        winnersListContainer.appendChild(winnerItem);
      });
    });

    numberOfWinners.textContent = `(${countAllWinners})`;

    if (currentPageIndex * PAGE_SIZE >= countAllWinners) {
      buttonNextWinners.setAttribute('disabled', 'disabled');
    } else {
      buttonNextWinners.removeAttribute('disabled');
    }
    if (currentPageIndex * PAGE_SIZE <= PAGE_SIZE) {
      buttonPrevWinners.setAttribute('disabled', 'disabled');
    } else {
      buttonPrevWinners.removeAttribute('disabled');
    }
  });
};
renderWinnersView();

if (winsHeader && bestTimeHeader) {
  winsHeader.addEventListener('click', () => {
    if (sortByWins === undefined) {
      sortByWins = 'asc';
    } else if (sortByWins === 'asc') {
      sortByWins = 'desc';
    } else {
      sortByWins = undefined;
    }
    sortByBestTime = undefined;
    renderWinnersView();
  });

  bestTimeHeader.addEventListener('click', () => {
    if (sortByBestTime === undefined) {
      sortByBestTime = 'asc';
    } else if (sortByBestTime === 'asc') {
      sortByBestTime = 'desc';
    } else {
      sortByBestTime = undefined;
    }
    sortByWins = undefined;
    renderWinnersView();
  });
}

function handleButtonClick(delta: number) {
  const newIndex = currentPageIndex + delta;
  if (newIndex === 1) {
    buttonPrevWinners.disabled = true;
  } else if (newIndex * PAGE_SIZE >= countAllWinners) {
    buttonNextWinners.disabled = true;
  } else {
    buttonPrevWinners.disabled = false;
    buttonNextWinners.disabled = false;
  }

  currentPageIndex = newIndex;
  numPageWinners.textContent = `${currentPageIndex}`;
  renderWinnersView();
}

buttonPrevWinners.addEventListener('click', () => {
  handleButtonClick(-1);
});

buttonNextWinners.addEventListener('click', () => {
  handleButtonClick(1);
});
