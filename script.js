const currencyCodes = [
  'AED','AFN','ALL','AMD','ANG','AOA','ARS','AUD','AWG','AZN','BAM','BBD','BDT','BGN','BHD','BIF','BMD','BND','BOB','BRL','BSD','BTN','BWP','BYN','BZD','CAD','CDF','CHF','CLP','CNY','COP','CRC','CUP','CVE','CZK','DJF','DKK','DOP','DZD','EGP','ERN','ETB','EUR','FJD','FKP','GBP','GEL','GHS','GIP','GMD','GNF','GTQ','GYD','HKD','HNL','HRK','HTG','HUF','IDR','ILS','INR','IQD','IRR','ISK','JMD','JOD','JPY','KES','KGS','KHR','KMF','KRW','KWD','KYD','KZT','LAK','LBP','LKR','LRD','LSL','LYD','MAD','MDL','MGA','MKD','MMK','MNT','MOP','MRU','MUR','MVR','MWK','MXN','MYR','MZN','NAD','NGN','NIO','NOK','NPR','NZD','OMR','PAB','PEN','PGK','PHP','PKR','PLN','PYG','QAR','RON','RSD','RUB','RWF','SAR','SBD','SCR','SDG','SEK','SGD','SHP','SLE','SLL','SOS','SRD','SSP','STN','SVC','SYP','SZL','THB','TJS','TMT','TND','TOP','TRY','TTD','TWD','TZS','UAH','UGX','USD','UYU','UZS','VES','VND','VUV','WST','XAF','XCD','XOF','XPF','YER','ZAR','ZMW','ZWL'
];

const favoritePairs = [
  ['USD', 'INR'],
  ['EUR', 'USD'],
  ['GBP', 'EUR'],
  ['JPY', 'USD'],
  ['AUD', 'USD'],
  ['SGD', 'USD']
];

const state = {
  currencies: {},
  baseCurrency: 'USD',
  targetCurrency: 'INR',
  lastUpdated: null,
  history: [],
  favorites: [...favoritePairs]
};

let isLoading = false;

function init() {
  bindEvents();
  state.theme = localStorage.getItem('currency-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', state.theme);
  updateThemeButton();
  state.history = JSON.parse(localStorage.getItem('currency-history') || '[]');
  state.favorites = JSON.parse(localStorage.getItem('currency-favorites') || 'null') || [...favoritePairs];
  populateCurrencies(getFallbackCurrencyMap());
  setSelectValues();
  renderHistory();
  renderFavorites();
  loadCurrenciesFromApi();
}

function bindEvents() {
  document.getElementById('converterForm').addEventListener('submit', handleConvert);
  document.getElementById('swapBtn').addEventListener('click', swapCurrencies);
  document.getElementById('resetBtn').addEventListener('click', resetForm);
  document.getElementById('copyBtn').addEventListener('click', copyResult);
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  document.getElementById('amount').addEventListener('input', clearValidation);
  document.getElementById('baseCurrency').addEventListener('change', () => {
    state.baseCurrency = document.getElementById('baseCurrency').value;
    clearValidation();
    autoConvertIfPossible();
  });
  document.getElementById('targetCurrency').addEventListener('change', () => {
    state.targetCurrency = document.getElementById('targetCurrency').value;
    clearValidation();
    autoConvertIfPossible();
  });
  document.getElementById('baseSearch').addEventListener('input', (event) => filterOptions(event.target, document.getElementById('baseCurrency')));
  document.getElementById('targetSearch').addEventListener('input', (event) => filterOptions(event.target, document.getElementById('targetCurrency')));
}

function getFallbackCurrencyMap() {
  const displayNames = new Intl.DisplayNames(['en'], { type: 'currency' });
  const map = {};

  currencyCodes.forEach((code) => {
    map[code] = {
      code,
      name: displayNames.of(code) || code,
      symbol: getCurrencySymbol(code),
      flag: getFlagEmoji(code)
    };
  });

  return map;
}

