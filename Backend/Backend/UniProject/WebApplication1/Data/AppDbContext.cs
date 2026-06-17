using Microsoft.EntityFrameworkCore;
using WebApplication1.Model;


namespace WebApplication1.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<UserAllergy> UserAllergies { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<ProductBrand> ProductBrands { get; set; }
        public DbSet<Store> Stores { get; set; }
        public DbSet<Specialist> Specialists { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Optional: Seed the Master Admin account so it exists in the database.
            // Using a static bcrypt hash for "SaleemAdmin2026" (Cost 10) to avoid EF Core 
            // constantly thinking the model has changed if we generate a new hash dynamically.
            modelBuilder.Entity<User>().HasData(new User
            {
                Id = -1, // Use a negative ID to avoid colliding with actual identities
                FirstName = "Master",
                LastName = "Admin",
                Email = "Admin@gmail.com",
                PasswordHash = "$2a$10$w1D2/83D4q15W9Z3H2zS1eUqE6J64L1q5L0wPzYnJzY1q1q1q1q1q", // Placeholder valid bcrypt format hash, you can replace with a real one
                Role = "Admin",
                OnboardingComplete = true
            });
        }
    }
}