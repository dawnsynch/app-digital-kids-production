import argparse
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from sqlalchemy import func, select  # noqa: E402

from backend.app.database import SessionLocal, init_db  # noqa: E402
from backend.app.models import User  # noqa: E402
from backend.app.security import ADMIN_ROLE, hash_password  # noqa: E402


def create_admin(full_name: str, email: str, password: str) -> User:
    init_db()
    normalized_email = email.strip().lower()
    with SessionLocal() as db:
        user = db.scalar(select(User).where(func.lower(User.email) == normalized_email))
        if user:
            user.full_name = full_name.strip()
            user.password_hash = hash_password(password)
            user.role = ADMIN_ROLE
            user.is_active = True
        else:
            user = User(
                full_name=full_name.strip(),
                email=normalized_email,
                username=None,
                password_hash=hash_password(password),
                role=ADMIN_ROLE,
                is_active=True,
            )
            db.add(user)
        db.commit()
        db.refresh(user)
        return user


def main() -> None:
    parser = argparse.ArgumentParser(description="Create or update a Digital Kids Assistant admin user.")
    parser.add_argument("--full-name", required=True)
    parser.add_argument("--email", required=True)
    parser.add_argument("--password", required=True)
    args = parser.parse_args()

    user = create_admin(args.full_name, args.email, args.password)
    print(f"Admin user ready: id={user.id}, email={user.email}, full_name={user.full_name}")


if __name__ == "__main__":
    main()
