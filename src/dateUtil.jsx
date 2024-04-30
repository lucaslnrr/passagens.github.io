export const formatDate = (dateString) => {
    const parts = dateString.split('-');
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];
  
    const date = new Date(year, month - 1, day);
  
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    } else {
      return `${date.getDate().toString().padStart(2, '0')}/` +
        `${(date.getMonth() + 1).toString().padStart(2, '0')}/` +
        `${date.getFullYear()}`;
    }
  };
  