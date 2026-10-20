// Завантаження карток або використання дефолтних
let shipments = JSON.parse(localStorage.getItem('post_shipments'));
if (!shipments || shipments.length === 0) {
  shipments = [
    {
      id: 1,
      sender: "Олександр Коваленко",
      receiver: "Марія Петренко",
      content: "Електроніка (ноутбук)",
      deliveryType: "Стандарт",
      weight: "2.5 кг",
      dimensions: "35x25x5 см",
      declaredValue: "150 грн",
      deliveryCost: "55.00 грн",
      status: "У ДОРОЗІ"
    },
    {
      id: 2,
      sender: "ТОВ 'ТехноСвіт'",
      receiver: "Іван Сидоренко",
      content: "Документи",
      deliveryType: "Стандарт",
      weight: "0.3 кг",
      dimensions: "20x15x2 см",
      declaredValue: "60 грн",
      deliveryCost: "33.00 грн",
      status: "У ДОРОЗІ"
    },
    {
      id: 3,
      sender: "Олена Гнатюк",
      receiver: "Дмитро Мельник",
      content: "Одяг та взуття",
      deliveryType: "Стандарт",
      weight: "5.0 кг",
      dimensions: "40x30x20 см",
      declaredValue: "120 грн",
      deliveryCost: "80.00 грн",
      status: "У ДОРОЗІ"
    }
  ];
  saveToLocalStorage();
}

function saveToLocalStorage() {
  localStorage.setItem('post_shipments', JSON.stringify(shipments));
}