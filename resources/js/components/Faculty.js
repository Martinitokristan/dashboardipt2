import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BsSearch } from "react-icons/bs";
import "../../sass/faculty.scss";

function Faculty() {
    const [faculty, setFaculty] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [modalContentState, setModalContentState] = useState("form"); // form | loading | success | error
    const [modalMessage, setModalMessage] = useState("");
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
        position: "Dean",
        status: "active",
    });

    const loadFaculty = async () => {
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

    const closeModalAndReset = async () => {
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
            position: "Dean",
            status: "active",
        });
        // Reload table after closing success modal
        await loadFaculty();
    };

    useEffect(() => {
        const initialLoad = async () => {
            await loadDepartments();
            await loadFaculty();
            setInitialLoading(false);
        };
        initialLoad();
    }, []);

    useEffect(() => {
        if (!initialLoading) {
            loadFaculty();
        }
    }, [filters]);

    if (initialLoading) {
        return (
            <div className="page-loading">
                <div className="spinner"></div>
                <p>Loading Faculty...</p>
            </div>
        );
    }

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
            const payload = {
                ...formData,
                department_id: formData.department_id || null,
            };
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
                setModalContentState("success");
            }
        } catch (error) {
            console.error("Save error:", error);
            setModalContentState("error");
            setModalMessage(
                error.response?.data?.error ||
                    error.response?.data?.message ||
                    "Failed to save faculty"
            );
            if ([401, 403].includes(error.response?.status)) {
                window.location.href = "/login";
            }
        }
    };

    const handleArchive = async (id) => {
        if (!confirm("Are you sure you want to archive this faculty?")) return;
        try {
            await axios.post(`/api/admin/faculty/${id}/archive`);
            setModalMessage("Faculty has been successfully archived.");
            setModalContentState("success");
            setShowForm(true);
        } catch (error) {
            console.error("Archive error:", error);
            setModalMessage(
                error.response?.data?.message || "Failed to archive faculty"
            );
            setModalContentState("error");
            setShowForm(true);
            if ([401, 403].includes(error.response?.status)) {
                window.location.href = "/login";
            }
        }
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
            position: facultyMember.position || "Dean",
            status: facultyMember.status || "active",
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
                            width="52"
                            height="52"
                            viewBox="0 0 52 52"
                        >
                            <path
                                fill="none"
                                stroke="#ffffff"
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M16 28 L24 36 L40 20"
                            />
                        </svg>
                    </div>

                    <h4 className="success-title">Success!</h4>
                    <p className="success-subtitle">
                        {modalMessage ||
                            (editingId
                                ? "Faculty record has been updated."
                                : "New faculty has been successfully added.")}
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

        if (modalContentState === "error") {
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
                    <p className="error-subtitle">
                        {modalMessage || "An error occurred. Please try again."}
                    </p>
                    <button
                        className="btn btn-danger btn-close-message"
                        onClick={closeModalAndReset}
                    >
                        Close
                    </button>
                </div>
            );
        }

        return (
            <>
                <div className="modal-header-new">
                    <h3 className="modal-title-new">
                        {editingId ? "Edit Faculty" : "Add New Faculty"}
                    </h3>
                    <p className="modal-subtitle-new">
                        {editingId
                            ? "Update faculty details below"
                            : "Enter faculty details to add them to the system"}
                    </p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-grid-new">
                        <label className="form-label-new">Department</label>
                        <select
                            className="form-input-new"
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

                        <label className="form-label-new">Position</label>
                        <select
                            className="form-input-new"
                            name="position"
                            value={formData.position}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="Dean">Dean</option>
                            <option value="Instructor">Instructor</option>
                            <option value="Part-time">Part-time</option>
                            <option value="Department Head">
                                Department Head
                            </option>
                        </select>

                        <label className="form-label-new">First Name</label>
                        <input
                            className="form-input-new"
                            placeholder="First Name"
                            name="f_name"
                            value={formData.f_name}
                            onChange={handleInputChange}
                            required
                        />

                        <label className="form-label-new">MI.Name</label>
                        <input
                            className="form-input-new"
                            placeholder="Middle Name"
                            name="m_name"
                            value={formData.m_name}
                            onChange={handleInputChange}
                        />

                        <label className="form-label-new">Last Name</label>
                        <input
                            className="form-input-new"
                            placeholder="Last Name"
                            name="l_name"
                            value={formData.l_name}
                            onChange={handleInputChange}
                            required
                        />

                        <label className="form-label-new">Suffix</label>
                        <input
                            className="form-input-new"
                            placeholder="Suffix"
                            name="suffix"
                            value={formData.suffix}
                            onChange={handleInputChange}
                        />

                        <label className="form-label-new">Date Birth</label>
                        <input
                            className="form-input-new"
                            type="date"
                            name="date_of_birth"
                            value={formData.date_of_birth}
                            onChange={handleInputChange}
                            required
                        />

                        <label className="form-label-new">Sex</label>
                        <select
                            className="form-input-new"
                            name="sex"
                            value={formData.sex}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>

                        <label className="form-label-new">Phone No.</label>
                        <input
                            className="form-input-new"
                            placeholder="09XXXXXXXXX"
                            name="phone_number"
                            value={formData.phone_number}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "");
                                if (value.length <= 11) {
                                    handleInputChange({
                                        target: {
                                            name: "phone_number",
                                            value: value,
                                        },
                                    });
                                }
                            }}
                            type="tel"
                            pattern="09[0-9]{9}"
                            maxLength="11"
                            title="Please enter a valid Philippine mobile number (11 digits starting with 09)"
                            required
                        />

                        <label className="form-label-new">Status</label>
                        <select
                            className="form-input-new"
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>

                        <label className="form-label-new">Email</label>
                        <input
                            className="form-input-new"
                            placeholder="Email Address"
                            name="email_address"
                            value={formData.email_address}
                            onChange={handleInputChange}
                            type="email"
                            required
                        />

                        <label className="form-label-new full-width-label">
                            Address
                        </label>
                        <input
                            className="form-input-new full-width-input"
                            placeholder="Address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            required
                        />

                        {error && (
                            <div className="alert-error full-width-error">
                                {error}
                            </div>
                        )}
                    </div>

                    <div className="modal-footer-new">
                        <button
                            type="button"
                            className="btn btn-cancel-new"
                            onClick={closeModalAndReset}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-save-new">
                            {editingId ? "Save Changes" : "Save Profile"}
                        </button>
                    </div>
                </form>
            </>
        );
    };

    return (
        <div className="page">
            <div className="page-card">
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
                    <div
                        className="filters"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "24px",
                        }}
                    >
                        <div
                            className="search"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                width: "260px",
                                background: "#fff",
                                borderRadius: "10px",
                                border: "1px solid #e5e7eb",
                                padding: "0 12px",
                            }}
                        >
                            <BsSearch
                                className="icon"
                                style={{ marginRight: 8, fontSize: 18 }}
                            />
                            <input
                                className="search-input"
                                style={{
                                    border: "none",
                                    outline: "none",
                                    width: "100%",
                                    fontSize: "1rem",
                                    background: "transparent",
                                }}
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
                            style={{ minWidth: 180 }}
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
                                <th>Faculty Name</th>
                                <th>Department</th>
                                <th>Position</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {faculty.map((f) => (
                                <tr key={f.faculty_id}>
                                    <td>{`${f.f_name} ${
                                        f.m_name ? f.m_name + " " : ""
                                    }${f.l_name}${
                                        f.suffix ? ", " + f.suffix : ""
                                    }`}</td>
                                    <td>{f.department?.department_name || "-"}</td>
                                    <td>{f.position || "-"}</td>
                                    <td>
                                        <span
                                            className={`badge ${
                                                f.status === "active"
                                                    ? "badge-success"
                                                    : "badge-danger"
                                            }`}
                                        >
                                            {f.status || "active"}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-light"
                                            onClick={() => onOpenEditForm(f)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn btn-success"
                                            onClick={() =>
                                                handleArchive(f.faculty_id)
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
        </div>
    );
}

export default Faculty;
