import Papa from 'papaparse';

const BOLT_STANDARDS = {
  MIN_CENTER_DISTANCE: 3,  // 3d
  MAX_CENTER_DISTANCE: 12, // 12d
  MIN_EDGE_DISTANCE: 2,    // 2d
  MAX_EDGE_DISTANCE: 4     // 4d
};

// Данные о классах болтов
const boltClassData = [
  { 
    class: "8.8", 
    strength: 830,
    frictionCoefficient: 0.35,
    isFriction: false
  },
  { 
    class: "10.9",
    strength: 1040,
    frictionCoefficient: 0.42,
    isFriction: true
  },
  { 
    class: "12.9",
    strength: 1220, 
    frictionCoefficient: 0.45,
    isFriction: true
  }
];

// Площади болтов (мм²) и доступные диаметры
const boltAreas = {
  16: 201,
  20: 314,
  22: 380,
  24: 452,
  27: 573,
  30: 707
};

const availableDiameters = [16, 20, 22, 24, 27, 30];

// Вспомогательные функции
function getBeamData(beamData, beamNumber, useCustom, customData) {
  return useCustom ? {
    'Номер двутавра': beamNumber,
    h: customData.h,
    b: customData.b,
    s: customData.s,
    t: customData.t
  } : beamData.find(b => b['Номер двутавра'] === beamNumber);
}

function getSteelData(steelData, steelGrade, useCustom, customData) {
  return useCustom ? {
    'Сталь': steelGrade,
    'Предел текучести': customData.yieldStrength
  } : steelData.find(s => s['Сталь'] === steelGrade);
}

function getBoltClass(responsibilityLevel) {
  switch(responsibilityLevel) {
    case 'Пониженный': return boltClassData[0];
    case 'Нормальный': return boltClassData[1];
    case 'Повышенный': return boltClassData[2];
    default: throw new Error("Неверный уровень ответственности");
  }
}

// Функция нормативного расчета шагов с правильным округлением
function calculateBoltSpacing(diameter, proposedStep, length, boltCount) {
  const minStep = diameter * BOLT_STANDARDS.MIN_CENTER_DISTANCE;
  const maxStep = diameter * BOLT_STANDARDS.MAX_CENTER_DISTANCE;
  const minEdge = diameter * BOLT_STANDARDS.MIN_EDGE_DISTANCE;

  // Округляем шаги до 10 мм в меньшую сторону
  const roundedMinStep = Math.floor(minStep / 10) * 10;
  const roundedMaxStep = Math.floor(maxStep / 10) * 10;
  // Краевые расстояния округляем вверх
  const roundedMinEdge = Math.ceil(minEdge);

  const minRequiredLength = 2 * roundedMinEdge + (boltCount - 1) * roundedMinStep;
  if (length < minRequiredLength) {
    throw new Error(`Недостаточная длина ${length}мм для размещения ${boltCount} болтов Ø${diameter}мм. Минимальная длина: ${minRequiredLength}мм`);
  }

  // Начальное значение шага с округлением вниз до 10 мм
  let adjustedStep = Math.floor(Math.max(proposedStep, roundedMinStep) / 10) * 10;
  adjustedStep = Math.min(adjustedStep, roundedMaxStep);

  // Пересчитываем краевые расстояния
  let edgeDistance = (length - (boltCount - 1) * adjustedStep) / 2;
  
  // Если краевое расстояние меньше минимального - корректируем шаг
  if (edgeDistance < roundedMinEdge) {
    adjustedStep = Math.floor((length - 2 * roundedMinEdge) / (boltCount - 1) / 10) * 10;
    edgeDistance = roundedMinEdge;
  }

  if (adjustedStep > roundedMaxStep) {
    throw new Error(`Невозможно разместить ${boltCount} болтов на длине ${length}мм с соблюдением норм. Увеличьте длину или уменьшите количество болтов.`);
  }

  return {
    step: adjustedStep,
    edgeDistance: Math.ceil(edgeDistance), // Краевые расстояния округляем вверх
    isValid: adjustedStep >= roundedMinStep && adjustedStep <= roundedMaxStep
  };
}

// Расчет болтов в одном ряду
function calculateBoltsInRow(force, diameter, thickness, length, isFriction, boltClass) {
  let boltCount = isFriction
    ? Math.ceil(force / (boltClass.strength * boltClass.frictionCoefficient * boltAreas[diameter] / 1250))
    : Math.ceil(force / Math.min(
        0.4 * boltAreas[diameter],
        0.8 * diameter * thickness
      ));

  const maxPossibleBolts = Math.floor(
    (length - 2 * BOLT_STANDARDS.MIN_EDGE_DISTANCE * diameter) / 
    (BOLT_STANDARDS.MIN_CENTER_DISTANCE * diameter)
  ) + 1;

  boltCount = Math.min(boltCount, maxPossibleBolts);
  
  return {
    count: boltCount,
    diameter
  };
}

