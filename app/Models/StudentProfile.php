<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class StudentProfile extends Model
{
    use SoftDeletes;

    protected $primaryKey = 'student_id';
    public $incrementing = true;
    protected $keyType = 'int';

    const DELETED_AT = 'archived_at'; // Use archived_at for soft deletes

    protected $fillable = [
        'f_name',
        'm_name',
        'l_name',
        'suffix',
        'date_of_birth',
        'sex',
        'phone_number',
        'email_address',
        'address',
        'status',
        'department_id',
        'course_id',
        'academic_year_id',
        'year_level',
    ];

    protected $dates = [
        'date_of_birth',
        'archived_at',
    ];

    public function department()
    {
        return $this->belongsTo(Department::class, 'department_id');
    }

    public function course()
    {
        return $this->belongsTo(Course::class, 'course_id');
    }

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class, 'academic_year_id');
    }

    public function getFullNameAttribute()
    {
        $name = trim("{$this->f_name}");
        if ($this->m_name) {
            $name .= " " . trim($this->m_name);
        }
        $name .= " " . trim($this->l_name);
        if ($this->suffix) {
            $name .= " " . trim($this->suffix);
        }
        return trim($name);
    }
}