import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CounterScreen from "../components/counter_screen";
import CounterAPI from "api/CounterAPI";
import MDBox from "components/MDBox";
import DisplayLayout from "../../../utils/DisplayLayout";
import CounterStandbyScreen from "../components/counter_standby_screen";

const PickCounterPage = () => {
  const { counterId } = useParams();
  const [counter, setCounter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounter = async () => {
      try {
        const res = await CounterAPI.getByCounterIdPublic(counterId); // คืนค่า array
        const data = res?.data;

        if (!data || data.length === 0) {
          setCounter(null);
        } else {
          // ใช้แถวแรกเป็นตัวอย่าง
          setCounter(data[0]);
        }

        console.log("res", data);
      } catch (err) {
        console.error(err);
        setCounter(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCounter();
  }, [counterId]);

  //ทำ sse
  useEffect(() => {
    if (!counterId) return;

    console.log("Connecting SSE to counter:", counterId);

    const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:3000";

    const es = new EventSource(
      `${API_BASE}/api/sse/${counterId}?key=${process.env.REACT_APP_WCS_SCREEN_KEY}`
    );

    es.onopen = () => {
      console.log("✅ SSE connected");
    };

    es.onmessage = (e) => {
      console.log("📡 SSE message:", e.data);

      const data = JSON.parse(e.data);

      setCounter((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          actual_qty: data.actualQty, // 👈 ตรง backend
        };
      });
    };

    es.onerror = (err) => {
      console.error("❌ SSE error", err);
      es.close();
    };

    return () => {
      console.log("🔌 SSE closed");
      es.close();
    };
  }, [counterId]);

  function ScaledWrapper({ children }) {
    const BASE_W = 1920;
    const BASE_H = 1080;

    const [scale, setScale] = React.useState(1);

    React.useEffect(() => {
      const resize = () => {
        const s = Math.min(window.innerWidth / BASE_W, window.innerHeight / BASE_H);
        setScale(s);
      };

      resize();
      window.addEventListener("resize", resize);
      return () => window.removeEventListener("resize", resize);
    }, []);

    return (
      <div
        style={{
          width: BASE_W,
          height: BASE_H,
          transform: `scale(${scale})`,
          transformOrigin: "top left",

          /* 🔥 จัดให้อยู่กลาง "หลังจาก scale" */
          marginLeft: `calc((100vw - ${BASE_W * scale}px) / 2)`,
          marginTop: `calc((100vh - ${BASE_H * scale}px) / 2)`,
        }}
      >
        {children}
      </div>
    );
  }

  if (loading) return <div>Loading...</div>;
  if (!counter) return <div>Counter not found</div>;

  return (
    <DisplayLayout>
      <MDBox
        sx={{
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
          backgroundColor: "#ffffff",
        }}
      >
        <ScaledWrapper>
          {counter?.trx_type === null ? (
            <CounterStandbyScreen counter={counter} />
          ) : (
            <CounterScreen
              counter={counter} // counter object
              stock_item={counter.stock_item} // จาก flattened row
              item_desc={counter.item_desc}
              plan_qty={counter.plan_qty}
              pickedQty={counter.actual_qty}
              spr_no={counter.spr_no}
              type={counter.trx_type} // เปลี่ยนจาก counter.type
              work_order={counter.work_order}
              mc_code={counter.mc_code}
              usage_num={counter.usage_num}
              usage_line={counter.usage_line}
              po_num={counter.po_num}
              object_id={counter.object_id}
              item_id={counter.item_id}
              imageUrl={counter.item_img_url}
              slots={6}
            />
          )}
        </ScaledWrapper>
      </MDBox>
    </DisplayLayout>
  );
};
export default PickCounterPage;
