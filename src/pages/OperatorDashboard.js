import React, { useState, useEffect } from "react";
import axios from "axios";
import LiveWeightCard from "../components/LiveWeightCard";
import StatsCards from "../components/StatsCard";
import FirstWeightForm from "../components/FirstWeightForm";
import SecondWeightForm from "../components/SecondWeightForm";
import FinalWeightForm from "../components/FinalWeightForm";
import RecordsTable from "../components/RecordsTable";
import PrintModal from "../components/PrintModal";

export default function OperatorDashboard() {
  // ✅ State variables
  const [currentWeight, setCurrentWeight] = useState(0);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [slipType, setSlipType] = useState("first");

  // Vehicle prices can be moved to a config file if needed
  const [vehiclePrices, setVehiclePrices] = useState({
    Select: 0,
    DahWheeler: 500,
    SixWheeler: 400,
    Tractor: 300,
    Mazda: 300,
    Datson: 150,
    Shahzore: 150,
    Daalo: 100,
    Chingchi: 100,
    GadahGano: 100,
  });

  // Helper function to format date to 12-hour format
  const formatTo12Hour = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
};

  // ✅ Live Weight Callback
  const handleWeightUpdate = (weight) => {
    console.log("Live weight updated:", weight);
    setCurrentWeight(weight);
  };
   
  // ✅ Dashboard Stats
  const totalVehicles = records.length;
  const pendingSecond = records.filter((r) => r => !r.second_weight).length;

  // ✅ Fetch Records from Backend
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await axios.get(
          "http://localhost/weightscale/index.php?action=getRecords"
        );
        if (response.data.status === "success") {
          setRecords(response.data.data);
        } else {
          console.error("Failed to load records", response.data);
        }
      } catch (error) {
        console.error("Error fetching records:", error);
      }
    };
    fetchRecords();
  }, []);

  // calculate today's total 
  const today = new Date();
const todaysRecords = records.filter((r) => {
  if (!r.first_weight_time) return false;

  const recordDate = new Date(r.first_weight_time); // parse formatted date
  return (
    recordDate.getFullYear() === today.getFullYear() &&
    recordDate.getMonth() === today.getMonth() &&
    recordDate.getDate() === today.getDate()
  );
});

const todaysTotal = todaysRecords.reduce(
  (sum, r) => sum + (parseFloat(r.total_price) || 0),
  0
);

  

  // ✅ Update records state and open print modal after first weight save
  const firstWeightSuccess = async (savedRecord) => {
    // Update records state
    setRecords((prev) => [savedRecord, ...prev]);
    
    // ✅ Open Print Modal after save
    setSelectedRecord({
      vehicle: savedRecord.vehicle_number,
      type: savedRecord.vehicle_type,
      product: savedRecord.product,
      first_weight: savedRecord.first_weight,
      price: savedRecord.price_per_kg,
      first_weight_time: savedRecord.first_weight_time,
      driver: savedRecord.driver_name,
    });
    setSlipType("first"); // store whether it's first or second weight
    alert("First weight saved successfully!");
    setShowPrintModal(true);
    
  };

  // ✅ Save Second Weight
  const secondWeightSuccess = async (updatedRecord) => {
  // ✅ Update the records array by replacing the old record
  setRecords((prev) =>
    prev.map((r) => (r.id === updatedRecord.id ? updatedRecord : r))
  );

  // ✅ Set selected record for the print modal (no duplicate formatting)
  setSelectedRecord({
    vehicle: updatedRecord.vehicle_number,
    type: updatedRecord.vehicle_type,
    product: updatedRecord.product,
    first_weight: updatedRecord.first_weight,
    second_weight: updatedRecord.second_weight,
    net_weight: updatedRecord.net_weight,
    price: updatedRecord.total_price,
    first_weight_time: formatTo12Hour(updatedRecord.first_weight_time), // already formatted earlier
    second_weight_time: formatTo12Hour(updatedRecord.second_weight_time), // already formatted earlier
    driver: updatedRecord.driver_name,
  });

  // ✅ Set slip type and show modal
  setSlipType("second");
  alert("Second weight saved successfully!");
  setShowPrintModal(true);
};

  // ✅ Save Final Weight
  const finalWeightSuccess = async (data) => {
    setRecords((prev) => [data, ...prev]);
    
        // ✅ Use `data` (not API response) for modal
        setSelectedRecord({
        vehicle: data.vehicle_number,
          type: data.vehicle_type,
          product: data.product,
          first_weight: data.first_weight,
          second_weight: data.second_weight,
          net_weight: data.net_weight,
          price: data.total_price,
          first_weight_time: formatTo12Hour(data.first_weight_time), // already formatted earlier
          second_weight_time: formatTo12Hour(data.second_weight_time), // already formatted earlier
          driver: data.driver_name,
      });
        setSlipType("final");
        alert("Final weight saved successfully!");
        setShowPrintModal(true);
  };

   
  
  // At the top of OperatorDashboard, after useState declarations
  const openPrintModal = (record, slipType = "first") => {
    setSelectedRecord({
      vehicle: record.vehicle_number,
      type: record.vehicle_type,
      product: record.product,
      first_weight: record.first_weight,
      second_weight: record.second_weight,
      net_weight: record.net_weight,
      price: record.total_price || record.price_per_kg,
      first_weight_time: formatTo12Hour(record.first_weight_time), // already formatted earlier
      second_weight_time: formatTo12Hour(record.second_weight_time), // already formatted earlier
      driver: record.driver_name,
    });
    setSlipType(slipType);
    setShowPrintModal(true);
  };

  
  return (
    <div className="container py-4">
      {/* <LiveWeightCard onWeightChange={handleWeightUpdate} /> */}
      <StatsCards
        totalVehicles={totalVehicles}
        pendingSecond={pendingSecond}
        onWeightChange={handleWeightUpdate}
        todaysTotal={todaysTotal}
      />

      {/* First Weight Form */}
      <FirstWeightForm
        onSuccess={firstWeightSuccess}
        liveWeight={currentWeight}
        vehiclePrices={vehiclePrices}
      />

      {/* Second Weight Form */}
      <SecondWeightForm
        records={records}
        onSuccess={secondWeightSuccess}
        liveWeight={currentWeight}
      />

      {/* Final Weight Form */}
      <FinalWeightForm
        liveWeight={currentWeight} // Pass live weight from OperatorDashboard
        onSuccess={finalWeightSuccess} // Callback to update records & modal
        vehiclePrices={vehiclePrices}
      />

      {/* Records Table */}
      {/* <RecordsTable records={records} openPrintModal={openPrintModal} vehiclePrices={vehiclePrices} slipType={slipType} onUpdateRecord={handleUpdateRecord}  /> */}

      {/* ✅ React-controlled Print Modal */}
      {selectedRecord && (
        <PrintModal
          show={showPrintModal}
          record={selectedRecord}
          slipType={slipType}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </div>
  );
}