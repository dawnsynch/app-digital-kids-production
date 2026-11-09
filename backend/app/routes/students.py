from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from ..access import ensure_student_access
from ..database import get_db
from ..models import Student, User
from ..schemas import LearnerAccountCreate, StudentCreate, StudentOut, StudentUpdate, UserOut
from ..security import LEARNER_ROLE, PARENT_ROLE, get_current_user, hash_password, require_parent

router = APIRouter(prefix="/students", tags=["students"])


@router.post("", response_model=StudentOut)
def create_student(
    payload: StudentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_parent),
):
    student = Student(
        parent_id=current_user.id,
        name=payload.name,
        grade=payload.grade,
        age_group=payload.age_group,
    )
    db.add(student)
    db.commit()
    db.refresh(student)
    return student


@router.get("", response_model=list[StudentOut])
def list_students(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == LEARNER_ROLE:
        if not current_user.student_id:
            return []
        student = db.get(Student, current_user.student_id)
        return [student] if student else []
    if current_user.role != PARENT_ROLE:
        raise HTTPException(status_code=403, detail="Parent or linked learner access required")
    return db.scalars(
        select(Student)
        .where(Student.parent_id == current_user.id)
        .order_by(Student.created_at.desc())
    ).all()


@router.get("/{student_id}", response_model=StudentOut)
def get_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == PARENT_ROLE:
        student = db.scalar(select(Student).where(Student.id == student_id, Student.parent_id == current_user.id))
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        return student
    return ensure_student_access(db, current_user, student_id)


@router.patch("/{student_id}", response_model=StudentOut)
def update_student(
    student_id: int,
    payload: StudentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_parent),
):
    student = db.scalar(select(Student).where(Student.id == student_id, Student.parent_id == current_user.id))
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    for field in payload.model_fields_set:
        setattr(student, field, getattr(payload, field))
    db.commit()
    db.refresh(student)
    return student


@router.post("/{student_id}/learner-account", response_model=UserOut)
def create_learner_account(
    student_id: int,
    payload: LearnerAccountCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_parent),
):
    student = ensure_student_access(db, current_user, student_id)
    username = payload.username.strip().lower()

    existing_username = db.scalar(select(User).where(func.lower(User.username) == username))
    if existing_username:
        raise HTTPException(status_code=400, detail="A learner with this username already exists")

    existing_student_account = db.scalar(select(User).where(User.student_id == student.id))
    if existing_student_account:
        raise HTTPException(status_code=400, detail="This learner already has a login account")

    user = User(
        full_name=(payload.full_name or student.name).strip(),
        email=None,
        username=username,
        password_hash=hash_password(payload.password),
        role=LEARNER_ROLE,
        parent_id=current_user.id,
        student_id=student.id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
