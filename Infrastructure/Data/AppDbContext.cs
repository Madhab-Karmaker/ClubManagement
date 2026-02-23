using ClubManagement.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace ClubManagement.Infrastructure.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Role> Roles { get; set; } = null!;
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

            // User-Role many-to-many relationship
            modelBuilder.Entity<User>()
                .HasMany(u => u.Roles)
                .WithMany(r => r.Users)
                .UsingEntity(j => j.ToTable("UserRoles"));

            modelBuilder.Entity<Role>().HasData(
                new Role { RoleId = 1, Name = "Admin" }
            );

        }
    }
}
