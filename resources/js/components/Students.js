import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../sass/students.scss";

// Add this utility function
const getCsrfCookie = async () => {
    await axios.get("/sanctum/csrf-cookie", { withCredentials: true });
};

function Students() {
    const [courses, setCourses] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [students, setStudents] = useState([]);
    const [modalContentState, setModalContentState] = useState("form");
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const [form, setForm] = useState({
        f_name: "",
        m_name: "",
        l_name: "",
        suffix: "",
        date_of_birth: "",
        sex: "male",
        phone_number: "",
        email_address: "",
        address: "",
        status: "active",
        department_id: "",
        course_id: "",
        academic_year_id: "",
        year_level: "1st",
    });

    const closeModalAndReset = () => {
        setShowForm(false);
        setModalContentState("form");
        setEditingId(null);
        setError("");
        setForm({
            f_name: "",
            m_name: "",
            l_name: "",
            suffix: "",
            date_of_birth: "",
            sex: "male",
            phone_number: "",
            email_address: "",
            address: "",
            status: "active",
            department_id: "",
            course_id: "",
            academic_year_id: "",
            year_level: "1st",
        });
    };

    useEffect(() => {
        Promise.all([
            axios.get("/api/admin/courses").catch((e) => []),
            axios.get("/api/admin/departments").catch((e) => []),
            axios.get("/api/admin/academic-years").catch((e) => []),
        ])
            .then(([coursesRes, deptsRes, yearsRes]) => {
                setCourses(coursesRes.data || []);
                setDepartments(deptsRes.data || []);
                setAcademicYears(yearsRes.data || []);
                refresh();
            })
            .catch((e) => {
                if (e.response?.status === 401 || e.response?.status === 403) {
                    window.location.href = "/login";
                }
            });
    }, []);

    const [filters, setFilters] = useState({
        search: "",
        department_id: "",
        course_id: "",
        academic_year_id: "",
    });

    const refresh = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.search) params.set("search", filters.search);
            if (filters.department_id)
                params.set("department_id", filters.department_id);
            if (filters.course_id) params.set("course_id", filters.course_id);
            if (filters.academic_year_id)
                params.set("academic_year_id", filters.academic_year_id);
            const qs = params.toString();
            const url = "/api/admin/students" + (qs ? "?" + qs : "");
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            setStudents(response.data.filter((s) => !s.archived_at));
            setError("");
        } catch (e) {
            console.error("API Error:", e);
            setError(
                `Failed to load students: ${
                    e.response?.data?.error || e.message
                }`
            );
            if (e.response?.status === 401 || e.response?.status === 403) {
                window.location.href = "/login";
            }
        }
    };

    useEffect(() => {
        refresh();
    }, [filters]);

    const onOpenForm = () => {
        setEditingId(null);
        setShowForm(true);
        setModalContentState("form");
    };

    const onOpenEditForm = (student) => {
        const formatDate = (dateString) =>
            dateString ? new Date(dateString).toISOString().split("T")[0] : "";
        setEditingId(student.student_id);
        setShowForm(true);
        setModalContentState("form");
        setForm({
            f_name: student.f_name || "",
            m_name: student.m_name || "",
            l_name: student.l_name || "",
            suffix: student.suffix || "",
            date_of_birth: formatDate(student.date_of_birth),
            sex: student.sex || "male",
            phone_number: student.phone_number || "",
            email_address: student.email_address || "",
            address: student.address || "",
            status: student.status || "active",
            department_id: student.department_id || "",
            course_id: student.course_id || "",
            academic_year_id: student.academic_year_id || "",
            year_level: student.year_level || "1st",
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setModalContentState("loading");
        setError("");
        try {
            const payload = { ...form };
            let response;
            if (editingId) {
                response = await axios.put(
                    `/api/admin/students/${editingId}`,
                    payload,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem(
                                "token"
                            )}`,
                        },
                    }
                );
            } else {
                response = await axios.post("/api/admin/students", payload, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                });
            }
            if (response.status === 200 || response.status === 201) {
                await refresh();
                setModalContentState("success");
            }
        } catch (error) {
            setError(error.response?.data?.message || "Failed to save student");
            setModalContentState("form");
            if (
                error.response?.status === 401 ||
                error.response?.status === 403
            ) {
                window.location.href = "/login";
            }
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to archive this student?")) return;
        try {
            await getCsrfCookie(); // Fetch CSRF token
            const response = await axios.post(
                `/api/admin/students/${id}/archive`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                    withCredentials: true, // Include cookies
                }
            );
            if (response.status === 200) {
                await refresh();
                setError("");
            }
        } catch (error) {
            setError(
                error.response?.data?.error || "Failed to archive student"
            );
            if (
                error.response?.status === 401 ||
                error.response?.status === 403
            ) {
                window.location.href = "/login";
            }
        }
    };

    const renderModalContent = () => {
        if (modalContentState === "loading") {
            return <div>Loading...</div>;
        }
        if (modalContentState === "success") {
            return (
                <>
                    <div>Success!</div>
                    <button
                        className="btn"
                        onClick={() => {
                            closeModalAndReset();
                            setModalContentState("form");
                        }}
                    >
                        Close
                    </button>
                </>
            );
        }
        return (
            <>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>First Name</label>
                        <input
                            type="text"
                            name="f_name"
                            value={form.f_name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Middle Name</label>
                        <input
                            type="text"
                            name="m_name"
                            value={form.m_name}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Last Name</label>
                        <input
                            type="text"
                            name="l_name"
                            value={form.l_name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Suffix</label>
                        <input
                            type="text"
                            name="suffix"
                            value={form.suffix}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Date of Birth</label>
                        <input
                            type="date"
                            name="date_of_birth"
                            value={form.date_of_birth}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Sex</label>
                        <select
                            name="sex"
                            value={form.sex}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Phone Number</label>
                        <input
                            type="text"
                            name="phone_number"
                            value={form.phone_number}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            name="email_address"
                            value={form.email_address}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Address</label>
                        <textarea
                            name="address"
                            value={form.address}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Status</label>
                        <select
                            name="status"
                            value={form.status}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="graduated">Graduated</option>
                            <option value="dropped">Dropped</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Department</label>
                        <select
                            name="department_id"
                            value={form.department_id}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Select Department</option>
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
                    <div className="form-group">
                        <label>Course</label>
                        <select
                            name="course_id"
                            value={form.course_id}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Select Course</option>
                            {courses.map((c) => (
                                <option key={c.course_id} value={c.course_id}>
                                    {c.course_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Academic Year</label>
                        <select
                            name="academic_year_id"
                            value={form.academic_year_id}
                            onChange={handleInputChange}
                        >
                            <option value="">Select Academic Year</option>
                            {academicYears.map((a) => (
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
                        <label>Year Level</label>
                        <select
                            name="year_level"
                            value={form.year_level}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="1st">1st</option>
                            <option value="2nd">2nd</option>
                            <option value="3rd">3rd</option>
                            <option value="4th">4th</option>
                        </select>
                    </div>
                    {error && <div className="alert-error">{error}</div>}
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
                            onClick={closeModalAndReset}
                        >
                            Cancel
                        </button>
                        <button className="btn btn-primary" type="submit">
                            {editingId ? "Update Student" : "Add Student"}
                        </button>
                    </div>
                </form>
            </>
        );
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="page">
            <header className="page-header">
                <h1 className="page-title">Students</h1>
                <p className="page-subtitle">Manage student profiles</p>
                <button
                    className="btn btn-primary new-btn"
                    onClick={onOpenForm}
                >
                    + New Student
                </button>
            </header>
            <div className="actions-row">
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        navigate("/archived?type=students");
                        localStorage.setItem("archiveType", "students");
                    }}
                >
                    View Archived Students
                </button>
                <div className="filters">
                    <div className="search">
                        <span className="icon">🔎</span>
                        <input
                            className="search-input"
                            placeholder="Search by name..."
                            value={filters.search}
                            onChange={(e) =>
                                setFilters({
                                    ...filters,
                                    search: e.target.value,
                                })
                            }
                        />
                    </div>
                    <select
                        className="filter"
                        value={filters.department_id}
                        onChange={(e) =>
                            setFilters({
                                ...filters,
                                department_id: e.target.value,
                            })
                        }
                    >
                        <option value="">⚗ All Department</option>
                        {departments.map((d) => (
                            <option
                                key={d.department_id}
                                value={d.department_id}
                            >
                                {d.department_name}
                            </option>
                        ))}
                    </select>
                    <select
                        className="filter"
                        value={filters.course_id}
                        onChange={(e) =>
                            setFilters({
                                ...filters,
                                course_id: e.target.value,
                            })
                        }
                    >
                        <option value="">⚗ All Course</option>
                        {courses.map((c) => (
                            <option key={c.course_id} value={c.course_id}>
                                {c.course_name}
                            </option>
                        ))}
                    </select>
                    <select
                        className="filter"
                        value={filters.academic_year_id}
                        onChange={(e) =>
                            setFilters({
                                ...filters,
                                academic_year_id: e.target.value,
                            })
                        }
                    >
                        <option value="">⚗ All Academic Year</option>
                        {academicYears.map((a) => (
                            <option
                                key={a.academic_year_id}
                                value={a.academic_year_id}
                            >
                                {a.school_year}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="table-wrapper">
                <table className="students-table">
                    <thead>
                        <tr>
                            <th>Student Name</th>
                            <th>Department</th>
                            <th>Course</th>
                            <th>Year Level</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((s) => (
                            <tr key={s.student_id}>
                                <td>
                                    {s.fullName ||
                                        `${s.f_name} ${
                                            s.m_name ? s.m_name + " " : ""
                                        }${s.l_name}`}
                                </td>
                                <td>{s.department?.department_name || "-"}</td>
                                <td>{s.course?.course_name || "-"}</td>
                                <td>{s.year_level || "-"}</td>
                                <td>
                                    <span
                                        className={`badge ${
                                            s.status === "active"
                                                ? "badge-success"
                                                : "badge-warning"
                                        }`}
                                    >
                                        {s.status}
                                    </span>
                                </td>
                                <td>
                                    <button
                                        className="btn btn-light"
                                        onClick={() => onOpenEditForm(s)}
                                    >
                                        ✎ Edit
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() =>
                                            handleDelete(s.student_id)
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
            <div className="table-blank" />
            {showForm && (
                <div className="modal-overlay">
                    <div className="modal-card">{renderModalContent()}</div>
                </div>
            )}
            {error && <div className="alert-error">{error}</div>}
        </div>
    );
}

export default Students;
