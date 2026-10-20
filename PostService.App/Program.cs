using PostService.DataAccess;
using PostService.Models;
using System.Reflection;
using System.Windows.Forms;
namespace PostService.App
{
    internal static class Program
    {
        [STAThread]
        static void Main()
        {
            AppDomain.CurrentDomain.UnhandledException += UnhandledExceptionEventHandler;
            var repository = new GenericRepository<ContactPerson>();
            var person = new ContactPerson
            {
                Id = 1,
                Name = "Науменко Алла",
                PhoneNumber = "+380980034709",
                Email = "stoianovaallaua@gmail.com"
            };
            repository.Add(person);

            var savedPerson = repository.GetById(1);

            if (savedPerson != null)
            {
                savedPerson.Name = "Стоянова Алла";
                repository.Update(savedPerson);
            }
            var allPersons = repository.GetAll();
            repository.Delete(1);

            ApplicationConfiguration.Initialize();
            Application.Run(new PostingList());
        }
        public static void UnhandledExceptionEventHandler(object sender, UnhandledExceptionEventArgs e)
        {
            Exception ex = e.ExceptionObject as Exception;
            if (ex is TargetInvocationException && ex.InnerException != null)
                ex = ex.InnerException;
            File.AppendAllText("errors.log", $"{DateTime.Now}: {ex}{Environment.NewLine}");

            MessageBox.Show(
                "Сталась непередбачена помилка. Подробиці збережено в журналі.",
                "Помилка",
                MessageBoxButtons.OK,
                MessageBoxIcon.Error);
        }
    }
}
