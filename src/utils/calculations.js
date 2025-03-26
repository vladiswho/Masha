// src/utils/calculations.js
import Papa from 'papaparse';

// Данные о классах болтов
const boltClassData = [
  { class: "8.8", strength: 830, reliability: 1.25, responsibility: "Пониженный" },
  { class: "10.9", strength: 1040, reliability: 1.25, responsibility: "Нормальный" },
  { class: "12.9", strength: 1220, reliability: 1.25, responsibility: "Повышенный" },
];

// Данные о шагах болтов
const boltSpacingData = {
  minCenterDistance: (yieldStrength) => (yieldStrength < 540 ? 2.5 : 3),
  maxCenterDistance: 16,
  minEdgeDistance: (yieldStrength) => (yieldStrength < 540 ? 2 : 2.5),
  maxEdgeDistance: 4,
};

// Площади болтов (в см²)
const boltAreas = {
  16: 2.01,
  20: 3.14,
  24: 3.52,
  30: 7.07,
};

// Загрузка данных о двутаврах из CSV
export const loadBeamData = async () => {
  const response = await fetch('/двутавр.csv');
  if (!response.ok) throw new Error('Не удалось загрузить двутавр.csv');
  const reader = response.body.getReader();
  const result = await reader.read();
  const decoder = new TextDecoder('utf-8');
  const csv = decoder.decode(result.value);
  return Papa.parse(csv, { header: true }).data;
};

// Загрузка данных о стали из CSV
export const loadSteelData = async () => {
  const response = await fetch('/сталь.csv');
  if (!response.ok) throw new Error('Не удалось загрузить сталь.csv');
  const reader = response.body.getReader();
  const result = await reader.read();
  const decoder = new TextDecoder('utf-8');
  const csv = decoder.decode(result.value);
  return Papa.parse(csv, { header: true }).data;
};

// Получение данных о двутавре
export const getBeamData = (beamData, beamNumber) => {
  return beamData.find((beam) => beam['Номер двутавра'] === beamNumber);
};

// Получение данных о стали
export const getSteelData = (steelData, steelGrade) => {
  return steelData.find((steel) => steel['Сталь'] === steelGrade);
};

// Получение класса болтов
export const getBoltClass = (responsibilityLevel) => {
  return boltClassData.find((bolt) => bolt.responsibility === responsibilityLevel);
};

// Округление вверх до 10
const roundUpToTen = (value) => Math.ceil(value / 10) * 10;

// Округление вниз до 10
const roundDownToTen = (value) => Math.floor(value / 10) * 10;

// Проверка шага болтов
const checkBoltSpacing = (n, d, length, Ry) => {
  const minStep = boltSpacingData.minCenterDistance(Ry) * d;
  const minEdge = boltSpacingData.minEdgeDistance(Ry) * d;
  const boltsPerSide = n / 2;
  const requiredLength = 2 * minEdge + (boltsPerSide - 1) * minStep;
  if (requiredLength > length) {
    const maxBoltsPerSide = Math.floor((length - 2 * minEdge) / minStep) + 1;
    return Math.max(2, maxBoltsPerSide * 2);
  }
  return n;
};

// Подбор болтов
const adjustBolts = (force, initialDiameter, t_min, length, Rbs, Rbp, Ry, ns = 2) => {
  const diameters = Object.keys(boltAreas).map(Number).sort((a, b) => a - b);
  let d = initialDiameter;
  let n = 2;
  let diameterIndex = diameters.indexOf(d);
  let iteration = 0;
  const maxIterations = 100;

  while (iteration < maxIterations) {
    const Ab = boltAreas[d];
    const shearCapacity = (Rbs * Ab * ns) / 10; // кН
    const crushCapacity = (Rbp * d * t_min) / 1000; // кН
    const Nb = force / n;

    if (Nb <= shearCapacity && Nb <= crushCapacity) {
      const adjustedN = checkBoltSpacing(n, d, length, Ry);
      if (adjustedN === n || force / adjustedN <= shearCapacity && force / adjustedN <= crushCapacity) {
        return { diameter: d, count: adjustedN };
      }
      n = adjustedN;
    }

    n += 2;
    if (n > 20 && diameterIndex < diameters.length - 1) {
      diameterIndex++;
      d = diameters[diameterIndex];
      n = 2;
    } else if (n > 20) {
      throw new Error('Не удалось подобрать болты');
    }
    iteration++;
  }
  throw new Error('Бесконечный цикл в adjustBolts');
};

