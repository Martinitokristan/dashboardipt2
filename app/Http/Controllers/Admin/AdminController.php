<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\StudentProfile;
use App\Models\FacultyProfile;
use App\Models\Course;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Response;

class AdminController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware('role:admin');
    }

    public function dashboard()
    {
        return view('dashboard');
    }

    public function dashboardJson()
    {
        $data = [
            'total_students' => StudentProfile::count(),
            'total_faculty' => FacultyProfile::count(),
            'total_courses' => Course::count(),
            'total_departments' => Department::count(),
            'students_by_course' => $this->getStudentsByCourse(),
            'faculty_by_department' => $this->getFacultyByDepartment(),
        ];

        return response()->json($data);
    }

    protected function getStudentsByCourse()
    {
        return Course::withCount('students')
            ->orderBy('course_name')
            ->get()
            ->map(function ($course) {
                return [
                    'label' => $course->course_name,
                    'count' => $course->students_count,
                ];
            });
    }

    protected function getFacultyByDepartment()
    {
        return Department::withCount('faculty')
            ->orderBy('department_name')
            ->get()
            ->map(function ($department) {
                return [
                    'label' => $department->department_name,
                    'count' => $department->faculty_count,
                ];
            });
    }

    public function getProfile()
    {
        $user = auth()->user();
        return response()->json([
            'user' => $user->only(['id', 'first_name', 'last_name', 'email', 'role', 'avatar']),
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = auth()->user();

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'current_password' => 'required_with:new_password|current_password',
            'new_password' => 'nullable|min:8|confirmed',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if (!empty($validated['current_password']) && !Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'errors' => ['current_password' => ['Current password is incorrect.']],
            ], 422);
        }

        if ($request->hasFile('avatar')) {
            if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
            $user->avatar = $avatarPath;
        }

        $user->first_name = $validated['first_name'];
        $user->last_name = $validated['last_name'];
        $user->email = $validated['email'];
        if (!empty($validated['new_password'])) {
            $user->password = Hash::make($validated['new_password']);
        }
        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user' => $user->only(['id', 'first_name', 'last_name', 'email', 'role', 'avatar']),
        ]);
    }

    public function logout()
    {
        auth()->user()->tokens()->delete();
        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function departments(Request $request)
    {
        try {
            $query = Department::with(['departmentHead' => function ($q) {
                $q->select('faculty_id', 'f_name', 'm_name', 'l_name', 'suffix');
            }]);

            if ($request->has('onlyTrashed')) {
                $query->onlyTrashed();
            } elseif ($request->has('withTrashed')) {
                $query->withTrashed();
            }

            if ($request->has('search')) {
                $search = trim($request->search);
                $query->where('department_name', 'like', "%{$search}%");
            }

            $departments = $query->orderBy('department_name', 'asc')->get();

            // Format the department head name
            $departments->each(function ($dept) {
                Log::info('Department data', ['dept_id' => $dept->department_id, 'dept_name' => $dept->department_name, 'head_id' => $dept->department_head_id, 'has_head' => isset($dept->departmentHead)]);
                if ($dept->departmentHead) {
                    $name = trim(implode(' ', array_filter([
                        $dept->departmentHead->f_name,
                        $dept->departmentHead->m_name,
                        $dept->departmentHead->l_name,
                        $dept->departmentHead->suffix ? ', ' . $dept->departmentHead->suffix : ''
                    ])));
                    $dept->department_head = $name;
                    Log::info('Department head name formatted', ['dept_id' => $dept->department_id, 'name' => $name]);
                } else {
                    $dept->department_head = '-';
                    Log::info('No department head', ['dept_id' => $dept->department_id]);
                }
            });

            return Response::json($departments);
        } catch (\Exception $e) {
            Log::error('Error loading departments: ', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return Response::json(['error' => 'Failed to load departments: ' . $e->getMessage()], 500);
        }
    }
}
