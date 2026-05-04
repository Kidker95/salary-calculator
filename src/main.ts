import './style.css';
import type { DayType, InputMode, ShiftCalculationResult } from './types';
import { calculateShiftPay, calculateHoursFromTimes } from './salary-calculator';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="calculator-card">
    <h1>💰 מחשבון שכר משמרת</h1>
    <p class="disclaimer">חישוב משוער לעובדים לפי שעה. לא מהווה ייעוץ משפטי או תלוש שכר.</p>

    <form id="calculator-form">
      <div class="form-group">
        <label for="hourly-rate">💵 שכר לשעה</label>
        <input type="number" id="hourly-rate" placeholder="לדוגמה: 45" min="0" step="0.01" required>
      </div>

      <div class="form-group">
        <label>אופן הזנת שעות</label>
        <div class="radio-group">
          <label>
            <input type="radio" name="input-mode" value="manual" checked>
            ⌨️ הזנת שעות ידנית
          </label>
          <label>
            <input type="radio" name="input-mode" value="time">
            ⏰ הזנת שעת התחלה וסיום
          </label>
        </div>
      </div>

      <div id="manual-hours-group" class="form-group">
        <label for="manual-hours">⏱️ כמה שעות עבדת?</label>
        <input type="number" id="manual-hours" placeholder="לדוגמה: 8" min="0" step="0.01" required>
      </div>

      <div id="time-inputs-group" class="form-group hidden">
        <div class="time-inputs">
          <div>
            <label for="start-time">⏰ שעת התחלה</label>
            <input type="time" id="start-time" required>
          </div>
          <div>
            <label for="end-time">⏰ שעת סיום</label>
            <input type="time" id="end-time" required>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label for="day-type">📅 סוג יום</label>
        <select id="day-type" required>
          <option value="regular">🌞 יום רגיל</option>
          <option value="rest">🕎 שבת / יום מנוחה שבועי</option>
          <option value="holiday">🎉 חג</option>
          <option value="election">🗳️ יום בחירות</option>
        </select>
        <p class="note">ביום בחירות החישוב של שעות נוספות עשוי להשתנות לפי מקום העבודה והפרשנות הנהוגה.</p>
      </div>

      <button type="submit" id="calculate-btn">🧮 חשב שכר</button>
    </form>

    <div id="result" class="result hidden">
      <button type="button" class="close-modal" aria-label="סגור תוצאה">×</button>
      <h2>🎯 המשמרת שלך שווה בערך:</h2>
      <div class="total-amount"></div>

      <div class="breakdown">
        <div class="breakdown-item">
          <span>🌅 שעות רגילות:</span>
          <span class="regular-hours"></span>
        </div>
        <div class="breakdown-item">
          <span>🌆 שעות נוספות 125%:</span>
          <span class="first-overtime-hours"></span>
        </div>
        <div class="breakdown-item">
          <span>🌙 שעות נוספות 150%:</span>
          <span class="extra-overtime-hours"></span>
        </div>
        <div class="breakdown-item total">
          <span>💰 סך הכל:</span>
          <span class="total-hours"></span>
        </div>
      </div>
    </div>

    <div id="warning" class="warning hidden">
      ⚠️ המשמרת ארוכה מ־12 שעות. ייתכן שזה חורג מהמגבלות החוקיות.
    </div>

    <div id="errors" class="errors hidden"></div>

    <footer class="app-footer">
      <span>Made by <a href="https://github.com/Kidker95" target="_blank" rel="noopener noreferrer">Omri</a></span>
    </footer>
  </div>
