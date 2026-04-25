namespace ClubManagement.Domain.Models
{
    public class PaymentMethod
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Description { get; set; } = null!;
        public bool IsActive { get; set; } = true;
    }
}