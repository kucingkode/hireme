import z from 'zod';
import { snakeCase, camelCase } from 'change-case/keys';

// ===============================
// Schema & Types
// ===============================

export const cvPersonalInformationSchema = z.object({
    firstName: z.string().max(255).optional(),
    lastName: z.string().max(255).optional(),
    profile: z.string().max(2000).optional(),
    websiteUrl: z
        .url({ protocol: /^https?$/ })
        .max(500)
        .optional(),
    address: z.string().max(255).optional(),
    phone: z
        .string()
        .regex(/^\+[1-9]\d{1,15}$/)
        .optional(),
    email: z.email().max(255).optional(),
});

export type CvPersonalInformation = z.infer<typeof cvPersonalInformationSchema>;

export const cvSkillSchema = z.object({
    name: z.string().max(255),
    score: z.int().min(1).max(5),
});

export type CvSkill = z.infer<typeof cvSkillSchema>;

export const cvEducationSchema = z.object({
    educationLevel: z.enum([
        'SD',
        'SMP',
        'MTS',
        'SMA',
        'MA',
        'SMK',
        'Profesi',
        'D3',
        'D4',
        'S1',
        'S2',
        'S3',
    ]),
    institution: z.string().max(255),
    city: z.string().max(255).optional(),
    studyProgram: z.string().max(255).optional(),
    startYear: z.int().min(1900).optional(),
    endYear: z.int().min(1900).optional(),
    score: z.number().optional(),
    maxScale: z.number().optional(),
    description: z.string().max(2000).optional(),
});

export type CvEducation = z.infer<typeof cvEducationSchema>;

export const cvWorkExperienceSchema = z.object({
    position: z.string().max(255),
    companyName: z.string().max(255),
    description: z.string().max(2000).optional(),
    employmentStatus: z.string().max(255),
    city: z.string().max(255).optional(),
    startYear: z.int().min(1900).optional(),
    endYear: z.int().min(1900).optional(),
});

export type CvWorkExperience = z.infer<typeof cvWorkExperienceSchema>;

export const cvCourseSchema = z.object({
    name: z.string().max(255),
    organizer: z.string().max(255),
    url: z.url().max(500).optional(),
    description: z.string().max(2000).optional(),
    startYear: z.number().min(1900).optional(),
    endYear: z.number().min(1900).optional(),
    location: z.string().max(255).optional(),
});

export type CvCourse = z.infer<typeof cvCourseSchema>;

export const cvOrganizationSchema = z.object({
    position: z.string().max(255),
    organizationName: z.string().max(255),
    description: z.string().max(2000).optional(),
    city: z.string().max(255).optional(),
    startYear: z.number().min(1900).optional(),
    endYear: z.number().min(1900).optional(),
});

export type CvOrganization = z.infer<typeof cvOrganizationSchema>;

export const cvCertificateSchema = z.object({
    name: z.string().max(255),
    publisher: z.string().max(255),
    publishDate: z.iso.date().optional(),
    verificationUrl: z.url().max(500).optional(),
    certificateNumber: z.string().optional(),
});

export type CvCertificate = z.infer<typeof cvCertificateSchema>;

export const cvBaseSchema = z.object({
    id: z.uuidv7(),
    personalInformation: cvPersonalInformationSchema,
    skills: z.array(cvSkillSchema),
    educations: z.array(cvEducationSchema),
    workExperiences: z.array(cvWorkExperienceSchema),
    courses: z.array(cvCourseSchema),
    organizations: z.array(cvOrganizationSchema),
    certificates: z.array(cvCertificateSchema),
});

export type CvBase = z.infer<typeof cvBaseSchema>;

export type CvProps = CvBase;

// update schema
export const cvPartialUpdateSchema = cvBaseSchema.partial();

export type CvPartialUpdate = z.infer<typeof cvPartialUpdateSchema>;

// ===============================
// Entity
// ===============================

