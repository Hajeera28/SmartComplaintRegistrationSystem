using SmartComplaint.Models;

namespace SmartComplaint.Interfaces
{
    public interface IToken
    {
        string GenerateToken(User user);
    }
}