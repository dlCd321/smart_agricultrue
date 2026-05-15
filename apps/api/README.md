# Agriculture API

FastAPI backend managed by uv.

## Run

```bash
uv sync
uv run uvicorn agriculture_api.main:app --reload --app-dir src
```

Health check:

```bash
curl http://127.0.0.1:8000/api/v1/health
```

## Test

```bash
uv run pytest
```
