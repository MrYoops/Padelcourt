"""API tests: health, users, matches."""
import pytest
from httpx import ASGITransport, AsyncClient

from backend.main import app


@pytest.mark.asyncio
async def test_health():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        r = await client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_get_user_not_found():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        r = await client.get("/users/00000000-0000-0000-0000-000000000001")
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_post_user():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        r = await client.post(
            "/users",
            json={"name": "Test User", "telegram_id": 12345},
        )
    assert r.status_code == 200
    data = r.json()
    assert data["name"] == "Test User"
    assert data["telegram_id"] == 12345
    user_id = data["id"]
    r2 = await client.get(f"/users/{user_id}")
    assert r2.status_code == 200
    assert r2.json()["name"] == "Test User"


@pytest.mark.asyncio
async def test_matches_start_and_point():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        users = []
        for i in range(4):
            r = await client.post("/users", json={"name": f"Player{i+1}"})
            assert r.status_code == 200
            users.append(r.json()["id"])
        r = await client.post(
            "/matches/start",
            json={
                "position_1_user_id": users[0],
                "position_2_user_id": users[1],
                "position_3_user_id": users[2],
                "position_4_user_id": users[3],
            },
        )
        assert r.status_code == 200
        match = r.json()
        match_id = match["id"]
        assert match["status"] == "active"
        assert match["score"]["sets_a"] == 0 and match["score"]["sets_b"] == 0
        r2 = await client.post(
            f"/matches/{match_id}/point",
            json={"team": "A"},
        )
        assert r2.status_code == 200
        assert r2.json()["score"]["points_a"] == 15
        r3 = await client.post(f"/matches/{match_id}/end")
        assert r3.status_code == 200
        assert r3.json()["status"] == "finished"
