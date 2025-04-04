// src/App.jsx
import React, { useState, useEffect } from 'react';
import BoltCalculator from './components/BoltCalculator';
import ResultDisplay from './components/ResultDisplay';
import { calculateJoint, loadBeamData, loadSteelData } from './utils/calculations';
import JointVisualization from './components/JointVisualization';

function App() {
  const [result, setResult] = useState(null);
  const [beamData, setBeamData] = useState(null);
  const [steelData, setSteelData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const beams = await loadBeamData();
        const steels = await loadSteelData();
        setBeamData(beams);
        setSteelData(steels);
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
      }
    };
    fetchData();
  }, []);

  const handleCalculate = (inputData) => {
    try {
      if (!beamData || !steelData) {
        throw new Error('Данные о двутаврах или стали еще не загружены');
      }
      const calculatedResult = calculateJoint(inputData, beamData, steelData);
      setResult(calculatedResult);
    } catch (error) {
      console.error('Ошибка при расчете:', error);
    }
  };

  return (
    <div className="app-container">
      <h1>Расчет стыка главных балок</h1>
      <BoltCalculator onCalculate={handleCalculate} />
      {result && <ResultDisplay result={result} />}
      {result && <JointVisualization result={result} />}
    </div>
  );
}

export default App;