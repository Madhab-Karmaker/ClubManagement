using ClubManagement.Domain.DTOs;
using ClubManagement.Infrastructure.Data;
using ClubManagement.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ClubManagement.Services.Implementations
{
    public class SearchService : ISearchService
    {
        private readonly AppDbContext _context;

        public SearchService(AppDbContext context) => _context = context;

        public async Task<SearchResultDto> SearchAsync(string query, int maxResultsPerType = 5)
        {
            var result = new SearchResultDto();

            if (string.IsNullOrWhiteSpace(query))
                return result;

            var search = query.ToLower().Trim();

            // Search members
            result.Members = await _context.Members
                .Where(m =>
                    m.FirstName.ToLower().Contains(search) ||
                    m.LastName.ToLower().Contains(search) ||
                    m.Email.ToLower().Contains(search) ||
                    m.PhoneNumber.Contains(search))
                .OrderBy(m => m.LastName)
                .Take(maxResultsPerType)
                .Select(m => new MemberSearchHitDto
                {
                    MemberId = m.MemberId,
                    Name = m.FirstName + " " + m.LastName,
                    Email = m.Email,
                    Phone = m.PhoneNumber,
                    IsActive = m.IsActive
                })
                .ToListAsync();

            // Search donations
            result.Donations = await _context.Donations
                .Include(d => d.Member)
                .Where(d =>
                    d.ReferenceNumber != null && d.ReferenceNumber.ToLower().Contains(search) ||
                    d.ReceiptNumber != null && d.ReceiptNumber.ToLower().Contains(search) ||
                    d.Note != null && d.Note.ToLower().Contains(search) ||
                    d.Member.FirstName.ToLower().Contains(search) ||
                    d.Member.LastName.ToLower().Contains(search))
                .OrderByDescending(d => d.DonationDate)
                .Take(maxResultsPerType)
                .Select(d => new DonationSearchHitDto
                {
                    DonationId = d.Id,
                    MemberName = d.Member.FirstName + " " + d.Member.LastName,
                    Amount = d.Amount,
                    DonationDate = d.DonationDate,
                    ReferenceNumber = d.ReferenceNumber
                })
                .ToListAsync();

            // Search events
            result.Events = await _context.Events
                .Where(e =>
                    e.EventName.ToLower().Contains(search) ||
                    (e.Description != null && e.Description.ToLower().Contains(search)) ||
                    (e.Location != null && e.Location.ToLower().Contains(search)))
                .OrderBy(e => e.EventDate)
                .Take(maxResultsPerType)
                .Select(e => new EventSearchHitDto
                {
                    EventId = e.EventId,
                    EventName = e.EventName,
                    EventDate = e.EventDate,
                    Location = e.Location
                })
                .ToListAsync();

            return result;
        }
    }
}
