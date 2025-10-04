<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Department;
use App\Models\Course;
use App\Models\AcademicYear;
use App\Models\StudentProfile;
use App\Models\FacultyProfile;

class SampleDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Create sample departments
        $dept1 = Department::create([
            'department_name' => 'Computer Science',
            'department_head' => 'Dr. Smith'
        ]);
        
        $dept2 = Department::create([
            'department_name' => 'Mathematics',
            'department_head' => 'Dr. Johnson'
        ]);
        
        $dept3 = Department::create([
            'department_name' => 'Engineering',
            'department_head' => 'Dr. Brown'
        ]);

        // Create sample courses
        $course1 = Course::create([
            'course_name' => 'Computer Science',
            'department_id' => $dept1->department_id,
            'course_status' => 'active'
        ]);
        
        $course2 = Course::create([
            'course_name' => 'Information Technology',
            'department_id' => $dept1->department_id,
            'course_status' => 'active'
        ]);
        
        $course3 = Course::create([
            'course_name' => 'Business Administration',
            'department_id' => $dept2->department_id,
            'course_status' => 'active'
        ]);
        
        $course4 = Course::create([
            'course_name' => 'Engineering',
            'department_id' => $dept3->department_id,
            'course_status' => 'active'
        ]);

        // Create academic years
        $ay1 = AcademicYear::create(['school_year' => '2024-2025']);
        $ay2 = AcademicYear::create(['school_year' => '2025-2026']);

        // Create sample faculty
        FacultyProfile::create([
            'f_name' => 'John',
            'l_name' => 'Doe',
            'email_address' => 'john.doe@example.com',
            'phone_number' => '1234567890',
            'address' => '123 Main St',
            'position' => 'Professor',
            'department_id' => $dept1->department_id,
            'sex' => 'male',
            'date_of_birth' => '1980-01-01'
        ]);

        FacultyProfile::create([
            'f_name' => 'Jane',
            'l_name' => 'Smith',
            'email_address' => 'jane.smith@example.com',
            'phone_number' => '1234567891',
            'address' => '456 Oak Ave',
            'position' => 'Associate Professor',
            'department_id' => $dept2->department_id,
            'sex' => 'female',
            'date_of_birth' => '1985-05-15'
        ]);

        FacultyProfile::create([
            'f_name' => 'Mike',
            'l_name' => 'Johnson',
            'email_address' => 'mike.johnson@example.com',
            'phone_number' => '1234567892',
            'address' => '789 Pine St',
            'position' => 'Assistant Professor',
            'department_id' => $dept3->department_id,
            'sex' => 'male',
            'date_of_birth' => '1990-03-20'
        ]);

        // Create sample students
        StudentProfile::create([
            'f_name' => 'Alice',
            'l_name' => 'Brown',
            'email_address' => 'alice.brown@example.com',
            'phone_number' => '9876543210',
            'address' => '321 Elm St',
            'status' => 'active',
            'department_id' => $dept1->department_id,
            'course_id' => $course1->course_id,
            'academic_year_id' => $ay1->academic_year_id,
            'sex' => 'female',
            'date_of_birth' => '2000-08-10'
        ]);

        StudentProfile::create([
            'f_name' => 'Bob',
            'l_name' => 'Wilson',
            'email_address' => 'bob.wilson@example.com',
            'phone_number' => '9876543211',
            'address' => '654 Maple Ave',
            'status' => 'active',
            'department_id' => $dept1->department_id,
            'course_id' => $course2->course_id,
            'academic_year_id' => $ay1->academic_year_id,
            'sex' => 'male',
            'date_of_birth' => '2001-12-05'
        ]);

        StudentProfile::create([
            'f_name' => 'Carol',
            'l_name' => 'Davis',
            'email_address' => 'carol.davis@example.com',
            'phone_number' => '9876543212',
            'address' => '987 Cedar Rd',
            'status' => 'active',
            'department_id' => $dept2->department_id,
            'course_id' => $course3->course_id,
            'academic_year_id' => $ay2->academic_year_id,
            'sex' => 'female',
            'date_of_birth' => '2002-04-18'
        ]);

        StudentProfile::create([
            'f_name' => 'David',
            'l_name' => 'Miller',
            'email_address' => 'david.miller@example.com',
            'phone_number' => '9876543213',
            'address' => '147 Birch Ln',
            'status' => 'active',
            'department_id' => $dept3->department_id,
            'course_id' => $course4->course_id,
            'academic_year_id' => $ay2->academic_year_id,
            'sex' => 'male',
            'date_of_birth' => '2001-09-22'
        ]);

        $this->command->info('Sample data created successfully!');
    }
}