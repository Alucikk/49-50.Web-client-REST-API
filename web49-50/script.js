let currentMode = 'create';
let editingId = null;

const postServiceClient = new PostServiceClient('http://localhost:5000');
// Розрахунок вартості відправлення залежно від ваги і типу доставки
function calculatePostingPrice(weightStr, deliveryType) {
  let baseRate = 30.0;
  if (deliveryType === 'ExpressCourier' || 
     (deliveryType && (deliveryType.includes('експрес') || 
      deliveryType.includes('Кур\'єр')))) {
    baseRate = 60.0;
  }
  const weightNum = parseFloat(weightStr) || 0;
  return baseRate + (weightNum * 10.0);
}
// Конвертація числових кодів доставки у зрозумілі для оператора назви
function getReadableDeliveryType(rawType) {
  if (rawType === 0 || rawType === 'Department' || rawType === '0') {
    return 'У відділення';
  }
  if (rawType === 1 || rawType === 'Courier' || rawType === '1') {
    return 'Кур\'єр';
  }
  if (rawType === 2 || rawType === 'ExpressCourier' || rawType === '2') {
    return 'Експрес-кур\'єр';
  }
  if (rawType === 'Standard' || rawType === 'Стандарт') {
    return 'Стандарт';
  }
  return rawType || 'У відділення';
}
// Завантаження даних миттєво з локальних + фонова синхронізація з сервером
function loadData() {
  const path = window.location.pathname;

  if (path.includes("list.html")) {
    renderShipmentsList();
  }

  if (path.includes("edit.html")) {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    const mode = urlParams.get("mode");

    if (id) {
      if (mode === "edit") {
        openShipmentForm('edit', id);
      } else {
        openDetails(id);
      }
    } else {
      openShipmentForm('create');
    }
  }
  // Синхронізуємося з сервером у фоні, не гальмуючи інтерфейс
  syncWithServerBackground();
}
// Фонова синхронізація списку з сервером через клієнт
async function syncWithServerBackground() {
  try {
    const data = await postServiceClient.getPostings();
    if (data && data.length > 0) {
      shipments = data.map((item, index) => {
        const wStr = item.weight ? item.weight.toString() : '2.5';
        const dType = getReadableDeliveryType(item.deliveryType);
        const calculatedPrice = item.price !== undefined ? 
        item.price : calculatePostingPrice(wStr, dType);

        return {
          id: item.id || index + 1,
          sender: item.from || item.sender || 'Не вказано',
          receiver: item.to || item.receiver || 'Не вказано',
          content: item.content || 'Без вмісту',
          deliveryType: dType,
          weight: (item.weight ? item.weight + ' кг' : '0 кг'),
          dimensions: `${item.width || 0}x${item.height || 0}x${item.depth || 0} см`,
          declaredValue: (item.value ? item.value + ' грн' : '0 грн'),
          deliveryCost: calculatedPrice.toFixed(2) + ' грн',
          status: "У ДОРОЗІ"
        };
      });
    } else {
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
    }
    saveToLocalStorage();
    
    if (window.location.pathname.includes("list.html")) {
      renderShipmentsList();
    }
  } catch (error) {
    console.log('Сервер недоступний у фоні:', error);
  }
}
// Керування відображенням активних екранів інтерфейсу
function showScreen(screenId) {
  const screens = document.querySelectorAll('.screen');
  screens.forEach(screen => {
    screen.style.display = 'none';
  });
  const target = document.getElementById(screenId);
  if (target) {
    target.style.display = 'flex';
  }
}
// Відкриття форми створення або редагування відправлення
function openShipmentForm(mode, id = null) {
  currentMode = mode;
  editingId = id;
  
  const titleElement = document.querySelector('#create-screen .sub-header-title');
  const senderInput = document.getElementById('form-sender');
  const receiverInput = document.getElementById('form-receiver');
  const contentInput = document.getElementById('form-content');
  const deliveryInput = document.getElementById('form-delivery');
  const weightInput = document.getElementById('form-weight');
  const dimensionsInput = document.getElementById('form-dimensions');
  const valueInput = document.getElementById('form-value');

  resetValidationUI();

  if (mode === 'create') {
    if (titleElement) titleElement.textContent = 'Нове відправлення';
    if (senderInput) senderInput.value = '';
    if (receiverInput) receiverInput.value = '';
    if (contentInput) contentInput.value = '';
    if (deliveryInput) deliveryInput.value = '';
    if (weightInput) weightInput.value = '';
    if (dimensionsInput) dimensionsInput.value = '';
    if (valueInput) valueInput.value = '';
  } else if (mode === 'edit') {
    if (titleElement) titleElement.textContent = 'Редагування відправлення';
    
    const data = shipments.find(s => String(s.id) === String(id)) || {};

    if (senderInput) senderInput.value = data.sender || '';
    if (receiverInput) receiverInput.value = data.receiver || '';
    if (contentInput) contentInput.value = data.content || '';
    if (deliveryInput) deliveryInput.value = data.deliveryType || '';
    
    if (weightInput) {
      const wNum = parseFloat(data.weight);
      weightInput.value = !isNaN(wNum) ? wNum : '';
    }
    if (dimensionsInput) dimensionsInput.value = data.dimensions || '';
    if (valueInput) {
      const vNum = parseFloat(data.declaredValue);
      valueInput.value = !isNaN(vNum) ? vNum : '';
    }
  }

  showScreen('create-screen');
}
// Миттєве збереження відправлення з фоновою відправкою через веб-клієнт на сервер
function saveShipment() {
  if (!validateFormLive(true)) {
    return; 
  }
  const sender = document.getElementById('form-sender').value;
  const receiver = document.getElementById('form-receiver').value;
  const content = document.getElementById('form-content').value;
  const deliveryType = document.getElementById('form-delivery').value;
  
  const rawWeightNum = parseFloat(document.getElementById('form-weight').value) || 0;
  const weight = rawWeightNum.toFixed(1) + ' кг';

  const rawValueNum = parseFloat(document.getElementById('form-value').value) || 0;
  const declaredValue = rawValueNum.toFixed(2) + ' грн';

  const dimensions = document.getElementById('form-dimensions').value;
  const dimParts = dimensions.split('*').map(p => parseFloat(p.trim()) || 0);

  const calculatedPrice = calculatePostingPrice(rawWeightNum, deliveryType);
  const deliveryCost = calculatedPrice.toFixed(2) + ' грн';

  if (currentMode === 'create') {
    const newShipment = {
      id: Date.now(),
      sender,
      receiver,
      content,
      deliveryType,
      weight,
      dimensions,
      declaredValue,
      deliveryCost,
      status: "У ДОРОЗІ"
    };
    shipments.push(newShipment);
  } else if (currentMode === 'edit') {
    const index = shipments.findIndex(s => String(s.id) === String(editingId));
    if (index !== -1) {
      shipments[index] = {
        ...shipments[index],
        sender,
        receiver,
        content,
        deliveryType,
        weight,
        dimensions,
        declaredValue,
        deliveryCost
      };
    }
  }

  saveToLocalStorage();

  const postingData = {
    from: sender,
    to: receiver,
    content: content,
    deliveryType: deliveryType,
    weight: rawWeightNum,
    width: dimParts[0] || 0,
    height: dimParts[1] || 0,
    depth: dimParts[2] || 0,
    value: rawValueNum,
    price: calculatedPrice
  };

  if (currentMode === 'create') {
    postServiceClient.createPosting(postingData).catch(err =>
    console.log('Фонова помилка створення:', err));
  } else if (currentMode === 'edit') {
    postServiceClient.updatePosting(editingId, postingData).catch(err => 
    console.log('Фонова помилка оновлення:', err));
  }
  window.location.href = 'list.html';
}
// Скасування заповнення форми та повернення до списку
function cancelForm() {
  window.location.href = 'list.html';
}
// Відкриття екрана детальної інформації про відправлення
function openDetails(id) {
  const item = shipments.find(s => String(s.id) === String(id));
  if (!item) return;
  
  editingId = id; 

  const detailSender = document.getElementById('detail-sender');
  const detailReceiver = document.getElementById('detail-receiver');
  const detailContent = document.getElementById('detail-content');
  const detailDelivery = document.getElementById('detail-delivery');
  const detailWeight = document.getElementById('detail-weight');
  const detailDimensions = document.getElementById('detail-dimensions');
  const detailValue = document.getElementById('detail-value');
  const detailCost = document.getElementById('detail-cost');

  if (detailSender) detailSender.textContent = item.sender;
  if (detailReceiver) detailReceiver.textContent = item.receiver;
  if (detailContent) detailContent.textContent = item.content;
  if (detailDelivery) detailDelivery.textContent = item.deliveryType;
  if (detailWeight) detailWeight.textContent = item.weight;
  if (detailDimensions) detailDimensions.textContent = item.dimensions;
  if (detailValue) detailValue.textContent = item.declaredValue;
  if (detailCost) detailCost.textContent = item.deliveryCost || 
  calculatePostingPrice(item.weight, item.deliveryType).toFixed(2) + ' грн';

  showScreen('details-screen');
}
// Рендеринг списку відправлень
function renderShipmentsList() {
  const container = document.querySelector('#list-screen .scroll-content');
  if (!container) return;

  let html = '';
  shipments.forEach(item => {
    const displayCost = item.deliveryCost || 
    calculatePostingPrice(item.weight, item.deliveryType).toFixed(2) + ' грн';

    html += `
      <div class="card" onclick="window.location.href='edit.html?id=${item.id}'">
        <div class="card-row">
          <span class="card-party">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#004d33" 
            stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/></svg>
            ВІДПРАВНИК<br><b>${item.sender}</b>
          </span>
          <span class="card-party">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#004d33" 
            stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/></svg>
            ОТРИМУВАЧ<br><b>${item.receiver}</b>
          </span>
        </div>
        <div class="card-content-row">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#004d33" 
          stroke-width="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 
            8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
          <span>ВМІСТ<br><b>${item.content}</b></span>
        </div>
        <div class="card-footer-row">
          <span>ВАГА<br><b>${item.weight}</b></span>
          <span>ВАРТІСТЬ<br><b>${displayCost}</b></span>
          <span class="badge">${item.status}</span>
          <button class="btn-delete-icon" onclick="event.stopPropagation(); 
          openDeleteModal('${item.id}');" title="Видалити">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d32f2f" 
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 
            2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </div>
    `;
  });

  html += `
    <div style="display: flex; justify-content: flex-end; 
    margin-top: 10px; margin-bottom: 20px;">
      <button class="btn-create" 
      onclick="window.location.href='edit.html'">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" 
        stroke="currentColor" stroke-width="2.5" style="vertical-align: middle; 
        margin-right: 4px;">
          <line x1="12" y1="5" x2="12" y2="19">
          </line><line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        СТВОРИТИ
      </button>
    </div>
  `;
  container.innerHTML = html;
}
let deletingId = null;
// Відкриття модального вікна підтвердження видалення
function openDeleteModal(id) {
  deletingId = id;
  const modal = document.getElementById('delete-modal');
  if (modal) modal.style.display = 'flex';
}
// Закриття модального вікна видалення
function closeDeleteModal() {
  deletingId = null;
  const modal = document.getElementById('delete-modal');
  if (modal) modal.style.display = 'none';
}
// Миттєве закриття модалки, миттєве видалення з екрана + фоновий запит на сервер
function confirmDelete() {
  if (deletingId !== null) {
    const idToDelete = deletingId;
    //Миттєво закриваємо модальне вікно без затримок
    closeDeleteModal();

    //Негайно прибираємо картку з масиву і екрана, і для даних по дефолту і для серверних
    shipments = shipments.filter(s => String(s.id) !== String(idToDelete) 
    && Number(s.id) !== Number(idToDelete));
    saveToLocalStorage();
    renderShipmentsList();

    //Відправляємо запит на сервер у фоні
    postServiceClient.deletePosting(idToDelete).catch(err => {
      console.log('Фонова помилка видалення на сервері:', err);
    });
  }
}
// Встановлення статусу валідації для полів введення форми
function setFieldStatus(wrapperId, errorTextId, hasError, showErrors) {
  const wrapper = document.getElementById(wrapperId)?.closest('.input-wrapper');
  const errorText = document.getElementById(errorTextId);
  
  if (hasError && showErrors) {
    if (wrapper) wrapper.classList.add('input-error');
    if (errorText) errorText.classList.add('visible');
  } else {
    if (wrapper) wrapper.classList.remove('input-error');
    if (errorText) errorText.classList.remove('visible');
  }
}
//Валідність полів  в реальному часі з обмеженням ваги до 1000 кг
function validateFormLive(showErrors = false) {
  const senderVal = document.getElementById('form-sender')?.value.trim() || '';
  const receiverVal = document.getElementById('form-receiver')?.value.trim() || '';
  const contentVal = document.getElementById('form-content')?.value.trim() || '';
  const deliveryVal = document.getElementById('form-delivery')?.value.trim() || '';
  const weightVal = document.getElementById('form-weight')?.value.trim() || '';
  const dimensionsVal = document.getElementById('form-dimensions')?.value.trim() || '';
  const valueVal = document.getElementById('form-value')?.value.trim() || '';

  const weightNum = parseFloat(weightVal) || 0;

  const isSenderValid = senderVal.length >= 3;
  const isReceiverValid = receiverVal.length >= 3;
  const isContentValid = contentVal.length > 0;
  const isDeliveryValid = deliveryVal.length > 0;
  const isWeightValid = weightVal.length > 0 && weightNum > 0 && weightNum <= 1000;
  const isDimensionsValid = dimensionsVal.length > 0;
  const isValueValid = valueVal.length > 0;

  setFieldStatus('form-sender', 'form-sender-error', !isSenderValid, showErrors);
  setFieldStatus('form-receiver', 'form-receiver-error', !isReceiverValid, showErrors);
  setFieldStatus('form-content', 'form-content-error', !isContentValid, showErrors);
  setFieldStatus('form-delivery', 'form-delivery-error', !isDeliveryValid, showErrors);
  setFieldStatus('form-weight', 'form-weight-error', !isWeightValid, showErrors);
  setFieldStatus('form-dimensions', 'form-dimensions-error', !isDimensionsValid, showErrors);
  setFieldStatus('form-value', 'form-value-error', !isValueValid, showErrors);

  const allValid = isSenderValid && isReceiverValid && isContentValid 
  && isDeliveryValid && isWeightValid && isDimensionsValid && isValueValid;

  const statusBox = document.getElementById('formStatusBox');
  const statusDesc = document.getElementById('formStatusDesc');

  if (statusBox && statusDesc) {
    if (allValid) {
      statusBox.classList.remove('error');
      statusBox.classList.add('success');
      statusDesc.textContent = 'Готово до збереження';
    } else if (showErrors) {
      statusBox.classList.remove('success');
      statusBox.classList.add('error');
      if (!isWeightValid && weightNum > 1000) {
        statusDesc.textContent = 'Максимальна вага — до 1000 кг';
      } else {
        statusDesc.textContent = 'Виправте помилки у формі';
      }
    }
  }
  return allValid;
}
// Скидання інтерфейсу валідації до початкового стану
function resetValidationUI() {
  const inputs = ['form-sender', 'form-receiver', 'form-content', 
                  'form-delivery', 'form-weight', 'form-dimensions', 
                  'form-value', 'form-cost'];
  inputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.closest('.input-wrapper')?.classList.remove('input-error');
      const err = document.getElementById(id + '-error');
      if (err) err.classList.remove('visible');
    }
  });

  const statusBox = document.getElementById('formStatusBox');
  const statusDesc = document.getElementById('formStatusDesc');
  if (statusBox && statusDesc) {
    statusBox.classList.remove('error');
    statusBox.classList.add('success');
    statusDesc.textContent = 'Готово до збереження';
  }
}

