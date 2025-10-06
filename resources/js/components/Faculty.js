import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../sass/faculty.scss';

function Faculty() {
    const [faculty, setFaculty] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFetching, setIsFetching] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [modalContentState, setModalContentState] = useState('form'); // 'form' | 'loading' | 'success'
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [editingId, setEditingId] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
        department_id: '',
        archived: false
    });
    const [formData, setFormData] = useState({
        f_name: '',
        m_name: '',
        l_name: '',
        suffix: '',
        date_of_birth: '',
        sex: 'male',
        phone_number: '',
        email_address: '',
        address: '',
        department_id: ''
    });
    const [message, setMessage] = useState('');

    const closeModalAndReset = () => {
        setShowForm(false);
        setModalContentState('form');
        setEditingId(null);
        if (message.includes('Error')) {
             setMessage('');
        }
    };

    useEffect(() => {
        loadDepartments();
        loadFaculty();
        // Do not auto-reload on each filter change to avoid constant spinners
    }, []);

    const loadFaculty = async () => {
        if (!loading && !isSaving) setIsFetching(true); 

        try {
            const params = new URLSearchParams();
            if (filters.search) params.set('search', filters.search);
            if (filters.department_id) params.set('department_id', filters.department_id);
            if (filters.archived) params.set('archived', 'true');
            const qs = params.toString();
            const url = '/api/admin/faculty' + (qs ? ('?' + qs) : '');
            const r = await axios.get(url);
            setFaculty(r.data);
        } catch (error) {
            console.error('Error loading faculty:', error);
            setMessage('Error loading faculty list.');
        } finally {
            setLoading(false);
            setIsFetching(false);
        }
    };

    const loadDepartments = async () => {
        try {
            const r = await axios.get('/api/admin/departments');
            setDepartments(r.data);
        } catch (error) {
            console.error('Error loading departments:', error);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setModalContentState('loading');
        setIsSaving(true);
        setErrors({});
        
        try {
            const payload = {
                ...formData,
                department_id: formData.department_id ? Number(formData.department_id) : undefined,
            };
            let saved;
            if (editingId) {
                const r = await axios.put(`/api/admin/faculty/${editingId}`, payload);
                saved = r.data;
                // Optimistically update list without full table reload
                setFaculty(prev => prev.map(f => (f.faculty_id === saved.faculty_id ? saved : f)));
            } else {
                const r = await axios.post('/api/admin/faculty', payload);
                saved = r.data;
                // Optimistically prepend new item
                setFaculty(prev => [saved, ...prev]);
            }

            setTimeout(() => {
                setModalContentState('success');
            }, 400);
        } catch (error) {
            console.error('Error saving faculty:', error);
            if (error?.response?.status === 422 && error?.response?.data?.errors) {
                setErrors(error.response.data.errors);
                setModalContentState('form');
            } else {
                setMessage(editingId ? 'Error updating faculty member.' : 'Error adding new faculty member.');
                setModalContentState('form');
            }
        } finally {
            setIsSaving(false);
        }
    };

    const onOpenForm = () => {
        setEditingId(null);
        setShowForm(true);
        setModalContentState('form');
        setFormData({
            f_name: '', m_name: '', l_name: '', suffix: '', date_of_birth: '',
            sex: 'male', phone_number: '', email_address: '', address: '',
            department_id: ''
        });
        setMessage('');
    };

    const handleArchiveFaculty = async (facultyId) => {
        if (window.confirm('Are you sure you want to archive this faculty member?')) {
            try {
                await axios.post(`/api/admin/faculty/${facultyId}/archive`);
                setMessage('Faculty member archived successfully! 📦');
                loadFaculty();
            } catch (error) {
                console.error('Error archiving faculty:', error);
                setMessage('Error archiving faculty member');
            }
        }
    };

    const openEditModal = (faculty) => {
        const formatDate = (dateString) => {
            if (!dateString) return '';
            const date = new Date(dateString); 
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        setEditingId(faculty.faculty_id);
        setShowForm(true);
        setModalContentState('form');
        setMessage('');
        setFormData({
            f_name: faculty.f_name || '',
            m_name: faculty.m_name || '',
            l_name: faculty.l_name || '',
            suffix: faculty.suffix || '',
            date_of_birth: formatDate(faculty.date_of_birth), 
            sex: faculty.sex || 'male',
            phone_number: faculty.phone_number || '',
            email_address: faculty.email_address || '',
            address: faculty.address || '',
            department_id: String(faculty.department_id) || '' 
        });
    };

    if (loading) {
        return <div className="page initial-load">Loading...</div>;
    }

    return (
        <div className="page">
            <header className="page-header">
                <h1 className="page-title">Faculty</h1>
                <p className="page-subtitle">Manage Faculty Information</p>
                <button 
                    className="btn btn-primary new-btn" 
                    onClick={onOpenForm}
                >
                    + New Member
                </button>
            </header>

            <div className="actions-row">
                <label className="checkbox-pill">
                    <input 
                        type="checkbox" 
                        checked={filters.archived}
                        onChange={(e) => handleFilterChange('archived', e.target.checked)}
                    />
                    <span>Archived Faculty</span>
                </label>
                <div className="filters">
                    <div className="search">
                        <span className="icon">🔎</span>
                        <input 
                            className="search-input" 
                            placeholder="Search here..." 
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>
                    <select 
                        className="filter"
                        value={filters.department_id}
                        onChange={(e) => handleFilterChange('department_id', e.target.value)}
                    >
                        <option value="">All Department</option>
                        {departments.map(dept => (
                            <option key={dept.department_id} value={dept.department_id}>
                                {dept.department_name}
                            </option>
                        ))}
                    </select>
                   
                </div>
            </div>

            {message && (
                <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
                    {message}
                </div>
            )}
            
            <div className="table-wrapper">
                {isFetching && (
                    <div className="fetching-overlay">
                        <div className="spinner-border small-spinner" role="status">
                            <span className="sr-only">Loading...</span>
                        </div>
                    </div>
                )}
                <table className="faculty-table">
                    <thead>
                        <tr>
                            <th>Faculty Name</th>
                            <th>Department</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {faculty.length > 0 ? (
                            faculty.map((member) => (
                                <tr key={member.faculty_id}>
                                    <td>{member.f_name} {member.l_name}</td>
                                    <td>{member.department?.department_name || 'N/A'}</td>
                                    <td>
                                        <button 
                                            className="btn btn-light"
                                            onClick={() => openEditModal(member)}
                                        >
                                            ✎ Edit
                                        </button>
                                        <button 
                                            className="btn btn-success"
                                            onClick={() => handleArchiveFaculty(member.faculty_id)}
                                        >
                                            ⬇ Archive
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>
                                    No faculty members found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="table-blank" />

            {showForm && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        {modalContentState === 'loading' ? (
                            <div className="loading-overlay">
                                <div className="spinner-border large-spinner" role="status">
                                    <span className="sr-only">Loading...</span>
                                </div>
                                <p style={{ marginTop: '15px', color: '#4f46e5', fontWeight: '500' }}>
                                    {editingId ? 'Updating Faculty Data...' : 'Saving New Faculty Data...'}
                                </p>
                            </div>
                        ) : modalContentState === 'success' ? (
                            <div className="success-content">
                                <div className="success-icon-wrapper">
                                    <svg className="success-icon-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                                        <path className="success-check-path" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                                    </svg>
                                </div>
                                <h4 className="success-title">Success!</h4>
                                <p className="success-subtitle">{editingId ? 'Faculty record has been updated.' : 'New faculty has been successfully added.'}</p>
                                <button className="btn btn-primary btn-close-message" onClick={closeModalAndReset}>Done</button>
                            </div>
                        ) : (
                        <>
                        {/* Conditional Header for Add/Edit to match images */}
                        {editingId ? (
                            <h3 className="modal-header-title">Edit Faculty</h3>
                        ) : (
                            <div className="modal-header-add">
                                <h3 className="modal-header-title">Add New Faculty</h3>
                                <p className="modal-header-subtitle">Enter faculty details to add them to the system</p>
                            </div>
                        )}
                        
                        {Object.keys(errors).length > 0 && (
                            <div className="message error" style={{ margin: '0 30px 10px' }}>
                                {Object.entries(errors).map(([field, msgs]) => (
                                    <div key={field}>{Array.isArray(msgs) ? msgs[0] : String(msgs)}</div>
                                ))}
                            </div>
                        )}
                        <form onSubmit={onSubmit}>
                            <div className="modal-body">
                                {/* Department field - always first in add mode */}
                                {!editingId && (
                                    <div className="form-group">
                                        <label>Department:</label>
                                        <select 
                                            name="department_id" 
                                            value={formData.department_id}
                                            onChange={handleInputChange}
                                            required // Make required only for adding, not always for editing
                                        >
                                            <option value="">Select Department</option>
                                            {departments.map(dept => (
                                                <option key={dept.department_id} value={dept.department_id}>
                                                    {dept.department_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Individual form groups for single column layout */}
                                <div className="form-group">
                                    <label>First Name {editingId && "*"}</label>
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
                                    <label>Last Name {editingId && "*"}</label>
                                    <input 
                                        type="text" 
                                        name="l_name" 
                                        value={formData.l_name}
                                        onChange={handleInputChange}
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Suffix Name:</label> {/* Label changed to match Image 2 */}
                                    <input 
                                        type="text" 
                                        name="suffix" 
                                        value={formData.suffix}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                {/* Two-column layout for Date of Birth & Sex */}
                                <div className="form-row inline">
                                    <div className="form-group">
                                        <label>Date of Birth:</label>
                                        <input 
                                            type="date" 
                                            name="date_of_birth" 
                                            value={formData.date_of_birth}
                                            onChange={handleInputChange}
                                            required={!editingId} // Required only for adding
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Sex:</label>
                                        <select 
                                            name="sex" 
                                            value={formData.sex}
                                            onChange={handleInputChange}
                                            required={!editingId} // Required only for adding
                                        >
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Two-column layout for Phone Number & Department (as "Position" in image) */}
                                <div className="form-row inline">
                                    <div className="form-group">
                                        <label>Phone Number:</label>
                                        <input 
                                            type="tel" 
                                            name="phone_number" 
                                            value={formData.phone_number}
                                            onChange={handleInputChange}
                                            required={!editingId} // Required only for adding
                                        />
                                    </div>
                                    {/* For consistency, we will keep Department here for both Add and Edit, 
                                        even though "Position" is in the image. You can rename this field 
                                        if "Position" is a different database field. */}
                                    <div className="form-group">
                                        <label>Department:</label> 
                                        <select 
                                            name="department_id" 
                                            value={formData.department_id}
                                            onChange={handleInputChange}
                                            required={!editingId} // Required only for adding
                                        >
                                            <option value="">Select Department</option>
                                            {departments.map(dept => (
                                                <option key={dept.department_id} value={dept.department_id}>
                                                    {dept.department_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Email Address:</label>
                                    <input 
                                        type="email" 
                                        name="email_address" 
                                        value={formData.email_address}
                                        onChange={handleInputChange}
                                        required={!editingId} // Required only for adding
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Address:</label>
                                    <textarea 
                                        name="address" 
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        required={!editingId} // Required only for adding
                                    />
                                </div>
                                
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingId ? 'Submit' : 'Submit'} {/* Changed to 'Submit' to match Image 2 */}
                                </button>
                            </div>
                        </form>
                        </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
} 

export default Faculty;