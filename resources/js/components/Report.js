import React, { useState, useEffect } from "react";
import "../../sass/report.scss";

function Report() {
    const [reportType, setReportType] = useState("students");
    const [filters, setFilters] = useState({
        course_id: "",
        department_id: "",
        academic_year_id: "",
        status: "",
    });
    const [options, setOptions] = useState({
        courses: [],
        departments: [],
        academic_years: [],
    });
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [modalFilters, setModalFilters] = useState({
        course_id: "",
        department_id: "",
        academic_year_id: "",
        status: "",
    });

    useEffect(() => {
        loadOptions();
    }, []);

    const loadOptions = async () => {
        try {
            const response = await fetch("/api/admin/reports", {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            if (response.status === 401 || response.status === 403) {
                window.location.href = "/login";
                return;
            }
            if (response.ok) {
                const data = await response.json();
                setOptions(data);
            } else {
                setError("Failed to load filter options");
            }
        } catch (error) {
            setError("Error loading options");
            console.error("Error loading options:", error);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
    };

    const openModal = () => {
        setModalFilters({
            course_id: "",
            department_id: "",
            academic_year_id: "",
            status: "",
        });
        setShowModal(true);
    };

    const handleModalFilterChange = (field, value) => {
        setModalFilters((prev) => {
            const next = { ...prev, [field]: value };
            if (field === "department_id") {
                next.course_id = "";
            }
            return next;
        });
    };

    const generateReport = async () => {
        setLoading(true);
        setError("");
        setReportData(null);
        setShowModal(false);

        try {
            const endpoint =
                reportType === "students"
                    ? "/api/admin/reports/students"
                    : "/api/admin/reports/faculty";
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(modalFilters),
            });

            if (response.status === 401 || response.status === 403) {
                window.location.href = "/login";
                return;
            }

            if (response.ok) {
                const data = await response.json();
                setReportData(data);
            } else {
                setError("Failed to generate report");
            }
        } catch (error) {
            setError("Error generating report");
            console.error("Error generating report:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="report-content">
            <header className="page-header">
                <h1 className="page-title">Reports</h1>
                <p className="page-subtitle">
                    Generate reports for students or faculty
                </p>
            </header>

            <section className="report-controls">
                <div className="report-type-toggle">
                    <button
                        className={`btn ${
                            reportType === "students"
                                ? "btn-primary"
                                : "btn-secondary"
                        }`}
                        onClick={() => setReportType("students")}
                    >
                        Student Report
                    </button>
                    <button
                        className={`btn ${
                            reportType === "faculty"
                                ? "btn-primary"
                                : "btn-secondary"
                        }`}
                        onClick={() => setReportType("faculty")}
                    >
                        Faculty Report
                    </button>
                </div>
                <button className="btn btn-primary" onClick={openModal}>
                    Generate Report
                </button>
            </section>

            {error && <div className="alert-error">{error}</div>}

            {loading && <div className="loading">Loading...</div>}

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <h3>
                            Generate{" "}
                            {reportType === "students" ? "Student" : "Faculty"}{" "}
                            Report
                        </h3>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                generateReport();
                            }}
                        >
                            <div className="form-group">
                                <label>Department</label>
                                <select
                                    value={modalFilters.department_id}
                                    onChange={(e) =>
                                        handleModalFilterChange(
                                            "department_id",
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="">All Departments</option>
                                    {options.departments.map((d) => (
                                        <option
                                            key={d.department_id}
                                            value={d.department_id}
                                        >
                                            {d.department_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {reportType === "students" && (
                                <>
                                    <div className="form-group">
                                        <label>Course</label>
                                        <select
                                            value={modalFilters.course_id}
                                            onChange={(e) =>
                                                handleModalFilterChange(
                                                    "course_id",
                                                    e.target.value
                                                )
                                            }
                                        >
                                            <option value="">
                                                All Courses
                                            </option>
                                            {options.courses
                                                .filter(
                                                    (c) =>
                                                        !modalFilters.department_id ||
                                                        c.department_id ===
                                                            parseInt(
                                                                modalFilters.department_id
                                                            )
                                                )
                                                .map((c) => (
                                                    <option
                                                        key={c.course_id}
                                                        value={c.course_id}
                                                    >
                                                        {c.course_name}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Academic Year</label>
                                        <select
                                            value={
                                                modalFilters.academic_year_id
                                            }
                                            onChange={(e) =>
                                                handleModalFilterChange(
                                                    "academic_year_id",
                                                    e.target.value
                                                )
                                            }
                                        >
                                            <option value="">
                                                All Academic Years
                                            </option>
                                            {options.academic_years.map((a) => (
                                                <option
                                                    key={a.academic_year_id}
                                                    value={a.academic_year_id}
                                                >
                                                    {a.school_year}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Status</label>
                                        <select
                                            value={modalFilters.status}
                                            onChange={(e) =>
                                                handleModalFilterChange(
                                                    "status",
                                                    e.target.value
                                                )
                                            }
                                        >
                                            <option value="">
                                                All Statuses
                                            </option>
                                            <option value="active">
                                                Active
                                            </option>
                                            <option value="inactive">
                                                Inactive
                                            </option>
                                            <option value="graduated">
                                                Graduated
                                            </option>
                                            <option value="dropped">
                                                Dropped
                                            </option>
                                        </select>
                                    </div>
                                </>
                            )}
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                >
                                    Generate
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {reportData && (
                <section className="report-results">
                    <h2>
                        {reportType === "students"
                            ? "Student Report"
                            : "Faculty Report"}
                    </h2>
                    <div className="report-table">
                        <table>
                            <thead>
                                <tr>
                                    {reportType === "students" ? (
                                        <>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Course</th>
                                            <th>Department</th>
                                            <th>Status</th>
                                        </>
                                    ) : (
                                        <>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Position</th>
                                            <th>Department</th>
                                            <th>Phone</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {reportData[reportType]
                                    ?.slice(0, 10)
                                    .map((item, index) => (
                                        <tr key={index}>
                                            {reportType === "students" ? (
                                                <>
                                                    <td>
                                                        {item.f_name}{" "}
                                                        {item.l_name}
                                                    </td>
                                                    <td>
                                                        {item.email_address}
                                                    </td>
                                                    <td>
                                                        {item.course
                                                            ?.course_name ||
                                                            "N/A"}
                                                    </td>
                                                    <td>
                                                        {item.department
                                                            ?.department_name ||
                                                            "N/A"}
                                                    </td>
                                                    <td>
                                                        {item.status || "N/A"}
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td>
                                                        {item.f_name}{" "}
                                                        {item.l_name}
                                                    </td>
                                                    <td>
                                                        {item.email_address}
                                                    </td>
                                                    <td>{item.position}</td>
                                                    <td>
                                                        {item.department
                                                            ?.department_name ||
                                                            "N/A"}
                                                    </td>
                                                    <td>{item.phone_number}</td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                        {reportData[reportType]?.length > 10 && (
                            <div className="table-note">
                                Showing first 10 records. Export to see all{" "}
                                {reportData[reportType].length} records.
                            </div>
                        )}
                    </div>
                </section>
            )}
        </div>
    );
}

export default Report;
