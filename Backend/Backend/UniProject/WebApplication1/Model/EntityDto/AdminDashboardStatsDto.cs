namespace WebApplication1.Model.EntityDto
{
    public class AdminDashboardStatsDto
    {
        public int TotalUsers { get; set; }

        public int TotalProducts { get; set; }

        public int TotalProductBrands { get; set; }

        public int TotalStores { get; set; }

        public int TotalSpecialists { get; set; }

        public int HiddenProducts { get; set; }

        public int HiddenProductBrands { get; set; }

        public int HiddenStores { get; set; }

        public int HiddenSpecialists { get; set; }
    }
}