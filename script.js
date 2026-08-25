// Объявляем все переменные
let totalVolumeInput, occupiedVolumeInput, participationFactorInput;
let heatSourceSelect, coldTempInput, heatingPeriodInput;
let initialDataSection, coefficientSection, resultSection, heatingLoadSection;
let calculateBtn, resultGcal;

// Данные для расчета жилых помещений
const coefficients = {
    "после 1999": { 1: 0.0468, 2: 0.0380, 3: 0.0345, 4: 0.0283, 5: 0.0283 },
    "до 1999": { 1: 0.0468, 2: 0.0380, 3: 0.0309, 4: 0.0309, 5: 0.0283 }
};

// Массив диапазонов для расчета q
const qRanges = [
    { min: 0, max: 500, minRange: 0.94, maxRange: 0.809 },
    { min: 500, max: 1000, minRange: 0.809, maxRange: 0.664 },
    { min: 1000, max: 2000, minRange: 0.664, maxRange: 0.545 },
    { min: 2000, max: 3000, minRange: 0.545, maxRange: 0.485 },
    { min: 3000, max: 4000, minRange: 0.485, maxRange: 0.447 },
    { min: 4000, max: 5000, minRange: 0.447, maxRange: 0.42 },
    { min: 5000, max: 6000, minRange: 0.42, maxRange: 0.398 },
    { min: 6000, max: 7000, minRange: 0.398, maxRange: 0.381 },
    { min: 7000, max: 8000, minRange: 0.381, maxRange: 0.369 },
    { min: 8000, max: 9000, minRange: 0.369, maxRange: 0.355 },
    { min: 9000, max: 10000, minRange: 0.355, maxRange: 0.344 },
    { min: 10000, max: 11000, minRange: 0.344, maxRange: 0.335 },
    { min: 11000, max: 12000, minRange: 0.335, maxRange: 0.327 },
    { min: 12000, max: 13000, minRange: 0.327, maxRange: 0.319 },
    { min: 13000, max: 14000, minRange: 0.319, maxRange: 0.312 },
    { min: 14000, max: 15000, minRange: 0.312, maxRange: 0.307 },
    { min: 15000, max: 16000, minRange: 0.307, maxRange: 0.301 },
    { min: 16000, max: 17000, minRange: 0.301, maxRange: 0.296 },
    { min: 17000, max: 18000, minRange: 0.296, maxRange: 0.291 },
    { min: 18000, max: 19000, minRange: 0.291, maxRange: 0.286 },
    { min: 19000, max: 20000, minRange: 0.286, maxRange: 0.282 },
    { min: 20000, max: 21000, minRange: 0.282, maxRange: 0.279 },
    { min: 21000, max: 22000, minRange: 0.279, maxRange: 0.275 },
    { min: 22000, max: 23000, minRange: 0.275, maxRange: 0.271 },
    { min: 23000, max: 24000, minRange: 0.271, maxRange: 0.268 },
    { min: 24000, max: 25000, minRange: 0.268, maxRange: 0.265 },
];

// Функция для автоматического расширения полей ввода
function setupAutoExpandInputs() {
    const inputs = document.querySelectorAll('.auto-expand-input');
    
    inputs.forEach(input => {
        // Функция для обновления размера
        function updateSize() {
            // Создаем временный элемент для измерения текста
            const temp = document.createElement('span');
            temp.style.position = 'absolute';
            temp.style.visibility = 'hidden';
            temp.style.whiteSpace = 'pre';
            temp.style.fontSize = window.getComputedStyle(input).fontSize;
            temp.style.fontFamily = window.getComputedStyle(input).fontFamily;
            temp.style.fontWeight = window.getComputedStyle(input).fontWeight;
            temp.style.padding = window.getComputedStyle(input).padding;
            temp.style.border = window.getComputedStyle(input).border;
            temp.textContent = input.value || input.placeholder || '';
            
            document.body.appendChild(temp);
            const width = temp.offsetWidth + 20; // Добавляем небольшой запас
            document.body.removeChild(temp);
            
            // Устанавливаем минимальную ширину
            const minWidth = 100;
            const newWidth = Math.max(minWidth, width);
            input.style.width = newWidth + 'px';
        }
        
        // Обновляем размер при вводе
        input.addEventListener('input', updateSize);
        
        // Обновляем размер при фокусе (на случай, если placeholder длиннее значения)
        input.addEventListener('focus', updateSize);
        
        // Инициализируем размер
        setTimeout(updateSize, 10);
    });
}


