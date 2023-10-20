import {
  NUMCARS_GARAGE_PAGE,
  BASE_URL,
  HTTP_SUCCESS_CODE,
  PAGE_SIZE,
} from '../constants';

export const garage = `${BASE_URL}/garage`;
export let countCars = 0;
const headers = {
  'Content-Type': 'application/json',
};

export const getCarApi = async (id: number) => {
  const response = await fetch(`${garage}/${id}`, { method: 'GET' });
  return response.json();
};

export const getCarsApi = async (page: number, limit = NUMCARS_GARAGE_PAGE) => {
  const response = await fetch(`${garage}?_page=${page}&_limit=${limit}`, { method: 'GET' });
  countCars = Number(response.headers.get('X-Total-count'));
  return response.json();
};

export const createCarApi = async (body: object) => {
  await fetch(garage, {
    method: 'POST',
    body: JSON.stringify(body),
    headers,
  });
};

export const updateCarApi = async (body: object, id: number) => {
  await fetch(`${garage}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
    headers,
  });
};

export const deleteCarApi = async (id: number) => {
  await fetch(`${garage}/${id}`, {
    method: 'DELETE',
  });
};

export const motor = `${BASE_URL}/engine`;

export const driveMotorApi = async (id: number) => {
  const res = await fetch(`${motor}?id=${id}&status=drive`, { method: 'PATCH' }).catch();
  return res.status !== HTTP_SUCCESS_CODE ? { success: false } : { ...(await res.json()) };
};

export const startMotorApi = async (id: number) => (await fetch(`${motor}?id=${id}&status=started`, { method: 'PATCH' })).json();

export const stopMotorApi = async (id: number) => (await fetch(`${motor}?id=${id}&status=stopped`, { method: 'PATCH' })).json();

const winnersUrl = `${BASE_URL}/winners`;
export let countAllWinners = 0;

export const getAllWinners = async () => {
  const response = await fetch(`${winnersUrl}`, { method: 'GET' });
  return response.json();
};

export const getWinners = async (
  page: number,
  sortBy?: 'wins' | 'time',
  sortDescending?: boolean,
  limit = PAGE_SIZE,
) => {
  let searchParams = `_page=${page}&_limit=${limit}`;
  if (sortBy) {
    searchParams += `&_sort=${sortBy}&_order=${sortDescending ? 'desc' : 'asc'}`;
  }
  const response = await fetch(`${winnersUrl}?${searchParams}`, { method: 'GET' });
  countAllWinners = Number(response.headers.get('X-Total-count'));
  return response.json();
};

export const getWinner = async (id: number) => (await fetch(`${winnersUrl}/${id}`, { method: 'GET' })).json();

export const createWinner = async (body: object) => {
  await fetch(winnersUrl, {
    method: 'POST',
    body: JSON.stringify(body),
    headers,
  });
};

export const updateWinner = async (body: object, id: number) => {
  await fetch(`${winnersUrl}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
    headers,
  });
};

export const deleteWinner = async (id: number) => {
  await fetch(`${winnersUrl}/${id}`, {
    method: 'DELETE',
  });
};
