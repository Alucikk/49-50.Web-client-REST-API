using PostService.BusinessLogic;
using PostService.DataAccess;
using PostService.Dtos;
using PostService.Mappings;
using PostService.Models;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});
builder.Services.AddScoped<IPostingRepository, PostingRepository>();
builder.Services.AddScoped<IPostingService, PostingService>();
builder.Services.AddScoped<IRepository<ContactPerson>, GenericRepository<ContactPerson>>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();
using (var scope = app.Services.CreateScope())
{
    var repository = scope.ServiceProvider.GetRequiredService<IPostingRepository>();
    repository.CreateDb();
}
app.UseCors();

app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "PostService API v1");
    options.RoutePrefix = string.Empty; 
});

app.MapGet("/postings", (IPostingService postingService) =>
{
    var postings = postingService.GetAll();
    var dtos = postings.Select(p => PostingMapper.ToPostingGetDto(p));
    return Results.Ok(dtos);
})
.WithSummary("��������� ������� ������ ����������")
.Produces<IEnumerable<PostingGetDto>>(StatusCodes.Status200OK);

app.MapGet("/postings/{id}", (int id, IPostingService postingService) =>
{
    //throw new Exception("Штучна помилка сервера");
    var posting = postingService.Find(id);
    if (posting == null)
    {
        return Results.NotFound();
    }

    return Results.Ok(PostingMapper.ToPostingGetDto(posting));
})
.WithSummary("��������� ����������� �� ���� ID") 
.Produces<PostingGetDto>(StatusCodes.Status200OK)
.Produces(StatusCodes.Status404NotFound);

app.MapPost("/postings", (PostingPostDto postDto, IPostingService postingService) =>
{
    Posting newPosting = PostingMapper.ToPosting(postDto);
    Posting savedPosting = postingService.Create(newPosting);
    PostingGetDto resultDto = PostingMapper.ToPostingGetDto(savedPosting);

    return Results.Created($"/postings/{resultDto.Id}", resultDto);
})
.WithSummary("��������� ������ ��������� �����������") 
.Produces<PostingGetDto>(StatusCodes.Status201Created)
.Produces(StatusCodes.Status400BadRequest);

app.MapPut("/postings/{id}", (int id, PostingPutDto putDto, IPostingService postingService) =>
{
    if (id != putDto.Id)
    {
        return Results.BadRequest();
    }

    Posting postingToUpdate = PostingMapper.ToPosting(putDto);
    Posting? updatedPosting = postingService.Update(postingToUpdate);

    if (updatedPosting == null)
    {
        return Results.NotFound();
    }

    return Results.Ok(PostingMapper.ToPostingGetDto(updatedPosting));
})
.WithSummary("����������� �������� �����������") 
.Produces<PostingGetDto>(StatusCodes.Status200OK)
.Produces(StatusCodes.Status400BadRequest)
.Produces(StatusCodes.Status404NotFound);

app.MapDelete("/postings/{id}", (int id, IPostingService postingService) =>
{
    int deletedCount = postingService.Delete(id);
    if (deletedCount == 0)
    {
        return Results.NotFound();
    }

    return Results.NoContent();
})
.WithSummary("��������� ��������� ����������� �� ID") 
.Produces(StatusCodes.Status204NoContent)
.Produces(StatusCodes.Status404NotFound);

app.MapGet("/contacts", (IRepository<ContactPerson> contactRepo) =>
{
    var contacts = contactRepo.GetAll();
    return Results.Ok(contacts);
})
.WithSummary("��������� ������ ��������") 
.Produces<IEnumerable<ContactPerson>>(StatusCodes.Status200OK);

app.MapPost("/contacts", (ContactPerson person, IRepository<ContactPerson> contactRepo) =>
{
    contactRepo.Add(person);
    return Results.Created($"/contacts/{person.Id}", person);
})
.WithSummary("��������� ���� ��������� �����")
.Produces<ContactPerson>(StatusCodes.Status201Created);

app.Run();