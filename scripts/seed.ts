import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  const hashedPassword = await bcrypt.hash('password123', 10);
  const now = new Date();

  // ─── Taxonomy ───
  const satCat = await prisma.category.upsert({ where: { name: 'SAT' }, update: {}, create: { name: 'SAT' } });
  const actCat = await prisma.category.upsert({ where: { name: 'ACT' }, update: {}, create: { name: 'ACT' } });
  const otherCat = await prisma.category.upsert({ where: { name: 'Other' }, update: {}, create: { name: 'Other' } });

  const subcats = [
    { name: 'Math', catId: satCat.id },
    { name: 'English/RW', catId: satCat.id },
    { name: 'Math', catId: actCat.id },
    { name: 'English', catId: actCat.id },
    { name: 'Science', catId: actCat.id },
    { name: 'Biology', catId: actCat.id },
    { name: 'Arabic', catId: otherCat.id },
  ];
  for (const s of subcats) {
    const existing = await prisma.subcategory.findFirst({ where: { name: s.name, categoryId: s.catId } });
    if (!existing) await prisma.subcategory.create({ data: { name: s.name, categoryId: s.catId } });
  }

  await prisma.level.upsert({ where: { name: 'Beginner' }, update: {}, create: { name: 'Beginner' } });
  await prisma.level.upsert({ where: { name: 'Intermediate' }, update: {}, create: { name: 'Intermediate' } });
  await prisma.level.upsert({ where: { name: 'Advanced' }, update: {}, create: { name: 'Advanced' } });
  await prisma.level.upsert({ where: { name: 'Test-Prep' }, update: {}, create: { name: 'Test-Prep' } });

  for (const g of ['9', '10', '11', '12']) {
    await prisma.targetGrade.upsert({ where: { grade: g }, update: {}, create: { grade: g } });
  }

  for (const e of ['August 2026 SAT', 'October 2026 SAT', 'August 2026 ACT', 'October 2026 ACT']) {
    await prisma.targetExamDate.upsert({ where: { name: e }, update: {}, create: { name: e } });
  }

  // ─── Helpers ───
  async function upsertTeacher(data: {
    name: string; contact: string; username: string; description: string; teachingStyle: string;
    specialties: string[]; categories: string[]; subcategories: string[];
    whatsappContact: string;
  }) {
    const existing = await prisma.user.findFirst({ where: { username: data.username } });
    if (existing) return existing;
    return prisma.user.create({
      data: {
        role: 'teacher', ...data,
        status: 'active', profileStatus: 'published', password: hashedPassword, passwordIsTemporary: false, onboardingCompletedAt: now,
      },
    });
  }

  async function upsertCourse(teacherId: string, data: {
    title: string; description: string; category: string; subcategory: string;
    level: string; targetGrades: string[]; targetExamDate?: string;
    schedule: string; estimatedGroupSize?: number; startDate?: Date;
    sessionCount?: number; price?: number; contactForPrice?: boolean;
  }) {
    const existing = await prisma.course.findFirst({ where: { teacherId, title: data.title } });
    if (existing) return existing;
    return prisma.course.create({
      data: { teacherId, status: 'published', createdBy: teacherId, ...data },
    });
  }

  async function upsertEvent(teacherId: string, data: {
    type: string; title: string; description: string; relatedAction?: string;
  }) {
    const existing = await prisma.eventNews.findFirst({ where: { teacherId, title: data.title } });
    if (existing) return existing;
    return prisma.eventNews.create({
      data: { teacherId, status: 'published', ...data },
    });
  }

  // ─── Teachers ───
  const amr = await upsertTeacher({
    name: 'Amr Mustafa', contact: 'amr@wijha.com', username: 'amr',
    description: '5 years of experience tutoring SAT Math and ACT Science. Graduated from American University in Cairo with a focus on mathematics and science education.',
    teachingStyle: 'I believe in building strong foundations first, then progressively challenging students with harder problems.',
    specialties: ['Math', 'Advanced', 'Test-Prep'], categories: ['SAT', 'ACT'], subcategories: ['Math', 'Science'],
    whatsappContact: '+966501234567',
  });

  const sarah = await upsertTeacher({
    name: 'Sarah Johnson', contact: 'sarah@wijha.com', username: 'sarah',
    description: 'Native English speaker with 8 years of experience teaching SAT English and ACT English. Expert in reading comprehension and writing strategies.',
    teachingStyle: 'I focus on developing critical reading skills and teaching students how to analyze texts effectively.',
    specialties: ['English/RW', 'Intermediate'], categories: ['SAT', 'ACT'], subcategories: ['English/RW', 'English'],
    whatsappContact: '+1234567892',
  });

  const michael = await upsertTeacher({
    name: 'Michael Chen', contact: 'michael@wijha.com', username: 'michael',
    description: 'PhD in Biology, tutoring ACT Science and related topics. Experienced in university-level research methods and scientific writing.',
    teachingStyle: 'I approach science education from a practical standpoint, connecting theory to real-world applications.',
    specialties: ['Biology', 'Advanced'], categories: ['ACT'], subcategories: ['Science', 'Biology'],
    whatsappContact: '+1234567893',
  });

  const aisha = await upsertTeacher({
    name: 'Aisha Ali', contact: 'aisha@wijha.com', username: 'aisha',
    description: 'Tutoring Other category subjects with focus on Arabic students seeking international university admission.',
    teachingStyle: 'I work closely with each student to identify their unique strengths and challenges.',
    specialties: ['Other'], categories: ['Other'], subcategories: ['Arabic'],
    whatsappContact: '+971509876543',
  });

  // ─── Admin ───
  const existingAdmin = await prisma.user.findFirst({ where: { username: 'admin' } });
  if (!existingAdmin) {
    await prisma.user.create({
      data: { role: 'admin', name: 'Admin User', username: 'admin', contact: 'admin@wijha.com', status: 'active', password: hashedPassword, passwordIsTemporary: false, onboardingCompletedAt: now },
    });
  }

  // ─── Admin Assistant ───
  const existingAssistant = await prisma.user.findFirst({ where: { username: 'assistant' } });
  if (!existingAssistant) {
    await prisma.user.create({
      data: { role: 'admin_assistant', name: 'Admin Assistant', username: 'assistant', contact: 'assistant@wijha.com', status: 'active', password: hashedPassword, passwordIsTemporary: false, onboardingCompletedAt: now },
    });
  }

  // ─── Collaborator ───
  const existingCollab = await prisma.user.findFirst({ where: { username: 'layla' } });
  if (!existingCollab) {
    await prisma.user.create({
      data: { role: 'community_collaborator', name: 'Layla Hassan', username: 'layla', contact: 'layla@wijha.com', status: 'active', password: hashedPassword, passwordIsTemporary: false, onboardingCompletedAt: now },
    });
  }

  // ─── Courses ───
  await upsertCourse(amr.id, {
    title: 'SAT Math Comprehensive', description: 'Full SAT Math preparation covering all topics from basic arithmetic to advanced calculus.',
    category: 'SAT', subcategory: 'Math', level: 'Advanced', targetGrades: ['11', '12'],
    targetExamDate: 'October 2026 SAT', schedule: 'Mon, Wed, Fri — 4:00 PM KSA',
    estimatedGroupSize: 8, startDate: new Date('2026-01-15'), sessionCount: 40, price: 250,
  });

  await upsertCourse(amr.id, {
    title: 'SAT Math Foundation', description: 'Beginner to intermediate SAT Math course focusing on building strong foundations.',
    category: 'SAT', subcategory: 'Math', level: 'Intermediate', targetGrades: ['9', '10'],
    targetExamDate: 'August 2026 SAT', schedule: 'Tue, Thu — 6:00 PM KSA',
    estimatedGroupSize: 6, startDate: new Date('2026-02-01'), sessionCount: 30, price: 180,
  });

  await upsertCourse(sarah.id, {
    title: 'SAT English Language & Composition', description: 'Comprehensive SAT English course covering reading comprehension, grammar, and essay writing.',
    category: 'SAT', subcategory: 'English/RW', level: 'Advanced', targetGrades: ['10', '11', '12'],
    targetExamDate: 'October 2026 SAT', schedule: 'Mon, Wed, Fri — 7:00 PM KSA',
    estimatedGroupSize: 5, startDate: new Date('2026-01-20'), sessionCount: 35, price: 200,
  });

  await upsertCourse(sarah.id, {
    title: 'ACT English Essentials', description: 'ACT English preparation focusing on grammar rules, sentence structure, and rhetorical skills.',
    category: 'ACT', subcategory: 'English', level: 'Intermediate', targetGrades: ['10', '11'],
    targetExamDate: 'August 2026 ACT', schedule: 'Sat — 10:00 AM KSA',
    estimatedGroupSize: 6, startDate: new Date('2026-03-01'), sessionCount: 20, price: 160,
  });

  await upsertCourse(michael.id, {
    title: 'ACT Science Reasoning', description: 'ACT Science preparation focusing on data interpretation, experimental analysis, and scientific reasoning.',
    category: 'ACT', subcategory: 'Science', level: 'Intermediate', targetGrades: ['11', '12'],
    targetExamDate: 'August 2026 ACT', schedule: 'Sat — 9:00 AM KSA',
    estimatedGroupSize: 4, startDate: new Date('2026-03-01'), sessionCount: 25, contactForPrice: true,
  });

  await upsertCourse(michael.id, {
    title: 'ACT Biology Deep Dive', description: 'In-depth ACT Biology preparation covering all biological concepts tested on the exam.',
    category: 'ACT', subcategory: 'Biology', level: 'Advanced', targetGrades: ['11', '12'],
    targetExamDate: 'October 2026 ACT', schedule: 'Sun — 2:00 PM KSA',
    estimatedGroupSize: 5, startDate: new Date('2026-02-15'), sessionCount: 20, price: 190,
  });

  await upsertCourse(aisha.id, {
    title: 'University Prep — Arabic Track', description: 'Personalized university preparation focusing on international admission requirements.',
    category: 'Other', subcategory: 'Arabic', level: 'Beginner', targetGrades: ['11', '12'],
    schedule: 'Customized with student schedule', estimatedGroupSize: 1,
    startDate: new Date('2026-02-15'), sessionCount: 20, price: 300,
  });

  // ─── Events / News ───
  await upsertEvent(amr.id, {
    type: 'event', title: 'SAT Math Bootcamp 2026',
    description: 'Intensive 2-week SAT Math bootcamp covering all topics with focused practice tests.',
    relatedAction: 'https://wa.me/966501234567?text=I%20want%20to%20register%20for%20the%20SAT%20Math%20bootcamp',
  });

  await upsertEvent(sarah.id, {
    type: 'event', title: 'English Essay Writing Workshop',
    description: 'Workshop on SAT essay writing strategies, including thesis development and timed writing.',
    relatedAction: 'https://wa.me/1234567892?text=I%20want%20to%20register%20for%20the%20English%20workshop',
  });

  await upsertEvent(amr.id, {
    type: 'news', title: 'New Study Materials Available',
    description: 'Updated SAT Math practice materials with real 2025 test questions and detailed solutions.',
    relatedAction: 'https://wa.me/966501234567?text=Tell%20me%20more%20about%20the%20new%20materials',
  });

  await upsertEvent(michael.id, {
    type: 'news', title: 'ACT Science Tips for 2026',
    description: 'Our top tips for mastering the ACT Science section in the upcoming exam window.',
    relatedAction: 'https://wa.me/1234567893?text=Send%20me%20the%20ACT%20Science%20tips',
  });

  // ─── Terms & Conditions (Teacher Role) ───
  const existingTeacherTerms = await prisma.termsVersion.findFirst({
    where: { roleScope: 'teacher', versionNumber: '1.0' },
  });
  if (!existingTeacherTerms) {
    await prisma.termsVersion.create({
      data: {
        roleScope: 'teacher',
        versionNumber: '1.0',
        content: `WIJHA — TEACHER ROLE TERMS & CONDITIONS
Version 1.0 — Draft (pending legal review, not final)

IMPORTANT: Please read carefully before accepting.

1. PLATFORM FUNDING & SUSTAINABILITY DISCLAIMER
Wijha is currently operating as an early-stage platform. Its continued availability depends on achieving sufficient funding and user growth. There is no guarantee the platform will remain operational indefinitely. If the platform does not reach a sustainable level of usage or funding, it may be discontinued with reasonable notice. By accepting these terms, you acknowledge this risk and agree that Wijha is not liable for any disruption, loss of data, or business impact that may result from the platform being scaled back or shut down. You are encouraged to maintain backups of your content and not to rely exclusively on Wijha for your course marketing or student communication.

2. TEACHER OBLIGATIONS
2.1 You will provide accurate and truthful information about your courses, qualifications, and scheduling.
2.2 You will respond to student inquiries and collaboration requests in a timely manner.
2.3 You will not misrepresent your credentials, qualifications, or course outcomes.
2.4 You agree to maintain professional and respectful communication with students, collaborators, and platform administrators.

3. COURSE CONTENT & PRICING
3.1 You are solely responsible for the accuracy of your course descriptions, pricing, and scheduling information.
3.2 Wijha does not set, control, or guarantee course pricing. All pricing decisions are yours.
3.3 Course content must comply with applicable laws and must not contain harmful, discriminatory, or misleading material.
3.4 Wijha reserves the right to remove courses that violate platform standards or receive credible complaints.

4. STUDENT INTERACTIONS
4.1 All student-teacher communication should initially occur through the platform's chat system.
4.2 WhatsApp contact details you provide will be shared with students who express interest in your courses.
4.3 You agree to handle student data (names, contact information, academic records) in accordance with applicable privacy laws.
4.4 You will not share student information with third parties without explicit consent.

5. PAYMENTS & FINANCIAL TERMS
5.1 Wijha currently does not process payments directly. All financial transactions between you and students are your responsibility.
5.2 You are responsible for complying with all applicable tax and financial reporting obligations.
5.3 If Wijha introduces payment processing in the future, updated terms will apply and you will be notified.

6. CONTENT OWNERSHIP & LICENSE
6.1 You retain ownership of all course content, materials, and intellectual property you create.
6.2 By publishing content on Wijha, you grant Wijha a non-exclusive, royalty-free license to display, promote, and distribute your content through the platform for the purpose of marketing your courses.
6.3 This license terminates automatically if you remove your content or delete your account.

7. ACCOUNT SUSPENSION & TERMINATION
7.1 Wijha reserves the right to suspend or terminate your account for violations of these terms, including but not limited to: providing false information, harassment, discrimination, or failure to meet platform standards.
7.2 You may terminate your account at any time by contacting the admin team.
7.3 Upon termination, your content may be removed from the platform. Wijha is not responsible for any loss resulting from account termination.

8. LIMITATION OF LIABILITY
8.1 Wijha is provided "as is" without warranties of any kind, either express or implied.
8.2 Wijha shall not be liable for any indirect, incidental, special, consequential, or punitive damages.
8.3 Wijha's total liability shall not exceed the amount you have paid to Wijha in the 12 months preceding the claim (which is currently zero).

9. CHANGES TO TERMS
9.1 Wijha may update these terms from time to time. You will be notified and required to re-accept updated terms.
9.2 Continued use of the platform after accepting updated terms constitutes agreement to the new terms.

10. CONTACT
For questions about these terms, contact the admin team through the platform's chat system.

By clicking "I accept" below, you confirm that you have read, understood, and agree to be bound by these terms and conditions.`,
      },
    });
  }

  // ─── Terms & Conditions (Admin Role) ───
  const existingAdminTerms = await prisma.termsVersion.findFirst({
    where: { roleScope: 'admin', versionNumber: '1.0' },
  });
  if (!existingAdminTerms) {
    await prisma.termsVersion.create({
      data: {
        roleScope: 'admin',
        versionNumber: '1.0',
        content: `WIJHA — ADMIN ROLE TERMS & CONDITIONS
Version 1.0 — Draft (pending legal review, not final)

1. PLATFORM RESPONSIBILITIES
1.1 You are responsible for managing teacher and collaborator accounts, course moderation, and platform content.
1.2 You will handle user data (names, contact information, activity logs) in accordance with applicable privacy laws.
1.3 You will not access or modify user data beyond what is necessary for platform administration.

2. DATA PROTECTION
2.1 You will maintain the confidentiality of user information.
2.2 You will not share user data with third parties without explicit consent.
2.3 You will promptly report any data breaches or security incidents.

3. PLATFORM SUSTAINABILITY
3.1 Wijha is an early-stage platform whose continued operation depends on achieving sufficient funding.
3.2 You acknowledge that the platform may be discontinued if it does not reach a sustainable level.
3.3 You agree to maintain reasonable backups of platform data.

4. ACCOUNT MANAGEMENT
4.1 You will manage accounts fairly and without discrimination.
4.2 You will use suspension and deletion powers responsibly and with documented reasons.
4.3 You will ensure all platform actions comply with applicable laws and regulations.

By clicking "I accept" below, you confirm that you have read, understood, and agree to be bound by these terms.`,
      },
    });
  }

  console.log('Seed complete! (idempotent — skipping existing records)');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