// Ініціалізація подій, завантаження даних після повного завантаження DOM-дерева
document.addEventListener('DOMContentLoaded', () => {
  const formInputs = document.querySelectorAll('#create-screen .form-input');
  formInputs.forEach(input => {
    input.addEventListener('input', () => {
      validateFormLive(true);
    });
  });

  // Заборона введення літер у числові поля
  const numericInputs = document.querySelectorAll('#form-weight, #form-dimensions, #form-value');
  numericInputs.forEach(input => {
    input.addEventListener('keypress', (e) => {
      const allowedChars = /[0-9.,*]/;
      const key = e.key;
      if (!allowedChars.test(key) && e.key !== 'Backspace' && e.key 
          !== 'Delete' && e.key !== 'Tab' && !e.key.startsWith('Arrow')) 
      {
        e.preventDefault();
      }
    });
  });
  // Підказка або підстановка зірочок при фокусі на порожнє поле габаритів для зручності юзера
  const dimensionsInput = document.getElementById('form-dimensions');
  if (dimensionsInput) {
    dimensionsInput.addEventListener('focus', () => {
      if (!dimensionsInput.value) {
        dimensionsInput.value = '*x*x*';
        dimensionsInput.setSelectionRange(0, 0); // Ставимо курсор на початок для зручного введення
      }
    });
    dimensionsInput.addEventListener('blur', () => {
      if (dimensionsInput.value === '*x*x*') {
        dimensionsInput.value = '';
      }
    });
  }
  const detailEditBtn = document.querySelector('#details-screen .btn-save');
  if (detailEditBtn) {
    detailEditBtn.onclick = () => {
      if (editingId) {
        window.location.href = `edit.html?id=${editingId}&mode=edit`;
      }
    };
  }
  loadData();
});