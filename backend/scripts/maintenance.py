import os
import sys
import glob

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, BASE_DIR)

from scripts.backup import create_backup

LOG_FILE = os.path.join(BASE_DIR, "logs", "app.log")
BACKUP_DIR = os.path.join(BASE_DIR, "uploads", "backups")

def run_system_maintenance():
    print("=== Modern Chain Link Company Maintenance Task ===")
    
    # 1. Create DB Backup
    backup = create_backup()

    # 2. Check Log File Size
    if os.path.exists(LOG_FILE):
        size_kb = os.path.getsize(LOG_FILE) / 1024.0
        print(f"[INFO] Current Log File Size: {size_kb:.2f} KB")

    # 3. Clean Old Backups (Keep latest 10 backups)
    backups = sorted(glob.glob(os.path.join(BACKUP_DIR, "*.db")))
    if len(backups) > 10:
        old_backups = backups[:-10]
        for b in old_backups:
            os.remove(b)
            print(f"[CLEANUP] Removed old backup file: {b}")

    print("[SUCCESS] System maintenance completed successfully.")

if __name__ == "__main__":
    run_system_maintenance()
