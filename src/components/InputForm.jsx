import React, { useState, useEffect } from "react";
import { loadBeamData, loadSteelData } from "../utils/calculations";

const InputForm = ({ onCalculate }) => {
  const [beamData, setBeamData] = useState([]);
  const [steelData, setSteelData] = useState([]);
  const [inputData, setInputData] = useState({
    beamNumber: "",
    steelGrade: "С255",
    M_max: "",
    Q: "0",
    responsibilityLevel: "Повышенный",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const beamData = await loadBeamData();
        const steelData = await loadSteelData();
        setBeamData(beamData);
        setSteelData(steelData);
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
        alert("Не удалось загрузить данные из CSV. Проверьте файлы в папке public.");
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputData({ ...inputData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputData.beamNumber || !inputData.M_max) {
      alert("Пожалуйста, заполните все обязательные поля: Номер двутавра и M_max.");
      return;
    }
    onCalculate(inputData, beamData, steelData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Ввод данных</h2>
      <label>
        Номер двутавра:
        <select name="beamNumber" value={inputData.beamNumber} onChange={handleChange}>
          <option value="">Выберите двутавр</option>
          {beamData.map((beam) => (
            <option key={beam["Номер двутавра"]} value={beam["Номер двутавра"]}>
              {beam["Номер двутавра"]}
            </option>
          ))}
        </select>
      </label>
      <label>
        Марка стали:
        <select name="steelGrade" value={inputData.steelGrade} onChange={handleChange}>
          {steelData.map((steel) => (
            <option key={steel["Сталь"]} value={steel["Сталь"]}>
              {steel["Сталь"]}
            </option>
          ))}
        </select>
      </label>
      <label>
        Максимальный изгибающий момент M_max (кН·м):
        <input
          type="number"
          name="M_max"
          value={inputData.M_max}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Поперечная сила Q (кН):
        <input
          type="number"
          name="Q"
          value={inputData.Q}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Уровень ответственности:
        <select name="responsibilityLevel" value={inputData.responsibilityLevel} onChange={handleChange}>
          <option value="Пониженный">Пониженный</option>
          <option value="Нормальный">Нормальный</option>
          <option value="Повышенный">Повышенный</option>
        </select>
      </label>
      <button type="submit">Рассчитать</button>
    </form>
  );
};

export default InputForm;