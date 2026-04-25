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
        public DbSet<Donation> Donations { get; set; } = null!;
        public DbSet<DonationCategory> DonationCategories { get; set; } = null!;
        public DbSet<PaymentMethodLookup> PaymentMethodLookups { get; set; } = null!;
        public DbSet<DonationStatus> DonationStatuses { get; set; } = null!;
        public DbSet<DonationStatistic> DonationStatistics { get; set; } = null!;
        public DbSet<MonthlySummary> MonthlySummaries { get; set; } = null!;
        public DbSet<DonationAuditLog> DonationAuditLogs { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ============================================================================
            // USER-MEMBER RELATIONSHIP
            // ============================================================================
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasOne(u => u.Member)
                    .WithOne(m => m.User)
                    .HasForeignKey<Member>(m => m.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // ============================================================================
            // MEMBER CONFIGURATION
            // ============================================================================
            modelBuilder.Entity<Member>(entity =>
            {
                entity.HasKey(e => e.MemberId);
                entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
                entity.Property(e => e.PhoneNumber).HasMaxLength(20);
                entity.Property(e => e.Address).HasMaxLength(300);
                entity.Property(e => e.ProfilePhotoUrl).HasMaxLength(500);

                // Indexes
                entity.HasIndex(e => e.Email).IsUnique();
                entity.HasIndex(e => e.PhoneNumber);
                entity.HasIndex(e => e.IsActive);
                entity.HasIndex(e => e.JoinDate);
            });

            // ============================================================================
            // DONATION CATEGORIES
            // ============================================================================
            modelBuilder.Entity<DonationCategory>(entity =>
            {
                entity.HasKey(e => e.CategoryId);
                entity.Property(e => e.CategoryName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.HasIndex(e => e.CategoryName).IsUnique();

                entity.HasData(
                    new DonationCategory { CategoryId = 1, CategoryName = "General", Description = "General donations for club operations", CreatedAt = DateTime.UtcNow, IsActive = true },
                    new DonationCategory { CategoryId = 2, CategoryName = "Event", Description = "Donations for specific events", CreatedAt = DateTime.UtcNow, IsActive = true },
                    new DonationCategory { CategoryId = 3, CategoryName = "Cause", Description = "Donations for special causes", CreatedAt = DateTime.UtcNow, IsActive = true },
                    new DonationCategory { CategoryId = 4, CategoryName = "Project", Description = "Donations for specific projects", CreatedAt = DateTime.UtcNow, IsActive = true }
                );
            });

            // ============================================================================
            // PAYMENT METHODS LOOKUP
            // ============================================================================
            modelBuilder.Entity<PaymentMethodLookup>(entity =>
            {
                entity.ToTable("PaymentMethods");
                entity.HasKey(e => e.PaymentMethodId);
                entity.Property(e => e.MethodName).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Description).HasMaxLength(200);
                entity.HasIndex(e => e.MethodName).IsUnique();

                entity.HasData(
                    new PaymentMethodLookup { PaymentMethodId = 1, MethodName = "Cash", Description = "Cash payment", CreatedAt = DateTime.UtcNow, IsActive = true },
                    new PaymentMethodLookup { PaymentMethodId = 2, MethodName = "Online", Description = "Online payment via bank or payment gateway", CreatedAt = DateTime.UtcNow, IsActive = true },
                    new PaymentMethodLookup { PaymentMethodId = 3, MethodName = "Cheque", Description = "Payment via cheque", CreatedAt = DateTime.UtcNow, IsActive = true },
                    new PaymentMethodLookup { PaymentMethodId = 4, MethodName = "Bank Transfer", Description = "Direct bank transfer", CreatedAt = DateTime.UtcNow, IsActive = true }
                );
            });

            // ============================================================================
            // DONATION STATUSES
            // ============================================================================
            modelBuilder.Entity<DonationStatus>(entity =>
            {
                entity.HasKey(e => e.StatusId);
                entity.Property(e => e.StatusName).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Description).HasMaxLength(200);
                entity.HasIndex(e => e.StatusName).IsUnique();

                entity.HasData(
                    new DonationStatus { StatusId = 1, StatusName = "Completed", Description = "Donation has been completed and verified", CreatedAt = DateTime.UtcNow },
                    new DonationStatus { StatusId = 2, StatusName = "Pending", Description = "Donation is pending verification", CreatedAt = DateTime.UtcNow },
                    new DonationStatus { StatusId = 3, StatusName = "Cancelled", Description = "Donation has been cancelled", CreatedAt = DateTime.UtcNow }
                );
            });

            // ============================================================================
            // DONATIONS CONFIGURATION
            // ============================================================================
            modelBuilder.Entity<Donation>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Amount).HasPrecision(15, 2);
                entity.Property(e => e.ReferenceNumber).HasMaxLength(100);
                entity.Property(e => e.Note).HasMaxLength(500);

                // Foreign Keys
                entity.HasOne(e => e.Member)
                    .WithMany(m => m.Donations)
                    .HasForeignKey(e => e.MemberId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Status)
                    .WithMany(s => s.Donations)
                    .HasForeignKey(e => e.StatusId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Category)
                    .WithMany(c => c.Donations)
                    .HasForeignKey(e => e.CategoryId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.PaymentMethodLookup)
                    .WithMany(p => p.Donations)
                    .HasForeignKey(e => e.PaymentMethodId)
                    .OnDelete(DeleteBehavior.Cascade);

                // Indexes
                entity.HasIndex(e => e.MemberId);
                entity.HasIndex(e => e.DonationDate);
                entity.HasIndex(e => e.CreatedAt);
                entity.HasIndex(e => e.Amount);
                entity.HasIndex(e => e.StatusId);
                entity.HasIndex(e => e.CategoryId);
                entity.HasIndex(e => e.PaymentMethodId);

                // Check constraint for positive amount
                entity.HasCheckConstraint("CK_Donation_Amount", "\"Amount\" > 0");
            });

            // ============================================================================
            // DONATION STATISTICS
            // ============================================================================
            modelBuilder.Entity<DonationStatistic>(entity =>
            {
                entity.HasKey(e => e.StatisticId);
                entity.Property(e => e.TotalDonations).HasPrecision(15, 2);
                entity.Property(e => e.CompletedDonations).HasPrecision(15, 2);
                entity.Property(e => e.PendingDonations).HasPrecision(15, 2);
                entity.HasIndex(e => e.StatisticDate);
            });

            // ============================================================================
            // MONTHLY SUMMARY
            // ============================================================================
            modelBuilder.Entity<MonthlySummary>(entity =>
            {
                entity.HasKey(e => e.SummaryId);
                entity.Property(e => e.YearMonth).HasMaxLength(7);
                entity.Property(e => e.TotalAmount).HasPrecision(15, 2);
                entity.Property(e => e.PreviousMonthAmount).HasPrecision(15, 2);
                entity.Property(e => e.PercentageChange).HasPrecision(5, 2);
                entity.HasIndex(e => e.YearMonth).IsUnique();
            });

            // ============================================================================
            // DONATION AUDIT LOG
            // ============================================================================
            modelBuilder.Entity<DonationAuditLog>(entity =>
            {
                entity.HasKey(e => e.AuditId);
                entity.Property(e => e.ActionType).HasMaxLength(50);
                entity.Property(e => e.ChangedBy).HasMaxLength(100);

                entity.HasOne(e => e.Donation)
                    .WithMany(d => d.AuditLogs)
                    .HasForeignKey(e => e.DonationId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.DonationId);
            });
        }
    }
}

