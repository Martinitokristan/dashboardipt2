// resources/js/components/Faculty.js
import React from 'react';
import '../../sass/faculty.scss';

function Faculty() {
    return (
        <div className="page">
            <header className="page-header">
                <h1 className="page-title">Faculty</h1>
                <p className="page-subtitle">Manage Faculty Information</p>
                <button className="btn btn-primary new-btn">+ New Member</button>
            </header>

            {/* Filters / Actions */}
            <div className="actions-row">
                <label className="checkbox-pill">
                    <input type="checkbox" />
                    <span>Archived Faculty</span>
                </label>
                <div className="filters">
                    <div className="search">
                        <span className="icon">🔎</span>
                        <input className="search-input" placeholder="Search here..." />
                    </div>
                    <button className="filter">⚗ All Department ▾</button>
                </div>
            </div>

            {/* Faculty Table (pure HTML) */}
            <div className="table-wrapper">
                <table className="faculty-table">
                    <thead>
                        <tr>
                            <th>Faculty Name</th>
                            <th>Department</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Kristan Casal Martinito</td>
                            <td>CSP</td>
                            <td><span className="badge badge-success">Active</span></td>
                            <td>
                                <button className="btn btn-light">✎ Edit</button>
                                <button className="btn btn-success">⬇ Archive</button>
                            </td>
                        </tr>
                        <tr>
                            <td>Angie Keleste Petilo</td>
                            <td>ETP</td>
                            <td></td>
                            <td></td>
                        </tr>
                        <tr>
                            <td>Elsa Snowman</td>
                            <td>TEP</td>
                            <td></td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="table-blank" />
        </div>
    );
}

export default Faculty;


