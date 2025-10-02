<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\StudentProfile;
use App\Models\User;
use App\Models\Course;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class StudentController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware('role:admin');
    }

    public function index(Request $request)
    {
        $query = StudentProfile::with(['department', 'course']);
        
        // Apply filters
        if ($request->has('course_id')) {
            $query->where('course_id', $request->course_id);
        }
        
        if ($request->has('department_id')) {
            $query->where('department_id', $request->department_id);
        }
        
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('f_name', 'like', "%{$search}%")
                  ->orWhere('m_name', 'like', "%{$search}%")
                  ->orWhere('l_name', 'like', "%{$search}%")
                  ->orWhere('email_address', 'like', "%{$search}%");
            });
        }
        
        $students = $query->paginate(10);
        $courses = Course::all();
        $departments = Department::all();
        
        return view('admin.students.index', compact('students', 'courses', 'departments'));
    }

    public function create()
    {
        $courses = Course::all();
        $departments = Department::all();
        return view('admin.students.create', compact('courses', 'departments'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'username' => 'required|string|max:255|unique:users,username',
            'password' => 'required|string|min:8|confirmed',
            'f_name' => 'required|string|max:255',
            'm_name' => 'nullable|string|max:255',
            'l_name' => 'required|string|max:255',
            'suffix' => 'nullable|string|max:20',
            'date_of_birth' => 'required|date',
            'sex' => 'required|in:male,female,other',
            'phone_number' => 'required|string|max:20',
            'email_address' => 'required|email|unique:student_profiles,email_address',
            'address' => 'required|string',
            'status' => 'required|in:active,inactive,graduated,dropped',
            'department_id' => 'required|exists:departments,department_id',
            'course_id' => 'required|exists:courses,course_id',
        ]);

        // Create user
        $user = User::create([
            'username' => $validated['username'],
            'password' => Hash::make($validated['password']),
            'role' => 'student',
        ]);

        // Create student profile
        $studentData = array_merge($validated, ['user_id' => $user->id]);
        unset($studentData['username'], $studentData['password']);
        
        StudentProfile::create($studentData);

        return redirect()->route('admin.students.index')
            ->with('success', 'Student created successfully.');
    }

    public function edit(StudentProfile $student)
    {
        $courses = Course::all();
        $departments = Department::all();
        return view('admin.students.edit', compact('student', 'courses', 'departments'));
    }

    public function update(Request $request, StudentProfile $student)
    {
        $validated = $request->validate([
            'f_name' => 'required|string|max:255',
            'm_name' => 'nullable|string|max:255',
            'l_name' => 'required|string|max:255',
            'suffix' => 'nullable|string|max:20',
            'date_of_birth' => 'required|date',
            'sex' => 'required|in:male,female,other',
            'phone_number' => 'required|string|max:20',
            'email_address' => [
                'required',
                'email',
                Rule::unique('student_profiles', 'email_address')->ignore($student->student_id, 'student_id')
            ],
            'address' => 'required|string',
            'status' => 'required|in:active,inactive,graduated,dropped',
            'department_id' => 'required|exists:departments,department_id',
            'course_id' => 'required|exists:courses,course_id',
        ]);

        $student->update($validated);

        return redirect()->route('admin.students.index')
            ->with('success', 'Student updated successfully.');
    }

    public function destroy(StudentProfile $student)
    {
        // Archive the student profile
        $student->update(['archived_at' => now()]);

        return redirect()->route('admin.students.index')
            ->with('success', 'Student archived successfully.');
    }

    // JSON endpoints for SPA
    public function indexJson(Request $request)
    {
        $query = StudentProfile::with(['department', 'course']);
        if ($request->boolean('archived')) {
            $query->withTrashed();
        }
        // Filtering precedence:
        // - If course_id is provided, filter by course (and also by department if provided)
        // - Else if department_id is provided, filter by department (all courses)
        if ($request->filled('course_id')) {
            $query->where('course_id', $request->course_id);
            if ($request->filled('department_id')) {
                $query->where('department_id', $request->department_id);
            }
        } elseif ($request->filled('department_id')) {
            $query->where('department_id', $request->department_id);
        }
        if ($request->filled('academic_year_id')) {
            $query->where('academic_year_id', $request->academic_year_id);
        }
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('f_name', 'like', "%{$search}%")
                  ->orWhere('m_name', 'like', "%{$search}%")
                  ->orWhere('l_name', 'like', "%{$search}%")
                  ->orWhere('email_address', 'like', "%{$search}%");
            });
        }
        $students = $query->orderByDesc('created_at')->get();
        return response()->json($students);
    }

    public function storeJson(Request $request)
    {
        $validated = $request->validate([
            'f_name' => 'required|string|max:255',
            'm_name' => 'nullable|string|max:255',
            'l_name' => 'required|string|max:255',
            'suffix' => 'nullable|string|max:20',
            'date_of_birth' => 'required|date',
            'sex' => 'required|in:male,female,other',
            'phone_number' => 'required|string|max:20',
            'email_address' => 'required|email|unique:student_profiles,email_address',
            'address' => 'required|string',
            'status' => 'required|in:active,inactive,graduated,dropped',
            'department_id' => 'required|exists:departments,department_id',
            'course_id' => 'required|exists:courses,course_id',
            'academic_year_id' => 'nullable|exists:academic_years,academic_year_id',
        ]);

        // Auto-provision a basic user silently for relational integrity
        $student = StudentProfile::create($validated);

        return response()->json($student->load(['department', 'course']), 201);
    }

    public function updateJson(Request $request, StudentProfile $student)
    {
        $validated = $request->validate([
            'f_name' => 'required|string|max:255',
            'm_name' => 'nullable|string|max:255',
            'l_name' => 'required|string|max:255',
            'suffix' => 'nullable|string|max:20',
            'date_of_birth' => 'required|date',
            'sex' => 'required|in:male,female,other',
            'phone_number' => 'required|string|max:20',
            'email_address' => [
                'required', 'email',
                Rule::unique('student_profiles', 'email_address')->ignore($student->student_id, 'student_id')
            ],
            'address' => 'required|string',
            'status' => 'required|in:active,inactive,graduated,dropped',
            'department_id' => 'required|exists:departments,department_id',
            'course_id' => 'required|exists:courses,course_id',
            'academic_year_id' => 'nullable|exists:academic_years,academic_year_id',
        ]);

        $student->update($validated);
        return response()->json($student->load(['department', 'course']));
    }
}
