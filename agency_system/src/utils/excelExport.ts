// src/utils/excelExport.ts
import * as XLSX from 'xlsx';

export interface ExportColumn {
  header: string;
  key: string;
  width?: number;
}

/**
 * Exports data to an Excel file
 * @param data Array of objects to export
 * @param columns Column definitions with headers
 * @param filename Filename without extension
 */
export const exportToExcel = <T extends Record<string, any>>(
  data: T[],
  columns: ExportColumn[],
  filename: string
): void => {
  try {
    // Transform data based on column definitions
    const exportData = data.map((item) => {
      const rowData: Record<string, any> = {};
      
      columns.forEach((column) => {
        rowData[column.header] = item[column.key];
      });
      
      return rowData;
    });

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    // Set column widths if provided
    const columnWidths: XLSX.ColInfo[] = [];
    columns.forEach((col, index) => {
      if (col.width) {
        columnWidths.push({ wch: col.width, wpx: col.width * 7 });
      } else {
        // Default width based on header length
        columnWidths.push({ wch: Math.max(col.header.length, 10) });
      }
    });
    
    worksheet['!cols'] = columnWidths;

    // Create workbook and add the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    
    // Write to file and download
    XLSX.writeFile(workbook, `${filename}.xlsx`);
    
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw error;
  }
};