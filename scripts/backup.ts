import { execSync } from 'child_process';
import { mkdirSync, readdirSync, statSync, unlinkSync } from 'fs';
import { join } from 'path';

const BACKUP_DIR = join(process.cwd(), 'backups');
const RETENTION_DAYS = 30;

function backupDatabase() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `wijha-backup-${timestamp}.sql`;
  const filepath = join(BACKUP_DIR, filename);

  mkdirSync(BACKUP_DIR, { recursive: true });

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('ERROR: DATABASE_URL environment variable not set');
    process.exit(1);
  }

  console.log(`Starting backup: ${filename}`);
  execSync(`pg_dump "${dbUrl}" -f "${filepath}"`, { stdio: 'inherit' });
  console.log(`Backup saved: ${filepath}`);

  cleanOldBackups();
}

function cleanOldBackups() {
  const files = readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('wijha-backup-') && f.endsWith('.sql'))
    .map(f => ({
      name: f,
      time: statSync(join(BACKUP_DIR, f)).mtime.getTime(),
    }))
    .sort((a, b) => b.time - a.time);

  const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
  const toDelete = files.filter(f => f.time < cutoff);

  for (const file of toDelete) {
    unlinkSync(join(BACKUP_DIR, file.name));
    console.log(`Deleted old backup: ${file.name}`);
  }

  console.log(`Retention: keeping ${Math.min(files.length, RETENTION_DAYS)} backups`);
}

backupDatabase();
