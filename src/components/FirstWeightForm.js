// import React, { useEffect } from "react";
// import { useFormik } from "formik";
// import * as Yup from "yup";

// const FirstWeightForm = ({ onSave, liveWeight, vehiclePrices }) => {
  
//   const [totalPrice, setTotalPrice] = React.useState(0);
//   // ✅ When vehicleType changes, update price dynamically
//   const handleVehicleTypeChange = (e) => {
//     formik.handleChange(e);
//     const selectedType = e.target.value;
//     setTotalPrice(vehiclePrices[selectedType]);
//     console.log(totalPrice);
//   };

//   const validationSchema = Yup.object({
//     vehicleNumber: Yup.string().required("Vehicle number is required"),
//     vehicleType: Yup.string().required("Vehicle type is required"),
//     product: Yup.string().notOneOf(["Select"], "Please select a product"),
//     currentWeight: Yup.number()
//       .required("Weight is required")
//       .min(1, "Weight must be greater than 0"),
//     withDriver: Yup.boolean()
//   });

//   const formik = useFormik({
//     initialValues: {
//       vehicleNumber: "",
//       vehicleType: "Truck",
//       product: "Select",
//       currentWeight: 0,
//       withDriver: false,
//     },
//     validationSchema,
//     onSubmit: async (values, { resetForm }) => {
//       const updatedValues = {
//         ...values,
//         price: totalPrice
//       };
//       console.log("Submitting First Weight Form with values:", updatedValues);  
//       await onSave(updatedValues); // ✅ Calls API from parent

//       resetForm();
//     }
//   });

//   // ✅ Update weight when liveWeight changes
//   useEffect(() => {
//     if (liveWeight && liveWeight > 0) {
//       formik.setFieldValue("currentWeight", liveWeight);
//     }
//   }, [liveWeight]);

//   return (
//     <form onSubmit={formik.handleSubmit} className="p-3 border rounded bg-light mb-3">
//       <h5 className="mb-3">First Weight</h5>
//     <div className="row">
        
//       {/* Vehicle Number */}
//       <div className="col-md-3 mb-3">
//         <label>Vehicle Number</label>
//         <input
//           type="text"
//           name="vehicleNumber"
//           className={`form-control ${
//             formik.touched.vehicleNumber && formik.errors.vehicleNumber ? "is-invalid" : ""
//           }`}
//           value={formik.values.vehicleNumber}
//           onChange={formik.handleChange}
//           onBlur={formik.handleBlur}
//         />
//         {formik.touched.vehicleNumber && formik.errors.vehicleNumber && (
//           <div className="invalid-feedback">{formik.errors.vehicleNumber}</div>
//         )}
//       </div>

//       {/* Vehicle Type */}
//       <div className="col-md-3 mb-3">
//         <label>Vehicle Type</label>
//         <select
//             name="vehicleType"
//             className={`form-select ${formik.touched.vehicleType && formik.errors.vehicleType ? "is-invalid" : ""}`}
//             value={formik.values.vehicleType}
//             onChange={handleVehicleTypeChange} // ✅ Custom handler
//             onBlur={formik.handleBlur}
//           >
//             {Object.keys(vehiclePrices).map((type) => (
//               <option key={type} value={type}>
//                 {type}
//               </option>
//             ))}
//           </select>
//         {formik.touched.vehicleType && formik.errors.vehicleType && (
//           <div className="invalid-feedback">{formik.errors.vehicleType}</div>
//         )}
//       </div>

//       {/* Product */}
//       <div className="col-md-3 mb-3">
//         <label>Product</label>
//         <select
//           name="product"
//           className={`form-select ${
//             formik.touched.product && formik.errors.product ? "is-invalid" : ""
//           }`}
//           value={formik.values.product}
//           onChange={formik.handleChange}
//           onBlur={formik.handleBlur}
//         >
//           <option value="Select">Select</option>
//           <option value="Cement">Cement</option>
//           <option value="Steel">Steel</option>
//           <option value="Sand">Sand</option>
//         </select>
//         {formik.touched.product && formik.errors.product && (
//           <div className="invalid-feedback">{formik.errors.product}</div>
//         )}
//       </div>

//       {/* Current Weight */}
//       <div className="col-md-3 mb-3">
//         <label>Weight (kg)</label>
//         <input
//           type="number"
//           name="currentWeight"
//           className={`form-control ${
//             formik.touched.currentWeight && formik.errors.currentWeight ? "is-invalid" : ""
//           }`}
//           value={formik.values.currentWeight}
//           onChange={formik.handleChange}
//           onBlur={formik.handleBlur}
//           readOnly // ✅ Prevent manual change since it's live
//         />
//         {formik.touched.currentWeight && formik.errors.currentWeight && (
//           <div className="invalid-feedback">{formik.errors.currentWeight}</div>
//         )}
//       </div>
//         </div>
//     <div className="row mx-3">
//       {/* With Driver */}
//       <div className="col-md-12 form-check mb-3">
//         <input
//           type="checkbox"
//           name="withDriver"
//           className="form-check-input"
//           checked={formik.values.withDriver}
//           onChange={formik.handleChange}
//         />
//         <label className="form-check-label">With Driver</label>
//       </div>
//     </div>
//     <div className="row ">
//         <div className="col-md-2">
//       <button type="submit" className="btn btn-primary w-100">
//         Save First Weight
//       </button>
//       </div>
//       </div>
//     </form>
//   );
// };

// export default FirstWeightForm;


