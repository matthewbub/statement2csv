# Migrations and Data Backups

Let's go through a step-by-step manual QA process to gain a deeper understanding of how migrations and data backup works in ZCauldron.

This work will be done on your local machine.

1. First let's start fresh by removing any existing volumes and containers
   - Stop and remove all containers and volumes
     ```bash
     docker compose down -v
     ```
2. Start the application in the `staging` environment
   - Pass the `-d` flag to detach from Docker and run in the background
     ```bash
     DOCKER_ENV=staging docker compose up -d
     ```
3. Check if the database exists, and it's current state:
   - List files in the data directory
     ```bash
     docker compose exec api ls -la /app/pkg/database
     ```
   - If `staging.db` exists, check its tables. We'll do this again as a final confirmation
     ```bash
     docker compose exec api sqlite3 /app/pkg/database/staging.db ".tables"
     ```
4. The migrations will run automatically when the application starts
   - Check the logs to confirm migrations ran successfully
     ```bash
     docker compose exec api tail -n 100 -f /app/app.log
     ```
5. Create a test backup
   - Make the script executable
     ```bash
     chmod +x scripts/backup.sh
     ```
   - Create a backup copy of the database
     ```bash
     ./scripts/backup.sh staging
     ```
6. Verify the backup was created:
   - List backups
     ```bash
     ls -l backups/staging/
     ```
7. Let's simulate a database problem by removing the current database
   - Remove the database
     ```bash
     docker compose exec api rm /app/pkg/database/staging.db
     ```
8. Restore from our backup:

   - Make the restore script executable
     ```bash
     chmod +x scripts/restore.sh
     ```
   - Restore the most recent backup (replace with your actual backup filename)

     ```bash
     ./scripts/restore.sh staging ./backups/staging/backup_YYYYMMDD_HHMMSS.db

     ./scripts/restore.sh staging ./backups/staging/backup_20241201_131809.db
     ```

9. Verify the restore worked:
   - If `staging.db` exists, check its tables
     ```bash
     docker compose exec api sqlite3 /app/pkg/database/staging.db ".tables"
     ```
