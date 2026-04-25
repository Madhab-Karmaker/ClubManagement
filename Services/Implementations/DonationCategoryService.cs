using ClubManagement.Domain.DTOs;
using ClubManagement.Domain.Models;
using ClubManagement.Infrastructure.Data;
using ClubManagement.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ClubManagement.Services.Implementations
{
    public class DonationCategoryService : IDonationCategoryService
    {
        private readonly AppDbContext _context;

        public DonationCategoryService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<DonationCategoryDto>> GetAllAsync()
        {
            return await _context.DonationCategories
                .OrderBy(x => x.CategoryName)
                .Select(x => new DonationCategoryDto
                {
                    Id = x.CategoryId,
                    CategoryName = x.CategoryName,
                    Description = x.Description,
                    IsActive = x.IsActive,
                    CreatedAt = x.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<DonationCategoryDto> GetByIdAsync(int id)
        {
            var entity = await _context.DonationCategories.FindAsync(id);
            if (entity == null)
                throw new KeyNotFoundException($"Donation category with ID {id} not found.");

            return ToDto(entity);
        }

        public async Task<DonationCategoryDto> CreateAsync(CreateDonationCategoryDto dto)
        {
            var entity = new DonationCategory
            {
                CategoryName = dto.CategoryName,
                Description = dto.Description,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.DonationCategories.Add(entity);
            await _context.SaveChangesAsync();

            return ToDto(entity);
        }

        public async Task<DonationCategoryDto> UpdateAsync(int id, UpdateDonationCategoryDto dto)
        {
            var entity = await _context.DonationCategories.FindAsync(id);
            if (entity == null)
                throw new KeyNotFoundException($"Donation category with ID {id} not found.");

            entity.CategoryName = dto.CategoryName;
            entity.Description = dto.Description;
            entity.IsActive = dto.IsActive;

            await _context.SaveChangesAsync();
            return ToDto(entity);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _context.DonationCategories.FindAsync(id);
            if (entity == null)
                throw new KeyNotFoundException($"Donation category with ID {id} not found.");

            _context.DonationCategories.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        private static DonationCategoryDto ToDto(DonationCategory entity) => new()
        {
            Id = entity.CategoryId,
            CategoryName = entity.CategoryName,
            Description = entity.Description,
            IsActive = entity.IsActive,
            CreatedAt = entity.CreatedAt
        };
    }
}