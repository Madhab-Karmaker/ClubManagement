using ClubManagement.Domain.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace ClubManagement.Infrastructure.Data
{
    public class AppDbContext : IdentityDbContext<User>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // DbSet<User> and DbSet<Role> are now provided by IdentityDbContext
        public DbSet<Member> Members { get; set; } = null!;

        //public DbSet<Donation> Donations { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User-Member one-to-one relationship
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasOne(u => u.Member)
                .WithOne(m => m.User)
                .HasForeignKey<Member>(m => m.UserId)
                .OnDelete(DeleteBehavior.Cascade); ;
            });

            // User-Role many-to-many relationship is now handled by IdentityDbContext
        }
    }
}
