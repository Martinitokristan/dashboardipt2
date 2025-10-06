<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DepartmentController extends Controller
{
    public function __construct()
    {
        // Middleware is applied at route level
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Department::query();
        if ($request->boolean('archived')) {
            $query->withTrashed();
        }
        $departments = $query->orderByDesc('created_at')->get();
        return response()->json($departments);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'department_name' => 'required|string|max:255|unique:departments,department_name',
            'department_head' => 'nullable|string|max:255',
        ]);
        
        $department = Department::create($validated);
        return response()->json($department, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $department = Department::withTrashed()->findOrFail($id);
        return response()->json($department);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $department = Department::findOrFail($id);
        
        $validated = $request->validate([
            'department_name' => [
                'required', 'string', 'max:255',
                Rule::unique('departments', 'department_name')->ignore($department->department_id, 'department_id')
            ],
            'department_head' => 'nullable|string|max:255',
        ]);
        
        $department->update($validated);
        return response()->json($department);
    }

    /**
     * Archive the specified resource.
     */
    public function archive(Request $request, $id)
    {
        $department = Department::withTrashed()->findOrFail($id);
        if ($department->trashed()) {
            return response()->json(['message' => 'Already archived'], 200);
        }
        $department->delete();
        return response()->json($department->fresh());
    }

    /**
     * Unarchive the specified resource.
     */
    public function unarchive(Request $request, $id)
    {
        $department = Department::withTrashed()->findOrFail($id);
        if (!$department->trashed()) {
            return response()->json(['message' => 'Not archived'], 200);
        }
        $department->restore();
        return response()->json($department->fresh());
    }
}
