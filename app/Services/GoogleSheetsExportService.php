<?php

namespace App\Services;

use Google\Client;
use Google\Service\Sheets;
use Illuminate\Support\Facades\Log;

class GoogleSheetsExportService
{
    protected $client;
    protected $service; // <-- Use only this
    protected $spreadsheetId;
    protected $sheetName;

    public function __construct()
    {
        // ✅ Use your actual credentials path
        $credentialsPath = base_path('app/google/service-account.json');

        if (!file_exists($credentialsPath)) {
            throw new \InvalidArgumentException("Credentials file not found at path: {$credentialsPath}");
        }

        $this->client = new Client();
        $this->client->setAuthConfig($credentialsPath);
        $this->client->addScope(Sheets::SPREADSHEETS);

        $this->service = new Sheets($this->client); // <-- Only this

        // ✅ Your Google Sheet ID
        $this->spreadsheetId = '1oLHO0EYS5iC_-AEQ2LbN8-edfdRTE2PqdIWWOcZCU7g';

        // ✅ Use the correct sheet tab name (“Students”)
        $this->sheetName = 'Students';
    }

    public function exportStudentReport($students)
    {
        $values = [];
        $values[] = [
            'student_id', 'f_name', 'm_name', 'l_name', 'suffix',
            'date_of_birth', 'sex', 'phone_number', 'email_address',
            'address', 'status', 'department_id', 'course_id',
            'academic_year_id', 'year_level', 'created_at', 'updated_at', 'archived_at'
        ];

        foreach ($students as $student) {
            $values[] = [
                $student->student_id ?? '',
                $student->f_name ?? '',
                $student->m_name ?? '',
                $student->l_name ?? '',
                $student->suffix ?? '',
                $student->date_of_birth ? date('Y-m-d', strtotime($student->date_of_birth)) : '',
                $student->sex ?? '',
                $student->phone_number ?? '',
                $student->email_address ?? '',
                $student->address ?? '',
                $student->status ?? '',
                $student->department_id ?? '',
                $student->course_id ?? '',
                $student->academic_year_id ?? '',
                $student->year_level ?? '',
                $student->created_at ? date('Y-m-d', strtotime($student->created_at)) : '',
                $student->updated_at ? date('Y-m-d', strtotime($student->updated_at)) : '',
                $student->archived_at ? date('Y-m-d', strtotime($student->archived_at)) : '',
            ];
        }

        $body = new Sheets\ValueRange([
            'values' => $values
        ]);
        $params = ['valueInputOption' => 'RAW'];

        try {
            $this->service->spreadsheets_values->update(
                $this->spreadsheetId,
                $this->sheetName . '!A1',
                $body,
                $params
            );
            // Auto resize columns
            $this->autoResizeColumns($this->sheetName, count($values[0]));
            Log::info('✅ Student report successfully exported to Google Sheets.');
        } catch (\Exception $e) {
            Log::error('❌ Google Sheets export failed: ' . $e->getMessage());
            throw $e;
        }
    }

    public function exportFacultyReport($faculties)
    {
        $values = [];
        $values[] = [
            'faculty_id', 'f_name', 'm_name', 'l_name', 'suffix',
            'date_of_birth', 'sex', 'phone_number', 'email_address',
            'address', 'position', 'status', 'department_id',
            'created_at', 'updated_at', 'archived_at'
        ];

        foreach ($faculties as $faculty) {
            $values[] = [
                $faculty->faculty_id ?? '',
                $faculty->f_name ?? '',
                $faculty->m_name ?? '',
                $faculty->l_name ?? '',
                $faculty->suffix ?? '',
                $faculty->date_of_birth ? date('Y-m-d', strtotime($faculty->date_of_birth)) : '',
                $faculty->sex ?? '',
                $faculty->phone_number ?? '',
                $faculty->email_address ?? '',
                $faculty->address ?? '',
                $faculty->position ?? '',
                $faculty->status ?? '',
                $faculty->department_id ?? '',
                $faculty->created_at ? date('Y-m-d H:i:s', strtotime($faculty->created_at)) : '',
                $faculty->updated_at ? date('Y-m-d H:i:s', strtotime($faculty->updated_at)) : '',
                $faculty->archived_at ? date('Y-m-d H:i:s', strtotime($faculty->archived_at)) : '',
            ];
        }

        $body = new Sheets\ValueRange([
            'values' => $values
        ]);
        $params = ['valueInputOption' => 'RAW'];

        try {
            $this->service->spreadsheets_values->update(
                $this->spreadsheetId,
                'Faculty!A1',
                $body,
                $params
            );
            // Auto resize columns
            $this->autoResizeColumns('Faculty', count($values[0]));
            Log::info('✅ Faculty report successfully exported to Google Sheets.');
        } catch (\Exception $e) {
            Log::error('❌ Google Sheets faculty export failed: ' . $e->getMessage());
            throw $e;
        }
    }

