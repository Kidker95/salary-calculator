(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();function e(e,t){let n=new Date(`1970-01-01T${e}:00`),r=new Date(`1970-01-01T${t}:00`);r<n&&r.setDate(r.getDate()+1);let i=(r.getTime()-n.getTime())/(1e3*60);return Math.max(0,i/60)}function t(e,t,r){let i=n(r),a=Math.min(t,8),o=Math.min(Math.max(t-8,0),2),s=Math.max(t-10,0),c=a*e*i.regular,l=o*e*i.firstOvertime,u=s*e*i.extraOvertime;return{totalHours:t,regularHours:a,firstOvertimeHours:o,extraOvertimeHours:s,regularPay:c,firstOvertimePay:l,extraOvertimePay:u,totalPay:c+l+u,isLongShift:t>12}}function n(e){switch(e){case`regular`:return{regular:1,firstOvertime:1.25,extraOvertime:1.5};case`rest`:return{regular:1.5,firstOvertime:1.75,extraOvertime:2};case`holiday`:return{regular:1.5,firstOvertime:1.75,extraOvertime:2};case`election`:return{regular:2,firstOvertime:2.5,extraOvertime:3}}}document.querySelector(`#app`).innerHTML=`
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
`;function r(){let n=document.getElementById(`calculator-form`),r=document.querySelectorAll(`input[name="input-mode"]`),i=document.getElementById(`manual-hours-group`),a=document.getElementById(`time-inputs-group`),o=document.getElementById(`result`),s=o.querySelector(`.close-modal`),c=document.getElementById(`warning`),l=document.getElementById(`errors`),u=document.getElementById(`manual-hours`),d=document.getElementById(`start-time`),f=document.getElementById(`end-time`);function p(e){let t=e===`manual`;i.classList.toggle(`hidden`,!t),a.classList.toggle(`hidden`,t),u.required=t,d.required=!t,f.required=!t}p(`manual`),r.forEach(e=>{e.addEventListener(`change`,e=>{let t=e.target;p(t.value)})}),n.addEventListener(`submit`,e=>{e.preventDefault(),m()}),s.addEventListener(`click`,()=>{g()});function m(){let n=parseFloat(document.getElementById(`hourly-rate`).value),r=document.getElementById(`day-type`).value,i=document.querySelector(`input[name="input-mode"]:checked`).value,a;if(i===`manual`)a=parseFloat(document.getElementById(`manual-hours`).value);else{let t=document.getElementById(`start-time`).value,n=document.getElementById(`end-time`).value;a=e(t,n)}let o=[];if((!n||n<=0)&&o.push(`אנא הזן שכר לשעה תקין.`),(!a||a<=0)&&o.push(`אנא הזן שעות עבודה תקינות.`),o.length>0){_(o),g();return}h(t(n,a,r)),v()}function h(e){o.classList.remove(`hidden`),o.classList.add(`fade-in`);let t=o.querySelector(`.total-amount`);t.textContent=`₪${e.totalPay.toFixed(2)}`;let n=o.querySelector(`.regular-hours`);n.textContent=`${e.regularHours.toFixed(2)} שעות (₪${e.regularPay.toFixed(2)})`;let r=o.querySelector(`.first-overtime-hours`);r.textContent=`${e.firstOvertimeHours.toFixed(2)} שעות (₪${e.firstOvertimePay.toFixed(2)})`;let i=o.querySelector(`.extra-overtime-hours`);i.textContent=`${e.extraOvertimeHours.toFixed(2)} שעות (₪${e.extraOvertimePay.toFixed(2)})`;let a=o.querySelector(`.total-hours`);a.textContent=`${e.totalHours.toFixed(2)} שעות`,e.isLongShift?c.classList.remove(`hidden`):c.classList.add(`hidden`)}function g(){o.classList.add(`hidden`),c.classList.add(`hidden`)}function _(e){l.classList.remove(`hidden`),l.innerHTML=e.map(e=>`<p>${e}</p>`).join(``)}function v(){l.classList.add(`hidden`)}}r();