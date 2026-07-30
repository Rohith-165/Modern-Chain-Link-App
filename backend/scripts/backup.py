import os
import shutil
from datetime import datetime

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DB_FILE = os.path.join(BASE_DIR, "mclc.db")
BACKUP_DIR = os.path.join(BASE_DIR, "uploads", "backups")

def create_backup():
    os.makedirs(BACKUP_DIR, exist_ok=True)
    if not os.path.exists(DB_FILE):
        print(f"[ERROR] Database file {DB_FILE} not found.")
        return False

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = os.path.join(BACKUP_DIR, f"mclc_backup_{timestamp}.db")
    shutil.copy2(DB_FILE, backup_file)
    print(f"[SUCCESS] Backup created successfully: {backup_file}")
    return backup_file

if __name__ == "__main__":
    create_backup()
