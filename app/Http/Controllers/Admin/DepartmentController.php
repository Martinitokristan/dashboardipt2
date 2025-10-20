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
        try {
            $query = Department::with(['departmentHead' => function ($q) {
                $q->select('faculty_id', 'f_name', 'm_name', 'l_name', 'suffix');
            }]);
            
            $departments = $query->get();
            
            // Format the department head name
            $departments->each(function ($dept) {
                if ($dept->departmentHead) {
                    $dept->department_head = trim(implode(' ', array_filter([
                        $dept->departmentHead->f_name,
                        $dept->departmentHead->m_name,
                        $dept->departmentHead->l_name,
                        $dept->departmentHead->suffix ? ', ' . $dept->departmentHead->suffix : ''
                    ])));
                } else {
                    $dept->department_head = '-';
                }
                // Remove the departmentHead relationship object to avoid React error
                unset($dept->departmentHead);
            });
            
            return response()->json($departments);
        } catch (\Exception $e) {
            \Log::error('Error loading departments: ', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'Failed to load departments: ' . $e->getMessage()], 500);
        }
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

    public function archive(Request $request, $id)
    {
        $department = Department::findOrFail($id);
        if ($department->trashed()) {
            return response()->json(['message' => 'Already archived'], 200);
        }
        $department->delete(); // Uses SoftDeletes with archived_at
        return response()->json(['message' => 'Department archived successfully']);
    }

    public function restore(Request $request, $id)
    {
        $department = Department::withTrashed()->findOrFail($id);
        if (!$department->trashed()) {
            return response()->json(['message' => 'Not archived'], 200);
        }
        $department->restore();
        return response()->json($department->fresh());
    }
}