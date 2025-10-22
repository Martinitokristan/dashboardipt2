import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiFileText, FiCloud, FiLock } from "react-icons/fi"; // Add FiLock for disabled icon
import "../../sass/report.scss"; // Reuse students styles for table/buttons

// Secure helper — ensure Sanctum cookie exists before requests
const ensureCsrf = async () => {
    try {
        await axios.get("/sanctum/csrf-cookie");
    } catch (_) {}
};

const REPORT_TYPES = {
    student: "student",
    faculty: "faculty",
};

const STUDENT_COLUMNS = [
    { key: "student_id", label: "Student ID" },
    { key: "name", label: "Name" },
    { key: "email_address", label: "Email" },
    { key: "course", label: "Course" },
    { key: "department", label: "Department" },
    { key: "status", label: "Status" },
];

const FACULTY_COLUMNS = [
    { key: "faculty_id", label: "Faculty ID" },
    { key: "name", label: "Name" },
    { key: "email_address", label: "Email" },
    { key: "phone_number", label: "Phone" },
    { key: "department", label: "Department" },
    { key: "position", label: "Position" },
];

function Report() {
    const [reportType, setReportType] = useState(REPORT_TYPES.student);
    const [courses, setCourses] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const [tableColumns, setTableColumns] = useState([]);
    const [tableRows, setTableRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [modalState, setModalState] = useState(""); // "", "loading", "success", "error"
    const [modalMessage, setModalMessage] = useState("");

    // Fetch filter options on mount
    useEffect(() => {
        async function fetchFilters() {
            try {
                const [coursesRes, departmentsRes] = await Promise.all([
                    axios.get("/api/courses"),
                    axios.get("/api/departments"),
                ]);
                setCourses(
                    Array.isArray(coursesRes.data) ? coursesRes.data : []
                );
                setDepartments(
                    Array.isArray(departmentsRes.data)
                        ? departmentsRes.data
                        : []
                );
            } catch {
                setModalState("error");
                setModalMessage("Failed to load filter options.");
            }
        }
        fetchFilters();
    }, []);

    // Reset filters and table when report type changes
    useEffect(() => {
        setTableColumns([]);
        setTableRows([]);
        setSelectedCourse("");
        setSelectedDepartment("");
    }, [reportType]);

    // Build table rows
    const buildStudentRows = (data) =>
        data.map((student) => ({
            student_id: student.student_id,
            name: [
                student.f_name,
                student.m_name,
                student.l_name,
                student.suffix,
            ]
                .filter(Boolean)
                .join(" "),
            email_address: student.email_address || "",
            course: student.course_name || "",
            department: student.department_name || "",
            status: student.status || "",
        }));

    const buildFacultyRows = (data) =>
        data.map((member) => ({
            faculty_id: member.faculty_id,
            name: [member.f_name, member.m_name, member.l_name, member.suffix]
                .filter(Boolean)
                .join(" "),
            email_address: member.email_address || "",
            phone_number: member.phone_number || "",
            department: member.department_name || "",
            position: member.position || "",
        }));

    // Generate Report
    const handleGenerateReport = async () => {
        setLoading(true);
        setTableRows([]);
        setModalState("");
        try {
            await ensureCsrf();
            if (reportType === REPORT_TYPES.student) {
                const { data } = await axios.post(
                    "/api/admin/reports/students",
                    {
                        course_id: selectedCourse || undefined,
                        export: "json",
                    }
                );
                setTableColumns(STUDENT_COLUMNS);
                setTableRows(
                    buildStudentRows(
                        Array.isArray(data.students) ? data.students : []
                    )
                );
            } else {
                const { data } = await axios.post(
                    "/api/admin/reports/faculty",
                    {
                        department_id: selectedDepartment || undefined,
                        export: "json",
                    }
                );
                setTableColumns(FACULTY_COLUMNS);
                setTableRows(
                    buildFacultyRows(
                        Array.isArray(data.faculty) ? data.faculty : []
                    )
                );
            }
        } catch {
            setModalState("error");
            setModalMessage("Failed to generate report.");
        } finally {
            setLoading(false);
        }
    };

    // Download PDF
    const handleDownloadPdf = async () => {
        if (!tableRows.length) return;
        setExporting(true);
        setModalState("loading");
        try {
            const [{ jsPDF }, autoTable] = await Promise.all([
                import("jspdf"),
                import("jspdf-autotable"),
            ]);
            const doc = new jsPDF();
            autoTable.default(doc, {
                head: [tableColumns.map((col) => col.label)],
                body: tableRows.map((row) =>
                    tableColumns.map((col) => row[col.key])
                ),
            });
            doc.save(`${reportType}_report.pdf`);
            setModalState("success");
            setModalMessage("PDF downloaded successfully!");
        } catch {
            setModalState("error");
            setModalMessage("Failed to generate PDF.");
        } finally {
            setExporting(false);
        }
    };

    // Export to Google Sheets
    const handleExportSheets = async () => {
        if (!tableRows.length) return;
        setExporting(true);
        setModalState("loading");
        try {
            await axios.post("/api/export-to-sheets", {
                type: reportType,
                course_id: selectedCourse,
                department_id: selectedDepartment,
            });
            setModalState("success");
            setModalMessage("Exported to Google Sheets successfully!");
        } catch {
            setModalState("error");
            setModalMessage("Failed to export to Google Sheets.");
        } finally {
            setExporting(false);
        }
    };

    // Export Student Data (Google Sheets)
    const handleExportStudentData = async () => {
        setExporting(true);
        setModalState("loading");
        try {
            await axios.post("/api/admin/reports/students", {
                course_id: selectedCourse || undefined,
                export: "google_sheets",
            });
            setModalState("success");
            setModalMessage(
                "Student data exported to Google Sheets successfully!"
            );
        } catch (err) {
            console.error("Export Student Data Error:", err); // <-- log error
            setModalState("error");
            setModalMessage("Failed to export student data to Google Sheets.");
        } finally {
            setExporting(false);
        }
    };

    // Export Faculty Data (Google Sheets)
    const handleExportFacultyData = async () => {
        setExporting(true);
        setModalState("loading");
        try {
            await axios.post("/api/admin/reports/faculty", {
                department_id: selectedDepartment || undefined,
                export: "google_sheets",
            });
            setModalState("success");
            setModalMessage(
                "Faculty data exported to Google Sheets successfully!"
            );
        } catch (err) {
            console.error("Export Faculty Data Error:", err); // <-- log error
            setModalState("error");
            setModalMessage("Failed to export faculty data to Google Sheets.");
        } finally {
            setExporting(false);
        }
    };

    // Import Students (Google Sheets)
    const handleImportStudents = async () => {
        setLoading(true);
        try {
            await axios.post("/api/admin/reports/import-students");
            setModalState("success");
            setModalMessage("Imported students from Google Sheets!");
            // Optionally, refresh the report/table
            handleGenerateReport();
        } catch {
            setModalState("error");
            setModalMessage("Failed to import students.");
        } finally {
            setLoading(false);
        }
    };

    // Import Faculty (Google Sheets)
    const handleImportFaculty = async () => {
        setLoading(true);
        try {
            await ensureCsrf();
            const { data } = await axios.post(
                "/api/admin/reports/import-faculty"
            );
            if (data.success) {
                setReportType(REPORT_TYPES.faculty);
                setSelectedDepartment("");
                setModalState("success");
                setModalMessage("Imported faculty from Google Sheets!");
                handleGenerateReport();
            } else {
                setModalState("error");
                // Show error details if present
                setModalMessage(
                    data.message +
                        (data.errors && data.errors.length
                            ? "\n" + data.errors.join("\n")
                            : "")
                );
            }
        } catch {
            setModalState("error");
            setModalMessage("Failed to import faculty from Google Sheets.");
        } finally {
            setLoading(false);
        }
    };

    // Modal content for success/error/loading
    const renderModalContent = () => {
        if (modalState === "loading") {
            return (
                <div className="loading-overlay">
                    <div className="spinner-border large-spinner" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                    <p
                        style={{
                            marginTop: 15,
                            color: "#4f46e5",
                            fontWeight: 500,
                        }}
                    >
                        Processing...
                    </p>
                </div>
            );
        }
        if (modalState === "success") {
            return (
                <div className="success-content">
                    <div className="success-icon-wrapper">
                        <svg
                            className="success-icon-svg"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 52 52"
                        >
                            <path
                                className="success-check-path"
                                fill="none"
                                d="M14.1 27.2l7.1 7.2 16.7-16.8"
                            />
                        </svg>
                    </div>
                    <h4 className="success-title">Success!</h4>
                    <p className="success-subtitle">{modalMessage}</p>
                    <button
                        className="btn btn-primary btn-close-message"
                        onClick={() => setModalState("")}
                    >
                        Done
                    </button>
                </div>
            );
        }
        if (modalState === "error") {
            return (
                <div className="success-content">
                    <div className="error-icon-wrapper">
                        <svg
                            className="error-icon-svg"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 52 52"
                        >
                            <path
                                className="error-x-path"
                                fill="none"
                                d="M16 16 36 36 M36 16 16 36"
                            />
                        </svg>
                    </div>
                    <h4 className="error-title">Error!</h4>
                    <p className="error-subtitle">{modalMessage}</p>
                    <button
                        className="btn btn-danger btn-close-message"
                        onClick={() => setModalState("")}
                    >
                        Close
                    </button>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="page">
            <header className="page-header">
                <h1 className="page-title">Report Generator</h1>
                <p className="page-subtitle">
                    Generate student or faculty reports
                </p>
            </header>

            <div className="controls">
                <div className="filters">
                    <select
                        className="filter"
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                    >
                        <option value={REPORT_TYPES.student}>
                            Student Report
                        </option>
                        <option value={REPORT_TYPES.faculty}>
                            Faculty Report
                        </option>
                    </select>

                    {reportType === REPORT_TYPES.student && (
                        <select
                            className="filter"
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                        >
                            <option value="">All Courses</option>
                            {courses.map((course) => (
                                <option
                                    key={course.course_id}
                                    value={course.course_id}
                                >
                                    {course.course_name}
                                </option>
                            ))}
                        </select>
                    )}
                    {reportType === REPORT_TYPES.faculty && (
                        <select
                            className="filter"
                            value={selectedDepartment}
                            onChange={(e) =>
                                setSelectedDepartment(e.target.value)
                            }
                        >
                            <option value="">All Departments</option>
                            {departments.map((dept) => (
                                <option
                                    key={dept.department_id}
                                    value={dept.department_id}
                                >
                                    {dept.department_name}
                                </option>
                            ))}
                        </select>
                    )}

                    <button
                        className="btn btn-primary"
                        onClick={handleGenerateReport}
                        disabled={loading}
                        style={{ marginLeft: 10 }}
                    >
                        {loading ? (
                            <span>
                                <span className="spinner"></span> Generating...
                            </span>
                        ) : (
                            "Generate Report"
                        )}
                    </button>

                    <button
                        className="btn btn-primary"
                        style={{ marginLeft: 10 }}
                        onClick={handleExportStudentData}
                        disabled={reportType !== "student"}
                    >
                        Export Student Data
                    </button>
                    <button
                        className="btn btn-primary"
                        style={{ marginLeft: 10 }}
                        onClick={handleExportFacultyData}
                        disabled={reportType !== "faculty"}
                    >
                        Export Faculty Data
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleImportStudents}
                    >
                        Import Students from Google Sheets
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={handleImportFaculty}
                        style={{ marginLeft: 10 }}
                    >
                        Import Faculty from Google Sheets
                    </button>
                </div>
            </div>

            <div className="table-wrapper">
                <table className="students-table">
                    <thead>
                        <tr>
                            {tableColumns.map((col) => (
                                <th key={col.key}>{col.label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {tableRows.length > 0 ? (
                            tableRows.map((row, idx) => (
                                <tr key={idx}>
                                    {tableColumns.map((col) => (
                                        <td key={col.key}>{row[col.key]}</td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={tableColumns.length}
                                    style={{
                                        textAlign: "center",
                                        color: "#888",
                                    }}
                                >
                                    {loading
                                        ? "Loading..."
                                        : "Click 'Generate Report' to see the data."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div
                className="export-actions"
                style={{ marginTop: "16px", display: "flex", gap: "10px" }}
            >
                <button
                    className="btn btn-primary"
                    onClick={handleDownloadPdf}
                    disabled={exporting}
                >
                    <FiFileText /> Download PDF
                </button>
                <button
                    className="btn btn-primary"
                    onClick={handleExportSheets}
                    disabled={exporting}
                >
                    <FiCloud /> Export to Google Sheets
                </button>
            </div>

            {/* Modal overlay for success/error/loading */}
            {modalState && (
                <div className="modal-overlay">
                    <div className="modal-card">{renderModalContent()}</div>
                </div>
            )}

            {loading && (
                <div className="page-loading">
                    <div className="spinner"></div>
                    <p>Loading Report...</p>
                </div>
            )}
        </div>
    );
}

export default Report;
