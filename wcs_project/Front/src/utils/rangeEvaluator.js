export const evaluateRange = (cell, inputValue) => {
  const value1 = parseFloat(cell.value1);
  const value2 = parseFloat(cell.value2 || 0);
  const input = parseFloat(inputValue);

  if (cell.operator === 'BETWEEN') {
    if (input > value1 && input < value2) {
      return { label: cell.note, source: 'note' };
    }
    return input <= value1
      ? { label: cell.note_below, source: 'note_below' }
      : { label: cell.note_above, source: 'note_above' };
  }

  const conditions = {
    '>': input > value1,
    '<': input < value1,
    '>=': input >= value1,
    '<=': input <= value1,
    '=': input === value1,
    '<>': input !== value1,
  };

  return conditions[cell.operator]
    ? { label: cell.note, source: 'note' }
    : { label: cell.note_above, source: 'note_above' };
};

/* กรณีที่ ไม่เข้าเงื่อนไข อยู่ที่ operator ว่าเงื่อนไขไหน
export const evaluateRange = (cell, inputValue) => {
  const value1 = parseFloat(cell.value1);
  const value2 = parseFloat(cell.value2 || 0);
  const input = parseFloat(inputValue);

  if (cell.operator === 'BETWEEN') {
    if (input > value1 && input < value2) return { label: cell.note, source: 'note' };
    return input <= value1
      ? { label: cell.note_below, source: 'note_below' }
      : { label: cell.note_above, source: 'note_above' };
  }

  const conditions = {
    '>': input > value1,
    '<': input < value1,
    '>=': input >= value1,
    '<=': input <= value1,
    '=': input === value1,
    '<>': input !== value1,
  };

  // ปรับเงื่อนไขสำหรับการประเมิน note และ note_below
  if (cell.operator === '>') {
    return input > value1 
      ? { label: cell.note, source: 'note' } 
      : { label: cell.note_below, source: 'note_below' };
  }

  if (cell.operator === '<') {
    return input < value1 
      ? { label: cell.note, source: 'note' } 
      : { label: cell.note_above, source: 'note_above' };
  }

  return conditions[cell.operator]
    ? { label: cell.note, source: 'note' }
    : input < value1
    ? { label: cell.note_below, source: 'note_below' }
    : { label: cell.note_above, source: 'note_above' };
}; */


/* // Evaluate the range based on the operator and return the noteLabel and source
export const evaluateRange = (cell, inputValue) => {
    const value1 = parseFloat(cell.value1);
    const value2 = parseFloat(cell.value2 || 0);
    const input = parseFloat(inputValue);
  
    if (cell.operator === 'BETWEEN') {
      if (input >= value1 && input <= value2) return { label: cell.note, source: 'note' };
      return input < value1
        ? { label: cell.note_below, source: 'note_below' }
        : { label: cell.note_above, source: 'note_above' };
    }
  
    const conditions = {
      '>': input > value1,
      '<': input < value1,
      '>=': input >= value1,
      '<=': input <= value1,
      '=': input === value1,
      '<>': input !== value1,
    };
  
    return conditions[cell.operator]
      ? { label: cell.note, source: 'note' }
      : input < value1
      ? { label: cell.note_below, source: 'note_below' }
      : { label: cell.note_above, source: 'note_above' };
  };
   */