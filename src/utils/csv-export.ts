// SafeDrive AI - CSV Export Engine

export interface ExportColumn<T> {
  header: string;
  accessor: (item: T) => string | number | boolean | null | undefined;
}

/**
 * Escapes and serializes a tabular dataset to CSV text and triggers browser download
 */
export function exportToCSV<T>(
  filename: string,
  data: T[],
  columns: ExportColumn<T>[]
): void {
  if (!data || data.length === 0) {
    alert('No data available to export with current filters.');
    return;
  }

  // Header row
  const headers = columns.map(col => `"${col.header.replace(/"/g, '""')}"`).join(',');

  // Data rows
  const rows = data.map(item => {
    return columns.map(col => {
      const val = col.accessor(item);
      if (val === null || val === undefined) {
        return '""';
      }
      const strVal = String(val).replace(/"/g, '""');
      return `"${strVal}"`;
    }).join(',');
  });

  const csvContent = [headers, ...rows].join('\r\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
