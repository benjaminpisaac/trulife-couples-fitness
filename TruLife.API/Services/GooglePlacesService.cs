using System.Text.Json;

namespace TruLife.API.Services
{
    public class GooglePlacesService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private const string PlacesBaseUrl = "https://places.googleapis.com/v1/places";

        public GooglePlacesService(IConfiguration configuration)
        {
            _httpClient = new HttpClient();
            _apiKey = configuration["GooglePlaces:ApiKey"] ?? throw new InvalidOperationException("Google Places API key not configured");
        }

        public async Task<List<RestaurantResult>> SearchNearbyRestaurants(
            double latitude,
            double longitude,
            int radiusMeters = 5000,
            string? cuisine = null)
        {
            var requestBody = new
            {
                includedTypes = new[] { "restaurant" },
                maxResultCount = 20,
                locationRestriction = new
                {
                    circle = new
                    {
                        center = new
                        {
                            latitude,
                            longitude
                        },
                        radius = radiusMeters
                    }
                }
            };

            var request = new HttpRequestMessage(HttpMethod.Post, $"{PlacesBaseUrl}:searchNearby");
            request.Headers.Add("X-Goog-Api-Key", _apiKey);
            request.Headers.Add("X-Goog-FieldMask", "places.displayName,places.formattedAddress,places.location,places.rating,places.priceLevel,places.primaryType,places.photos");
            request.Content = JsonContent.Create(requestBody);

            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<JsonElement>();
            var places = result.GetProperty("places").EnumerateArray();

            var restaurants = new List<RestaurantResult>();

            foreach (var place in places)
            {
                var name = place.TryGetProperty("displayName", out var displayName)
                    ? displayName.GetProperty("text").GetString() ?? "Unknown"
                    : "Unknown";

                var address = place.TryGetProperty("formattedAddress", out var addr)
                    ? addr.GetString() ?? ""
                    : "";

                var rating = place.TryGetProperty("rating", out var rat)
                    ? rat.GetDouble()
                    : 0;

                var priceLevel = place.TryGetProperty("priceLevel", out var price)
                    ? price.GetString() ?? "PRICE_LEVEL_UNSPECIFIED"
                    : "PRICE_LEVEL_UNSPECIFIED";

                var location = place.GetProperty("location");
                var lat = location.GetProperty("latitude").GetDouble();
                var lng = location.GetProperty("longitude").GetDouble();

                // Calculate distance
                var distance = CalculateDistance(latitude, longitude, lat, lng);

                // Get photo reference if available
                string? photoUrl = null;
                if (place.TryGetProperty("photos", out var photos) && photos.GetArrayLength() > 0)
                {
                    var photoName = photos[0].GetProperty("name").GetString();
                    photoUrl = $"https://places.googleapis.com/v1/{photoName}/media?maxHeightPx=400&maxWidthPx=400&key={_apiKey}";
                }

                restaurants.Add(new RestaurantResult
                {
                    Name = name,
                    Address = address,
                    Rating = rating,
                    PriceLevel = ConvertPriceLevel(priceLevel),
                    Latitude = lat,
                    Longitude = lng,
                    Distance = distance,
                    PhotoUrl = photoUrl
                });
            }

            // Sort by distance
            return restaurants.OrderBy(r => r.Distance).ToList();
        }

        private double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
        {
            // Haversine formula
            var R = 6371; // Earth's radius in km
            var dLat = ToRadians(lat2 - lat1);
            var dLon = ToRadians(lon2 - lon1);
            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            return R * c;
        }

        private double ToRadians(double degrees) => degrees * Math.PI / 180;

        private int ConvertPriceLevel(string priceLevel)
        {
            return priceLevel switch
            {
                "PRICE_LEVEL_FREE" => 0,
                "PRICE_LEVEL_INEXPENSIVE" => 1,
                "PRICE_LEVEL_MODERATE" => 2,
                "PRICE_LEVEL_EXPENSIVE" => 3,
                "PRICE_LEVEL_VERY_EXPENSIVE" => 4,
                _ => 2
            };
        }
    }

    public class RestaurantResult
    {
        public string Name { get; set; } = "";
        public string Address { get; set; } = "";
        public double Rating { get; set; }
        public int PriceLevel { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public double Distance { get; set; }
        public string? PhotoUrl { get; set; }
    }
}
