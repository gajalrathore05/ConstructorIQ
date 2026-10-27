from fastapi import APIRouter, Query
from app.services.weather_service import get_weather

router = APIRouter()


@router.get("")
async def weather(location: str = Query(default="Mumbai", description="City name")):
    return await get_weather(location)
