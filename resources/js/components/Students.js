import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../sass/students.scss';

function Students() {
    const [courses, setCourses] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [students, setStudents] = useState([]);
    // Removed successMessage state and replaced it with modalContentState
    const [modalContentState, setModalContentState] = useState('form'); // 'form', 'loading', or 'success'
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    
    // isLoading state is no longer needed, as modalContentState handles it
    // const [isLoading, setIsLoading] = useState(false); 
    
    const [form, setForm] = useState({
        f_name: '',
        m_name: '',
        l_name: '',
        suffix: '',
        date_of_birth: '',
        sex: 'male',
        phone_number: '',
        email_address: '',
        address: '',
        status: 'active',
        department_id: '',
        course_id: ''
    });

    // Close the entire modal and reset state
    const closeModalAndReset = () => {
        setShowForm(false);
        setModalContentState('form');
    };

    useEffect(() => {
        axios.get('/api/admin/courses').then(r => setCourses(r.data));
        axios.get('/api/admin/departments').then(r => setDepartments(r.data));
        axios.get('/api/admin/academic-years').then(r => setAcademicYears(r.data));
        refresh();
    }, []);

    const [filters, setFilters] = useState({ search: '', department_id: '', course_id: '', academic_year_id: '' });

    const refresh = async () => {
        const params = new URLSearchParams();
        if (filters.search) params.set('search', filters.search);
        if (filters.department_id) params.set('department_id', filters.department_id);
        if (filters.course_id) params.set('course_id', filters.course_id);
        if (filters.academic_year_id) params.set('academic_year_id', filters.academic_year_id);
        const qs = params.toString();
        const url = '/api/admin/students' + (qs ? ('?' + qs) : '');
        const r = await axios.get(url);
        setStudents(r.data);
    };

    useEffect(() => { refresh(); }, [filters]);

    const onOpenForm = () => {
        setEditingId(null);
        setShowForm(true);
        setModalContentState('form'); // Always show the form when opening for a new student
        setForm({
            f_name: '',
            m_name: '',
            l_name: '',
            suffix: '',
            date_of_birth: '',
            sex: 'male',
            phone_number: '',
            email_address: '',
            address: '',
            status: 'active',
            department_id: '',
            course_id: ''
        });
    };

    const onOpenEditForm = (student) => {

        const formatDate = (dateString) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
        };

        setEditingId(student.student_id);
        setShowForm(true);
        setModalContentState('form'); // Always show the form when opening for editing
        setForm({
            f_name: student.f_name || '',
            m_name: student.m_name || '',
            l_name: student.l_name || '',
            suffix: student.suffix || '',
            date_of_birth: formatDate(student.date_of_birth),
            sex: student.sex || 'male',
            phone_number: student.phone_number || '',
            email_address: student.email_address || '',
            address: student.address || '',
            status: student.status || 'active',
            department_id: student.department_id || '',
            course_id: student.course_id || ''
        });
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        
        // 1. Start Loading State
        setModalContentState('loading');
        
        const successMessage = editingId ? 'Student updated successfully!' : 'New student added successfully!';

        try {
            if (editingId) {
                await axios.put(`/api/admin/students/${editingId}`, form);
            } else {
                await axios.post('/api/admin/students', form);
            }

            await refresh();
            
            // 2. Transition to Success State
            setTimeout(() => {
                setModalContentState('success');
            }, 500); // Small delay for visual effect

        } catch (error) {
            console.error('Error saving student:', error);
            // On error, revert back to the form or close the modal
            closeModalAndReset(); 
            // In a real app, you'd show an error message here.
        }
    };
    
    // Utility function to render the correct modal content
    const renderModalContent = () => {
        if (modalContentState === 'loading') {
            return (
                <div className="loading-overlay">
                    <div className="spinner-border large-spinner" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                    <p style={{ marginTop: '15px', color: '#4f46e5', fontWeight: '500' }}>
                        {editingId ? 'Updating Student Data...' : 'Saving New Student Data...'}
                    </p>
                </div>
            );
        }

        if (modalContentState === 'success') {
            return (
                <div className="success-content">
                    <div className="success-icon-wrapper">
                        <svg className="success-icon-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                            <path className="success-check-path" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                        </svg>
                    </div>
                    <h4 className="success-title">Success!</h4>
                    <p className="success-subtitle">{editingId ? 'Student record has been updated.' : 'New student has been successfully added.'}</p>
                    <button className="btn btn-primary btn-close-message" onClick={closeModalAndReset}>Done</button>
                </div>
            );
        }
        
        // Default: 'form'
        return (
            <>
                <h3 style={{ marginTop: 0, color: '#374151' }}>{editingId ? 'Edit Student' : 'Add Student'}</h3>
                <form onSubmit={onSubmit}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {/* Form Inputs (Same as before) - Truncated for brevity */}
                        <input 
                            className="form-input" 
                            placeholder="Email" 
                            value={form.email_address} 
                            onChange={(e) => setForm({ 
                                ...form, 
                                email_address: e.target.value 
                            })} 
                            type="email" 
                            required 
                        />
                        <input 
                            className="form-input" 
                            placeholder="First name" 
                            value={form.f_name} 
                            onChange={(e) => setForm({ 
                                ...form, 
                                f_name: e.target.value 
                            })} 
                            required 
                        />
                        <input 
                            className="form-input" 
                            placeholder="Middle name" 
                            value={form.m_name} 
                            onChange={(e) => setForm({ 
                                ...form, 
                                m_name: e.target.value 
                            })} 
                        />
                        <input 
                            className="form-input" 
                            placeholder="Last name" 
                            value={form.l_name} 
                            onChange={(e) => setForm({ 
                                ...form, 
                                l_name: e.target.value 
                            })} 
                            required 
                        />
                        <input 
                            className="form-input" 
                            placeholder="Suffix" 
                            value={form.suffix} 
                            onChange={(e) => setForm({ 
                                ...form, 
                                suffix: e.target.value 
                            })} 
                        />
                        <input 
                            className="form-input" 
                            placeholder="Date of birth" 
                            value={form.date_of_birth} 
                            onChange={(e) => setForm({ 
                                ...form, 
                                date_of_birth: e.target.value 
                            })} 
                            type="date" 
                            required 
                        />
                        <select 
                            className="form-input" 
                            value={form.sex} 
                            onChange={(e) => setForm({ 
                                ...form, 
                                sex: e.target.value 
                            })}
                        >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                        <input 
                            className="form-input" 
                            placeholder="Phone number" 
                            value={form.phone_number} 
                            onChange={(e) => setForm({ 
                                ...form, 
                                phone_number: e.target.value 
                            })} 
                            required 
                        />
                        <input 
                            className="form-input" 
                            placeholder="Address" 
                            value={form.address} 
                            onChange={(e) => setForm({ 
                                ...form, 
                                address: e.target.value 
                            })} 
                            required 
                        />
                        <select 
                            className="form-input" 
                            value={form.department_id} 
                            onChange={(e) => setForm({ 
                                ...form, 
                                department_id: e.target.value 
                            })} 
                            required
                        >
                            <option value="" disabled>Select Department</option>
                            {departments.map(d => (
                                <option key={d.department_id} value={d.department_id}>{d.department_name}</option>
                            ))}
                        </select>
                        <select 
                            className="form-input" 
                            value={form.course_id} 
                            onChange={(e) => setForm({ 
                                ...form, 
                                course_id: e.target.value 
                            })} 
                            required
                        >
                            <option value="" disabled>Select Course</option>
                            {courses.map(c => (
                                <option key={c.course_id} value={c.course_id}>{c.course_name}</option>
                            ))}
                        </select>
                        <select 
                            className="form-input" 
                            value={form.status} 
                            onChange={(e) => setForm({ 
                                ...form, 
                                status: e.target.value 
                            })}
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="graduated">Graduated</option>
                            <option value="dropped">Dropped</option>
                        </select>
                    </div>
                    <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                        <button className="btn" type="button" onClick={() => setShowForm(false)}>Cancel</button>
                        <button className="btn btn-primary" type="submit">
                            {editingId ? 'Update Student' : 'Add Student'}
                        </button>
                    </div>
                </form>
            </>
        );
    };

    return (
        <div className="page">
            <header className="page-header">
                <h1 className="page-title">Students</h1>
                <p className="page-subtitle">Manage Student Information</p>
                <button className="btn btn-primary new-btn" onClick={onOpenForm}>+ New Student</button>
            </header>
            
            {/* The separate successMessage modal is removed here */}

            {/* Filters / Actions */}
            <div className="actions-row">
                <label className="checkbox-pill">
                    <input type="checkbox" />
                    <span>Archived Students</span>
                </label>
                <div className="filters">
                    <div className="search">
                        <span className="icon">🔎</span>
                        <input className="search-input" placeholder="Search here..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} onBlur={refresh} />
                    </div>
                    <select className="filter" value={filters.department_id} onChange={(e) => {
                        const nextDepartment = e.target.value;
                        setFilters({ ...filters, department_id: nextDepartment, course_id: '' });
                    }}>
                        <option value="">⚗ All Department</option>
                        {departments.map(d => (
                            <option key={d.department_id} value={d.department_id}>{d.department_name}</option>
                        ))}
                    </select>
                    <select className="filter" value={filters.course_id} onChange={(e) => {
                        setFilters({ ...filters, course_id: e.target.value });
                    }}>
                        <option value="">⚗ All Course</option>
                        {courses.map(c => (
                            <option key={c.course_id} value={c.course_id}>{c.course_name}</option>
                        ))}
                    </select>
                    <select className="filter" value={filters.academic_year_id} onChange={(e) => { setFilters({ ...filters, academic_year_id: e.target.value }); }}>
                        <option value="">⚗ All Academic Year</option>
                        {academicYears.map(a => (
                            <option key={a.academic_year_id} value={a.academic_year_id}>{a.school_year}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Students Table */}
            <div className="table-wrapper">
                <table className="students-table">
                    <thead>
                        <tr>
                            <th>Student Name</th>
                            <th>Department</th>
                            <th>Course</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(s => (
                            <tr key={s.student_id}>
                                <td>{`${s.f_name} ${s.m_name ? s.m_name + ' ' : ''}${s.l_name}`}</td>
                                <td>{s.department?.department_name || '-'}</td>
                                <td>{s.course?.course_name || '-'}</td>
                                <td><span className="badge badge-success">{s.status}</span></td>
                                <td>
                                    <button className="btn btn-light" onClick={() => onOpenEditForm(s)}>✎ Edit</button>
                                    <button className="btn btn-success">⬇ Archive</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="table-blank" />

            {/* Unified Modal for Form, Loading, and Success */}
            {showForm && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        {renderModalContent()}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Students;