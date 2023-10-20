import {
  countCars,
  updateCarApi,
  createCarApi,
  deleteCarApi,
  getCarsApi,
  getCarApi,
  getAllWinners,
  deleteWinner,
} from '../api/api';
import { createCarUI } from '../main';
import { generateRandomCarName, generateRandomColor, CarDetails } from './additions';
import { renderWinnersView } from '../winner/buttons';
import { resetRace } from './drive';
import { NUMCARS_GARAGE_PAGE, NUM_NEWCARS } from '../constants';

const carsContainer = <HTMLElement>document.querySelector('.container-car');
const currentPageNumber = <HTMLSpanElement>document.querySelector('.count-page');
const generateCarsButtonElement = <HTMLElement>document.querySelector('.button-generate_cars');
const prevCarsButtonElement = <HTMLButtonElement>document.querySelector('.button-prev');
const nextCarsButtonElement = <HTMLButtonElement>document.querySelector('.button-next');
const updateCarButtonElement = <HTMLInputElement>document.querySelector('.button-update');
const generateNewCarButton = <HTMLElement>document.querySelector('.generate-cars');
const carsCount = <HTMLElement>document.querySelector('.count-cars');
const inputUpdateColor = <HTMLInputElement>document.querySelector('.color-update');
const inputCreateColor = <HTMLInputElement>document.querySelector('.color-create');
const inputCreateText = <HTMLInputElement>document.querySelector('.text-create');
const inputUpdateText = <HTMLInputElement>document.querySelector('.text-update');

let selectedCarId: number;

export let currentPageIndex = 1;

export const displayCars = () => {
  getCarsApi(currentPageIndex).then((arr: CarDetails[]) => {
    carsContainer.innerHTML = '';
    arr.forEach((car) => {
      const carElement = createCarUI(car.id, car.name, car.color);
      carsContainer.appendChild(carElement);
    });
    carsCount.textContent = `(${countCars})`;
    if (currentPageIndex * NUMCARS_GARAGE_PAGE >= countCars) {
      nextCarsButtonElement.setAttribute('disabled', 'disabled');
    } else {
      nextCarsButtonElement.removeAttribute('disabled');
    }
    if (currentPageIndex * NUMCARS_GARAGE_PAGE <= NUMCARS_GARAGE_PAGE) {
      prevCarsButtonElement.setAttribute('disabled', 'disabled');
    } else {
      prevCarsButtonElement.removeAttribute('disabled');
    }
  });
};
displayCars();

document.addEventListener('click', async (event) => {
  const button = event.target as HTMLElement;

  if (button.classList.contains('car-options_select')) {
    selectedCarId = Number(button.dataset.select);
    updateCarButtonElement.disabled = false;
    inputUpdateText.disabled = false;
    inputUpdateColor.disabled = false;
    getCarApi(selectedCarId).then((item) => {
      inputUpdateText.value = item.name;
      inputUpdateColor.value = item.color;
    });
  }

  if (button.classList.contains('car-options_remove')) {
    const idButton = Number(button.dataset.remove);
    deleteCarApi(idButton).then(() => displayCars());
    getAllWinners()
      .then((arrAllWin) => {
        arrAllWin.forEach((item: CarDetails) => {
          if (Number(item.id) === idButton) deleteWinner(idButton);
        });
      })
      .then(() => renderWinnersView());
  }
});

generateNewCarButton.addEventListener('click', (event) => {
  const element = event.target as HTMLElement;
  if (element.classList.contains('button-create')) {
    const nameNewCar = inputCreateText.value;
    const colorNewCar = inputCreateColor.value;

    if (!nameNewCar) {
      event.preventDefault();
      inputCreateText.style.backgroundColor = '#c96256';
      setTimeout(() => {
        inputCreateText.style.backgroundColor = '';
      }, 1000);
    } else {
      createCarApi({
        name: nameNewCar,
        color: colorNewCar,
      }).then(() => displayCars());
    }
    inputCreateText.value = '';
  }
  if (element.classList.contains('button-update')) {
    const nameUpdateCar = inputUpdateText.value;
    const colorUpdateCar = inputUpdateColor.value;
    const carData = {
      name: nameUpdateCar,
      color: colorUpdateCar,
    };
    updateCarApi(carData, selectedCarId)
      .then(() => displayCars());
    inputUpdateText.value = '';
    inputUpdateText.disabled = true;
    inputUpdateColor.disabled = true;
    updateCarButtonElement.disabled = true;
  }
});

prevCarsButtonElement.addEventListener('click', () => {
  if (currentPageIndex === 1) {
    prevCarsButtonElement.setAttribute('disabled', 'disabled');
  } else {
    nextCarsButtonElement.removeAttribute('disabled');
    currentPageIndex -= 1;
    currentPageNumber.textContent = `${currentPageIndex}`;
  }
  displayCars();
  resetRace();
});

nextCarsButtonElement.addEventListener('click', () => {
  if (currentPageIndex * NUMCARS_GARAGE_PAGE >= countCars) {
    nextCarsButtonElement.setAttribute('disabled', 'disabled');
  } else {
    prevCarsButtonElement.removeAttribute('disabled');
    currentPageIndex += 1;
    currentPageNumber.textContent = `${currentPageIndex}`;
  }
  displayCars();
  resetRace();
});

generateCarsButtonElement.addEventListener('click', async () => {
  for (let i = 0; i < NUM_NEWCARS; i += 1) {
    const name = generateRandomCarName();
    const color = generateRandomColor();
    createCarApi({
      name: `${name}`,
      color: `${color}`,
    });
  }
  displayCars();
  nextCarsButtonElement.removeAttribute('disabled');
});
