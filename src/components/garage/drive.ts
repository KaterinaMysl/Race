import {
  getCarsApi,
  getCarApi,
  startMotorApi,
  driveMotorApi,
  stopMotorApi,
  createWinner,
  getAllWinners,
  updateWinner,
} from '../api/api';
import { renderWinnersView } from '../winner/buttons';
import { currentPageIndex } from './buttons';
import { CarDetails } from './additions';
import {
  NUMCARS_GARAGE_PAGE,
  DECIMAL_PRECISION,
  MILLISECONDS_IN_SECOND,
  CAR_START_POSITION_PERCENT,
  CAR_START_POSITION_PIXELS,
  INITIAL_TRANSLATION_X,
  ANIMATION_PROGRESS_LIMIT,
} from '../constants';

const resetRaceButton = <HTMLButtonElement>document.querySelector('.button-reset');
const raceButton = <HTMLButtonElement>document.querySelector('.button-race');
const startRaceButton = <HTMLButtonElement>document.querySelector('.button-race');
const stopRaceButton = <HTMLButtonElement>document.querySelector('.button-reset');
const noticeWinner = <HTMLElement>document.querySelector('.winner-notice');
const containerRace = <HTMLElement>document.querySelector('.zone-control');
const infoAnimation: { [id: number]: CarDetails } = {};

let time: number;
let resultRace: HTMLElement[] = [];

function updateWinsAndTime(
  currentWins: number,
  currentTimeWin: string,
  item: CarDetails,
  idWinner: number,
) {
  if (Number(item.id) === idWinner) {
    const updatedWins = item.wins + 1;
    const updatedTimeWin = (
      Number(item.time) < Number(currentTimeWin) ? item.time : currentTimeWin).toString();
    return { wins: updatedWins, timeWin: updatedTimeWin };
  }

  return { wins: currentWins, timeWin: currentTimeWin };
}

function addWinner(carWinner: HTMLElement, timeWinner: number) {
  const idWinner = Number(carWinner.dataset.car);
  let timeWin = (timeWinner / MILLISECONDS_IN_SECOND).toFixed(DECIMAL_PRECISION);
  let wins = 1;
  let nameWinner;

  getCarApi(idWinner).then((arr) => {
    nameWinner = arr.name;
    noticeWinner.innerHTML = `${nameWinner} was the first to go! (${timeWin}s)`;
    noticeWinner.classList.add('win');
  });

  getAllWinners()
    .then((arrAllWin: CarDetails[]) => {
      arrAllWin.forEach((item) => {
        const updatedWinsAndTime = updateWinsAndTime(wins, timeWin, item, idWinner);
        wins = updatedWinsAndTime.wins;
        timeWin = updatedWinsAndTime.timeWin;
      });
    })
    .then(() => {
      if (wins > 1) {
        updateWinner(
          {
            wins,
            time: timeWin,
          },
          idWinner,
        );
      } else {
        createWinner({
          id: idWinner,
          wins,
          time: timeWin,
        });
      }
    })
    .then(() => renderWinnersView());
}

function animationCar(car: HTMLElement, distance: number, duration: number) {
  let startTime = 0;
  const idAnim = <CarDetails>{};

  function step(timestamp: number) {
    if (!startTime) {
      startTime = timestamp;
    }
    const progress = (timestamp - startTime) / duration;
    const translate: number = progress * distance;
    car.style.transform = `translateX(${translate}px)`;

    if (progress < ANIMATION_PROGRESS_LIMIT) {
      idAnim.id = window.requestAnimationFrame(step);
    }
    if (progress >= ANIMATION_PROGRESS_LIMIT && !resetRaceButton.hasAttribute('disabled')) {
      if (resultRace.length === 0) {
        addWinner(car, duration);
      }
      resultRace.push(car);
    }
  }
  idAnim.id = window.requestAnimationFrame(step);
  return idAnim;
}

const startCar = async (idCar: number) => {
  startMotorApi(idCar).then((obj) => {
    const carVelocity = Number(obj.velocity);
    const carDistance = Number(obj.distance);
    time = carDistance / carVelocity;

    const car = <HTMLElement>document.getElementById(`car-${idCar}`);
    const screenWidth = document.body.clientWidth;
    const carStartPosition = (screenWidth / CAR_START_POSITION_PIXELS)
      * CAR_START_POSITION_PERCENT;
    const animationDistance = screenWidth - carStartPosition;

    infoAnimation[idCar] = animationCar(car, animationDistance, time);

    driveMotorApi(idCar).then((drive) => {
      if (!drive.success) {
        window.cancelAnimationFrame(infoAnimation[idCar].id);
      }
    });
  });
};

export const stopCar = async (idStop: number) => {
  stopMotorApi(idStop).then(() => {
    window.cancelAnimationFrame(infoAnimation[idStop].id);
    const car = <HTMLElement>document.getElementById(`car-${idStop}`);
    car.style.transform = `translateX(${INITIAL_TRANSLATION_X}px)`;
  });
};

const startRaceCars = async (page: number) => {
  getCarsApi(page, NUMCARS_GARAGE_PAGE)
    .then((arrCars: CarDetails[]) => arrCars.forEach((elem) => startCar(elem.id)));
};

export const stopRaceCars = async (page: number) => {
  getCarsApi(page, NUMCARS_GARAGE_PAGE)
    .then((arrCars: CarDetails[]) => arrCars.forEach((elem) => stopCar(elem.id)));
  resultRace = [];
  noticeWinner.innerHTML = '';
  noticeWinner.classList.remove('win');
};

export function resetRace() {
  if (!resetRaceButton.hasAttribute('disabled')) {
    resetRaceButton.setAttribute('disabled', 'disabled');
    raceButton.removeAttribute('disabled');
    resultRace = [];
    noticeWinner.innerHTML = '';
    noticeWinner.classList.remove('win');
  }
}

function handleCarControlClick(idCar: number, action: 'start' | 'stop') {
  if (action === 'start') {
    startCar(idCar);
  } else if (action === 'stop') {
    stopCar(idCar);
  }

  const buttonStart = <HTMLButtonElement>document.getElementById(`start-${idCar}`);
  const buttonStop = <HTMLButtonElement>document.getElementById(`stop-${idCar}`);

  if (buttonStart && buttonStop) {
    buttonStart.disabled = action === 'start';
    buttonStop.disabled = action === 'stop';
  }
}

document.addEventListener('click', async (event) => {
  const button = event.target as HTMLElement;

  if (button.classList.contains('car-control_start')) {
    handleCarControlClick(Number(button.dataset.start), 'start');
  }

  if (button.classList.contains('car-control_stop')) {
    handleCarControlClick(Number(button.dataset.stop), 'stop');
  }
});

function handleRaceButtonClick() {
  startRaceCars(currentPageIndex);
  startRaceButton.disabled = true;
  stopRaceButton.disabled = false;
}

function handleResetButtonClick() {
  stopRaceCars(currentPageIndex);
  stopRaceButton.disabled = true;
  startRaceButton.disabled = false;
}

containerRace.addEventListener('click', async (event) => {
  const button = event.target as HTMLElement;

  if (button.classList.contains('button-race')) {
    handleRaceButtonClick();
  }

  if (button.classList.contains('button-reset')) {
    handleResetButtonClick();
  }
});
