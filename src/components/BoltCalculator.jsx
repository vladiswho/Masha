// src/components/BoltCalculator.jsx
import React, { useState, useEffect } from 'react';
import { loadBeamData, loadSteelData } from '../utils/calculations';

const BoltCalculator = ({ onCalculate }) => {
  const [inputData, setInputData] = useState({
    beamNumber: '',
    steelGrade: '',
    M_max: '',
    Q: '',
    responsibilityLevel: 'Нормальный',
  });

  const [beamOptions, setBeamOptions] = useState([]);
  const [steelOptions, setSteelOptions] = useState([]);
  const [useCustomBeam, setUseCustomBeam] = useState(false);
  const [useCustomSteel, setUseCustomSteel] = useState(false);

  // Загрузка данных из CSV при монтировании компонента
  useEffect(() => {
    const fetchData = async () => {
      try {
        const beams = await loadBeamData();
        const steels = await loadSteelData();
        setBeamOptions(beams.map(beam => beam['Номер двутавра']).filter(Boolean));
        setSteelOptions(steels.map(steel => steel['Сталь']).filter(Boolean));
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCalculate(inputData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Номер двутавра:</label>
        {useCustomBeam ? (
          <input
            type="text"
            name="beamNumber"
            value={inputData.beamNumber}
            onChange={handleChange}
            placeholder="Введите номер двутавра"
          />
        ) : (
          <select
            name="beamNumber"
            value={inputData.beamNumber}
            onChange={handleChange}
          >
            <option value="">Выберите номер двутавра</option>
            {beamOptions.map((beam, index) => (
              <option key={index} value={beam}>{beam}</option>
            ))}
          </select>
        )}
        <button
          type="button"
          onClick={() => setUseCustomBeam(!useCustomBeam)}
          style={{ marginLeft: '10px' }}
        >
          {useCustomBeam ? 'Выбрать из списка' : 'Ввести вручную'}
        </button>
      </div>

      <div>
        <label>Марка стали:</label>
        {useCustomSteel ? (
          <input
            type="text"
            name="steelGrade"
            value={inputData.steelGrade}
            onChange={handleChange}
            placeholder="Введите марку стали"
          />
        ) : (
          <select
            name="steelGrade"
            value={inputData.steelGrade}
            onChange={handleChange}
          >
            <option value="">Выберите марку стали</option>
            {steelOptions.map((steel, index) => (
              <option key={index} value={steel}>{steel}</option>
            ))}
          </select>
        )}
        <button
          type="button"
          onClick={() => setUseCustomSteel(!useCustomSteel)}
          style={{ marginLeft: '10px' }}
        >
          {useCustomSteel ? 'Выбрать из списка' : 'Ввести вручную'}
        </button>
      </div>

      <div>
        <label>M_max (кН·м):</label>
        <input
          type="number"
          name="M_max"
          value={inputData.M_max}
          onChange={handleChange}
        />
      </div>

      <div>
        <label>Q (кН):</label>
        <input
          type="number"
          name="Q"
          value={inputData.Q}
          onChange={handleChange}
        />
      </div>

      <div>
        <label>Уровень ответственности:</label>
        <select
          name="responsibilityLevel"
          value={inputData.responsibilityLevel}
          onChange={handleChange}
        >
          <option value="Пониженный">Пониженный</option>
          <option value="Нормальный">Нормальный</option>
          <option value="Повышенный">Повышенный</option>
        </select>
      </div>

      <button type="submit">Рассчитать</button>
    </form>
  );
};

export default BoltCalculator;