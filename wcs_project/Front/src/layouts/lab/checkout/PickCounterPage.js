import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PickCounterCard from "./checkout_t_card";
import CounterAPI from "api/CounterAPI";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";

const PickCounterPage = () => {
  const { counterId } = useParams();
  const [counter, setCounter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounter = async () => {
      try {
        const res = await CounterAPI.getByID(counterId);
        setCounter(res?.data);
        console.log("res", res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCounter();
  }, [counterId]);

  if (loading) return <div>Loading...</div>;
  if (!counter) return <div>Counter not found</div>;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox p={2}>
        <PickCounterCard
          counter={counter.id}
          pickQty={counter.plan}
          pickedQty={counter.actual}
          imageUrl={counter.imageUrl || ""}
          transaction={counter.order || {}}
          slots={6}
          activeSlot={1}
        />
      </MDBox>
    </DashboardLayout>
  );
};

export default PickCounterPage;
