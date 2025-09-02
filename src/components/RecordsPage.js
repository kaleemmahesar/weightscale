import React, { useState } from "react";
import RecordsTable from "../components/RecordsTable";
import PrintModal from "../components/PrintModal";

export default function RecordsPage({  records: initialRecords }) {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [slipType, setSlipType] = useState("first");
  const [records, setRecords] = useState(initialRecords || []);

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

  const openPrintModal = (record, type) => {
    setSelectedRecord(record);
    setSlipType(type);
    setShowPrintModal(true);
  };

  // Close the print modal
  const closePrintModal = () => {
    setShowPrintModal(false);
    setSelectedRecord(null);
  };
  
  // Update a record in state
  const handleUpdateRecord = (updatedRecord) => {
    setRecords((prevRecords) =>
      prevRecords.map((r) =>
        String(r.id) === String(updatedRecord.id)
          ? { ...r, ...updatedRecord }
          : r
      )
    );
    console.log("✅ Updated state in RecordsPage:", updatedRecord);
  };

  return (
    <div className="container py-4">
      <RecordsTable 
        records={records}
        openPrintModal={openPrintModal}
        vehiclePrices={vehiclePrices}
        slipType={slipType}
        onUpdateRecord={handleUpdateRecord} 
      />

      {selectedRecord && (
        <PrintModal
          show={showPrintModal}
          record={selectedRecord}
          slipType={slipType}
          onClose={closePrintModal}
        />
      )}
    </div>
  );
}
