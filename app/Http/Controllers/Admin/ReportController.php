<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\Course;
use App\Models\Department;
use App\Models\FacultyProfile;
use App\Models\StudentProfile;
use App\Services\GoogleSheetsExportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ReportController extends Controller
{
    public const STUDENT_STATUSES = ['active', 'inactive', 'graduated', 'archived'];
    public const FACULTY_STATUSES = ['active', 'inactive', 'archived'];

    private $sheets; // or: private GoogleSheetsExportService $sheets;

    public function __construct(GoogleSheetsExportService $sheets)
    {
        $this->sheets = $sheets;
    }

    public function getOptions(): JsonResponse
    {
        try {
            $departments = Department::query()
                ->whereNull('archived_at')
                ->orderBy('department_name')
                ->get(['department_id', 'department_name']);

            $courses = Course::query()
                ->whereNull('archived_at')
                ->orderBy('course_name')
                ->get(['course_id', 'course_name', 'department_id']);

            $academicYears = AcademicYear::query()
                ->whereNull('archived_at')
                ->orderBy('school_year', 'desc')
                ->get(['academic_year_id', 'school_year']);

            return response()->json([
                'success' => true,
                'data' => [
                    'departments' => $departments,
                    'courses' => $courses,
                    'academic_years' => $academicYears,
                ],
            ]);
        } catch (\Throwable $e) {
            report($e);

            return response()->json([
                'success' => false,
                'message' => 'Failed to load report options. Please try again later.',
            ], 500);
        }
    }

    public function generateStudentReport(Request $request)
    {
        \Log::info('Request data:', $request->all());

        $validated = $request->validate([
            'course_id' => ['nullable', 'integer', 'exists:courses,course_id'],
            'export' => ['required', 'string'],
            // ...other rules
        ]);

        $query = StudentProfile::query()
            ->with(['course', 'department', 'academicYear'])
            ->whereNull('archived_at');

        // Only filter if course_id is present
        if (!empty($validated['course_id'])) {
            $query->where('course_id', $validated['course_id']);
        }

        // For students
        $students = $query->orderBy('student_id', 'asc')->get();

        $filters = [
            'course' => !empty($validated['course_id'] ?? null) ? Course::find($validated['course_id']) : null,
            'department' => !empty($validated['department_id'] ?? null) ? Department::find($validated['department_id']) : null,
            'academic_year' => !empty($validated['academic_year_id'] ?? null) ? AcademicYear::find($validated['academic_year_id']) : null,
            'status' => $validated['status'] ?? null,
        ];

        if (($validated['export'] ?? null) === 'google_sheets') {
            try {
                $this->sheets->exportStudentReport($students);

                return response()->json([
                    'success' => true,
                    'google_sheet_url' => 'https://docs.google.com/spreadsheets/d/' . $this->sheets->getSpreadsheetId(), // <-- use getter
                ]);
            } catch (\Throwable $e) {
                report($e);

                return response()->json([
                    'success' => false,
                    'message' => 'Failed to export student report to Google Sheets.',
                ], 500);
            }
        }

        $data = $students->map(function (StudentProfile $student) {
            return [
                'student_id' => $student->student_id,
                'f_name' => $student->f_name,
                'm_name' => $student->m_name,
                'l_name' => $student->l_name,
                'suffix' => $student->suffix,
                'email_address' => $student->email_address,
                'status' => $student->status,
                'course_name' => optional($student->course)->course_name,
                'department_name' => optional($student->department)->department_name,
                'academic_year' => optional($student->academicYear)->school_year,
            ];
        })->values();

        return response()->json([
            'success' => true,
            'students' => $data,
            'filters' => [
                'course' => $filters['course'] ? $filters['course']->only(['course_id', 'course_name']) : null,
                'department' => $filters['department'] ? $filters['department']->only(['department_id', 'department_name']) : null,
                'academic_year' => $filters['academic_year'] ? $filters['academic_year']->only(['academic_year_id', 'school_year']) : null,
                'status' => $filters['status'],
            ],
        ]);
    }

    public function importStudentReport()
    {
        $spreadsheetId = config('services.google.sheets_id');
        $this->sheets->importStudentsFromSheet($spreadsheetId);
    }

    public function generateFacultyReport(Request $request)
    {
        $validated = $request->validate([
            'department_id' => ['nullable', 'integer', 'exists:departments,department_id'],
            'status' => ['nullable', Rule::in(self::FACULTY_STATUSES)],
            'export' => ['nullable', Rule::in(['google_sheets', 'json'])],
        ]);

        $query = FacultyProfile::query()
            ->with(['department'])
            ->whereNull('archived_at');

        // Only filter if department_id is provided
        if (!empty($validated['department_id'])) {
            $query->where('department_id', $validated['department_id']);
        }

        if (!empty($validated['status'])) {
            $query->where('status', $validated['status']);
        }

        // For faculty
        $faculty = $query->orderBy('faculty_id', 'asc')->get();

        $filters = [
            'department' => !empty($validated['department_id']) ? Department::find($validated['department_id']) : null,
            'status' => $validated['status'] ?? null,
        ];

        if (($validated['export'] ?? null) === 'google_sheets') {
            try {
                // Export all faculty if no department_id, or filtered if provided
                $sheetUrl = $this->sheets->exportFacultyReport($faculty, $validated);

                return response()->json([
                    'success' => true,
                    'google_sheet_url' => $sheetUrl,
                ]);
            } catch (\Throwable $e) {
                report($e);

                return response()->json([
                    'success' => false,
                    'message' => 'Failed to export faculty report to Google Sheets.',
                ], 500);
            }
        }

        $data = $faculty->map(function (FacultyProfile $member) {
            return [
                'faculty_id' => $member->faculty_id,
                'f_name' => $member->f_name,
                'm_name' => $member->m_name,
                'l_name' => $member->l_name,
                'suffix' => $member->suffix,
                'email_address' => $member->email_address,
                'phone_number' => $member->phone_number,
                'position' => $member->position,
                'status' => $member->status,
                'department_name' => optional($member->department)->department_name ?? '',
            ];
        })->values();

        return response()->json([
            'success' => true,
            'faculty' => $data,
            'filters' => [
                'department' => $filters['department'] ? $filters['department']->only(['department_id', 'department_name']) : null,
                'status' => $filters['status'],
            ],
        ]);
    }

    public function importFacultyReport(): JsonResponse
    {
        DB::beginTransaction();

        try {
            $summary = $this->sheets->importFacultyFromSheet();
            DB::commit();

            return response()->json([
                'success' => $summary['success'],
                'message' => $summary['message'] ?? null,
                'summary' => [
                    'imported' => $summary['imported'] ?? 0,
                    'updated' => $summary['updated'] ?? 0,
                    'deleted' => $summary['deleted'] ?? 0,
                    'errors' => $summary['errors'] ?? [],
                ],
            ], ($summary['success'] ?? false) ? 200 : 422);
        } catch (\Throwable $e) {
            DB::rollBack();
            report($e);

            return response()->json([
                'success' => false,
                'message' => 'Failed to import faculty data from Google Sheets.',
            ], 500);
        }
    }

    public function exportToSheets(Request $request)
    {
        $type = $request->input('type');

        if ($type === 'faculty') {
            $departmentId = $request->input('department_id');
            $faculty = \App\Models\FacultyProfile::query()
                ->with(['department'])
                ->whereNull('archived_at');
            if ($departmentId) {
                $faculty->where('department_id', $departmentId);
            }
            $faculty = $faculty->get();
            $departmentName = $faculty->first()->department->department_name ?? 'FACULTY_REPORT';
            $tabName = strtoupper($departmentName) . ' FACULTY';
            app(GoogleSheetsExportService::class)->exportFacultyReportToTab($faculty, $tabName);
        }

        if ($type === 'student') {
            $courseId = $request->input('course_id');
            $students = \App\Models\StudentProfile::query()
                ->with(['course', 'department'])
                ->whereNull('archived_at');
            if ($courseId) {
                $students->where('course_id', $courseId);
            }
            $students = $students->get();
            $courseName = $students->first()->course->course_name ?? 'STUDENT_REPORT';
            $tabName = strtoupper($courseName) . ' STUDENT';
            app(GoogleSheetsExportService::class)->exportStudentReportToTab($students, $tabName);
        }

        return response()->json(['success' => true]);
    }

    public function exportStudentData(Request $request)
    {
        $students = StudentProfile::query()->whereNull('archived_at')->get();
        $existingCourseIds = $this->sheets->getExistingCourseIds('Students');

        $newStudents = $students->filter(function ($student) use ($existingCourseIds) {
            return !in_array($student->course_id, $existingCourseIds);
        });

        if ($newStudents->isNotEmpty()) {
            $this->sheets->appendStudentsToSheet($newStudents, 'Students');
        }

        return response()->json(['success' => true]);
    }

    public function exportFacultyData(Request $request)
    {
        $faculty = FacultyProfile::query()->whereNull('archived_at')->get();
        $existingDepartmentIds = $this->sheets->getExistingDepartmentIds('Faculty');

        $newFaculty = $faculty->filter(function ($member) use ($existingDepartmentIds) {
            return !in_array($member->department_id, $existingDepartmentIds);
        });

        if ($newFaculty->isNotEmpty()) {
            $this->sheets->appendFacultyToSheet($newFaculty, 'Faculty');
        }

        return response()->json(['success' => true]);
    }
}