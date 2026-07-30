import logging
import os
from logging.handlers import RotatingFileHandler

LOG_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "logs"))
os.makedirs(LOG_DIR, exist_ok=True)
LOG_FILE = os.path.join(LOG_DIR, "app.log")

# Configure logger
logger = logging.getLogger("mclc_api")
logger.setLevel(logging.INFO)

if not logger.handlers:
    # File handler with rotation (max 5MB, keep 5 backups)
    file_handler = RotatingFileHandler(LOG_FILE, maxBytes=5 * 1024 * 1024, backupCount=5)
    file_formatter = logging.Formatter(
        "[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s"
    )
    file_handler.setFormatter(file_formatter)
    logger.addHandler(file_handler)

    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(file_formatter)
    logger.addHandler(console_handler)

def log_auth_event(email: str, success: bool, message: str = ""):
    status_str = "SUCCESS" if success else "FAILED"
    logger.info(f"AUTH | User: {email} | Status: {status_str} | {message}")

def log_order_event(action: str, order_id: str, details: str = ""):
    logger.info(f"ORDER | Action: {action} | OrderID: {order_id} | {details}")

def log_payment_event(action: str, order_id: str, amount: float):
    logger.info(f"PAYMENT | Action: {action} | OrderID: {order_id} | Amount: ₹{amount:,.2f}")

def log_error_event(context: str, error_msg: str):
    logger.error(f"ERROR | Context: {context} | Message: {error_msg}")
