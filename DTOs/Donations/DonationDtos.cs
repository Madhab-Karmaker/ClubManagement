using System;
using System.Collections.Generic;

namespace ClubManagement.DTOs.Donations
{
    /// <summary>
    /// DTO for Dashboard Summary
    /// </summary>
    public class DashboardSummaryDto
    {
        public decimal TotalDonations { get; set; }
        public int TotalMembers { get; set; }
        public int ActiveDonors { get; set; }
        public decimal DonationsThisMonth { get; set; }
    }

    /// <summary>
    /// DTO for Recent Donation
    /// </summary>
    public class RecentDonationDto
    {
        public int DonationId { get; set; }
        public int DonorId { get; set; }
        public string DonorName { get; set; }
        public string DonorEmail { get; set; }
        public string DonorPhone { get; set; }
        public decimal Amount { get; set; }
        public DateTime DonationDate { get; set; }
        public string Category { get; set; }
        public string PaymentMethod { get; set; }
        public string Status { get; set; }
        public string Notes { get; set; }
    }

    /// <summary>
    /// DTO for Top Donor
    /// </summary>
    public class TopDonorDto
    {
        public int DonorId { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string ProfileImage { get; set; }
        public decimal TotalDonation { get; set; }
        public DateTime LastDonation { get; set; }
        public string Status { get; set; }
        public int DonationCount { get; set; }
        public DateTime JoinDate { get; set; }
    }

    /// <summary>
    /// DTO for Donation Trend
    /// </summary>
    public class DonationTrendDto
    {
        public string Month { get; set; }
        public decimal Amount { get; set; }
        public decimal PercentageChange { get; set; }
    }

    /// <summary>
    /// DTO for Category Distribution
    /// </summary>
    public class DonationCategoryDto
    {
        public string Name { get; set; }
        public decimal Amount { get; set; }
        public int Percentage { get; set; }
    }

    /// <summary>
    /// DTO for Daily Donations
    /// </summary>
    public class DailyDonationDto
    {
        public DateTime Date { get; set; }
        public decimal Amount { get; set; }
    }

    /// <summary>
    /// DTO for Complete Dashboard Data
    /// </summary>
    public class DonationDashboardDto
    {
        public decimal TotalDonations { get; set; }
        public int TotalMembers { get; set; }
        public int ActiveDonors { get; set; }
        public List<RecentDonationDto> RecentDonations { get; set; } = new();
        public List<TopDonorDto> TopDonors { get; set; } = new();
        public List<DonationTrendDto> Trends { get; set; } = new();
        public List<DonationCategoryDto> Categories { get; set; } = new();
        public List<DailyDonationDto> DailyDonations { get; set; } = new();
    }
}
