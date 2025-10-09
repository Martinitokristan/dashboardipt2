<?php

namespace App\Http\Controllers\Admin;

use App\Models\FacultyProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;

class FacultyController extends Controller
{
    public function index(Request $request)
    {
        $query = FacultyProfile::with('department')->orderByDesc('created_at');
        $faculty = $query->get();
        return Response::json($faculty);
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'f_name' => 'required|string|max:255',
                'm_name' => 'nullable|string|max:255',
                'l_name' => 'required|string|max:255',
                'suffix' => 'nullable|string|max:10',
                'date_of_birth' => 'required|date',
                'sex' => 'required|in:male,female,other',
                'phone_number' => 'required|string|max:20',
                'email_address' => 'required|email|unique:faculty_profiles,email_address',
                'address' => 'required|string|max:1000',
                'department_id' => 'nullable|exists:departments,department_id',
            ]);

            $faculty = FacultyProfile::create($validated);
            return Response::json($faculty, 201);
        } catch (\Exception $e) {
            Log::error('Error creating faculty: ', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return Response::json(['error' => 'Failed to create faculty: ' . $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        $faculty = FacultyProfile::with('department')->findOrFail($id);
        return Response::json($faculty);
    }

    public function update(Request $request, $id)
    {
        try {
            $faculty = FacultyProfile::findOrFail($id);
            $validated = $request->validate([
                'f_name' => 'required|string|max:255',
                'm_name' => 'nullable|string|max:255',
                'l_name' => 'required|string|max:255',
                'suffix' => 'nullable|string|max:10',
                'date_of_birth' => 'required|date',
                'sex' => 'required|in:male,female,other',
                'phone_number' => 'required|string|max:20',
                'email_address' => 'required|email|unique:faculty_profiles,email_address,' . $id,
                'address' => 'required|string|max:1000',
                'department_id' => 'nullable|exists:departments,department_id',
            ]);

            $faculty->update($validated);
            return Response::json($faculty);
        } catch (\Exception $e) {
            Log::error('Error updating faculty: ', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return Response::json(['error' => 'Failed to update faculty: ' . $e->getMessage()], 500);
        }
    }

    public function softDelete($faculty)
    {
        try {
            $faculty = FacultyProfile::findOrFail($faculty);
            $faculty->delete();
            return Response::json(['message' => 'Faculty archived']);
        } catch (\Exception $e) {
            Log::error('Error archiving faculty: ', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return Response::json(['error' => 'Failed to archive faculty: ' . $e->getMessage()], 500);
        }
    }

    public function restore($faculty)
    {
        try {
            $faculty = FacultyProfile::withTrashed()->findOrFail($faculty);
            $faculty->restore();
            return Response::json(['message' => 'Faculty restored']);
        } catch (\Exception $e) {
            Log::error('Error restoring faculty: ', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return Response::json(['error' => 'Failed to restore faculty: ' . $e->getMessage()], 500);
        }
    }
}