import json

from urllib.parse import urlencode

from urllib.request import urlopen





def _condition_from_precipitation(precipitation_mm: float) -> str:

    if precipitation_mm >= 0.2:

        return "Rain"

    return "Clear"





def get_weather_for_location(lat: float, lon: float):

    """
    Fetch weather from Open-Meteo and gracefully fall back to deterministic defaults.
    """

    params = urlencode(

        {

            "latitude": lat,

            "longitude": lon,

            "current": "temperature_2m,precipitation",

            "timezone": "auto",

        }

    )

    url = f"https://api.open-meteo.com/v1/forecast?{params}"



    try:

        with urlopen(url, timeout=4) as response:

            payload = json.loads(response.read().decode("utf-8"))

            current = payload.get("current", {})



            temperature_c = float(current.get("temperature_2m", 22.5))

            precipitation_mm = float(current.get("precipitation", 0.0))



            return {

                "temperature_c": temperature_c,

                "condition": _condition_from_precipitation(precipitation_mm),

                "precipitation_mm": precipitation_mm,

            }

    except Exception:

        return {

            "temperature_c": 22.5,

            "condition": "Clear",

            "precipitation_mm": 0.0,

        }

