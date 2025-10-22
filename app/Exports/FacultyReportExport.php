<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class FacultyReportExport implements FromCollection, WithHeadings, WithMapping
{
    protected Collection $faculty;

    public function __construct(Collection $faculty)
    {
        $this->faculty = $faculty;
    }

    public function collection(): Collection
    {
        return $this->faculty;
    }

    public function headings(): array
    {
        return [
            'Name',
            'Email',
            'Position',
            'Department',
            'Phone',
            'Status',
        ];
    }

    public function map($facultyMember): array
    {
        $fullName = trim(implode(' ', array_filter([
            $facultyMember->f_name,
            $facultyMember->m_name,
            $facultyMember->l_name,
            $facultyMember->suffix,
        ])));

        return [
            $fullName,
            $facultyMember->email_address,
            $facultyMember->position,
            optional($facultyMember->department)->department_name,
            $facultyMember->phone_number,
            $facultyMember->status,
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

$spreadsheetId = env('GOOGLE_SHEETS_SPREADSHEET_ID');
$service->spreadsheets_values->get($spreadsheetId, $range);
$service->spreadsheets_values->update($spreadsheetId, $range, $body, $params);