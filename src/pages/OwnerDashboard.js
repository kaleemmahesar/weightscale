import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";
import axios from "axios";

export default function OwnerDashboard() {
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [records, setRecords] = useState([]);

    // Dummy static records for testing
    useEffect(() => {
        const fetchRecords = async () => {
            try {
                const response = await axios.get("http://localhost/weightscale/index.php?action=getRecords");
                console.log(response.data.data); // Debugging

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

    // Filter records by date range
    const filteredRecords = records.filter(r => {
        if (!fromDate || !toDate) return true;
        const recordDate = new Date(r.firstTime);
        return recordDate >= new Date(fromDate) && recordDate <= new Date(toDate);
    });

    // Calculate total revenue
    const totalRevenue = filteredRecords
    .filter(r => r.second_weight)
    .reduce((sum, r) => sum + Number(r.total_price || 0), 0);


    // Generate PDF report
    const generatePDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text("Awami Computerized Kanta", 14, 20);
        doc.setFontSize(12);
        doc.text(`From: ${fromDate || "Start"}  To: ${toDate || "End"}`, 14, 28);
        doc.text(`Total Revenue: ${totalRevenue} PKR`, 14, 36);

        const tableColumn = ["Vehicle", "Type", "Product", "First Weight", "Second Weight", "Net Weight", "Price"];
        const tableRows = [];

        filteredRecords.forEach(r => {
            const row = [
                r.vehicle,
                r.type,
                r.product,
                r.firstWeight,
                r.secondWeight || "-",
                r.netWeight || "-",
                r.totalPrice
            ];
            tableRows.push(row);
        });

        // Generate table
        autoTable(doc, {
            startY: 30,
            head: [["Vehicle", "Type", "Product", "First Weight", "Second Weight", "Net Weight", "Price"]],
            body: filteredRecords.map(r => [
                r.vehicle,
                r.type,
                r.product,
                r.firstWeight,
                r.secondWeight || "-",
                r.netWeight || "-",
                r.totalPrice
            ])
        });

        doc.save("weighbridge_report.pdf");
    };

    return (
        <div className="container py-4">
            <h2 className="mb-4 text-center">Owner Dashboard</h2>

            {/* Date Filter */}
            <div className="row mb-3">
                <div className="col-md-3">
                    <input type="date" className="form-control" value={fromDate} onChange={e => setFromDate(e.target.value)} />
                </div>
                <div className="col-md-3">
                    <input type="date" className="form-control" value={toDate} onChange={e => setToDate(e.target.value)} />
                </div>
                <div className="col-md-3">
                    <button className="btn btn-primary" onClick={generatePDF}>Generate PDF Report</button>
                </div>
            </div>

            {/* Vehicles Table */}
            <div className="card">
                <div className="card-header bg-dark text-white">Vehicles List</div>
                <div className="card-body table-responsive">
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>Vehicle</th>
                                <th>Type</th>
                                <th>Product</th>
                                <th>First Weight</th>
                                <th>Second Weight</th>
                                <th>Net Weight</th>
                                <th>Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRecords.map((r, idx) => (
                                <tr key={idx}>
                                    <td>{r.vehicle_number}</td>
                                    <td>{r.vehicle_type}</td>
                                    <td>{r.product}</td>
                                    <td>{r.first_weight}</td>
                                    <td>{r.second_weight || "-"}</td>
                                    <td>{r.net_weight || "-"}</td>
                                    <td>{r.total_price}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-3">
                <strong>Total Revenue: </strong> {totalRevenue.toLocaleString()} PKR
            </div>
        </div>
    );
}
