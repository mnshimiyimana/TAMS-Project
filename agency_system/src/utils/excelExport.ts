import * as XLSX from "xlsx";

export interface ExportColumn {
  header: string;
  key: string;
  width?: number;
}

export const exportToExcel = <T extends Record<string, any>>(
  data: T[],
  columns: ExportColumn[],
  filename: string
): void => {
  try {
    const exportData = data.map((item) => {
      const rowData: Record<string, any> = {};

      columns.forEach((column) => {
        const value = item[column.key];

        if (value && typeof value === "string") {
          rowData[column.header] = value.replace(/[\r\n\t]/g, "");
        } else {
          rowData[column.header] = value;
        }
      });

      return rowData;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    const columnWidths: XLSX.ColInfo[] = [];
    columns.forEach((col, index) => {
      if (col.width) {
        columnWidths.push({ wch: col.width, wpx: col.width * 7 });
      } else {
        columnWidths.push({ wch: Math.max(col.header.length, 10) });
      }
    });

    worksheet["!cols"] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    XLSX.writeFile(workbook, `${filename}.xlsx`);
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    throw error;
  }
};
