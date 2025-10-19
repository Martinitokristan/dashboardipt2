import React, { useState, useEffect } from 'react';
import '../../sass/report.scss';

function Report() {
    const [reportType, setReportType] = useState('students');
    const [filters, setFilters] = useState({
        course_id: '',
        department_id: '',
        academic_year_id: '',
        status: ''
    });
    const [options, setOptions] = useState({
        courses: [],
        departments: [],
        academic_years: []
    });
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalFilters, setModalFilters] = useState({
        course_id: '',
        department_id: '',
        academic_year_id: '',
        status: ''
    });

    // Load filter options on component mount
    useEffect(() => {
        loadOptions();
    }, []);

    const loadOptions = async () => {
        try {
            const response = await fetch('/api/admin/reports', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setOptions(data);
            }
        } catch (error) {
            console.error('Error loading options:', error);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const openModal = () => {
        setModalFilters({
            course_id: '',
            department_id: '',
            academic_year_id: '',
            status: ''
        });
        setShowModal(true);
    };

    const handleModalFilterChange = (field, value) => {
        setModalFilters(prev => {
            const next = { ...prev, [field]: value };
            // If department changes, reset course and filter courses to that department
            if (field === 'department_id') {
                next.course_id = '';
            }
            return next;
        });
    };

    const generateReport = async () => {
        setLoading(true);
        setMessage('');
        setReportData(null);
        setShowModal(false);

        try {
            const endpoint = reportType === 'students' ? '/api/admin/reports/students' : '/api/admin/reports/faculty';
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(modalFilters)
            });

            if (response.ok) {
                const data = await response.json();
                setReportData(data);
                setMessage('Report generated successfully!');
            } else {
                const error = await response.json();
                setMessage('Error: ' + (error.message || 'Failed to generate report'));
            }
        } catch (error) {
            console.error('Error generating report:', error);
            setMessage('Error generating report');
        } finally {
            setLoading(false);
        }
    };

    const exportReport = async (format = 'json') => {
        try {
            const endpoint = reportType === 'students' ? '/api/admin/reports/students' : '/api/admin/reports/faculty';
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ ...modalFilters, export: format })
            });

            if (response.ok) {
                if (format === 'pdf') {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${reportType}-report.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                } else {
                    const data = await response.json();
                    const jsonStr = JSON.stringify(data, null, 2);
                    const blob = new Blob([jsonStr], { type: 'application/json' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${reportType}-report.json`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                }
            }
        } catch (error) {
            console.error('Error exporting report:', error);
        }
    };

    return (
        <div className="page">
            <header className="page-header">
                <h1 className="page-title">Report</h1>
                <p className="page-subtitle">Generate and manage reports</p>
            </header>

            <section className="config-card">
                <div className="config-title">⚗ Report Configuration</div>
                <div className="config-grid">
                    <div className="field">
                        <label>Report Type</label>
                        <select 
                            value={reportType} 
                            onChange={(e) => setReportType(e.target.value)}
                        >
                            <option value="students">Student Report</option>
                            <option value="faculty">Faculty Report</option>
                        </select>
                    </div>
                </div>
                <div className="config-actions">
                    <button 
                        className="btn btn-primary" 
                        onClick={openModal}
                        disabled={loading}
                    >
                        {loading ? 'Generating...' : 'Generate Report'}
                    </button>
                    {reportData && (
                        <>
                            <button 
                                className="btn btn-secondary" 
                                onClick={() => exportReport('json')}
                            >
                                Export JSON
                            </button>
                            <button 
                                className="btn btn-secondary" 
                                onClick={() => exportReport('pdf')}
                            >
                                Export PDF
                            </button>
                        </>
                    )}
                </div>
                {message && (
                    <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
                        {message}
                    </div>
                )}
            </section>

            {/* Report Generation Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Generate {reportType === 'students' ? 'Student' : 'Faculty'} Report</h3>
                            <button 
                                className="btn-close"
                                onClick={() => setShowModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-row">
                                {reportType === 'students' ? (
                                    <>
                                        <div className="form-group">
                                            <label>Filter by Course</label>
                                            <select 
                                                value={modalFilters.course_id} 
                                                onChange={(e) => handleModalFilterChange('course_id', e.target.value)}
                                            >
                                                <option value="">All Courses</option>
                                                {options.courses.map(course => (
                                                    <option key={course.course_id} value={course.course_id}>
                                                        {course.course_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Filter by Academic Year</label>
                                            <select 
                                                value={modalFilters.academic_year_id} 
                                                onChange={(e) => handleModalFilterChange('academic_year_id', e.target.value)}
                                            >
                                                <option value="">All Academic Years</option>
                                                {options.academic_years.map(year => (
                                                    <option key={year.academic_year_id} value={year.academic_year_id}>
                                                        {year.school_year}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="form-group">
                                            <label>Filter by Department</label>
                                            <select 
                                                value={modalFilters.department_id} 
                                                onChange={(e) => handleModalFilterChange('department_id', e.target.value)}
                                            >
                                                <option value="">All Departments</option>
                                                {options.departments.map(dept => (
                                                    <option key={dept.department_id} value={dept.department_id}>
                                                        {dept.department_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </>
                                )}

                                <div className="form-group">
                                    <label>Filter by Status</label>
                                    <select 
                                        value={modalFilters.status} 
                                        onChange={(e) => handleModalFilterChange('status', e.target.value)}
                                    >
                                        <option value="">All Status</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="graduated">Graduated</option>
                                        <option value="dropped">Dropped</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button 
                                type="button" 
                                className="btn btn-secondary" 
                                onClick={() => setShowModal(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                type="button" 
                                className="btn btn-primary" 
                                onClick={generateReport}
                                disabled={loading}
                            >
                                {loading ? 'Generating...' : 'Generate Report'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {reportData && (
                <section className="report-preview">
                    <div className="report-meta">
                        <div>{reportType === 'students' ? 'Student Report' : 'Faculty Report'}</div>
                        <div>Generated on {new Date().toLocaleDateString()}</div>
                        <div>Total Records: {reportData[reportType]?.length || 0}</div>
                    </div>
                    
                    <div className="report-table">
                        <table>
                            <thead>
                                <tr>
                                    {reportType === 'students' ? (
                                        <>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Course</th>
                                            <th>Department</th>
                                            <th>Status</th>
                                        </>
                                    ) : (
                                        <>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Position</th>
                                            <th>Department</th>
                                            <th>Phone</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {reportData[reportType]?.slice(0, 10).map((item, index) => (
                                    <tr key={index}>
                                        {reportType === 'students' ? (
                                            <>
                                                <td>{item.f_name} {item.l_name}</td>
                                                <td>{item.email_address}</td>
                                                <td>{item.course?.course_name || 'N/A'}</td>
                                                <td>{item.department?.department_name || 'N/A'}</td>
                                                <td>{item.status || 'N/A'}</td>
                                            </>
                                        ) : (
                                            <>
                                                <td>{item.f_name} {item.l_name}</td>
                                                <td>{item.email_address}</td>
                                                <td>{item.position}</td>
                                                <td>{item.department?.department_name || 'N/A'}</td>
                                                <td>{item.phone_number}</td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {reportData[reportType]?.length > 10 && (
                            <div className="table-note">
                                Showing first 10 records. Export to see all {reportData[reportType].length} records.
                            </div>
                        )}
                    </div>
                </section>
            )}
        </div>
    );
}

export default Report;
