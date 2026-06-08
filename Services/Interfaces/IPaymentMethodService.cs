using ClubManagement.Domain.DTOs;

namespace ClubManagement.Services.Interfaces
{
    public interface IPaymentMethodService
    {
        Task<List<PaymentMethodDto>> GetAllPaymentMethodsAsync();
        Task<PaymentMethodDto> GetPaymentMethodByIdAsync(int id);
        Task<PaymentMethodDto> CreatePaymentMethodAsync(CreatePaymentMethodDto paymentMethod);
        Task<PaymentMethodDto> UpdatePaymentMethodAsync(int id, UpdatePaymentMethodDto paymentMethod);
        Task<bool> DeletePaymentMethodAsync(int id);
    }
}