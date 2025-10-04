<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\StudentProfile;
use App\Models\FacultyProfile;
use App\Models\Department;
use App\Models\Course;
use App\Models\AcademicYear;
use Illuminate\Http\Request;

class ArchiveController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware('role:admin');
    }

    public function index(Request $request)
    {
        $type = $request->input('type');
        $courseId = $request->input('course_id');
        $departmentId = $request->input('department_id');
        $academicYearId = $request->input('academic_year_id');
        $search = $request->input('search');

        $items = [];

        if (!$type || $type === 'students') {
            $q = StudentProfile::onlyTrashed()->with(['department', 'course']);
            if ($courseId) $q->where('course_id', $courseId);
            if ($departmentId) $q->where('department_id', $departmentId);
            if ($search) {
                $q->where(function($qq) use ($search) {
                    $qq->where('f_name', 'like', "%{$search}%")
                       ->orWhere('m_name', 'like', "%{$search}%")
                       ->orWhere('l_name', 'like', "%{$search}%")
                       ->orWhere('email_address', 'like', "%{$search}%");
                });
            }
            foreach ($q->get() as $s) {
                $items[] = [
                    '_type' => 'student',
                    '_id' => $s->student_id,
                    '_label' => ($s->f_name . ' ' . $s->l_name),
                    '_department' => optional($s->department)->department_name,
                    '_course' => optional($s->course)->course_name,
                    '_academic_year' => null,
                    'archived_at' => optional($s->archived_at)->toDateTimeString(),
                    'student_id' => $s->student_id,
                ];
            }
        }

        if (!$type || $type === 'faculty') {
            $q = FacultyProfile::onlyTrashed()->with(['department']);
            if ($departmentId) $q->where('department_id', $departmentId);
            if ($search) {
                $q->where(function($qq) use ($search) {
                    $qq->where('f_name', 'like', "%{$search}%")
                       ->orWhere('m_name', 'like', "%{$search}%")
                       ->orWhere('l_name', 'like', "%{$search}%")
                       ->orWhere('email_address', 'like', "%{$search}%");
                });
            }
            foreach ($q->get() as $f) {
                $items[] = [
                    '_type' => 'faculty',
                    '_id' => $f->faculty_id,
                    '_label' => ($f->f_name . ' ' . $f->l_name),
                    '_department' => optional($f->department)->department_name,
                    '_course' => null,
                    '_academic_year' => null,
                    'archived_at' => optional($f->archived_at)->toDateTimeString(),
                    'faculty_id' => $f->faculty_id,
                ];
            }
        }

        if (!$type || $type === 'departments') {
            $q = Department::onlyTrashed();
            if ($search) $q->where('department_name', 'like', "%{$search}%");
            foreach ($q->get() as $d) {
                $items[] = [
                    '_type' => 'department',
                    '_id' => $d->department_id,
                    '_label' => $d->department_name,
                    '_department' => null,
                    '_course' => null,
                    '_academic_year' => null,
                    'archived_at' => optional($d->archived_at)->toDateTimeString(),
                    'department_id' => $d->department_id,
                ];
            }
        }

        if (!$type || $type === 'courses') {
            $q = Course::onlyTrashed();
            if ($search) $q->where('course_name', 'like', "%{$search}%");
            foreach ($q->get() as $c) {
                $items[] = [
                    '_type' => 'course',
                    '_id' => $c->course_id,
                    '_label' => $c->course_name,
                    '_department' => null,
                    '_course' => $c->course_name,
                    '_academic_year' => null,
                    'archived_at' => optional($c->archived_at)->toDateTimeString(),
                    'course_id' => $c->course_id,
                ];
            }
        }

        if (!$type || $type === 'academic_years') {
            $q = AcademicYear::onlyTrashed();
            if ($search) $q->where('school_year', 'like', "%{$search}%");
            foreach ($q->get() as $a) {
                $items[] = [
                    '_type' => 'academic_year',
                    '_id' => $a->academic_year_id,
                    '_label' => $a->school_year,
                    '_department' => null,
                    '_course' => null,
                    '_academic_year' => $a->school_year,
                    'archived_at' => optional($a->archived_at)->toDateTimeString(),
                    'academic_year_id' => $a->academic_year_id,
                ];
            }
        }

        usort($items, function($l, $r) {
            return strcmp($r['archived_at'] ?? '', $l['archived_at'] ?? '');
        });

        return response()->json(array_values($items));
    }
}


