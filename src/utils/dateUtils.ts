// Date utils   -   Contains functions to format dates

export const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0]; // Returns "YYYY-MM-DD"
  };