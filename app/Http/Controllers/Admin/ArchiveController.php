<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\StudentProfile;
use App\Models\FacultyProfile;
use App\Models\Course;
use App\Models\Department;
use App\Models\AcademicYear;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ArchiveController extends Controller
{
    public function index(Request $request)
    {
        try {
            $type = $request->input('type', 'all');
            $items = [];

            if ($type === 'all' || $type === 'students') {
                $query = StudentProfile::onlyTrashed()->with(['department', 'course', 'academicYear']);
                if ($request->filled('department_id')) {
                    $query->where('department_id', $request->department_id);
                }
                if ($request->filled('course_id')) {
                    $query->where('course_id', $request->course_id);
                }
                if ($request->filled('academic_year_id')) {
                    $query->where('academic_year_id', $request->academic_year_id);
                }
                if ($request->filled('search')) {
                    $search = $request->search;
                    $query->where(function ($q) use ($search) {
                        $q->where('f_name', 'like', "%{$search}%")
                          ->orWhere('m_name', 'like', "%{$search}%")
                          ->orWhere('l_name', 'like', "%{$search}%")
                          ->orWhere('email_address', 'like', "%{$search}%");
                    });
                }
                $students = $query->get()->map(function ($student) {
                    $name = trim("{$student->f_name} {$student->m_name} {$student->l_name} {$student->suffix}");
                    return [
                        '_type' => 'student',
                        '_id' => $student->student_id,
                        '_label' => $name ?: ($student->full_name ?? '-'),
                        '_department' => $student->department ? $student->department->department_name : '-',
                        '_course' => $student->course ? $student->course->course_name : '-',
                        '_year_level' => $student->year_level ?? '-',
                        '_academic_year' => $student->academicYear ? $student->academicYear->school_year : '-',
                        'archived_at' => $student->archived_at,
                    ];
                });
                $items = array_merge($items, $students->toArray());
            }

            if ($type === 'all' || $type === 'faculty') {
                $query = FacultyProfile::onlyTrashed()->with('department');
                if ($request->filled('department_id')) {
                    $query->where('department_id', $request->department_id);
                }
                if ($request->filled('search')) {
                    $search = $request->search;
                    $query->where(function ($q) use ($search) {
                        $q->where('f_name', 'like', "%{$search}%")
                          ->orWhere('m_name', 'like', "%{$search}%")
                          ->orWhere('l_name', 'like', "%{$search}%")
                          ->orWhere('email_address', 'like', "%{$search}%");
                    });
                }
                $faculty = $query->get()->map(function ($faculty) {
                    $name = trim("{$faculty->f_name} {$faculty->m_name} {$faculty->l_name} {$faculty->suffix}");
                    return [
                        '_type' => 'faculty',
                        '_id' => $faculty->faculty_id,
                        '_label' => $name ?: ($faculty->full_name ?? '-'),
                        '_department' => $faculty->department ? $faculty->department->department_name : '-',
                        '_course' => '-',
                        '_year_level' => '-', // Not applicable for faculty
                        '_academic_year' => '-', // Not applicable for faculty
                        'archived_at' => $faculty->archived_at,
                    ];
                });
                $items = array_merge($items, $faculty->toArray());
            }

            if ($type === 'all' || $type === 'courses') {
                $query = Course::onlyTrashed()->with('department');
                if ($request->filled('department_id')) {
                    $query->where('department_id', $request->department_id);
                }
                $courses = $query->get()->map(function ($course) {
                    return [
                        '_type' => 'course',
                        '_id' => $course->course_id,
                        '_label' => $course->course_name,
                        '_department' => $course->department ? $course->department->department_name : '-',
                        '_course' => $course->course_name,
                        '_year_level' => '-', // Not applicable for courses
                        '_academic_year' => '-', // Not applicable for courses
                        'archived_at' => $course->archived_at,
                    ];
                });
                $items = array_merge($items, $courses->toArray());
            }

            if ($type === 'all' || $type === 'departments') {
                $query = Department::onlyTrashed();
                if ($request->filled('search')) {
                    $search = $request->search;
                    $query->where(function ($q) use ($search) {
                        $q->where('department_name', 'like', "%{$search}%")
                          ->orWhere('department_head', 'like', "%{$search}%");
                    });
                }
                $departments = $query->get()->map(function ($department) {
                    return [
                        '_type' => 'department',
                        '_id' => $department->department_id,
                        '_label' => $department->department_name,
                        '_department' => $department->department_name,
                        '_course' => '-',
                        '_year_level' => '-', // Not applicable for departments
                        '_academic_year' => '-', // Not applicable for departments
                        'archived_at' => $department->archived_at,
                    ];
                });
                $items = array_merge($items, $departments->toArray());
            }

            if ($type === 'all' || $type === 'academic_years') {
                $query = AcademicYear::onlyTrashed();
                if ($request->filled('search')) {
                    $search = $request->search;
                    $query->where('school_year', 'like', "%{$search}%");
                }
                $academicYears = $query->get()->map(function ($academicYear) {
                    return [
                        '_type' => 'academic_year',
                        '_id' => $academicYear->academic_year_id,
                        '_label' => $academicYear->school_year,
                        '_department' => '-',
                        '_course' => '-',
                        '_year_level' => '-', // Not applicable for academic years
                        '_academic_year' => $academicYear->school_year,
                        'archived_at' => $academicYear->archived_at,
                    ];
                });
                $items = array_merge($items, $academicYears->toArray());
            }

            return response()->json(['items' => $items]);
        } catch (\Exception $e) {
            Log::error('Error loading archived items: ', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'Failed to load archived items: ' . $e->getMessage()], 500);
        }
    }
}