`;

function setupCalculator() {
  const form = document.getElementById('calculator-form') as HTMLFormElement;
  const inputModeRadios = document.querySelectorAll('input[name="input-mode"]');
  const manualHoursGroup = document.getElementById('manual-hours-group')!;
  const timeInputsGroup = document.getElementById('time-inputs-group')!;
  const resultDiv = document.getElementById('result')!;
  const closeResultButton = resultDiv.querySelector('.close-modal') as HTMLButtonElement;
  const warningDiv = document.getElementById('warning')!;
  const errorsDiv = document.getElementById('errors')!;

  const manualHoursInput = document.getElementById('manual-hours') as HTMLInputElement;
  const startTimeInput = document.getElementById('start-time') as HTMLInputElement;
  const endTimeInput = document.getElementById('end-time') as HTMLInputElement;

  function updateInputMode(mode: InputMode) {
    const isManual = mode === 'manual';

    manualHoursGroup.classList.toggle('hidden', !isManual);
    timeInputsGroup.classList.toggle('hidden', isManual);

    manualHoursInput.required = isManual;
    startTimeInput.required = !isManual;
    endTimeInput.required = !isManual;
  }

  // Initialize input mode state
  updateInputMode('manual');

  // Toggle input mode
  inputModeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      updateInputMode(target.value as InputMode);
    });
  });

  // Form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculateAndDisplay();
  });

  closeResultButton.addEventListener('click', () => {
    hideResult();
  });

  function calculateAndDisplay() {
    const hourlyRate = parseFloat((document.getElementById('hourly-rate') as HTMLInputElement).value);
    const dayType = (document.getElementById('day-type') as HTMLSelectElement).value as DayType;
    const inputMode = (document.querySelector('input[name="input-mode"]:checked') as HTMLInputElement).value as InputMode;

    let totalHours: number;

    if (inputMode === 'manual') {
      totalHours = parseFloat((document.getElementById('manual-hours') as HTMLInputElement).value);
    } else {
      const startTime = (document.getElementById('start-time') as HTMLInputElement).value;
      const endTime = (document.getElementById('end-time') as HTMLInputElement).value;
      totalHours = calculateHoursFromTimes(startTime, endTime);
    }

    // Validation
    const errors: string[] = [];
    if (!hourlyRate || hourlyRate <= 0) {
      errors.push('אנא הזן שכר לשעה תקין.');
    }
    if (!totalHours || totalHours <= 0) {
      errors.push('אנא הזן שעות עבודה תקינות.');
    }

    if (errors.length > 0) {
      displayErrors(errors);
      hideResult();
      return;
    }

    const result = calculateShiftPay(hourlyRate, totalHours, dayType);
    displayResult(result);
    hideErrors();
  }

  function displayResult(result: ShiftCalculationResult) {
    resultDiv.classList.remove('hidden');
    resultDiv.classList.add('fade-in');

    const totalAmountEl = resultDiv.querySelector('.total-amount')!;
    totalAmountEl.textContent = `₪${result.totalPay.toFixed(2)}`;

    const regularHoursEl = resultDiv.querySelector('.regular-hours')!;
    regularHoursEl.textContent = `${result.regularHours.toFixed(2)} שעות (₪${result.regularPay.toFixed(2)})`;

    const firstOvertimeHoursEl = resultDiv.querySelector('.first-overtime-hours')!;
    firstOvertimeHoursEl.textContent = `${result.firstOvertimeHours.toFixed(2)} שעות (₪${result.firstOvertimePay.toFixed(2)})`;

    const extraOvertimeHoursEl = resultDiv.querySelector('.extra-overtime-hours')!;
    extraOvertimeHoursEl.textContent = `${result.extraOvertimeHours.toFixed(2)} שעות (₪${result.extraOvertimePay.toFixed(2)})`;

    const totalHoursEl = resultDiv.querySelector('.total-hours')!;
    totalHoursEl.textContent = `${result.totalHours.toFixed(2)} שעות`;

    if (result.isLongShift) {
      warningDiv.classList.remove('hidden');
    } else {
      warningDiv.classList.add('hidden');
    }
  }

  function hideResult() {
    resultDiv.classList.add('hidden');
    warningDiv.classList.add('hidden');
  }

  function displayErrors(errors: string[]) {
    errorsDiv.classList.remove('hidden');
    errorsDiv.innerHTML = errors.map(error => `<p>${error}</p>`).join('');
  }

  function hideErrors() {
    errorsDiv.classList.add('hidden');
  }
}

setupCalculator();
