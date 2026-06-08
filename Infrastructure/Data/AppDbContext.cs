using ClubManagement.Domain.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace ClubManagement.Infrastructure.Data
{
    public class AppDbContext : IdentityDbContext<User>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Member> Members { get; set; } = null!;
        public DbSet<Donation> Donations { get; set; } = null!;
        public DbSet<DonationCategory> DonationCategories { get; set; } = null!;
        public DbSet<PaymentMethodLookup> PaymentMethodLookups { get; set; } = null!;
        public DbSet<DonationStatus> DonationStatuses { get; set; } = null!;
        public DbSet<DonationStatistic> DonationStatistics { get; set; } = null!;
        public DbSet<MonthlySummary> MonthlySummaries { get; set; } = null!;
        public DbSet<DonationAuditLog> DonationAuditLogs { get; set; } = null!;
        public DbSet<Event> Events { get; set; } = null!;
        public DbSet<EventAttendee> EventAttendees { get; set; } = null!;
        public DbSet<EventDonation> EventDonations { get; set; } = null!;
        public DbSet<MembershipFee> MembershipFees { get; set; } = null!;
        public DbSet<MembershipRenewal> MembershipRenewals { get; set; } = null!;
        public DbSet<Notification> Notifications { get; set; } = null!;
        public DbSet<Receipt> Receipts { get; set; } = null!;
        public DbSet<SavedReport> SavedReports { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ── USER-MEMBER ──
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasOne(u => u.Member)
                    .WithOne(m => m.User)
                    .HasForeignKey<Member>(m => m.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(u => u.IsDeleted);
            });

            // ── MEMBER ──
            modelBuilder.Entity<Member>(entity =>
            {
                entity.HasKey(e => e.MemberId);
                entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
                entity.Property(e => e.PhoneNumber).HasMaxLength(20);
                entity.Property(e => e.Address).HasMaxLength(300);
                entity.Property(e => e.ProfilePhotoUrl).HasMaxLength(500);

                entity.HasIndex(e => e.Email).IsUnique();
                entity.HasIndex(e => e.PhoneNumber);
                entity.HasIndex(e => e.IsActive);
                entity.HasIndex(e => e.IsDeleted);
                entity.HasIndex(e => e.JoinDate);
                entity.HasIndex(e => e.ExpiryDate);

                entity.HasQueryFilter(e => !e.IsDeleted);
            });

            // ── DONATION CATEGORY ──
            modelBuilder.Entity<DonationCategory>(entity =>
            {
                entity.HasKey(e => e.CategoryId);
                entity.Property(e => e.CategoryName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.HasIndex(e => e.CategoryName).IsUnique();

                var seedCat = new DateTime(2026, 4, 21, 18, 4, 6, DateTimeKind.Utc);
                entity.HasData(
                    new DonationCategory { CategoryId = 1, CategoryName = "General", Description = "General donations for club operations", CreatedAt = seedCat, IsActive = true },
                    new DonationCategory { CategoryId = 2, CategoryName = "Event", Description = "Donations for specific events", CreatedAt = seedCat, IsActive = true },
                    new DonationCategory { CategoryId = 3, CategoryName = "Cause", Description = "Donations for special causes", CreatedAt = seedCat, IsActive = true },
                    new DonationCategory { CategoryId = 4, CategoryName = "Project", Description = "Donations for specific projects", CreatedAt = seedCat, IsActive = true }
                );
            });

            // ── PAYMENT METHODS ──
            modelBuilder.Entity<PaymentMethodLookup>(entity =>
            {
                entity.ToTable("PaymentMethods");
                entity.HasKey(e => e.PaymentMethodId);
                entity.Property(e => e.MethodName).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Description).HasMaxLength(200);
                entity.HasIndex(e => e.MethodName).IsUnique();

                var seedPm = new DateTime(2026, 4, 21, 18, 4, 6, DateTimeKind.Utc);
                entity.HasData(
                    new PaymentMethodLookup { PaymentMethodId = 1, MethodName = "Cash", Description = "Cash payment", CreatedAt = seedPm, IsActive = true },
                    new PaymentMethodLookup { PaymentMethodId = 2, MethodName = "Online", Description = "Online payment via bank or payment gateway", CreatedAt = seedPm, IsActive = true },
                    new PaymentMethodLookup { PaymentMethodId = 3, MethodName = "Cheque", Description = "Payment via cheque", CreatedAt = seedPm, IsActive = true },
                    new PaymentMethodLookup { PaymentMethodId = 4, MethodName = "Bank Transfer", Description = "Direct bank transfer", CreatedAt = seedPm, IsActive = true }
                );
            });

            // ── DONATION STATUS ──
            modelBuilder.Entity<DonationStatus>(entity =>
            {
                entity.HasKey(e => e.StatusId);
                entity.Property(e => e.StatusName).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Description).HasMaxLength(200);
                entity.HasIndex(e => e.StatusName).IsUnique();

                var seedSt = new DateTime(2026, 4, 21, 18, 4, 6, DateTimeKind.Utc);
                entity.HasData(
                    new DonationStatus { StatusId = 1, StatusName = "Completed", Description = "Donation has been completed and verified", CreatedAt = seedSt },
                    new DonationStatus { StatusId = 2, StatusName = "Pending", Description = "Donation is pending verification", CreatedAt = seedSt },
                    new DonationStatus { StatusId = 3, StatusName = "Cancelled", Description = "Donation has been cancelled", CreatedAt = seedSt }
                );
            });

            // ── DONATION ──
            modelBuilder.Entity<Donation>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Amount).HasPrecision(15, 2);
                entity.Property(e => e.ReferenceNumber).HasMaxLength(100);
                entity.Property(e => e.ReceiptNumber).HasMaxLength(50);
                entity.Property(e => e.Note).HasMaxLength(500);

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

                entity.HasIndex(e => e.MemberId);
                entity.HasIndex(e => e.DonationDate);
                entity.HasIndex(e => e.CreatedAt);
                entity.HasIndex(e => e.Amount);
                entity.HasIndex(e => e.StatusId);
                entity.HasIndex(e => e.CategoryId);
                entity.HasIndex(e => e.PaymentMethodId);
                entity.HasIndex(e => e.ReceiptNumber).IsUnique();
                entity.HasIndex(e => e.ReferenceNumber);
                entity.HasIndex(e => e.IsDeleted);

                entity.HasQueryFilter(e => !e.IsDeleted);
                entity.ToTable(t => t.HasCheckConstraint("CK_Donation_Amount", "\"Amount\" > 0"));
            });

            // ── DONATION STATISTICS ──
            modelBuilder.Entity<DonationStatistic>(entity =>
            {
                entity.HasKey(e => e.StatisticId);
                entity.Property(e => e.TotalDonations).HasPrecision(15, 2);
                entity.Property(e => e.CompletedDonations).HasPrecision(15, 2);
                entity.Property(e => e.PendingDonations).HasPrecision(15, 2);
                entity.HasIndex(e => e.StatisticDate);
            });

            // ── MONTHLY SUMMARY ──
            modelBuilder.Entity<MonthlySummary>(entity =>
            {
                entity.HasKey(e => e.SummaryId);
                entity.Property(e => e.YearMonth).HasMaxLength(7);
                entity.Property(e => e.TotalAmount).HasPrecision(15, 2);
                entity.Property(e => e.PreviousMonthAmount).HasPrecision(15, 2);
                entity.Property(e => e.PercentageChange).HasPrecision(5, 2);
                entity.HasIndex(e => e.YearMonth).IsUnique();
            });

            // ── DONATION AUDIT LOG ──
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

            // ── EVENT ──
            modelBuilder.Entity<Event>(entity =>
            {
                entity.HasKey(e => e.EventId);
                entity.Property(e => e.EventName).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Description).HasMaxLength(2000);
                entity.Property(e => e.Location).HasMaxLength(500);
                entity.Property(e => e.Budget).HasPrecision(15, 2);

                entity.HasOne(e => e.CreatedBy)
                    .WithMany()
                    .HasForeignKey(e => e.CreatedByUserId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasIndex(e => e.EventDate);
                entity.HasIndex(e => e.IsActive);
                entity.HasIndex(e => e.IsDeleted);

                entity.HasQueryFilter(e => !e.IsDeleted);
            });

            // ── EVENT ATTENDEE ──
            modelBuilder.Entity<EventAttendee>(entity =>
            {
                entity.HasKey(e => e.EventAttendeeId);

                entity.HasOne(e => e.Event)
                    .WithMany(ev => ev.Attendees)
                    .HasForeignKey(e => e.EventId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Member)
                    .WithMany()
                    .HasForeignKey(e => e.MemberId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => new { e.EventId, e.MemberId }).IsUnique();
            });

            // ── EVENT DONATION ──
            modelBuilder.Entity<EventDonation>(entity =>
            {
                entity.HasKey(e => e.EventDonationId);

                entity.HasOne(e => e.Event)
                    .WithMany(ev => ev.EventDonations)
                    .HasForeignKey(e => e.EventId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Donation)
                    .WithMany()
                    .HasForeignKey(e => e.DonationId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => new { e.EventId, e.DonationId }).IsUnique();
            });

            // ── MEMBERSHIP FEE ──
            modelBuilder.Entity<MembershipFee>(entity =>
            {
                entity.HasKey(e => e.MembershipFeeId);
                entity.Property(e => e.Amount).HasPrecision(15, 2);
                entity.Property(e => e.Note).HasMaxLength(500);

                entity.HasOne(e => e.Member)
                    .WithMany()
                    .HasForeignKey(e => e.MemberId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Donation)
                    .WithMany()
                    .HasForeignKey(e => e.DonationId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasIndex(e => e.MemberId);
                entity.HasIndex(e => e.IsPaid);
                entity.HasIndex(e => e.DueDate);
            });

            // ── MEMBERSHIP RENEWAL ──
            modelBuilder.Entity<MembershipRenewal>(entity =>
            {
                entity.HasKey(e => e.MembershipRenewalId);
                entity.Property(e => e.FeePaid).HasPrecision(15, 2);
                entity.Property(e => e.Note).HasMaxLength(500);

                entity.HasOne(e => e.Member)
                    .WithMany(m => m.Renewals)
                    .HasForeignKey(e => e.MemberId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.RenewedBy)
                    .WithMany()
                    .HasForeignKey(e => e.RenewedByUserId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasIndex(e => e.MemberId);
            });

            // ── NOTIFICATION ──
            modelBuilder.Entity<Notification>(entity =>
            {
                entity.HasKey(e => e.NotificationId);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Message).HasMaxLength(2000);
                entity.Property(e => e.Type).HasMaxLength(50);

                entity.HasOne(e => e.Member)
                    .WithMany(m => m.Notifications)
                    .HasForeignKey(e => e.MemberId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.MemberId);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.IsRead);
                entity.HasIndex(e => e.CreatedAt);
            });

            // ── RECEIPT ──
            modelBuilder.Entity<Receipt>(entity =>
            {
                entity.HasKey(e => e.ReceiptId);
                entity.Property(e => e.ReceiptNumber).IsRequired().HasMaxLength(50);

                entity.HasOne(e => e.Donation)
                    .WithMany()
                    .HasForeignKey(e => e.DonationId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.GeneratedBy)
                    .WithMany()
                    .HasForeignKey(e => e.GeneratedByUserId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasIndex(e => e.ReceiptNumber).IsUnique();
                entity.HasIndex(e => e.DonationId);
            });

            // ── SAVED REPORT ──
            modelBuilder.Entity<SavedReport>(entity =>
            {
                entity.HasKey(e => e.SavedReportId);
                entity.Property(e => e.ReportName).IsRequired().HasMaxLength(200);
                entity.Property(e => e.ReportType).IsRequired().HasMaxLength(50);

                entity.HasOne(e => e.GeneratedBy)
                    .WithMany()
                    .HasForeignKey(e => e.GeneratedByUserId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasIndex(e => e.ReportType);
            });
        }
    }
}