document.addEventListener('DOMContentLoaded', function () {
    

    // Инициализация переменных
    totalVolumeInput = document.getElementById('totalVolume');
    occupiedVolumeInput = document.getElementById('occupiedVolume');
    participationFactorInput = document.getElementById('participationFactor');
    heatSourceSelect = document.getElementById('heatSource');
    coldTempInput = document.getElementById('coldTemp');
    heatingPeriodInput = document.getElementById('heatingPeriod');
    initialDataSection = document.getElementById('initialDataSection');
    coefficientSection = document.getElementById('coefficientSection');
    resultSection = document.getElementById('resultSection');
    heatingLoadSection = document.getElementById('heatingLoadSection');
    calculateBtn = document.getElementById('calculateBtn');
    resultGcal = document.getElementById('resultGcal');

    // Получаем элементы для жилых помещений
    const residentialSection = document.getElementById('residentialSection');
    const residentialTableContainer = document.getElementById('residentialTableContainer');
    const consumptionTableContainer = document.getElementById('consumptionTableContainer');
    const yearSelect = document.getElementById('year');
    const floorsSelect = document.getElementById('floors');
    const coefficientInput = document.getElementById('coefficient');

    // Проверяем наличие кнопки
    const calculateResidentialBtn = document.getElementById('calculateResidentialBtn');

    // Обработчик изменения типа помещения
    const typeSelect = document.getElementById('type');
    if (typeSelect) {
        typeSelect.addEventListener('change', function () {
            console.log('Выбран тип:', this.value);

            // Получаем все необходимые элементы
            const residentialSection = document.getElementById('residentialSection');
            const residentialTableContainer = document.getElementById('residentialTableContainer');
            const initialDataSection = document.getElementById('initialDataSection');
            const coefficientSection = document.getElementById('coefficientSection');
            const heatingLoadSection = document.getElementById('heatingLoadSection');
            const consumptionTableContainer = document.getElementById('consumptionTableContainer');

            if (this.value === 'residential') {
                // При выборе "Жилое помещение":
                // Показываем блок residentialSection
                if (residentialSection) residentialSection.classList.remove('hidden');
                // Скрываем все блоки для нежилых помещений
                if (initialDataSection) initialDataSection.classList.add('hidden');
                if (coefficientSection) coefficientSection.classList.add('hidden');
                if (heatingLoadSection) heatingLoadSection.classList.add('hidden');
                if (consumptionTableContainer) {
                    consumptionTableContainer.classList.add('hidden');
                    consumptionTableContainer.style.display = '';
                }
                // Таблица для жилых скрыта до нажатия кнопки "Рассчитать"
                if (residentialTableContainer) {
                    residentialTableContainer.classList.add('hidden');
                    residentialTableContainer.style.display = '';
                }
                
            } else if (this.value === 'non-residential') {
                // При выборе "Нежилое помещение":
                // Скрываем блок residentialSection и таблицу для жилых помещений
                if (residentialSection) residentialSection.classList.add('hidden');
                if (residentialTableContainer) {
                    residentialTableContainer.classList.add('hidden');
                    residentialTableContainer.style.display = '';
                }
                
                // Показываем блоки для нежилых (при наличии заполненных полей)
                if (document.getElementById('consumer').value &&
                    document.getElementById('object').value &&
                    document.getElementById('address').value &&
                    document.getElementById('startDate').value &&
                    document.getElementById('endDate').value) {
                    if (initialDataSection) initialDataSection.classList.remove('hidden');
                } else {
                    if (initialDataSection) initialDataSection.classList.add('hidden');
                }
                // Скрываем таблицу для нежилых при переключении (но не через display: none, а через класс)
                if (consumptionTableContainer) {
                    consumptionTableContainer.classList.add('hidden');
                    consumptionTableContainer.style.display = '';
                }
                if (coefficientSection) coefficientSection.classList.add('hidden');
                if (heatingLoadSection) heatingLoadSection.classList.add('hidden');
                
            } else {
                // При выборе пустого значения:
                // Скрываем все блоки и таблицы
                if (residentialSection) residentialSection.classList.add('hidden');
                if (residentialTableContainer) {
                    residentialTableContainer.classList.add('hidden');
                    residentialTableContainer.style.display = '';
                }
                if (initialDataSection) initialDataSection.classList.add('hidden');
                if (coefficientSection) coefficientSection.classList.add('hidden');
                if (heatingLoadSection) heatingLoadSection.classList.add('hidden');
                if (consumptionTableContainer) {
                    consumptionTableContainer.classList.add('hidden');
                    consumptionTableContainer.style.display = '';
                }
            }
        });
         setupAutoExpandInputs();
    }

    // Автоматический расчет коэффициента для жилых помещений
    function calculateCoefficient() {
        const year = yearSelect ? yearSelect.value : '';
        const floors = floorsSelect ? floorsSelect.value : '';

        if (year && floors && coefficients[year] && coefficients[year][floors]) {
            if (coefficientInput) {
                coefficientInput.value = coefficients[year][floors];
            }
        } else {
            if (coefficientInput) {
                coefficientInput.value = '';
            }
        }
    }

    if (yearSelect) yearSelect.addEventListener('change', calculateCoefficient);
    if (floorsSelect) floorsSelect.addEventListener('change', calculateCoefficient);

    // Обработчик кнопки "Рассчитать" для жилых помещений
    if (calculateResidentialBtn) {
        calculateResidentialBtn.addEventListener('click', function (e) {
            e.preventDefault();

            const areaInput = document.getElementById('area');
            const coefficientInput = document.getElementById('coefficient');
            const tariffInput = document.getElementById('heatingTariff');

            const area = parseFloat(areaInput ? areaInput.value : '');
            const coefficient = parseFloat(coefficientInput ? coefficientInput.value : '');
            const tariff = parseFloat(tariffInput ? tariffInput.value : '');

            if (!area || isNaN(area) || area <= 0) {
                alert('Пожалуйста, введите корректную площадь здания!');
                return;
            }
            if (!coefficient || isNaN(coefficient) || coefficient <= 0) {
                alert('Пожалуйста, выберите год постройки и этажность для автоматического расчета коэффициента!');
                return;
            }
            if (!tariff || isNaN(tariff) || tariff <= 0) {
                alert('Пожалуйста, введите корректный тариф отопления!');
                return;
            }

            // Рассчитываем годовое потребление: Площадь × Коэффициент × 12
            const annualGcal = area * coefficient * 12;

            // Показываем таблицу
            const tableContainer = document.getElementById('residentialTableContainer');
            if (tableContainer) {
                tableContainer.classList.remove('hidden');
                tableContainer.style.display = '';
            } else {
                console.error('residentialTableContainer не найден');
            }

            // Заполняем таблицу
            fillResidentialTable(annualGcal, tariff);
        });
    } else {
        console.error('Кнопка calculateResidentialBtn не найдена!');
    }

    // Остальные обработчики событий
    if (heatSourceSelect) {
        heatSourceSelect.addEventListener('change', function () {
            switch (this.value) {
                case 'leninskiy':
                    if (coldTempInput) coldTempInput.value = -41;
                    if (heatingPeriodInput) heatingPeriodInput.value = 263;
                    break;
                case 'tommot':
                    if (coldTempInput) coldTempInput.value = -50;
                    if (heatingPeriodInput) heatingPeriodInput.value = 259;
                    break;
                case 'chagda':
                    if (coldTempInput) coldTempInput.value = -48.9;
                    if (heatingPeriodInput) heatingPeriodInput.value = 263;
                    break;
                default:
                    if (coldTempInput) coldTempInput.value = '';
                    if (heatingPeriodInput) heatingPeriodInput.value = '';
            }

            if (this.value && coldTempInput && coldTempInput.value && 
                heatingPeriodInput && heatingPeriodInput.value &&
                document.getElementById('dailyHeating') && document.getElementById('dailyHeating').value && 
                totalVolumeInput && totalVolumeInput.value &&
                occupiedVolumeInput && occupiedVolumeInput.value) {
                if (coefficientSection) coefficientSection.classList.remove('hidden');
            } else {
                if (coefficientSection) coefficientSection.classList.add('hidden');
                if (resultSection) resultSection.classList.add('hidden');
                if (heatingLoadSection) heatingLoadSection.classList.add('hidden');
            }
        });
    }

    if (totalVolumeInput) {
        totalVolumeInput.addEventListener('input', function () {
            calculateParticipationFactor();
            calculateQValue();
        });
    }

    if (occupiedVolumeInput) {
        occupiedVolumeInput.addEventListener('input', calculateParticipationFactor);
    }

    const windowCoefficient = document.getElementById('windowCoefficient');
    if (windowCoefficient) {
        windowCoefficient.addEventListener('change', function () {
            if (this.value) {
                if (heatingLoadSection) heatingLoadSection.classList.remove('hidden');
            } else {
                if (heatingLoadSection) heatingLoadSection.classList.add('hidden');
            }
        });
    }

    const calculateOldMethodBtn = document.getElementById('calculateOldMethod');
    if (calculateOldMethodBtn) {
        calculateOldMethodBtn.addEventListener('click', function () {
            const V = parseFloat(totalVolumeInput ? totalVolumeInput.value : '');
            const q = parseFloat(document.getElementById('qValue') ? document.getElementById('qValue').value : '');
            const tInner = parseFloat(document.getElementById('innerTemp') ? document.getElementById('innerTemp').value : '');
            const tCold = parseFloat(coldTempInput ? coldTempInput.value : '');
            const kWindow = parseFloat(document.getElementById('windowCoefficient') ? document.getElementById('windowCoefficient').value : '');
            const kParticipation = parseFloat(participationFactorInput ? participationFactorInput.value : '');

            if (isNaN(V) || isNaN(q) || isNaN(tInner) || isNaN(tCold) || isNaN(kWindow) || isNaN(kParticipation)) {
                alert('Пожалуйста, заполните все необходимые поля!');
                return;
            }

            const formulaText = `${V.toFixed(2)} * ${q.toFixed(3)} * (${tInner.toFixed(1)}-(${tCold.toFixed(1)})) * ${kWindow.toFixed(2)} * ${kParticipation.toFixed(4)} * 10⁻⁶`;

            const formulaExpression = document.getElementById('formulaExpression');
            if (formulaExpression) formulaExpression.textContent = formulaText;

            const hourlyValue = V * q * (tInner - tCold) * kWindow * 0.000001 * kParticipation;
            const hourlyResult = document.getElementById('hourlyResult');
            if (hourlyResult) hourlyResult.textContent = hourlyValue.toFixed(6);

            const oldMethodResult = document.getElementById('oldMethodResult');
            if (oldMethodResult) oldMethodResult.classList.remove('hidden');
        });
    }

    if (calculateBtn) {
        calculateBtn.addEventListener('click', calculateGcal);
    }

    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('input', function () {
            if (this.value && this.value < 0) {
                this.value = Math.abs(this.value);
            }
        });
    });
});

