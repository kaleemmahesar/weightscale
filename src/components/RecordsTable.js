import { useState, useMemo } from "react";
import { IoPrint } from "react-icons/io5";
import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";
import EditRecordModal from "./EditModal"; // ✅ New Child Component
import { BiEdit } from "react-icons/bi";

export default function RecordsTable({ records, openPrintModal, vehiclePrices, slipType, onUpdateRecord  }) {
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 20;
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [editModalShow, setEditModalShow] = useState(false);
    const [editRecord, setEditRecord] = useState(null);
    const [editSlipType, setEditSlipType] = useState("first");
    const [selectedRecord, setSelectedRecord] = useState(null);

    const grandTotal = records.reduce((sum, r) => {
        const price = parseFloat(r.total_price) || 0;
        return sum + price;
    }, 0);

    const filteredRecords = useMemo(() => {
        if (!search) return records;
        return records.filter(
            (r) =>
                r.vehicle_number.toLowerCase().includes(search.toLowerCase()) ||
                r.vehicle_type.toLowerCase().includes(search.toLowerCase()) ||
                r.product?.toLowerCase().includes(search.toLowerCase()) ||
                r.id.toString().includes(search)
        );
    }, [search, records]);

    const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
    const paginatedRecords = filteredRecords.slice(
        (currentPage - 1) * recordsPerPage,
        currentPage * recordsPerPage
    );

    const filteredRecordsByDate = records.filter(r => {
        if (!fromDate || !toDate) return true;
        const recordDate = new Date(r.firstTime);
        return recordDate >= new Date(fromDate) && recordDate <= new Date(toDate);
    });

    const generatePDF = () => {
        const doc = new jsPDF();
        doc.setFont("Outfit");
        doc.setFontSize(16);
        doc.text("Awami Computerized Kanta", 14, 20);
        doc.setFontSize(12);
        doc.text(`From: ${fromDate || "Start"}  To: ${toDate || "End"}`, 14, 28);

        autoTable(doc, {
            startY: 30,
            head: [["Vehicle", "Type", "Product", "First Weight", "Second Weight", "Net Weight", "Price"]],
            body: filteredRecords.map(r => [
                r.vehicle_number,
                r.vehicle_type,
                r.product,
                r.first_weight,
                r.second_weight || "-",
                r.net_weight || "-",
                r.total_price || "-"
            ]),
            styles: {
                font: "Outfit",
                fontSize: 10
            }
        });

        const finalY = doc.lastAutoTable.finalY || 36;
        doc.text(`Total Revenue: ${grandTotal.toFixed(2)} PKR`, 14, finalY + 10);

        doc.save("weighbridge_report.pdf");
    };

    const handlePrev = () => setCurrentPage((p) => Math.max(p - 1, 1));
    const handleNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));
    const handlePageClick = (page) => setCurrentPage(page);

    const formatTo12Hour = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString("en-US", {
            timeZone: "Asia/Karachi",
            month: "2-digit",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        });
    };

    // ✅ State for Modal
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);

    const openEditModal = (record) => {
        // Determine slipType based on record
        const slipType = record.final_weight === "Yes" ? "final" : "first";
        setEditRecord(record);
        setEditSlipType(slipType);
        setEditModalShow(true);
        };

    const handleRecordUpdate = (updatedRecord) => {
        if (onUpdateRecord) {
            onUpdateRecord(updatedRecord); // ✅ Bubble up
        }
        console.log("✅ Record updated in RecordsTable:", updatedRecord);
    };

    return (
        <div className="card mt-4">
            <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                <span>Records</span>
                <input
                    type="text"
                    className="form-control w-25"
                    placeholder="Search vehicle/type/product..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                />
            </div>

            {/* Date Filter */}
            <div className="row px-3 mt-4 mb-2">
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

            <div className="card-body table-responsive">
                <table className="table table-bordered table-striped text-sm" style={{ marginBottom: '0' }}>
                    <thead>
                        <tr>
                            <th>Serial No:</th>
                            <th>Vehicle</th>
                            <th>Type</th>
                            <th>First Weight</th>
                            <th>Second Weight</th>
                            <th>Net Weight</th>
                            <th>Total Price</th>
                            <th>First Time</th>
                            <th>Second Time</th>
                            <th>Driver</th>
                            <th>Edit</th>
                            <th>Print Slip</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedRecords.length === 0 ? (
                            <tr>
                                <td colSpan="12" className="text-center text-muted">
                                    No records found
                                </td>
                            </tr>
                        ) : (
                            paginatedRecords.map((r, index) => (
                                <tr key={index}>
                                    <td>{r.id}</td>
                                    <td>{r.vehicle_number}</td>
                                    <td>{r.vehicle_type}</td>
                                    <td>{r.first_weight ? Number(r.first_weight).toFixed(2) : "-"}</td>
                                    <td>{r.second_weight ? Number(r.second_weight).toFixed(2) : "-"}</td>
                                    <td>{r.net_weight ? Number(r.net_weight).toFixed(2) : "-"}</td>
                                    <td>{r.total_price ? Number(r.total_price) : "-"}</td>
                                    <td>{r.first_weight_time ? formatTo12Hour(r.first_weight_time) : "-"}</td>
                                    <td>{r.second_weight_time ? formatTo12Hour(r.second_weight_time) : "-"}</td>
                                    <td>{r.driver_name ? "Yes" : "No"}</td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-info"
                                            onClick={() => openEditModal(r)}
                                        >
                                            <BiEdit />
                                        </button>
                                    </td>
                                    <td>
                                        {r.final_weight === "Yes" ? (
                                            <button
                                                className="btn btn-sm btn-success"
                                                onClick={() => openPrintModal(r, "final")}
                                                title="Print Final Weight"
                                            >
                                                <IoPrint />
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    className="btn btn-sm btn-secondary me-1"
                                                    onClick={() => openPrintModal(r, "first")}
                                                    title="Print First Weight"
                                                >
                                                    <IoPrint />
                                                </button>
                                                {r.second_weight && (
                                                    <button
                                                        className="btn btn-sm btn-primary"
                                                        onClick={() => openPrintModal(r, "second")}
                                                        title="Print Second Weight"
                                                    >
                                                        <IoPrint />
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                <div className="pt-3 d-flex justify-content-between align-items-center pb2 bg-info-subtle">
                    <h4 style={{ color: "black", padding: "1rem" }}>
                        <strong>Grand Total: </strong> {grandTotal.toLocaleString()} PKR
                    </h4>
                </div>

                {/* Pagination */}
                <div className="d-flex justify-content-between align-items-center mt-3">
                    <span>
                        Page {currentPage} of {totalPages}
                    </span>
                    <div>
                        <button className="btn btn-sm btn-outline-primary me-2" onClick={handlePrev} disabled={currentPage === 1}>
                            Prev
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                className={`btn btn-sm me-1 ${currentPage === i + 1 ? "btn-primary" : "btn-outline-primary"}`}
                                onClick={() => handlePageClick(i + 1)}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button className="btn btn-sm btn-outline-primary" onClick={handleNext} disabled={currentPage === totalPages}>
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* ✅ Edit Modal */}
            {editModalShow && editRecord && (
            <EditRecordModal
                show={editModalShow}
                onClose={() => setEditModalShow(false)}
                record={editRecord}
                slipType={editSlipType}      // ✅ Pass slipType
                onUpdate={handleRecordUpdate}  // Your function to update the record
                vehiclePrices={vehiclePrices} // Pass vehiclePrices for price calculation
            />
            )}
        </div>
    );
}
