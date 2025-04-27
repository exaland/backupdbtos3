import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import fs from "fs";
import { exec } from "child_process";

dotenv.config();

class MySqlS3Backup {
    constructor() {
        this.s3Client = new S3Client({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
        });
        this.bucketName = process.env.AWS_BUCKET_NAME;
        this.backupFileName = `${process.env.BACKUP_FILE_NAME}${Date.now()}.sql`;
    }

    async mysqlDump() {
        return new Promise((resolve, reject) => {
            exec(
                `mysqldump -u ${process.env.DB_USER} -p'${process.env.DB_PASSWORD}' ${process.env.DB_NAME} > ${this.backupFileName}`,
                (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Error executing mysqldump: ${error}`);
                        reject(error);
                    } else {
                        console.log(`mysqldump output: ${stdout}`);
                        resolve(stdout);
                    }
                }
            );
        });
    }

    async uploadBackupToS3() {
        try {
            const readFile = fs.readFileSync(this.backupFileName);
            console.log(`Uploading backup file: ${this.backupFileName} to S3 bucket: ${this.bucketName}`);
            const uploadParams = {
                Bucket: this.bucketName,
                Key: `backups/${this.backupFileName}`,
                Body: readFile,
            };

            const command = new PutObjectCommand(uploadParams);
            const data = await this.s3Client.send(command);

            console.log(`Backup uploaded successfully: ${JSON.stringify(data)}`);
        } catch (error) {
            console.error("Error uploading backup to S3:", error);
        }
    }

    deleteBackupFile() {
        return new Promise((resolve, reject) => {
            fs.unlink(this.backupFileName, (err) => {
                if (err) {
                    console.error(`Error deleting backup file: ${err}`);
                    reject(err);
                } else {
                    console.log(`Backup file deleted: ${this.backupFileName}`);
                    resolve();
                }
            });
        });
    }

    async runBackupProcess() {
        try {
            await this.mysqlDump();
            await this.uploadBackupToS3();
            await this.deleteBackupFile();
            console.log("Backup process completed successfully.");
        } catch (error) {
            console.error("Error during backup process:", error);
        }
    }
}

export default MySqlS3Backup;