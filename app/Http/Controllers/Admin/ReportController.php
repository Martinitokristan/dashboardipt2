<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\StudentProfile;
use App\Models\FacultyProfile;
use App\Models\Course;
use App\Models\Department;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class ReportController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
        $this->middleware('role:admin');
    }

    public function index()
    {
        $courses = Course::all();
        $departments = Department::all();
        
        return view('admin.reports.index', compact('courses', 'departments'));
    }

    public function generateStudentReport(Request $request)
    {
        $request->validate([
            'course_id' => 'required|exists:courses,course_id',
            'status' => 'nullable|in:active,inactive,graduated,dropped',
        ]);

        $query = StudentProfile::with(['course', 'department'])
            ->where('course_id', $request->course_id);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $students = $query->orderBy('l_name')->get();
        $course = Course::findOrFail($request->course_id);
        
        if ($request->has('export') && $request->export === 'pdf') {
            $pdf = Pdf::loadView('admin.reports.students-pdf', [
                'students' => $students,
                'course' => $course,
                'status' => $request->status ?? 'all'
            ]);
            
            return $pdf->download("students-report-{$course->course_name}.pdf");
        }

        return view('admin.reports.students', [
            'students' => $students,
            'course' => $course,
            'status' => $request->status ?? 'all'
        ]);
    }

    public function generateFacultyReport(Request $request)
    {
        $request->validate([
            'department_id' => 'required|exists:departments,department_id',
        ]);

        $faculty = FacultyProfile::with('department')
            ->where('department_id', $request->department_id)
            ->orderBy('l_name')
            ->get();
            
        $department = Department::findOrFail($request->department_id);
        
        if ($request->has('export') && $request->export === 'pdf') {
            $pdf = Pdf::loadView('admin.reports.faculty-pdf', [
                'faculty' => $faculty,
                'department' => $department,
            ]);
            
            return $pdf->download("faculty-report-{$department->department_name}.pdf");
        }

        return view('admin.reports.faculty', [
            'faculty' => $faculty,
            'department' => $department,
        ]);
    }
}
