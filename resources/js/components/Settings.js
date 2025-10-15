import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../sass/settings.scss";

function Settings() {
    const [active, setActive] = useState(() => {
        try {
            return localStorage.getItem("settings_active_tab") || "courses";
        } catch (_) {
            return "courses";
        }
    });
    const [courses, setCourses] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        course_name: "",
        department_name: "",
        department_head: "",
        department_id: "",
        school_year: "",
    });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const refreshData = async () => {
        try {
            if (active === "courses") {
                const res = await axios.get("/api/admin/courses");
                setCourses(res.data.filter((c) => !c.archived_at));
                const deptRes = await axios.get("/api/admin/departments");
                setDepartments(deptRes.data);
            } else if (active === "departments") {
                const res = await axios.get("/api/admin/departments");
                setDepartments(res.data.filter((d) => !d.archived_at));
            } else if (active === "academic-years") {
                const res = await axios.get("/api/admin/academic-years");
                setAcademicYears(res.data.filter((a) => !a.archived_at));
            }
        } catch (err) {
            setError("Failed to load data");
            if (err.response?.status === 401 || err.response?.status === 403) {
                window.location.href = "/login";
            }
        }
    };

    useEffect(() => {
        refreshData();
    }, [active]);

    const onOpenForm = () => {
        setShowForm(true);
        setForm({
            course_name: "",
            department_name: "",
            department_head: "",
            department_id: "",
            school_year: "",
        });
        setError("");
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        console.log("Form Data:", form); // Debug log
        try {
            if (active === "courses") {
                const payload = {
                    course_name: form.course_name.trim(),
                    department_id: form.department_id || undefined, // Ensure valid ID or omit
                };
                if (!payload.department_id) {
                    throw new Error("Please select a department.");
                }
                const response = await axios.post(
                    "/api/admin/courses",
                    payload
                );
                if (response.status === 201) {
                    await refreshData();
                }
            } else if (active === "departments") {
                const payload = {
                    department_name: form.department_name.trim(),
                    department_head: form.department_head.trim() || null,
                };
                const response = await axios.post(
                    "/api/admin/departments",
                    payload
                );
                if (response.status === 201) {
                    await refreshData();
                }
            } else if (active === "academic-years") {
                const payload = {
                    school_year: form.school_year.trim(),
                };
                const response = await axios.post(
                    "/api/admin/academic-years",
                    payload
                );
                if (response.status === 201) {
                    await refreshData();
                }
            }
            setShowForm(false);
        } catch (error) {
            const errorMsg =
                error.response?.data?.message ||
                error.message ||
                "Failed to save";
            setError(errorMsg);
            console.error(
                "Submission Error:",
                error.response?.data || error.message
            );
            if (
                error.response?.status === 401 ||
                error.response?.status === 403
            ) {
                window.location.href = "/login";
            }
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to archive this item?")) return;
        try {
            const url = `/api/admin/${active}/${id}/archive`;
            await axios.post(url);
            await refreshData();
        } catch (error) {
            setError(error.response?.data?.message || "Failed to archive");
            if (
                error.response?.status === 401 ||
                error.response?.status === 403
            ) {
                window.location.href = "/login";
            }
        }
    };

    const handleRestoreNavigate = () => {
        navigate(`/archived?type=${active}`);
    };

    return (
        <div className="settings-content">
            <header className="page-header">
                <h1 className="page-title">Settings</h1>
                <p className="page-subtitle">Manage courses, departments, and academic years</p>
            </header>

            {error && <div className="alert-error">{error}</div>}

            <section className="settings-tabs">
                <div className="tabs">
                    <button
                        className={`tab ${
                            active === "courses" ? "active" : ""
                        }`}
                        onClick={() => {
                            setActive("courses");
                            localStorage.setItem(
                                "settings_active_tab",
                                "courses"
                            );
                        }}
                    >
                        Courses
                    </button>
                    <button
                        className={`tab ${
                            active === "departments" ? "active" : ""
                        }`}
                        onClick={() => {
                            setActive("departments");
                            localStorage.setItem(
                                "settings_active_tab",
                                "departments"
                            );
                        }}
                    >
                        Departments
                    </button>
                    <button
                        className={`tab ${
                            active === "academic-years" ? "active" : ""
                        }`}
                        onClick={() => {
                            setActive("academic-years");
                            localStorage.setItem(
                                "settings_active_tab",
                                "academic-years"
                            );
                        }}
                    >
                        Academic Years
                    </button>
                </div>

                <div className="tab-content">
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "20px",
                        }}
                    >
                        <button
                            className="btn btn-primary"
                            onClick={handleRestoreNavigate}
                        >
                            View Archived
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={onOpenForm}
                        >
                            Add{" "}
                            {active === "courses"
                                ? "Course"
                                : active === "departments"
                                ? "Department"
                                : "Academic Year"}
                        </button>
                    </div>

                    {active === "courses" && (
                        <div className="table-wrapper">
                            <table className="settings-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Department</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {courses.map((c) => (
                                        <tr key={c.course_id}>
                                            <td>{c.course_name}</td>
                                            <td>
                                                {c.department
                                                    ?.department_name || "-"}
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-danger"
                                                    onClick={() =>
                                                        handleDelete(
                                                            c.course_id
                                                        )
                                                    }
                                                >
                                                    Archive
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {active === "departments" && (
                        <div className="table-wrapper">
                            <table className="settings-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Head</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {departments.map((d) => (
                                        <tr key={d.department_id}>
                                            <td>{d.department_name}</td>
                                            <td>{d.department_head || "-"}</td>
                                            <td>
                                                <button
                                                    className="btn btn-danger"
                                                    onClick={() =>
                                                        handleDelete(
                                                            d.department_id
                                                        )
                                                    }
                                                >
                                                    Archive
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {active === "academic-years" && (
                        <div className="table-wrapper">
                            <table className="settings-table">
                                <thead>
                                    <tr>
                                        <th>School Year</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {academicYears.map((a) => (
                                        <tr key={a.academic_year_id}>
                                            <td>{a.school_year}</td>
                                            <td>
                                                <button
                                                    className="btn btn-danger"
                                                    onClick={() =>
                                                        handleDelete(
                                                            a.academic_year_id
                                                        )
                                                    }
                                                >
                                                    Archive
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Modal forms (unchanged) */}
                    {showForm && active === "courses" && (
                        <div className="modal-overlay">
                            <div className="modal-card">
                                <h3>Add Course</h3>
                                <form onSubmit={onSubmit}>
                                    <div style={{ display: "grid", gap: 14 }}>
                                        <div>
                                            <label>Course Name</label>
                                            <input
                                                className="form-input"
                                                value={form.course_name}
                                                onChange={(e) =>
                                                    setForm({
                                                        ...form,
                                                        course_name:
                                                            e.target.value,
                                                    })
                                                }
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label>Department</label>
                                            <select
                                                className="form-input"
                                                value={form.department_id}
                                                onChange={(e) =>
                                                    setForm({
                                                        ...form,
                                                        department_id:
                                                            e.target.value,
                                                    })
                                                }
                                                required
                                            >
                                                <option value="" disabled>
                                                    Select department
                                                </option>
                                                {departments.map((d) => (
                                                    <option
                                                        key={d.department_id}
                                                        value={d.department_id}
                                                    >
                                                        {d.department_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            marginTop: 20,
                                            display: "flex",
                                            justifyContent: "flex-end",
                                            gap: 12,
                                        }}
                                    >
                                        <button
                                            className="btn"
                                            type="button"
                                            onClick={() => setShowForm(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className="btn btn-primary"
                                            type="submit"
                                        >
                                            Add Course
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {showForm && active === "departments" && (
                        <div className="modal-overlay">
                            <div className="modal-card">
                                <h3>Add Department</h3>
                                <form onSubmit={onSubmit}>
                                    <div style={{ display: "grid", gap: 14 }}>
                                        <div>
                                            <label>Department Name</label>
                                            <input
                                                className="form-input"
                                                value={form.department_name}
                                                onChange={(e) =>
                                                    setForm({
                                                        ...form,
                                                        department_name:
                                                            e.target.value,
                                                    })
                                                }
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label>Department Head</label>
                                            <input
                                                className="form-input"
                                                value={form.department_head}
                                                onChange={(e) =>
                                                    setForm({
                                                        ...form,
                                                        department_head:
                                                            e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            marginTop: 20,
                                            display: "flex",
                                            justifyContent: "flex-end",
                                            gap: 12,
                                        }}
                                    >
                                        <button
                                            className="btn"
                                            type="button"
                                            onClick={() => setShowForm(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className="btn btn-primary"
                                            type="submit"
                                        >
                                            Add Department
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {showForm && active === "academic-years" && (
                        <div className="modal-overlay">
                            <div className="modal-card">
                                <h3>Add Academic Year</h3>
                                <form onSubmit={onSubmit}>
                                    <div style={{ display: "grid", gap: 14 }}>
                                        <div>
                                            <label>School Year</label>
                                            <input
                                                className="form-input"
                                                value={form.school_year}
                                                onChange={(e) =>
                                                    setForm({
                                                        ...form,
                                                        school_year:
                                                            e.target.value,
                                                    })
                                                }
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            marginTop: 20,
                                            display: "flex",
                                            justifyContent: "flex-end",
                                            gap: 12,
                                        }}
                                    >
                                        <button
                                            className="btn"
                                            type="button"
                                            onClick={() => setShowForm(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className="btn btn-primary"
                                            type="submit"
                                        >
                                            Add Academic Year
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

export default Settings;
