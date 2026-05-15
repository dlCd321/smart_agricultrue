from datetime import datetime
from typing import TypeVar
from uuid import uuid4
from zoneinfo import ZoneInfo

from agriculture_api.schemas.common import ApiResponse

DataT = TypeVar("DataT")


def success_response(data: DataT, message: str = "success") -> ApiResponse[DataT]:
    return ApiResponse[DataT](
        code=200,
        message=message,
        data=data,
        timestamp=datetime.now(ZoneInfo("Asia/Shanghai")),
        trace_id=f"req_{uuid4().hex}",
    )
