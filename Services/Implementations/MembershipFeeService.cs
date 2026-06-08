using ClubManagement.Domain.DTOs;
using ClubManagement.Domain.Models;
using ClubManagement.Infrastructure.Data;
using ClubManagement.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ClubManagement.Services.Implementations
{
    public class MembershipFeeService : IMembershipFeeService
    {
        private readonly AppDbContext _context;

        public MembershipFeeService(AppDbContext context) => _context = context;

        public async Task<List<MembershipFeeDto>> GetByMemberIdAsync(int memberId)
        {
            return await _context.MembershipFees
                .Include(f => f.Member)
                .Where(f => f.MemberId == memberId)
                .OrderByDescending(f => f.DueDate)
                .Select(f => new MembershipFeeDto
                {
                    MembershipFeeId = f.MembershipFeeId,
                    MemberId = f.MemberId,
                    MemberName = f.Member.FirstName + " " + f.Member.LastName,
                    Amount = f.Amount,
                    DueDate = f.DueDate,
                    PaidDate = f.PaidDate,
                    IsPaid = f.IsPaid,
                    DonationId = f.DonationId,
                    Note = f.Note
                })
                .ToListAsync();
        }

        public async Task<List<MembershipFeeDto>> GetPendingFeesAsync()
        {
            return await _context.MembershipFees
                .Include(f => f.Member)
                .Where(f => !f.IsPaid)
                .OrderBy(f => f.DueDate)
                .Select(f => new MembershipFeeDto
                {
                    MembershipFeeId = f.MembershipFeeId,
                    MemberId = f.MemberId,
                    MemberName = f.Member.FirstName + " " + f.Member.LastName,
                    Amount = f.Amount,
                    DueDate = f.DueDate,
                    PaidDate = f.PaidDate,
                    IsPaid = f.IsPaid,
                    DonationId = f.DonationId,
                    Note = f.Note
                })
                .ToListAsync();
        }

        public async Task<MembershipFeeDto> CreateFeeAsync(CreateMembershipFeeDto dto)
        {
            var member = await _context.Members.FindAsync(dto.MemberId)
                ?? throw new KeyNotFoundException($"Member with ID {dto.MemberId} not found.");

            var fee = new MembershipFee
            {
                MemberId = dto.MemberId,
                Amount = dto.Amount,
                DueDate = dto.DueDate,
                Note = dto.Note
            };

            _context.MembershipFees.Add(fee);
            await _context.SaveChangesAsync();

            return new MembershipFeeDto
            {
                MembershipFeeId = fee.MembershipFeeId,
                MemberId = fee.MemberId,
                MemberName = member.FirstName + " " + member.LastName,
                Amount = fee.Amount,
                DueDate = fee.DueDate,
                IsPaid = fee.IsPaid,
                Note = fee.Note
            };
        }

        public async Task<bool> MarkAsPaidAsync(int feeId, int donationId)
        {
            var fee = await _context.MembershipFees.FindAsync(feeId)
                ?? throw new KeyNotFoundException($"Fee with ID {feeId} not found.");

            var donation = await _context.Donations.FindAsync(donationId)
                ?? throw new KeyNotFoundException($"Donation with ID {donationId} not found.");

            fee.IsPaid = true;
            fee.PaidDate = DateTime.UtcNow;
            fee.DonationId = donationId;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteFeeAsync(int feeId)
        {
            var fee = await _context.MembershipFees.FindAsync(feeId);
            if (fee == null) return false;

            _context.MembershipFees.Remove(fee);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<MembershipRenewalDto> RenewMembershipAsync(RenewMembershipDto dto, string? renewedByUserId = null)
        {
            var member = await _context.Members.FindAsync(dto.MemberId)
                ?? throw new KeyNotFoundException($"Member with ID {dto.MemberId} not found.");

            var previousExpiry = member.ExpiryDate;
            var newExpiry = previousExpiry > DateTime.UtcNow
                ? previousExpiry.AddMonths(dto.RenewMonths)
                : DateTime.UtcNow.AddMonths(dto.RenewMonths);

            var renewal = new MembershipRenewal
            {
                MemberId = dto.MemberId,
                PreviousExpiryDate = previousExpiry,
                NewExpiryDate = newExpiry,
                FeePaid = dto.FeePaid,
                Note = dto.Note,
                RenewedByUserId = renewedByUserId
            };

            member.ExpiryDate = newExpiry;
            member.IsActive = true;

            _context.MembershipRenewals.Add(renewal);
            await _context.SaveChangesAsync();

            return new MembershipRenewalDto
            {
                MembershipRenewalId = renewal.MembershipRenewalId,
                MemberId = member.MemberId,
                MemberName = member.FirstName + " " + member.LastName,
                PreviousExpiryDate = previousExpiry,
                NewExpiryDate = newExpiry,
                FeePaid = dto.FeePaid,
                Note = dto.Note,
                RenewedAt = renewal.RenewedAt
            };
        }

        public async Task<List<ExpiringMemberDto>> GetExpiringMembersAsync(int withinDays = 30)
        {
            var now = DateTime.UtcNow;
            var expiryThreshold = now.AddDays(withinDays);

            return await _context.Members
                .Where(m => m.IsActive && m.ExpiryDate <= expiryThreshold && m.ExpiryDate > now)
                .OrderBy(m => m.ExpiryDate)
                .Select(m => new ExpiringMemberDto
                {
                    MemberId = m.MemberId,
                    FirstName = m.FirstName,
                    LastName = m.LastName,
                    Email = m.Email,
                    PhoneNumber = m.PhoneNumber,
                    ExpiryDate = m.ExpiryDate,
                    DaysUntilExpiry = (int)(m.ExpiryDate - now).TotalDays
                })
                .ToListAsync();
        }

        public async Task<List<MembershipRenewalDto>> GetRenewalHistoryAsync(int memberId)
        {
            return await _context.MembershipRenewals
                .Include(r => r.Member)
                .Where(r => r.MemberId == memberId)
                .OrderByDescending(r => r.RenewedAt)
                .Select(r => new MembershipRenewalDto
                {
                    MembershipRenewalId = r.MembershipRenewalId,
                    MemberId = r.MemberId,
                    MemberName = r.Member.FirstName + " " + r.Member.LastName,
                    PreviousExpiryDate = r.PreviousExpiryDate,
                    NewExpiryDate = r.NewExpiryDate,
                    FeePaid = r.FeePaid,
                    Note = r.Note,
                    RenewedAt = r.RenewedAt
                })
                .ToListAsync();
        }
    }
}
