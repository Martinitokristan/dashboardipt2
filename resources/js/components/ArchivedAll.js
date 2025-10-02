// resources/js/components/ArchivedAll.js
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import '../../sass/report.scss';

function ArchivedAll() {
    const [items, setItems] = useState([]);
    const [type, setType] = useState('all'); // all | students | faculty | departments | courses | academic_years
    const [filters, setFilters] = useState({
        course_id: '',
        department_id: '',
        academic_year_id: '',
        search: ''
    });
    const [courses, setCourses] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);

    useEffect(() => {
        // preload filter lists
        axios.get('/api/admin/courses').then(r => setCourses(r.data));
        axios.get('/api/admin/departments?archived=1').then(r => setDepartments(r.data));
        axios.get('/api/admin/academic-years').then(r => setAcademicYears(r.data));
    }, []);

    useEffect(() => {
        const params = new URLSearchParams();
        if (filters.course_id) params.set('course_id', filters.course_id);
        if (filters.department_id) params.set('department_id', filters.department_id);
        if (filters.academic_year_id) params.set('academic_year_id', filters.academic_year_id);
        if (filters.search) params.set('search', filters.search);
        if (type !== 'all') params.set('type', type);
        const qs = params.toString();
        const url = '/api/admin/archived' + (qs ? ('?' + qs) : '');
        axios.get(url).then(r => setItems(r.data));
    }, [type, filters]);

    const onUnarchive = async (row) => {
        const rowType = row._type;
        if (rowType === 'department') {
            await axios.post(`/api/admin/departments/${row.department_id}/unarchive`);
        } else if (rowType === 'course') {
            await axios.post(`/api/admin/courses/${row.course_id}/unarchive`);
        } else if (rowType === 'student') {
            await axios.post(`/api/admin/students/${row.student_id}/unarchive`);
        } else if (rowType === 'faculty') {
            await axios.post(`/api/admin/faculty/${row.faculty_id}/unarchive`);
        } else if (rowType === 'academic_year') {
            await axios.post(`/api/admin/academic-years/${row.academic_year_id}/unarchive`);
        }
        // reload
        const params = new URLSearchParams();
        if (filters.course_id) params.set('course_id', filters.course_id);
        if (filters.department_id) params.set('department_id', filters.department_id);
        if (filters.academic_year_id) params.set('academic_year_id', filters.academic_year_id);
        if (filters.search) params.set('search', filters.search);
        if (type !== 'all') params.set('type', type);
        const qs = params.toString();
        const url = '/api/admin/archived' + (qs ? ('?' + qs) : '');
        const r = await axios.get(url);
        setItems(r.data);
    };

    return (
        <div className="page">
            <header className="page-header">
                <h1 className="page-title">Archived</h1>
                <p className="page-subtitle">Trash bin with filters by type</p>
            </header>

            <div className="actions-row">
                <div className="filters" style={{ gap: 8, display: 'flex', alignItems: 'center' }}>
                    <select className="form-input" value={type} onChange={(e) => setType(e.target.value)}>
                        <option value="all">All Types</option>
                        <option value="students">Students</option>
                        <option value="faculty">Faculty</option>
                        <option value="departments">Departments</option>
                        <option value="courses">Courses</option>
                        <option value="academic_years">Academic Years</option>
                    </select>
                    <select className="form-input" value={filters.course_id} onChange={(e) => setFilters({ ...filters, course_id: e.target.value })}>
                        <option value="">All Courses</option>
                        {courses.map(c => (
                            <option key={c.course_id} value={c.course_id}>{c.course_name}</option>
                        ))}
                    </select>
                    <select className="form-input" value={filters.department_id} onChange={(e) => setFilters({ ...filters, department_id: e.target.value })}>
                        <option value="">All Departments</option>
                        {departments.map(d => (
                            <option key={d.department_id} value={d.department_id}>{d.department_name}</option>
                        ))}
                    </select>
                    <select className="form-input" value={filters.academic_year_id} onChange={(e) => setFilters({ ...filters, academic_year_id: e.target.value })}>
                        <option value="">All Academic Years</option>
                        {academicYears.map(a => (
                            <option key={a.academic_year_id} value={a.academic_year_id}>{a.school_year}</option>
                        ))}
                    </select>
                    <input className="form-input" placeholder="Search..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
                </div>
            </div>

            <div className="table-wrapper">
                <table className="students-table">
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>Name/Title</th>
                            <th>Department</th>
                            <th>Course</th>
                            <th>Academic Year</th>
                            <th>Archived At</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(row => (
                            <tr key={`${row._type}-${row._id}`}>
                                <td>{row._type}</td>
                                <td>{row._label}</td>
                                <td>{row._department || '-'}</td>
                                <td>{row._course || '-'}</td>
                                <td>{row._academic_year || '-'}</td>
                                <td>{row.archived_at}</td>
                                <td>
                                    <button className="btn btn-success" onClick={() => onUnarchive(row)}>Unarchive</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ArchivedAll;


