<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DepartmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Department::query();
        $departments = $query->orderByDesc('created_at')->get();
        return response()->json($departments);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'department_name' => 'required|string|max:255|unique:departments,department_name',
            'department_head' => 'nullable|string|max:255',
        ]);

        $department = Department::create($validated);
        return response()->json($department, 201);
    }

    public function show($id)
    {
        $department = Department::findOrFail($id);
        return response()->json($department);
    }

    public function update(Request $request, $id)
    {
        $department = Department::findOrFail($id);

        $validated = $request->validate([
            'department_name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('departments', 'department_name')->ignore($department->department_id, 'department_id'),
            ],
            'department_head' => 'nullable|string|max:255',
        ]);

        $department->update($validated);
        return response()->json($department);
    }

    public function softDelete(Request $request, $id)
    {
        $department = Department::findOrFail($id);
        if ($department->archived_at) {
            return response()->json(['message' => 'Already archived'], 200);
        }
        $department->update(['archived_at' => now()]);
        return response()->json(['message' => 'Department archived successfully']);
    }

    public function restore(Request $request, $id)
    {
        $department = Department::findOrFail($id);
        if (!$department->archived_at) {
            return response()->json(['message' => 'Not archived'], 200);
        }
        $department->update(['archived_at' => null]);
        return response()->json($department->fresh());
    }
}