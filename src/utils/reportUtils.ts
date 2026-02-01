export const formatReportDate = (dateStr: string): string => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const getConfidenceLabel = (value: string): string => {
  const labels: Record<string, string> = {
    need_help: 'Needs Help',
    bit_unsure: 'A Bit Unsure',
    fairly_confident: 'Fairly Confident',
    very_confident: 'Very Confident',
  };
  return labels[value] || value;
};
