import React from 'react';
import PropTypes from 'prop-types';

const JointVisualization = ({ result }) => {
  if (!result) return null;

  const { upper, side } = result;
  const boltShape = result.connectionType === "Фрикционное" ? "rhombus" : "circle";

  // Стили для компонента
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '30px',
      padding: '20px',
      backgroundColor: '#f5f5f5',
      borderRadius: '8px'
    },
    platesContainer: {
      display: 'flex',
      gap: '40px',
      flexWrap: 'wrap',
      justifyContent: 'center'
    },
    plateContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px'
    },
    plate: {
      position: 'relative',
      backgroundColor: '#e0e0e0',
      border: '2px solid #333',
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
    },
    bolt: {
      position: 'absolute',
      backgroundColor: '#555',
      transform: 'translate(-50%, -50%)'
    },
    circle: {
      borderRadius: '50%'
    },
    rhombus: {
      backgroundColor: 'transparent',
      border: '2px solid #555',
      transform: 'translate(-50%, -50%) rotate(45deg)'
    },
    label: {
      fontWeight: 'bold',
      fontSize: '18px',
      color: '#333'
    },
    dimensions: {
      position: 'absolute',
      fontSize: '12px',
      color: '#555',
      backgroundColor: 'rgba(255,255,255,0.7)',
      padding: '2px 4px',
      borderRadius: '3px'
    }
  };

  // Функция для расчета масштаба
  const getScale = (length, width) => {
    const maxSize = 300;
    return Math.min(maxSize / Math.max(length, width), 0.8);
  };

  // Функция отрисовки накладки с болтами
  const renderPlate = (plate, title, isHorizontal) => {
    const scale = getScale(plate.length, plate.width);
    const displayWidth = isHorizontal ? plate.length * scale : plate.width * scale;
    const displayHeight = isHorizontal ? plate.width * scale : plate.length * scale;
    
    const bolts = [];
    
    // Для горизонтальной накладки (верхней/нижней)
    if (isHorizontal) {
      // Болты располагаются горизонтальными рядами
      for (let row = 0; row < plate.rows; row++) {
        for (let col = 0; col < plate.boltsPerRow; col++) {
          const x = plate.edgeDistance + col * plate.verticalStep;
          const y = plate.horizontalEdgeDistance + row * plate.horizontalStep;
          
          bolts.push(
            <div
              key={`h-${row}-${col}`}
              style={{
                ...styles.bolt,
                ...styles[boltShape],
                left: `${x * scale}px`,
                top: `${y * scale}px`,
                width: `${plate.diameter * scale}px`,
                height: `${plate.diameter * scale}px`
              }}
            />
          );
        }
      }
    } 
    // Для вертикальной накладки (боковой)
    else {
      // Болты располагаются вертикальными рядами
      for (let row = 0; row < plate.rows; row++) {
        for (let col = 0; col < plate.boltsPerRow; col++) {
          const x = plate.horizontalEdgeDistance + row * plate.horizontalStep;
          const y = plate.edgeDistance + col * plate.verticalStep;
          
          bolts.push(
            <div
              key={`v-${row}-${col}`}
              style={{
                ...styles.bolt,
                ...styles[boltShape],
                left: `${x * scale}px`,
                top: `${y * scale}px`,
                width: `${plate.diameter * scale}px`,
                height: `${plate.diameter * scale}px`
              }}
            />
          );
        }
      }
    }

    return (
      <div style={styles.plateContainer}>
        <div style={styles.label}>{title}</div>
        <div 
          style={{
            ...styles.plate,
            width: `${displayWidth}px`,
            height: `${displayHeight}px`
          }}
        >
          {bolts}
          {/* Подписи размеров */}
          <div style={{ 
            ...styles.dimensions, 
            bottom: '2px', 
            left: '50%', 
            transform: 'translateX(-50%)',
            whiteSpace: 'nowrap'
          }}>
            Длина: {plate.length} мм
          </div>
          <div style={{ 
            ...styles.dimensions, 
            top: '50%', 
            right: '2px', 
            transform: 'translateY(-50%) rotate(90deg)',
            whiteSpace: 'nowrap'
          }}>
            Ширина: {plate.width} мм
          </div>
        </div>
        <div style={{ fontSize: '14px', textAlign: 'center' }}>
          Болты: {plate.count} шт. (Ø{plate.diameter}мм)<br />
          Расположение: {plate.rows}×{plate.boltsPerRow}<br />
          Шаг: {isHorizontal ? plate.verticalStep : plate.horizontalStep} мм
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <h2 style={{ margin: '0 0 20px', textAlign: 'center' }}>Визуализация соединения балок</h2>
      <div style={styles.platesContainer}>
        {renderPlate(upper, "Накладка на полку (верхняя/нижняя)", true)}
        {renderPlate(side, "Накладка на стенку (боковая)", false)}
      </div>
    </div>
  );
};

JointVisualization.propTypes = {
  result: PropTypes.shape({
    connectionType: PropTypes.string.isRequired,
    upper: PropTypes.shape({
      diameter: PropTypes.number.isRequired,
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

export default JointVisualization;