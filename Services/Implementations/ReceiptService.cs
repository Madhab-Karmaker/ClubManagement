using ClubManagement.Domain.DTOs;
using ClubManagement.Domain.Models;
using ClubManagement.Infrastructure.Data;
using ClubManagement.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ClubManagement.Services.Implementations
{
    public class ReceiptService : IReceiptService
    {
        private readonly AppDbContext _context;

        public ReceiptService(AppDbContext context) => _context = context;

        public async Task<DonationReceiptDto> GenerateReceiptAsync(int donationId, string? generatedByUserId = null)
        {
            var donation = await _context.Donations
                .Include(d => d.Member)
                .Include(d => d.Category)
                .Include(d => d.PaymentMethodLookup)
                .FirstOrDefaultAsync(d => d.Id == donationId)
                ?? throw new KeyNotFoundException($"Donation with ID {donationId} not found.");

            var receiptNumber = GenerateReceiptNumber(donation);

            var receipt = new Receipt
            {
                DonationId = donationId,
                ReceiptNumber = receiptNumber,
                GeneratedByUserId = generatedByUserId
            };

            donation.ReceiptNumber = receiptNumber;

            _context.Receipts.Add(receipt);
            await _context.SaveChangesAsync();

            return MapToDto(receipt, donation);
        }

        public async Task<DonationReceiptDto?> GetReceiptByDonationIdAsync(int donationId)
        {
            var receipt = await _context.Receipts
                .Include(r => r.Donation)
                    .ThenInclude(d => d.Member)
                .Include(r => r.Donation)
                    .ThenInclude(d => d.Category)
                .Include(r => r.Donation)
                    .ThenInclude(d => d.PaymentMethodLookup)
                .FirstOrDefaultAsync(r => r.DonationId == donationId);

            if (receipt == null) return null;

            return MapToDto(receipt, receipt.Donation);
        }

        public async Task<DonationReceiptDto?> GetReceiptByNumberAsync(string receiptNumber)
        {
            var receipt = await _context.Receipts
                .Include(r => r.Donation)
                    .ThenInclude(d => d.Member)
                .Include(r => r.Donation)
                    .ThenInclude(d => d.Category)
                .Include(r => r.Donation)
                    .ThenInclude(d => d.PaymentMethodLookup)
                .FirstOrDefaultAsync(r => r.ReceiptNumber == receiptNumber);

            if (receipt == null) return null;

            return MapToDto(receipt, receipt.Donation);
        }

        public async Task<List<DonationReceiptDto>> GetReceiptsByMemberIdAsync(int memberId)
        {
            return await _context.Receipts
                .Include(r => r.Donation)
                    .ThenInclude(d => d.Member)
                .Include(r => r.Donation)
                    .ThenInclude(d => d.Category)
                .Include(r => r.Donation)
                    .ThenInclude(d => d.PaymentMethodLookup)
                .Where(r => r.Donation.MemberId == memberId)
                .OrderByDescending(r => r.GeneratedAt)
                .Select(r => MapToDto(r, r.Donation))
                .ToListAsync();
        }

        private static string GenerateReceiptNumber(Donation donation)
        {
            var datePart = donation.DonationDate.ToString("yyyyMMdd");
            var idPart = donation.Id.ToString("D6");
            return $"RCP-{datePart}-{idPart}";
        }

        private static DonationReceiptDto MapToDto(Receipt receipt, Donation donation) => new()
        {
            ReceiptId = receipt.ReceiptId,
            ReceiptNumber = receipt.ReceiptNumber,
            DonationId = donation.Id,
            MemberName = $"{donation.Member.FirstName} {donation.Member.LastName}",
            MemberEmail = donation.Member.Email,
            Amount = donation.Amount,
            Category = donation.Category?.CategoryName ?? "Unknown",
            PaymentMethod = donation.PaymentMethodLookup?.MethodName ?? "Unknown",
            ReferenceNumber = donation.ReferenceNumber,
            DonationDate = donation.DonationDate,
            GeneratedAt = receipt.GeneratedAt,
            Note = donation.Note
        };
    }
}
