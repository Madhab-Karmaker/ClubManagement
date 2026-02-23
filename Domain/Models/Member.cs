    namespace ClubManagement.Domain.Models
    {
        public class Member
        {
            public int MemberId { get; set; }
            public string FirstName { get; set; } = null!;
            public string LastName { get; set; } = null!;
            public string Email { get; set; } = null!;
            public string PhoneNumber { get; set; } = null!;
            //public string MembershipType { get; set; } = null!;
            public DateTime JoinDate { get; set; }
            public DateTime ExpiryDate { get; set; }

            // Optional link to User account
            public int? UserId { get; set; }
            public User? User { get; set; }
        }
    }

