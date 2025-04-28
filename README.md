# MySQL S3 Backup - Exaland Concept

A simple library for backing up MySQL databases to AWS S3 using the AWS SDK. This package provides an easy way to create a database backup and store it securely in an S3 bucket.

## Installation

You can install this package via npm:

```bash
npm install backupdbtos3
```


## Configuration des Variables d'Environnement

Avant de lancer l'application, vous devez configurer certaines variables d'environnement nécessaires pour le bon fonctionnement de l'application.

Vous pouvez ajouter les variables suivantes dans votre fichier `.env` :


```
AWS_REGION=your_aws_region
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_BUCKET_NAME=your_s3_bucket_name
BACKUP_FILE_NAME=your_backup_file_name_prefix
BACKUP_FILE_PATH=your_backup_file_path
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
```


### Description des Variables

- `AWS_REGION`: La région AWS où se trouve votre bucket S3.
- `AWS_ACCESS_KEY_ID`: Votre clé d'accès AWS.
- `AWS_SECRET_ACCESS_KEY`: Votre clé secrète AWS.
- `AWS_BUCKET_NAME`: Le nom de votre bucket S3.
- `BACKUP_FILE_NAME`: Le préfixe du nom du fichier de sauvegarde.
- `BACKUP_FILE_PATH`: Le chemin d'accès où le fichier de sauvegarde sera stocké.
- `DB_USER`: Le nom d'utilisateur de votre base de données.
- `DB_PASSWORD`: Le mot de passe de votre base de données.
- `DB_NAME`: Le nom de votre base de données.

### Initialisation et 🚀
```
import  MySqlS3Backup from "backupdbtos3"; 

const backup = new MySqlS3Backup
backup.runBackupProcess().then((result) => {
    console.log("Backup process completed successfully.",result);
}).catch((err) => {
    console.error("Error during backup process:", err);
});
```

### Remarque

Assurez-vous de ne jamais inclure vos vraies clés d'accès et autres informations sensibles dans votre code source, surtout si vous le partagez sur des plateformes publiques. Il est recommandé d'utiliser un fichier `.env` local et d'ajouter ce fichier au `.gitignore`.
