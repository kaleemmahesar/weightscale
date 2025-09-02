import React, { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import axios from "axios";

export default function SecondWeightForm({ records, liveWeight, vehiclePrices, onSuccess }) {
  // Options for vehicle select
  const options = records
    .filter((r) => r.second_weight === null)
    .map((r) => ({
      value: r.id,
      label: `${r.vehicle_number} | Serial No: ${r.id}`,
    }));

  const formik = useFormik({
    initialValues: {
      selectedVehicle: null,
      secondWeight: liveWeight || "",
    },
    validationSchema: Yup.object({
      selectedVehicle: Yup.object().required("Select a vehicle"),
      secondWeight: Yup.number()
        .typeError("Weight must be a number")
        .required("Second weight is required")
        .positive("Weight must be positive"),
    }),
    onSubmit: async (values, { resetForm }) => {
      const recordId = values.selectedVehicle.value;
      const record = records.find((r) => r.id === recordId);
      if (!record) return alert("Record not found");

      const firstWeight = parseFloat(record.first_weight);
      const secondWeight = parseFloat(values.secondWeight);
      const netWeight = firstWeight - secondWeight;

      const totalPrice =
        parseFloat(record.total_price) || vehiclePrices[record.vehicle_type] || 0;

      try {
        const response = await axios.post(
          "http://localhost/weightscale/index.php?action=saveSecondWeight",
          {
            id: recordId,
            secondWeight,
            netWeight,
            totalPrice,
          },
          { headers: { "Content-Type": "application/json" } }
        );

        if (response.data.status === "success") {
          console.log("✅ Second weight saved:", response.data);
          const formatTo12Hour = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    timeZone: "Asia/Karachi", // ✅ Force PKT
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
};

          // ✅ Updated record object to send to parent
          const updatedRecord = {
            ...record,
            second_weight: secondWeight,
            net_weight: netWeight,
            total_price: totalPrice,
            second_weight_time: formatTo12Hour(new Date()),
          };

          if (onSuccess) {
            onSuccess(updatedRecord, "second"); // notify parent
          }

          resetForm();
        } else {
          alert(response.data.message || "Failed to save second weight");
        }
      } catch (error) {
        console.error("Error saving second weight:", error);
        alert("Error saving second weight. Check console for details.");
      }
    },
  });

  // Update formik value when liveWeight changes
  useEffect(() => {
    formik.setFieldValue("secondWeight", liveWeight || "");
  }, [liveWeight]);

  return (
    <div className="card mb-4">
      <div className="card-header bg-warning">Second Weight</div>
      <div className="card-body">
        <form onSubmit={formik.handleSubmit}>
          <div className="row mb-3">
            {/* Vehicle Select */}
            <div className="col-md-6">
              <label>Select Vehicle</label>
              <Select
                options={options}
                value={formik.values.selectedVehicle}
                onChange={(option) =>
                  formik.setFieldValue("selectedVehicle", option)
                }
                isSearchable
              />
              {formik.touched.selectedVehicle && formik.errors.selectedVehicle && (
                <div className="text-danger mt-1">{formik.errors.selectedVehicle}</div>
              )}
            </div>

            {/* Second Weight */}
            <div className="col-md-6">
              <label>Second Weight (KG)</label>
              <input
                type="number"
                name="secondWeight"
                className={`form-control ${
                  formik.touched.secondWeight && formik.errors.secondWeight
                    ? "is-invalid"
                    : ""
                }`}
                value={formik.values.secondWeight}
                onChange={formik.handleChange}
              />
              {formik.touched.secondWeight && formik.errors.secondWeight && (
                <div className="text-danger mt-1">{formik.errors.secondWeight}</div>
              )}
            </div>
          </div>

          <button type="submit" className="btn btn-primary">
            Save Second Weight
          </button>
        </form>
      </div>
    </div>
  );
}
