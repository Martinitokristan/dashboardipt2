<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Course extends Model
{
    use SoftDeletes;

    protected $primaryKey = 'course_id';
    public $incrementing = true;
    protected $keyType = 'int';

    const DELETED_AT = 'archived_at';

    protected $fillable = [
        'course_name',
        'course_status',
        'department_id',
    ];

    protected $dates = [
        'archived_at',
    ];

    public function students()
    {
        return $this->hasMany(StudentProfile::class, 'course_id');
    }

    public function department()
    {
        return $this->belongsTo(Department::class, 'department_id');
    }
}
