import React, { useEffect, useState } from "react";
import axios from "axios";

function ArchivedAll() {
    const [items, setItems] = useState([]);
    const [filterOptions, setFilterOptions] = useState({
        departments: [],
        courses: [],
        academicYears: [],
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [type, setType] = useState("students");
    const [filters, setFilters] = useState({
        department_id: "",
        course_id: "",
        academic_year_id: "",
        search: "",
    });

    useEffect(() => {
        const loadFilterOptions = async () => {
            try {
                const [depts, courses, years] = await Promise.all([
                    axios.get("/api/admin/departments"),
                    axios.get("/api/admin/courses"),
                    axios.get("/api/admin/academic-years"),
                ]);
                setFilterOptions({
                    departments: depts.data,
                    courses: courses.data,
                    academicYears: years.data,
                });
            } catch (err) {
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
            const url = "/api/admin/archived?" + params.toString();
            console.log("Fetching from:", url);
            const r = await axios.get(url);
            setItems(r.data.items || []);
        } catch (err) {
            console.error("API Error:", err);
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
    }, [filters, type]);

    const handleRestore = async (item) => {
        if (!confirm("Are you sure you want to restore this item?")) return;
        setIsLoading(true);
        try {
            await axios.post(`/api/admin/students/${item._id}/restore`);
            await refresh();
        } catch (err) {
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
            await axios.delete(`/api/admin/students/${item._id}`);
            await refresh();
        } catch (err) {
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

    return (
        <div className="page">
            <header className="page-header">
                <h1 className="page-title">Archived Students</h1>
                <p className="page-subtitle">
                    View and manage archived students
                </p>
            </header>

            {error && <div className="alert-error">{error}</div>}
            {isLoading && <div className="loading">Loading...</div>}

            <div className="controls">
                <div className="filters">
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    >
                        <option value="students">Students</option>
                    </select>
                    <select
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
                    <select
                        value={filters.course_id}
                        onChange={(e) =>
                            setFilters({
                                ...filters,
                                course_id: e.target.value,
                            })
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
                                <option key={c.course_id} value={c.course_id}>
                                    {c.course_name}
                                </option>
                            ))}
                    </select>
                    <select
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
                    <input
                        type="text"
                        placeholder="Search by name"
                        value={filters.search}
                        onChange={(e) =>
                            setFilters({ ...filters, search: e.target.value })
                        }
                    />
                </div>
            </div>

            <div className="table-wrapper">
                {items.length === 0 ? (
                    <p>No archived students found.</p>
                ) : (
                    <table className="students-table">
                        <thead>
                            <tr>
                                <th>Student Name</th>
                                <th>Department</th>
                                <th>Course</th>
                                <th>Year Level</th>
                                <th>Deleted At</th>{" "}
                                {/* Changed from archived_at */}
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr key={`${item._type}-${item._id || index}`}>
                                    <td>{item._label}</td>
                                    <td>{item._department || "-"}</td>
                                    <td>{item._course || "-"}</td>
                                    <td>{item._year_level || "-"}</td>
                                    <td>{formatDate(item.deleted_at)}</td>{" "}
                                    {/* Changed from archived_at */}
                                    <td className="text-end">
                                        <div className="btn-group">
                                            <button
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={() =>
                                                    handleRestore(item)
                                                }
                                                title="Restore"
                                            >
                                                <i className="fas fa-undo"></i>{" "}
                                                Restore
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-danger"
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
        </div>
    );
}

export default ArchivedAll;
