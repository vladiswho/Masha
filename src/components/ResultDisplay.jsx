// Компонент вывода результатов (ResultDisplay.jsx)
import React from 'react';
import PropTypes from 'prop-types';

const ResultDisplay = ({ result }) => {
  if (!result) return null;

  const { upper, side } = result;

  return (
    <div className="result-display">
      <h2>Результаты расчета</h2>
      
      <div className="result-section">
        <h3>Накладки на полки</h3>
        <ul>
          <li>Длина (L<sub>1</sub>) = {upper.length} мм</li>
          <li>Ширина (B<sub>1</sub>) = {upper.width} мм</li>
          <li>Толщина (t<sub>1</sub>) = {upper.thickness} мм</li>
          <li>Диаметр болтов (d<sub>1</sub>) = {upper.diameter} мм</li>
          <li>Количество болтов (n<sub>1</sub>) = {upper.count} ({upper.rows}×{upper.boltsPerRow})</li>
          <li>Шаг по вертикали (S<sub>v1</sub>) = {upper.verticalStep} мм</li>
          <li>Шаг по горизонтали (S<sub>h1</sub>) = {upper.horizontalStep} мм</li>
          <li>Краевое расстояние по вертикали (e<sub>v1</sub>) = {upper.edgeDistance} мм</li>
          <li>Краевое расстояние по горизонтали (e<sub>h1</sub>) = {upper.horizontalEdgeDistance} мм</li>
        </ul>
      </div>
      
      <div className="result-section">
        <h3>Накладка на стенку</h3>
        <ul>
          <li>Длина (L<sub>2</sub>) = {side.length} мм</li>
          <li>Ширина (B<sub>2</sub>) = {side.width} мм</li>
          <li>Толщина (t<sub>2</sub>) = {side.thickness} мм</li>
          <li>Диаметр болтов (d<sub>2</sub>) = {side.diameter} мм</li>
          <li>Количество болтов (n<sub>2</sub>) = {side.count} ({side.rows}×{side.boltsPerRow})</li>
          <li>Шаг по вертикали (S<sub>v2</sub>) = {side.verticalStep} мм</li>
          <li>Шаг по горизонтали (S<sub>h2</sub>) = {side.horizontalStep} мм</li>
          <li>Краевое расстояние по вертикали (e<sub>v2</sub>) = {side.edgeDistance} мм</li>
          <li>Краевое расстояние по горизонтали (e<sub>h2</sub>) = {side.horizontalEdgeDistance} мм</li>
        </ul>
      </div>
      
      <div className="result-section">
        <h3>Общие параметры</h3>
        <ul>
          <li>Тип соединения: {result.connectionType}</li>
          <li>Класс болтов: {result.boltClass}</li>
        </ul>
      </div>
    </div>
  );
};

ResultDisplay.propTypes = {
  result: PropTypes.shape({
    connectionType: PropTypes.string.isRequired,
    boltClass: PropTypes.string.isRequired,
    upper: PropTypes.shape({
      diameter: PropTypes.number.isRequired,
      count: PropTypes.number.isRequired,
      rows: PropTypes.number.isRequired,
      boltsPerRow: PropTypes.number.isRequired,
      verticalStep: PropTypes.number.isRequired,
      horizontalStep: PropTypes.number.isRequired,
      edgeDistance: PropTypes.number.isRequired,
      horizontalEdgeDistance: PropTypes.number.isRequired,
      width: PropTypes.number.isRequired,
      length: PropTypes.number.isRequired,
      thickness: PropTypes.number.isRequired
    }).isRequired,
    side: PropTypes.shape({
      diameter: PropTypes.number.isRequired,
      count: PropTypes.number.isRequired,
      rows: PropTypes.number.isRequired,
      boltsPerRow: PropTypes.number.isRequired,
      verticalStep: PropTypes.number.isRequired,
      horizontalStep: PropTypes.number.isRequired,
      edgeDistance: PropTypes.number.isRequired,
      horizontalEdgeDistance: PropTypes.number.isRequired,
      width: PropTypes.number.isRequired,
      length: PropTypes.number.isRequired,
      thickness: PropTypes.number.isRequired
    }).isRequired
  })
};

export default ResultDisplay;