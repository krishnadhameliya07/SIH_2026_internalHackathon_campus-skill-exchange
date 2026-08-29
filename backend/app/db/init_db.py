from app.db.database import Base, engine
from app.models import User  # noqa: F401


def init_db() -> None:
    Base.metadata.create_all(bind=engine)