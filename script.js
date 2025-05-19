// Объявляем все переменные
let totalVolumeInput, occupiedVolumeInput, participationFactorInput;
let heatSourceSelect, coldTempInput, heatingPeriodInput;
let initialDataSection, coefficientSection, resultSection, heatingLoadSection;
let calculateBtn, resultGcal;

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

    // Обработчики событий
    document.getElementById('type').addEventListener('change', function () {
        if (this.value && document.getElementById('consumer').value &&
            document.getElementById('object').value && document.getElementById('address').value &&
            document.getElementById('startDate').value && document.getElementById('endDate').value) {
            initialDataSection.classList.remove('hidden');
        } else {
            initialDataSection.classList.add('hidden');
            coefficientSection.classList.add('hidden');
            resultSection.classList.add('hidden');
            heatingLoadSection.classList.add('hidden');
        }
    });

    heatSourceSelect.addEventListener('change', function () {
        switch (this.value) {
            case 'leninskiy':
                coldTempInput.value = -41;
                heatingPeriodInput.value = 263;
                break;
            case 'tommot':
                coldTempInput.value = -50;
                heatingPeriodInput.value = 259;
                break;
            case 'chagda':
                coldTempInput.value = -48.9;
                heatingPeriodInput.value = 263;
                break;
            default:
                coldTempInput.value = '';
                heatingPeriodInput.value = '';
        }

        if (this.value && coldTempInput.value && heatingPeriodInput.value &&
            document.getElementById('dailyHeating').value && totalVolumeInput.value &&
            occupiedVolumeInput.value) {
            coefficientSection.classList.remove('hidden');
        } else {
            coefficientSection.classList.add('hidden');
            resultSection.classList.add('hidden');
            heatingLoadSection.classList.add('hidden');
        }
    });

    totalVolumeInput.addEventListener('input', function () {
        calculateParticipationFactor();
        calculateQValue();
    });

    occupiedVolumeInput.addEventListener('input', calculateParticipationFactor);

    document.getElementById('windowCoefficient').addEventListener('change', function () {
        if (this.value) {
            heatingLoadSection.classList.remove('hidden');
        } else {
            heatingLoadSection.classList.add('hidden');
        }
    });

    document.getElementById('calculateOldMethod').addEventListener('click', function () {
        const V = parseFloat(totalVolumeInput.value);
        const q = parseFloat(document.getElementById('qValue').value);
        const tInner = parseFloat(document.getElementById('innerTemp').value);
        const tCold = parseFloat(coldTempInput.value);
        const kWindow = parseFloat(document.getElementById('windowCoefficient').value);
        const kParticipation = parseFloat(participationFactorInput.value);

        if (isNaN(V) || isNaN(q) || isNaN(tInner) || isNaN(tCold) || isNaN(kWindow) || isNaN(kParticipation)) {
            alert('Пожалуйста, заполните все необходимые поля!');
            return;
        }

        // Формируем строку с формулой
        const formulaText = `${V.toFixed(2)} * ${q.toFixed(3)} * (${tInner.toFixed(1)}-(${tCold.toFixed(1)})) * ${kWindow.toFixed(2)} * ${kParticipation.toFixed(4)} * 10⁻⁶`;

        document.getElementById('formulaExpression').textContent = formulaText;

        // Рассчитываем значение
        const hourlyValue = V * q * (tInner - tCold) * kWindow * 0.000001 * kParticipation;
        document.getElementById('hourlyResult').textContent = hourlyValue.toFixed(6);

        // Показываем блок с результатом
        document.getElementById('oldMethodResult').classList.remove('hidden');
    });

    calculateBtn.addEventListener('click', calculateGcal);

    // Валидация полей
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('input', function () {
            if (this.value && this.value < 0) {
                this.value = Math.abs(this.value);
            }
        });
    });
});

// Функция расчета коэффициента участия
function calculateParticipationFactor() {
    if (totalVolumeInput.value && occupiedVolumeInput.value) {
        const totalVolume = parseFloat(totalVolumeInput.value);
        const occupiedVolume = parseFloat(occupiedVolumeInput.value);

        if (totalVolume !== 0) {
            participationFactorInput.value = (occupiedVolume / totalVolume).toFixed(4);
        } else {
            participationFactorInput.value = '';
        }

        if (heatSourceSelect.value && coldTempInput.value && heatingPeriodInput.value &&
            document.getElementById('dailyHeating').value && totalVolumeInput.value &&
            occupiedVolumeInput.value) {
            coefficientSection.classList.remove('hidden');
        } else {
            coefficientSection.classList.add('hidden');
            resultSection.classList.add('hidden');
            heatingLoadSection.classList.add('hidden');
        }
    }
}

// Функция расчета q
function calculateQValue() {
    if (!totalVolumeInput.value) return;

    const volume = parseFloat(totalVolumeInput.value);
    const range = qRanges.find(r => volume >= r.min && volume < r.max);

    if (range) {
        const qValue = range.minRange -
            ((range.minRange - range.maxRange) /
                (range.max - range.min)) *
            (volume - range.min);

        document.getElementById('qValue').value = qValue.toFixed(4);

        if (document.getElementById('innerTemp').value &&
            document.getElementById('windowCoefficient').value) {
            resultSection.classList.remove('hidden');
        }
    }
}

// Функция расчета нормативной Гкал
function calculateGcal() {
    const tCold = parseFloat(coldTempInput.value);
    const tInner = parseFloat(document.getElementById('innerTemp').value);
    const q = parseFloat(document.getElementById('qValue').value);
    const kWindow = parseFloat(document.getElementById('windowCoefficient').value);
    const kParticipation = parseFloat(participationFactorInput.value);
    const totalVolume = parseFloat(totalVolumeInput.value);
    const heatingPeriod = parseFloat(heatingPeriodInput.value);
    const dailyHeating = parseFloat(document.getElementById('dailyHeating').value);

    if (isNaN(tCold) || isNaN(tInner) || isNaN(q) || isNaN(kWindow) ||
        isNaN(kParticipation) || isNaN(totalVolume) || isNaN(heatingPeriod) ||
        isNaN(dailyHeating)) {
        alert('Пожалуйста, заполните все поля корректно!');
        return;
    }

    const Q = q * kWindow * (tInner - tCold) * totalVolume * kParticipation *
        heatingPeriod * dailyHeating / 1000000;

    resultGcal.textContent = Q.toFixed(4);
}