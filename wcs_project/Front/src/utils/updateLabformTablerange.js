// 2024-10-28 : ปรับเพิ่มฟังก์ชั่น convertToDataFormat


/**
 * ฟังก์ชันสำหรับ convert ข้อมูลจาก dataLabformTablerange กลับไปที่ dataCurrent
 * โดยจะอัปเดตเฉพาะฟิลด์ value เท่านั้น
 */
export function updateValuesFromDataLabformTablerange(updatedData, dataLabformTablerange, dataset) {
    // อัปเดตค่าที่ตรงกับ case 1
    dataLabformTablerange.headers.forEach(headerRow => {
        headerRow.forEach(cell => {
            const cellParts = cell.name.split('-');
            if (cellParts[0] === dataset && cellParts.length === 2) {
                const field = cellParts[1];
                if (Object.prototype.hasOwnProperty.call(updatedData, field)) {
                    updatedData[field] = cell.value; // อัปเดตค่า field โดยตรง
                }
            }
        });
    });

    // วนลูปผ่าน rows เพื่ออัปเดต case 2 และ case 3
    dataLabformTablerange.rows.forEach(row => {
        row.cells.forEach(cellGroup => {
            if (Array.isArray(cellGroup)) {
                cellGroup.forEach(cell => updateCellValue(cell, updatedData, dataset));
            } else {
                updateCellValue(cellGroup, updatedData, dataset);
            }
        });
    });

    return updatedData; // คืนค่า updatedData หลังจากอัปเดตเสร็จสิ้น
}

// ฟังก์ชันย่อยสำหรับอัปเดตค่าจาก cell ใน dataLabformTablerange ไปยัง updatedData
function updateCellValue(cell, updatedData, dataset) {
    const cellParts = cell.name.split('-');
    
    if (cellParts[0] !== dataset) return; // ตรวจสอบว่า dataset ตรงกันหรือไม่
    
    if (cellParts.length === 5) {
        // Case 2: มีการระบุฟิลด์ (เช่น comment)
        const field = cellParts[3];           // เช่น "comment"
        const labfrmtp_id = cellParts[4];     // เช่น "1"

        // ค้นหา labform_result ที่มี labform_testprm ตรงกับ labfrmtp_id
        updatedData.labform_result.forEach(labform => {
            const testParam = labform.labform_testprm.find(param => param.labfrmtp_id === labfrmtp_id);
            if (testParam && field) {
                testParam[field] = cell.value; // อัปเดตฟิลด์ตามที่กำหนด
            }
        });
    } else if (cellParts.length === 4) {
        // Case 3: ไม่มีการระบุฟิลด์ (เช่น field `value` และ `setting_json`)
        const labfrmtp_id = cellParts[3];     // เช่น "1"

        // ค้นหา labform_result ที่มี labform_testprm ตรงกับ labfrmtp_id
        updatedData.labform_result.forEach(labform => {
            const testParam = labform.labform_testprm.find(param => param.labfrmtp_id === labfrmtp_id);
            if (testParam) {
                // วนลูปเช็คทุกฟิลด์ใน cell แล้วอัปเดต testParam
                Object.keys(cell).forEach(key => {
                    if (key !== 'name' && Object.prototype.hasOwnProperty.call(testParam, key)) {
                        testParam[key] = cell[key]; // อัปเดตฟิลด์ตามชื่อที่ตรงกัน
                    }
                });
            }
        });
    }
}

//---------------------------------------------

    export  function updateLabformTablerange(dataLabformTablerange, dataCurrent, dataPrv1, dataPrv2, labfrmCode) {
        // แก้ไขการแยกเคสด้วย switch เพื่อความชัดเจน
    
        // วนอ่านข้อมูลส่วนของ headers
        dataLabformTablerange.headers.forEach((headerRow) => {
            headerRow.forEach((headerCell) => {
                processCell(headerCell, dataCurrent, dataPrv1, dataPrv2, labfrmCode);
            });
        });
    
        // วนอ่านข้อมูลส่วนของ rows
        dataLabformTablerange.rows.forEach((row) => {
            row.cells.forEach((cellGroup) => {
                if (Array.isArray(cellGroup)) {
                    cellGroup.forEach((cell) => processCell(cell, dataCurrent, dataPrv1, dataPrv2, labfrmCode));
                } else {
                    processCell(cellGroup, dataCurrent, dataPrv1, dataPrv2, labfrmCode);
                }
            });
        });
    
        return dataLabformTablerange;
    }
    


