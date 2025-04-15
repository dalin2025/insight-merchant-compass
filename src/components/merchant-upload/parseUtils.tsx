
export const parseCSV = (csvContent: string, isSpendData = false): any[] => {
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',').map(header => header.trim());
  
  if (isSpendData) {
    return parseSimplifiedSpendCSV(csvContent);
  }
  
  return lines.slice(1).filter(line => line.trim()).map(line => {
    const values = line.split(',').map(value => value.trim());
    const data: Record<string, any> = {};
    
    headers.forEach((header, index) => {
      let value = values[index];
      
      // Handle dates specifically - look for date headers and ISO date format
      if ((header.toLowerCase().includes('date') || header.endsWith('Date')) && 
          (value && /^\d{4}-\d{2}-\d{2}/.test(value))) {
        // This is a date in ISO format
        data[header] = value; // Keep as string for display purposes
      } else if (/^\d+(\.\d+)?$/.test(value)) {
        // Number values
        data[header] = parseFloat(value);
      } else if (value === 'true' || value === 'false') {
        // Boolean values
        data[header] = value === 'true';
      } else {
        // String values
        data[header] = value;
      }
    });
    
    return data;
  });
};

export const parseSimplifiedSpendCSV = (csvContent: string): any[] => {
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',').map(header => header.trim());
  
  return lines.slice(1).filter(line => line.trim()).map(line => {
    const values = line.split(',').map(value => value.trim());
    const data: Record<string, any> = {};
    
    data.mid = values[0];
    data.totalSpend = values[1];
    data.spendTrend = values[2];
    
    const monthlySpends = [];
    for (let i = 3; i < values.length; i += 2) {
      if (values[i] && values[i+1]) {
        monthlySpends.push({
          month: values[i],
          amount: parseFloat(values[i+1]) || 0
        });
      }
    }
    
    data.monthlySpends = monthlySpends;
    return data;
  });
};
