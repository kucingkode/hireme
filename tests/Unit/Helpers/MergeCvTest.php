<?php

describe('merge_cv', function () {

    // ── Fixtures ──────────────────────────────────────────────────────────────

    $baseCv = fn() => (object) [
        'personal_information' => (object) [
            'first_name'  => 'John',
            'last_name'   => 'Doe',
            'profile'     => 'Software Engineer',
            'website_url' => 'https://johndoe.com',
            'address'     => 'Jakarta',
            'phone'       => '081234567890',
            'email'       => 'john@example.com',
        ],
        'skills' => [
            (object) ['name' => 'PHP',        'score' => 5],
            (object) ['name' => 'JavaScript', 'score' => 4],
        ],
        'educations' => [
            (object) [
                'education_level' => 'Bachelor',
                'institution'     => 'University of Indonesia',
                'city'            => 'Jakarta',
                'study_program'   => 'Computer Science',
                'start_year'      => 2018,
                'end_year'        => 2022,
                'score'           => 3.8,
                'description'     => 'Graduated with honors',
            ],
        ],
        'courses' => [
            (object) [
                'name'        => 'Laravel Mastery',
                'organizer'   => 'Laracasts',
                'url'         => 'https://laracasts.com',
                'description' => 'Advanced Laravel course',
                'start_year'  => 2021,
                'end_year'    => 2021,
                'location'    => 'Online',
            ],
        ],
        'work_experiences' => [
            (object) [
                'position'          => 'Backend Developer',
                'company_name'      => 'PT Maju Jaya',
                'description'       => 'Built REST APIs',
                'employment_status' => 'Full-time',
                'city'              => 'Jakarta',
                'start_year'        => 2022,
                'end_year'          => 2024,
            ],
        ],
        'organizations' => [
            (object) [
                'position'          => 'Secretary',
                'organization_name' => 'Student Council',
                'description'       => 'Managed events',
                'city'              => 'Jakarta',
                'start_year'        => '2019',
                'end_year'          => '2020',
            ],
        ],
        'certificates' => [
            (object) [
                'name'               => 'AWS Certified',
                'publisher'          => 'Amazon',
                'publish_date'       => '2023-01-15',
                'verification_url'   => 'https://aws.amazon.com/verify',
                'certificate_number' => 'AWS-001',
            ],
        ],
    ];

    // ── Return type ───────────────────────────────────────────────────────────

    it('returns an object', function () use ($baseCv) {
        $result = merge_cv($baseCv(), (object) []);
        expect($result)->toBeObject();
    });

    // ── personal_information ──────────────────────────────────────────────────

    describe('personal_information', function () use ($baseCv) {

        it('keeps existing personal_information when delta is empty', function () use ($baseCv) {
            $result = merge_cv($baseCv(), (object) []);
            expect($result->personal_information->first_name)->toBe('John')
                ->and($result->personal_information->email)->toBe('john@example.com');
        });

        it('overwrites personal_information when delta provides it', function () use ($baseCv) {
            $delta = (object) [
                'personal_information' => (object) [
                    'first_name' => 'Jane',
                    'last_name'  => 'Smith',
                    'profile'    => 'Designer',
                    'email'      => 'jane@example.com',
                ],
            ];
            $result = merge_cv($baseCv(), $delta);
            expect($result->personal_information->first_name)->toBe('Jane')
                ->and($result->personal_information->email)->toBe('jane@example.com');
        });

    });

    // ── skills ────────────────────────────────────────────────────────────────

    describe('skills', function () use ($baseCv) {

        it('keeps existing skills when delta is empty', function () use ($baseCv) {
            $result = merge_cv($baseCv(), (object) []);
            expect($result->skills)->toHaveCount(2)
                ->and($result->skills[0]->name)->toBe('PHP');
        });

        it('replaces skills entirely when delta provides skills', function () use ($baseCv) {
            $delta  = (object) ['skills' => [(object) ['name' => 'Python', 'score' => 3]]];
            $result = merge_cv($baseCv(), $delta);
            expect($result->skills)->toHaveCount(1)
                ->and($result->skills[0]->name)->toBe('Python');
        });

        it('accepts skill score at boundary values 1 and 5', function () use ($baseCv) {
            $delta = (object) [
                'skills' => [
                    (object) ['name' => 'Go',   'score' => 1],
                    (object) ['name' => 'Rust', 'score' => 5],
                ],
            ];
            $result = merge_cv($baseCv(), $delta);
            expect($result->skills[0]->score)->toBe(1)
                ->and($result->skills[1]->score)->toBe(5);
        });

        it('replaces skills with an empty array', function () use ($baseCv) {
            $result = merge_cv($baseCv(), (object) ['skills' => []]);
            expect($result->skills)->toBeArray()->toBeEmpty();
        });

    });

    // ── educations ────────────────────────────────────────────────────────────

    describe('educations', function () use ($baseCv) {

        it('keeps existing educations when delta is empty', function () use ($baseCv) {
            $result = merge_cv($baseCv(), (object) []);
            expect($result->educations[0]->institution)->toBe('University of Indonesia');
        });

        it('replaces educations when delta provides them', function () use ($baseCv) {
            $delta = (object) [
                'educations' => [
                    (object) [
                        'education_level' => 'Master',
                        'institution'     => 'ITB',
                        'start_year'      => 2022,
                        'end_year'        => 2024,
                    ],
                ],
            ];
            $result = merge_cv($baseCv(), $delta);
            expect($result->educations)->toHaveCount(1)
                ->and($result->educations[0]->education_level)->toBe('Master')
                ->and($result->educations[0]->institution)->toBe('ITB');
        });

    });

    // ── courses ───────────────────────────────────────────────────────────────

    describe('courses', function () use ($baseCv) {

        it('keeps existing courses when delta is empty', function () use ($baseCv) {
            $result = merge_cv($baseCv(), (object) []);
            expect($result->courses[0]->name)->toBe('Laravel Mastery');
        });

        it('replaces courses when delta provides them', function () use ($baseCv) {
            $delta = (object) [
                'courses' => [
                    (object) [
                        'name'      => 'Vue Mastery',
                        'organizer' => 'VueMastery',
                    ],
                ],
            ];
            $result = merge_cv($baseCv(), $delta);
            expect($result->courses[0]->name)->toBe('Vue Mastery')
                ->and($result->courses[0]->organizer)->toBe('VueMastery');
        });

    });

    // ── work_experiences ──────────────────────────────────────────────────────

    describe('work_experiences', function () use ($baseCv) {

        it('keeps existing work_experiences when delta is empty', function () use ($baseCv) {
            $result = merge_cv($baseCv(), (object) []);
            expect($result->work_experiences[0]->position)->toBe('Backend Developer');
        });

        it('replaces work_experiences when delta provides them', function () use ($baseCv) {
            $delta = (object) [
                'work_experiences' => [
                    (object) [
                        'position'     => 'Frontend Developer',
                        'company_name' => 'PT Teknologi Baru',
                        'start_year'   => 2024,
                    ],
                ],
            ];
            $result = merge_cv($baseCv(), $delta);
            expect($result->work_experiences[0]->position)->toBe('Frontend Developer')
                ->and($result->work_experiences[0]->company_name)->toBe('PT Teknologi Baru');
        });

        it('replaces work_experiences with an empty array', function () use ($baseCv) {
            $result = merge_cv($baseCv(), (object) ['work_experiences' => []]);
            expect($result->work_experiences)->toBeArray()->toBeEmpty();
        });

    });

    // ── organizations ─────────────────────────────────────────────────────────

    describe('organizations', function () use ($baseCv) {

        it('keeps existing organizations when delta is empty', function () use ($baseCv) {
            $result = merge_cv($baseCv(), (object) []);
            expect($result->organizations[0]->organization_name)->toBe('Student Council');
        });

        it('replaces organizations when delta provides them', function () use ($baseCv) {
            $delta = (object) [
                'organizations' => [
                    (object) [
                        'position'          => 'Chairman',
                        'organization_name' => 'Tech Community',
                        'start_year'        => '2023',
                        'end_year'          => '2024',
                    ],
                ],
            ];
            $result = merge_cv($baseCv(), $delta);
            expect($result->organizations[0]->position)->toBe('Chairman')
                ->and($result->organizations[0]->organization_name)->toBe('Tech Community');
        });

    });

    // ── certificates ──────────────────────────────────────────────────────────

    describe('certificates', function () use ($baseCv) {

        it('keeps existing certificates when delta is empty', function () use ($baseCv) {
            $result = merge_cv($baseCv(), (object) []);
            expect($result->certificates[0]->name)->toBe('AWS Certified');
        });

        it('replaces certificates when delta provides them', function () use ($baseCv) {
            $delta = (object) [
                'certificates' => [
                    (object) [
                        'name'               => 'GCP Associate',
                        'publisher'          => 'Google',
                        'publish_date'       => '2024-06-01',
                        'certificate_number' => 'GCP-999',
                    ],
                ],
            ];
            $result = merge_cv($baseCv(), $delta);
            expect($result->certificates[0]->name)->toBe('GCP Associate')
                ->and($result->certificates[0]->publisher)->toBe('Google');
        });

        it('replaces certificates with an empty array', function () use ($baseCv) {
            $result = merge_cv($baseCv(), (object) ['certificates' => []]);
            expect($result->certificates)->toBeArray()->toBeEmpty();
        });

    });

    // ── cross-section delta ───────────────────────────────────────────────────

    it('merges multiple sections at once from a delta', function () use ($baseCv) {
        $delta = (object) [
            'personal_information' => (object) ['first_name' => 'Budi', 'email' => 'budi@example.com'],
            'skills'               => [(object) ['name' => 'Kotlin', 'score' => 4]],
            'certificates'         => [],
        ];
        $result = merge_cv($baseCv(), $delta);

        expect($result->personal_information->first_name)->toBe('Budi')
            ->and($result->skills[0]->name)->toBe('Kotlin')
            ->and($result->certificates)->toBeEmpty()
            // untouched sections preserved
            ->and($result->educations[0]->institution)->toBe('University of Indonesia')
            ->and($result->work_experiences[0]->position)->toBe('Backend Developer');
    });

    it('does not mutate the original cv object', function () use ($baseCv) {
        $original = $baseCv();
        $delta    = (object) ['personal_information' => (object) ['first_name' => 'Mutated']];
        merge_cv($original, $delta);

        expect($original->personal_information->first_name)->toBe('John');
    });

});
