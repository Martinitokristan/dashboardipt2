<?php

namespace App\Services;

use Google\Client;
use Google\Service\Sheets;
use Illuminate\Support\Facades\Log;

class GoogleSheetsExportService
{
    protected $client;
    protected $service; // <-- Use only this
    public $spreadsheetId;
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
        $this->spreadsheetId = '1UGytf-SSjVcb1DWDwFTr9R33m6CNbcYU0R_Wit8sYro';

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
                $faculty->created_at ? date('Y-m-d', strtotime($faculty->created_at)) : '',
                $faculty->updated_at ? date('Y-m-d', strtotime($faculty->updated_at)) : '',
                $faculty->archived_at ? date('Y-m-d', strtotime($faculty->archived_at)) : '',
            ];
        }

        $body = new Sheets\ValueRange([
            'values' => $values
        ]);
        $params = ['valueInputOption' => 'RAW'];

        try {
            // Before sending to Google Sheets
            \Log::info('Exporting faculty data:', ['data' => $values]);

            $response = $this->service->spreadsheets_values->update(
                $this->spreadsheetId,
                'Faculty!A1',
                $body,
                $params
            );

            // After sending to Google Sheets
            \Log::info('Google Sheets API response:', ['response' => $response]);

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
        $header = ['Student ID', 'Name', 'Email', 'Course', 'Department', 'Status'];
        $values = [$header];

        foreach ($students as $student) {
            $values[] = [
                $student->student_id ?? '',
                trim("{$student->f_name} {$student->m_name} {$student->l_name} {$student->suffix}"),
                $student->email_address ?? '',
                optional($student->course)->course_name ?? '',
                optional($student->department)->department_name ?? '',
                $student->status ?? '',
            ];
        }

        $spreadsheetId = $this->spreadsheetId;
        $service = $this->service;

        // Check if tab exists and create/clear as needed
        $spreadsheet = $service->spreadsheets->get($spreadsheetId);
        $sheetExists = false;
        foreach ($spreadsheet->getSheets() as $sheet) {
            if ($sheet->getProperties()->getTitle() === $sheetTabName) {
                $sheetExists = true;
                break;
            }
        }

        if (!$sheetExists) {
            $addSheetRequest = new \Google\Service\Sheets\Request([
                'addSheet' => ['properties' => ['title' => $sheetTabName]],
            ]);
            $batchUpdateRequest = new \Google\Service\Sheets\BatchUpdateSpreadsheetRequest([
                'requests' => [$addSheetRequest],
            ]);
            $service->spreadsheets->batchUpdate($spreadsheetId, $batchUpdateRequest);
            sleep(1);
        } else {
            $service->spreadsheets_values->clear(
                $spreadsheetId,
                $sheetTabName,
                new \Google\Service\Sheets\ClearValuesRequest()
            );
        }

        $body = new \Google\Service\Sheets\ValueRange(['values' => $values]);
        $params = ['valueInputOption' => 'RAW'];
        $this->service->spreadsheets_values->update(
            $this->spreadsheetId,
            $sheetTabName . '!A1',
            $body,
            $params
        );

        // Auto resize columns after export
        $this->autoResizeColumns($sheetTabName, count($header));
    }

    public function exportFacultyReportToTab($faculties, $sheetTabName)
    {
        $header = ['Faculty ID', 'Name', 'Email', 'Phone', 'Department', 'Position'];
        $values = [$header];

        foreach ($faculties as $faculty) {
            $values[] = [
                $faculty->faculty_id ?? '',
                trim("{$faculty->f_name} {$faculty->m_name} {$faculty->l_name} {$faculty->suffix}"),
                $faculty->email_address ?? '',
                $faculty->phone_number ?? '',
                optional($faculty->department)->department_name ?? '',
                $faculty->position ?? '',
            ];
        }

        $spreadsheetId = $this->spreadsheetId;
        $service = $this->service;

        // Check if tab exists and create/clear as needed
        $spreadsheet = $service->spreadsheets->get($spreadsheetId);
        $sheetExists = false;
        foreach ($spreadsheet->getSheets() as $sheet) {
            if ($sheet->getProperties()->getTitle() === $sheetTabName) {
                $sheetExists = true;
                break;
            }
        }

        if (!$sheetExists) {
            $addSheetRequest = new \Google\Service\Sheets\Request([
                'addSheet' => ['properties' => ['title' => $sheetTabName]],
            ]);
            $batchUpdateRequest = new \Google\Service\Sheets\BatchUpdateSpreadsheetRequest([
                'requests' => [$addSheetRequest],
            ]);
            $service->spreadsheets->batchUpdate($spreadsheetId, $batchUpdateRequest);
            sleep(1);
        } else {
            $service->spreadsheets_values->clear(
                $spreadsheetId,
                $sheetTabName,
                new \Google\Service\Sheets\ClearValuesRequest()
            );
        }

        $body = new \Google\Service\Sheets\ValueRange(['values' => $values]);
        $params = ['valueInputOption' => 'RAW'];
        $this->service->spreadsheets_values->update(
            $this->spreadsheetId,
            $sheetTabName . '!A1',
            $body,
            $params
        );

        // Auto resize columns after export
        $this->autoResizeColumns($sheetTabName, count($header));
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

    public function exportStudentsByCourseToTabs($students)
    {
        $spreadsheetId = $this->spreadsheetId;
        $service = $this->service;

        // Group students by course
        $grouped = [];
        foreach ($students as $student) {
            $courseName = $student->course_name ?? 'Unknown Course';
            $grouped[$courseName][] = $student;
        }

        foreach ($grouped as $courseName => $courseStudents) {
            $header = ['Student ID', 'Name', 'Email', 'Course', 'Department', 'Status'];
            $values = [$header];
            foreach ($courseStudents as $student) {
                $values[] = [
                    $student->student_id ?? '',
                    trim("{$student->f_name} {$student->m_name} {$student->l_name} {$student->suffix}"),
                    $student->email_address ?? '',
                    $student->course_name ?? '',
                    $student->department_name ?? '',
                    $student->status ?? '',
                ];
            }

            // Check if tab exists, create or clear
            $spreadsheet = $service->spreadsheets->get($spreadsheetId);
            $sheetExists = false;
            foreach ($spreadsheet->getSheets() as $sheet) {
                if ($sheet->getProperties()->getTitle() === $courseName) {
                    $sheetExists = true;
                    break;
                }
            }
            if (!$sheetExists) {
                $addSheetRequest = new \Google\Service\Sheets\Request([
                    'addSheet' => ['properties' => ['title' => $courseName]],
                ]);
                $batchUpdateRequest = new \Google\Service\Sheets\BatchUpdateSpreadsheetRequest([
                    'requests' => [$addSheetRequest],
                ]);
                $service->spreadsheets->batchUpdate($spreadsheetId, $batchUpdateRequest);
                sleep(1);
            } else {
                $service->spreadsheets_values->clear(
                    $spreadsheetId,
                    $courseName,
                    new \Google\Service\Sheets\ClearValuesRequest()
                );
            }

            $body = new \Google\Service\Sheets\ValueRange(['values' => $values]);
            $params = ['valueInputOption' => 'RAW'];
            $service->spreadsheets_values->update(
                $spreadsheetId,
                $courseName . '!A1',
                $body,
                $params
            );
            $this->autoResizeColumns($courseName, count($header)); // <-- Add this
        }
    }

    public function exportFacultyByDepartmentToTabs($faculties)
    {
        $spreadsheetId = $this->spreadsheetId;
        $service = $this->service;

        // Group faculty by department
        $grouped = [];
        foreach ($faculties as $faculty) {
            $deptName = $faculty->department_name ?? 'Unknown Department';
            $grouped[$deptName][] = $faculty;
        }

        foreach ($grouped as $deptName => $deptMembers) {
            $header = ['Faculty ID', 'Name', 'Email', 'Phone', 'Department', 'Position'];
            $values = [$header];
            foreach ($deptMembers as $faculty) {
                $values[] = [
                    $faculty->faculty_id ?? '',
                    trim("{$faculty->f_name} {$faculty->m_name} {$faculty->l_name} {$faculty->suffix}"),
                    $faculty->email_address ?? '',
                    $faculty->phone_number ?? '',
                    $faculty->department_name ?? '',
                    $faculty->position ?? '',
                ];
            }

            // Check if tab exists, create or clear
            $spreadsheet = $service->spreadsheets->get($spreadsheetId);
            $sheetExists = false;
            foreach ($spreadsheet->getSheets() as $sheet) {
                if ($sheet->getProperties()->getTitle() === $deptName) {
                    $sheetExists = true;
                    break;
                }
            }
            if (!$sheetExists) {
                $addSheetRequest = new \Google\Service\Sheets\Request([
                    'addSheet' => ['properties' => ['title' => $deptName]],
                ]);
                $batchUpdateRequest = new \Google\Service\Sheets\BatchUpdateSpreadsheetRequest([
                    'requests' => [$addSheetRequest],
                ]);
                $service->spreadsheets->batchUpdate($spreadsheetId, $batchUpdateRequest);
                sleep(1);
            } else {
                $service->spreadsheets_values->clear(
                    $spreadsheetId,
                    $deptName,
                    new \Google\Service\Sheets\ClearValuesRequest()
                );
            }

            $body = new \Google\Service\Sheets\ValueRange(['values' => $values]);
            $params = ['valueInputOption' => 'RAW'];
            $service->spreadsheets_values->update(
                $spreadsheetId,
                $deptName . '!A1',
                $body,
                $params
            );
            $this->autoResizeColumns($deptName, count($header)); // <-- Add this
        }
    }

    public function getExistingCourseIds($sheetName = 'Students')
    {
        $range = $sheetName . '!A2:Z'; // Assuming course_id is in a column
        $response = $this->service->spreadsheets_values->get($this->spreadsheetId, $range);
        $values = $response->getValues();

        $courseIds = [];
        foreach ($values as $row) {
            // Adjust index if course_id is not in column A
            $courseIds[] = $row[3] ?? null; // Example: column D (index 3) is course_id
        }
        return array_filter($courseIds);
    }
    public function getExistingDepartmentIds($sheetName = 'Faculty')
    {
        $range = $sheetName . '!A2:Z';
        $response = $this->service->spreadsheets_values->get($this->spreadsheetId, $range);
        $values = $response->getValues();

        $departmentIds = [];
        foreach ($values as $row) {
            $departmentIds[] = $row[6] ?? null; // Adjust index for department_id column
        }
        return array_filter($departmentIds);
    }

    public function appendStudentsToSheet($students, $sheetName = 'Students')
    {
        $values = [];
        foreach ($students as $student) {
            $values[] = [
                $student->student_id ?? '',
                $student->f_name ?? '',
                $student->m_name ?? '',
                $student->l_name ?? '',
                $student->suffix ?? '',
                $student->date_of_birth ?? '',
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

        $body = new \Google\Service\Sheets\ValueRange(['values' => $values]);
        $params = ['valueInputOption' => 'RAW', 'insertDataOption' => 'INSERT_ROWS'];
        $this->service->spreadsheets_values->append(
            $this->spreadsheetId,
            $sheetName . '!A1',
            $body,
            $params
        );
    }

    public function appendFacultyToSheet($faculty, $sheetName = 'Faculty')
    {
        $values = [];
        foreach ($faculty as $member) {
            $values[] = [
                $member->faculty_id ?? '',
                $member->f_name ?? '',
                $member->m_name ?? '',
                $member->l_name ?? '',
                $member->suffix ?? '',
                $member->date_of_birth ?? '',
                $member->sex ?? '',
                $member->phone_number ?? '',
                $member->email_address ?? '',
                $member->address ?? '',
                $member->position ?? '',
                $member->status ?? '',
                $member->department_id ?? '',
                $member->created_at ? date('Y-m-d', strtotime($member->created_at)) : '',
                $member->updated_at ? date('Y-m-d', strtotime($member->updated_at)) : '',
                $member->archived_at ? date('Y-m-d', strtotime($member->archived_at)) : '',
            ];
        }

        $body = new \Google\Service\Sheets\ValueRange(['values' => $values]);
        $params = ['valueInputOption' => 'RAW', 'insertDataOption' => 'INSERT_ROWS'];
        $this->service->spreadsheets_values->append(
            $this->spreadsheetId,
            $sheetName . '!A1',
            $body,
            $params
        );
    }

    public function getSpreadsheetId()
    {
        return $this->spreadsheetId;
    }

    public function importStudentsFromSheet($spreadsheetId)
    {
        if (!$spreadsheetId) {
            throw new \Exception("Spreadsheet ID is required");
        }

        $service = $this->service;
        $range = 'Students!A2:Q';

        $response = $service->spreadsheets_values->get($spreadsheetId, $range);
        $rows = $response->getValues();

        $imported = 0;
        $updated = 0;
        $errors = [];
        $duplicateEmails = [];
        $seenEmails = [];

        foreach ($rows as $index => $row) {
            if (empty(array_filter($row, fn ($value) => $value !== null && $value !== ''))) {
                continue; // skip blank rows
            }

            $department = null;
            $course = null;
            $academicYear = null;

            if (!empty($row[11])) {
                if (is_numeric($row[11])) {
                    $department = \App\Models\Department::find($row[11]);
                } else {
                    $department = \App\Models\Department::where('department_name', $row[11])->first();
                }
            }

            if (!empty($row[12])) {
                if (is_numeric($row[12])) {
                    $course = \App\Models\Course::find($row[12]);
                } else {
                    $course = \App\Models\Course::where('course_name', $row[12])->first();
                }
            }

            if (!empty($row[13])) {
                if (is_numeric($row[13])) {
                    $academicYear = \App\Models\AcademicYear::find($row[13]);
                } else {
                    $academicYear = \App\Models\AcademicYear::where('school_year', $row[13])->first();
                }
            }

            $rawPhone = isset($row[7]) ? trim($row[7]) : '';
            if (preg_match('/^9\d{9}$/', $rawPhone)) {
                $phone_number = '0' . $rawPhone;
            } elseif (preg_match('/^09\d{9}$/', $rawPhone)) {
                $phone_number = $rawPhone;
            } else {
                $phone_number = $rawPhone;
            }

            $rawYearLevel = isset($row[14]) ? trim($row[14]) : null;
            $yearLevelMap = [
                '1' => '1st',
                '2' => '2nd',
                '3' => '3rd',
                '4' => '4th',
                '1st' => '1st',
                '2nd' => '2nd',
                '3rd' => '3rd',
                '4th' => '4th',
            ];
            $year_level = $rawYearLevel && isset($yearLevelMap[$rawYearLevel]) ? $yearLevelMap[$rawYearLevel] : $rawYearLevel;

            $studentId = $row[0] ?? null;
            $email = strtolower(trim($row[8] ?? ''));
            $sheetRow = $index + 2; // account for header row in sheet

            if ($email !== '') {
                if (isset($seenEmails[$email])) {
                    $duplicateEmails[$email] = true;
                    $errors[] = "Duplicate email '{$email}' found in spreadsheet rows {$seenEmails[$email]} and {$sheetRow}.";
                    continue;
                }
                $seenEmails[$email] = $sheetRow;

                $existsQuery = \App\Models\StudentProfile::where('email_address', $email);
                if (!empty($studentId)) {
                    $existsQuery->where('student_id', '!=', $studentId);
                }
                $existingEmailOwner = $existsQuery->first();
                if ($existingEmailOwner) {
                    $duplicateEmails[$email] = true;
                    $errors[] = "Email '{$email}' already belongs to student ID {$existingEmailOwner->student_id}.";
                    continue;
                }
            }

            $studentData = [
                'student_id' => $studentId,
                'f_name' => $row[1] ?? '',
                'm_name' => $row[2] ?? '',
                'l_name' => $row[3] ?? '',
                'suffix' => $row[4] ?? '',
                'date_of_birth' => $row[5] ?? null,
                'sex' => $row[6] ?? '',
                'phone_number' => $phone_number,
                'email_address' => $email,
                'address' => $row[9] ?? '',
                'status' => $row[10] ?? '',
                'department_id' => $department ? $department->department_id : null,
                'course_id' => $course ? $course->course_id : null,
                'academic_year_id' => $academicYear ? $academicYear->academic_year_id : null,
                'year_level' => $year_level,
                'created_at' => $row[15] ?? null,
                'updated_at' => $row[16] ?? null,
                'archived_at' => $row[17] ?? null,
            ];

            try {
                $model = \App\Models\StudentProfile::updateOrCreate(
                    ['student_id' => $studentData['student_id']],
                    $studentData
                );

                if ($model->wasRecentlyCreated) {
                    $imported++;
                } else {
                    $updated++;
                }
            } catch (\Throwable $e) {
                $errors[] = "Row {$sheetRow}: " . $e->getMessage();
            }
        }

        return [
            'success' => empty($errors) && empty($duplicateEmails),
            'imported' => $imported,
            'updated' => $updated,
            'duplicates' => array_keys($duplicateEmails),
            'errors' => $errors,
        ];
    }

    public function importFacultyFromSheet()
    {
        $spreadsheetId = $this->spreadsheetId;
        $service = $this->service;
        $range = 'Faculty!A2:P'; // Adjust range as needed

        $response = $service->spreadsheets_values->get($spreadsheetId, $range);
        $rows = $response->getValues();

        $imported = 0;
        $updated = 0;
        $errors = [];
        $duplicateEmails = [];
        $seenEmails = [];

        foreach ($rows as $index => $row) {
            if (empty(array_filter($row, fn ($value) => $value !== null && $value !== ''))) {
                continue; // skip blank rows
            }

            // Accept either ID or name for department
            $department = null;
            if (!empty($row[12])) {
                if (is_numeric($row[12])) {
                    $department = \App\Models\Department::find($row[12]);
                } else {
                    $department = \App\Models\Department::where('department_name', $row[12])->first();
                }
            }

            // Phone number fix
            $rawPhone = isset($row[7]) ? trim($row[7]) : '';
            if (preg_match('/^9\d{9}$/', $rawPhone)) {
                $phone_number = '0' . $rawPhone;
            } elseif (preg_match('/^09\d{9}$/', $rawPhone)) {
                $phone_number = $rawPhone;
            } else {
                $phone_number = $rawPhone;
            }

            $sheetRow = $index + 2;
            $facultyId = $row[0] ?? null;
            $email = strtolower(trim($row[8] ?? ''));

            if ($email !== '') {
                if (isset($seenEmails[$email])) {
                    $duplicateEmails[$email] = true;
                    $errors[] = "Duplicate email '{$email}' found in spreadsheet rows {$seenEmails[$email]} and {$sheetRow}.";
                    continue;
                }
                $seenEmails[$email] = $sheetRow;

                $existsQuery = \App\Models\FacultyProfile::where('email_address', $email);
                if (!empty($facultyId)) {
                    $existsQuery->where('faculty_id', '!=', $facultyId);
                }
                $existingEmailOwner = $existsQuery->first();
                if ($existingEmailOwner) {
                    $duplicateEmails[$email] = true;
                    $errors[] = "Email '{$email}' already belongs to faculty ID {$existingEmailOwner->faculty_id}.";
                    continue;
                }
            }

            $facultyData = [
                'faculty_id'    => $facultyId,
                'f_name'        => $row[1] ?? '',
                'm_name'        => $row[2] ?? '',
                'l_name'        => $row[3] ?? '',
                'suffix'        => $row[4] ?? '',
                'date_of_birth' => $row[5] ?? null,
                'sex'           => $row[6] ?? '',
                'phone_number'  => $phone_number,
                'email_address' => $email,
                'address'       => $row[9] ?? '',
                'position'      => $row[10] ?? '',
                'status'        => $row[11] ?? '',
                'department_id' => $department ? $department->department_id : null,
                'created_at'    => $row[13] ?? null,
                'updated_at'    => $row[14] ?? null,
                'archived_at'   => $row[15] ?? null,
            ];

            try {
                $model = \App\Models\FacultyProfile::updateOrCreate(
                    ['faculty_id' => $facultyData['faculty_id']],
                    $facultyData
                );
                if ($model->wasRecentlyCreated) {
                    $imported++;
                } else {
                    $updated++;
                }
            } catch (\Throwable $e) {
                $errors[] = "Row {$sheetRow}: " . $e->getMessage();
            }
        }

        return [
            'success' => empty($errors) && empty($duplicateEmails),
            'imported' => $imported,
            'updated' => $updated,
            'duplicates' => array_keys($duplicateEmails),
            'errors' => $errors,
        ];
    }
}