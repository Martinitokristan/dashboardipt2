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
        $this->middleware('auth:sanctum');
        $this->middleware('role:admin');
    }

    // API Resource Methods
    public function index(Request $request)
    {
        $courses = Course::all();
        $departments = Department::all();
        $academicYears = \App\Models\AcademicYear::all();
        
        return response()->json([
            'courses' => $courses,
            'departments' => $departments,
            'academic_years' => $academicYears
        ]);
    }

    public function indexWeb()
    {
        $courses = Course::all();
        $departments = Department::all();
        
        return view('admin.reports.index', compact('courses', 'departments'));
    }

    public function generateStudentReport(Request $request)
    {
        $request->validate([
            'course_id' => 'nullable|exists:courses,course_id',
            'department_id' => 'nullable|exists:departments,department_id',
            'academic_year_id' => 'nullable|exists:academic_years,academic_year_id',
            'status' => 'nullable|in:active,inactive,graduated,dropped',
        ]);

        $query = StudentProfile::with(['course', 'department', 'academicYear']);

        if ($request->filled('course_id')) {
            $query->where('course_id', $request->course_id);
        }

        if ($request->filled('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        if ($request->filled('academic_year_id')) {
            $query->where('academic_year_id', $request->academic_year_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $students = $query->orderBy('l_name')->get();
        
        // Get filter details for display
        $course = $request->filled('course_id') ? Course::findOrFail($request->course_id) : null;
        $department = $request->filled('department_id') ? Department::findOrFail($request->department_id) : null;
        $academicYear = $request->filled('academic_year_id') ? \App\Models\AcademicYear::findOrFail($request->academic_year_id) : null;
        
        if ($request->has('export') && $request->export === 'pdf') {
            $pdf = Pdf::loadView('admin.reports.students-pdf', [
                'students' => $students,
                'course' => $course,
                'department' => $department,
                'academic_year' => $academicYear,
                'status' => $request->status ?? 'all'
            ]);
            
            $filename = 'students-report';
            if ($course) $filename .= "-{$course->course_name}";
            if ($academicYear) $filename .= "-{$academicYear->school_year}";
            
            return $pdf->download("{$filename}.pdf");
        }

        return response()->json([
            'students' => $students,
            'filters' => [
                'course' => $course,
                'department' => $department,
                'academic_year' => $academicYear,
                'status' => $request->status ?? 'all'
            ]
        ]);
    }

    public function generateFacultyReport(Request $request)
    {
        $request->validate([
            'department_id' => 'nullable|exists:departments,department_id',
        ]);

        $query = FacultyProfile::with('department');

        if ($request->filled('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        $faculty = $query->orderBy('l_name')->get();
            
        $department = $request->filled('department_id') ? Department::findOrFail($request->department_id) : null;
        
        if ($request->has('export') && $request->export === 'pdf') {
            $pdf = Pdf::loadView('admin.reports.faculty-pdf', [
                'faculty' => $faculty,
                'department' => $department,
            ]);
            
            $filename = 'faculty-report';
            if ($department) $filename .= "-{$department->department_name}";
            
            return $pdf->download("{$filename}.pdf");
        }

        return response()->json([
            'faculty' => $faculty,
            'filters' => [
                'department' => $department
            ]
        ]);
    }
}
