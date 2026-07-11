import { db } from './client.js';
import { roles, permissions, rolePermissions, userAccounts, passwords, persons, userRoles, applications } from './schema.js';
import bcrypt from 'bcrypt';
import { eq, and } from 'drizzle-orm';

async function main() {
  try {
    console.log('--- Starting Seed Core DB ---');

    // 1. Seed Roles
    const rolesList = [
      { code: 'super_admin', name: 'Super Admin', description: 'Global administrator access' },
      { code: 'admin_bppti', name: 'Admin BPPTI', description: 'Technical administrator' },
      { code: 'technical_admin', name: 'Technical Admin', description: 'SRE & SRE Operator' },
      { code: 'auditor', name: 'Auditor', description: 'Read-only access for compliance audit' },
      { code: 'admin_referensi', name: 'Admin Referensi', description: 'Master Data Reference Manager' },
      { code: 'admin_crm', name: 'Admin CRM', description: 'CRM and Marketing Manager' },
      { code: 'agen_mitra', name: 'Agen Mitra', description: 'Agent/Mitra for leads capture' },
      { code: 'pendaftar', name: 'Pendaftar', description: 'Admissions applicant' },
      { code: 'admin_pmb', name: 'Admin PMB', description: 'Admissions administrator' },
      { code: 'admin_finance', name: 'Admin Finance', description: 'Finance administrator' },
      { code: 'admin_akademik_biro', name: 'Admin Akademik Biro', description: 'Global academic administrator' },
      { code: 'kaprodi', name: 'Kaprodi', description: 'Study program head' },
      { code: 'admin_akademik_prodi', name: 'Admin Akademik Prodi', description: 'Prodi academic administrator' },
      { code: 'dosen', name: 'Dosen', description: 'Lecturer' },
      { code: 'dosen_pa', name: 'Dosen PA', description: 'Academic advisor' },
      { code: 'mahasiswa', name: 'Mahasiswa', description: 'Active student' },
      { code: 'admin_sdm', name: 'Admin SDM', description: 'HRIS administrator' },
      { code: 'admin_lms', name: 'Admin LMS', description: 'LMS administrator' },
      { code: 'admin_assessment', name: 'Admin Assessment', description: 'Assessment administrator' },
      { code: 'pimpinan', name: 'Pimpinan', description: 'Executive read-only aggregate' },
      { code: 'service_account', name: 'Service Account', description: 'Service-to-service automation' },
    ];

    console.log('Seeding roles...');
    const insertedRolesMap: Record<string, string> = {};
    for (const roleData of rolesList) {
      const [insertedRole] = await db
        .insert(roles)
        .values({
          code: roleData.code,
          name: roleData.name,
          description: roleData.description,
        })
        .onConflictDoUpdate({
          target: roles.code,
          set: { name: roleData.name, description: roleData.description },
        })
        .returning();
      insertedRolesMap[roleData.code] = insertedRole.id;
    }

    // 2. Seed Permissions
    const permissionsList = [
      { code: 'pmb.applicant.read', name: 'Read Applicants', description: 'Read PMB applicants details' },
      { code: 'pmb.applicant.create', name: 'Create Applicants', description: 'Create new PMB applicants' },
      { code: 'pmb.document.verify', name: 'Verify Documents', description: 'Verify applicant documents' },
      { code: 'finance.invoice.create', name: 'Create Invoice', description: 'Create finance invoices' },
      { code: 'finance.payment.verify', name: 'Verify Payment', description: 'Manually verify payments' },
      { code: 'academic.krs.approve', name: 'Approve KRS', description: 'Approve student KRS selections' },
      { code: 'academic.grade.publish', name: 'Publish Grade', description: 'Publish final academic grades' },
      { code: 'lms.class.sync', name: 'Sync LMS Class', description: 'Sync online classes to LMS' },
      { code: 'assessment.result.publish', name: 'Publish Assessment Result', description: 'Publish quiz/exam scores' },
      { code: 'core.role.assign', name: 'Assign User Roles', description: 'Assign security roles to user accounts' },
    ];

    console.log('Seeding permissions...');
    const insertedPermissionsMap: Record<string, string> = {};
    for (const permData of permissionsList) {
      const [insertedPerm] = await db
        .insert(permissions)
        .values({
          code: permData.code,
          name: permData.name,
          description: permData.description,
        })
        .onConflictDoUpdate({
          target: permissions.code,
          set: { name: permData.name, description: permData.description },
        })
        .returning();
      insertedPermissionsMap[permData.code] = insertedPerm.id;
    }

    // 3. Link Super Admin role to all permissions
    console.log('Linking super_admin to all permissions...');
    const superAdminRoleId = insertedRolesMap['super_admin'];
    if (superAdminRoleId) {
      for (const permId of Object.values(insertedPermissionsMap)) {
        await db
          .insert(rolePermissions)
          .values({
            roleId: superAdminRoleId,
            permissionId: permId,
          })
          .onConflictDoNothing();
      }
    }

    // 4. Seed Application Registry
    const appsList = [
      { code: 'SSO', name: 'Single Sign On Portal', description: 'SSO Login Portal', url: 'http://localhost:3000/auth/login' },
      { code: 'CRM', name: 'Sistem CRM & Marketing', description: 'CRM and Agent Portal', url: 'http://localhost:3000/dashboard/crm' },
      { code: 'PMB', name: 'Penerimaan Mahasiswa Baru', description: 'PMB Admission Portal', url: 'http://localhost:3000/dashboard/pmb' },
      { code: 'KEUANGAN', name: 'Sistem Keuangan & Billing', description: 'Billing and Payments Portal', url: 'http://localhost:3000/dashboard/finance' },
      { code: 'AKADEMIK', name: 'Sistem Informasi Akademik', description: 'SIAKAD portal', url: 'http://localhost:3000/dashboard/academic' },
      { code: 'SDM', name: 'Sistem Informasi SDM / HRIS', description: 'HRIS Portal', url: 'http://localhost:3000/dashboard/hris' },
      { code: 'LMS', name: 'Learning Management System', description: 'Online LMS portal', url: 'http://localhost:3000/dashboard/lms' },
      { code: 'ASSESSMENT', name: 'Sistem Assessment & CBT', description: 'CBT exam portal', url: 'http://localhost:3000/dashboard/assessment' },
    ];

    console.log('Seeding applications...');
    for (const appData of appsList) {
      await db
        .insert(applications)
        .values({
          code: appData.code,
          name: appData.name,
          description: appData.description,
          url: appData.url,
        })
        .onConflictDoUpdate({
          target: applications.code,
          set: { name: appData.name, description: appData.description, url: appData.url },
        });
    }

    // 5. Seed initial Super Admin account
    console.log('Checking for existing super admin person...');
    const [personRecord] = await db
      .insert(persons)
      .values({
        firstName: 'System',
        lastName: 'Superadmin',
        email: 'admin@unsia.ac.id',
        phone: '+628111222333',
      })
      .onConflictDoUpdate({
        target: persons.email,
        set: { firstName: 'System', lastName: 'Superadmin', phone: '+628111222333' },
      })
      .returning();

    console.log('Checking for existing super admin user account...');
    const [userRecord] = await db
      .insert(userAccounts)
      .values({
        personId: personRecord.id,
        username: 'admin',
        email: 'admin@unsia.ac.id',
        isActive: true,
      })
      .onConflictDoUpdate({
        target: userAccounts.username,
        set: { personId: personRecord.id, email: 'admin@unsia.ac.id', isActive: true },
      })
      .returning();

    console.log('Checking for existing password record...');
    const existingPassword = await db
      .select()
      .from(passwords)
      .where(eq(passwords.userId, userRecord.id))
      .limit(1);

    if (existingPassword.length === 0) {
      console.log('Seeding super admin password...');
      const hashedPassword = await bcrypt.hash('Admin123!', 10);
      await db
        .insert(passwords)
        .values({
          userId: userRecord.id,
          passwordHash: hashedPassword,
        });
    }

    console.log('Checking for existing super admin user role...');
    const existingUserRole = await db
      .select()
      .from(userRoles)
      .where(
        and(
          eq(userRoles.userId, userRecord.id),
          eq(userRoles.roleId, superAdminRoleId)
        )
      )
      .limit(1);

    if (existingUserRole.length === 0) {
      console.log('Assigning super_admin role to user admin...');
      await db
        .insert(userRoles)
        .values({
          userId: userRecord.id,
          roleId: superAdminRoleId,
          scopeType: 'global',
          scopeValue: 'all',
        });
    }

    console.log('--- Seed Core DB Completed Successfully! ---');
  } catch (error) {
    console.error('Error seeding Core DB:', error);
    process.exit(1);
  }
}

main().then(() => process.exit(0));