function populateCurrencies(currencies) {
  state.currencies = currencies;
  const baseSelect = document.getElementById('baseCurrency');
  const targetSelect = document.getElementById('targetCurrency');
  const currencyEntries = Object.entries(currencies).sort((a, b) => a[1].name.localeCompare(b[1].name));

  [baseSelect, targetSelect].forEach((select) => {
    select.innerHTML = '';
    currencyEntries.forEach(([code, meta]) => {
      const option = document.createElement('option');
      option.value = code;
      option.textContent = `${meta.flag} ${meta.name} (${code})`;
      select.appendChild(option);
    });
  });

  setSelectValues();
}

function setSelectValues() {
  const baseSelect = document.getElementById('baseCurrency');
  const targetSelect = document.getElementById('targetCurrency');
  baseSelect.value = state.baseCurrency;
  targetSelect.value = state.targetCurrency;
}

function filterOptions(input, select) {
  const query = input.value.toLowerCase();
  Array.from(select.options).forEach((option) => {
    const text = option.textContent.toLowerCase();
    option.style.display = text.includes(query) ? '' : 'none';
  });
}

function getCurrencySymbol(code) {
  const symbols = {
    USD: '$', EUR: '€', GBP: '£', JPY: '¥', INR: '₹', AUD: 'A$', CAD: 'C$', CHF: 'CHF', SGD: 'S$', AED: 'د.إ', CNY: '¥', SEK: 'kr', NOK: 'kr', DKK: 'kr', PLN: 'zł', CZK: 'Kč', HUF: 'Ft', RUB: '₽', ZAR: 'R', BRL: 'R$', MXN: '$', ARS: '$', CLP: '$', COP: '$', PEN: 'S/', UYU: '$U', TRY: '₺', HKD: 'HK$', NZD: 'NZ$', KRW: '₩', THB: '฿', MYR: 'RM', IDR: 'Rp', PHP: '₱', VND: '₫', SGD: 'S$', BDT: '৳', PKR: '₨', LKR: 'රු', NPR: 'रू', BHD: '.د.ب', KWD: 'د.ك', OMR: 'ر.ع.', QAR: 'ر.ق', SAR: 'ر.س', ILS: '₪', EGP: 'E£', NGN: '₦', KES: 'KSh', GHS: 'GH₵', MAD: 'د.م.', TND: 'د.ت', XAF: 'FCFA', XOF: 'CFA', XPF: '₣', CHF: 'CHF', AED: 'د.إ'
  };
  return symbols[code] || code;
}

function getFlagEmoji(code) {
  const countryMap = {
    USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', JPY: '🇯🇵', INR: '🇮🇳', AUD: '🇦🇺', CAD: '🇨🇦', CHF: '🇨🇭', SGD: '🇸🇬', AED: '🇦🇪', CNY: '🇨🇳', HKD: '🇭🇰', NZD: '🇳🇿', KRW: '🇰🇷', THB: '🇹🇭', MYR: '🇲🇾', IDR: '🇮🇩', PHP: '🇵🇭', VND: '🇻🇳', BDT: '🇧🇩', PKR: '🇵🇰', LKR: '🇱🇰', NPR: '🇳🇵', SEK: '🇸🇪', NOK: '🇳🇴', DKK: '🇩🇰', PLN: '🇵🇱', CZK: '🇨🇿', HUF: '🇭🇺', RUB: '🇷🇺', ZAR: '🇿🇦', BRL: '🇧🇷', MXN: '🇲🇽', ARS: '🇦🇷', CLP: '🇨🇱', COP: '🇨🇴', PEN: '🇵🇪', UYU: '🇺🇾', TRY: '🇹🇷', HKD: '🇭🇰', TWD: '🇹🇼', KWD: '🇰🇼', SAR: '🇸🇦', QAR: '🇶🇦', ILS: '🇮🇱', EGP: '🇪🇬', NGN: '🇳🇬', KES: '🇰🇪', GHS: '🇬🇭', MAD: '🇲🇦', TND: '🇹🇳', XAF: '🇨🇲', XOF: '🇸🇳', XPF: '🇵🇫'
  };
  return countryMap[code] || '💱';
}

