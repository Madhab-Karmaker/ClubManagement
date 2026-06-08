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
        private readonly IAuditLogService _auditLogService;

        public DonationService(AppDbContext context, IAuditLogService auditLogService)
        {
            _context = context;
            _auditLogService = auditLogService;
        }

        public async Task<PagedResult<DonationResponseDto>> GetPagedDonationsAsync(DonationQueryParams query)
        {
            var q = _context.Donations
                .Include(d => d.Member)
                .Include(d => d.Category)
                .Include(d => d.PaymentMethodLookup)
                .Include(d => d.Status)
                .AsNoTracking()
                .AsQueryable();

            if (query.MemberId.HasValue)
                q = q.Where(d => d.MemberId == query.MemberId.Value);

            if (query.CategoryId.HasValue)
                q = q.Where(d => d.CategoryId == query.CategoryId.Value);

            if (query.PaymentMethodId.HasValue)
                q = q.Where(d => d.PaymentMethodId == query.PaymentMethodId.Value);

            if (query.StatusId.HasValue)
                q = q.Where(d => d.StatusId == query.StatusId.Value);

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

        public async Task<DonationResponseDto?> GetDonationByIdAsync(int id)
        {
            var donation = await _context.Donations
                .Include(d => d.Member)
                .Include(d => d.Category)
                .Include(d => d.PaymentMethodLookup)
                .Include(d => d.Status)
                .AsNoTracking()
                .FirstOrDefaultAsync(d => d.Id == id);

            return donation is null ? null : MapToDto(donation);
        }

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
                .Include(d => d.Status)
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

        public async Task<DonationResponseDto> CreateDonationAsync(CreateDonationDto dto)
        {
            var member = await _context.Members.FindAsync(dto.MemberId)
                ?? throw new KeyNotFoundException($"Member with ID {dto.MemberId} was not found.");

            var category = await _context.DonationCategories
                .FirstOrDefaultAsync(c => c.CategoryId == dto.CategoryId && c.IsActive)
                ?? throw new KeyNotFoundException($"Donation category with ID {dto.CategoryId} was not found.");

            var paymentMethod = await _context.PaymentMethodLookups
                .FirstOrDefaultAsync(p => p.PaymentMethodId == dto.PaymentMethodId && p.IsActive)
                ?? throw new KeyNotFoundException($"Payment method with ID {dto.PaymentMethodId} was not found.");

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
                StatusId        = 1
            };

            _context.Donations.Add(donation);
            await _context.SaveChangesAsync();

            donation.ReceiptNumber = GenerateReceiptNumber(donation);
            await _context.SaveChangesAsync();

            await _auditLogService.LogAsync(
                donation.Id,
                "Created",
                null,
                $"{donation.Amount} - {category.CategoryName}",
                "System");

            await _context.Entry(donation).Reference(d => d.Member).LoadAsync();
            await _context.Entry(donation).Reference(d => d.Category).LoadAsync();
            await _context.Entry(donation).Reference(d => d.PaymentMethodLookup).LoadAsync();
            await _context.Entry(donation).Reference(d => d.Status).LoadAsync();

            return MapToDto(donation);
        }

        public async Task<DonationResponseDto> UpdateDonationAsync(int id, UpdateDonationDto dto, string? changedBy = null)
        {
            var donation = await _context.Donations
                .Include(d => d.Member)
                .Include(d => d.Category)
                .Include(d => d.PaymentMethodLookup)
                .Include(d => d.Status)
                .FirstOrDefaultAsync(d => d.Id == id)
                ?? throw new KeyNotFoundException($"Donation with ID {id} not found.");

            var oldValue = $"{donation.Amount} - {donation.Category?.CategoryName}";

            if (dto.Amount.HasValue) donation.Amount = dto.Amount.Value;
            if (dto.CategoryId.HasValue) donation.CategoryId = dto.CategoryId.Value;
            if (dto.PaymentMethodId.HasValue) donation.PaymentMethodId = dto.PaymentMethodId.Value;
            if (dto.ReferenceNumber != null) donation.ReferenceNumber = dto.ReferenceNumber;
            if (dto.DonationDate.HasValue) donation.DonationDate = ToUtc(dto.DonationDate.Value);
            if (dto.Note != null) donation.Note = dto.Note;

            await _context.SaveChangesAsync();

            var newValue = $"{donation.Amount} - {donation.Category?.CategoryName}";
            await _auditLogService.LogAsync(donation.Id, "Updated", oldValue, newValue, changedBy);

            return MapToDto(donation);
        }

        public async Task<bool> DeleteDonationAsync(int id)
        {
            var donation = await _context.Donations.FindAsync(id);
            if (donation == null) return false;

            donation.IsDeleted = true;
            donation.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            await _auditLogService.LogAsync(id, "Deleted", null, null, "System");
            return true;
        }

        public async Task<DonationResponseDto> UpdateDonationStatusAsync(int id, int statusId, string? changedBy = null)
        {
            var donation = await _context.Donations
                .Include(d => d.Member)
                .Include(d => d.Category)
                .Include(d => d.PaymentMethodLookup)
                .Include(d => d.Status)
                .FirstOrDefaultAsync(d => d.Id == id)
                ?? throw new KeyNotFoundException($"Donation with ID {id} not found.");

            var oldStatus = donation.StatusId;

            var statusExists = await _context.DonationStatuses.AnyAsync(s => s.StatusId == statusId);
            if (!statusExists)
                throw new KeyNotFoundException($"Status with ID {statusId} not found.");

            donation.StatusId = statusId;
            await _context.SaveChangesAsync();

            await _auditLogService.LogAsync(
                donation.Id, "StatusChanged",
                $"StatusId: {oldStatus}", $"StatusId: {statusId}",
                changedBy);

            // Reload status
            await _context.Entry(donation).Reference(d => d.Status).LoadAsync();

            return MapToDto(donation);
        }

        private static string GenerateReceiptNumber(Donation donation)
        {
            return $"RCP-{donation.DonationDate:yyyyMMdd}-{donation.Id:D6}";
        }

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
            StatusName      = d.Status?.StatusName ?? "Unknown",
            StatusId        = d.StatusId,
            ReceiptNumber   = d.ReceiptNumber,
            ReferenceNumber = d.ReferenceNumber,
            DonationDate    = d.DonationDate,
            Note            = d.Note,
            CreatedAt       = d.CreatedAt
        };
    }
}