// ฟังก์ชันเลือก dataset
function selectDataset(part, dataCurrent, dataPrv1, dataPrv2) {
    switch (part) {
        case 'data_current':
            return dataCurrent;
        case 'data_prv1':
            return dataPrv1;
        case 'data_prv2':
            return dataPrv2;
        default:
            console.warn('Unknown data part:', part);
            return null;
    }
}



// ฟังก์ชันหา labform_result จาก labfrmCode
function findLabformResult(dataSource, labfrmCode) {
    return dataSource.labform_result.find((result) => result.labfrm_code === labfrmCode);
}

// ฟังก์ชันหา Test Parameter ตาม ID
function findTestParameterById(labformResult, id) {
    return labformResult.labform_testprm.find((param) => param.labfrmtp_id === id);
}


function processCell(cell, dataCurrent, dataPrv1, dataPrv2, labfrmCode) {

    console.log("cell.name : ",cell.name);
    const cellParts = cell.name.split('-');
    const dataSource = selectDataset(cellParts[0], dataCurrent, dataPrv1, dataPrv2);

    if (!dataSource) return;

    // ตรวจสอบจำนวน parts ที่เหมาะสม
    if (cellParts.length < 2) {
        console.warn('Unrecognized cell format:', cell.name);
        return;
    }

    // ตรวจสอบการแยกเคสตามจำนวน parts ที่มี
    switch (true) {
        case cellParts.length === 2:
            handleCase1(cell, dataSource, cellParts);
            break;
        case cellParts.length === 5 && cellParts[3] !== 'setting_json':
            handleCase2(cell, dataSource, cellParts, labfrmCode);
            break;
        case cellParts.length === 4 && !cellParts.includes('setting_json') && !cellParts.includes('config'):
            handleCase3(cell, dataSource, cellParts, labfrmCode);
            break;
        // case cellParts.length === 5 && cellParts[3] === 'setting_json':
        //     handleCase4(cell, dataSource, cellParts, labfrmCode);
        //     break;
        case cellParts.length === 6 && cellParts[3] === 'setting_json':
            // เคสนี้สำหรับการใช้งาน setting_json ที่มีฟิลด์ย่อย
            handleCase4WithSubField(cell, dataSource, cellParts, labfrmCode);
            break;
        default:
            // ตรวจสอบเคสที่อาจจะมี config หรือ setting เพิ่มเติม
            if (cellParts.includes('config') || cellParts.includes('setting_json')) {
                handleCaseWithConfig(cell, dataSource, cellParts, labfrmCode);
            } else {
                console.warn('Unrecognized cell format:', cell.name);
            }
    }
}


// ฟังก์ชันสำหรับจัดการ Case 1
function handleCase1(cell, dataSource, cellParts) {
    // // ตรวจสอบว่ามี fieldName ที่ระบุอยู่ใน dataSource หรือไม่
    // if (parts.length === 2) {
    //     const fieldName = parts[1];
    //     const value = dataset[fieldName] || "(default: no value)";
    //     console.log("Getting field:", fieldName, "from dataset:", dataset, "Value found:", value);
    //     return value;
    //   }

    const fieldName = cellParts[1];
    if (Object.prototype.hasOwnProperty.call(dataSource, fieldName)) {
        cell.value = dataSource[fieldName];
        console.log('Field found and value set for Case 1:', fieldName, dataSource[fieldName]);
    } else {
        console.warn('Field not found in dataSource for Case 1:', fieldName);
    }
}


// ฟังก์ชันสำหรับจัดการ Case 2
function handleCase2(cell, dataSource, cellParts, labfrmCode) {
    const fieldName = cellParts[3];
    const testParamId = cellParts[4];
    const labformResult = dataSource.labform_result.find(
        (item) => item.labfrm_code === labfrmCode
    );

    if (!labformResult) {
        console.warn('Labform result not found for labfrm_code:', labfrmCode);
        return;
    }

    const testParam = labformResult.labform_testprm.find(
        (item) => item.labfrmtp_id === testParamId
    );

    // แก้ไขการเข้าถึง hasOwnProperty
    if (!testParam || !Object.prototype.hasOwnProperty.call(testParam, fieldName)) {
        console.warn('Test parameter or field not found:', fieldName);
        return;
    }

    cell.value = testParam[fieldName];
    console.log('Field found and value set for Case 2:', fieldName, testParam[fieldName]);
}

