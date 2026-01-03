using System.Text.Json;

namespace TruLife.API.Services
{
    public class GeminiService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private const string BaseUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
        
        public GeminiService(IConfiguration configuration)
        {
            _httpClient = new HttpClient();
            // Support both Gemini:ApiKey (local) and GEMINI_API_KEY (Render env var)
            _apiKey = configuration["Gemini:ApiKey"] 
                      ?? configuration["GEMINI_API_KEY"] 
                      ?? throw new InvalidOperationException("Gemini API key not configured");
        }
        
        public async Task<string> AnalyzeEquipmentFromPhoto(string base64Image)
        {
            var prompt = @"Analyze this photo and identify all available workout equipment and exercise opportunities. 
This could be a gym, bedroom, park, kitchen, outdoor area, or any space.
Look for:
- Traditional gym equipment (dumbbells, barbells, benches, machines, etc.)
- Household items usable for exercise (chairs, stairs, walls, counters, etc.)
- Outdoor features (benches, bars, hills, open space, etc.)
- Bodyweight exercise opportunities (floor space, sturdy furniture, etc.)

Return a JSON array of equipment/exercise options. Be specific and creative.
Examples: 'Dumbbells', 'Park Bench', 'Stairs', 'Open Floor Space', 'Kitchen Counter (for push-ups)', 'Tree Branch (for pull-ups)', 'Hill (for sprints)', etc.
Only return the JSON array, no additional text.";
            
            return await CallGeminiVision(prompt, base64Image);
        }
        
        public async Task<string> AnalyzeMealFromPhoto(string base64Image, string? dietaryPreferences = null)
        {
            var prompt = $@"Analyze this meal photo and estimate the macronutrients. 
{(dietaryPreferences != null ? $"Consider dietary preferences: {dietaryPreferences}" : "")}

Return a JSON object with this structure:
{{
  ""mealName"": ""descriptive name"",
  ""calories"": estimated_calories,
  ""protein"": grams,
  ""carbs"": grams,
  ""fats"": grams,
  ""ingredients"": [""ingredient1"", ""ingredient2""],
  ""confidence"": ""high/medium/low""
}}

Only return the JSON object, no additional text.";
            
            return await CallGeminiVision(prompt, base64Image);
        }
        
        public async Task<string> GenerateWorkout(
            string fitnessGoal,
            string availableEquipment,
            int readinessScore,
            string? recentWorkoutHistory = null)
        {
            var prompt = $@"Generate a personalized workout plan based on:
- Fitness Goal: {fitnessGoal}
- Available Equipment: {availableEquipment}
- Readiness Score (1-10): {readinessScore}
{(recentWorkoutHistory != null ? $"- Recent Workout History: {recentWorkoutHistory}" : "")}

Return a JSON object with this structure:
{{
  ""workoutName"": ""name"",
  ""durationMinutes"": estimated_duration,
  ""exercises"": [
    {{
      ""name"": ""exercise name"",
      ""sets"": number,
      ""reps"": number,
      ""restSeconds"": seconds,
      ""equipment"": ""required equipment"",
      ""muscleGroup"": ""primary muscle group"",
      ""notes"": ""form cues or modifications""
    }}
  ],
  ""warmup"": ""warmup instructions"",
  ""cooldown"": ""cooldown instructions""
}}

Adjust intensity based on readiness score. Only return JSON, no additional text.";
            
            return await CallGeminiText(prompt);
        }
        
        public async Task<string> GenerateMealRecommendations(
            double remainingCalories,
            double remainingProtein,
            double remainingCarbs,
            double remainingFats,
            string dietaryPreferences)
        {
            var prompt = $@"Generate 3 meal recommendations based on:
- Remaining Calories: {remainingCalories}
- Remaining Protein: {remainingProtein}g
- Remaining Carbs: {remainingCarbs}g
- Remaining Fats: {remainingFats}g
- Dietary Preferences: {dietaryPreferences}

Return a JSON array of meal suggestions:
[
  {{
    ""name"": ""meal name"",
    ""calories"": number,
    ""protein"": grams,
    ""carbs"": grams,
    ""fats"": grams,
    ""ingredients"": [""ingredient list""],
    ""prepTime"": ""preparation time"",
    ""instructions"": ""brief cooking instructions""
  }}
]

Only return the JSON array, no additional text.";
            
            return await CallGeminiText(prompt);
        }
        
        public async Task<string> GenerateRestaurantRecommendations(
            double targetCalories,
            double targetProtein,
            string dietaryPreferences,
            string? cuisine = null)
        {
            var prompt = $@"Suggest macro-friendly restaurant options and dishes based on:
- Target Calories: {targetCalories}
- Target Protein: {targetProtein}g
- Dietary Preferences: {dietaryPreferences}
{(cuisine != null ? $"- Preferred Cuisine: {cuisine}" : "")}

Return a JSON array of recommendations:
[
  {{
    ""restaurantType"": ""type of restaurant"",
    ""cuisine"": ""cuisine type"",
    ""recommendedDishes"": [
      {{
        ""dishName"": ""name"",
        ""estimatedCalories"": number,
        ""estimatedProtein"": grams,
        ""estimatedCarbs"": grams,
        ""estimatedFats"": grams,
        ""orderingTips"": ""how to customize for macros""
      }}
    ]
  }}
]

Only return the JSON array, no additional text.";
            
            return await CallGeminiText(prompt);
        }
        
