<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CourseController extends Controller
{
    public function index(Request $request)
    {
        $query = Course::with('department');
        $courses = $query->orderByDesc('created_at')->get();
        return response()->json($courses);
    }

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

    public function show($id)
    {
        $course = Course::findOrFail($id);
        return response()->json($course->load('department'));
    }

    public function update(Request $request, $id)
    {
        $course = Course::findOrFail($id);

        $validated = $request->validate([
            'course_name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('courses', 'course_name')->ignore($course->course_id, 'course_id'),
            ],
            'course_status' => 'in:active,inactive',
            'department_id' => 'required|exists:departments,department_id',
        ]);

        $course->update($validated);
        return response()->json($course);
    }

    public function softDelete(Request $request, $id)
    {
        $course = Course::findOrFail($id);
        if ($course->trashed()) {
            return response()->json(['message' => 'Already deleted'], 200);
        }
        $course->delete();
        return response()->json(['message' => 'Course deleted successfully']);
    }

    public function restore(Request $request, $id)
    {
        $course = Course::withTrashed()->findOrFail($id);
        if (!$course->trashed()) {
            return response()->json(['message' => 'Not deleted'], 200);
        }
        $course->restore();
        return response()->json($course->fresh());
    }
}