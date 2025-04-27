import MySqlS3Backup from './src/index.js';

const backup = new MySqlS3Backup();
backup.runBackupProcess();