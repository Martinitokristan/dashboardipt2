<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\StudentProfile;
use App\Models\FacultyProfile;
use App\Models\Course;
use App\Models\Department;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $courses = Course::all();
        $departments = Department::all();
        $academicYears = \App\Models\AcademicYear::all();

        return response()->json([
            'courses' => $courses,
            'departments' => $departments,
            'academic_years' => $academicYears,
        ]);
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

        $course = $request->filled('course_id') ? Course::find($request->course_id) : null;
        $department = $request->filled('department_id') ? Department::find($request->department_id) : null;
        $academicYear = $request->filled('academic_year_id') ? \App\Models\AcademicYear::find($request->academic_year_id) : null;

        return response()->json([
            'students' => $students,
            'filters' => [
                'course' => $course,
                'department' => $department,
                'academic_year' => $academicYear,
                'status' => $request->status ?? 'all',
            ],
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

        $department = $request->filled('department_id') ? Department::find($request->department_id) : null;

        return response()->json([
            'faculty' => $faculty,
            'filters' => [
                'department' => $department,
            ],
        ]);
    }
}