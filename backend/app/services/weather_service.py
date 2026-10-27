import httpx
import logging
from datetime import datetime
from app.core.config import settings

logger = logging.getLogger(__name__)


def _construction_advisory(condition: str, temp: float, wind_kmh: float, humidity: int) -> str:
    advisories = []
    cond = condition.lower()

    if any(w in cond for w in ["rain", "drizzle", "shower"]):
        advisories.append("Rain expected — protect materials, concrete pours may be affected, ensure site drainage.")
    if any(w in cond for w in ["thunder", "storm"]):
        advisories.append("Thunderstorm — suspend work at height, ground all electrical equipment, evacuate exposed areas.")
    if "snow" in cond:
        advisories.append("Snow conditions — suspend concrete work, clear access routes, verify temporary structure stability.")
    if wind_kmh > 50:
        advisories.append(f"High winds ({wind_kmh:.0f} km/h) — suspend crane operations and work at height, secure loose materials.")
    elif wind_kmh > 30:
        advisories.append(f"Moderate winds ({wind_kmh:.0f} km/h) — caution with crane lifts and scaffold work.")
    if temp > 38:
        advisories.append(f"Extreme heat ({temp:.0f}°C) — heat stress protocols required, schedule heavy work in early morning.")
    elif temp > 32:
        advisories.append(f"High temperature ({temp:.0f}°C) — monitor workers for heat stress, adjust concrete curing schedule.")
    if temp < 5:
        advisories.append(f"Near-freezing ({temp:.0f}°C) — protect freshly placed concrete from frost, concrete setting affected.")
    if humidity > 85:
        advisories.append(f"High humidity ({humidity}%) — allow extra drying time for surface coatings and adhesives.")

    if not advisories:
        advisories.append("Conditions appear suitable for general construction work. Follow standard site safety practices.")

    return " | ".join(advisories)


async def get_weather(location: str) -> dict:
    if not settings.weather_available:
        return {
            "location": location,
            "is_live": False,
            "error": "Weather service not configured. Add WEATHER_API_KEY to .env file.",
            "construction_advisory": "Configure a weather provider (OpenWeatherMap) for live advisories.",
            "forecast": []
        }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            params = {"q": location, "appid": settings.WEATHER_API_KEY, "units": "metric"}

            resp = await client.get("https://api.openweathermap.org/data/2.5/weather", params=params)
            resp.raise_for_status()
            data = resp.json()

            forecast_resp = await client.get("https://api.openweathermap.org/data/2.5/forecast", params=params)
            fdata = forecast_resp.json() if forecast_resp.status_code == 200 else {"list": []}

            condition = data["weather"][0]["description"].capitalize()
            temp = data["main"]["temp"]
            wind_kmh = data["wind"]["speed"] * 3.6
            humidity = data["main"]["humidity"]

            forecast = []
            seen = set()
            for item in fdata.get("list", [])[:40]:
                date = item["dt_txt"][:10]
                if date not in seen:
                    seen.add(date)
                    forecast.append({
                        "date": date,
                        "condition": item["weather"][0]["description"].capitalize(),
                        "temp_min": round(item["main"]["temp_min"], 1),
                        "temp_max": round(item["main"]["temp_max"], 1),
                        "humidity": item["main"]["humidity"]
                    })
                if len(forecast) >= 5:
                    break

            return {
                "location": f"{data['name']}, {data.get('sys', {}).get('country', '')}",
                "temperature": round(temp, 1),
                "feels_like": round(data["main"]["feels_like"], 1),
                "condition": condition,
                "humidity": humidity,
                "wind_speed": round(wind_kmh, 1),
                "forecast": forecast,
                "construction_advisory": _construction_advisory(condition, temp, wind_kmh, humidity),
                "is_live": True,
                "last_updated": datetime.utcnow().isoformat() + "Z"
            }

    except httpx.HTTPStatusError as e:
        logger.error(f"Weather API HTTP error: {e.response.status_code}")
        return {"location": location, "is_live": False, "error": f"Weather API error: {e.response.status_code}", "forecast": []}
    except Exception as e:
        logger.error(f"Weather service error: {e}")
        return {"location": location, "is_live": False, "error": str(e), "forecast": []}