// ฟังก์ชันสำหรับจัดการ Case 3
function handleCase3(cell, dataSource, cellParts, labfrmCode) {
    const testParamId = cellParts[3];
    const labformResult = dataSource.labform_result.find(
        (item) => item.labfrm_code === labfrmCode
    );

    if (!labformResult) {
        console.warn('Labform result not found for labfrm_code:', labfrmCode);
        return;
    }

    const testParam = labformResult.labform_testprm.find(
        (item) => item.labfrmtp_id === testParamId
    );

    if (!testParam) {
        console.warn('Test parameter not found:', testParamId);
        return;
    }

    // Matching fields between dataLabformTablerange and dataParts
    Object.keys(testParam).forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(cell, key)) {
            cell[key] = testParam[key];
            console.log('Field matched and value set for Case 3:', key, testParam[key]);
        }
    });
}

// ฟังก์ชันสำหรับจัดการ Case 4 (แก้ไข)
function handleCase4(cell, dataSource, cellParts, labfrmCode) {
    const labformResult = findLabformResult(dataSource, labfrmCode);
    if (!labformResult) {
        console.warn('Labform result not found for Case 4:', labfrmCode);
        return;
    }

    const testParameter = findTestParameterById(labformResult, cellParts[5]);
    if (!testParameter || !('setting_json' in testParameter)) {
        console.warn('Test parameter or setting_json not found for Case 4');
        return;
    }

    const settingJson = JSON.parse(testParameter.setting_json);

    // ตรวจสอบว่ามี subField ที่ต้องการใน settingJson หรือไม่
    const subField = cellParts[4];
    if (Object.prototype.hasOwnProperty.call(settingJson, subField)) {
        cell.value = settingJson[subField];
        console.log('Field found and value set for Case 4:', subField, settingJson[subField]);
    } else {
        console.warn('Sub-field not found in setting_json for Case 4:', subField);
    }
}


// ฟังก์ชันสำหรับจัดการกรณี setting_json ที่มีฟิลด์ย่อย เช่น ref_range
function handleCase4WithSubField(cell, dataSource, cellParts, labfrmCode) {
    const labformResult = findLabformResult(dataSource, labfrmCode);
    if (!labformResult) return;

    const idPartIndex = cellParts.findIndex(part => !isNaN(part));
    if (idPartIndex === -1) return;

    const testParameter = findTestParameterById(labformResult, cellParts[idPartIndex]);
    if (!testParameter) return;

    // ตรวจสอบว่ามี setting_json และฟิลด์ย่อย
    if ('setting_json' in testParameter) {
        const settingJson = JSON.parse(testParameter.setting_json);
        const subField = cellParts[cellParts.length - 2];

        // ใช้ Object.prototype.hasOwnProperty.call แทน
        if (Object.prototype.hasOwnProperty.call(settingJson, subField)) {
            cell.value = settingJson[subField];
        } else {
            console.warn('Sub-field not found in setting_json:', subField);
        }
    }
}



// ฟังก์ชันเพิ่มเติมสำหรับการจัดการกรณีที่มี config หรือ setting
function handleCaseWithConfig(cell, dataSource, cellParts, labfrmCode) {
    // กรณีนี้จะตรวจสอบว่ามีข้อมูล setting หรือ config อยู่ใน cell.name หรือไม่
    const fieldName = cellParts.includes('setting') ? 'setting_json' : 'config';
    const testParamId = cellParts[cellParts.length - 1];
    const labformResult = dataSource.labform_result.find(
        (item) => item.labfrm_code === labfrmCode
    );

    if (!labformResult) {
        console.warn('Labform result not found for labfrm_code:', labfrmCode);
        return;
    }

    const testParam = labformResult.labform_testprm.find(
        (item) => item.labfrmtp_id === testParamId
    );

    if (!testParam || !Object.prototype.hasOwnProperty.call(testParam, fieldName)) {
        console.warn('Test parameter or field not found for config/setting:', fieldName);
        return;
    }

    const subFieldName = cellParts[cellParts.length - 2];
    if (testParam[fieldName] && testParam[fieldName][subFieldName]) {
        cell.value = testParam[fieldName][subFieldName];
        console.log(`Field found and value set for ${fieldName}:`, subFieldName, testParam[fieldName][subFieldName]);
    } else {
        console.warn('Subfield not found in config/setting:', subFieldName);
    }
}


