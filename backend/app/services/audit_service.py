from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog
from app.models.user import User

def record_audit(
    db: Session,
    entity_type: str,
    entity_id: str,
    action: str,
    user: User,
    details: str = None
):
    try:
        user_name = user.full_name if user and user.full_name else (user.email.split('@')[0] if user else "System User")
        user_email = user.email if user else "system@modernchainlink.com"
        
        audit_entry = AuditLog(
            entity_type=entity_type,
            entity_id=str(entity_id),
            action=action,
            user_email=user_email,
            user_name=user_name,
            details=details
        )
        db.add(audit_entry)
        db.commit()
        db.refresh(audit_entry)
        return audit_entry
    except Exception as e:
        db.rollback()
        print(f"Failed to record audit log: {e}")
        return None

def get_entity_history(db: Session, entity_id: str):
    return db.query(AuditLog).filter(AuditLog.entity_id == str(entity_id)).order_by(AuditLog.created_at.desc()).all()
