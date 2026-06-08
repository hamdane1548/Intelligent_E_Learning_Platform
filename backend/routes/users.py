from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models import User
from schemas import UserCreate, UserResponse, LoginRequest, TokenResponse, UpdateProfileRequest
from auth import hash_password, verify_password, create_access_token, get_current_user, require_role

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email deja utilise")

    new_user = User(
        nom=user.nom,
        email=user.email,
        password=hash_password(user.password),
        role=user.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.get("/", response_model=list[UserResponse])
def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    users = db.query(User).all()
    return users


@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()

    if not user:
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")

    if not verify_password(request.password, user.password):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")

    token = create_access_token(
        data={
            "sub": user.email,
            "user_id": user.id,
            "role": user.role
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserResponse)
def update_profile(
    update: UpdateProfileRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_user = db.query(User).filter(User.id == current_user.id).first()

    if not db_user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")

    if update.email != db_user.email:
        existing = db.query(User).filter(User.email == update.email).first()
        if existing and existing.id != db_user.id:
            raise HTTPException(status_code=400, detail="Email deja utilise")

    db_user.nom = update.nom
    db_user.email = update.email
    db.commit()
    db.refresh(db_user)
    return db_user


@router.put("/me/password")
def update_password(
    current_password: str,
    new_password: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_user = db.query(User).filter(User.id == current_user.id).first()

    if not db_user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")

    if not verify_password(current_password, db_user.password):
        raise HTTPException(status_code=400, detail="Mot de passe actuel incorrect")

    if len(new_password) < 6:
        raise HTTPException(status_code=400, detail="Minimum 6 caracteres")

    db_user.password = hash_password(new_password)
    db.commit()
    return {"message": "Mot de passe modifie avec succes"}
