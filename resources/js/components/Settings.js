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

    useEffect(() => {
        if (active === "courses") {
            axios
                .get("/api/admin/courses")
                .then((res) =>
                    setCourses(res.data.filter((c) => !c.archived_at))
                )
                .catch(() => {
                    setError("Failed to load courses");
                    if (
                        error.response?.status === 401 ||
                        error.response?.status === 403
                    ) {
                        window.location.href = "/login";
                    }
                });
            axios
                .get("/api/admin/departments")
                .then((res) => setDepartments(res.data))
                .catch(() => setError("Failed to load departments"));
        } else if (active === "departments") {
            axios
                .get("/api/admin/departments")
                .then((res) =>
                    setDepartments(res.data.filter((d) => !d.archived_at))
                )
                .catch(() => setError("Failed to load departments"));
        } else if (active === "academic-years") {
            axios
                .get("/api/admin/academic-years")
                .then((res) =>
                    setAcademicYears(res.data.filter((a) => !a.archived_at))
                )
                .catch(() => setError("Failed to load academic years"));
        }
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
        try {
            if (active === "courses") {
                const payload = {
                    course_name: form.course_name,
                    department_id: form.department_id,
                };
                await axios.post("/api/admin/courses", payload);
                const res = await axios.get("/api/admin/courses");
                setCourses(res.data.filter((c) => !c.archived_at));
            } else if (active === "departments") {
                const payload = {
                    department_name: form.department_name,
                    department_head: form.department_head || null,
                };
                await axios.post("/api/admin/departments", payload);
                const res = await axios.get("/api/admin/departments");
                setDepartments(res.data.filter((d) => !d.archived_at));
            } else if (active === "academic-years") {
                const payload = {
                    school_year: form.school_year,
                };
                await axios.post("/api/admin/academic-years", payload);
                const res = await axios.get("/api/admin/academic-years");
                setAcademicYears(res.data.filter((a) => !a.archived_at));
            }
            setShowForm(false);
        } catch (error) {
            setError(error.response?.data?.message || "Failed to save");
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
            if (active === "courses") {
                await axios.post(`/api/admin/courses/${id}/archive`);
                setCourses(courses.filter((c) => c.course_id !== id));
            } else if (active === "departments") {
                await axios.post(`/api/admin/departments/${id}/archive`);
                setDepartments(
                    departments.filter((d) => d.department_id !== id)
                );
            } else if (active === "academic-years") {
                await axios.post(`/api/admin/academic-years/${id}/archive`);
                setAcademicYears(
                    academicYears.filter((a) => a.academic_year_id !== id)
                );
            }
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

    const handleArchiveNavigate = () => {
        navigate(`/archived?type=${active}`);
    };

    return (
        <div className="settings-content">
            <header className="page-header">
                <h1 className="page-title">
                    Manage Courses, Departments, and Academic Year
                </h1>
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
                        }}
                    >
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
                        <button
                            className="btn btn-primary"
                            onClick={handleArchiveNavigate}
                        >
                            View Archived{" "}
                            {active === "courses"
                                ? "Courses"
                                : active === "departments"
                                ? "Departments"
                                : "Academic Years"}
                        </button>
                    </div>

                    {active === "courses" && (
                        <div className="table-wrapper">
                            <table>
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
                            <table>
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
                            <table>
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