// 2024-10-28 : ก่อนปรับเพิ่มฟังก์ชั่น convertToDataFormat

// /* export default function updateLabformTablerange(dataLabformTablerange, dataCurrent, dataPrv1, dataPrv2, labfrmCode) {
//     // แก้ไขการแยกเคสด้วย switch เพื่อความชัดเจน
//     dataLabformTablerange.rows.forEach((row) => {
//         row.cells.forEach((cellGroup) => {
//             if (Array.isArray(cellGroup)) {
//                 cellGroup.forEach((cell) => processCell(cell, dataCurrent, dataPrv1, dataPrv2, labfrmCode));
//             } else {
//                 processCell(cellGroup, dataCurrent, dataPrv1, dataPrv2, labfrmCode);
//             }
//         });
//     });

//     return dataLabformTablerange;
// } */

//     export default function updateLabformTablerange(dataLabformTablerange, dataCurrent, dataPrv1, dataPrv2, labfrmCode) {
//         // แก้ไขการแยกเคสด้วย switch เพื่อความชัดเจน
    
//         // วนอ่านข้อมูลส่วนของ headers
//         dataLabformTablerange.headers.forEach((headerRow) => {
//             headerRow.forEach((headerCell) => {
//                 processCell(headerCell, dataCurrent, dataPrv1, dataPrv2, labfrmCode);
//             });
//         });
    
//         // วนอ่านข้อมูลส่วนของ rows
//         dataLabformTablerange.rows.forEach((row) => {
//             row.cells.forEach((cellGroup) => {
//                 if (Array.isArray(cellGroup)) {
//                     cellGroup.forEach((cell) => processCell(cell, dataCurrent, dataPrv1, dataPrv2, labfrmCode));
//                 } else {
//                     processCell(cellGroup, dataCurrent, dataPrv1, dataPrv2, labfrmCode);
//                 }
//             });
//         });
    
//         return dataLabformTablerange;
//     }
    


// // ฟังก์ชันเลือก dataset
// function selectDataset(part, dataCurrent, dataPrv1, dataPrv2) {
//     switch (part) {
//         case 'data_current':
//             return dataCurrent;
//         case 'data_prv1':
//             return dataPrv1;
//         case 'data_prv2':
//             return dataPrv2;
//         default:
//             console.warn('Unknown data part:', part);
//             return null;
//     }
// }



// // ฟังก์ชันหา labform_result จาก labfrmCode
// function findLabformResult(dataSource, labfrmCode) {
//     return dataSource.labform_result.find((result) => result.labfrm_code === labfrmCode);
// }

// // ฟังก์ชันหา Test Parameter ตาม ID
// function findTestParameterById(labformResult, id) {
//     return labformResult.labform_testprm.find((param) => param.labfrmtp_id === id);
// }


// function processCell(cell, dataCurrent, dataPrv1, dataPrv2, labfrmCode) {

//     console.log("cell.name : ",cell.name);
//     const cellParts = cell.name.split('-');
//     const dataSource = selectDataset(cellParts[0], dataCurrent, dataPrv1, dataPrv2);

//     if (!dataSource) return;

//     // ตรวจสอบจำนวน parts ที่เหมาะสม
//     if (cellParts.length < 2) {
//         console.warn('Unrecognized cell format:', cell.name);
//         return;
//     }

