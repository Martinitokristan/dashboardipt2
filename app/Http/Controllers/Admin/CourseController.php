<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CourseController extends Controller
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
        $query = Course::with('department');
        if ($request->boolean('archived')) {
            $query->withTrashed();
        }
        $courses = $query->orderByDesc('created_at')->get();
        return response()->json($courses);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
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

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $course = Course::withTrashed()->findOrFail($id);
        return response()->json($course->load('department'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $course = Course::findOrFail($id);
        
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

    /**
     * Archive the specified resource.
     */
    public function archive(Request $request, $id)
    {
        $course = Course::withTrashed()->findOrFail($id);
        if ($course->trashed()) {
            return response()->json(['message' => 'Already archived'], 200);
        }
        $course->delete();
        return response()->json($course->fresh());
    }

    /**
     * Unarchive the specified resource.
     */
    public function unarchive(Request $request, $id)
    {
        $course = Course::withTrashed()->findOrFail($id);
        if (!$course->trashed()) {
            return response()->json(['message' => 'Not archived'], 200);
        }
        $course->restore();
        return response()->json($course->fresh());
    }
}
