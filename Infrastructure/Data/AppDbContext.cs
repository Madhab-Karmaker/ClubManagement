using ClubManagement.Domain.Models;
using ClubManagement.Domain.Constants;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace ClubManagement.Infrastructure.Data
{
    public class AppDbContext : IdentityDbContext<User>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // DbSet<User> and DbSet<Role> are now provided by IdentityDbContext
        public DbSet<Member> Members { get; set; } = null!;
        public DbSet<Donation> Donations { get; set; } = null!;

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

            // Member → Donations one-to-many
            modelBuilder.Entity<Donation>(entity =>
            {
                entity.HasKey(d => d.Id);
                entity.Property(d => d.Amount).HasPrecision(18, 2);
                entity.HasOne(d => d.Member)
                    .WithMany(m => m.Donations)
                    .HasForeignKey(d => d.MemberId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // User-Role many-to-many relationship is now handled by IdentityDbContext
        }
    }
}
