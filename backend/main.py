from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from config.app_config import database
from api.auth      import router as auth_router
from api.otp       import router as otp_router
from api.users     import router as users_router
from api.wallet    import router as wallet_router
from api.referrals import router as referrals_router
from api.orders    import router as orders_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await database.connect()
    yield
    await database.disconnect()


app = FastAPI(title="Trusted Milk API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"status": "error", "message": str(exc)},
    )


# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(otp_router)
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(wallet_router)
app.include_router(referrals_router)
app.include_router(orders_router)
