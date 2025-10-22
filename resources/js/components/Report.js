import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiFileText, FiCloud } from "react-icons/fi";

// Secure helper — ensure Sanctum cookie exists before requests
const ensureCsrf = async () => {
    try {
        await axios.get("/sanctum/csrf-cookie");
    } catch (_) {
        console.warn("Failed to initialize CSRF cookie");
    }
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
    const [notification, setNotification] = useState(null);
    const [exporting, setExporting] = useState(false);
    const [importing, setImporting] = useState(false);

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
                setNotification({
                    type: "error",
                    message: "Failed to load filter options.",
                });
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

    // Notification helper
    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3500);
    };

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
        setNotification(null);
        try {
            await ensureCsrf(); // 🔒 Secure CSRF protection
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
            showNotification("success", "Report generated successfully");
        } catch {
            showNotification("error", "Failed to generate report.");
        } finally {
            setLoading(false);
        }
    };

    // Download PDF
    const handleDownloadPdf = async () => {
        if (!tableRows.length) return;
        setExporting(true);
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
            showNotification("success", "PDF downloaded successfully");
        } catch {
            showNotification("error", "Failed to generate PDF.");
        } finally {
            setExporting(false);
        }
    };

    // Export to Google Sheets
    const handleExportSheets = async () => {
        if (!tableRows.length) return;
        setExporting(true);
        try {
            await axios.post("/api/export-to-sheets", {
                type: reportType,
                course_id: selectedCourse, // for students
                department_id: selectedDepartment, // for faculty
            });
            showNotification(
                "success",
                "Data exported to Google Sheets successfully"
            );
        } catch {
            showNotification("error", "Failed to export to Google Sheets.");
        } finally {
            setExporting(false);
        }
    };

    // Import from Google Sheets
    const handleImportSheets = async () => {
        setImporting(true);
        try {
            const url =
                reportType === REPORT_TYPES.student
                    ? "/api/admin/reports/students/import"
                    : "/api/admin/reports/faculty/import";
            const { data } = await axios.post(url);
            showNotification(
                "success",
                data.message || "Imported successfully"
            );
            // Optionally, refresh the report after import
            handleGenerateReport();
        } catch (err) {
            showNotification(
                "error",
                err.response?.data?.message ||
                    "Failed to import from Google Sheets."
            );
        } finally {
            setImporting(false);
        }
    };

    // Export all students (no filter)
    const handleExportAllStudents = async () => {
        setExporting(true);
        try {
            await axios.post("/api/export-to-sheets", { type: "student" });
            showNotification(
                "success",
                "All student data exported to Google Sheets!"
            );
        } catch {
            showNotification("error", "Failed to export student data.");
        } finally {
            setExporting(false);
        }
    };

    // Export all faculty (no filter)
    const handleExportAllFaculty = async () => {
        setExporting(true);
        try {
            await axios.post("/api/export-to-sheets", { type: "faculty" });
            showNotification(
                "success",
                "All faculty data exported to Google Sheets!"
            );
        } catch {
            showNotification("error", "Failed to export faculty data.");
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="report-page">
            {/* NEW: Container for title and export buttons */}
            <div className="header-container">
                <h2 className="page-title">Report Generator</h2>

                <div className="export-all-actions">
                    <button
                        className="btn"
                        onClick={handleExportAllStudents}
                        disabled={exporting}
                    >
                        Export Student Data
                    </button>
                    <button
                        className="btn"
                        onClick={handleExportAllFaculty}
                        disabled={exporting}
                    >
                        Export Faculty Data
                    </button>
                </div>
            </div>

            <div className="config-card">
                <div className="config-title">Report Configuration</div>
                <div className="config-grid">
                    <div className="field">
                        <label>Report Type:</label>
                        <select
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
                    </div>

                    {reportType === REPORT_TYPES.student && (
                        <div className="field">
                            <label>Filter by Course:</label>
                            <select
                                value={selectedCourse}
                                onChange={(e) =>
                                    setSelectedCourse(e.target.value)
                                }
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
                        </div>
                    )}
                    {reportType === REPORT_TYPES.faculty && (
                        <div className="field">
                            <label>Filter by Department:</label>
                            <select
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
                        </div>
                    )}

                    <button
                        className="btn btn-primary"
                        onClick={handleGenerateReport}
                        disabled={loading}
                        style={{ alignSelf: "flex-end", height: "36px" }}
                    >
                        {loading ? "Generating..." : "Generate Report"}
                    </button>
                </div>
            </div>

            {/* Notification area */}
            {notification && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}

            {loading && <div className="loading">Generating report...</div>}

            {/* Report Preview / Table Display */}
            <div className="report-preview">
                <div className="report-meta">
                    Report Preview
                    {tableRows.length > 0 &&
                        ` (showing ${tableRows.length} ${reportType}s)`}
                </div>

                {!loading && tableRows.length > 0 && (
                    <div className="report-results">
                        <table className="report-table">
                            <thead>
                                <tr>
                                    {tableColumns.map((col) => (
                                        <th key={col.key}>{col.label}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {tableRows.map((row, idx) => (
                                    <tr key={idx}>
                                        {tableColumns.map((col) => (
                                            <td key={col.key}>
                                                {row[col.key]}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && tableRows.length === 0 && (
                    <div>
                        {tableColumns.length > 0
                            ? "No data found for the selected filter."
                            : "Click 'Generate Report' to see the data."}
                    </div>
                )}
            </div>

            {/* Table Export Actions (PDF / Sheets for current data) */}
            {!loading && tableRows.length > 0 && (
                <div
                    className="export-actions"
                    style={{ marginTop: "16px", display: "flex", gap: "10px" }}
                >
                    <button
                        className="btn"
                        onClick={handleDownloadPdf}
                        disabled={exporting}
                    >
                        <FiFileText /> Download PDF
                    </button>
                    <button
                        className="btn"
                        onClick={handleExportSheets}
                        disabled={exporting}
                    >
                        <FiCloud /> Export to Google Sheets
                    </button>
                </div>
            )}

            {/* Removed the old export-all-actions div from the bottom */}
        </div>
    );
}

export default Report;
