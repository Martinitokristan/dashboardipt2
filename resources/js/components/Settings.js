// resources/js/components/Settings.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../sass/settings.scss';

function Settings() {
    const [active, setActive] = useState(() => {
        try {
            return localStorage.getItem('settings_active_tab') || 'courses';
        } catch (_) { return 'courses'; }
    }); // courses | departments | academic-years
    const [courses, setCourses] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [showArchived, setShowArchived] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        course_name: '',
        department_name: '',
        department_head: '',
        department_id: ''
    });
    const [showEdit, setShowEdit] = useState(false);
    const [editType, setEditType] = useState(''); // course | department | academic-year
    const [editForm, setEditForm] = useState({});

    useEffect(() => {
        if (active === 'courses') {
            axios.get('/api/admin/courses').then(res => setCourses(res.data));
            axios.get('/api/admin/departments').then(res => setDepartments(res.data));
        } else if (active === 'departments') {
            const q = showArchived ? '?archived=1' : '';
            axios.get('/api/admin/departments' + q).then(res => setDepartments(res.data));
        } else if (active === 'academic-years') {
            axios.get('/api/admin/academic-years').then(res => setAcademicYears(res.data));
        }
    }, [active, showArchived]);

    const onOpenForm = () => {
        setShowForm(true);
        setForm({
            course_name: '',
            department_name: '',
            department_head: '',
            department_id: ''
        });
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (active === 'courses') {
            const payload = {
                course_name: form.course_name,
                department_id: form.department_id,
            };
            await axios.post('/api/admin/courses', payload);
            const res = await axios.get('/api/admin/courses');
            setCourses(res.data);
        } else if (active === 'departments') {
            const payload = {
                department_name: form.department_name,
                department_head: form.department_head || null,
                description: form.description || null
            };
            await axios.post('/api/admin/departments', payload);
            const q = showArchived ? '?archived=1' : '';
            const res = await axios.get('/api/admin/departments' + q);
            setDepartments(res.data);
        }
        setShowForm(false);
    };

    const toggleDepartmentArchive = async (department) => {
        if (!department) return;
        if (department.archived_at) {
            await axios.post(`/api/admin/departments/${department.department_id}/unarchive`);
        } else {
            await axios.post(`/api/admin/departments/${department.department_id}/archive`);
        }
        const q = showArchived ? '?archived=1' : '';
        const res = await axios.get('/api/admin/departments' + q);
        setDepartments(res.data);
    };

    const onOpenEdit = (type, item) => {
        setEditType(type);
        if (type === 'course') {
            setEditForm({ course_id: item.course_id, course_name: item.course_name, department_id: item.department_id || (item.department?.department_id || '') });
        } else if (type === 'department') {
            setEditForm({ department_id: item.department_id, department_name: item.department_name, department_head: item.department_head || '' });
        } else if (type === 'academic-year') {
            setEditForm({ academic_year_id: item.academic_year_id, school_year: item.school_year });
        }
        setShowEdit(true);
    };

    const onSubmitEdit = async (e) => {
        e.preventDefault();
        if (editType === 'course') {
            await axios.put(`/api/admin/courses/${editForm.course_id}`, {
                course_name: editForm.course_name,
                department_id: editForm.department_id,
            });
            const res = await axios.get('/api/admin/courses');
            setCourses(res.data);
        } else if (editType === 'department') {
            await axios.put(`/api/admin/departments/${editForm.department_id}`, {
                department_name: editForm.department_name,
                department_head: editForm.department_head || null,
                description: editForm.description || null,
            });
            const q = showArchived ? '?archived=1' : '';
            const res = await axios.get('/api/admin/departments' + q);
            setDepartments(res.data);
        } else if (editType === 'academic-year') {
            await axios.put(`/api/admin/academic-years/${editForm.academic_year_id}`, { school_year: editForm.school_year });
            const res = await axios.get('/api/admin/academic-years');
            setAcademicYears(res.data);
        }
        setShowEdit(false);
    };
    return (
        <div className="settings-content">
            <header className="page-header">
                <h1 className="page-title">Settings</h1>
                <p className="page-subtitle">Manage Settings</p>
            </header>

            <section className="tabs">
                <button className={`tab ${active === 'courses' ? 'active' : ''}`} onClick={() => { setActive('courses'); try { localStorage.setItem('settings_active_tab', 'courses'); } catch (_) {} }}>Courses</button>
                <button className={`tab ${active === 'departments' ? 'active' : ''}`} onClick={() => { setActive('departments'); try { localStorage.setItem('settings_active_tab', 'departments'); } catch (_) {} }}>Departments</button>
                <button className={`tab ${active === 'academic-years' ? 'active' : ''}`} onClick={() => { setActive('academic-years'); try { localStorage.setItem('settings_active_tab', 'academic-years'); } catch (_) {} }}>Academic Years</button>
            </section>

            <section className="card">
                <div className="card-header">
                    <h2 className="card-title">
                        {active === 'courses' && 'Courses'}
                        {active === 'departments' && 'Departments'}
                        {active === 'academic-years' && 'Academic Years'}
                    </h2>
                    <div className="header-actions">
                        {active === 'departments' && (
                            <button className="btn" onClick={() => setShowArchived(!showArchived)}>
                                {showArchived ? 'Hide Archived' : 'Show Archived'}
                            </button>
                        )}
                        <button className="btn btn-primary" onClick={onOpenForm}>
                            {active === 'courses' && '+ Add Course'}
                            {active === 'departments' && '+ Add Department'}
                            {active === 'academic-years' && '+ Add Academic Year'}
                        </button>
                    </div>
                </div>

                {/* Tables */}
                <div className="table-wrapper">
                    {active !== 'academic-years' && (
                        <table className="settings-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    {active === 'courses' && <th>Department</th>}
                                    {active === 'departments' && <th>Department Head</th>}
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {active === 'courses' && courses.map((c) => (
                                    <tr key={c.course_id}>
                                        <td>{c.course_name}</td>
                                        <td>{c.department?.department_name || '-'}</td>
                                        <td><span className="badge badge-success">{c.course_status === 'active' ? 'Active' : 'Inactive'}</span></td>
                                        <td>
                                            <button className="btn btn-light" onClick={() => onOpenEdit('course', c)}>Edit</button>
                                            <button className="btn btn-success">Archive</button>
                                        </td>
                                    </tr>
                                ))}
                                {active === 'departments' && departments.map((d) => (
                                    <tr key={d.department_id}>
                                        <td>{d.department_name}</td>
                                        <td>{d.department_head || '-'}</td>
                                        <td>
                                            {d.archived_at ? (
                                                <span className="badge">Archived</span>
                                            ) : (
                                                <span className="badge badge-success">Active</span>
                                            )}
                                        </td>
                                        <td>
                                            <button className="btn btn-light" onClick={() => onOpenEdit('department', d)}>Edit</button>
                                            <button className="btn btn-success" onClick={() => toggleDepartmentArchive(d)}>
                                                {d.archived_at ? 'Unarchive' : 'Archive'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {active === 'academic-years' && (
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
                                            <button className="btn btn-light" onClick={() => onOpenEdit('academic-year', a)}>Edit</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Create Form Modal */}
                {showForm && active === 'departments' && (
                    <div className="modal-overlay">
                        <div className="modal-card">
                            <h3 style={{ marginTop: 0, color: '#374151' }}>Add Department</h3>
                            <form onSubmit={onSubmit}>
                                <div style={{ display: 'grid', gap: 14 }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: 6 }}>Department Name</label>
                                        <input
                                            className="form-input"
                                            style={{ width: '100%', background: '#dedfe3' }}
                                            value={form.department_name}
                                            onChange={(e) => setForm({ ...form, department_name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: 6 }}>Department Head</label>
                                        <input
                                            className="form-input"
                                            style={{ width: '100%', background: '#dedfe3' }}
                                            value={form.department_head}
                                            onChange={(e) => setForm({ ...form, department_head: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                                    <button className="btn" type="button" onClick={() => setShowForm(false)}>Cancel</button>
                                    <button className="btn btn-primary" type="submit">Add Department</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Modal */}
                {showEdit && (
                    <div className="modal-overlay">
                        <div className="modal-card">
                            <h3 style={{ marginTop: 0, color: '#374151' }}>
                                {editType === 'course' && 'Edit Course'}
                                {editType === 'department' && 'Edit Department'}
                                {editType === 'academic-year' && 'Edit Academic Year'}
                            </h3>
                            <form onSubmit={onSubmitEdit}>
                                {editType === 'course' && (
                                    <div style={{ display: 'grid', gap: 14 }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: 6 }}>Course Name</label>
                                            <input className="form-input" style={{ width: '100%', background: '#dedfe3' }} value={editForm.course_name || ''} onChange={(e) => setEditForm({ ...editForm, course_name: e.target.value })} required />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: 6 }}>Department</label>
                                            <select className="form-input" value={editForm.department_id || ''} onChange={(e) => setEditForm({ ...editForm, department_id: e.target.value })} required>
                                                <option value="" disabled>Select department</option>
                                                {departments.map(d => (
                                                    <option key={d.department_id} value={d.department_id}>{d.department_name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}
                                {editType === 'department' && (
                                    <div style={{ display: 'grid', gap: 14 }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: 6 }}>Department Name</label>
                                            <input className="form-input" style={{ width: '100%', background: '#dedfe3' }} value={editForm.department_name || ''} onChange={(e) => setEditForm({ ...editForm, department_name: e.target.value })} required />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: 6 }}>Department Head</label>
                                            <input className="form-input" style={{ width: '100%', background: '#dedfe3' }} value={editForm.department_head || ''} onChange={(e) => setEditForm({ ...editForm, department_head: e.target.value })} />
                                        </div>
                                    </div>
                                )}
                                {editType === 'academic-year' && (
                                    <div style={{ display: 'grid', gap: 14 }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: 6 }}>School Year</label>
                                            <input className="form-input" style={{ width: '100%', background: '#dedfe3' }} value={editForm.school_year || ''} onChange={(e) => setEditForm({ ...editForm, school_year: e.target.value })} required />
                                        </div>
                                    </div>
                                )}
                                <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                                    <button className="btn" type="button" onClick={() => setShowEdit(false)}>Cancel</button>
                                    <button className="btn btn-primary" type="submit">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {showForm && active === 'courses' && (
                    <div className="modal-overlay">
                        <div className="modal-card">
                            <h3 style={{ marginTop: 0, color: '#374151' }}>Add Course</h3>
                            <form onSubmit={onSubmit}>
                                <div style={{ display: 'grid', gap: 14 }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: 6 }}>Course Name</label>
                                        <input
                                            className="form-input"
                                            style={{ width: '100%', background: '#dedfe3' }}
                                            value={form.course_name}
                                            onChange={(e) => setForm({ ...form, course_name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: 6 }}>Department</label>
                                        <select
                                            className="form-input"
                                            value={form.department_id || ''}
                                            onChange={(e) => setForm({ ...form, department_id: e.target.value })}
                                            required
                                        >
                                            <option value="" disabled>Select department</option>
                                            {departments.map(d => (
                                                <option key={d.department_id} value={d.department_id}>{d.department_name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                                    <button className="btn" type="button" onClick={() => setShowForm(false)}>Cancel</button>
                                    <button className="btn btn-primary" type="submit">Add Course</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}

export default Settings;


