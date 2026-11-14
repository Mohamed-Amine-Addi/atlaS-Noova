import json
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

BASE = Path(__file__).parent
ARTIFACTS = json.loads((BASE / "data" / "artifacts.json").read_text(encoding="utf-8"))

app = FastAPI(title="Abandoned but not Forgotten")

@app.middleware("http")
async def no_cache(request, call_next):
    response = await call_next(request)
    response.headers["Cache-Control"] = "no-store"
    return response

@app.get("/api/artifacts")
def list_artifacts(world: str | None = None):
    if world:
        return [a for a in ARTIFACTS if a["world"] == world]
    return ARTIFACTS


@app.get("/api/artifacts/{artifact_id}")
def get_artifact(artifact_id: str):
    for a in ARTIFACTS:
        if a["id"] == artifact_id:
            return a
    raise HTTPException(status_code=404, detail="Artifact not found")


@app.get("/")
def index():
    return FileResponse(BASE / "static" / "index.html")


app.mount("/static", StaticFiles(directory=BASE / "static"), name="static")
