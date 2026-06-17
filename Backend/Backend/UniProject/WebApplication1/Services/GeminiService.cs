using System.Text;
using System.Text.Json;
using System.Net;

namespace WebApplication1.Services
{
    public class GeminiService : IGeminiService
    {
        private readonly IConfiguration _configuration;
        private readonly IHttpClientFactory _httpClientFactory;

        public GeminiService(IConfiguration configuration, IHttpClientFactory httpClientFactory)
        {
            _configuration = configuration;
            _httpClientFactory = httpClientFactory;
        }

        public async Task<string> GenerateReplyAsync(string message, string userAllergiesContext)
        {
            var apiKey = _configuration["Gemini:ApiKey"];
            var model = _configuration["Gemini:Model"];

            if (string.IsNullOrWhiteSpace(apiKey))
                throw new Exception("Gemini API Key is missing from configuration.");

            if (string.IsNullOrWhiteSpace(model))
                throw new Exception("Gemini model is missing from configuration.");

            var systemInstruction = $"""
            أنت مساعد ذكي داخل موقع منتجات غذائية مخصص للأشخاص الذين لديهم حساسية غذائية.

            بيانات حساسية المستخدم الحالية:
            {userAllergiesContext}

            التزم بالقواعد التالية:
            - اعتمد على بيانات حساسية المستخدم الحالية عند الإجابة.
            - ساعد المستخدم في اختيار المنتجات المناسبة حسب الحساسية المسجلة في حسابه.
            - إذا سأل المستخدم عن منتج يحتوي على مادة تسبب له الحساسية، حذّره بوضوح وباختصار.
            - إذا لم يكن لدى المستخدم حساسية مسجلة، اطلب منه تحديث بروفايله أولًا.
            - لا تخترع منتجات أو أماكن غير مذكورة في بيانات النظام.
            - إذا لم تتوفر لديك بيانات كافية عن منتج معين، قل بوضوح أنك تحتاج بيانات المنتجات من النظام.
            - اجعل الرد قصيرًا وواضحًا وسهلًا للمستخدم.
            - إذا سأل المستخدم سؤالًا لا يتعلق بالمنتجات الغذائية أو الحساسية، أعده بلطف إلى نطاق المساعدة الغذائية.
            - استخدم اللغة العربية بشكل أساسي إلا إذا طلب المستخدم غير ذلك.
            """;

            var client = _httpClientFactory.CreateClient();
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent";

            var requestBody = new
            {
                system_instruction = new
                {
                    parts = new[]
                    {
                        new { text = systemInstruction }
                    }
                },
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = message }
                        }
                    }
                }
            };

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            client.DefaultRequestHeaders.Clear();
            client.DefaultRequestHeaders.Add("x-goog-api-key", apiKey);

           
            int maxRetries = 3;
            int delayMilliseconds = 2000;

            for (int i = 0; i < maxRetries; i++)
            {
                try
                {
                    var response = await client.PostAsync(url, content);
                    var responseText = await response.Content.ReadAsStringAsync();

                    
                    if (response.IsSuccessStatusCode)
                    {
                        using var document = JsonDocument.Parse(responseText);
                        var root = document.RootElement;

                        var reply = root.GetProperty("candidates")[0]
                            .GetProperty("content")
                            .GetProperty("parts")[0]
                            .GetProperty("text")
                            .GetString();

                        return reply ?? "No response from Gemini.";
                    }

                    
                    if (response.StatusCode == HttpStatusCode.ServiceUnavailable)
                    {
                    
                        if (i == maxRetries - 1)
                        {
                            return "الذكاء الاصطناعي مشغول حالياً بسبب الضغط على السيرفر، يرجى إعادة إرسال رسالتك بعد ثوانٍ معدودة.";
                        }

                    
                        await Task.Delay(delayMilliseconds);
                        delayMilliseconds *= 2;
                    }
                    else
                    {
                        throw new Exception($"Gemini API Error: {response.StatusCode} - {responseText}");
                    }
                }
                catch (HttpRequestException) when (i < maxRetries - 1)
                {
                    await Task.Delay(delayMilliseconds);
                    delayMilliseconds *= 2;
                }
            }

            return "الخدمة غير متاحة حالياً، يرجى المحاولة لاحقاً.";
        }
    }
}