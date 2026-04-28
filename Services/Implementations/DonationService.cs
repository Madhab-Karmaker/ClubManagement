using ClubManagement.Domain.DTOs;
using ClubManagement.Domain.Models;
using ClubManagement.Infrastructure.Data;
using ClubManagement.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ClubManagement.Services.Implementations
{
    public class DonationService : IDonationService
    {
        private readonly AppDbContext _context;

        public DonationService(AppDbContext context) => _context = context;

        // ── Paged list with filtering & sorting ───────────────────────────
        public async Task<PagedResult<DonationResponseDto>> GetPagedDonationsAsync(DonationQueryParams query)
        {
            var q = _context.Donations
                .Include(d => d.Member)
                .Include(d => d.Category)
                .Include(d => d.PaymentMethodLookup)
                .AsNoTracking()
                .AsQueryable();

            if (query.MemberId.HasValue)
                q = q.Where(d => d.MemberId == query.MemberId.Value);

            if (query.CategoryId.HasValue)
                q = q.Where(d => d.CategoryId == query.CategoryId.Value);

            if (query.PaymentMethodId.HasValue)
                q = q.Where(d => d.PaymentMethodId == query.PaymentMethodId.Value);

            if (query.FromDate.HasValue)
                q = q.Where(d => d.DonationDate >= ToUtc(query.FromDate.Value));

            if (query.ToDate.HasValue)
                q = q.Where(d => d.DonationDate <= ToUtc(query.ToDate.Value));

            q = (query.SortBy.ToLower(), query.SortDir.ToLower()) switch
            {
                ("amount", "asc")   => q.OrderBy(d => d.Amount),
                ("amount", _)         => q.OrderByDescending(d => d.Amount),
                ("createdat", "asc") => q.OrderBy(d => d.CreatedAt),
                ("createdat", _)      => q.OrderByDescending(d => d.CreatedAt),
                (_, "asc")            => q.OrderBy(d => d.DonationDate),
                _                      => q.OrderByDescending(d => d.DonationDate),
            };

            var totalCount = await q.CountAsync();

            var page = Math.Max(1, query.Page);
            var pageSize = Math.Clamp(query.PageSize, 1, 100);

            var items = await q
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PagedResult<DonationResponseDto>
            {
                Items = items.Select(MapToDto).ToList(),
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }

        // ── Single donation ───────────────────────────────────────────────
        public async Task<DonationResponseDto?> GetDonationByIdAsync(int id)
        {
            var donation = await _context.Donations
                .Include(d => d.Member)
                .Include(d => d.Category)
                .Include(d => d.PaymentMethodLookup)
                .AsNoTracking()
                .FirstOrDefaultAsync(d => d.Id == id);

            return donation is null ? null : MapToDto(donation);
        }

        // ── Donations by member ───────────────────────────────────────────
        public async Task<PagedResult<DonationResponseDto>> GetDonationsByMemberIdAsync(
            int memberId, int page, int pageSize)
        {
            var memberExists = await _context.Members.AnyAsync(m => m.MemberId == memberId);
            if (!memberExists)
                throw new KeyNotFoundException($"Member with ID {memberId} was not found.");

            var q = _context.Donations
                .Include(d => d.Member)
                .Include(d => d.Category)
                .Include(d => d.PaymentMethodLookup)
                .AsNoTracking()
                .Where(d => d.MemberId == memberId)
                .OrderByDescending(d => d.DonationDate);

            var totalCount = await q.CountAsync();

            page     = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 100);

            var items = await q
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PagedResult<DonationResponseDto>
            {
                Items      = items.Select(MapToDto).ToList(),
                TotalCount = totalCount,
                Page       = page,
                PageSize   = pageSize
            };
        }

        // ── Create donation ───────────────────────────────────────────────
        public async Task<DonationResponseDto> CreateDonationAsync(CreateDonationDto dto)
        {
            var memberExists = await _context.Members.AnyAsync(m => m.MemberId == dto.MemberId);
            if (!memberExists)
                throw new KeyNotFoundException($"Member with ID {dto.MemberId} was not found.");

            var categoryExists = await _context.DonationCategories
                .AnyAsync(c => c.CategoryId == dto.CategoryId && c.IsActive);
            if (!categoryExists)
                throw new KeyNotFoundException($"Donation category with ID {dto.CategoryId} was not found.");

            var paymentMethodExists = await _context.PaymentMethodLookups
                .AnyAsync(p => p.PaymentMethodId == dto.PaymentMethodId && p.IsActive);
            if (!paymentMethodExists)
                throw new KeyNotFoundException($"Payment method with ID {dto.PaymentMethodId} was not found.");

            var donation = new Donation
            {
                MemberId        = dto.MemberId,
                Amount          = dto.Amount,
                CategoryId      = dto.CategoryId,
                PaymentMethodId = dto.PaymentMethodId,
                ReferenceNumber = dto.ReferenceNumber,
                DonationDate    = ToUtc(dto.DonationDate),
                Note            = dto.Note,
                CreatedAt       = DateTime.UtcNow,
                StatusId        = 1 // Default: Completed
            };

            _context.Donations.Add(donation);
            await _context.SaveChangesAsync();

            // Reload navigation entities used by response mapping
            await _context.Entry(donation).Reference(d => d.Member).LoadAsync();
            await _context.Entry(donation).Reference(d => d.Category).LoadAsync();
            await _context.Entry(donation).Reference(d => d.PaymentMethodLookup).LoadAsync();

            return MapToDto(donation);
        }

        // ── Helpers ───────────────────────────────────────────────────────
        private static DateTime ToUtc(DateTime dt) =>
            dt.Kind == DateTimeKind.Utc ? dt : DateTime.SpecifyKind(dt, DateTimeKind.Utc);

        private static DonationResponseDto MapToDto(Donation d) => new()
        {
            Id              = d.Id,
            MemberId        = d.MemberId,
            MemberFullName  = $"{d.Member.FirstName} {d.Member.LastName}",
            Amount          = d.Amount,
            CategoryName    = d.Category?.CategoryName ?? "Unknown",
            PaymentMethod   = d.PaymentMethodLookup?.MethodName ?? "Unknown",
            ReferenceNumber = d.ReferenceNumber,
            DonationDate    = d.DonationDate,
            Note            = d.Note,
            CreatedAt       = d.CreatedAt
        };
    }
}
