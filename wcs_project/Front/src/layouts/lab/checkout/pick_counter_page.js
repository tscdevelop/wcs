// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import CounterScreen from "../components/counter_screen";
// import CounterAPI from "api/CounterAPI";
// import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
// import DashboardNavbar from "examples/Navbars/DashboardNavbar";
// import MDBox from "components/MDBox";

// const PickCounterPage = () => {
//   const { counterId } = useParams();
//   const [counter, setCounter] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchCounter = async () => {
//       try {
//         const res = await CounterAPI.getByID(counterId);
//         setCounter(res?.data);
//         console.log("res", res);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchCounter();
//   }, [counterId]);

//   if (loading) return <div>Loading...</div>;
//   if (!counter) return <div>Counter not found</div>;

//   return (
//     <DashboardLayout>
//       <DashboardNavbar />
//       <MDBox p={2}>
//         <CounterScreen
//           counter={counter}                     // ✅ ส่ง object ทั้งตัว
//           stock_item={counter.stock_item}       // ✅ ชื่อสินค้า
//           brand={counter.brand}                 // ✅ ยี่ห้อ
//           item_desc={counter.item_desc}         // ✅ รายละเอียดสินค้า
//           plan_qty={counter.plan}               // ✅ จำนวนที่ต้อง pick
//           pickedQty={counter.actual}            // ✅ จำนวนที่ pick แล้ว
//           imageUrl={counter.imageUrl || ""}     // ✅ รูปสินค้า
//           transaction={counter.order || {}}     // ✅ ข้อมูล transaction
//           slots={6}
//           activeSlot={1}
//         />
//       </MDBox>
//     </DashboardLayout>
//   );
// };

// export default PickCounterPage;
import React, { useState, useEffect } from "react";
import CounterScreen from "../components/counter_screen";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";

const PickCounterPageMock = () => {
  const [counter, setCounter] = useState(null);

  useEffect(() => {
    // mock data
    const mockData = {
      id: 1,
      color: "#FF0000", // สีแดง
      stock_item: "AGL-TCL-10081",
      brand: "CAPITAL",
      item_desc: "45W 6.6A PK30D Lamp, Model: 64319Z",
      plan: 55,          // จำนวนที่ต้อง pick
      actual: 0,         // จำนวนที่ pick แล้ว
      imageUrl: "/mock_lamp.png", // ถ้าไม่มี image ให้ว่าง ""
      order: {
        code: "T18M101",
        type: "Transfer (Pick)",
        spr: "SPR20-1000060",
        workOrder: "WO20-182320",
        po: "6000",
        objectId: 1,
      },
    };

    setCounter(mockData);
  }, []);

  if (!counter) return <div>Loading mock data...</div>;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox p={2}>
        <CounterScreen
          counter={counter}
          stock_item={counter.stock_item}
          brand={counter.brand}
          item_desc={counter.item_desc}
          plan_qty={counter.plan}
          pickedQty={counter.actual}
          imageUrl={counter.imageUrl}
          transaction={counter.order}
          slots={6}
          activeSlot={1}
        />
      </MDBox>
    </DashboardLayout>
  );
};

export default PickCounterPageMock;