// Функция заполнения таблицы для жилых помещений (на весь год)
function fillResidentialTable(annualGcal, tariff) {

    const tableBody = document.querySelector('#residentialConsumptionTable tbody');
    const tableFooter = document.getElementById('residentialTableFooter');

    if (!tableBody || !tableFooter) {
        console.error('Таблица не найдена!');
        console.log('tableBody:', tableBody);
        console.log('tableFooter:', tableFooter);
        return;
    }

    tableBody.innerHTML = '';
    tableFooter.innerHTML = '';

    const monthNames = ["январь", "февраль", "март", "апрель", "май", "июнь",
        "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"];

    let totalConsumption = 0;
    let totalSumWithVAT = 0;

    // Равномерно распределяем годовое потребление по 12 месяцам
    const monthlyConsumption = parseFloat((annualGcal / 12).toFixed(4));

    // Заполняем все 12 месяцев
    for (let i = 0; i < 12; i++) {
        const monthName = monthNames[i];
        const sumWithVAT = (monthlyConsumption * tariff * 1.22).toFixed(2);

        totalConsumption += monthlyConsumption;
        totalSumWithVAT += parseFloat(sumWithVAT);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${monthName}</td>
            <td>${monthlyConsumption.toFixed(4)}</td>
            <td>${tariff.toFixed(2)}</td>
            <td>${sumWithVAT}</td>
        `;
        tableBody.appendChild(row);
    }

    // Добавляем строку "Итого"
    if (totalConsumption > 0) {
        const footerRow = document.createElement('tr');
        footerRow.style.fontWeight = 'bold';
        footerRow.style.backgroundColor = '#f2f2f2';
        footerRow.innerHTML = `
            <td><strong>Итого за год</strong></td>
            <td><strong>${totalConsumption.toFixed(4)}</strong></td>
            <td></td>
            <td><strong>${totalSumWithVAT.toFixed(2)}</strong></td>
        `;
        tableFooter.appendChild(footerRow);
    }

    const tableContainer = document.getElementById('residentialTableContainer');
    if (tableContainer) {
        tableContainer.style.display = '';
    }
}

// Обработчик кнопки "Распечатать расчет" для жилых помещений
const printResidentialBtn = document.getElementById('printResidentialBtn');
if (printResidentialBtn) {
    printResidentialBtn.addEventListener('click', function () {
        // Проверяем, есть ли данные в таблице
        const tableBody = document.querySelector('#residentialConsumptionTable tbody');
        if (!tableBody || tableBody.children.length === 0) {
            alert('Нет данных для печати. Сначала выполните расчет.');
            return;
        }

        // Функция для форматирования даты в ДД.ММ.ГГГГ
        function formatDate(dateString) {
            if (!dateString) return 'Не указана';
            const parts = dateString.split('-');
            if (parts.length !== 3) return dateString;
            return `${parts[2]}.${parts[1]}.${parts[0]}`;
        }

        // Получаем все необходимые данные для печати
        const consumer = document.getElementById('consumer')?.value || 'Не указан';
        const object = document.getElementById('object')?.value || 'Не указан';
        const address = document.getElementById('address')?.value || 'Не указан';
        const location = document.getElementById('location')?.selectedOptions[0]?.text || 'Не указан';
        const year = document.getElementById('year')?.selectedOptions[0]?.text || 'Не указан';
        const floors = document.getElementById('floors')?.selectedOptions[0]?.text || 'Не указан';
        const area = document.getElementById('area')?.value || 'Не указана';
        const tariff = document.getElementById('heatingTariff')?.value || '0';

        // Создаем окно для печати
        const printWindow = window.open('', '_blank', 'width=1000,height=800');

        if (!printWindow) {
            alert('Пожалуйста, разрешите всплывающие окна для этого сайта.');
            return;
        }

        // Копируем таблицу в новое окно
        const table = document.getElementById('residentialConsumptionTable').cloneNode(true);

        // Формируем HTML для печати
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Расчет потребления теплоэнергии (жилое помещение)</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 20px;
                        font-size: 14px;
                        line-height: 1.4;
                        color: #333;
                    }
                    .print-header {
                        text-align: center;
                        margin-bottom: 25px;
                        border-bottom: 2px solid #333;
                        padding-bottom: 15px;
                    }
                    .print-header h1 {
                        font-size: 20px;
                        margin: 0 0 5px 0;
                        color: #2c3e50;
                    }
                    .print-header h3 {
                        font-size: 16px;
                        margin: 5px 0;
                        font-weight: normal;
                        color: #555;
                    }
                    .print-info {
                        margin-bottom: 20px;
                        padding: 10px;
                        background-color: #f9f9f9;
                        border-radius: 5px;
                        border: 1px solid #ddd;
                    }
                    .print-info p {
                        margin: 5px 0;
                    }
                    .print-info strong {
                        font-weight: bold;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 10px;
                        font-size: 13px;
                    }
                    table th, table td {
                        border: 1px solid #ddd;
                        padding: 8px 10px;
                        text-align: center;
                    }
                    table th {
                        background-color: #f2f2f2;
                        font-weight: bold;
                    }
                    table tr:nth-child(even) {
                        background-color: #f9f9f9;
                    }
                    table tfoot tr {
                        background-color: #f2f2f2 !important;
                        font-weight: bold;
                    }
                    .print-footer {
                        margin-top: 30px;
                        padding-top: 15px;
                        border-top: 1px solid #ddd;
                        text-align: center;
                        font-size: 12px;
                        color: #888;
                    }
                    @media print {
                        body { padding: 10px; }
                        .no-print { display: none; }
                        table { page-break-inside: avoid; }
                        table tbody tr { page-break-inside: avoid; }
                    }
                </style>
            </head>
            <body>
                <div class="print-header">
                    <h1>Расчет нормативного потребления отопления по нагрузке</h1>
                    <h3>Жилое помещение</h3>
                </div>

                <div class="print-info">
                    <p><strong>Потребитель:</strong> ${consumer}</p>
                    <p><strong>Объект:</strong> ${object}</p>
                    <p><strong>Адрес:</strong> ${address}</p>
                    <p><strong>Населенный пункт:</strong> ${location}</p>
                    <p><strong>Этажность:</strong> ${floors}</p>
                    <p><strong>Площадь здания:</strong> ${area} м²</p>
                    <p><strong>Тариф отопления:</strong> ${tariff} руб.</p>
                </div>

                <h3 style="text-align: center; margin-bottom: 10px;">
                    Расчет потребления Теплоэнергии
                </h3>

                ${table.outerHTML}

                <div class="print-footer">
                    Дата формирования: ${new Date().toLocaleDateString('ru-RU')} ${new Date().toLocaleTimeString('ru-RU')}
                    <br>
                    Документ сформирован автоматически
                </div>

                <div class="no-print" style="text-align: center; margin-top: 20px;">
                    <button onclick="window.print()" style="padding: 10px 30px; font-size: 16px; background-color: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        🖨️ Печать
                    </button>
                    <button onclick="window.close()" style="padding: 10px 30px; font-size: 16px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;">
                        ✖ Закрыть
                    </button>
                </div>

                 <script>
                 // Автоматически открываем диалог печати через 1 секунду
                //     setTimeout(function() {
                //         window.print();
                //     }, 1000);
                <\/script>
            </body>
            </html>
        `);

        printWindow.document.close();

        // Фокус на новом окне
        printWindow.focus();
    });
}