        public async Task<string> AnalyzeLabResults(string labDataText)
        {
            var prompt = $@"Analyze these lab results and extract biomarkers with insights:

{labDataText}

Return a JSON object:
{{
  ""testName"": ""name of lab test"",
  ""testDate"": ""date if available"",
  ""biomarkers"": [
    {{
      ""name"": ""biomarker name"",
      ""value"": number,
      ""unit"": ""unit"",
      ""referenceRangeMin"": number,
      ""referenceRangeMax"": number,
      ""status"": ""Normal/High/Low/Critical"",
      ""recommendation"": ""actionable advice""
    }}
  ],
  ""overallInsights"": ""general health insights"",
  ""recommendations"": [""list of recommendations""]
}}

Only return the JSON object, no additional text.";
            
            return await CallGeminiText(prompt);
        }
        
        public async Task<string> AnalyzeDNA(string snpData)
        {
            var prompt = $@"Analyze these genetic SNPs and provide health insights:

{snpData}

Return a JSON object:
{{
  ""snps"": [
    {{
      ""snpId"": ""rs number"",
      ""gene"": ""gene name"",
      ""genotype"": ""genotype"",
      ""healthTrait"": ""associated health trait"",
      ""impact"": ""Positive/Neutral/Negative"",
      ""recommendation"": ""personalized advice""
    }}
  ],
  ""overallInsights"": ""summary of genetic profile"",
  ""recommendations"": [""lifestyle recommendations""]
}}

Only return the JSON object, no additional text.";
            
            return await CallGeminiText(prompt);
        }
        
        public async Task<(List<string> DetectedEquipment, string SpaceAssessment, string Notes)> AnalyzeEquipmentPhoto(string base64Image)
        {
            var prompt = @"Analyze this gym/workout environment photo and provide:
1. List of all visible equipment (be specific: 'Barbell', 'Dumbbells 5-50lbs', 'Pull-up Bar', 'Resistance Bands', 'Bench', 'Squat Rack', 'Kettlebells', 'Cable Machine', 'Treadmill', etc.)
2. Space assessment (small/medium/large)
3. Any notable features or limitations

Return JSON:
{
  ""equipment"": [""item1"", ""item2""],
  ""spaceAssessment"": ""small/medium/large"",
  ""notes"": ""observations about the space""
}

Only return JSON, no additional text.";
            
            var response = await CallGeminiVision(prompt, base64Image);
            
            try
            {
                var json = JsonSerializer.Deserialize<JsonElement>(response);
                var equipment = json.GetProperty("equipment").EnumerateArray()
                    .Select(e => e.GetString() ?? "").Where(s => !string.IsNullOrEmpty(s)).ToList();
                var spaceAssessment = json.GetProperty("spaceAssessment").GetString() ?? "medium";
                var notes = json.GetProperty("notes").GetString() ?? "";
                
                return (equipment, spaceAssessment, notes);
            }
            catch
            {
                // Fallback if JSON parsing fails
                return (new List<string> { "Dumbbells", "Yoga Mat", "Resistance Bands" }, "medium", "Unable to fully analyze image");
            }
        }
        
        public async Task<string> GenerateProgramWeek(
            int weekNumber,
            int totalWeeks,
            string fitnessGoal,
            Models.UserProfile? profile)
        {
            var profileContext = profile != null 
                ? $"User Profile: {profile.FitnessGoal}, Activity Level: {profile.ActivityLevel}"
                : "General fitness profile";
            
            var prompt = $@"Generate a detailed workout plan for Week {weekNumber} of a {totalWeeks}-week program.
Fitness Goal: {fitnessGoal}
{profileContext}

This is week {weekNumber} of {totalWeeks}, so adjust intensity and volume accordingly (progressive overload).

Return JSON with 7 days of workouts:
{{
  ""weekNumber"": {weekNumber},
  ""weekFocus"": ""primary focus for this week"",
  ""days"": [
    {{
      ""dayNumber"": 1,
      ""dayName"": ""Monday"",
      ""workoutType"": ""Upper Body/Lower Body/Full Body/Rest/Cardio"",
      ""exercises"": [
        {{
          ""name"": ""exercise name"",
          ""sets"": number,
          ""reps"": number,
          ""restSeconds"": seconds,
          ""notes"": ""form cues""
        }}
      ],
      ""notes"": ""daily notes""
    }}
  ],
  ""weeklyNotes"": ""overall guidance for the week""
}}

Only return JSON, no additional text.";
            
            return await CallGeminiText(prompt);
        }
        
