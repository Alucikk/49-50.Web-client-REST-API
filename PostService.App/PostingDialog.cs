using System;
using System.Net.Http;
using System.Net;
using System.Net.Http.Json;
using System.Windows.Forms;
using PostService.CommonTypes;
using PostService.Dtos;

namespace PostService.App
{
    public partial class PostingDialog : Form
    {
        private readonly IPostServiceClient _postService;
        private readonly int? _id;
        internal PostingDialog(IPostServiceClient postService)
        {
            InitializeComponent();
            btnSave.Click += btnSave_Click;
            _postService = postService; 
            _id = null;
            this.Text = "Створити посилку";
            lblDlgTt.Text = "Нове відправлення";
            cmbDl.DataSource = Enum.GetValues(typeof(DeliveryType));
        }
        internal PostingDialog(IPostServiceClient postService, int id) : this(postService)
        {
            _id = id;
            this.Text = "Редагувати посилку";
            lblDlgTt.Text = "Редагування відправлення";
            LoadPostingData(id);
        }
        internal PostingDialog(IPostServiceClient postService, int id, bool isReadOnly) : this(postService, id)
        {
            if (isReadOnly)
            {
                this.Text = "Деталі посилки";
                lblDlgTt.Text = "Деталі відправлення";

                foreach (Control ctrl in this.Controls)
                {
                    if (ctrl is TextBox or ComboBox)
                    {
                        ctrl.Enabled = false;
                    }
                }
                if (btnSave != null) btnSave.Visible = false;
            }
        }
        private async void LoadPostingData(int id)
        {
            try
            {
                var p = await _postService.GetPostingByIdAsync(id);
                if (p != null)
                {
                    txtSnd.Text = p.From;
                    txtRc.Text = p.To;
                    txtCn.Text = p.Content;
                    cmbDl.SelectedItem = p.DeliveryType;
                    txtWgh.Text = p.Weight.ToString();
                    txtCs.Text = p.Value?.ToString() ?? "";

                    txtWd.Text = p.Width.ToString();
                    txtHgh.Text = p.Height.ToString();
                    txtDp.Text = p.Depth.ToString();
                }
            }
            catch (HttpRequestException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
            {
                MessageBox.Show("Вибраного відправлення більше немає на сервері.", 
                    "Помилка", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                this.DialogResult = DialogResult.Cancel;
                this.Close();
            }
            catch (HttpRequestException ex) when (ex.StatusCode == null)
            {
                var result = MessageBox.Show(
                    "Сервер недоступний. Бажаєте повторити спробу?",
                    "Помилка мережі",
                    MessageBoxButtons.RetryCancel,
                    MessageBoxIcon.Warning);

                if (result == DialogResult.Retry)
                {
                    LoadPostingData(id);
                }
                else
                {
                    this.Close();
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show(this, $"Помилка завантаження даних: {ex.Message}");
            }
        }
        private async void btnSave_Click(object sender, EventArgs e)
        {
            var requiredFields = new[] { txtSnd, txtRc, txtCn, txtWgh, txtWd, txtHgh, txtDp };

            if (!Validate(requiredFields, txtWgh, txtWd, txtHgh, txtDp)) return;

            float w = float.TryParse(txtWgh.Text, out var parsedW) ? parsedW : 0f;
            float? val = float.TryParse(txtCs.Text, out var parsedV) ? parsedV : null;
            float width = float.TryParse(txtWd.Text, out var parsedWd) ? parsedWd : 0f;
            float h = float.TryParse(txtHgh.Text, out var parsedH) ? parsedH : 0f;
            float d = float.TryParse(txtDp.Text, out var parsedD) ? parsedD : 0f;
            float dlVl = float.TryParse(txtDlVl.Text, out var parsedDlVl) ? parsedDlVl : 0f;

            var dt = cmbDl.SelectedItem is DeliveryType dType ? dType : DeliveryType.Department;

            bool success = false;

            try
            {
                if (_id == null)
                {
                    success = await SendPostRequest(dt, w, val, width, h, d);
                }
                else
                {
                    success = await SendPutRequest(dt, w, val, width, h, d);
                }

                if (success)
                {
                    this.DialogResult = DialogResult.OK;
                    this.Close();
                }
            }
            catch (PostingValidationException ex)
            {
                var messages = new List<string>();
                foreach (var field in ex.Errors)
                {
                    messages.AddRange(field.Value);
                }
                MessageBox.Show(this, string.Join(Environment.NewLine, messages), 
                "Помилки валідації", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            }
            catch (HttpRequestException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
            {
                MessageBox.Show(this, "Цей запис уже був видалений.", 
                "Помилка", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                this.DialogResult = DialogResult.Cancel;
                this.Close();
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
                    btnSave_Click(sender, e);
                }
            }
        }
        private async Task<bool> SendPostRequest(DeliveryType dt, float w, float? val, float width, float h, float d)
        {
            var dto = new PostingPostDto();
            dto.From = txtSnd.Text;
            dto.To = txtRc.Text;
            dto.Content = txtCn.Text;
            dto.DeliveryType = dt;
            dto.Weight = w;
            dto.Value = val;
            dto.Width = width;
            dto.Height = h;
            dto.Depth = d;

            await _postService.CreatePostingAsync(dto);

            return true;
        }
        private async Task<bool> SendPutRequest(DeliveryType dt, float w, float? val, float width, float h, float d)
        {
            var dto = new PostingPutDto();
            dto.Id = _id.Value;
            dto.From = txtSnd.Text;
            dto.To = txtRc.Text;
            dto.Content = txtCn.Text;
            dto.DeliveryType = dt;
            dto.Weight = w;
            dto.Value = val;
            dto.Width = width;
            dto.Height = h;
            dto.Depth = d;

            await _postService.UpdatePostingAsync(_id.Value, dto);

            return true;
        }
        public static bool Validate(Control[] fields, TextBox txtWgh = null, TextBox txtWd = null, TextBox txtHgh = null, TextBox txtDp = null)
        {
            if (fields.Any(f => string.IsNullOrWhiteSpace(f.Text)))
            {
                MessageBox.Show("Заповніть усі обов'язкові поля, крім оголошеної вартості!", 
                "Помилка валідації", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return false;
            }
            if (txtWgh != null && float.TryParse(txtWgh.Text, out float w) && w <= 0)
            {
                MessageBox.Show("Значення ваги має бути більшим за 0!", "Помилка валідації", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return false;
            }
            if (txtWd != null && float.TryParse(txtWd.Text, out float wd) && wd <= 0)
            {
                MessageBox.Show("Значення ширини має бути більшим за 0!", 
                "Помилка валідації", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return false;
            }
            if (txtHgh != null && float.TryParse(txtHgh.Text, out float h) && h <= 0)
            {
                MessageBox.Show("Значення висоти має бути більшим за 0!", 
                "Помилка валідації", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return false;
            }
            if (txtDp != null && float.TryParse(txtDp.Text, out float d) && d <= 0)
            {
                MessageBox.Show("Значення глибини має бути більшим за 0!", 
                "Помилка валідації", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return false;
            }

            return true;
        }
    }
}