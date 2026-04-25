using ClubManagement.Domain.Constants;
using System.ComponentModel.DataAnnotations;

namespace ClubManagement.Domain.DTOs
{
    // ── Query parameters ─────────────────────────────────────────────────────

    public class DonationQueryParams
    {
        /// <summary>Filter by member ID.</summary>
        public int? MemberId { get; set; }

        /// <summary>Filter by donation type.</summary>
        public int? CategoryId { get; set; } 

        /// <summary>Filter by payment method.</summary>
        public PaymentMethodType? PaymentMethod { get; set; }

        /// <summary>From date (inclusive).</summary>
        public DateTime? FromDate { get; set; }

        /// <summary>To date (inclusive).</summary>
        public DateTime? ToDate { get; set; }

        /// <summary>Column to sort by (amount, donationDate, createdAt). Defaults to donationDate.</summary>
        public string SortBy { get; set; } = "donationDate";

        /// <summary>Sort direction: asc or desc. Defaults to desc.</summary>
        public string SortDir { get; set; } = "desc";

        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }

    // ── Create request ───────────────────────────────────────────────────────

    public class CreateDonationDto
    {
        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "MemberId must be a positive integer.")]
        public int MemberId { get; set; }

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than zero.")]
        public decimal Amount { get; set; }

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "CategoryId must be a positive integer.")]
        public int CategoryId { get; set; }

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "PaymentMethodId must be a positive integer.")]
        public int PaymentMethodId { get; set; }

        [MaxLength(100)]
        public string? ReferenceNumber { get; set; }

        [Required]
        public DateTime DonationDate { get; set; }

        [MaxLength(500)]
        public string? Note { get; set; }
    }

    // ── Response ─────────────────────────────────────────────────────────────

    public class DonationResponseDto
    {
        public int Id { get; set; }
        public int MemberId { get; set; }
        public string MemberFullName { get; set; } = null!;
        public decimal Amount { get; set; }
        public string CategoryName { get; set; } = null!;
        public string PaymentMethod { get; set; } = null!;
        public string? ReferenceNumber { get; set; }
        public DateTime DonationDate { get; set; }
        public string? Note { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
