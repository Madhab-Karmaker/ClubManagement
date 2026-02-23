namespace ClubManagement.Domain.Models
{
    public class Role
    {
        public int RoleId { get; set; }
        public string Name { get; set; } = null!;
        // Navigation property for related users
        public ICollection<User> Users { get; set; } = new List<User>();
    }
}   