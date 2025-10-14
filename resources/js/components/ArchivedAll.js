import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../sass/archived.scss";

function ArchivedAll() {
    const [items, setItems] = useState([]);
    const [filterOptions, setFilterOptions] = useState({
        departments: [],
        courses: [],
        academicYears: [],
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [type, setType] = useState(() => {
        const urlParams = new URLSearchParams(window.location.search);
        return (
            urlParams.get("type") ||
            localStorage.getItem("archiveType") ||
            "students"
        );
    });
    const [filters, setFilters] = useState({
        department_id: "",
        course_id: "",
        academic_year_id: "",
        search: "",
    });

    // --- Authentication and Headers setup (unchanged) ---
    const token = localStorage.getItem("token");
    // Handle no token case
    if (!token) {
        console.error("No token found in localStorage");
        setError("Authentication required. Please log in.");
        setIsLoading(false);
        window.location.href = "/login";
        return null;
    }
    const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };
    // ---------------------------------------------------

    useEffect(() => {
        // ... loadFilterOptions logic (unchanged) ...
        const loadFilterOptions = async () => {
            try {
                const [depts, courses, years] = await Promise.all([
                    axios.get("/api/admin/departments", { headers }),
                    axios.get("/api/admin/courses", { headers }),
                    axios.get("/api/admin/academic-years", { headers }),
                ]);
                setFilterOptions({
                    departments: depts.data,
                    courses: courses.data,
                    academicYears: years.data,
                });
            } catch (err) {
                console.error(
                    "Filter options error:",
                    err.response?.data || err.message
                );
                setError("Error loading filter options");
                if (
                    err.response?.status === 401 ||
                    err.response?.status === 403
                ) {
                    window.location.href = "/login";
                }
            }
        };
        loadFilterOptions();
    }, []);

    const refresh = async () => {
        // ... refresh logic (unchanged) ...
        setIsLoading(true);
        setError("");
        try {
            const params = new URLSearchParams();
            if (filters.course_id) params.set("course_id", filters.course_id);
            if (filters.department_id)
                params.set("department_id", filters.department_id);
            if (filters.academic_year_id)
                params.set("academic_year_id", filters.academic_year_id);
            if (filters.search) params.set("search", filters.search);
            params.set("type", type);
            console.log(
                "Request URL:",
                "/api/admin/archived?" + params.toString(),
                "Headers:",
                headers
            );
            const r = await axios.get(
                "/api/admin/archived?" + params.toString(),
                { headers }
            );
            console.log("Response:", r.data);
            setItems(r.data.items || []);
        } catch (err) {
            console.error(
                "API Error:",
                err.response?.data || err.message,
                "Status:",
                err.response?.status
            );
            setError(
                err.response?.data?.message || "Error loading archived items"
            );
            if (err.response?.status === 401 || err.response?.status === 403) {
                window.location.href = "/login";
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refresh();
        // Save the current type to localStorage for persistence
        localStorage.setItem("archiveType", type);
    }, [filters, type]);

    // --- handleRestore and handleDelete logic (unchanged) ---
    const handleRestore = async (item) => {
        if (!confirm("Are you sure you want to restore this item?")) return;
        setIsLoading(true);
        try {
            if (!item._type || !item._id) {
                setError("Invalid item data");
                setIsLoading(false);
                return;
            }
            const typeMap = {
                course: "courses",
                department: "departments",
                academic_year: "academic-years",
                student: "students",
                faculty: "faculty",
            };
            const apiType = typeMap[item._type] || item._type;
            const restoreUrl = `/api/admin/${apiType}/${item._id}/restore`;
            console.log("Restore URL:", restoreUrl, "Item:", item);
            const response = await axios.post(restoreUrl, {}, { headers });
            if (response.status === 200) {
                await refresh();
                setError("");
            }
        } catch (err) {
            console.error("Restore error:", err.response?.data || err.message);
            setError(err.response?.data?.message || "Error restoring item");
            if (err.response?.status === 401 || err.response?.status === 403) {
                window.location.href = "/login";
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (item) => {
        if (!confirm("Are you sure you want to permanently delete this item?"))
            return;
        setIsLoading(true);
        try {
            if (!item._type || !item._id) {
                setError("Invalid item data");
                setIsLoading(false);
                return;
            }
            const typeMap = {
                course: "courses",
                department: "departments",
                academic_year: "academic-years",
                student: "students",
                faculty: "faculty",
            };
            const apiType = typeMap[item._type] || item._type;
            const deleteUrl = `/api/admin/${apiType}/${item._id}`;
            console.log("Delete URL:", deleteUrl, "Item:", item);
            const response = await axios.delete(deleteUrl, { headers });
            if (response.status === 200) {
                await refresh();
                setError("");
            }
        } catch (err) {
            console.error("Delete error:", err.response?.data || err.message);
            setError(err.response?.data?.message || "Error deleting item");
            if (err.response?.status === 401 || err.response?.status === 403) {
                window.location.href = "/login";
            }
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (date) => {
        return date ? new Date(date).toLocaleDateString() : "-";
    };
    // ---------------------------------------------------

    return (
        <div className="page archived-all">
            <header className="page-header">
                <h1 className="page-title">Archived Data</h1>
            </header>
            {error && <div className="alert-error">{error}</div>}
            {isLoading && <div className="loading">Loading...</div>}
            <div className="dashboard-card">
                {" "}
                {/* Main container with card styling */}
                <div className="controls-bar">
                    {" "}
                    {/* Row for all controls: select, search, filters */}
                    {/* 1. Type Selector (View: Students/Faculty/etc.) */}
                    <div className="control-item select-type">
                        <label htmlFor="archive-type-select">View</label>
                        <select
                            id="archive-type-select"
                            value={type}
                            onChange={(e) => {
                                setType(e.target.value);
                                setFilters({
                                    department_id: "",
                                    course_id: "",
                                    academic_year_id: "",
                                    search: "",
                                });
                            }}
                        >
                            <option value="students">Students</option>
                            <option value="faculty">Faculty</option>
                            <option value="courses">Courses</option>
                            <option value="departments">Departments</option>
                            <option value="academic_years">
                                Academic Years
                            </option>
                        </select>
                    </div>
                    {/* 2. Search Input (Always Visible) */}
                    <div className="control-item search-box-wrap">
                        <label htmlFor="search-input">Search</label>
                        <div className="search-input-group">
                            <span className="search-icon">🔍</span>
                            <input
                                id="search-input"
                                className="search-input"
                                placeholder={`Search archived ${type}...`}
                                value={filters.search}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        search: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>
                    {/* 3. Department Filter (Conditional) */}
                    {(type === "students" ||
                        type === "faculty" ||
                        type === "courses") && (
                        <div className="control-item filter-dropdown">
                            <label htmlFor="department-select">
                                Department
                            </label>
                            <select
                                id="department-select"
                                value={filters.department_id}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        department_id: e.target.value,
                                        course_id: "",
                                    })
                                }
                            >
                                <option value="">All Departments</option>
                                {filterOptions.departments.map((d) => (
                                    <option
                                        key={d.department_id}
                                        value={d.department_id}
                                    >
                                        {d.department_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    {/* 4. Course Filter (Conditional) */}
                    {(type === "students" || type === "courses") && (
                        <div className="control-item filter-dropdown">
                            <label htmlFor="course-select">Course</label>
                            <select
                                id="course-select"
                                value={filters.course_id}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        course_id: e.target.value,
                                    })
                                }
                                disabled={
                                    type === "students" &&
                                    !filters.department_id
                                }
                            >
                                <option value="">All Courses</option>
                                {filterOptions.courses
                                    .filter(
                                        (c) =>
                                            !filters.department_id ||
                                            c.department_id ===
                                                parseInt(filters.department_id)
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
                    )}
                    {/* 5. Academic Year Filter (Conditional) */}
                    {type === "students" && (
                        <div className="control-item filter-dropdown">
                            <label htmlFor="year-select">Year</label>
                            <select
                                id="year-select"
                                value={filters.academic_year_id}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        academic_year_id: e.target.value,
                                    })
                                }
                            >
                                <option value="">All Academic Years</option>
                                {filterOptions.academicYears.map((a) => (
                                    <option
                                        key={a.academic_year_id}
                                        value={a.academic_year_id}
                                    >
                                        {a.school_year}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
                {/* Table Content */}
                <div className="table-wrapper">
                    {items.length === 0 ? (
                        <p className="no-data">
                            No archived **{type.replace(/_/g, " ")}** found
                            matching your criteria.
                        </p>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    {/* Table Headers (Dynamic) */}
                                    {type === "students" && <th>Name</th>}
                                    {type === "faculty" && (
                                        <th>Faculty Name</th>
                                    )}
                                    {type === "courses" && <th>Course Name</th>}
                                    {type === "departments" && (
                                        <th>Department Name</th>
                                    )}
                                    {type === "academic_years" && (
                                        <th>School Year</th>
                                    )}

                                    {(type === "students" ||
                                        type === "faculty" ||
                                        type === "courses") && (
                                        <th>Department</th>
                                    )}
                                    {(type === "students" ||
                                        type === "courses") && <th>Course</th>}
                                    {type === "students" && <th>Year Level</th>}

                                    <th>Archived At</th>
                                    <th className="action-column">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, index) => (
                                    <tr
                                        key={`${item._type}-${
                                            item._id || index
                                        }`}
                                    >
                                        {/* Table Data (Dynamic) */}
                                        <td>{item._label}</td>
                                        {(type === "students" ||
                                            type === "faculty" ||
                                            type === "courses") && (
                                            <td>{item._department || "-"}</td>
                                        )}
                                        {(type === "students" ||
                                            type === "courses") && (
                                            <td>{item._course || "-"}</td>
                                        )}
                                        {type === "students" && (
                                            <td>{item._year_level || "-"}</td>
                                        )}
                                        <td>{formatDate(item.archived_at)}</td>

                                        {/* Action Cell */}
                                        <td className="action-cell">
                                            <div className="btn-group">
                                                <button
                                                    className="btn btn-restore"
                                                    onClick={() =>
                                                        handleRestore(item)
                                                    }
                                                    title="Restore"
                                                >
                                                    <i className="fas fa-undo"></i>
                                                    <span className="btn-label">
                                                        Restore
                                                    </span>
                                                </button>
                                                <button
                                                    className="btn btn-delete"
                                                    onClick={() =>
                                                        handleDelete(item)
                                                    }
                                                    title="Delete Permanently"
                                                >
                                                    <i className="fas fa-trash-alt"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>{" "}
            {/* End of .dashboard-card */}
        </div>
    );
}

export default ArchivedAll;
