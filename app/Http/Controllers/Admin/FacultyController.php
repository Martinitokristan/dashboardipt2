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
        try {
            Log::info('Loading faculty with request: ', $request->all());
            $query = FacultyProfile::with([
                'department' => function ($q) {
                    $q->select('department_id', 'department_name');
                },
            ])->select(
                'faculty_id',
                'f_name',
                'm_name',
                'l_name',
                'suffix',
                'date_of_birth',
                'sex',
                'phone_number',
                'email_address',
                'address',
                'department_id',
                'archived_at'
            );

            if ($request->has('onlyTrashed')) {
                $query->onlyTrashed();
            } elseif ($request->has('withTrashed')) {
                $query->withTrashed();
            }

            if ($request->has('search')) {
                $search = trim($request->search);
                $query->where(function ($q) use ($search) {
                    $q->where('l_name', 'like', "%{$search}%")
                      ->orWhere('f_name', 'like', "%{$search}%")
                      ->orWhere('email_address', 'like', "%{$search}%");
                });
            }
            if ($request->has('department_id')) {
                $query->where('department_id', $request->department_id);
            }

            $faculty = $query->orderBy('l_name', 'asc')->get();
            Log::info('Faculty loaded successfully: ', ['count' => $faculty->count()]);
            return Response::json($faculty);
        } catch (\Illuminate\Database\QueryException $e) {
            Log::error('Database error loading faculty: ', ['message' => $e->getMessage(), 'sql' => $e->getSql(), 'bindings' => $e->getBindings(), 'trace' => $e->getTraceAsString()]);
            return Response::json(['error' => 'Database error: ' . $e->getMessage()], 500);
        } catch (\Exception $e) {
            Log::error('General error loading faculty: ', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return Response::json(['error' => 'Failed to load faculty: ' . $e->getMessage()], 500);
        }
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
        try {
            $faculty = FacultyProfile::with('department')->findOrFail($id);
            return Response::json($faculty);
        } catch (\Exception $e) {
            Log::error('Error showing faculty: ', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return Response::json(['error' => 'Faculty not found: ' . $e->getMessage()], 404);
        }
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
                'email_address' => 'required|email|unique:faculty_profiles,email_address,' . $id . ',faculty_id',
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

    public function archive($id)
    {
        try {
            $faculty = FacultyProfile::findOrFail($id);
            $faculty->delete();
            return Response::json(['message' => 'Faculty archived'], 200);
        } catch (\Exception $e) {
            Log::error('Error archiving faculty: ', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return Response::json(['error' => 'Failed to archive faculty: ' . $e->getMessage()], 500);
        }
    }

    public function restore($id)
    {
        try {
            $faculty = FacultyProfile::withTrashed()->findOrFail($id);
            $faculty->restore();
            return Response::json(['message' => 'Faculty restored'], 200);
        } catch (\Exception $e) {
            Log::error('Error restoring faculty: ', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return Response::json(['error' => 'Failed to restore faculty: ' . $e->getMessage()], 500);
        }
    }
}