//     // ตรวจสอบการแยกเคสตามจำนวน parts ที่มี
//     switch (true) {
//         case cellParts.length === 2:
//             handleCase1(cell, dataSource, cellParts);
//             break;
//         case cellParts.length === 5 && cellParts[3] !== 'setting_json':
//             handleCase2(cell, dataSource, cellParts, labfrmCode);
//             break;
//         case cellParts.length === 4 && !cellParts.includes('setting_json') && !cellParts.includes('config'):
//             handleCase3(cell, dataSource, cellParts, labfrmCode);
//             break;
//         // case cellParts.length === 5 && cellParts[3] === 'setting_json':
//         //     handleCase4(cell, dataSource, cellParts, labfrmCode);
//         //     break;
//         case cellParts.length === 6 && cellParts[3] === 'setting_json':
//             // เคสนี้สำหรับการใช้งาน setting_json ที่มีฟิลด์ย่อย
//             handleCase4WithSubField(cell, dataSource, cellParts, labfrmCode);
//             break;
//         default:
//             // ตรวจสอบเคสที่อาจจะมี config หรือ setting เพิ่มเติม
//             if (cellParts.includes('config') || cellParts.includes('setting_json')) {
//                 handleCaseWithConfig(cell, dataSource, cellParts, labfrmCode);
//             } else {
//                 console.warn('Unrecognized cell format:', cell.name);
//             }
//     }
// }


// // ฟังก์ชันสำหรับจัดการ Case 1
// function handleCase1(cell, dataSource, cellParts) {
//     // // ตรวจสอบว่ามี fieldName ที่ระบุอยู่ใน dataSource หรือไม่
//     // if (parts.length === 2) {
//     //     const fieldName = parts[1];
//     //     const value = dataset[fieldName] || "(default: no value)";
//     //     console.log("Getting field:", fieldName, "from dataset:", dataset, "Value found:", value);
//     //     return value;
//     //   }

//     const fieldName = cellParts[1];
//     if (Object.prototype.hasOwnProperty.call(dataSource, fieldName)) {
//         cell.value = dataSource[fieldName];
//         console.log('Field found and value set for Case 1:', fieldName, dataSource[fieldName]);
//     } else {
//         console.warn('Field not found in dataSource for Case 1:', fieldName);
//     }
// }


// // ฟังก์ชันสำหรับจัดการ Case 2
// function handleCase2(cell, dataSource, cellParts, labfrmCode) {
//     const fieldName = cellParts[3];
//     const testParamId = cellParts[4];
//     const labformResult = dataSource.labform_result.find(
//         (item) => item.labfrm_code === labfrmCode
//     );

//     if (!labformResult) {
//         console.warn('Labform result not found for labfrm_code:', labfrmCode);
//         return;
//     }

//     const testParam = labformResult.labform_testprm.find(
//         (item) => item.labfrmtp_id === testParamId
//     );

//     // แก้ไขการเข้าถึง hasOwnProperty
//     if (!testParam || !Object.prototype.hasOwnProperty.call(testParam, fieldName)) {
//         console.warn('Test parameter or field not found:', fieldName);
//         return;
//     }

//     cell.value = testParam[fieldName];
//     console.log('Field found and value set for Case 2:', fieldName, testParam[fieldName]);
// }

// // ฟังก์ชันสำหรับจัดการ Case 3
// function handleCase3(cell, dataSource, cellParts, labfrmCode) {
//     const testParamId = cellParts[3];
//     const labformResult = dataSource.labform_result.find(
//         (item) => item.labfrm_code === labfrmCode
//     );

//     if (!labformResult) {
//         console.warn('Labform result not found for labfrm_code:', labfrmCode);
//         return;
//     }

//     const testParam = labformResult.labform_testprm.find(
//         (item) => item.labfrmtp_id === testParamId
//     );

//     if (!testParam) {
//         console.warn('Test parameter not found:', testParamId);
//         return;
//     }

//     // Matching fields between dataLabformTablerange and dataParts
//     Object.keys(testParam).forEach((key) => {
//         if (Object.prototype.hasOwnProperty.call(cell, key)) {
//             cell[key] = testParam[key];
//             console.log('Field matched and value set for Case 3:', key, testParam[key]);
//         }
//     });
// }

// // ฟังก์ชันสำหรับจัดการ Case 4 (แก้ไข)
// function handleCase4(cell, dataSource, cellParts, labfrmCode) {
//     const labformResult = findLabformResult(dataSource, labfrmCode);
//     if (!labformResult) {
//         console.warn('Labform result not found for Case 4:', labfrmCode);
//         return;
//     }

//     const testParameter = findTestParameterById(labformResult, cellParts[5]);
//     if (!testParameter || !('setting_json' in testParameter)) {
//         console.warn('Test parameter or setting_json not found for Case 4');
//         return;
//     }

