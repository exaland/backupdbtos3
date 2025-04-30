import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import fs from "fs";
import { exec } from "child_process";
import express from "express";
import cron from "node-cron";

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

        // Initialiser Express
        this.app = express();
        this.app.use(express.json());

        // Définir le endpoint webhook
        this.app.post('/webhook/backup', async (req, res) => {
            try {
                await this.runBackupProcess();
                res.status(200).send({ status: 200, message: 'Backup successfully launched.', filename: this.backupFileName });
            } catch (err) {
                res.status(500).send({status: 500, message: 'Erreur lors du backup.' + err.message});
            }
        });

        // Démarrer le serveur
        const port = process.env.WEBHOOK_PORT || 3000;
        this.app.listen(port, () => {
            console.log(`Webhook listening on port ${port}`);
        });

        // Planifier une sauvegarde récurrente (par exemple tous les jours à 2h)
        // Modifier la syntaxe cron selon la fréquence souhaitée
        cron.schedule('0 2 * * *', () => {
            console.log('Lancement automatique de la sauvegarde cron.');
            this.runBackupProcess();
        });
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