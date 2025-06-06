const apiBase = '/api';

const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const authMessage = document.getElementById('auth-message');

const authSection = document.getElementById('auth-section');
const gameSection = document.getElementById('game-section');

const userEmailSpan = document.getElementById('user-email');
const balanceSpan = document.getElementById('balance');
const totalBetSpan = document.getElementById('total-bet');
const rankSpan = document.getElementById('rank');

const betAmountInput = document.getElementById('bet-amount');
const startGameBtn = document.getElementById('start-game-btn');
const gameResultDiv = document.getElementById('game-result');

const logoutBtn = document.getElementById('logout-btn');

let authToken = null;

// ユーザー情報を取得し画面更新
async function loadUserInfo() {
  const res = await fetch(`${apiBase}/user`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  if (!res.ok) {
    logout();
    return;
  }
  const data = await res.json();
  userEmailSpan.textContent = data.email;
  balanceSpan.textContent = data.balance.toLocaleString();
  totalBetSpan.textContent = data.total_bet.toLocaleString();
  rankSpan.textContent = data.rank || 'なし';
}

// ログイン処理
async function login() {
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  if (!email || !password) {
    authMessage.textContent = 'IDとパスワードを入力してください。';
    return;
  }

  const res = await fetch(`${apiBase}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    authMessage.textContent = 'ログイン失敗。IDかパスワードが違います。';
    return;
  }
  const data = await res.json();
  authToken = data.token;
  authMessage.textContent = '';
  showGameSection();
  await loadUserInfo();
}

// 新規登録処理
async function register() {
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  if (!email || !password) {
    authMessage.textContent = 'メIDとパスワードを入力してください。';
    return;
  }

  const res = await fetch(`${apiBase}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    authMessage.textContent = '登録失敗: ' + (err.message || '不明なエラー');
    return;
  }
  authMessage.textContent = '登録成功。ログインしてください。';
}

// ゲーム開始処理
async function startGame() {
  const bet = Number(betAmountInput.value);
  if (isNaN(bet) || bet < 1000) {
    gameResultDiv.textContent = '掛け金は1000円以上を入力してください。';
    return;
  }
  gameResultDiv.textContent = 'ゲーム中...';

  const res = await fetch(`${apiBase}/game/play`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`
    },
    body: JSON.stringify({ bet }),
  });
  if (!res.ok) {
    const err = await res.json();
    gameResultDiv.textContent = 'ゲーム失敗: ' + (err.message || '不明なエラー');
    return;
  }
  const result = await res.json();

  // 勝敗と獲得額など表示
  gameResultDiv.textContent = `結果: ${result.result} / 勝ち金: ${result.win_amount.toLocaleString()} 円`;
  await loadUserInfo();
}

// ログアウト
function logout() {
  authToken = null;
  authMessage.textContent = '';
  authSection.style.display = 'block';
  gameSection.style.display = 'none';
}

// ゲームセクション表示切替
function showGameSection() {
  authSection.style.display = 'none';
  gameSection.style.display = 'block';
}

// イベントリスナー
loginBtn.addEventListener('click', login);
registerBtn.addEventListener('click', register);
startGameBtn.addEventListener('click', startGame);
logoutBtn.addEventListener('click', logout);
