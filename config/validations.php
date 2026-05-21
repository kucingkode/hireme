<?php

use App\Enums\EducationLevel;
use Illuminate\Validation\Rules\Enum;

return [
    'cv' => [
        'personal_information.first_name' => 'string',
        'personal_information.last_name' => 'string',
        'personal_information.profile' => 'string',
        'personal_information.website_url' => 'string',
        'personal_information.address' => 'string',
        'personal_information.phone' => 'string',
        'personal_information.email' => 'email',


        'skills' => 'required|array',
        'skills.*.name' => 'required|string',
        'skills.*.score' => 'required|integer|min:1|max:5',


        'educations' => 'required|array',
        'educations.*.education_level' => 'required|string',
        'educations.*.institution' => 'required|string',
        'educations.*.city' => 'string',
        'educations.*.study_program' => 'string',
        'educations.*.start_year' => 'integer',
        'educations.*.end_year' => 'integer',
        'educations.*.score' => 'numeric',
        'educations.*.description' => 'string',


        'courses' => 'required|array',
        'courses.*.name' => 'required|string',
        'courses.*.organizer' => 'required|string',
        'courses.*.url' => 'string',
        'courses.*.description' => 'string',
        'courses.*.start_year' => 'integer',
        'courses.*.end_year' => 'integer',
        'courses.*.location' => 'string',

        'work_experiences' => 'required|array',
        'work_experiences.*.position' => 'required|string',
        'work_experiences.*.company_name' => 'required|string',
        'work_experiences.*.description' => 'string',
        'work_experiences.*.employment_status' => 'string',
        'work_experiences.*.city' => 'string',
        'work_experiences.*.start_year' => 'integer',
        'work_experiences.*.end_year' => 'integer',

        'organizations' => 'required|array',
        'organizatiions.*.position' => 'required|string',
        'organizatiions.*.organization_name' => 'required|string',
        'organizations.*.description' => 'string',
        'organizations.*.city' => 'string',
        'organizations.*.start_year' => 'string',
        'organizations.*.end_year' => 'string',

        'certificates' => 'required|array',
        'certificates.*.name' => 'required|string',
        'certificates.*.publisher' => 'required|string',
        'certificates.*.publish_date' => 'date',
        'certificates.*.verification_url' => 'string',
        'certificates.*.certificate_number' => 'string',
    ]
];
