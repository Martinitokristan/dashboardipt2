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
        $courses = $query->get();
        return response()->json($courses);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'course_name' => 'required|string|max:255|unique:courses,course_name',
            'department_id' => [
                'required',
                Rule::exists('departments', 'department_id')->whereNull('archived_at'),
            ],
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
            'department_id' => [
                'required',
                Rule::exists('departments', 'department_id')->whereNull('archived_at'),
            ],
        ]);

        $course->update($validated);
        return response()->json($course);
    }

    public function archive(Request $request, $id)
    {
        $course = Course::findOrFail($id);
        if ($course->trashed()) {
            return response()->json(['message' => 'Already archived'], 200);
        }
        
        // Set all students in this course to inactive
        \App\Models\StudentProfile::where('course_id', $id)
            ->whereNull('archived_at')
            ->update(['status' => 'inactive']);
        
        $course->delete(); // Uses SoftDeletes with archived_at
        return response()->json(['message' => 'Course archived successfully']);
    }

    public function restore(Request $request, $id)
    {
        $course = Course::withTrashed()->findOrFail($id);
        if (!$course->trashed()) {
            return response()->json(['message' => 'Not archived'], 200);
        }
        
        // Set all students in this course back to active
        \App\Models\StudentProfile::where('course_id', $id)
            ->whereNull('archived_at')
            ->update(['status' => 'active']);
        
        $course->restore();
        return response()->json($course->fresh());
    }

    public function destroy($id)
    {
        $course = Course::withTrashed()->findOrFail($id);

        \App\Models\StudentProfile::withTrashed()
            ->where('course_id', $id)
            ->forceDelete();

        $course->forceDelete();

        return response()->json(['message' => 'Course permanently deleted'], 200);
    }
}