//     const settingJson = JSON.parse(testParameter.setting_json);

//     // ตรวจสอบว่ามี subField ที่ต้องการใน settingJson หรือไม่
//     const subField = cellParts[4];
//     if (Object.prototype.hasOwnProperty.call(settingJson, subField)) {
//         cell.value = settingJson[subField];
//         console.log('Field found and value set for Case 4:', subField, settingJson[subField]);
//     } else {
//         console.warn('Sub-field not found in setting_json for Case 4:', subField);
//     }
// }


// // ฟังก์ชันสำหรับจัดการกรณี setting_json ที่มีฟิลด์ย่อย เช่น ref_range
// function handleCase4WithSubField(cell, dataSource, cellParts, labfrmCode) {
//     const labformResult = findLabformResult(dataSource, labfrmCode);
//     if (!labformResult) return;

//     const idPartIndex = cellParts.findIndex(part => !isNaN(part));
//     if (idPartIndex === -1) return;

//     const testParameter = findTestParameterById(labformResult, cellParts[idPartIndex]);
//     if (!testParameter) return;

//     // ตรวจสอบว่ามี setting_json และฟิลด์ย่อย
//     if ('setting_json' in testParameter) {
//         const settingJson = JSON.parse(testParameter.setting_json);
//         const subField = cellParts[cellParts.length - 2];

//         // ใช้ Object.prototype.hasOwnProperty.call แทน
//         if (Object.prototype.hasOwnProperty.call(settingJson, subField)) {
//             cell.value = settingJson[subField];
//         } else {
//             console.warn('Sub-field not found in setting_json:', subField);
//         }
//     }
// }



// // ฟังก์ชันเพิ่มเติมสำหรับการจัดการกรณีที่มี config หรือ setting
// function handleCaseWithConfig(cell, dataSource, cellParts, labfrmCode) {
//     // กรณีนี้จะตรวจสอบว่ามีข้อมูล setting หรือ config อยู่ใน cell.name หรือไม่
//     const fieldName = cellParts.includes('setting') ? 'setting_json' : 'config';
//     const testParamId = cellParts[cellParts.length - 1];
//     const labformResult = dataSource.labform_result.find(
//         (item) => item.labfrm_code === labfrmCode
//     );

//     if (!labformResult) {
//         console.warn('Labform result not found for labfrm_code:', labfrmCode);
//         return;
//     }

//     const testParam = labformResult.labform_testprm.find(
//         (item) => item.labfrmtp_id === testParamId
//     );

//     if (!testParam || !Object.prototype.hasOwnProperty.call(testParam, fieldName)) {
//         console.warn('Test parameter or field not found for config/setting:', fieldName);
//         return;
//     }

//     const subFieldName = cellParts[cellParts.length - 2];
//     if (testParam[fieldName] && testParam[fieldName][subFieldName]) {
//         cell.value = testParam[fieldName][subFieldName];
//         console.log(`Field found and value set for ${fieldName}:`, subFieldName, testParam[fieldName][subFieldName]);
//     } else {
//         console.warn('Subfield not found in config/setting:', subFieldName);
//     }
// }


