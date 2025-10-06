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
        // Middleware is applied at route level
    }

    // API Resource Methods
    public function index(Request $request)
    {
        return $this->indexJson($request);
    }

    public function store(Request $request)
    {
        return $this->storeJson($request);
    }

    public function show(Request $request, $id)
    {
        $faculty = FacultyProfile::withTrashed()->findOrFail($id);
        return response()->json($faculty->load('department'));
    }

    public function update(Request $request, $id)
    {
        $faculty = FacultyProfile::findOrFail($id);
        return $this->updateJson($request, $faculty);
    }

    // JSON endpoints for SPA
    public function indexJson(Request $request)
    {
        $query = FacultyProfile::with('department');
        
        if ($request->boolean('archived')) {
            $query->withTrashed();
        }
        
        // Apply filters
        if ($request->filled('department_id')) {
            $query->where('department_id', $request->department_id);
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
        
        $faculty = $query->orderByDesc('created_at')->get();
        return response()->json($faculty);
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
            'email_address' => 'required|email|unique:faculty_profiles,email_address',
            'address' => 'required|string',
            'department_id' => 'required|exists:departments,department_id',
        ]);

        // Create faculty profile (admin-only system, no user accounts needed)
        $faculty = FacultyProfile::create($validated);

        return response()->json($faculty->load('department'), 201);
    }

    public function updateJson(Request $request, FacultyProfile $faculty)
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
                Rule::unique('faculty_profiles', 'email_address')->ignore($faculty->faculty_id, 'faculty_id')
            ],
            'address' => 'required|string',
            'department_id' => 'required|exists:departments,department_id',
        ]);

        $faculty->update($validated);
        return response()->json($faculty->load('department'));
    }

    public function indexWeb(Request $request)
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
                  ->orWhere('email_address', 'like', "%{$search}%");
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

    public function storeWeb(Request $request)
    {
        $validated = $request->validate([
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

        // Create faculty profile (admin-only system, no user accounts needed)
        FacultyProfile::create($validated);

        return redirect()->route('admin.faculty.index')
            ->with('success', 'Faculty member added successfully.');
    }

    public function edit(FacultyProfile $faculty)
    {
        $departments = Department::all();
        return view('admin.faculty.edit', compact('faculty', 'departments'));
    }

    public function updateWeb(Request $request, FacultyProfile $faculty)
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
        // Archive the faculty profile (soft delete)
        $faculty->delete();

        return redirect()->route('admin.faculty.index')
            ->with('success', 'Faculty member archived successfully.');
    }
}
