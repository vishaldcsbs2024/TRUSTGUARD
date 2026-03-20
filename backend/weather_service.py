# Mocks external weather API
def get_weather_for_location(lat: float, lon: float):
    # Simulated response
    # In reality, this would call OpenWeatherMap or Apple Weather
    # Using fixed mock response for deterministic testing
    return {
        "temperature_c": 22.5,
        "condition": "Clear",
        "precipitation_mm": 0.0
    }
