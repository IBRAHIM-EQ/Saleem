namespace WebApplication1.Model.EntityDto
{
    public class ProductSuitabilityDto
    {
        public int ProductId { get; set; }

        public bool IsSuitableForUser { get; set; }

        public string Reason { get; set; } = string.Empty;

        public List<string> MatchedAllergens { get; set; } = new();
    }
}