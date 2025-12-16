using System.Text.Json;
using System.Net.Http.Headers;

namespace TruLife.API.Services
{
    public class TransformationAnalysisService
    {
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;

        public TransformationAnalysisService(IConfiguration configuration, HttpClient httpClient)
        {
            _configuration = configuration;
            _httpClient = httpClient;
        }

        public async Task<TransformationAnalysis> AnalyzeTransformation(
            string beforePhotoBase64,
            string afterPhotoBase64,
            string partnerId)
        {
            var geminiApiKey = _configuration["GEMINI_API_KEY"];
            if (string.IsNullOrEmpty(geminiApiKey))
            {
                throw new Exception("GEMINI_API_KEY not configured");
            }

            var prompt = @"Analyze these before and after transformation photos and provide a detailed body composition analysis.

Focus on:
1. Muscle mass changes (increase/decrease/maintained)
2. Body fat percentage estimate (before and after)
3. Muscle definition improvements (scale 1-10)
4. Overall transformation quality (scale 1-10)
5. Specific areas of improvement (arms, core, legs, back, shoulders)

Provide your analysis in the following JSON format:
{
  ""muscleMassChange"": ""increased/decreased/maintained"",
  ""bodyFatBefore"": 25.0,
  ""bodyFatAfter"": 18.0,
  ""muscleDefinitionBefore"": 4,
  ""muscleDefinitionAfter"": 8,
  ""transformationQuality"": 9,
  ""areasImproved"": [""core"", ""arms""],
  ""overallAssessment"": ""Significant transformation with notable muscle definition and fat loss"",
  ""transformationScore"": 85
}

Be objective and detailed in your analysis.";

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
                                    data = beforePhotoBase64.Replace("data:image/jpeg;base64,", "")
                                        .Replace("data:image/png;base64,", "")
                                }
                            },
                            new
                            {
                                inline_data = new
                                {
                                    mime_type = "image/jpeg",
                                    data = afterPhotoBase64.Replace("data:image/jpeg;base64,", "")
                                        .Replace("data:image/png;base64,", "")
                                }
                            }
                        }
                    }
                },
                generationConfig = new
                {
                    temperature = 0.4,
                    topK = 32,
                    topP = 1,
                    maxOutputTokens = 2048
                }
            };

            var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={geminiApiKey}";

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(url, content);
            var responseContent = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                throw new Exception($"Gemini API error: {responseContent}");
            }

            var geminiResponse = JsonSerializer.Deserialize<GeminiResponse>(responseContent);
            var analysisText = geminiResponse?.candidates?[0]?.content?.parts?[0]?.text ?? "";

            // Extract JSON from response
            var jsonStart = analysisText.IndexOf('{');
            var jsonEnd = analysisText.LastIndexOf('}') + 1;
            if (jsonStart >= 0 && jsonEnd > jsonStart)
            {
                var jsonText = analysisText.Substring(jsonStart, jsonEnd - jsonStart);
                var analysis = JsonSerializer.Deserialize<TransformationAnalysis>(jsonText, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (analysis != null)
                {
                    analysis.PartnerId = partnerId;
                    analysis.AnalyzedAt = DateTime.UtcNow;
                    return analysis;
                }
            }

            // Fallback if parsing fails
            return new TransformationAnalysis
            {
                PartnerId = partnerId,
                MuscleMassChange = "maintained",
                BodyFatBefore = 20.0,
                BodyFatAfter = 20.0,
                MuscleDefinitionBefore = 5,
                MuscleDefinitionAfter = 5,
                TransformationQuality = 5,
                AreasImproved = new List<string>(),
                OverallAssessment = "Unable to analyze transformation",
                TransformationScore = 50,
                AnalyzedAt = DateTime.UtcNow
            };
        }

        public ChallengeWinner DetermineWinner(
            TransformationAnalysis partnerAAnalysis,
            TransformationAnalysis partnerBAnalysis,
            int partnerAPoints,
            int partnerBPoints,
            int partnerAConsistencyDays,
            int partnerBConsistencyDays,
            int totalChallengeDays)
        {
            // Scoring Algorithm:
            // 60% - Visual Transformation (AI analysis)
            // 20% - Points Earned
            // 15% - Consistency (daily logging)
            // 5% - Goal Achievement

            // Partner A Scores
            var partnerATransformationScore = partnerAAnalysis.TransformationScore * 0.6;
            var partnerAPointsScore = CalculatePointsScore(partnerAPoints, partnerBPoints) * 0.2;
            var partnerAConsistencyScore = CalculateConsistencyScore(partnerAConsistencyDays, totalChallengeDays) * 0.15;
            var partnerAGoalScore = CalculateGoalScore(partnerAAnalysis) * 0.05;
            var partnerATotalScore = partnerATransformationScore + partnerAPointsScore + partnerAConsistencyScore + partnerAGoalScore;

            // Partner B Scores
            var partnerBTransformationScore = partnerBAnalysis.TransformationScore * 0.6;
            var partnerBPointsScore = CalculatePointsScore(partnerBPoints, partnerAPoints) * 0.2;
            var partnerBConsistencyScore = CalculateConsistencyScore(partnerBConsistencyDays, totalChallengeDays) * 0.15;
            var partnerBGoalScore = CalculateGoalScore(partnerBAnalysis) * 0.05;
            var partnerBTotalScore = partnerBTransformationScore + partnerBPointsScore + partnerBConsistencyScore + partnerBGoalScore;

            var winner = new ChallengeWinner
            {
                WinnerId = partnerATotalScore > partnerBTotalScore ? "A" : 
                          partnerBTotalScore > partnerATotalScore ? "B" : "TIE",
                PartnerAScore = Math.Round(partnerATotalScore, 2),
                PartnerBScore = Math.Round(partnerBTotalScore, 2),
                PartnerABreakdown = new ScoreBreakdown
                {
                    TransformationScore = Math.Round(partnerATransformationScore, 2),
                    PointsScore = Math.Round(partnerAPointsScore, 2),
                    ConsistencyScore = Math.Round(partnerAConsistencyScore, 2),
                    GoalScore = Math.Round(partnerAGoalScore, 2)
                },
                PartnerBBreakdown = new ScoreBreakdown
                {
                    TransformationScore = Math.Round(partnerBTransformationScore, 2),
                    PointsScore = Math.Round(partnerBPointsScore, 2),
                    ConsistencyScore = Math.Round(partnerBConsistencyScore, 2),
                    GoalScore = Math.Round(partnerBGoalScore, 2)
                },
                JudgedAt = DateTime.UtcNow
            };

            return winner;
        }

        private double CalculatePointsScore(int myPoints, int opponentPoints)
        {
            if (myPoints == 0 && opponentPoints == 0) return 50;
            var totalPoints = myPoints + opponentPoints;
            return (myPoints / (double)totalPoints) * 100;
        }

        private double CalculateConsistencyScore(int consistencyDays, int totalDays)
        {
            if (totalDays == 0) return 50;
            var percentage = (consistencyDays / (double)totalDays) * 100;
            return Math.Min(percentage, 100);
        }

        private double CalculateGoalScore(TransformationAnalysis analysis)
        {
            // Simple goal achievement based on transformation quality
            return analysis.TransformationQuality * 10;
        }
    }

    // Response models
    public class TransformationAnalysis
    {
        public string PartnerId { get; set; } = "";
        public string MuscleMassChange { get; set; } = "";
        public double BodyFatBefore { get; set; }
        public double BodyFatAfter { get; set; }
        public int MuscleDefinitionBefore { get; set; }
        public int MuscleDefinitionAfter { get; set; }
        public int TransformationQuality { get; set; }
        public List<string> AreasImproved { get; set; } = new List<string>();
        public string OverallAssessment { get; set; } = "";
        public int TransformationScore { get; set; }
        public DateTime AnalyzedAt { get; set; }
    }

    public class ChallengeWinner
    {
        public string WinnerId { get; set; } = "";
        public double PartnerAScore { get; set; }
        public double PartnerBScore { get; set; }
        public ScoreBreakdown PartnerABreakdown { get; set; } = new ScoreBreakdown();
        public ScoreBreakdown PartnerBBreakdown { get; set; } = new ScoreBreakdown();
        public DateTime JudgedAt { get; set; }
    }

    public class ScoreBreakdown
    {
        public double TransformationScore { get; set; }
        public double PointsScore { get; set; }
        public double ConsistencyScore { get; set; }
        public double GoalScore { get; set; }
    }

    // Gemini API response models
    public class GeminiResponse
    {
        public GeminiCandidate[]? candidates { get; set; }
    }

    public class GeminiCandidate
    {
        public GeminiContent? content { get; set; }
    }

    public class GeminiContent
    {
        public GeminiPart[]? parts { get; set; }
    }

    public class GeminiPart
    {
        public string? text { get; set; }
    }
}
