// resources/js/components/Report.js
import React from 'react';
import '../../sass/report.scss';

function Report() {
    return (
        <div className="page">
            <header className="page-header">
                <h1 className="page-title">Report</h1>
                <p className="page-subtitle">Manage Report</p>
            </header>

            <section className="config-card">
                <div className="config-title">⚗ Report Configuration</div>
                <div className="config-grid">
                    <div className="field">
                        <label>Report Type</label>
                        <select>
                            <option>Student Report</option>
                            <option>Faculty Report</option>
                        </select>
                    </div>
                    <div className="field">
                        <label>Filter by Course</label>
                        <select>
                            <option>Science</option>
                            <option>Engineering</option>
                        </select>
                    </div>
                    <div className="field">
                        <label>Filter by Department</label>
                        <select>
                            <option>Computer Science</option>
                            <option>Mathematics</option>
                        </select>
                    </div>
                </div>
                <button className="btn btn-primary">Generate Report</button>
            </section>

            <section className="report-preview">
                <div className="report-meta">
                    <div>Student Report</div>
                    <div>Generated on 10/08/2025</div>
                </div>
                <div className="preview-grid">
                    <div className="preview-box" />
                    <div className="preview-box" />
                    <div className="preview-box" />
                    <div className="preview-wide" />
                </div>
            </section>
        </div>
    );
}

export default Report;


