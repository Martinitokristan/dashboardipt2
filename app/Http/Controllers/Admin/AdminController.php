<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\StudentProfile;
use App\Models\FacultyProfile;
use App\Models\Course;
use App\Models\Department;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware('role:admin');
    }

    public function dashboard()
    {
        $data = [
            'total_students' => StudentProfile::count(),
            'total_faculty' => FacultyProfile::count(),
            'total_courses' => Course::count(),
            'total_departments' => Department::count(),
            'students_by_course' => $this->getStudentsByCourse(),
            'faculty_by_department' => $this->getFacultyByDepartment(),
        ];

        return view('admin.dashboard', $data);
    }

    protected function getStudentsByCourse()
    {
        return Course::withCount('students')
            ->orderBy('course_name')
            ->get()
            ->map(function($course) {
                return [
                    'label' => $course->course_name,
                    'count' => $course->students_count
                ];
            });
    }

    protected function getFacultyByDepartment()
    {
        return Department::withCount('faculty')
            ->orderBy('department_name')
            ->get()
            ->map(function($department) {
                return [
                    'label' => $department->department_name,
                    'count' => $department->faculty_count
                ];
            });
    }

    public function profile()
    {
        return view('admin.profile');
    }

    public function updateProfile(Request $request)
    {
        $user = auth()->user();
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'current_password' => 'required_with:new_password|current_password',
            'new_password' => 'nullable|min:8|confirmed',
        ]);

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        
        if (!empty($validated['new_password'])) {
            $user->password = bcrypt($validated['new_password']);
        }
        
        $user->save();

        return redirect()->route('admin.profile')
            ->with('success', 'Profile updated successfully.');
    }

    // API endpoints for dashboard statistics
    public function getDashboardStats()
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

    public function updateProfileJson(Request $request)
    {
        $user = auth()->user();
        
        $validated = $request->validate([
            'username' => 'required|string|max:255|unique:users,username,' . $user->id,
            'current_password' => 'required_with:new_password',
            'new_password' => 'nullable|min:8|confirmed',
        ]);

        // Verify current password if changing password
        if (!empty($validated['current_password'])) {
            if (!\Hash::check($validated['current_password'], $user->password)) {
                return response()->json([
                    'errors' => ['current_password' => ['Current password is incorrect.']]
                ], 422);
            }
        }

        $user->username = $validated['username'];
        
        if (!empty($validated['new_password'])) {
            $user->password = \Hash::make($validated['new_password']);
        }
        
        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user' => $user->only(['id', 'username', 'role'])
        ]);
    }
}
