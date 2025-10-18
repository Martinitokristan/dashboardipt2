import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../sass/faculty.scss";

const getCsrfCookie = async () => {
    try {
        await axios.get("/sanctum/csrf-cookie");
    } catch (e) {
        console.error("Failed to get CSRF cookie", e);
    }
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
            console.error("Failed to load faculty", error);
            setError("Failed to load faculty");
            if ([401, 403].includes(error.response?.status)) {
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
            console.error("Failed to load departments", error);
            setError("Failed to load departments");
            if ([401, 403].includes(error.response?.status)) {
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
            await getCsrfCookie();
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
            if ([200, 201].includes(response.status)) {
                await loadFaculty();
                setModalContentState("success");
            }
        } catch (error) {
            console.error("Save error:", error);
            setError(error.response?.data?.message || "Failed to save faculty");
            setModalContentState("form");
            if ([401, 403].includes(error.response?.status)) {
                window.location.href = "/login";
            }
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to archive this faculty?")) return;
        try {
            await getCsrfCookie();
            await axios.post(`/api/admin/faculty/${id}/archive`);
            await loadFaculty();
        } catch (error) {
            console.error("Archive error:", error);
            setError(
                error.response?.data?.message || "Failed to archive faculty"
            );
            if ([401, 403].includes(error.response?.status)) {
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
        setModalContentState("form");
    };

    const renderModalContent = () => {
        if (modalContentState === "loading") {
            return (
                <div className="loading-overlay">
                    <div
                        className="spinner-border large-spinner"
                        role="status"
                    ></div>
                    <p className="loading-text">
                        {editingId
                            ? "Updating Faculty Data..."
                            : "Saving New Faculty Data..."}
                    </p>
                </div>
            );
        }

        if (modalContentState === "success") {
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
                    <p className="success-subtitle">
                        {editingId
                            ? "Faculty record has been updated."
                            : "New faculty has been successfully added."}
                    </p>
                    <button
                        className="btn btn-primary btn-close-message"
                        onClick={closeModalAndReset}
                    >
                        Done
                    </button>
                </div>
            );
        }

        return (
            <>
                <div className="modal-header">
                    <h3 className="modal-header-title">
                        {editingId ? "Edit Faculty" : "Add New Faculty"}
                    </h3>
                    <p className="modal-header-subtitle">
                        {editingId
                            ? "Update faculty details below"
                            : "Fill out the information to add a new faculty member."}
                    </p>
                </div>
                <div className="modal-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-scroll-area">
                            <input
                                className="form-input"
                                placeholder="First Name"
                                name="f_name"
                                value={formData.f_name}
                                onChange={handleInputChange}
                                required
                            />
                            <input
                                className="form-input"
                                placeholder="Middle Name"
                                name="m_name"
                                value={formData.m_name}
                                onChange={handleInputChange}
                            />
                            <input
                                className="form-input"
                                placeholder="Last Name"
                                name="l_name"
                                value={formData.l_name}
                                onChange={handleInputChange}
                                required
                            />
                            <input
                                className="form-input"
                                placeholder="Suffix"
                                name="suffix"
                                value={formData.suffix}
                                onChange={handleInputChange}
                            />
                            <input
                                className="form-input"
                                type="date"
                                placeholder="Date of Birth"
                                name="date_of_birth"
                                value={formData.date_of_birth}
                                onChange={handleInputChange}
                                required
                            />
                            <select
                                className="form-input"
                                name="sex"
                                value={formData.sex}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                            <input
                                className="form-input"
                                placeholder="Phone Number"
                                name="phone_number"
                                value={formData.phone_number}
                                onChange={handleInputChange}
                                required
                            />
                            <input
                                className="form-input"
                                placeholder="Email Address"
                                name="email_address"
                                value={formData.email_address}
                                onChange={handleInputChange}
                                type="email"
                                required
                            />
                            <input
                                className="form-input"
                                placeholder="Address"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                required
                            />
                            <select
                                className="form-input"
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
                            {error && (
                                <div className="alert-error">{error}</div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={closeModalAndReset}
                            >
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary">
                                {editingId ? "Update Faculty" : "Add Faculty"}
                            </button>
                        </div>
                    </form>
                </div>
            </>
        );
    };

    return (
        <div className="page">
            <header className="page-header">
                <div className="page-header-text">
                    <h1 className="page-title">Faculty</h1>
                    <p className="page-subtitle">Manage faculty profiles</p>
                </div>
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
                                        ✎ Edit
                                    </button>
                                    <button
                                        className="btn btn-primary"
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

            {showForm && (
                <div className="modal-overlay">
                    <div className="modal-card">{renderModalContent()}</div>
                </div>
            )}
        </div>
    );
}

export default Faculty;
