// 2024-10-25 : ปรับมาใช้ settign_json แทนการส่ง Prop
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@mui/material';
import RangeControl from './RangeControl';
import RangeLabelControl from './RangeLabelControl';
import TextBoxControl from './TextBoxControl';
import LabelControl from './LabelControl';
import CompositeLabelControl from './CompositeLabelControl';
import CommentIconControl from './CommentIconControl';
import DatePickerControl from './DatePickerControl';
import LabelDivCenterControl from './LabelDivCenterControl';
import './LabResultTable.css';

const LabForm_TableRange = ({ data, onSave }) => {
  const [tableData, setTableData] = useState(data);

  useEffect(() => {
    setTableData(data);
  }, [data]);

  const handleInputChange = (rowIndex, cellIndex, newValue) => {
    const newData = { ...tableData };
    newData.rows[rowIndex].cells[cellIndex].value = newValue;
    setTableData(newData);
  };

  const handleInputRangeChange = (rowIndex, cellIndex, newValue, noteLabel) => {
    const newData = { ...tableData };
    newData.rows[rowIndex].cells[cellIndex].value = newValue;
  
    // ถ้ามี note_label ให้เก็บลงในข้อมูล
    if (noteLabel !== undefined) {
      newData.rows[rowIndex].cells[cellIndex].note_label = noteLabel;
    }
  
    setTableData(newData);
  };

  const handleBodyDateChange = (rowIndex, cellIndex, dateString) => {
    const newData = { ...tableData };
    if (newData.rows[rowIndex] && newData.rows[rowIndex].cells[cellIndex]) {
      newData.rows[rowIndex].cells[cellIndex].value = dateString;
      setTableData(newData);
    }
  };

  const handleHeaderDateChange = (headerRowIndex, headerCellIndex, dateString) => {
    const newData = { ...tableData };
    if (newData.headers[headerRowIndex] && newData.headers[headerRowIndex][headerCellIndex]) {
      newData.headers[headerRowIndex][headerCellIndex].value = dateString;
      setTableData(newData);
    }
  };

  const handleSaveComment = (rowIndex, cellIndex, comment) => {
    const newData = { ...tableData };
    console.log("Updated Comment:", comment); // ดูค่า comment ที่กำลังจะบันทึก
    // ตรวจสอบให้แน่ใจว่า cell เป็น array
    if (Array.isArray(newData.rows[rowIndex].cells[cellIndex])) {
      newData.rows[rowIndex].cells[cellIndex].forEach(control => {
        if (control.controltype === "COMMENT_ICON") {
          control.value = comment;
        }
      });
    } else {
      newData.rows[rowIndex].cells[cellIndex].value = comment;
    }
    
    console.log("New Data:", newData); // ดูว่า newData ถูกอัปเดตหรือไม่
    setTableData(newData);
    
  };
  
  const renderControl = (item, rowIndex, cellIndex, isHeader = false) => {
    switch (item.controltype) {
      case 'TEXTBOX':
        return (
          <TextBoxControl
            name={item.name}
            value={item.value}
            onChange={(newValue) => handleInputChange(rowIndex, cellIndex, newValue)}
            readonly={item.readonly}
            required={item.required}
            setting_json={item.setting_json} // Use setting_json instead of individual props
            style={item.style || {}}
          />
        );
      case 'RANGE':
        return (
          <RangeControl
            name={item.name}
            value={item.value}
            note_label={item.note_label}
            onChange={(newValue, noteLabel) => handleInputRangeChange(rowIndex, cellIndex, newValue, noteLabel)} // รับค่า noteLabel ด้วย
            setting_json={item.setting_json} // ยังคงใช้ setting_json เพื่อส่งข้อมูลการตั้งค่า
            style={item.style || {}}
          />
        );
      case 'RANGE_LABEL':
        return (
          <RangeLabelControl
            name={item.name}
            value={item.value}
            note_label={item.note_label}
            setting_json={item.setting_json} // Use setting_json instead of individual props
            style={item.style || {}}
          />
        );
      case 'COMPOSITE_LABEL':
        return <CompositeLabelControl name={item.name} parts={item.parts} />;
      case 'LABEL':
        return <LabelControl name={item.name} value={item.value} style={item.style} tooltip={item.tooltip} />;
      case 'LABEL_DIV_CENTER':
        return <LabelDivCenterControl name={item.name} value={item.value} style={item.style} />;
      case 'DATEPICKER':
        return (
          <DatePickerControl
            name={item.name}
            value={item.value}
            onChange={(newValue) =>
              isHeader
                ? handleHeaderDateChange(rowIndex, cellIndex, newValue)
                : handleBodyDateChange(rowIndex, cellIndex, newValue)
            }
            readonly={item.readonly} // ตั้งค่าให้ไม่สามารถแก้ไขได้
            setting_json={item.setting_json} // Use setting_json instead of individual props
            style={item.style || {}}
          />
        );
      case 'COMMENT_ICON':
        return (
          <CommentIconControl
            name={item.name}
            value={item.value}
            onSaveComment={(newComment) => handleSaveComment(rowIndex, cellIndex, newComment)}
            show_icon={item.show_icon}
            setting_json={item.setting_json} // Use setting_json instead of individual props
            style={item.style || {}}
          />
        );
      default:
        return null;
    }
  };

  const renderRow = (row, rowIndex) => (
    <tr key={rowIndex}>
      {row.cells.map((cell, cellIndex) => (
        <td key={cellIndex} colSpan={cell.colSpan || 1} rowSpan={cell.rowSpan || 1}>
          <div className="cell-container-row">
            {Array.isArray(cell) ? cell.map((control) => renderControl(control, rowIndex, cellIndex)) : renderControl(cell, rowIndex, cellIndex)}
          </div>
        </td>
      ))}
    </tr>
  );

  const renderHeaderRow = (headerRow, headerRowIndex) => (
    <tr key={headerRowIndex}>
      {headerRow.map((headerCell, headerCellIndex) => (
        <th key={headerCellIndex} colSpan={headerCell.colSpan || 1} rowSpan={headerCell.rowSpan || 1} className="header-cell">
          <div className="cell-container">
            {Array.isArray(headerCell) ? headerCell.map((control) => renderControl(control, headerRowIndex, headerCellIndex, true)) : renderControl(headerCell, headerRowIndex, headerCellIndex, true)}
          </div>
        </th>
      ))}
    </tr>
  );

  const exportJson = () => {
    const jsonData = JSON.stringify(tableData, null, 2); // แปลงเป็น JSON ที่จัดรูปแบบ
    console.log("Exported JSON:", jsonData); // แสดง JSON ใน Console หรือจะส่งต่อก็ได้
    alert("JSON Exported to Console");
  };

  return (
    <div className="lab-result-table-container">
      <table className="lab-result-table">
        <thead>
          {tableData.headers.map((headerRow, headerRowIndex) => renderHeaderRow(headerRow, headerRowIndex))}
        </thead>
        <tbody>
          {tableData.rows.map((row, rowIndex) => renderRow(row, rowIndex))}
        </tbody>
      </table>
      <Button onClick={() => onSave(tableData)}>Save</Button>
      <Button onClick={exportJson} style={{ marginLeft: '10px' }}>Export JSON</Button> {/* ปุ่ม Export JSON */}
    </div>
  );
};

