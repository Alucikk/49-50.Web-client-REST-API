using System.Threading.Tasks;
using PostService.Dtos; 

namespace PostService.App
{
    internal interface IPostServiceClient
    {
        // GET /postings
        Task<PostingGetDto[]> GetPostingsAsync();

        // GET /postings/{id}
        Task<PostingGetDto> GetPostingByIdAsync(int id);

        // POST /postings
        Task<PostingGetDto> CreatePostingAsync(PostingPostDto posting);

        // PUT /postings/{id}
        Task<PostingGetDto> UpdatePostingAsync(int id, PostingPutDto posting);

        // DELETE /postings/{id}
        Task DeletePostingAsync(int id);
    }
}