// Функция расчета коэффициента участия
function calculateParticipationFactor() {
    if (totalVolumeInput && totalVolumeInput.value && occupiedVolumeInput && occupiedVolumeInput.value) {
        const totalVolume = parseFloat(totalVolumeInput.value);
        const occupiedVolume = parseFloat(occupiedVolumeInput.value);

        if (totalVolume !== 0 && participationFactorInput) {
            participationFactorInput.value = (occupiedVolume / totalVolume).toFixed(4);
        } else if (participationFactorInput) {
            participationFactorInput.value = '';
        }

        if (heatSourceSelect && heatSourceSelect.value && coldTempInput && coldTempInput.value && 
            heatingPeriodInput && heatingPeriodInput.value &&
            document.getElementById('dailyHeating') && document.getElementById('dailyHeating').value && 
            totalVolumeInput && totalVolumeInput.value &&
            occupiedVolumeInput && occupiedVolumeInput.value) {
            if (coefficientSection) coefficientSection.classList.remove('hidden');
        } else {
            if (coefficientSection) coefficientSection.classList.add('hidden');
            if (resultSection) resultSection.classList.add('hidden');
            if (heatingLoadSection) heatingLoadSection.classList.add('hidden');
        }
    }
}

// Функция расчета q
function calculateQValue() {
    if (!totalVolumeInput || !totalVolumeInput.value) return;

    const volume = parseFloat(totalVolumeInput.value);
    const range = qRanges.find(r => volume >= r.min && volume < r.max);

    if (range) {
        const qValue = range.minRange -
            ((range.minRange - range.maxRange) /
                (range.max - range.min)) *
            (volume - range.min);

        const qValueInput = document.getElementById('qValue');
        if (qValueInput) {
            qValueInput.value = qValue.toFixed(4);
        }

        if (document.getElementById('innerTemp') && document.getElementById('innerTemp').value &&
            document.getElementById('windowCoefficient') && document.getElementById('windowCoefficient').value) {
            if (resultSection) resultSection.classList.remove('hidden');
        }
    }
}