async function loadCurrenciesFromApi() {
  try {
    const response = await fetch('https://api.frankfurter.app/currencies');
    if (!response.ok) {
      throw new Error('Unable to reach the exchange rate service.');
    }

    const payload = await response.json();
    const map = {};
    Object.entries(payload).forEach(([code, name]) => {
      map[code] = {
        code,
        name,
        symbol: getCurrencySymbol(code),
        flag: getFlagEmoji(code)
      };
    });

    populateCurrencies(map);
    setSelectValues();
  } catch (error) {
    populateCurrencies(getFallbackCurrencyMap());
    setSelectValues();
  }
}

async function handleConvert(event) {
  event.preventDefault();
  const amount = parseFloat(document.getElementById('amount').value);
  const baseCurrency = document.getElementById('baseCurrency').value;
  const targetCurrency = document.getElementById('targetCurrency').value;

  clearValidation();

  if (!validateAmount(amount)) {
    return;
  }

  if (baseCurrency === targetCurrency) {
    showValidation('Choose two different currencies to compare.', 'error');
    return;
  }

  setLoading(true);

  try {
    const rate = await fetchExchangeRate(baseCurrency, targetCurrency);
    const convertedAmount = amount * rate;
    renderConversion(amount, baseCurrency, targetCurrency, rate, convertedAmount);
    saveHistory({ amount, baseCurrency, targetCurrency, convertedAmount, rate, timestamp: new Date().toISOString() });
    renderHistory();
    showValidation(`Converted successfully using a live rate of ${rate.toFixed(4)}.`, 'success');
  } catch (error) {
    showValidation(`Unable to complete the conversion. ${error.message}`, 'error');
  } finally {
    setLoading(false);
  }
}

async function fetchExchangeRate(baseCurrency, targetCurrency) {
  const response = await fetch(`https://api.frankfurter.app/latest?from=${baseCurrency}&to=${targetCurrency}`);
  if (!response.ok) {
    throw new Error('The exchange rate service returned a network error.');
  }

  const payload = await response.json();
  const rate = payload.rates?.[targetCurrency];
  if (!rate) {
    throw new Error('The selected currencies are not supported right now.');
  }

  state.lastUpdated = payload.date || new Date().toISOString().slice(0, 10);
  return rate;
}

function validateAmount(amount) {
  if (!document.getElementById('amount').value.trim()) {
    showValidation('Please enter an amount to convert.', 'error');
    return false;
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    showValidation('The amount must be a number greater than zero.', 'error');
    return false;
  }

  return true;
}

function renderConversion(amount, baseCurrency, targetCurrency, rate, convertedAmount) {
  const baseMeta = state.currencies[baseCurrency];
  const targetMeta = state.currencies[targetCurrency];
  const formattedRate = `1 ${baseMeta?.code || baseCurrency} = ${rate.toFixed(4)} ${targetMeta?.code || targetCurrency}`;
  document.getElementById('rateDisplay').textContent = formattedRate;
  document.getElementById('rateUpdatedText').textContent = `Last updated: ${state.lastUpdated || 'now'}`;

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: targetCurrency,
    maximumFractionDigits: 2
  });

  document.getElementById('resultDisplay').textContent = `${formatter.format(convertedAmount)} (${amount} ${baseCurrency})`;
}

function setLoading(isLoadingState) {
  isLoading = isLoadingState;
  const button = document.getElementById('convertBtn');
  button.disabled = isLoadingState;
  button.textContent = isLoadingState ? 'Converting…' : 'Convert';
}

