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
    // Новые поля для ручного ввода параметров
    beamCustom: { h: '', b: '', s: '', t: '' }, // Параметры двутавра
    steelCustom: { yieldStrength: '' }, // Предел текучести стали
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

  const handleCustomBeamChange = (e) => {
    const { name, value } = e.target;
    setInputData((prev) => ({
      ...prev,
      beamCustom: { ...prev.beamCustom, [name]: value },
    }));
  };

  const handleCustomSteelChange = (e) => {
    const { name, value } = e.target;
    setInputData((prev) => ({
      ...prev,
      steelCustom: { ...prev.steelCustom, [name]: value },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Добавляем флаги, чтобы указать, используются ли данные из CSV или введенные вручную
    const dataToSubmit = {
      ...inputData,
      useCustomBeam,
      useCustomSteel,
    };
    onCalculate(dataToSubmit);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Номер двутавра:</label>
        {useCustomBeam ? (
          <div>
            <input
              type="text"
              name="beamNumber"
              value={inputData.beamNumber}
              onChange={handleChange}
              placeholder="Введите номер двутавра"
            />
            <div>
              <label>h (мм):</label>
              <input
                type="number"
                name="h"
                value={inputData.beamCustom.h}
                onChange={handleCustomBeamChange}
                placeholder="Высота двутавра"
              />
            </div>
            <div>
              <label>b (мм):</label>
              <input
                type="number"
                name="b"
                value={inputData.beamCustom.b}
                onChange={handleCustomBeamChange}
                placeholder="Ширина полки"
              />
            </div>
            <div>
              <label>s (мм):</label>
              <input
                type="number"
                name="s"
                value={inputData.beamCustom.s}
                onChange={handleCustomBeamChange}
                placeholder="Толщина стенки"
              />
            </div>
            <div>
              <label>t (мм):</label>
              <input
                type="number"
                name="t"
                value={inputData.beamCustom.t}
                onChange={handleCustomBeamChange}
                placeholder="Толщина полки"
              />
            </div>
          </div>
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
          <div>
            <input
              type="text"
              name="steelGrade"
              value={inputData.steelGrade}
              onChange={handleChange}
              placeholder="Введите марку стали"
            />
            <div>
              <label>Предел текучести (МПа):</label>
              <input
                type="number"
                name="yieldStrength"
                value={inputData.steelCustom.yieldStrength}
                onChange={handleCustomSteelChange}
                placeholder="Предел текучести"
              />
            </div>
          </div>
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