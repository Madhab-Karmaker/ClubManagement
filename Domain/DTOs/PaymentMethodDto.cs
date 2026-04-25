using ClubManagement.Domain.Models;

namespace ClubManagement.Domain.DTOs
{
    public class PaymentMethodDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<Donation> Donations { get; set; }
            = new List<Donation>();
    }


    public class CreatePaymentMethodDto
    {
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
    }

    public class UpdatePaymentMethodDto
    {
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public bool IsActive { get; set; }
    }

}
