export function createRangeSlider({ 
  min = 0, 
  max = 100, 
  valueMin = min,
  valueMax = max,
  onChange = () => {}
} = {}) {
  const container = document.createElement('div');
  container.style.padding = '20px';
  
  const minInput = document.createElement('input');
  minInput.type = 'range';
  minInput.min = min;
  minInput.max = max;
  minInput.value = valueMin;
  
  const maxInput = document.createElement('input');
  maxInput.type = 'range';
  maxInput.min = min;
  maxInput.max = max;
  maxInput.value = valueMax;
  
  const display = document.createElement('div');
  display.textContent = `${valueMin} - ${valueMax}`;
  
  function updateValues() {
    const minVal = Number(minInput.value);
    const maxVal = Number(maxInput.value);
    
    if (minVal > maxVal) {
      if (this === minInput) {
        maxInput.value = minVal;
      } else {
        minInput.value = maxVal;
      }
    }
    
    display.textContent = `${minInput.value} - ${maxInput.value}`;
    onChange({
      min: Number(minInput.value),
      max: Number(maxInput.value)
    });
  }
  
  minInput.addEventListener('input', updateValues);
  maxInput.addEventListener('input', updateValues);
  
  container.appendChild(minInput);
  container.appendChild(maxInput);
  container.appendChild(display);
  
  return container;
}