function saveHistory(entry) {
  state.history.unshift(entry);
  state.history = state.history.slice(0, 8);
  localStorage.setItem('currency-history', JSON.stringify(state.history));
}

function renderHistory() {
  const historyList = document.getElementById('historyList');
  if (!state.history.length) {
    historyList.innerHTML = '<li class="history-item">No conversions yet. Make your first conversion to see it here.</li>';
    return;
  }

  historyList.innerHTML = state.history
    .map((item) => {
      const date = new Date(item.timestamp).toLocaleString();
      const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: item.targetCurrency,
        maximumFractionDigits: 2
      });
      return `
        <li class="history-item">
          <strong>${formatter.format(item.convertedAmount)}</strong>
          <div>${item.amount} ${item.baseCurrency} → ${item.targetCurrency}</div>
          <div class="meta-line">${date}</div>
        </li>
      `;
    })
    .join('');
}

function renderFavorites() {
  const favoritesContainer = document.getElementById('favoritePairs');
  favoritesContainer.innerHTML = state.favorites
    .map(([from, to]) => `<button class="favorite-chip" type="button" data-from="${from}" data-to="${to}">${from} → ${to}</button>`)
    .join('');

  favoritesContainer.querySelectorAll('.favorite-chip').forEach((button) => {
    button.addEventListener('click', () => {
      document.getElementById('baseCurrency').value = button.dataset.from;
      document.getElementById('targetCurrency').value = button.dataset.to;
      state.baseCurrency = button.dataset.from;
      state.targetCurrency = button.dataset.to;
      autoConvertIfPossible();
    });
  });
}

function swapCurrencies() {
  const baseSelect = document.getElementById('baseCurrency');
  const targetSelect = document.getElementById('targetCurrency');
  [state.baseCurrency, state.targetCurrency] = [state.targetCurrency, state.baseCurrency];
  baseSelect.value = state.baseCurrency;
  targetSelect.value = state.targetCurrency;
  autoConvertIfPossible();
}

function resetForm() {
  document.getElementById('amount').value = '';
  document.getElementById('baseCurrency').value = 'USD';
  document.getElementById('targetCurrency').value = 'INR';
  state.baseCurrency = 'USD';
  state.targetCurrency = 'INR';
  document.getElementById('resultDisplay').textContent = '--';
  document.getElementById('rateDisplay').textContent = '--';
  document.getElementById('rateUpdatedText').textContent = 'Last updated: syncing…';
  clearValidation();
}

function copyResult() {
  const result = document.getElementById('resultDisplay').textContent;
  if (result === '--') {
    showValidation('There is no result to copy yet.', 'error');
    return;
  }

  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(result).then(() => {
      showValidation('Result copied to clipboard.', 'success');
    });
    return;
  }

  const temporaryField = document.createElement('textarea');
  temporaryField.value = result;
  document.body.appendChild(temporaryField);
  temporaryField.select();
  document.execCommand('copy');
  document.body.removeChild(temporaryField);
  showValidation('Result copied to clipboard.', 'success');
}

function toggleTheme() {
  const root = document.documentElement;
  const nextTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', nextTheme);
  localStorage.setItem('currency-theme', nextTheme);
  updateThemeButton();
}

function updateThemeButton() {
  const button = document.getElementById('themeToggle');
  button.textContent = document.documentElement.getAttribute('data-theme') === 'dark' ? '🌙' : '☀️';
}

function showValidation(message, type) {
  const validationBox = document.getElementById('validationMessage');
  validationBox.textContent = message;
  validationBox.className = `validation-message ${type}`;
}

function clearValidation() {
  const validationBox = document.getElementById('validationMessage');
  validationBox.textContent = '';
  validationBox.className = 'validation-message';
}

function autoConvertIfPossible() {
  const amount = document.getElementById('amount').value;
  if (!amount) {
    return;
  }
  handleConvert({ preventDefault() {} });
}

document.addEventListener('DOMContentLoaded', init);
