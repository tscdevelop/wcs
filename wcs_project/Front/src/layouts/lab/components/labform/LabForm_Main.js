import React, { useState, useEffect, useRef } from "react";
import { Card, Box, Grid, Typography, Button } from "@mui/material";
import MDButton from "components/MDButton";
import CompanyInfo from "../companyinfo";
import InfoCardPet from "../form_info_pet";
import Asign from "../form_footer_sign";
import html2canvas from "html2canvas";
import LabsAPI from "api/LabsAPI";

function LabFormMain() {
    const [showDropdown, setShowDropdown] = useState(true);
    const labinspiId = 1;
    const labType = "LAB_IN"; // LAB_EXT , LAB_IN
    const [petJson, setPetJson] = useState(null); // สถานะสำหรับ petJson
    const [asignJson, setAsignJson] = useState(null);

    const [reportedByList, setReportedByList] = useState([]);
    const [approvedByList, setApprovedByList] = useState([]);
    // state สำหรับเก็บค่าที่เลือกใน dropdown
    const [selectedReportedBy, setSelectedReportedBy] = useState(null);
    const [selectedApprovedBy, setSelectedApprovedBy] = useState(null);
  
    // เก็บค่าเริ่มต้นของพนักงานในตำแหน่ง reported และ approved
    const [initialReportedBy, setInitialReportedBy] = useState(null);
    const [initialApprovedBy, setInitialApprovedBy] = useState(null);

    const [formData, setFormData] = useState(null);

    const fetchPetData = async () => {
        try {
          const responseJson = await LabsAPI.getlabinspiId(labinspiId); // ใช้ labinspiId เป็น parameter
          if (responseJson.isCompleted && responseJson.data) {
            setPetJson((prev) => ({
              ...prev,
              pet_id: responseJson.data.pet_id || "",
              labinspirs_pet_json: responseJson.data.labinspirs_pet_json || prev.labinspirs_pet_json,
            }));
    
            // setSettingJson((prev) => ({
            //   ...prev,
            //   labinspirs_fileupload_json:
            //     responseJson.data.labinspirs_fileupload_json || prev.labinspirs_fileupload_json,
            // }));
    
            setAsignJson((prev) => ({
              ...prev,
              emp_id_reported: responseJson.data.emp_id_reported || "",
              labinspirs_reported_json:
                responseJson.data.labinspirs_reported_json || prev.labinspirs_reported_json,
              emp_id_approved: responseJson.data.emp_id_approved || "",
              labinspirs_approved_json:
                responseJson.data.labinspirs_approved_json || prev.labinspirs_approved_json,
            }));
    
            console.log("Updated asignJson:", {
              emp_id_reported: responseJson.data.emp_id_reported || "",
              labinspirs_reported_json: responseJson.data.labinspirs_reported_json || "",
              emp_id_approved: responseJson.data.emp_id_approved || "",
              labinspirs_approved_json: responseJson.data.labinspirs_approved_json || "",
            });
    
            // เก็บค่าเริ่มต้นที่ได้จาก API ไว้ใน state
            setInitialReportedBy(responseJson.data.labinspirs_reported_json);
            setInitialApprovedBy(responseJson.data.labinspirs_approved_json);
            console.log("Initial reported by:", responseJson.data.labinspirs_reported_json);
            console.log("Initial approved by:", responseJson.data.labinspirs_approved_json);
    
            // กำหนดค่าที่เลือกใน dropdown ตามข้อมูลที่ได้จาก API
            setSelectedReportedBy(
              reportedByList.find((reported) => reported.value === responseJson.data.emp_id_reported) ||
                null
            );
            setSelectedApprovedBy(
              approvedByList.find((approved) => approved.value === responseJson.data.emp_id_approved) ||
                null
            );
            console.log("Selected reported by:", responseJson.data.emp_id_reported);
            console.log("Selected approved by:", responseJson.data.emp_id_approved);
          }
        } catch (error) {
          console.error("Error fetching pet data:", error);
        }
      };

      
 useEffect(() => {
    fetchPetData();
   }, [labinspiId])

   const handleEmployeeLists = (reportedList, approvedList) => {
    setReportedByList(reportedList);
    setApprovedByList(approvedList);
  };


 

 


  return(
    <div>
        <Card className="print-card" style={{ width: "95%", marginTop: "25px" }}>
            <Box p={2} pt={4}>
                <Grid container spacing={1}>
                    <Grid container item md={12} xs={12} spacing={3} >
                        <Grid item md={12} xs={12}>
                            <CompanyInfo
                                labType={labType}
                                showDropdown={showDropdown}
                                onChange={(companyId) => console.log("Selected company ID:", companyId)}
                            />
                        </Grid>

                        <Grid container item md={12} justify="center" alignItems="center">
                            <Grid item md={12}>
                                <hr
                                style={{
                                    marginTop: 10,
                                    marginBottom: 10,
                                    marginLeft: "100px",
                                    marginRight: "100px",
                                }}
                                />
                                <InfoCardPet petId={1} petJson={petJson} />
                            </Grid>
                        </Grid>

                        
                        <Grid container item md={12} justify="center" alignItems="center">
                            <Grid item md={12}>
                                <Asign
                                showDropdown={showDropdown} // เปิดปิด dropdown
                                asignJson={asignJson}
                                selectedReportedBy={selectedReportedBy}
                                selectedApprovedBy={selectedApprovedBy}
                                initialReportedBy={initialReportedBy}
                                initialApprovedBy={initialApprovedBy}
                                setSelectedReportedBy={setSelectedReportedBy} // ส่งฟังก์ชัน setSelectedReportedBy เป็น props
                                setSelectedApprovedBy={setSelectedApprovedBy} // ส่งฟังก์ชัน setSelectedApprovedBy เป็น props
                                onEmployeeLists={handleEmployeeLists} // ส่ง callback ฟังก์ชัน
                                onDataChange={(data) => setFormData(data)} // รับข้อมูลในรูปแบบ JSON จาก Asign
                                />
                            </Grid>
                        </Grid>


                    </Grid>
                </Grid>
            </Box>
        </Card>

        
    </div>
  );
}

export default LabFormMain;