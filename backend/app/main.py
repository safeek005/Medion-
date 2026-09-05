from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.router import api_router
from app.api.health import router as root_health_router

app = FastAPI(
    title="MEDION AGENT Backend API & Web Application",
    description="AI Healthcare Management & Automation Prototype Engine",
    version="1.0.0"
)

# Enable CORS for user portals
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount root health check and API v1 routes
app.include_router(root_health_router)
app.include_router(api_router)

# Mount frontend web application at root /
frontend_dir = Path(__file__).resolve().parent.parent.parent / "frontend"
dist_dir = frontend_dir / "dist"
target_static_dir = dist_dir if dist_dir.exists() else frontend_dir

from fastapi.responses import FileResponse

if target_static_dir.exists():
    @app.middleware("http")
    async def spa_fallback_middleware(request, call_next):
        response = await call_next(request)
        if response.status_code == 404 and not request.url.path.startswith("/api") and not request.url.path.startswith("/health"):
            index_path = target_static_dir / "index.html"
            if index_path.exists():
                return FileResponse(index_path)
        return response

    app.mount("/", StaticFiles(directory=str(target_static_dir), html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

