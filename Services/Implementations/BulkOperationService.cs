using ClubManagement.Domain.DTOs;
using ClubManagement.Infrastructure.Data;
using ClubManagement.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ClubManagement.Services.Implementations
{
    public class BulkOperationService : IBulkOperationService
    {
        private readonly AppDbContext _context;

        public BulkOperationService(AppDbContext context) => _context = context;

        public async Task<BulkOperationResultDto> BulkDeleteMembersAsync(List<int> memberIds)
        {
            var result = new BulkOperationResultDto { TotalRequested = memberIds.Count };

            var members = await _context.Members
                .Where(m => memberIds.Contains(m.MemberId))
                .ToListAsync();

            foreach (var member in members)
            {
                try
                {
                    member.IsDeleted = true;
                    member.DeletedAt = DateTime.UtcNow;
                    result.Succeeded++;
                }
                catch (Exception ex)
                {
                    result.Failed++;
                    result.Errors.Add($"Member {member.MemberId}: {ex.Message}");
                }
            }

            await _context.SaveChangesAsync();
            return result;
        }

        public async Task<BulkOperationResultDto> BulkDeleteDonationsAsync(List<int> donationIds)
        {
            var result = new BulkOperationResultDto { TotalRequested = donationIds.Count };

            var donations = await _context.Donations
                .Where(d => donationIds.Contains(d.Id))
                .ToListAsync();

            foreach (var donation in donations)
            {
                try
                {
                    donation.IsDeleted = true;
                    donation.DeletedAt = DateTime.UtcNow;
                    result.Succeeded++;
                }
                catch (Exception ex)
                {
                    result.Failed++;
                    result.Errors.Add($"Donation {donation.Id}: {ex.Message}");
                }
            }

            await _context.SaveChangesAsync();
            return result;
        }

        public async Task<BulkOperationResultDto> BulkUpdateMemberStatusAsync(List<int> memberIds, bool isActive)
        {
            var result = new BulkOperationResultDto { TotalRequested = memberIds.Count };

            var members = await _context.Members
                .Where(m => memberIds.Contains(m.MemberId))
                .ToListAsync();

            foreach (var member in members)
            {
                try
                {
                    member.IsActive = isActive;
                    result.Succeeded++;
                }
                catch (Exception ex)
                {
                    result.Failed++;
                    result.Errors.Add($"Member {member.MemberId}: {ex.Message}");
                }
            }

            await _context.SaveChangesAsync();
            return result;
        }

        public async Task<BulkOperationResultDto> BulkUpdateDonationStatusAsync(List<int> donationIds, int statusId)
        {
            var result = new BulkOperationResultDto { TotalRequested = donationIds.Count };

            var statusExists = await _context.DonationStatuses.AnyAsync(s => s.StatusId == statusId);
            if (!statusExists)
            {
                result.Failed = donationIds.Count;
                result.Errors.Add($"Status ID {statusId} does not exist.");
                return result;
            }

            var donations = await _context.Donations
                .Where(d => donationIds.Contains(d.Id))
                .ToListAsync();

            foreach (var donation in donations)
            {
                try
                {
                    donation.StatusId = statusId;
                    result.Succeeded++;
                }
                catch (Exception ex)
                {
                    result.Failed++;
                    result.Errors.Add($"Donation {donation.Id}: {ex.Message}");
                }
            }

            await _context.SaveChangesAsync();
            return result;
        }
    }
}
