<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Department extends Model
{
    use SoftDeletes;

    protected $primaryKey = 'department_id';
    public $incrementing = true;
    protected $keyType = 'int';

    const DELETED_AT = 'archived_at';

    protected $fillable = [
        'department_name',
        'department_head',
        'description',
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
}
