import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

export default function EditRecordModal({ show, onClose, record, onUpdate, vehiclePrices, slipType }) {
  // Always call useFormik
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      vehicle_number: record?.vehicle_number || "",
      vehicle_type: record?.vehicle_type || "Truck",
      first_weight: record?.first_weight || "",
      second_weight: record?.second_weight || "",
    },
    validationSchema: Yup.object({
  vehicle_number: Yup.string().required("Required"),
  vehicle_type: Yup.string().required("Required"),
  
  first_weight: Yup.number()
    .typeError("Must be a number")
    .test("first-weight-required", "Required", function(value) {
      return slipType === "first" || slipType === "final" ? value !== undefined && value !== "" : true;
    }),

  second_weight: Yup.number()
    .typeError("Must be a number")
    .test("second-weight-required", "Required", function(value) {
      return slipType === "second" || slipType === "final" ? value !== undefined && value !== "" : true;
    }),
}),

    onSubmit: async (values) => {
    // ✅ Calculate derived fields
  const net_weight =
    parseFloat(values.first_weight || 0) - parseFloat(values.second_weight || 0);
  const total_price = vehiclePrices[values.vehicle_type] || 0;

  // ✅ Prepare updated record
  const updatedRecord = {
    ...record,
    ...values,
    net_weight,
    total_price,
    slipTypeUpdated: slipType,
  };

  try {
    const response = await fetch(
      "http://localhost/weightscale/index.php?action=updateRecord",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: updatedRecord.id,
          vehicleNumber: updatedRecord.vehicle_number,
          vehicleType: updatedRecord.vehicle_type,
          product: updatedRecord.product,
          first_weight: updatedRecord.first_weight,
          second_weight: updatedRecord.second_weight,
        }),
      }
    );

    const result = await response.json();

    if (result.status === "success") {
      alert("✅ Record updated successfully!");

      // ✅ Call parent update handler
      if (onUpdate) onUpdate(updatedRecord, slipType);

      // ✅ Close modal
      onClose();
    } else {
      alert("❌ " + result.message);
    }
  } catch (err) {
    console.error("Error updating record:", err);
    alert("Error updating record. Check console.");
  }

    }
  });

  if (!show) return null;

  const netWeight =
    formik.values.first_weight && formik.values.second_weight
      ? (parseFloat(formik.values.first_weight) - parseFloat(formik.values.second_weight)).toFixed(2)
      : 0;

  const price = vehiclePrices[formik.values.vehicle_type] || 0;

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
      <div className="modal d-block fade show" tabIndex="-1" style={{ zIndex: 1050 }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header bg-info text-white">
              <h5 className="modal-title">Edit Record ({slipType?.toUpperCase()})</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <form onSubmit={formik.handleSubmit}>
                {/* Vehicle Number */}
                <div className="mb-3">
                  <label>Vehicle Number</label>
                  <input
                    type="text"
                    name="vehicle_number"
                    className={`form-control ${
                      formik.touched.vehicle_number && formik.errors.vehicle_number ? "is-invalid" : ""
                    }`}
                    value={formik.values.vehicle_number}
                    onChange={formik.handleChange}
                    disabled
                  />
                  {formik.touched.vehicle_number && formik.errors.vehicle_number && (
                    <div className="invalid-feedback">{formik.errors.vehicle_number}</div>
                  )}
                </div>

                {/* Vehicle Type */}
                <div className="mb-3">
                  <label>Vehicle Type</label>
                  <select
                    name="vehicle_type"
                    className={`form-select ${
                      formik.touched.vehicle_type && formik.errors.vehicle_type ? "is-invalid" : ""
                    }`}
                    value={formik.values.vehicle_type}
                    onChange={formik.handleChange}
                  >
                    {Object.keys(vehiclePrices).map((type) => (
                      <option key={type} value={type}>
                        {type} - {vehiclePrices[type]}
                      </option>
                    ))}
                  </select>
                  {formik.touched.vehicle_type && formik.errors.vehicle_type && (
                    <div className="invalid-feedback">{formik.errors.vehicle_type}</div>
                  )}
                </div>

                {/* Product */}
                

                {/* Conditional weights */}
                {(slipType === "first" || slipType === "final") && (
                  <div className="mb-3">
                    <label>{slipType === "final" ? "Current Weight:" : "First Weight:"}</label>
                    <input
                      type="number"
                      name="first_weight"
                      className={`form-control ${formik.touched.first_weight && formik.errors.first_weight ? "is-invalid" : ""}`}
                      value={formik.values.first_weight}
                      onChange={formik.handleChange}
                    />
                    {formik.touched.first_weight && formik.errors.first_weight && (
                      <div className="invalid-feedback">{formik.errors.first_weight}</div>
                    )}
                  </div>
                )}

                  <div className="mb-3">
                    <label>{slipType === "final" ? "Empty Weight:" : "Second Weight:"}</label>
                    <input
                      type="number"
                      name="second_weight"
                      className={`form-control ${formik.touched.second_weight && formik.errors.second_weight ? "is-invalid" : ""}`}
                      value={formik.values.second_weight}
                      onChange={formik.handleChange}
                    />
                    {formik.touched.second_weight && formik.errors.second_weight && (
                      <div className="invalid-feedback">{formik.errors.second_weight}</div>
                    )}
                  </div>
                
                {/* Driver Name */}
                

                {/* Net Weight and Price */}
                <div className="d-flex justify-content-between mb-3">
                  <p>
                    <strong>Net Weight:</strong> {netWeight}
                  </p>
                  <p>
                    <strong>Price:</strong> {price}
                  </p>
                </div>

                {/* Buttons */}
                <div className="d-flex justify-content-end">
                  <button type="button" className="btn btn-secondary me-2" onClick={onClose}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
