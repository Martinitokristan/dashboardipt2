<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FacultyProfile;
use App\Models\User;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class FacultyController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware('role:admin');
    }

    public function index(Request $request)
    {
        $query = FacultyProfile::with('department');
        
        // Apply filters
        if ($request->has('department_id')) {
            $query->where('department_id', $request->department_id);
        }
        
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('f_name', 'like', "%{$search}%")
                  ->orWhere('m_name', 'like', "%{$search}%")
                  ->orWhere('l_name', 'like', "%{$search}%")
                  ->orWhere('email_address', 'like', "%{$search}%")
                  ->orWhere('position', 'like', "%{$search}%");
            });
        }
        
        $faculty = $query->paginate(10);
        $departments = Department::all();
        
        return view('admin.faculty.index', compact('faculty', 'departments'));
    }

    public function create()
    {
        $departments = Department::all();
        return view('admin.faculty.create', compact('departments'));
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
            'email_address' => 'required|email|unique:faculty_profiles,email_address',
            'address' => 'required|string',
            'position' => 'required|string|max:255',
            'department_id' => 'required|exists:departments,department_id',
        ]);

        // Create user
        $user = User::create([
            'username' => $validated['username'],
            'password' => Hash::make($validated['password']),
            'role' => 'faculty',
        ]);

        // Create faculty profile
        $facultyData = array_merge($validated, ['user_id' => $user->id]);
        unset($facultyData['username'], $facultyData['password']);
        
        FacultyProfile::create($facultyData);

        return redirect()->route('admin.faculty.index')
            ->with('success', 'Faculty member added successfully.');
    }

    public function edit(FacultyProfile $faculty)
    {
        $departments = Department::all();
        return view('admin.faculty.edit', compact('faculty', 'departments'));
    }

    public function update(Request $request, FacultyProfile $faculty)
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
                Rule::unique('faculty_profiles', 'email_address')->ignore($faculty->faculty_id, 'faculty_id')
            ],
            'address' => 'required|string',
            'position' => 'required|string|max:255',
            'department_id' => 'required|exists:departments,department_id',
        ]);

        $faculty->update($validated);

        return redirect()->route('admin.faculty.index')
            ->with('success', 'Faculty member updated successfully.');
    }

    public function destroy(FacultyProfile $faculty)
    {
        // Archive the faculty profile
        $faculty->update(['archived_at' => now()]);
        
        // Optionally, deactivate the user account
        $faculty->user()->update(['is_active' => false]);

        return redirect()->route('admin.faculty.index')
            ->with('success', 'Faculty member archived successfully.');
    }
}