    public function exportStudentReportToTab($students, $sheetTabName)
    {
        $values = [
            ['Student ID', 'Name', 'Email', 'Course', 'Department', 'Status'],
        ];

        if (is_array($students) || $students instanceof \Traversable) {
            foreach ($students as $student) {
                $values[] = [
                    $student->student_id,
                    trim("{$student->f_name} {$student->m_name} {$student->l_name} {$student->suffix}"),
                    $student->email_address,
                    optional($student->course)->course_name,
                    optional($student->department)->department_name,
                    $student->status,
                ];
            }
        } else {
            \Log::warning('No students to export', ['students' => $students]);
        }

        $spreadsheetId = $this->spreadsheetId;
        $service = $this->service;

        // 1. Check if the sheet/tab exists
        $spreadsheet = $service->spreadsheets->get($spreadsheetId);
        $sheetId = null;
        foreach ($spreadsheet->getSheets() as $sheet) {
            if ($sheet->getProperties()->getTitle() === $sheetTabName) {
                $sheetId = $sheet->getProperties()->getSheetId();
                break;
            }
        }

        // 2. If not, create the sheet/tab
        if (!$sheetId) {
            $addSheetRequest = new \Google\Service\Sheets\Request([
                'addSheet' => [
                    'properties' => [
                        'title' => $sheetTabName,
                    ],
                ],
            ]);
            $batchUpdateRequest = new \Google\Service\Sheets\BatchUpdateSpreadsheetRequest([
                'requests' => [$addSheetRequest],
            ]);
            $response = $service->spreadsheets->batchUpdate($spreadsheetId, $batchUpdateRequest);
            $sheetId = $response->getReplies()[0]->getAddSheet()->getProperties()->getSheetId();
        } else {
            // 3. If exists, clear the sheet/tab
            $service->spreadsheets_values->clear(
                $spreadsheetId,
                $sheetTabName,
                new \Google\Service\Sheets\ClearValuesRequest()
            );
        }

        // 4. Write data to the tab
        $body = new \Google\Service\Sheets\ValueRange(['values' => $values]);
        $params = ['valueInputOption' => 'RAW'];
        $service->spreadsheets_values->update(
            $spreadsheetId,
            $sheetTabName . '!A1',
            $body,
            $params
        );
    }

    public function exportFacultyReportToTab($faculty, $sheetTabName)
    {
        $values = [
            ['Faculty ID', 'Name', 'Email', 'Department', 'Status'],
        ];
        foreach ($faculty as $member) {
            $values[] = [
                $member->faculty_id,
                trim("{$member->f_name} {$member->m_name} {$member->l_name} {$member->suffix}"),
                $member->email_address,
                optional($member->department)->department_name,
                $member->status,
            ];
        }

        $spreadsheetId = $this->spreadsheetId;
        $service = $this->service;

        // 1. Check if the sheet/tab exists
        $spreadsheet = $service->spreadsheets->get($spreadsheetId);
        $sheetId = null;
        foreach ($spreadsheet->getSheets() as $sheet) {
            if ($sheet->getProperties()->getTitle() === $sheetTabName) {
                $sheetId = $sheet->getProperties()->getSheetId();
                break;
            }
        }

        // 2. If not, create the sheet/tab
        if (!$sheetId) {
            $addSheetRequest = new \Google\Service\Sheets\Request([
                'addSheet' => [
                    'properties' => [
                        'title' => $sheetTabName,
                    ],
                ],
            ]);
            $batchUpdateRequest = new \Google\Service\Sheets\BatchUpdateSpreadsheetRequest([
                'requests' => [$addSheetRequest],
            ]);
            $response = $service->spreadsheets->batchUpdate($spreadsheetId, $batchUpdateRequest);
            $sheetId = $response->getReplies()[0]->getAddSheet()->getProperties()->getSheetId();
        } else {
            // 3. If exists, clear the sheet/tab
            $service->spreadsheets_values->clear(
                $spreadsheetId,
                $sheetTabName,
                new \Google\Service\Sheets\ClearValuesRequest()
            );
        }

        // 4. Write data to the tab
        $body = new \Google\Service\Sheets\ValueRange(['values' => $values]);
        $params = ['valueInputOption' => 'RAW'];
        $service->spreadsheets_values->update(
            $spreadsheetId,
            $sheetTabName . '!A1',
            $body,
            $params
        );
    }

    /**
     * Auto resize columns in a sheet tab.
     */
    protected function autoResizeColumns($sheetName, $columnCount)
    {
        // Get the sheet ID by name
        $spreadsheet = $this->service->spreadsheets->get($this->spreadsheetId);
        $sheetId = null;
        foreach ($spreadsheet->getSheets() as $sheet) {
            if ($sheet->getProperties()->getTitle() === $sheetName) {
                $sheetId = $sheet->getProperties()->getSheetId();
                break;
            }
        }
        if ($sheetId === null) {
            return;
        }

        $requests = [
            [
                'autoResizeDimensions' => [
                    'dimensions' => [
                        'sheetId' => $sheetId,
                        'dimension' => 'COLUMNS',
                        'startIndex' => 0,
                        'endIndex' => $columnCount,
                    ]
                ]
            ]
        ];

        $batchUpdateRequest = new Sheets\BatchUpdateSpreadsheetRequest([
            'requests' => $requests
        ]);
        $this->service->spreadsheets->batchUpdate($this->spreadsheetId, $batchUpdateRequest);
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

        return response()->json(['success' => true]);
    }
}
