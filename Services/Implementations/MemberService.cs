using ClubManagement.Services.Interfaces;
using ClubManagement.Domain.DTOs;
using ClubManagement.Domain.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ClubManagement.Infrastructure.Data;

namespace ClubManagement.Services.Implementations
{
    public class MemberService : IMemberService
    {
        private readonly AppDbContext _context;
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;

        public MemberService(AppDbContext context, UserManager<User> userManager, RoleManager<IdentityRole> roleManager)
        {
            _context = context;
            _userManager = userManager;
            _roleManager = roleManager;
        }

        // ── Paged list with search & filter ──────────────────────────────
        public async Task<PagedResult<MemberResponseDto>> GetPagedMembersAsync(
            string? search, string? role, bool? isActive, int page, int pageSize)
        {
            var query = _context.Members.Include(m => m.User).AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.ToLower();
                query = query.Where(m =>
                    m.FirstName.ToLower().Contains(s) ||
                    m.LastName.ToLower().Contains(s) ||
                    m.Email.ToLower().Contains(s) ||
                    m.PhoneNumber.Contains(s));
            }

            if (isActive.HasValue)
                query = query.Where(m => m.IsActive == isActive.Value);

            var members = await query
                .OrderBy(m => m.LastName).ThenBy(m => m.FirstName)
                .ToListAsync();

            var dtos = new List<MemberResponseDto>();
            foreach (var member in members)
            {
                var roles = member.User != null
                    ? (await _userManager.GetRolesAsync(member.User)).ToList()
                    : new List<string>();

                if (!string.IsNullOrWhiteSpace(role) &&
                    !roles.Contains(role, StringComparer.OrdinalIgnoreCase))
                    continue;

                dtos.Add(MapToDto(member, roles));
            }

            return new PagedResult<MemberResponseDto>
            {
                Items = dtos.Skip((page - 1) * pageSize).Take(pageSize).ToList(),
                TotalCount = dtos.Count,
                Page = page,
                PageSize = pageSize
            };
        }

        // ── Get single member by Member ID ───────────────────────────────
        public async Task<MemberResponseDto?> GetMemberByIdAsync(int memberId)
        {
            var member = await _context.Members
                .Include(m => m.User)
                .FirstOrDefaultAsync(m => m.MemberId == memberId);

            if (member == null) return null;

            var roles = member.User != null
                ? (await _userManager.GetRolesAsync(member.User)).ToList()
                : new List<string>();

            return MapToDto(member, roles);
        }

        // ── Create user account + member profile ─────────────────────────
        public async Task<MemberResponseDto> CreateMemberWithAccountAsync(CreateMemberWithAccountDto dto)
        {
            if (await _userManager.FindByNameAsync(dto.Username) != null)
                throw new InvalidOperationException("Username is already taken.");

            // Use a transaction so that if the Member save fails, the user is also rolled back.
            await using var tx = await _context.Database.BeginTransactionAsync();
            try
            {
                var user = new User { UserName = dto.Username, Email = dto.Email };
                var result = await _userManager.CreateAsync(user, dto.Password);
                if (!result.Succeeded)
                    throw new InvalidOperationException(string.Join(", ", result.Errors.Select(e => e.Description)));

                foreach (var roleName in dto.Roles)
                {
                    if (await _roleManager.RoleExistsAsync(roleName))
                        await _userManager.AddToRoleAsync(user, roleName);
                }

                var member = new Member
                {
                    UserId = user.Id,
                    FirstName = dto.FirstName,
                    LastName = dto.LastName,
                    Email = dto.Email,
                    PhoneNumber = dto.PhoneNumber,
                    Address = dto.Address,
                    ProfilePhotoUrl = dto.ProfilePhotoUrl,
                    JoinDate = ToUtc(dto.JoinDate == default ? DateTime.UtcNow : dto.JoinDate),
                    ExpiryDate = ToUtc(dto.ExpiryDate == default ? DateTime.UtcNow.AddYears(1) : dto.ExpiryDate),
                    IsActive = dto.IsActive
                };
                _context.Members.Add(member);
                await _context.SaveChangesAsync();

                await tx.CommitAsync();

                var assignedRoles = (await _userManager.GetRolesAsync(user)).ToList();
                return MapToDto(member, assignedRoles);
            }
            catch
            {
                await tx.RollbackAsync();
                throw;
            }
        }

