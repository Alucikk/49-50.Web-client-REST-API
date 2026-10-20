using PostService.Dtos;
using PostService.Models;
using System.Net;
using System.Net.Http.Json;
using System.Windows.Forms;

namespace PostService.App
{
    public partial class PostingList : Form
    {
        private readonly IPostServiceClient _postService = new PostServiceClient();
        public PostingList()
        {
            InitializeComponent();
            gridPostings.AutoGenerateColumns = false;
        }
        private async Task LoadPostingsAsync()
        {
            try
            {
                var postings = await _postService.GetPostingsAsync();
                gridPostings.DataSource = postings;
                lblTtlСnt.Text = $"Всього записів: {postings?.Length ?? 0}";
            }
            catch (HttpRequestException ex) when (ex.StatusCode == null)
            {
                var result = MessageBox.Show(
                    this,
                    "Сервер недоступний. Бажаєте повторити спробу?",
                    "Помилка мережі",
                    MessageBoxButtons.RetryCancel,
                    MessageBoxIcon.Warning);

                if (result == DialogResult.Retry)
                {
                    await LoadPostingsAsync();
                }
            }
        }
        private async void PostingList_Load(object? sender, EventArgs e)
        {
            await LoadPostingsAsync();
        }
        private async void btnRefres_Click(object? sender, EventArgs e)
        {
            await LoadPostingsAsync();
        }
        private async void btnDelete_Click(object? sender, EventArgs e)
        {
            if (gridPostings.CurrentRow?.DataBoundItem is not PostingGetDto selectedPosting)
            {
                MessageBox.Show(this, "Виберіть рядок.");
                return;
            }

            var confirmResult = MessageBox.Show(
                this,
                "Ви точно хочете видалити запис? Дані буде неможливо відновити.",
                "Підтвердження видалення",
                MessageBoxButtons.YesNo,
                MessageBoxIcon.Warning);

            if (confirmResult != DialogResult.Yes) return;

            try
            {
                await _postService.DeletePostingAsync(selectedPosting.Id);
                await LoadPostingsAsync();
            }
            catch (HttpRequestException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
            {
                MessageBox.Show(this, "Вибраного відправлення вже немає. Список буде оновлено.");
                await LoadPostingsAsync();
            }
            catch (HttpRequestException ex) when (ex.StatusCode == null)
            {
                var result = MessageBox.Show(
                    this,
                    "Сервер недоступний. Бажаєте повторити спробу?",
                    "Помилка мережі",
                    MessageBoxButtons.RetryCancel,
                    MessageBoxIcon.Warning);

                if (result == DialogResult.Retry)
                {
                    try
                    {
                        await _postService.DeletePostingAsync(selectedPosting.Id);
                        await LoadPostingsAsync();
                    }
                    catch
                    {
                        MessageBox.Show(this, "Повторна спроба не вдалася.");
                    }
                }
            }
        }
              
        private async void btnCreate_Click(object sender, EventArgs e)
        {
            using (var dlg = new PostingDialog(_postService))
            {
                if (dlg.ShowDialog() == DialogResult.OK)
                {
                    await Task.Delay(100);
                    await LoadPostingsAsync();
                }
            }
        }
        private async void btnEdit_Click(object sender, EventArgs e)
        {
            if (gridPostings.CurrentRow?.DataBoundItem is not PostingGetDto selectedPosting)
            {
                MessageBox.Show(this, "Виберіть відправлення для редагування.", "Увага", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }
            using (var dlg = new PostingDialog(_postService, selectedPosting.Id))
            {
                if (dlg.ShowDialog() == DialogResult.OK)
                {
                    await Task.Delay(100);
                    await LoadPostingsAsync();
                }
            }
        }
        private void btnDetails_Click(object sender, EventArgs e)
        {
            if (gridPostings.CurrentRow?.DataBoundItem is not PostingGetDto selectedPosting)
            {
                MessageBox.Show(this,"Виберіть відправлення, щоб  переглянути деталі.");
                return;
            }
            using var dlg = new PostingDialog(_postService, selectedPosting.Id, isReadOnly: true);
            dlg.ShowDialog();
        }
    }
}