// Функция расчета нормативной Гкал
function calculateGcal() {
    const tCold = parseFloat(coldTempInput ? coldTempInput.value : '');
    const tInner = parseFloat(document.getElementById('innerTemp') ? document.getElementById('innerTemp').value : '');
    const q = parseFloat(document.getElementById('qValue') ? document.getElementById('qValue').value : '');
    const kWindow = parseFloat(document.getElementById('windowCoefficient') ? document.getElementById('windowCoefficient').value : '');
    const kParticipation = parseFloat(participationFactorInput ? participationFactorInput.value : '');
    const totalVolume = parseFloat(totalVolumeInput ? totalVolumeInput.value : '');
    const heatingPeriod = parseFloat(heatingPeriodInput ? heatingPeriodInput.value : '');
    const dailyHeating = parseFloat(document.getElementById('dailyHeating') ? document.getElementById('dailyHeating').value : '');

    if (isNaN(tCold) || isNaN(tInner) || isNaN(q) || isNaN(kWindow) ||
        isNaN(kParticipation) || isNaN(totalVolume) || isNaN(heatingPeriod) ||
        isNaN(dailyHeating)) {
        alert('Пожалуйста, заполните все поля корректно!');
        return;
    }

    const Q = q * kWindow * (tInner - tCold) * totalVolume * kParticipation *
        heatingPeriod * dailyHeating / 1000000;

    if (resultGcal) {
        resultGcal.textContent = Q.toFixed(4);
    }
}