import React, { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";

const FirstWeightForm = ({ liveWeight, vehiclePrices, onSuccess }) => {
  const [totalPrice, setTotalPrice] = React.useState(0);

  // ✅ When vehicleType changes, update price dynamically
  const handleVehicleTypeChange = (e) => {
    formik.handleChange(e);
    const selectedType = e.target.value;
    setTotalPrice(vehiclePrices[selectedType]);
  };

  const validationSchema = Yup.object({
    vehicleNumber: Yup.string().required("Vehicle number is required"),
    vehicleType: Yup.string().required("Vehicle type is required"),
    product: Yup.string().notOneOf(["Select"], "Please select a product"),
    currentWeight: Yup.number()
      .required("Weight is required")
      .min(1, "Weight must be greater than 0"),
    withDriver: Yup.boolean()
  });

  const formik = useFormik({
    initialValues: {
      vehicleNumber: "",
      vehicleType: "Truck",
      product: "Select",
      currentWeight: 0,
      withDriver: false
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      const updatedValues = {
        ...values,
        price: totalPrice
      };

      // ✅ Prepare API payload
      const newRecord = {
        vehicle: updatedValues.vehicleNumber,
        type: updatedValues.vehicleType,
        product: updatedValues.product,
        weight: parseFloat(updatedValues.currentWeight),
        price: updatedValues.price,
        driver: updatedValues.withDriver ? "Yes" : "No"
      };

      console.log("New Record to save:", newRecord);

      try {
        const response = await axios.post(
          "http://localhost/weightscale/index.php?action=saveFirstWeight",
          newRecord,
          { headers: { "Content-Type": "application/json" } }
        );

        if (response.data.status === "success") {
          console.log("✅ First weight saved:", response.data);

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


          const savedRecord = {
            id: response.data.id,
            vehicle_number: response.data.vehicle,
            vehicle_type: response.data.type,
            product: response.data.product,
            first_weight: response.data.weight,
            price_per_kg: response.data.price,
            first_weight_time: formatTo12Hour(response.data.firstTime),
            driver_name: response.data.driver,
            second_weight: null,
            net_weight: null,
            total_price: response.data.price,
            second_weight_time: null
          };

          // ✅ If parent needs to update state or show modal
          if (onSuccess) {
            onSuccess(savedRecord, "first");
          }

          resetForm();
        } else {
          alert(response.data.message || "Failed to save record");
        }
      } catch (error) {
        console.error(error);
        alert("Error saving record");
      }
    }
  });

  // ✅ Update weight when liveWeight changes
  useEffect(() => {
    if (liveWeight && liveWeight > 0) {
      formik.setFieldValue("currentWeight", liveWeight);
    }
  }, [liveWeight]);

  return (
    <form
      onSubmit={formik.handleSubmit}
      className="p-3 border rounded bg-light mb-3"
    >
      <h5 className="mb-3">First Weight</h5>
      <div className="row">
        {/* Vehicle Number */}
        <div className="col-md-3 mb-3">
          <label>Vehicle Number</label>
          <input
            type="text"
            name="vehicleNumber"
            className={`form-control ${
              formik.touched.vehicleNumber && formik.errors.vehicleNumber
                ? "is-invalid"
                : ""
            }`}
            value={formik.values.vehicleNumber}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.vehicleNumber && formik.errors.vehicleNumber && (
            <div className="invalid-feedback">
              {formik.errors.vehicleNumber}
            </div>
          )}
        </div>

        {/* Vehicle Type */}
        <div className="col-md-3 mb-3">
          <label>Vehicle Type</label>
          <select
    name="vehicleType"
    className={`form-select ${
      formik.touched.vehicleType && formik.errors.vehicleType
        ? "is-invalid"
        : ""
    }`}
    value={formik.values.vehicleType}
    onChange={handleVehicleTypeChange} // ✅ Custom handler
    onBlur={formik.handleBlur}
  >
    {Object.keys(vehiclePrices).map((type) => (
      <option key={type} value={type}>
        {type} —  {vehiclePrices[type].toLocaleString()}
      </option>
    ))}
  </select>
          {formik.touched.vehicleType && formik.errors.vehicleType && (
            <div className="invalid-feedback">{formik.errors.vehicleType}</div>
          )}
        </div>

        {/* Product */}
        <div className="col-md-3 mb-3">
          <label>Product</label>
          <select
            name="product"
            className={`form-select ${
              formik.touched.product && formik.errors.product
                ? "is-invalid"
                : ""
            }`}
            value={formik.values.product}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          >
            <option value="Select">Select</option>
            <option value="Cement">Cement</option>
            <option value="Steel">Steel</option>
            <option value="Sand">Sand</option>
          </select>
          {formik.touched.product && formik.errors.product && (
            <div className="invalid-feedback">{formik.errors.product}</div>
          )}
        </div>

        {/* Current Weight */}
        <div className="col-md-3 mb-3">
          <label>Weight (kg)</label>
          <input
            type="number"
            name="currentWeight"
            className={`form-control ${
              formik.touched.currentWeight && formik.errors.currentWeight
                ? "is-invalid"
                : ""
            }`}
            value={formik.values.currentWeight}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            readOnly // ✅ Prevent manual change since it's live
          />
          {formik.touched.currentWeight && formik.errors.currentWeight && (
            <div className="invalid-feedback">
              {formik.errors.currentWeight}
            </div>
          )}
        </div>
      </div>

      

      <div className="row mx-3">
        {/* With Driver */}
        <div className="col-md-12 form-check mb-3">
          <input
            type="checkbox"
            name="withDriver"
            className="form-check-input"
            checked={formik.values.withDriver}
            onChange={formik.handleChange}
          />
          <label className="form-check-label">With Driver</label>
        </div>
      </div>
      <div className="row ">
        <div className="col-md-2">
          <button type="submit" className="btn btn-primary w-100">
            Save First Weight
          </button>
        </div>
      </div>
    </form>
  );
};

export default FirstWeightForm;