const OPEN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" fill="none" id="Open--Streamline-Majesticons" height="12" width="12"><desc>Open Streamline Icon: https://streamlinehq.com</desc><path stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M5 2H3a1 1 0 0 0 -1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1 -1v-2m-4 -1 4 -4m0 0v2.5m0 -2.5h-2.5"></path></svg>`;

const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'Mei',
    'Jun',
    'Jul',
    'Agu',
    'Sep',
    'Okt',
    'Nov',
    'Des',
];

export class CvData {
    public readonly id: string;
    public readonly personalInformation: CvPersonalInformation;
    public readonly educations: CvEducation[];
    public readonly workExperiences: CvWorkExperience[];
    public readonly certificates: CvCertificate[];

    public readonly skills: CvSkill[];
    public readonly courses: CvCourse[];
    public readonly organizations: CvOrganization[];

    private constructor(props: CvProps) {
        this.id = props.id;
        this.personalInformation = props.personalInformation;
        this.skills = props.skills;
        this.educations = props.educations;
        this.workExperiences = props.workExperiences;
        this.courses = props.courses;
        this.organizations = props.organizations;
        this.certificates = props.certificates;
    }

    // ===============================
    // Factory
    // ===============================

    static create(props: any) {
        return new CvData(camelCase(props, 4) as any);
    }

    // ===============================
    // Domain
    // ===============================
    renderHtml() {
        return [
            `<div style="font-size: 14px;">`,
            this.renderPersonalInformation(),
            this.educations.length ? this.renderEducations() : '',
            this.workExperiences.length ? this.renderWorkExperiences() : '',
            this.certificates.length ? this.renderCertificates() : '',
            this.organizations.length ? this.renderOrganizations() : '',
            this.courses.length ? this.renderCourses() : '',
            this.skills.length ? this.renderSkills() : '',
            '</div>',
        ].join('');
    }

    private renderPersonalInformation() {
        const {
            address,
            email,
            firstName,
            lastName,
            phone,
            profile,
            websiteUrl,
        } = this.personalInformation;

        const links = [];

        if (phone) {
            links.push(
                `<a href="https://wa.me/${phone.replaceAll(/[+ ]/g, '')}">${phone}</a>`,
            );
        }

        if (email) {
            links.push(`<a href="mailto:${email}">${email}</a>`);
        }

        if (websiteUrl) {
            links.push(`<a href="${websiteUrl}">${websiteUrl}</a>`);
        }

        const isName = firstName || lastName;

        return [
            isName
                ? `<h1 style="font-size: 32px; font-weight: 500; text-align: center;">${firstName?.toUpperCase() ?? ''} ${lastName?.toUpperCase() ?? ''}</h1>`
                : '',
            `<p style="text-align: center;">${links.join(' | ')}</p>`,
            address ? `<p style="text-align: center;">${address}</p>` : '',
            profile ? `<p style="text-align: justify;">${profile}</p>` : '',
        ].join('');
    }

    private renderEducations() {
        const items = this.educations.map((v) => {
            return [
                `<table border=0 data-pdfmake='{"widths": ["*", "auto"], "heights": 1, "layout": "noBorders"}'>`,
                `<tr>`,
                `<td style="font-weight: bold;">${v.institution}</td>`,
                `<td style="text-align: right; font-weight: bold;">${v.city ?? ''}</td>`,
                `</tr>`,
                `<tr>`,
                `<td><span style="font-style: italic;">${v.educationLevel}${v.studyProgram ? `, ${v.studyProgram}` : ''}</span>${v.score ? ` | IPK: ${v.score}${v.maxScale ? `/${v.maxScale}` : ''}` : ''}</td>`,
                `<td style="text-align: right;">${v.startYear ? `${v.startYear} - ${v.endYear ?? 'Sekarang'}` : ''}</td>`,
                `</tr>`,
                `</table>`,
                v.description
                    ? `<p style="text-align: justify; margin-top: 0;">${v.description}</p>`
                    : '',
            ].join('');
        });

        return [
            `<h2 style="margin-top: 10.5px; font-size: 16px; margin-bottom: 0px;">PENDIDIKAN</h2>`,
            `<hr>`,
            `${items.join('')}`,
            //
        ].join('');
    }

    private renderWorkExperiences() {
        const items = this.workExperiences.map((v) => {
            return [
                `<table border=0 data-pdfmake='{"widths": ["*", "auto"], "heights": 1, "layout": "noBorders"}'>`,
                `<tr>`,
                `<td style="font-weight: bold;">${v.companyName}</td>`,
                `<td style="text-align: right; font-weight: bold;">${v.city ?? ''}</td>`,
                `</tr>`,
                `<tr>`,
                `<td><span style="font-style: italic;">${v.position}${v.employmentStatus ? `, ${v.employmentStatus}` : ''}</span></td>`,
                `<td style="text-align: right;">${v.startYear ? `${v.startYear} - ${v.endYear ?? 'Sekarang'}` : ''}</td>`,
                `</tr>`,
                `</table>`,
                v.description
                    ? `<p style="text-align: justify; margin-top: 0;">${v.description}</p>`
                    : '',
            ].join('');
        });

        return [
            `<h2 style="margin-top: 10.5px; font-size: 16px; margin-bottom: 0px;">RIWAYAT PEKERJAAN</h2>`,
            `<hr>`,
            `${items.join('')}`,
            //
        ].join('');
    }

    private renderCertificates() {
        const items = this.certificates.map((v) => {
            const publishDate = v.publishDate?.split('-').map((v) => +v);

            return [
                v.verificationUrl
                    ? `<a style="margin-top: 0; margin-bottom: 0; color: black;" href="${v.verificationUrl}">`
                    : '',
                `<table border=0 data-pdfmake='{"widths": ["*", "auto"], "heights": 1, "layout": "noBorders"}'>`,
                `<tr>`,
                `<td><span style="font-weight: bold;">${v.name}</span>, ${v.publisher}${v.certificateNumber ? ` , Nomor: ${v.certificateNumber}` : ''}${publishDate ? ` , ${publishDate[2]} ${months[publishDate[1] - 1]} ${publishDate[0]}` : ''}</td>`,
                `<td>${OPEN_SVG}</td>`,
                `</tr>`,
                `</table>`,
                v.verificationUrl ? `</a>` : '',
            ].join('');
        });

        return [
            `<h2 style="margin-top: 10.5px; font-size: 16px; margin-bottom: 0px;">SERTIFIKASI</h2>`,
            `<hr>`,
            `${items.join('')}`,
            //
        ].join('');
    }

    private renderOrganizations() {
        const items = this.organizations.map((v) => {
            return [
                `<table border=0 data-pdfmake='{"widths": ["*", "auto"], "heights": 1, "layout": "noBorders"}'>`,
                `<tr>`,
                `<td style="font-weight: bold;">${v.organizationName}</td>`,
                `<td style="text-align: right; font-weight: bold;">${v.city ?? ''}</td>`,
                `</tr>`,
                `<tr>`,
                `<td><span style="font-style: italic;">${v.position}</span></td>`,
                `<td style="text-align: right;">${v.startYear ? `${v.startYear} - ${v.endYear ?? 'Sekarang'}` : ''}</td>`,
                `</tr>`,
                `</table>`,
                v.description
                    ? `<p style="text-align: justify; margin-top: 0;">${v.description}</p>`
                    : '',
            ].join('');
        });

        return [
            `<h2 style="margin-top: 10.5px; font-size: 16px; margin-bottom: 0px;">ORGANISASI</h2>`,
            `<hr>`,
            `${items.join('')}`,
            //
        ].join('');
    }

    private renderCourses() {
        const items = this.courses.map((v) => {
            return [
                v.url
                    ? `<a style="color: black; margin-top: 0;" href="${v.url}">`
                    : '',
                `<table border=0 data-pdfmake='{"widths": ["*", "auto"], "heights": 1, "layout": "noBorders"}'>`,
                `<tr>`,
                `<td style="font-weight: bold;">${v.name}</td>`,
                `<td style="text-align: right; font-weight: bold;">${v.location ?? ''}</td>`,
                `</tr>`,
                `<tr>`,
                `<td><span style="font-style: italic;">${v.organizer}</span></td>`,
                `<td style="text-align: right;">${v.startYear ? `${v.startYear} - ${v.endYear ?? 'Sekarang'}` : ''}</td>`,
                `</tr>`,
                `</table>`,
                v.description
                    ? `<p style="text-align: justify; margin-top: 0;">${v.description}</p>`
                    : '',
                v.url ? `${OPEN_SVG}</a>` : '',
            ].join('');
        });

        return [
            `<h2 style="margin-top: 10.5px; font-size: 16px; margin-bottom: 0px;">KURSUS</h2>`,
            `<hr>`,
            `${items.join('')}`,
            //
        ].join('');
    }

    private renderSkills() {
        const items = this.skills.map((v) => {
            return `${v.name} <span style="font-style: italic;">(${v.score}/5)</span>`;
        });

        return [
            `<h2 style="margin-top: 10.5px; font-size: 16px; margin-bottom: 0px;">SKILL</h2>`,
            `<hr>`,
            `<p>${items.join(', ')}</p>`,
            //
        ].join('');
    }

    // ===============================
    // Persistence
    // ===============================
    toJson() {
        let data = {
            id: this.id,
            personalInformation: this.personalInformation,
            certificates: this.certificates,
            courses: this.courses,
            educations: this.educations,
            organizations: this.organizations,
            skills: this.skills,
            workExperiences: this.workExperiences,
        };

        data = structuredClone(data);

        return snakeCase(data, 4);
    }
}
