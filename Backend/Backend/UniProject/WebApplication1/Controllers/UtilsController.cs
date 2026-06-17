using Microsoft.AspNetCore.Mvc;

namespace WebApplication1.Controllers
{
    [Route("api/utils")]
    [ApiController]
    public class UtilsController : ControllerBase
    {
        /// <summary>
        /// Follows short Google Maps URL redirects (maps.app.goo.gl) up to 5 hops
        /// and returns the final URL so the frontend can extract lat/lng from it.
        /// No authentication required.
        /// </summary>
        [HttpGet("resolve-maps")]
        public async Task<IActionResult> ResolveMapsUrl([FromQuery] string url)
        {
            if (string.IsNullOrWhiteSpace(url))
                return BadRequest("url is required.");

            var current = url;
            const int maxHops = 5;

            var handler = new HttpClientHandler { AllowAutoRedirect = false };
            using var client = new HttpClient(handler);
            client.Timeout = TimeSpan.FromSeconds(6);
            client.DefaultRequestHeaders.Add("User-Agent",
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");

            for (int i = 0; i < maxHops; i++)
            {
                try
                {
                    var response = await client.GetAsync(current);
                    var location = response.Headers.Location?.ToString();

                    if (string.IsNullOrEmpty(location))
                        break; // no more redirects — this is the final URL

                    // Make relative Location headers absolute
                    if (location.StartsWith("/"))
                    {
                        var uri = new Uri(current);
                        location = $"{uri.Scheme}://{uri.Host}{location}";
                    }

                    current = location;

                    // Stop early if we already have coordinates in the URL
                    if (current.Contains("/@") || current.Contains("@-") ||
                        current.Contains("q=") && current.Contains(","))
                        break;
                }
                catch
                {
                    break;
                }
            }

            return Ok(new { resolvedUrl = current });
        }
    }
}
