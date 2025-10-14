import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../sass/faculty.scss";

// Add this utility function
const getCsrfCookie = async () => {
    await axios.get("/sanctum/csrf-cookie", { withCredentials: true });
};

function Faculty() {
    const [faculty, setFaculty] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [modalContentState, setModalContentState] = useState("form");
    const [editingId, setEditingId] = useState(null);
    const [filters, setFilters] = useState({ search: "", department_id: "" });
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        f_name: "",
        m_name: "",
        l_name: "",
        suffix: "",
        date_of_birth: "",
        sex: "male",
        phone_number: "",
        email_address: "",
        address: "",
        department_id: "",
    });

    const closeModalAndReset = () => {
        setShowForm(false);
        setModalContentState("form");
        setEditingId(null);
        setError("");
        setFormData({
            f_name: "",
            m_name: "",
            l_name: "",
            suffix: "",
            date_of_birth: "",
            sex: "male",
            phone_number: "",
            email_address: "",
            address: "",
            department_id: "",
        });
    };

    useEffect(() => {
        loadDepartments();
        loadFaculty();
    }, [filters]);

    const loadFaculty = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.search) params.set("search", filters.search);
            if (filters.department_id)
                params.set("department_id", filters.department_id);
            const qs = params.toString();
            const url = "/api/admin/faculty" + (qs ? "?" + qs : "");
            const r = await axios.get(url);
            setFaculty(r.data.filter((f) => !f.archived_at));
        } catch (error) {
            setError("Failed to load faculty");
            if (
                error.response?.status === 401 ||
                error.response?.status === 403
            ) {
                window.location.href = "/login";
            }
        } finally {
            setLoading(false);
        }
    };

    const loadDepartments = async () => {
        try {
            const r = await axios.get("/api/admin/departments");
            setDepartments(r.data);
        } catch (error) {
            setError("Failed to load departments");
            if (
                error.response?.status === 401 ||
                error.response?.status === 403
            ) {
                window.location.href = "/login";
            }
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setModalContentState("loading");
        setError("");
        try {
            const payload = { ...formData };
            let response;
            if (editingId) {
                response = await axios.put(
                    `/api/admin/faculty/${editingId}`,
                    payload
                );
            } else {
                response = await axios.post("/api/admin/faculty", payload);
            }
            if (response.status === 200 || response.status === 201) {
                await loadFaculty();
                setModalContentState("success");
            }
        } catch (error) {
            setError(error.response?.data?.message || "Failed to save faculty");
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
        if (!confirm("Are you sure you want to archive this faculty?")) return;
        try {
            await getCsrfCookie(); // Fetch CSRF token
            await axios.post(
                `/api/admin/faculty/${id}/archive`,
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
            await loadFaculty();
        } catch (error) {
            setError(
                error.response?.data?.message || "Failed to archive faculty"
            );
            if (
                error.response?.status === 401 ||
                error.response?.status === 403
            ) {
                window.location.href = "/login";
            }
        }
    };

    const handleArchiveNavigate = () => {
        navigate("/archived?type=faculty");
        localStorage.setItem("archiveType", "faculty");
    };

    const onOpenEditForm = (facultyMember) => {
        setEditingId(facultyMember.faculty_id);
        setFormData({
            f_name: facultyMember.f_name,
            m_name: facultyMember.m_name || "",
            l_name: facultyMember.l_name,
            suffix: facultyMember.suffix || "",
            date_of_birth: facultyMember.date_of_birth,
            sex: facultyMember.sex,
            phone_number: facultyMember.phone_number,
            email_address: facultyMember.email_address,
            address: facultyMember.address,
            department_id: facultyMember.department_id || "",
        });
        setShowForm(true);
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
                            value={formData.f_name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Middle Name</label>
                        <input
                            type="text"
                            name="m_name"
                            value={formData.m_name}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Last Name</label>
                        <input
                            type="text"
                            name="l_name"
                            value={formData.l_name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Suffix</label>
                        <input
                            type="text"
                            name="suffix"
                            value={formData.suffix}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Date of Birth</label>
                        <input
                            type="date"
                            name="date_of_birth"
                            value={formData.date_of_birth}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Sex</label>
                        <select
                            name="sex"
                            value={formData.sex}
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
                            value={formData.phone_number}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            name="email_address"
                            value={formData.email_address}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Address</label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Department</label>
                        <select
                            name="department_id"
                            value={formData.department_id}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Select Department</option>
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
                            {editingId ? "Update Faculty" : "Add Faculty"}
                        </button>
                    </div>
                </form>
            </>
        );
    };

    return (
        <div className="page">
            <header className="page-header">
                <h1 className="page-title">Faculty</h1>
                <p className="page-subtitle">Manage faculty profiles</p>
                <button
                    className="btn btn-primary new-btn"
                    onClick={() => setShowForm(true)}
                >
                    + New Faculty
                </button>
            </header>
            <div className="actions-row">
                <button
                    className="btn btn-primary"
                    onClick={handleArchiveNavigate}
                >
                    View Archived Faculty
                </button>
                <div className="filters">
                    <div className="search">
                        <span className="icon">🔎</span>
                        <input
                            className="search-input"
                            placeholder="Search by name or email..."
                            value={filters.search}
                            onChange={(e) =>
                                handleFilterChange("search", e.target.value)
                            }
                            onBlur={loadFaculty}
                        />
                    </div>
                    <select
                        className="filter"
                        value={filters.department_id}
                        onChange={(e) =>
                            handleFilterChange("department_id", e.target.value)
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
            </div>
            <div className="table-wrapper">
                <table className="faculty-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Department</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {faculty.map((f) => (
                            <tr key={f.faculty_id}>
                                <td>{`${f.f_name} ${
                                    f.m_name ? f.m_name + " " : ""
                                }${f.l_name}`}</td>
                                <td>{f.department?.department_name || "-"}</td>
                                <td>
                                    <button
                                        className="btn btn-light"
                                        onClick={() => onOpenEditForm(f)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn btn-danger"
                                        onClick={() =>
                                            handleDelete(f.faculty_id)
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
        </div>
    );
}

export default Faculty;
