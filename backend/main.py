from fastapi import FastAPI, Depends, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import httpx
import os

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://claudecodetodo-production.up.railway.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AuthRequest(BaseModel):
    email: str
    password: str


class TodoCreate(BaseModel):
    title: str


def base_headers() -> dict:
    return {"apikey": SUPABASE_ANON_KEY, "Content-Type": "application/json"}


def authed_headers(token: str) -> dict:
    return {**base_headers(), "Authorization": f"Bearer {token}"}


async def verify_token(authorization: str = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = authorization.split(" ")[1]
    async with httpx.AsyncClient() as client:
        res = await client.get(
            f"{SUPABASE_URL}/auth/v1/user",
            headers=authed_headers(token),
        )
    if res.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid token")
    return {"user": res.json(), "token": token}


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/auth/signup")
async def signup(body: AuthRequest):
    async with httpx.AsyncClient() as client:
        res = await client.post(
            f"{SUPABASE_URL}/auth/v1/signup",
            headers=base_headers(),
            json={"email": body.email, "password": body.password},
        )
    data = res.json()
    if res.status_code not in (200, 201) or data.get("error"):
        msg = data.get("error_description") or data.get("msg") or "Signup failed"
        return {"data": None, "error": msg}
    return {"data": {"user": data.get("email")}, "error": None}


@app.post("/auth/login")
async def login(body: AuthRequest):
    async with httpx.AsyncClient() as client:
        res = await client.post(
            f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
            headers=base_headers(),
            json={"email": body.email, "password": body.password},
        )
    data = res.json()
    if res.status_code != 200:
        msg = data.get("error_description") or data.get("msg") or "Login failed"
        return {"data": None, "error": msg}
    return {"data": {"access_token": data["access_token"], "user": data.get("email")}, "error": None}


@app.get("/todos")
async def get_todos(auth: dict = Depends(verify_token)):
    async with httpx.AsyncClient() as client:
        res = await client.get(
            f"{SUPABASE_URL}/rest/v1/todos",
            headers=authed_headers(auth["token"]),
            params={"select": "*", "order": "created_at"},
        )
    if res.status_code != 200:
        return {"data": None, "error": "Failed to fetch todos"}
    return {"data": res.json(), "error": None}


@app.post("/todos")
async def create_todo(body: TodoCreate, auth: dict = Depends(verify_token)):
    async with httpx.AsyncClient() as client:
        res = await client.post(
            f"{SUPABASE_URL}/rest/v1/todos",
            headers={**authed_headers(auth["token"]), "Prefer": "return=representation"},
            json={"title": body.title, "user_id": auth["user"]["id"], "done": False},
        )
    if res.status_code not in (200, 201):
        return {"data": None, "error": "Failed to create todo"}
    rows = res.json()
    return {"data": rows[0] if rows else None, "error": None}


@app.patch("/todos/{todo_id}")
async def toggle_todo(todo_id: str, auth: dict = Depends(verify_token)):
    h = authed_headers(auth["token"])
    params = {"id": f"eq.{todo_id}"}
    async with httpx.AsyncClient() as client:
        get_res = await client.get(
            f"{SUPABASE_URL}/rest/v1/todos",
            headers=h,
            params={**params, "select": "done"},
        )
        rows = get_res.json()
        if get_res.status_code != 200 or not rows:
            raise HTTPException(status_code=404, detail="Todo not found")

        patch_res = await client.patch(
            f"{SUPABASE_URL}/rest/v1/todos",
            headers={**h, "Prefer": "return=representation"},
            params=params,
            json={"done": not rows[0]["done"]},
        )
    if patch_res.status_code not in (200, 201):
        return {"data": None, "error": "Failed to update todo"}
    updated = patch_res.json()
    return {"data": updated[0] if updated else None, "error": None}


@app.delete("/todos/{todo_id}")
async def delete_todo(todo_id: str, auth: dict = Depends(verify_token)):
    async with httpx.AsyncClient() as client:
        res = await client.delete(
            f"{SUPABASE_URL}/rest/v1/todos",
            headers=authed_headers(auth["token"]),
            params={"id": f"eq.{todo_id}"},
        )
    if res.status_code not in (200, 204):
        return {"data": None, "error": "Failed to delete todo"}
    return {"data": {"deleted": True}, "error": None}


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
