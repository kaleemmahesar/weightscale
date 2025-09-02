import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";

export default function FinalWeightForm({ vehiclePrices, liveWeight, onSuccess }) {
  // Internal state
  const [finalVehicle, setFinalVehicle] = useState("");
  const [finalVehicleType, setFinalVehicleType] = useState("Truck");
  const [finalProduct, setFinalProduct] = useState("Select");
  const [emptyWeight, setEmptyWeight] = useState("");
  const [finalWeight, setFinalWeight] = useState("");
  const [finalWithDriver, setFinalWithDriver] = useState(true);
  const getCurrentDateTime = () => {
  const now = new Date();
  const options = {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  };

  const formatted = new Intl.DateTimeFormat("en-CA", options).format(now);
  return formatted.replace(",", "").replace(/\//g, "-");
};

  const formik = useFormik({
    initialValues: {
      finalVehicle,
      finalVehicleType,
      finalProduct,
      emptyWeight,
      finalWeight,
      finalWithDriver
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      finalVehicle: Yup.string().required("Required"),
      finalVehicleType: Yup.string().required("Required"),
      finalProduct: Yup.string().required("Required"),
      emptyWeight: Yup.number().typeError("Must be a number").required("Required"),
      finalWeight: Yup.number().typeError("Must be a number").required("Required")
    }),
    onSubmit: async (values, { resetForm }) => {
      const netWeight = parseFloat(values.finalWeight) - parseFloat(values.emptyWeight);
      const totalPrice = vehiclePrices[values.finalVehicleType] || 0;
      
      const recordData = {
    vehicle_number: values.finalVehicle,
    vehicle_type: values.finalVehicleType,
    product: values.finalProduct,
    first_weight: values.finalWeight,   // current weight
    second_weight: values.emptyWeight,  // empty weight
    net_weight: netWeight,
    total_price: totalPrice,
    driver_name: values.finalWithDriver ? "Yes" : "No",
    first_weight_time: getCurrentDateTime(),
    second_weight_time: getCurrentDateTime(),
    final_weight: "Yes" // ✅ Important flag
  };

      try {
        const response = await axios.post(
          "http://localhost/weightscale/index.php?action=saveFinalWeight",
          recordData,
          { headers: { "Content-Type": "application/json" } }
        );

        if (response.data.status === "success") {
          console.log("✅ Final weight saved:", response.data);
          
          const recordedData = { id: response.data.id, ...recordData };
          if (onSuccess) onSuccess(recordedData, "final");
          resetForm();
          // reset internal state
          setFinalVehicle("");
          setFinalVehicleType("Truck");
          setFinalProduct("Select");
          setEmptyWeight("");
          setFinalWeight("");
          setFinalWithDriver(true);
        } else {
          alert(response.data.message || "Failed to save final weight");
        }
      } catch (error) {
        console.error("Error saving final weight:", error);
        alert("Error saving final weight. Check console.");
      }
    }
  });

  // Sync live weight automatically
  useEffect(() => {
    if (liveWeight) {
      formik.setFieldValue("finalWeight", liveWeight);
      setFinalWeight(liveWeight);
    }
  }, [liveWeight]);

  return (
    <div className="card mb-4">
      <div className="card-header bg-info text-white">Final Weight</div>
      <div className="card-body">
        <form onSubmit={formik.handleSubmit}>
          <div className="row mb-3">
            <div className="col-md-4">
              <label>Vehicle / Customer</label>
              <input
                type="text"
                name="finalVehicle"
                className={`form-control ${formik.touched.finalVehicle && formik.errors.finalVehicle ? "is-invalid" : ""}`}
                value={formik.values.finalVehicle}
                onChange={(e) => {
                  formik.handleChange(e);
                  setFinalVehicle(e.target.value);
                }}
              />
              {formik.touched.finalVehicle && formik.errors.finalVehicle && (
                <div className="invalid-feedback">{formik.errors.finalVehicle}</div>
              )}
            </div>

            <div className="col-md-4">
              <label>Vehicle Type</label>
              <select
                name="finalVehicleType"
                className={`form-select ${formik.touched.finalVehicleType && formik.errors.finalVehicleType ? "is-invalid" : ""}`}
                value={formik.values.finalVehicleType}
                onChange={(e) => {
                  formik.handleChange(e);
                  setFinalVehicleType(e.target.value);
                }}
              >
                {Object.entries(vehiclePrices).map(([type, price], idx) => (
                  <option key={idx} value={type}>
                    {type} - {price}
                  </option>
                ))}
              </select>
              {formik.touched.finalVehicleType && formik.errors.finalVehicleType && (
                <div className="invalid-feedback">{formik.errors.finalVehicleType}</div>
              )}
            </div>

            <div className="col-md-4">
              <label>Product</label>
              <select
                name="finalProduct"
                className={`form-select ${formik.touched.finalProduct && formik.errors.finalProduct ? "is-invalid" : ""}`}
                value={formik.values.finalProduct}
                onChange={(e) => {
                  formik.handleChange(e);
                  setFinalProduct(e.target.value);
                }}
              >
                <option value="Woods">Woods</option>
                <option value="Sand">Sand</option>
                <option value="Chicken">Chicken</option>
              </select>
              {formik.touched.finalProduct && formik.errors.finalProduct && (
                <div className="invalid-feedback">{formik.errors.finalProduct}</div>
              )}
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-4">
              <label>Empty Weight (KG)</label>
              <input
                type="number"
                name="emptyWeight"
                className={`form-control ${formik.touched.emptyWeight && formik.errors.emptyWeight ? "is-invalid" : ""}`}
                value={formik.values.emptyWeight}
                onChange={(e) => {
                  formik.handleChange(e);
                  setEmptyWeight(e.target.value);
                }}
              />
              {formik.touched.emptyWeight && formik.errors.emptyWeight && (
                <div className="invalid-feedback">{formik.errors.emptyWeight}</div>
              )}
            </div>

            <div className="col-md-4">
              <label>Current Weight (KG)</label>
              <input
                type="number"
                name="finalWeight"
                className={`form-control ${formik.touched.finalWeight && formik.errors.finalWeight ? "is-invalid" : ""}`}
                value={formik.values.finalWeight}
                onChange={(e) => {
                  formik.handleChange(e);
                  setFinalWeight(e.target.value);
                }}
              />
              {formik.touched.finalWeight && formik.errors.finalWeight && (
                <div className="invalid-feedback">{formik.errors.finalWeight}</div>
              )}
            </div>

            <div className="col-md-4">
              <label>Net Weight (KG)</label>
              <input
                type="number"
                className="form-control"
                value={formik.values.finalWeight && formik.values.emptyWeight ? (formik.values.finalWeight - formik.values.emptyWeight).toFixed(2) : ""}
                readOnly
              />
            </div>
          </div>

          <div className="form-check mb-3">
            <input
              type="checkbox"
              name="finalWithDriver"
              className="form-check-input"
              checked={formik.values.finalWithDriver}
              onChange={(e) => {
                formik.setFieldValue("finalWithDriver", e.target.checked);
                setFinalWithDriver(e.target.checked);
              }}
            />
            <label className="form-check-label">Include Driver in Weight</label>
          </div>

          <button type="submit" className="btn btn-info">
            Save Final Weight
          </button>
        </form>
      </div>
    </div>
  );
}
