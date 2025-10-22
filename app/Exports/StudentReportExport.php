<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class StudentReportExport implements FromCollection, WithHeadings, WithMapping
{
    protected Collection $students;

    public function __construct(Collection $students)
    {
        $this->students = $students;
    }

    public function collection(): Collection
    {
        return $this->students;
    }

    public function headings(): array
    {
        return [
            'Name',
            'Email',
            'Course',
            'Department',
            'Status',
            'Academic Year',
        ];
    }

    public function map($student): array
    {
        $fullName = trim(implode(' ', array_filter([
            $student->f_name,
            $student->m_name,
            $student->l_name,
            $student->suffix,
        ])));

        return [
            $fullName,
            $student->email_address,
            optional($student->course)->course_name,
            optional($student->department)->department_name,
            $student->status,
            optional($student->academicYear)->school_year,
        ];
    }
}

class Student extends Model
{
    
    public const STUDENT_STATUSES = ['active', 'inactive', 'graduated', 'archived'];
    
}

// filepath: app/Models/Faculty.php
class Faculty extends Model
{
    
    public const FACULTY_STATUSES = ['active', 'inactive', 'archived'];
    
}

$service->spreadsheets_values->get($spreadsheetId, $range);
$service->spreadsheets_values->update($spreadsheetId, $range, $body, $params);

$students = $this->getStudents($request); // however you load students

if (empty($students)) {
    // Optionally handle the case: show a message, skip export, etc.
    return;
}

$googleSheetsExportService->exportStudentReportToTab($students, 'STUDENT_REPORT ...');

if (!is_array($students) && !($students instanceof \Traversable)) {
    return; // or handle as needed
}

$students = $students ?? [];
foreach ($students as $student) {
    // ...
}