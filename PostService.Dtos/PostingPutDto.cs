using PostService.CommonTypes;

namespace PostService.Dtos;
///<summary>
///Модель для редагування наявного поштового відправлення
///</summary>
public class PostingPutDto
{
    ///<summary>
    ///Унікальний ід відправлення
    ///</summary>
    public int Id { get; set; }
    ///<summary>
    ///Пункт відправлення, звідки відправляємо
    ///</summary>
    public string? From { get; set; }
    ///<summary>
    ///Пункт відправлення, куди відправляємо
    ///</summary>
    public string? To { get; set; }
    ///<summary>
    ///Опис вмісту відправлення
    ///</summary>
    public string? Content { get; set; }
    ///<summary>
    ///Тип доставки
    ///</summary>
    public DeliveryType DeliveryType { get; set; }
    ///<summary>
    ///Вага відправлення
    ///</summary>
    public float Weight { get; set; }
    ///<summary>
    ///Ширина відправлення
    ///</summary>
    public float Width { get; set; }
    ///<summary>
    ///Висота відправлення
    ///</summary>
    public float Height { get; set; }
    ///<summary>
    ///Глибина відправлення
    ///</summary>
    public float Depth { get; set; }
    ///<summary>
    ///Оголошена вартість відправлення
    ///</summary>
    public float? Value { get; set; }
    ///<summary>
    ///Примітка
    ///</summary>
    public string? Description { get; set; }
}