        public async Task<string> GetPersonalTrainerResponse(
            string userMessage,
            List<Dictionary<string, string>> conversationHistory,
            Models.UserProfile? profile)
        {
            var profileContext = profile != null
                ? $"User: {profile.FitnessGoal}, {profile.ActivityLevel} activity level"
                : "General user";
            
            var historyText = string.Join("\n", conversationHistory.TakeLast(10).Select(h => 
                $"{h["role"]}: {h["content"]}"));
            
            var prompt = $@"You are an expert Personal Trainer AI assistant. 

{profileContext}

Conversation History:
{historyText}

User's latest message: {userMessage}

Provide expert fitness advice, workout guidance, form corrections, and motivation. Be encouraging, specific, and actionable. Keep responses concise (2-3 paragraphs max).

Response:";
            
            return await CallGeminiText(prompt);
        }
        
        public async Task<string> GetMindsetCoachResponse(
            string userMessage,
            List<Dictionary<string, string>> conversationHistory,
            Models.UserProfile? profile)
        {
            var profileContext = profile != null
                ? $"User's goal: {profile.FitnessGoal}"
                : "General user";
            
            var historyText = string.Join("\n", conversationHistory.TakeLast(10).Select(h =>
                $"{h["role"]}: {h["content"]}"));
            
            var prompt = $@"You are a supportive Mindset Coach AI assistant specializing in fitness motivation and mental resilience.

{profileContext}

Conversation History:
{historyText}

User's latest message: {userMessage}

Provide motivational support, help overcome mental barriers, build confidence, and maintain consistency. Be empathetic, inspiring, and practical. Keep responses concise (2-3 paragraphs max).

Response:";
            
            return await CallGeminiText(prompt);
        }
        
        public async Task<string> GenerateRomanticEvening(
            string partnerAPreferences,
            string partnerBPreferences,
            string partnerAMacros,
            string partnerBMacros)
        {
            var prompt = $@"Create a romantic evening plan with reciprocal meal design:

Partner A Preferences (for Partner B's meal): {partnerAPreferences}
Partner B Preferences (for Partner A's meal): {partnerBPreferences}

Partner A Macro Targets: {partnerAMacros}
Partner B Macro Targets: {partnerBMacros}

Use fusion logic to blend preferences and create:
{{
  ""theme"": ""overall romantic theme"",
  ""ambience"": ""setting and atmosphere"",
  ""partnerAMeal"": {{
    ""name"": ""meal name designed by B for A"",
    ""recipe"": {{
      ""ingredients"": [""list""],
      ""instructions"": [""step by step""],
      ""prepTime"": ""time"",
      ""servings"": 1
    }},
    ""macros"": {{
      ""calories"": number,
      ""protein"": grams,
      ""carbs"": grams,
      ""fats"": grams
    }},
    ""designRationale"": ""why this meal matches A's preferences""
  }},
  ""partnerBMeal"": {{
    ""name"": ""meal name designed by A for B"",
    ""recipe"": {{
      ""ingredients"": [""list""],
      ""instructions"": [""step by step""],
      ""prepTime"": ""time"",
      ""servings"": 1
    }},
    ""macros"": {{
      ""calories"": number,
      ""protein"": grams,
      ""carbs"": grams,
      ""fats"": grams
    }},
    ""designRationale"": ""why this meal matches B's preferences""
  }},
  ""suggestedActivities"": [""activity suggestions""],
  ""moodMusic"": [""song suggestions with artists""]
}}

Only return the JSON object, no additional text.";
            
            return await CallGeminiText(prompt);
        }
        
        private async Task<string> CallGeminiText(string prompt)
        {
            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = prompt }
                        }
                    }
                }
            };
            
            var response = await _httpClient.PostAsJsonAsync($"{BaseUrl}?key={_apiKey}", requestBody);
            response.EnsureSuccessStatusCode();
            
            var result = await response.Content.ReadFromJsonAsync<JsonElement>();
            var text = result.GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();
            
            return text ?? string.Empty;
        }
        
        private async Task<string> CallGeminiVision(string prompt, string base64Image)
        {
            // Strip base64 prefix if present (e.g. "data:image/jpeg;base64,")
            var cleanBase64 = base64Image;
            if (cleanBase64.Contains(","))
            {
                cleanBase64 = cleanBase64.Split(',')[1];
            }

            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new object[]
                        {
                            new { text = prompt },
                            new
                            {
                                inline_data = new
                                {
                                    mime_type = "image/jpeg",
                                    data = cleanBase64
                                }
                            }
                        }
                    }
                }
            };
            
            var response = await _httpClient.PostAsJsonAsync($"{BaseUrl}?key={_apiKey}", requestBody);
            response.EnsureSuccessStatusCode();
            
            var result = await response.Content.ReadFromJsonAsync<JsonElement>();
            var text = result.GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();
            
            return text ?? string.Empty;
        }
        
        public async Task<T?> GenerateContentAsync<T>(string prompt) where T : class
        {
            try
            {
                var jsonResponse = await CallGeminiText(prompt);
                return JsonSerializer.Deserialize<T>(jsonResponse);
            }
            catch (Exception)
            {
                return null;
            }
        }
    }
}