LabForm_TableRange.propTypes = {
  data: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default LabForm_TableRange;

// ก่อนปรับ ไปใช้ setting_json แทนการกำหนด Prop
// import React, { useState, useEffect } from 'react';
// import PropTypes from 'prop-types';
// import { Button } from '@mui/material';
// import RangeControl from './RangeControl';
// import RangeLabelControl from './RangeLabelControl';
// import TextBoxControl from './TextBoxControl';
// import LabelControl from './LabelControl';
// import CompositeLabelControl from './CompositeLabelControl';
// import CommentIconControl from './CommentIconControl';
// import DatePickerControl from './DatePickerControl';
// import LabelDivCenterControl from './LabelDivCenterControl';
// import './LabResultTable.css';

// const LabForm_TableRange = ({ data, onSave }) => {
//   const [tableData, setTableData] = useState(data);

//   useEffect(() => {
//     setTableData(data);
//   }, [data]);

//   const handleInputChange = (rowIndex, cellIndex, newValue) => {
//     const newData = { ...tableData };
//     newData.rows[rowIndex].cells[cellIndex].value = newValue;
//     setTableData(newData);
//   };

//   const handleBodyDateChange = (rowIndex, cellIndex, dateString) => {
//     const newData = { ...tableData };
//     if (newData.rows[rowIndex] && newData.rows[rowIndex].cells[cellIndex]) {
//       newData.rows[rowIndex].cells[cellIndex].value = dateString;
//       setTableData(newData);
//     }
//   };

//   const handleHeaderDateChange = (headerRowIndex, headerCellIndex, dateString) => {
//     const newData = { ...tableData };
//     if (newData.headers[headerRowIndex] && newData.headers[headerRowIndex][headerCellIndex]) {
//       newData.headers[headerRowIndex][headerCellIndex].value = dateString;
//       setTableData(newData);
//     }
//   };

//   const handleSaveComment = (rowIndex, cellIndex, comment) => {
//     const newData = { ...tableData };
//     console.log("Updated Comment:", comment); // ดูค่า comment ที่กำลังจะบันทึก
//     // ตรวจสอบให้แน่ใจว่า cell เป็น array
//     if (Array.isArray(newData.rows[rowIndex].cells[cellIndex])) {
//       newData.rows[rowIndex].cells[cellIndex].forEach(control => {
//         if (control.controltype === "COMMENT_ICON") {
//           control.value = comment;
//         }
//       });
//     } else {
//       newData.rows[rowIndex].cells[cellIndex].value = comment;
//     }
    
//     console.log("New Data:", newData); // ดูว่า newData ถูกอัปเดตหรือไม่
//     setTableData(newData);
    
//   };
  
//   const renderControl = (item, rowIndex, cellIndex, isHeader = false) => {
//     switch (item.controltype) {
//       case 'TEXTBOX':
//         return (
//           <TextBoxControl
//             name={item.name}
//             value={item.value}
//             onChange={(newValue) => handleInputChange(rowIndex, cellIndex, newValue)}
//           />
//         );
//       case 'RANGE':
//         return (
//           <RangeControl
//             name={item.name}
//             value={item.value}
//             onChange={(newValue) => handleInputChange(rowIndex, cellIndex, newValue)}
//             operator={item.operator}
//             value1={item.value1}
//             value2={item.value2}
//             note={item.note}
//             noteAbove={item.note_above}
//             noteBelow={item.note_below}
//           />
//         );
//       case 'RANGE_LABEL':
//           return (
//             <RangeLabelControl
//               name={item.name}
//               value={item.value}
//               operator={item.operator}
//               value1={item.value1}
//               value2={item.value2}
//               note={item.note}
//               noteAbove={item.note_above}
//               noteBelow={item.note_below}
//             />
//           );
//       case 'COMPOSITE_LABEL':
//         return <CompositeLabelControl name={item.name} parts={item.parts} />;
//       case 'LABEL':
//         return <LabelControl name={item.name} value={item.value} style={item.style} tooltip={item.tooltip} />;
//       case 'LABEL_DIV_CENTER':
//         return <LabelDivCenterControl name={item.name} value={item.value} style={item.style} />;
//       case 'DATEPICKER':
//         return (
//           <DatePickerControl
//             name={item.name}
//             value={item.value}
//             onChange={(newValue) =>
//               isHeader
//                 ? handleHeaderDateChange(rowIndex, cellIndex, newValue)
//                 : handleBodyDateChange(rowIndex, cellIndex, newValue)
//             }
//           />
//         );
//         case 'COMMENT_ICON':
//           return (
//             <CommentIconControl
//               name={item.name}
//               value={item.value}
//               onSaveComment={(newComment) => handleSaveComment(rowIndex, cellIndex, newComment)}
//               />
      
//           );
//       default:
//         return null;
//     }
//   };

//   const renderRow = (row, rowIndex) => (
//     <tr key={rowIndex}>
//       {row.cells.map((cell, cellIndex) => (
//         <td key={cellIndex} colSpan={cell.colSpan || 1} rowSpan={cell.rowSpan || 1}>
//           <div className="cell-container-row">
//             {Array.isArray(cell) ? cell.map((control) => renderControl(control, rowIndex, cellIndex)) : renderControl(cell, rowIndex, cellIndex)}
//           </div>
//         </td>
//       ))}
//     </tr>
//   );

//   const renderHeaderRow = (headerRow, headerRowIndex) => (
//     <tr key={headerRowIndex}>
//       {headerRow.map((headerCell, headerCellIndex) => (
//         <th key={headerCellIndex} colSpan={headerCell.colSpan || 1} rowSpan={headerCell.rowSpan || 1} className="header-cell">
//           <div className="cell-container">
//             {Array.isArray(headerCell) ? headerCell.map((control) => renderControl(control, headerRowIndex, headerCellIndex, true)) : renderControl(headerCell, headerRowIndex, headerCellIndex, true)}
//           </div>
//         </th>
//       ))}
//     </tr>
//   );


// /* 
//   // ฟังก์ชันสำหรับส่งออกข้อมูล JSON
//   const exportJson = () => {
//     // สร้างโครงสร้าง JSON ที่ต้องการ
//     const exportedJSON = {
//       headers: tableData.headers,
//       rows: tableData.rows.map(row => ({
//         cells: row.cells.map(cell => {
//           if (Array.isArray(cell)) {
//             // จัดการกรณีที่ cell เป็น array (เช่น มี COMMENT_ICON กับ LABEL ใน cell เดียวกัน)
//             return cell.map(control => ({
//               controltype: control.controltype,
//               name: control.name,
//               value: control.value || '', // ตรวจสอบให้แน่ใจว่า value ถูกต้อง
//               operator: control.operator,
//               value1: control.value1,
//               value2: control.value2,
//               note: control.note,
//               note_above: control.note_above,
//               note_below: control.note_below,
//               style: control.style,
//             }));
//           } else {
//             // จัดการกรณีที่ cell เป็น object ปกติ
//             return {
//               controltype: cell.controltype,
//               name: cell.name,
//               value: cell.value || '', // ตรวจสอบให้แน่ใจว่า value ถูกต้อง
//               operator: cell.operator,
//               value1: cell.value1,
//               value2: cell.value2,
//               note: cell.note,
//               note_above: cell.note_above,
//               note_below: cell.note_below,
//               style: cell.style,
//             };
//           }
//         })
//       }))
//     };

//     // แปลงเป็น JSON ที่จัดรูปแบบและแสดงใน Console
//     const jsonData = JSON.stringify(exportedJSON, null, 2);
//     console.log("Exported JSON:", jsonData);
//     alert("JSON Exported to Console");
//   }; */

//   const exportJson = () => {
//     const jsonData = JSON.stringify(tableData, null, 2); // แปลงเป็น JSON ที่จัดรูปแบบ
//     console.log("Exported JSON:", jsonData); // แสดง JSON ใน Console หรือจะส่งต่อก็ได้
//     alert("JSON Exported to Console");
//   };

//   return (
//     <div className="lab-result-table-container">
//       <table className="lab-result-table">
//         <thead>
//           {tableData.headers.map((headerRow, headerRowIndex) => renderHeaderRow(headerRow, headerRowIndex))}
//         </thead>
//         <tbody>
//           {tableData.rows.map((row, rowIndex) => renderRow(row, rowIndex))}
//         </tbody>
//       </table>
//       <Button onClick={() => onSave(tableData)}>Save</Button>
//       <Button onClick={exportJson} style={{ marginLeft: '10px' }}>Export JSON</Button> {/* ปุ่ม Export JSON */}
//     </div>
//   );
// };

// LabForm_TableRange.propTypes = {
//   data: PropTypes.object.isRequired,
//   onSave: PropTypes.func.isRequired,
// };

// export default LabForm_TableRange;
