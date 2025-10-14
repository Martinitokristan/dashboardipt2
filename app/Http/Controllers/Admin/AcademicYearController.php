<?php

namespace App\Http\Controllers\Admin;

use App\Models\AcademicYear;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class AcademicYearController extends Controller
{
    public function index()
    {
        $academicYears = AcademicYear::orderBy('school_year', 'desc')->get();
        return response()->json($academicYears);
    }

    public function store(Request $request)
    {
        $request->validate(['school_year' => 'required|unique:academic_years,school_year']);
        $academicYear = AcademicYear::create(['school_year' => $request->school_year]);
        return response()->json($academicYear, 201);
    }

    public function show($id)
    {
        $academicYear = AcademicYear::findOrFail($id);
        return response()->json($academicYear);
    }

    public function update(Request $request, $id)
    {
        $academicYear = AcademicYear::findOrFail($id);
        $request->validate(['school_year' => 'required|unique:academic_years,school_year,' . $id]);
        $academicYear->update(['school_year' => $request->school_year]);
        return response()->json($academicYear);
    }

    public function archive(Request $request, $id)
    {
        $academicYear = AcademicYear::findOrFail($id);
        if ($academicYear->trashed()) {
            return response()->json(['message' => 'Already archived'], 200);
        }
        $academicYear->delete(); // Uses SoftDeletes with archived_at
        return response()->json(['message' => 'Academic year archived successfully']);
    }

    public function restore(Request $request, $id)
    {
        $academicYear = AcademicYear::withTrashed()->findOrFail($id);
        if (!$academicYear->trashed()) {
            return response()->json(['message' => 'Not archived'], 200);
        }
        $academicYear->restore();
        return response()->json(['message' => 'Academic year restored successfully']);
    }
}