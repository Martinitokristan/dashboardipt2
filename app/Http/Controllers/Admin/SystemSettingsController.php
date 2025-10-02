<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Department;
use App\Models\AcademicYear;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SystemSettingsController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware('role:admin');
    }

    // Department Methods
    public function departments()
    {
        $departments = Department::latest()->paginate(10);
        return view('admin.settings.departments', compact('departments'));
    }

    public function storeDepartment(Request $request)
    {
        $validated = $request->validate([
            'department_name' => 'required|string|max:255|unique:departments,department_name',
            'department_head' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        Department::create($validated);

        return redirect()->route('admin.settings.departments')
            ->with('success', 'Department created successfully.');
    }

    public function updateDepartment(Request $request, Department $department)
    {
        $validated = $request->validate([
            'department_name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('departments', 'department_name')->ignore($department->department_id, 'department_id')
            ],
            'department_head' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        $department->update($validated);

        return redirect()->route('admin.settings.departments')
            ->with('success', 'Department updated successfully.');
    }

    public function deleteDepartment(Department $department)
    {
        // Check if department is in use before deleting
        if ($department->students()->exists() || $department->faculty()->exists()) {
            return redirect()->back()
                ->with('error', 'Cannot delete department. It is currently in use.');
        }

        $department->delete();
        return redirect()->route('admin.settings.departments')
            ->with('success', 'Department deleted successfully.');
    }

    // Course Methods
    public function courses()
    {
        $courses = Course::latest()->paginate(10);
        return view('admin.settings.courses', compact('courses'));
    }

    public function storeCourse(Request $request)
    {
        $validated = $request->validate([
            'course_name' => 'required|string|max:255|unique:courses,course_name',
            'course_status' => 'required|in:active,inactive',
            'description' => 'nullable|string',
        ]);

        Course::create($validated);

        return redirect()->route('admin.settings.courses')
            ->with('success', 'Course created successfully.');
    }

    public function updateCourse(Request $request, Course $course)
    {
        $validated = $request->validate([
            'course_name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('courses', 'course_name')->ignore($course->course_id, 'course_id')
            ],
            'course_status' => 'required|in:active,inactive',
            'description' => 'nullable|string',
        ]);

        $course->update($validated);

        return redirect()->route('admin.settings.courses')
            ->with('success', 'Course updated successfully.');
    }

    public function deleteCourse(Course $course)
    {
        // Check if course is in use before deleting
        if ($course->students()->exists()) {
            return redirect()->back()
                ->with('error', 'Cannot delete course. It is currently assigned to students.');
        }

        $course->delete();
        return redirect()->route('admin.settings.courses')
            ->with('success', 'Course deleted successfully.');
    }

    // Academic Year Methods
    public function academicYears()
    {
        $academicYears = AcademicYear::latest()->paginate(10);
        return view('admin.settings.academic-years', compact('academicYears'));
    }

    public function storeAcademicYear(Request $request)
    {
        $validated = $request->validate([
            'school_year' => 'required|string|max:255|unique:academic_years,school_year',
        ]);

        AcademicYear::create($validated);

        return redirect()->route('admin.settings.academic-years')
            ->with('success', 'Academic year created successfully.');
    }

    public function updateAcademicYear(Request $request, AcademicYear $academicYear)
    {
        $validated = $request->validate([
            'school_year' => [
                'required',
                'string',
                'max:255',
                Rule::unique('academic_years', 'school_year')->ignore($academicYear->academic_year_id, 'academic_year_id')
            ],
        ]);

        $academicYear->update($validated);

        return redirect()->route('admin.settings.academic-years')
            ->with('success', 'Academic year updated successfully.');
    }

    public function deleteAcademicYear(AcademicYear $academicYear)
    {
        // Add any checks here if academic year is in use
        
        $academicYear->delete();
        return redirect()->route('admin.settings.academic-years')
            ->with('success', 'Academic year deleted successfully.');
    }

    // JSON endpoints for SPA Settings (Admin only)
    public function departmentsIndexJson(Request $request)
    {
        $query = Department::query();
        if ($request->boolean('archived')) {
            $query->withTrashed();
        }
        $departments = $query->orderByDesc('created_at')->get();
        return response()->json($departments);
    }

    public function storeDepartmentJson(Request $request)
    {
        $validated = $request->validate([
            'department_name' => 'required|string|max:255|unique:departments,department_name',
            'department_head' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);
        $department = Department::create($validated);
        return response()->json($department, 201);
    }

    public function updateDepartmentJson(Request $request, Department $department)
    {
        $validated = $request->validate([
            'department_name' => [
                'required', 'string', 'max:255',
                Rule::unique('departments', 'department_name')->ignore($department->department_id, 'department_id')
            ],
            'department_head' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);
        $department->update($validated);
        return response()->json($department);
    }

    public function archiveDepartmentJson(Request $request, $department)
    {
        $model = Department::withTrashed()->findOrFail($department);
        if ($model->trashed()) {
            return response()->json(['message' => 'Already archived'], 200);
        }
        $model->delete();
        return response()->json($model->fresh());
    }

    public function unarchiveDepartmentJson(Request $request, $department)
    {
        $model = Department::withTrashed()->findOrFail($department);
        if (! $model->trashed()) {
            return response()->json(['message' => 'Not archived'], 200);
        }
        $model->restore();
        return response()->json($model->fresh());
    }

    public function coursesIndexJson(Request $request)
    {
        $query = Course::with('department');
        if ($request->boolean('archived')) {
            $query->withTrashed();
        }
        $courses = $query->orderByDesc('created_at')->get();
        return response()->json($courses);
    }

    public function storeCourseJson(Request $request)
    {
        $validated = $request->validate([
            'course_name' => 'required|string|max:255|unique:courses,course_name',
            'department_id' => 'required|exists:departments,department_id',
        ]);
        $course = Course::create([
            'course_name' => $validated['course_name'],
            'department_id' => $validated['department_id'],
            'course_status' => 'active',
        ]);
        return response()->json($course, 201);
    }

    public function updateCourseJson(Request $request, Course $course)
    {
        $validated = $request->validate([
            'course_name' => [
                'required', 'string', 'max:255',
                Rule::unique('courses', 'course_name')->ignore($course->course_id, 'course_id')
            ],
            'course_status' => 'in:active,inactive',
            'department_id' => 'required|exists:departments,department_id',
        ]);
        $course->update($validated);
        return response()->json($course);
    }

    public function archiveCourseJson(Request $request, $course)
    {
        $model = Course::withTrashed()->findOrFail($course);
        if ($model->trashed()) {
            return response()->json(['message' => 'Already archived'], 200);
        }
        $model->delete();
        return response()->json($model->fresh());
    }

    public function unarchiveCourseJson(Request $request, $course)
    {
        $model = Course::withTrashed()->findOrFail($course);
        if (! $model->trashed()) {
            return response()->json(['message' => 'Not archived'], 200);
        }
        $model->restore();
        return response()->json($model->fresh());
    }

    public function academicYearsIndexJson(Request $request)
    {
        $academicYears = AcademicYear::orderByDesc('created_at')->get();
        return response()->json($academicYears);
    }

    public function storeAcademicYearJson(Request $request)
    {
        $validated = $request->validate([
            'school_year' => 'required|string|max:255|unique:academic_years,school_year',
        ]);
        $ay = AcademicYear::create($validated);
        return response()->json($ay, 201);
    }

    public function updateAcademicYearJson(Request $request, AcademicYear $academicYear)
    {
        $validated = $request->validate([
            'school_year' => [
                'required','string','max:255',
                Rule::unique('academic_years','school_year')->ignore($academicYear->academic_year_id,'academic_year_id')
            ],
        ]);
        $academicYear->update($validated);
        return response()->json($academicYear);
    }
}
