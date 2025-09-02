import React from "react";

const PrintModal = ({ show, record, slipType, onClose }) => {
  if (!show || !record) return null; // Completely unmount when hidden

  const handlePrint = () => {
    const content = document.getElementById("print-area").innerHTML;
    const win = window.open("", "", "width=400,height=600");
    win.document.write(content);
    win.document.close();
    win.print();
  };

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>

      {/* Modal */}
      <div
        className="modal d-block fade show"
        tabIndex="-1"
        style={{ zIndex: 1050 }}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Weighbridge Slip</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body" id="print-area">
              <div className="text-center mb-3">
                <img src="/logo512.png" alt="Logo" style={{ height: "50px" }} />
                <h4>Awami Computerized Kanta</h4>
                <p>Miro Khan Road, Larkana | Phone: 03420721023</p>
                <hr />
              </div>
              <h4 className="text-center">
                {slipType === "first"
                  ? "First Weight Slip"
                  : slipType === "second"
                  ? "Second Weight Slip"
                  : "Final Weight Slip"}
              </h4>
              <hr />

              {/* ✅ Common Info */}
              <p><strong>Vehicle Number:</strong> {record.vehicle}</p>
              <p><strong>Product:</strong> {record.product}</p>
              <p><strong>Driver:</strong> {record.driver}</p>

              {/* ✅ First Slip Details */}
              {slipType !== "final" && (
                <>
                <p><strong>First Weight:</strong> {Number(record.first_weight).toFixed(2)} Kg</p>
              
                <p><strong>First Weight Time:</strong> {record.first_weight_time}</p>
              </>
              )}
              {/* ✅ Second Slip Details */}
              {slipType !== "first" && record.second_weight && (
                <>
                  <p><strong>{slipType === "final" ? "Empty Weight:" : "Second Weight:"}</strong> {Number(record.second_weight).toFixed(2)} Kg</p>
                  {slipType !== "final" && (
                    <p><strong>Second Weight Time:</strong> {record.second_weight_time}</p>
                  )}
                </>
              )}

              {/* ✅ Final Slip Extra Details */}
              {slipType === "final" && record.second_weight && (
                <>
                  <p><strong>Current Weight:</strong> {Number(record.first_weight).toFixed(2)} kg</p>
                  <p><strong>Current Weight Time:</strong> {record.first_weight_time}</p>
                </>
              )}

              {/* ✅ Net Weight & Munds */}
              {(slipType !== "first" && record.net_weight) && (
                <p>
                  <strong>Net Weight:</strong> {Number(record.net_weight).toFixed(2)} kg &nbsp;
                  <strong>Munds:</strong> {Math.floor(record.net_weight / 40)} Munds{" "}
                  {Math.round(record.net_weight - Math.floor(record.net_weight / 40) * 40)} Kg
                </p>
              )}

              {/* ✅ Price Calculation */}
              <p>
                <strong>Price:</strong> {record.price} PKR
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={handlePrint}>Print</button>
              <button className="btn btn-secondary" onClick={onClose}>Close</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrintModal;
