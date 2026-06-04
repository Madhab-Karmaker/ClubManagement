using Microsoft.EntityFrameworkCore;
using ClubManagement.Application.Interfaces;
using ClubManagement.Domain.Models;
using ClubManagement.Domain.DTOs;
using ClubManagement.Infrastructure.Data;

namespace ClubManagement.Infrastructure.Services
{
    public class PaymentMethodService : IPaymentMethodService
    {
        private readonly AppDbContext _context;

        public PaymentMethodService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<PaymentMethodDto>> GetAllPaymentMethodsAsync()
        {
            return await _context.PaymentMethodLookups
                .OrderBy(x => x.MethodName)
                .Select(x => ToDto(x))
                .ToListAsync();
        }

        public async Task<PaymentMethodDto> GetPaymentMethodByIdAsync(int id)
        {
            var paymentMethod = await _context.PaymentMethodLookups.FindAsync(id);
            if (paymentMethod == null)
                throw new KeyNotFoundException($"Payment method with ID {id} not found.");
            return ToDto(paymentMethod);
        }

        public async Task<PaymentMethodDto> CreatePaymentMethodAsync(CreatePaymentMethodDto paymentMethod)
        {
            if (await _context.PaymentMethodLookups.AnyAsync(p => p.MethodName.ToLower() == paymentMethod.Name.ToLower()))
            {
                throw new InvalidOperationException($"A payment method named '{paymentMethod.Name}' already exists.");
            }

            var entity = new PaymentMethodLookup
            {
                MethodName = paymentMethod.Name,
                Description = paymentMethod.Description,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.PaymentMethodLookups.Add(entity);
            await _context.SaveChangesAsync();
            return ToDto(entity);
        }

        public async Task<PaymentMethodDto> UpdatePaymentMethodAsync(int id, UpdatePaymentMethodDto paymentMethod)
        {
            var existingPaymentMethod = await _context.PaymentMethodLookups.FindAsync(id);
            if (existingPaymentMethod == null)
                throw new KeyNotFoundException($"Payment method with ID {id} not found.");

            existingPaymentMethod.MethodName = paymentMethod.Name;
            existingPaymentMethod.Description = paymentMethod.Description;
            existingPaymentMethod.IsActive = paymentMethod.IsActive;

            _context.PaymentMethodLookups.Update(existingPaymentMethod);
            await _context.SaveChangesAsync();
            return ToDto(existingPaymentMethod);
        }

        public async Task<bool> DeletePaymentMethodAsync(int id)
        {
            var paymentMethod = await _context.PaymentMethodLookups.FindAsync(id);
            if (paymentMethod == null)
                throw new KeyNotFoundException($"Payment method with ID {id} not found.");

            _context.PaymentMethodLookups.Remove(paymentMethod);
            await _context.SaveChangesAsync();
            return true;
        }

        private static PaymentMethodDto ToDto(PaymentMethodLookup entity)
        {
            return new PaymentMethodDto
            {
                Id = entity.PaymentMethodId,
                Name = entity.MethodName,
                Description = entity.Description,
                IsActive = entity.IsActive,
                CreatedAt = entity.CreatedAt
            };
        }
    }
} 