// Функция подбора диаметра болтов
function calculateBoltsWithDiameterSelection(force, thickness, length, width, isFriction, boltClass) {
  let bestSolution = null;
  
  for (const diameter of [...availableDiameters].reverse()) {
    try {
      const maxRows = Math.min(4, Math.floor(width / (diameter * BOLT_STANDARDS.MIN_CENTER_DISTANCE)));
      
      for (let rows = 1; rows <= maxRows; rows++) {
        const boltsPerRow = calculateBoltsInRow(
          force / rows,
          diameter,
          thickness,
          length,
          isFriction,
          boltClass
        );
        
        const totalBolts = boltsPerRow.count * rows;
        
        const spacing = calculateBoltSpacing(
          diameter,
          length / (boltsPerRow.count + 1),
          length,
          boltsPerRow.count
        );
        
        const horizontalSpacing = calculateBoltSpacing(
          diameter,
          width / (rows + 1),
          width,
          rows
        );
        
        if (!bestSolution || totalBolts < bestSolution.count) {
          bestSolution = {
            diameter,
            count: totalBolts,
            rows,
            boltsPerRow: boltsPerRow.count,
            verticalStep: spacing.step,
            horizontalStep: horizontalSpacing.step,
            edgeDistance: spacing.edgeDistance,
            horizontalEdgeDistance: horizontalSpacing.edgeDistance,
            isValid: spacing.isValid && horizontalSpacing.isValid
          };
        }
      }
    // eslint-disable-next-line no-unused-vars
    } catch (e) {
      continue;
    }
  }
  
  if (!bestSolution) {
    throw new Error("Не удалось подобрать болты для заданных параметров");
  }
  
  return bestSolution;
}

// Основная функция расчета
export function calculateJoint(inputData, beamData, steelData) {
  if (!beamData || !steelData) throw new Error("Отсутствуют данные о материалах");
  if (!inputData.M_max || inputData.M_max <= 0) throw new Error("Неверное значение момента");

  const beam = getBeamData(beamData, inputData.beamNumber, inputData.useCustomBeam, inputData.beamCustom);
  const steel = getSteelData(steelData, inputData.steelGrade, inputData.useCustomSteel, inputData.steelCustom);
  
  if (!beam || !steel) throw new Error("Не найдены данные о материалах");

  const h = parseFloat(beam.h);
  const b = parseFloat(beam.b);
  const s = parseFloat(beam.s);
  const t = parseFloat(beam.t);
  const Ry = parseFloat(steel['Предел текучести']);

  const boltClass = getBoltClass(inputData.responsibilityLevel);
  const isFriction = boltClass.isFriction;

  // Толщины накладок округляем вверх
  const t_upper = Math.ceil(Math.max(t + 2, 8));
  const t_side = Math.ceil(Math.max(s + 2, 6));
  
  // Ширины и длины накладок округляем вверх до 10 мм
  const b_upper = Math.ceil(b / 10) * 10;
  const b_side = Math.ceil((h - 2 * t) / 10) * 10;
  const l_upper = Math.ceil((h * 1.5) / 10) * 10;
  const l_side = Math.ceil((b * 1.5) / 10) * 10;

  const N_flange = (inputData.M_max * 1000) / (h - t);
  const Q = inputData.Q || 0;

  const flangeBolts = calculateBoltsWithDiameterSelection(
    N_flange / 2,
    t,
    l_upper,
    b_upper,
    isFriction,
    boltClass
  );

  const sideBolts = calculateBoltsWithDiameterSelection(
    Q / 2,
    s,
    l_side,
    b_side,
    isFriction,
    boltClass
  );

  return {
    connectionType: isFriction ? "Фрикционное" : "Обычное",
    boltClass: boltClass.class,
    upper: {
      ...flangeBolts,
      width: b_upper,
      thickness: t_upper,
      length: l_upper
    },
    side: {
      ...sideBolts,
      width: b_side,
      thickness: t_side,
      length: l_side
    },
    standards: BOLT_STANDARDS
  };
}

// Загрузка данных из CSV
export async function loadBeamData() {
  const response = await fetch('/двутавр.csv');
  const data = await response.text();
  return Papa.parse(data, { header: true }).data;
}

export async function loadSteelData() {
  const response = await fetch('/сталь.csv');
  const data = await response.text();
  return Papa.parse(data, { header: true }).data;
}

export default {
  calculateJoint,
  loadBeamData,
  loadSteelData,
  BOLT_STANDARDS,
  boltClassData
};