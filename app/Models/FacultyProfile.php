<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class FacultyProfile extends Model
{
    use SoftDeletes;

    protected $primaryKey = 'faculty_id';
    public $incrementing = true;
    protected $keyType = 'int';

    const DELETED_AT = 'archived_at';

    protected $table = 'faculty_profiles'; // Ensure this line is present and correct

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
        'department_id',
    ];

    protected $dates = ['archived_at'];

    public function department()
    {
        return $this->belongsTo(Department::class, 'department_id');
    }
}