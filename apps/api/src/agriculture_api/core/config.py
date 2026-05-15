import os
from dataclasses import dataclass
from functools import lru_cache


def _split_csv(value: str) -> tuple[str, ...]:
    return tuple(item.strip() for item in value.split(",") if item.strip())


@dataclass(frozen=True)
class Settings:
    app_name: str
    app_version: str
    timezone: str
    allowed_origins: tuple[str, ...]


@lru_cache
def get_settings() -> Settings:
    return Settings(
        app_name=os.getenv("APP_NAME", "Agriculture API"),
        app_version=os.getenv("APP_VERSION", "0.1.0"),
        timezone=os.getenv("APP_TIMEZONE", "Asia/Shanghai"),
        allowed_origins=_split_csv(
            os.getenv(
                "ALLOWED_ORIGINS",
                "http://localhost:5173,http://127.0.0.1:5173",
            )
        ),
    )
