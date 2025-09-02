import React from "react";
import LiveWeightDisplay from "./LiveWeightDisplay";

export default function StatsCards({ totalVehicles, pendingSecond, onWeightChange, todaysTotal }) {
  return (
    <div className="row mb-4 stats-cards">
      <div className="col-md-3">
        <div className="card text-center px-2 py-4 bg-info-subtle text-black shadow-sm border-0">
        <LiveWeightDisplay simulation={false} onWeightChange={onWeightChange} />
        </div>
      </div>
      <div className="col-md-3">
        <div className="card text-center px-2 py-4 bg-danger-subtle text-black shadow-sm border-0">
          <h5>Total Vehicles</h5>
          <h2>{totalVehicles}</h2>
        </div>
      </div>
      <div className="col-md-3">
        <div className="card text-center px-2 py-4 bg-info-subtle text-dark shadow-sm border-0">
          <h5>Pending Second Weight</h5>
          <h2>{pendingSecond}</h2>
        </div>
      </div>
      <div className="col-md-3">
        <div className="card text-center px-2 py-4 bg-success-subtle text-black shadow-sm border-0">
          <h5>Today's Total</h5>
          <h2>{todaysTotal}</h2>
        </div>
      </div>
    </div>
  );
}