// Основная функция расчета
export const calculateJoint = (inputData, beamData, steelData) => {
  if (!beamData || !steelData || !inputData) {
    throw new Error('Отсутствуют входные данные');
  }

  const { beamNumber, steelGrade, M_max, Q, responsibilityLevel } = inputData;

  const beam = getBeamData(beamData, beamNumber);
  if (!beam) throw new Error('Двутавр с таким номером не найден');

  const steel = getSteelData(steelData, steelGrade);
  if (!steel) throw new Error('Марка стали не найдена');

  const boltClass = getBoltClass(responsibilityLevel);
  if (!boltClass) throw new Error('Класс прочности болтов не найден');

  const h = parseFloat(beam['h']);
  const b = parseFloat(beam['b']);
  const s = parseFloat(beam['s']);
  const t = parseFloat(beam['t']);
  const Ry = parseFloat(steel['Предел текучести']);

  const Rbs = 400; // кН/см² (примерное значение)
  const Rbp = 800; // кН/см² (примерное значение)

  const t_upper = Math.max(t + 2, 8);
  const t_side = Math.max(s + 2, 6);
  const b_upper = b;
  const b_side = h - 2 * t;
  const l_upper = h * 1.5;
  const l_side = b * 1.5;

  const N_flange = (M_max * 1000) / (h - t); // кН
  const N_per_flange = N_flange / 2;
  const initialDiameterFlange = 20;
  const flangeBolts = adjustBolts(N_per_flange, initialDiameterFlange, t, l_upper, Rbs, Rbp, Ry, 2);
  const d_upper = flangeBolts.diameter;
  const n_upper = flangeBolts.count;

  const Q_per_plate = Q / 2;
  const initialDiameterSide = 20;
  const sideBoltsPerPlate = adjustBolts(Q_per_plate, initialDiameterSide, s, l_side, Rbs, Rbp, Ry, 2);
  const d_side = sideBoltsPerPlate.diameter;
  const n_side = sideBoltsPerPlate.count * 2;

  const minStepUpper = boltSpacingData.minCenterDistance(Ry) * d_upper;
  const maxStepUpper = boltSpacingData.maxCenterDistance * d_upper;
  const minStepSide = boltSpacingData.minCenterDistance(Ry) * d_side;
  const maxStepSide = boltSpacingData.maxCenterDistance * d_side;

  const step_v_upper = Math.min(Math.max(l_upper / (n_upper / 2), minStepUpper), maxStepUpper);
  const step_h_upper = Math.min(Math.max(b_upper / 2, minStepUpper), maxStepUpper);
  const step_v_side = Math.min(Math.max(b_side / (n_side / 2), minStepSide), maxStepSide);
  const step_h_side = Math.min(Math.max(l_side / 2, minStepSide), maxStepSide);

  const roundedUpperLength = roundUpToTen(l_upper);
  const roundedUpperWidth = roundUpToTen(b_upper);
  const roundedSideLength = roundUpToTen(l_side);
  const roundedSideWidth = roundUpToTen(b_side);

  const roundedStepVUpper = roundDownToTen(step_v_upper);
  const roundedStepHUpper = roundDownToTen(step_h_upper);
  const roundedStepVSide = roundDownToTen(step_v_side);
  const roundedStepHSide = roundDownToTen(step_h_side);

  const result = {
    upper: {
      boltDiameter: d_upper,
      boltCount: n_upper,
      verticalStep: roundedStepVUpper,
      horizontalStep: roundedStepHUpper,
      width: roundedUpperWidth,
      thickness: t_upper,
      length: roundedUpperLength,
      boltClass: boltClass.class,
    },
    side: {
      boltDiameter: d_side,
      boltCount: n_side,
      verticalStep: roundedStepVSide,
      horizontalStep: roundedStepHSide,
      width: roundedSideWidth,
      thickness: t_side,
      length: roundedSideLength,
      boltClass: boltClass.class,
    },
    beamData: { h, b, s, t },
    steelData: { Ry },
  };
  return result;
};