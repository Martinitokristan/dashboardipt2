<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Department extends Model
{
    use SoftDeletes;

    /**
     * Scope a query to only include active departments.
     */
    public function scopeActive($query)
    {
        return $query->whereNull('archived_at');
    }

    protected $primaryKey = 'department_id';
    public $incrementing = true;
    protected $keyType = 'int';

    const DELETED_AT = 'archived_at';

    protected $fillable = [
        'department_name',
        'department_head_id',
    ];

    protected $dates = [
        'archived_at',
    ];

    public function students()
    {
        return $this->hasMany(StudentProfile::class, 'department_id');
    }

    public function faculty()
    {
        return $this->hasMany(FacultyProfile::class, 'department_id');
    }

    public function departmentHead()
    {
        return $this->belongsTo(FacultyProfile::class, 'department_head_id', 'faculty_id');
    }
}