        // ── Update member by Member ID ────────────────────────────────────
        public async Task<MemberResponseDto?> UpdateMemberByIdAsync(int memberId, UpdateMemberDto dto)
        {
            var member = await _context.Members
                .Include(m => m.User)
                .FirstOrDefaultAsync(m => m.MemberId == memberId);

            if (member == null) return null;

            if (dto.FirstName != null) member.FirstName = dto.FirstName;
            if (dto.LastName != null) member.LastName = dto.LastName;
            if (dto.Email != null) member.Email = dto.Email;
            if (dto.PhoneNumber != null) member.PhoneNumber = dto.PhoneNumber;
            if (dto.Address != null) member.Address = dto.Address;
            if (dto.ProfilePhotoUrl != null) member.ProfilePhotoUrl = dto.ProfilePhotoUrl;
            if (dto.ExpiryDate.HasValue) member.ExpiryDate = ToUtc(dto.ExpiryDate.Value);
            if (dto.IsActive.HasValue) member.IsActive = dto.IsActive.Value;

            if (dto.Roles != null && member.User != null)
            {
                var current = await _userManager.GetRolesAsync(member.User);
                await _userManager.RemoveFromRolesAsync(member.User, current);
                foreach (var roleName in dto.Roles)
                {
                    if (await _roleManager.RoleExistsAsync(roleName))
                        await _userManager.AddToRoleAsync(member.User, roleName);
                }
            }

            await _context.SaveChangesAsync();

            var roles = member.User != null
                ? (await _userManager.GetRolesAsync(member.User)).ToList()
                : new List<string>();

            return MapToDto(member, roles);
        }

        // ── Delete member ────────────────────────────────────────────────
        public async Task<bool> DeleteMemberAsync(int memberId)
        {
            var member = await _context.Members
                .Include(m => m.User)
                .FirstOrDefaultAsync(m => m.MemberId == memberId);

            if (member == null) return false;

            if (member.User != null)
            {
                member.User.IsDeleted = true;
                await _userManager.UpdateAsync(member.User);
            }

            _context.Members.Remove(member);
            await _context.SaveChangesAsync();
            return true;
        }

        // ── Legacy methods (ProfileController) ───────────────────────────
        public async Task<Member?> GetMemberByUserIdAsync(string userId) =>
            await _context.Members.FirstOrDefaultAsync(m => m.UserId == userId);

        public async Task<Member> CreateMemberAsync(string userId, CreateMemberDto dto)
        {
            var member = new Member
            {
                UserId = userId,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email,
                PhoneNumber = dto.PhoneNumber,
                JoinDate = ToUtc(dto.JoinDate == default ? DateTime.UtcNow : dto.JoinDate),
                ExpiryDate = ToUtc(dto.ExpiryDate == default ? DateTime.UtcNow.AddYears(1) : dto.ExpiryDate),
                IsActive = true
            };
            _context.Members.Add(member);
            await _context.SaveChangesAsync();
            return member;
        }

        public async Task<Member?> UpdateMemberAsync(string userId, UpdateMemberDto dto)
        {
            var member = await GetMemberByUserIdAsync(userId);
            if (member == null) return null;

            if (dto.FirstName != null) member.FirstName = dto.FirstName;
            if (dto.LastName != null) member.LastName = dto.LastName;
            if (dto.Email != null) member.Email = dto.Email;
            if (dto.PhoneNumber != null) member.PhoneNumber = dto.PhoneNumber;
            if (dto.Address != null) member.Address = dto.Address;
            if (dto.ProfilePhotoUrl != null) member.ProfilePhotoUrl = dto.ProfilePhotoUrl;
            if (dto.ExpiryDate.HasValue) member.ExpiryDate = ToUtc(dto.ExpiryDate.Value);
            if (dto.IsActive.HasValue) member.IsActive = dto.IsActive.Value;

            await _context.SaveChangesAsync();
            return member;
        }

        // ── UTC helper — Npgsql 8 requires Kind=Utc for timestamptz columns ──
        private static DateTime ToUtc(DateTime dt) =>
            dt.Kind == DateTimeKind.Utc ? dt : DateTime.SpecifyKind(dt, DateTimeKind.Utc);

        // ── Mapping helper ────────────────────────────────────────────────
        private static MemberResponseDto MapToDto(Member member, IList<string> roles) => new()
        {
            MemberId = member.MemberId,
            FirstName = member.FirstName,
            LastName = member.LastName,
            Email = member.Email,
            PhoneNumber = member.PhoneNumber,
            Address = member.Address,
            ProfilePhotoUrl = member.ProfilePhotoUrl,
            JoinDate = member.JoinDate,
            ExpiryDate = member.ExpiryDate,
            IsActive = member.IsActive,
            UserId = member.UserId,
            Username = member.User?.UserName,
            Roles = roles.ToList()
        };
    }
}
