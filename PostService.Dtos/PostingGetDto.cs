using PostService.CommonTypes;
using System.Text.Json.Serialization;

namespace PostService.Dtos;

///<summary>
///Модель даних для отримання інформації про поштове відправлення
///</summary>
public class PostingGetDto
{
    ///<summary>
    ///унікальний ід відправлення
    ///</summary>
    [JsonPropertyName("id")]
    public int Id { get; set; }
    ///<summary>
    ///Пункт відправлення, звідки відправляємо
    ///</summary>
    public string? From { get; set; }
    ///<summary>
    ///Пункт призначення, куди відправляємо
    ///</summary>
    public string? To { get; set; }
    ///<summary>
    ///Опис вмісту
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
    ///Ціна за доставку
    ///</summary>
    public float Price { get; set; }
    ///<summary>
    ///Примітка
    ///</summary>
    public string? Description { get; set; }
    ///<summary>
    ///Дата й часс створення запису
    ///</summary>
    public DateTime CreatedAt { get; set; }
}