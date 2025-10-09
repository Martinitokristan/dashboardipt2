<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AcademicYear extends Model
{
    use SoftDeletes;

    protected $primaryKey = 'academic_year_id';
    public $incrementing = true;
    protected $keyType = 'int';

    const DELETED_AT = 'archived_at';

    protected $fillable = [
        'school_year',
    ];

    protected $dates = [
        'archived_at',
    ];

    public function students()
    {
        return $this->hasMany(StudentProfile::class, 'academic_year_id');
    }
}