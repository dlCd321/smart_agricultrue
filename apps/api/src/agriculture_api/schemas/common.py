from datetime import datetime
from typing import Generic, TypeVar

from pydantic import BaseModel, ConfigDict, Field

DataT = TypeVar("DataT")


class ApiResponse(BaseModel, Generic[DataT]):
    model_config = ConfigDict(populate_by_name=True)

    code: int = 200
    message: str = "success"
    data: DataT | None = None
    timestamp: datetime
    trace_id: str = Field(alias="traceId")


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
