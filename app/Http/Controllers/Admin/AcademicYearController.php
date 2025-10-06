<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AcademicYearController extends Controller
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
        $academicYears = AcademicYear::orderByDesc('created_at')->get();
        return response()->json($academicYears);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'school_year' => 'required|string|max:255|unique:academic_years,school_year',
        ]);
        
        $academicYear = AcademicYear::create($validated);
        return response()->json($academicYear, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $academicYear = AcademicYear::findOrFail($id);
        return response()->json($academicYear);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $academicYear = AcademicYear::findOrFail($id);
        
        $validated = $request->validate([
            'school_year' => [
                'required', 'string', 'max:255',
                Rule::unique('academic_years', 'school_year')->ignore($academicYear->academic_year_id, 'academic_year_id')
            ],
        ]);
        
        $academicYear->update($validated);
        return response()->json($academicYear);
    }
}
