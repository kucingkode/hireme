<?php

return [
    'api_key' => env('OPENAI_API_KEY', ''),
    'tools' => [
        [
            'type' => 'function',
            'function' => [
                'name' => 'patch_cv',
                'description' => <<<EOD
Partially update one or more segments of the user's CV. Only include segments you want to update.
Set an entire segment to null to preserve its current value without modification.
Patch merge depth is only 1 — when updating a segment, you MUST restate all existing fields, not just the new ones.

## Example — personal_information
User tells you their first name is John, later tells you their email.

WRONG — this wipes first_name:
Turn 2: { email: 'john@example.com' }

CORRECT — restate all known fields:
Turn 2: { first_name: 'John', email: 'john@example.com' }

## Example — arrays (skills, educations, etc.)
Arrays are always replaced in full. You MUST include all previous items plus new ones.

WRONG — this wipes previous skills:
Turn 2: skills = [{ name: 'Laravel', score: 5 }]

CORRECT — restate all skills:
Turn 2: skills = [{ name: 'PHP', score: 4 }, { name: 'Laravel', score: 5 }]

## Rule
Before calling patch_cv, mentally merge the new information with the current CV state shown below and always pass the complete updated segment.
EOD,
                'parameters' => [
                    'type' => 'object',
                    'properties' => [
                        'personal_information' => [
                            'type' => ['object', 'null'],
                            'description' => 'Basic personal and contact information segment. Set to null to keep the existing value.',
                            'properties' => [
                                'first_name' => [
                                    'type' => 'string',
                                    'description' => 'User\'s given name.'
                                ],
                                'last_name' => [
                                    'type' => 'string',
                                    'description' => 'User\'s family or surname.'
                                ],
                                'profile' => [
                                    'type' => 'string',
                                    'description' => 'Short professional summary, 2-4 sentences describing the user\'s background, strengths, and career goals.'
                                ],
                                'website_url' => [
                                    'type' => 'string',
                                    'description' => 'URL to the user\'s personal website, portfolio, or LinkedIn profile.'
                                ],
                                'address' => [
                                    'type' => 'string',
                                    'description' => 'User\'s current residential or mailing address.'
                                ],
                                'phone' => [
                                    'type' => 'string',
                                    'description' => 'User\'s phone number in international format, e.g. +62 812 3456 7890.'
                                ],
                                'email' => [
                                    'type' => 'string',
                                    'description' => 'User\'s primary email address for professional contact.'
                                ]
                            ]
                        ],

                        'skills' => [
                            'type' => ['array', 'null'],
                            'description' => 'Skills segment. List of the user\'s professional or technical skills. Replaces the entire skills segment when provided. Set to null to keep existing skills.',
                            'items' => [
                                'type' => 'object',
                                'properties' => [
                                    'name' => [
                                        'type' => 'string',
                                        'description' => 'Name of the skill, e.g. "Laravel", "Figma", "Project Management".'
                                    ],
                                    'score' => [
                                        'type' => 'number',
                                        'description' => 'Proficiency level from 1 (beginner) to 5 (expert).'
                                    ]
                                ],
                                'required' => ['name', 'score']
                            ]
                        ],

                        'educations' => [
                            'type' => ['array', 'null'],
                            'description' => 'Educations segement. List of the user\'s educational background, from most recent to oldest. Set to null to keep existing educations.',
                            'items' => [
                                'type' => 'object',
                                'properties' => [
                                    'education_level' => [
                                        'type' => 'string',
                                        'enum' => ['SD', 'SMP', 'MTS', 'SMA', 'MA', 'SMK', 'Profesi', 'D3', 'D4', 'S1', 'S2', 'S3'],
                                        'description' => 'Indonesian education level code. SD=Elementary, SMP/MTS=Middle School, SMA/MA/SMK=High School, D3/D4=Diploma, S1=Bachelor, S2=Master, S3=Doctorate, Profesi=Professional degree.'
                                    ],
                                    'institution' => [
                                        'type' => 'string',
                                        'description' => 'Full name of the school, college, or university.'
                                    ],
                                    'city' => [
                                        'type' => 'string',
                                        'description' => 'City where the institution is located.'
                                    ],
                                    'study_program' => [
                                        'type' => 'string',
                                        'description' => 'Major, faculty, or field of study, e.g. "Informatics Engineering".'
                                    ],
                                    'description' => [
                                        'type' => 'string',
                                        'description' => 'Additional details such as GPA, thesis topic, notable achievements, or academic activities.'
                                    ],
                                    'start_year' => [
                                        'type' => 'integer',
                                        'description' => 'Year the user started this education, e.g. 2018.'
                                    ],
                                    'end_year' => [
                                        'type' => 'integer',
                                        'description' => 'Year the user completed or left this education. Omit if currently ongoing.'
                                    ],
                                    'location' => [
                                        'type' => 'string',
                                        'description' => 'Full location of the institution, e.g. "Malang, East Java, Indonesia".'
                                    ],
                                ],
                                'required' => ['education_level', 'institution']
                            ],
                        ],

                        'work_experiences' => [
                            'type' => ['array', 'null'],
                            'description' => 'Work experiences segment. List of the user\'s professional work history, from most recent to oldest. Set to null to keep existing work experiences.',
                            'items' => [
                                'type' => 'object',
                                'properties' => [
                                    'position' => [
                                        'type' => 'string',
                                        'description' => 'Job title or role held, e.g. "Backend Developer", "Marketing Manager".'
                                    ],
                                    'company_name' => [
                                        'type' => 'string',
                                        'description' => 'Name of the employer or organization.'
                                    ],
                                    'description' => [
                                        'type' => 'string',
                                        'description' => 'Summary of responsibilities, achievements, or technologies used in this role.'
                                    ],
                                    'employment_status' => [
                                        'type' => 'string',
                                        'enum' => ['Pegawai Tetap', 'Pegawai Tetap', 'Pegawai Magang', 'Freelance', 'Paruh Waktu']
                                    ],
                                    'city' => [
                                        'type' => 'string',
                                        'description' => 'City where the job was based.'
                                    ],
                                    'start_year' => [
                                        'type' => 'integer',
                                        'description' => 'Year the user started this position, e.g. 2021.'
                                    ],
                                    'end_year' => [
                                        'type' => 'integer',
                                        'description' => 'Year the user ended this position. Omit if this is the current job.'
                                    ],
                                ],
                                'required' => ['position', 'company_name']
                            ]
                        ],

                        'courses' => [
                            'type' => ['array', 'null'],
                            'description' => 'Courses segment. List of courses, bootcamps, or training programs the user has completed. Set to null to keep existing courses.',
                            'items' => [
                                'type' => 'object',
                                'properties' => [
                                    'name' => [
                                        'type' => 'string',
                                        'description' => 'Title of the course or training program, e.g. "Machine Learning Specialization".'
                                    ],
                                    'organizer' => [
                                        'type' => 'string',
                                        'description' => 'Institution or platform that provided the course, e.g. "Coursera", "Dicoding", "Udemy".'
                                    ],
                                    'url' => [
                                        'type' => 'string',
                                        'description' => 'Link to the course page or certificate verification.'
                                    ],
                                    'description' => [
                                        'type' => 'string',
                                        'description' => 'Brief summary of what was learned or covered in the course.'
                                    ],
                                    'start_year' => [
                                        'type' => 'integer',
                                        'description' => 'Year the user started the course.'
                                    ],
                                    'end_year' => [
                                        'type' => 'integer',
                                        'description' => 'Year the user completed the course. Omit if still ongoing.'
                                    ],
                                    'location' => [
                                        'type' => 'string',
                                        'description' => 'City or platform where the course was held, e.g. "Online", "Jakarta".'
                                    ],
                                ],
                                'required' => ['name', 'organizer']
                            ]
                        ],

                        'organizations' => [
                            'type' => ['array', 'null'],
                            'description' => 'Organizations segment. List of organizations, communities, or extracurricular bodies the user has been a member of. Set to null to keep existing organizations.',
                            'items' => [
                                'type' => 'object',
                                'properties' => [
                                    'position' => [
                                        'type' => 'string',
                                        'description' => 'Role or title held within the organization, e.g. "Chairman", "Secretary", "Member".'
                                    ],
                                    'organization_name' => [
                                        'type' => 'string',
                                        'description' => 'Full name of the organization or community.'
                                    ],
                                    'description' => [
                                        'type' => 'string',
                                        'description' => 'Summary of contributions, responsibilities, or achievements in this role.'
                                    ],
                                    'city' => [
                                        'type' => 'string',
                                        'description' => 'City where the organization is based or where the user was active.'
                                    ],
                                    'start_year' => [
                                        'type' => 'integer',
                                        'description' => 'Year the user joined the organization.'
                                    ],
                                    'end_year' => [
                                        'type' => 'integer',
                                        'description' => 'Year the user left the organization. Omit if still active.'
                                    ],
                                ],
                                'required' => ['position', 'organization_name']
                            ]
                        ],

                        'certificates' => [
                            'type' => ['array', 'null'],
                            'description' => 'Certificates. List of certifications or credentials the user has earned. Set to null to keep existing certificates.',
                            'items' => [
                                'type' => 'object',
                                'properties' => [
                                    'name' => [
                                        'type' => 'string',
                                        'description' => 'Full name of the certificate or credential, e.g. "AWS Certified Solutions Architect".'
                                    ],
                                    'publisher' => [
                                        'type' => 'string',
                                        'description' => 'Organization or body that issued the certificate, e.g. "Amazon Web Services", "Google", "BNSP".'
                                    ],
                                    'publish_date' => [
                                        'type' => 'string',
                                        'description' => 'Date the certificate was issued in ISO 8601 format, e.g. "2023-08-15".'
                                    ],
                                    'verification_url' => [
                                        'type' => 'string',
                                        'description' => 'Public URL where the certificate can be verified or viewed online.'
                                    ],
                                    'certificate_number' => [
                                        'type' => 'string',
                                        'description' => 'Unique identifier or credential ID printed on the certificate.'
                                    ],
                                ],
                                'required' => ['name', 'publisher']
                            ]
                        ]
                    ]
                ]
            ]
        ]
    ]
];