/* // ฟังก์ชันนี้ใช้ในการดึงค่าจาก dataCurrent, dataPrv1, หรือ dataPrv2 โดยอิงจากชิ้นส่วนของ 'name' ที่ได้มาจากการ split
const getValueFromData = (parts, dataCurrent, dataPrv1, dataPrv2, labfrmCode) => {
    const datasetName = parts[0];
    const dataset = datasetName === "data_current" ? dataCurrent : datasetName === "data_prv1" ? dataPrv1 : dataPrv2;
  
    console.log("Dataset Selected:", datasetName, dataset);
  
    if (parts.length === 2) {
      const fieldName = parts[1];
      const value = dataset[fieldName] || "(default: no value)";
      console.log("Getting field:", fieldName, "from dataset:", dataset, "Value found:", value);
      return value;
    }
  
    if (parts.length >= 4 && parts[1] === "labform_result" && parts[2] === "labform_testprm") {
      const testParamId = parts[parts.length - 1];
      const fieldName = parts.length === 4 ? null : parts[3];
  
      const labformResult = dataset.labform_result.find(result => result.labfrm_code === labfrmCode);
      console.log("Labform Result found:", labformResult);
  
      if (!labformResult) {
        console.error("Labform Result not found for labfrmCode:", labfrmCode);
        return "(default: no labform result)";
      }
  
      const testParam = labformResult.labform_testprm.find(param => param.labfrmtp_id === testParamId);
      console.log("Test Parameter found:", testParam);
  
      if (!testParam) {
        console.error("Test Parameter not found for ID:", testParamId);
        return "(default: no test parameter)";
      }
  
      if (!fieldName) {
        const result = {};
        if ('value' in testParam) result['value'] = testParam['value'];
        if ('setting_json' in testParam) result['setting_json'] = JSON.parse(testParam['setting_json']);
        console.log("Result for non-specific field:", result);
        return result;
      }
  
      if (parts.length > 5 && fieldName === "setting_json") {
        const nestedField = parts[4];
        const jsonData = JSON.parse(testParam[fieldName] || "{}");
        const nestedValue = jsonData[nestedField] || "(default: no nested value)";
        console.log(`Nested JSON field '${nestedField}' value:`, nestedValue);
        return nestedValue;
      }
  
      const fieldValue = testParam[fieldName] || "(default: no specific field value)";
      console.log("Returning specific field:", fieldName, "Value:", fieldValue);
      return fieldValue;
    }
  
    console.warn("No matching case for parts:", parts);
    return "(default: no matching data)";
  };
  
  
  
  
  // ฟังก์ชันนี้ใช้ในการอัพเดทข้อมูลใน data_labform_tablerange โดยอิงจากข้อมูลใน dataCurrent, dataPrv1, และ dataPrv2
const updateLabformTablerange = (dataLabformTablerange, dataCurrent, dataPrv1, dataPrv2, labfrmCode) => {
    console.log("Initial dataLabformTablerange:", dataLabformTablerange);
  
    // Clone ข้อมูล dataLabformTablerange เพื่อป้องกันการแก้ไขข้อมูลเดิม
    const updatedData = { ...dataLabformTablerange };
  
    // อัพเดทข้อมูลในส่วนของ headers
    updatedData.headers = updatedData.headers.map(headerRow =>
      headerRow.map(header => {
        const parts = header.name.split("-");
        console.log("Header parts split:", parts);
  
        // ดึงค่าจาก dataCurrent, dataPrv1, หรือ dataPrv2 โดยใช้ฟังก์ชัน getValueFromData
        const newValue = getValueFromData(parts, dataCurrent, dataPrv1, dataPrv2, labfrmCode);
        console.log("Updating header:", header.name, "with value:", newValue);
  
        return {
          ...header,
          value: newValue
        };
      })
    );
  
    // อัพเดทข้อมูลในส่วนของ rows
    updatedData.rows = updatedData.rows.map(row => ({
      ...row,
      cells: Array.isArray(row.cells)
        ? row.cells.map(cellGroup => 
            Array.isArray(cellGroup)
              ? cellGroup.map(cell => {
                  const parts = cell.name.split("-");
                  console.log("Cell parts split:", parts);
  
                  // ดึงข้อมูลที่ตรงกับ cell โดยใช้ฟังก์ชัน getValueFromData
                  const matchingFields = getValueFromData(parts, dataCurrent, dataPrv1, dataPrv2, labfrmCode);
                  console.log("Matching fields:", matchingFields);
  
                  // ตรวจสอบว่า matchingFields เป็น object ที่มีค่าหรือไม่
                  if (typeof matchingFields === 'object' && matchingFields !== null) {
                    console.log("Updating cell with matching fields:", matchingFields);
  
                    return {
                      ...cell,
                      value: matchingFields['value'] || cell.value,
                      setting_json: matchingFields['setting_json'] || cell.setting_json
                    };
                  }
  
                  console.log("Updating cell with specific value:", matchingFields);
                  return {
                    ...cell,
                    value: matchingFields
                  };
                })
              : cellGroup
          )
        : row.cells
    }));
  
    console.log("Updated dataLabformTablerange:", updatedData);
    return updatedData;
  };
  
  
  
  

  export default updateLabformTablerange;
  
  // Example usage
  // const updatedLabformTablerange = updateLabformTablerange(dataLabformTablerange, data_current, data_prv1, data_prv2);
   */