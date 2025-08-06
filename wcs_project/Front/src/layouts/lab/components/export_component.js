// ExportComponent.jsx
import React from "react";
import * as XLSX from "xlsx";
import ButtonComponent from "./ButtonComponent";

const ExportComponent = ({
  data,
  exportColumns,
  fileName = "Export.xlsx",
  exportFormat = "excel", // รองรับ "excel" หรือ "csv"
  buttonType = "export",
  buttonLabel = "Export",
}) => {
  const handleExport = () => {
    // สร้าง header จาก label ของ exportColumns
    const headerLabels = exportColumns.map((col) => col.label);

    // สร้าง Array of Arrays สำหรับ Excel
    // สำหรับแต่ละคอลัมน์ ถ้ามี exportValue ให้ใช้ค่านั้น (ถ้าไม่มีให้ใช้ค่าใน field ปกติ)
    const dataArray = [
      headerLabels,
      ...data.map((row) =>
        exportColumns.map((col) => {
          if (col.exportValue && typeof col.exportValue === "function") {
            const value = col.exportValue(row);
            return value !== undefined && value !== null && value !== ""
              ? value
              : "-";
          }
          const rawValue = row[col.field];
          return rawValue !== undefined && rawValue !== null && rawValue !== ""
            ? rawValue
            : "-";
        })
      ),
    ];

    if (exportFormat === "csv") {
      // สำหรับ CSV
      const worksheet = XLSX.utils.aoa_to_sheet(dataArray);
      const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
      const blob = new Blob([csvOutput], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = fileName.replace(/\.xlsx$/, ".csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // สำหรับ Excel
      const worksheet = XLSX.utils.aoa_to_sheet(dataArray);

      // คำนวณความกว้างของแต่ละคอลัมน์จากข้อมูล (auto width)
      const colWidths = dataArray[0].map((_, colIndex) => {
        const maxLength = dataArray.reduce((max, row) => {
          const cellValue = row[colIndex] ? row[colIndex].toString() : "";
          return Math.max(max, cellValue.length);
        }, 0);
        return { wch: maxLength + 2 }; // เพิ่ม padding เล็กน้อย
      });
      worksheet["!cols"] = colWidths;

      // ตั้งค่าสไตล์สำหรับแถว header (แถวแรก) ให้มีพื้นหลังสีส้มอ่อน (ใช้ hex code "FFDAB9")
      const headerRowLength = dataArray[0].length;
      for (let col = 0; col < headerRowLength; col++) {
        const cellAddress = XLSX.utils.encode_cell({ c: col, r: 0 });
        if (worksheet[cellAddress]) {
          worksheet[cellAddress].s = {
            fill: { fgColor: { rgb: "FFDAB9" } }, // สีส้มอ่อน
            alignment: { horizontal: "center", vertical: "center" },
            font: { bold: true },
          };
        }
      }

      // ตั้งค่าสไตล์สำหรับเซลล์ที่ไม่ใช่ header (ให้จัดตรงกลางทั้งแนวนอนและแนวตั้ง)
      for (const cell in worksheet) {
        if (cell.startsWith("!")) continue;
        const cellRef = XLSX.utils.decode_cell(cell);
        if (cellRef.r !== 0) {
          worksheet[cell].s = {
            alignment: { horizontal: "center", vertical: "center" },
          };
        }
      }

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
      XLSX.writeFile(workbook, fileName);
    }
  };

  return (
    <ButtonComponent type={buttonType} onClick={handleExport}>
      {buttonLabel}
    </ButtonComponent>
  );
};

export default ExportComponent;
