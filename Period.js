document.addEventListener('DOMContentLoaded', function () {
    // Проверяем существование основного блока
    const heatingLoadSection = document.getElementById('heatingLoadSection');
    if (!heatingLoadSection) {
        console.error("Не найден элемент heatingLoadSection");
        return;
    }

    // Температурные данные по источникам
    const tempData = {
        leninskiy: {
            "январь": -26.8, "февраль": -24.3, "март": -15.3, "апрель": -4.4,
            "май": 5.2, "сентябрь": 4.9, "октябрь": -6.5, "ноябрь": -18.9, "декабрь": -25.4
        },
        tommot: {
            "январь": -34.8, "февраль": -30.3, "март": -18.6, "апрель": -4.2,
            "май": 6.5, "сентябрь": 5.3, "октябрь": -6.6, "ноябрь": -23.5, "декабрь": -32.8
        },
        chagda: {
            "январь": -36.1, "февраль": -26.2, "март": -13.5, "апрель": -2.9,
            "май": 7.4, "сентябрь": 6.7, "октябрь": -1.2, "ноябрь": -17.7, "декабрь": -29.2
        }
    };

    // Максимальное количество дней для промежуточных месяцев
    const maxDaysConfig = {
        leninskiy: { may: 28, september: 23 },
        tommot: { may: 25, september: 22 },
        chagda: { may: 27, september: 24 }
    };

    // Данные для тепловых потерь
    const heatLossData = {
        supply: {
            15: 22, 25: 22, 32: 22, 48: 22, 57: 25, 76: 27, 89: 31,
            108: 34, 133: 39, 159: 43, 194: 48, 219: 52, 273: 60
        },
        return: {
            15: 18, 25: 18, 32: 18, 48: 18, 57: 21, 76: 23, 89: 26,
            108: 28, 133: 32, 159: 36, 194: 40, 219: 43, 273: 50
        }
    };

    // Обработчик кнопки "Рассчитать период"
    const calculatePeriodBtn = document.getElementById('calculatePeriod');
    if (calculatePeriodBtn) {
        calculatePeriodBtn.addEventListener('click', function () {
            if (!validateInputs()) return;

            const tableContainer = document.getElementById('consumptionTableContainer');
            if (tableContainer) tableContainer.classList.remove('hidden');

            fillConsumptionTable();
        });
    }

    // Обработчик кнопки "Добавить участок тепловой сети"
    document.getElementById('addNetworkSection')?.addEventListener('click', function () {
        addNetworkSection();
    });

document.getElementById('cleanNetworkSection')?.addEventListener('click', function() {
    const container = document.getElementById('networkSectionsContainer');
    if (container) {
        // Подтверждение перед удалением
        if (confirm('Вы действительно хотите удалить все участки тепловой сети?')) {
            container.innerHTML = '';
        }
    }
});

    function validateInputs() {
        const requiredFields = [
            document.getElementById('totalVolume')?.value,
            document.getElementById('qValue')?.value,
            document.getElementById('innerTemp')?.value,
            document.getElementById('coldTemp')?.value,
            document.getElementById('windowCoefficient')?.value,
            document.getElementById('participationFactor')?.value,
            document.getElementById('tariff')?.value,
            document.getElementById('startDate')?.value,
            document.getElementById('endDate')?.value
        ];

        if (requiredFields.some(field => !field)) {
            alert('Пожалуйста, заполните все необходимые поля!');
            return false;
        }
        return true;
    }

    function fillConsumptionTable() {
    const tableBody = document.querySelector('#consumptionTable tbody');
    const tableFooter = document.getElementById('tableFooter');
    if (!tableBody || !tableFooter) return;

    tableBody.innerHTML = '';
    tableFooter.innerHTML = '';

    const startDate = new Date(document.getElementById('startDate').value);
    const endDate = new Date(document.getElementById('endDate').value);
    const heatSource = document.getElementById('heatSource').value;
    const tInner = parseFloat(document.getElementById('innerTemp').value);
    const tCold = parseFloat(document.getElementById('coldTemp').value);
    const dailyHeating = parseFloat(document.getElementById('dailyHeating').value);
    const tariff = parseFloat(document.getElementById('tariff').value);

    let qHourly = parseFloat(document.getElementById('qMax').value);
    if (isNaN(qHourly)) {
        qHourly = parseFloat(document.getElementById('hourlyResult')?.textContent || '0');
    }

    // Получаем значение потерь тепловой сети, если оно было рассчитано
    let networkLossHourly = 0;
    const networkResults = document.querySelectorAll('[id^="hourlyLossResult-"]');
    networkResults.forEach(result => {
        const valueText = result.textContent.trim();
        const valueMatch = valueText.match(/(\d+\.\d+)/);
        if (valueMatch) {
            networkLossHourly += parseFloat(valueMatch[1]);
        }
    });

    const monthNames = ["январь", "февраль", "март", "апрель", "май", "июнь",
        "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"];

    let totalConsumption = 0;
    let totalNetworkLoss = 0;
    let totalSumWithVAT = 0;

    // Обработка периода в пределах одного месяца
    if (startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear()) {
        const monthIndex = startDate.getMonth();
        const monthName = monthNames[monthIndex];
        const year = startDate.getFullYear();

        // Пропускаем летние месяцы (июнь, июль, август)
        if (monthIndex >= 5 && monthIndex <= 7) {
            return;
        }

        const tMonth = tempData[heatSource]?.[monthName];
        if (typeof tMonth === 'undefined') return;

        // Рассчитываем точное количество дней в периоде
        const timeDiff = endDate - startDate;
        const dayDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;
        let heatingDays = dayDiff;

        // Применяем ограничения для мая и сентября
        if (monthName === 'май') {
            heatingDays = Math.min(heatingDays, maxDaysConfig[heatSource].may);
        } else if (monthName === 'сентябрь') {
            heatingDays = Math.min(heatingDays, maxDaysConfig[heatSource].september);
        }

        // Основное потребление
        const consumption = parseFloat((qHourly * (heatingDays * dailyHeating) *
            ((tInner - tMonth) / (tInner - tCold))).toFixed(4));
        
        // Потери тепловой сети (если были рассчитаны)
        let networkLoss = 0;
        if (networkLossHourly > 0) {
            networkLoss = parseFloat((networkLossHourly * 24 * heatingDays).toFixed(4));
        }

        const totalConsumptionRow = consumption + networkLoss;
        const sumWithVAT = (totalConsumptionRow * tariff * 1.2).toFixed(2);

        totalConsumption += consumption;
        totalNetworkLoss += networkLoss;
        totalSumWithVAT += parseFloat(sumWithVAT);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${monthName} ${year}</td>
            <td>${tMonth}</td>
            <td>${heatingDays}</td>
            <td>
                ${consumption.toFixed(4)}${networkLoss > 0 ? `<br>+ ${networkLoss.toFixed(4)} (потери)` : ''}
            </td>
            <td>${tariff.toFixed(2)}</td>
            <td>${sumWithVAT}</td>
        `;
        tableBody.appendChild(row);
    } else {
        // Для периодов, охватывающих несколько месяцев
        const currentDate = new Date(startDate);
        currentDate.setDate(1); // Начинаем с первого дня месяца

        while (currentDate <= endDate) {
            const monthIndex = currentDate.getMonth();
            const monthName = monthNames[monthIndex];
            const year = currentDate.getFullYear();
            const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

            // Пропускаем летние месяцы (июнь, июль, август)
            if (monthIndex >= 5 && monthIndex <= 7) {
                currentDate.setMonth(monthIndex + 1, 1);
                continue;
            }

            const tMonth = tempData[heatSource]?.[monthName];
            if (typeof tMonth === 'undefined') {
                currentDate.setMonth(monthIndex + 1, 1);
                continue;
            }

            let heatingDays;
            if (currentDate.getMonth() === startDate.getMonth() && currentDate.getFullYear() === startDate.getFullYear()) {
                // Первый месяц периода
                heatingDays = daysInMonth - startDate.getDate() + 1;
            } else if (currentDate.getMonth() === endDate.getMonth() && currentDate.getFullYear() === endDate.getFullYear()) {
                // Последний месяц периода
                heatingDays = endDate.getDate();
            } else {
                // Полные месяцы между началом и концом периода
                heatingDays = daysInMonth;
            }

            // Применяем ограничения для мая и сентября
            if (monthName === 'май') {
                heatingDays = Math.min(heatingDays, maxDaysConfig[heatSource].may);
            } else if (monthName === 'сентябрь') {
                heatingDays = Math.min(heatingDays, maxDaysConfig[heatSource].september);
            }

            // Основное потребление
            const consumption = parseFloat((qHourly * (heatingDays * dailyHeating) *
                ((tInner - tMonth) / (tInner - tCold))).toFixed(4));
            
            // Потери тепловой сети (если были рассчитаны)
            let networkLoss = 0;
            if (networkLossHourly > 0) {
                networkLoss = parseFloat((networkLossHourly * 24 * heatingDays).toFixed(4));
            }

            const totalConsumptionRow = consumption + networkLoss;
            const sumWithVAT = (totalConsumptionRow * tariff * 1.2).toFixed(2);

            totalConsumption += consumption;
            totalNetworkLoss += networkLoss;
            totalSumWithVAT += parseFloat(sumWithVAT);

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${monthName} ${year}</td>
                <td>${tMonth}</td>
                <td>${heatingDays}</td>
                <td>
                    ${consumption.toFixed(4)}${networkLoss > 0 ? `<br>+ ${networkLoss.toFixed(4)} (потери)` : ''}
                </td>
                <td>${tariff.toFixed(2)}</td>
                <td>${sumWithVAT}</td>
            `;
            tableBody.appendChild(row);

            // Переход к следующему месяцу
            currentDate.setMonth(monthIndex + 1, 1);
        }
    }

    // Добавляем строку "Итого"
    if (totalConsumption > 0) {
        const footerRow = document.createElement('tr');
        footerRow.style.fontWeight = 'bold';
        footerRow.style.backgroundColor = '#f2f2f2';
        footerRow.innerHTML = `
            <td colspan="3">Итого</td>
            <td>
                 ${(totalConsumption + totalNetworkLoss).toFixed(4)}
            </td>
            <td></td>
            <td>${totalSumWithVAT.toFixed(2)}</td>
        `;
        tableFooter.appendChild(footerRow);
    }
}
    function addNetworkSection() {
        const container = document.getElementById('networkSectionsContainer');
        const sectionId = Date.now();

        const networkSection = document.createElement('div');
        networkSection.className = 'network-section';
        networkSection.innerHTML = `
            <h3>Участок тепловой сети</h3>
            <div class="form-row">
                <label for="yearBuilt-${sectionId}">Год прокладки трубопровода (трассы):</label>
                <input type="number" id="yearBuilt-${sectionId}" min="1900" max="2100">
            </div>
            <div class="form-row">
                <label for="installationMethod-${sectionId}">Способ прокладки трубопровода:</label>
                <select id="installationMethod-${sectionId}">
                    <option value="">-- Выберите --</option>
                    <option value="overground">Надземный</option>
                    <option value="underground">Подземный</option>
                    <option value="channelless">Бесканальный</option>
                    <option value="tunnel">В тоннелях и каналах</option>
                </select>
            </div>
            <div class="form-row">
                <label for="length-${sectionId}">L Протяженность трубопровода (М):</label>
                <input type="number" id="length-${sectionId}" step="0.01">
            </div>
            <div class="form-row">
                <label for="diameter-${sectionId}">D/у Наружный диаметр трубопровода (мм):</label>
                <select id="diameter-${sectionId}">
                    <option value="">-- Выберите --</option>
                    <option value="15">15</option>
                    <option value="25">25</option>
                    <option value="32">32</option>
                    <option value="48">48</option>
                    <option value="57">57</option>
                    <option value="76">76</option>
                    <option value="89">89</option>
                    <option value="108">108</option>
                    <option value="133">133</option>
                    <option value="159">159</option>
                    <option value="194">194</option>
                    <option value="219">219</option>
                    <option value="273">273</option>
                </select>
            </div>
            <div class="form-row">
                <label for="lossCoefficient-${sectionId}">Коэффициент учета потерь тепла арматурой и компенсаторами:</label>
                <input type="number" id="lossCoefficient-${sectionId}" readonly>
            </div>
            <div class="form-row">
                <label for="heatSourceCoefficient-${sectionId}">Коэффициент источника тепла:</label>
                <input type="number" id="heatSourceCoefficient-${sectionId}" readonly>
            </div>
            <div class="form-row">
                <label for="supplyLineLoss-${sectionId}">Потери тепла подающей линии (ккал/(ч.*м)):</label>
                <input type="number" id="supplyLineLoss-${sectionId}" readonly>
            </div>
            <div class="form-row">
                <label for="returnLineLoss-${sectionId}">Потери тепла обратной линии (ккал/(ч.*м)):</label>
                <input type="number" id="returnLineLoss-${sectionId}" readonly>
            </div>
            <div class="form-row">
                <label>Расчет удельные часовые тепловые потери:</label>
                <button class="calculate-loss-btn" data-section="${sectionId}">Рассчитать</button>
            </div>
            <div class="form-row result-row hidden" id="result-${sectionId}">
                <label>Qп.л..час.=в * дн * L* К д.у.* 10⁻⁶ =</label>
                <span id="hourlyLossResult-${sectionId}"></span>
            </div>
        `;

        container.appendChild(networkSection);

        // Обработчики событий для динамически созданных элементов
        document.getElementById(`installationMethod-${sectionId}`).addEventListener('change', function () {
            updateLossCoefficient(sectionId);
        });

        document.getElementById(`diameter-${sectionId}`).addEventListener('change', function () {
            updateLineLosses(sectionId);
        });

        document.querySelector(`.calculate-loss-btn[data-section="${sectionId}"]`).addEventListener('click', function () {
            calculateHourlyLoss(sectionId);
        });

        // Обновляем коэффициенты при создании
        updateHeatSourceCoefficient(sectionId);
    }

    function updateLossCoefficient(sectionId) {
        const method = document.getElementById(`installationMethod-${sectionId}`).value;
        let coefficient = 0;

        switch (method) {
            case 'overground': coefficient = 1.25; break;
            case 'underground': coefficient = 1.2; break;
            case 'channelless':
            case 'tunnel': coefficient = 1.3; break;
        }

        document.getElementById(`lossCoefficient-${sectionId}`).value = coefficient;
    }

    function updateHeatSourceCoefficient(sectionId) {
        const source = document.getElementById('heatSource').value;
        let coefficient = 0;

        switch (source) {
            case 'leninskiy': coefficient = 0.9840; break;
            case 'tommot': coefficient = 0.9733; break
            case 'chagda': coefficient = 0.9733; break;
        }

        document.getElementById(`heatSourceCoefficient-${sectionId}`).value = coefficient;
    }

    function updateLineLosses(sectionId) {
        const diameter = parseInt(document.getElementById(`diameter-${sectionId}`).value);

        if (diameter in heatLossData.supply) {
            document.getElementById(`supplyLineLoss-${sectionId}`).value = heatLossData.supply[diameter];
        }

        if (diameter in heatLossData.return) {
            document.getElementById(`returnLineLoss-${sectionId}`).value = heatLossData.return[diameter];
        }
    }

    function calculateHourlyLoss(sectionId) {
        const length = parseFloat(document.getElementById(`length-${sectionId}`).value);
        const diameter = parseInt(document.getElementById(`diameter-${sectionId}`).value);
        const lossCoefficient = parseFloat(document.getElementById(`lossCoefficient-${sectionId}`).value);
        const sourceCoefficient = parseFloat(document.getElementById(`heatSourceCoefficient-${sectionId}`).value);
        const supplyLoss = parseFloat(document.getElementById(`supplyLineLoss-${sectionId}`).value);
        const returnLoss = parseFloat(document.getElementById(`returnLineLoss-${sectionId}`).value);

        if (isNaN(length) || isNaN(diameter) || isNaN(lossCoefficient) ||
            isNaN(sourceCoefficient) || isNaN(supplyLoss) || isNaN(returnLoss)) {
            alert('Заполните все необходимые поля для расчета');
            return;
        }

        // Расчет для подающей линии
        const supplyLineResult = sourceCoefficient * length * supplyLoss * lossCoefficient / 1000000;

        // Расчет для обратной линии
        const returnLineResult = sourceCoefficient * length * returnLoss * lossCoefficient / 1000000;

        // Суммарный результат
        const hourlyLoss = supplyLineResult + returnLineResult;

        // Форматируем вывод формулы
    //     const formulaText = `
    //     (${sourceCoefficient} * ${length} * ${supplyLoss} * ${lossCoefficient} / 10⁻⁶) + 
    //     (${sourceCoefficient} * ${length} * ${returnLoss} * ${lossCoefficient} / 10⁻⁶) =
    // `.replace(/\s+/g, ' ').trim();

        document.getElementById(`hourlyLossResult-${sectionId}`).innerHTML = `
    ${hourlyLoss.toFixed(6)}        
    `;
        document.getElementById(`result-${sectionId}`).classList.remove('hidden');
    }
});