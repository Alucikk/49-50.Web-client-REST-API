using System;
using System.Collections.Generic;
namespace PostService.App
{
    internal class ValidationErrorResponse
    {
        public Dictionary<string, string[]> Errors { get; set; }
    }
    public class PostingValidationException : Exception
    {
        public Dictionary<string, string[]> Errors { get; }
        public PostingValidationException(Dictionary<string, string[]> errors)
            : base("Сервер відхилив дані відправлення.")
        {
            Errors = errors;
        }
    }
}