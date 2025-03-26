// src/components/ResultDisplay.jsx
import React from 'react';

const ResultDisplay = ({ result }) => {
  if (!result) return null;

  const { upper, side } = result;

  return (
    <div className="result-display">
      <h2>Результаты расчета</h2>
      <p>Длина верхней накладки (L_upper) = {upper.length} мм</p>
      <p>Ширина верхней накладки (B_upper) = {upper.width} мм</p>
      <p>Толщина верхней накладки (t_upper) = {upper.thickness} мм</p>
      <p>Диаметр болтов для верхней накладки (d_upper) = {upper.boltDiameter} мм</p>
      <p>Количество болтов для верхней накладки (n_upper) = {upper.boltCount}</p>
      <p>Шаг по вертикали для верхней накладки (S_v_upper) = {upper.verticalStep} мм</p>
      <p>Шаг по горизонтали для верхней накладки (S_h_upper) = {upper.horizontalStep} мм</p>
      <p>Класс болтов для верхней накладки = {upper.boltClass}</p>
      <p>Длина боковой накладки (L_side) = {side.length} мм</p>
      <p>Ширина боковой накладки (B_side) = {side.width} мм</p>
      <p>Толщина боковой накладки (t_side) = {side.thickness} мм</p>
      <p>Диаметр болтов для боковой накладки (d_side) = {side.boltDiameter} мм</p>
      <p>Количество болтов для боковой накладки (n_side) = {side.boltCount}</p>
      <p>Шаг по вертикали для боковой накладки (S_v_side) = {side.verticalStep} мм</p>
      <p>Шаг по горизонтали для боковой накладки (S_h_side) = {side.horizontalStep} мм</p>
      <p>Класс болтов для боковой накладки = {side.boltClass}</p>
    </div>
  );
};

export default ResultDisplay;