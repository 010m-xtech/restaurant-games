document.addEventListener('DOMContentLoaded', () => {
  // ★ここにGASのウェブアプリURLを貼り付けてください（元のURLを維持しています）
  const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycby-QMhndXONUWbP1eEN9v9d7iJJcCAnOESGe7NMwzb2X2NsVX__P7mKx7ZihA7YA1Vk/exec';

  const surveySection = document.getElementById('survey-section');
  const topSection = document.getElementById('top-section');
  const surveyForm = document.getElementById('survey-form');
  const gameCards = document.querySelectorAll('.game-card');

  const STORAGE_KEY = 'restaurant_game_user_profile';
  const DEVICE_ID_KEY = 'restaurant_game_device_id';

  // ★店舗ごとのゲームURL定義（8店舗分をここに記述します）
  // URLの `?store=000001` などの値と一致させて、店舗ごとのゲームURLをセットしてください
  const STORE_GAME_URLS = {
    "408430": {
      "ルーレット": "https://010m-xtech.github.io/restaurant-games/ROULETTE_408430",
      "あみだくじ": "https://010m-xtech.github.io/restaurant-games/amidakuji_408430",
      "クイズ": "https://010m-xtech.github.io/minigame/timeshock/",
      "占い": "https://010m-xtech.github.io/restaurant-games/uranai_408430"
    },
    "198080": {
      "ルーレット": "https://010m-xtech.github.io/restaurant-games/ROULETTE_198080",
      "あみだくじ": "https://010m-xtech.github.io/restaurant-games/amidakuji_198080",
      "クイズ": "https://010m-xtech.github.io/minigame/timeshock/",
      "占い": "https://010m-xtech.github.io/restaurant-games/uranai_198080"
    },
    "156430": {
      "ルーレット": "https://010m-xtech.github.io/restaurant-games/ROULETTE_156430",
      "あみだくじ": "https://010m-xtech.github.io/restaurant-games/amidakuji_156430",
      "クイズ": "https://010m-xtech.github.io/minigame/timeshock/",
      "占い": "https://010m-xtech.github.io/restaurant-games/uranai_156430"
    },
    "158200": {
      "ルーレット": "https://010m-xtech.github.io/restaurant-games/ROULETTE_158200",
      "あみだくじ": "https://010m-xtech.github.io/restaurant-games/amidakuji_158200",
      "クイズ": "https://010m-xtech.github.io/minigame/timeshock/",
      "占い": "https://010m-xtech.github.io/restaurant-games/uranai_158200"
    },
    "159390": {
      "ルーレット": "https://010m-xtech.github.io/restaurant-games/ROULETTE_159390",
      "あみだくじ": "https://010m-xtech.github.io/restaurant-games/amidakuji_159390",
      "クイズ": "https://010m-xtech.github.io/minigame/timeshock/",
      "占い": "https://010m-xtech.github.io/restaurant-games/uranai_159390"
    },
    "406520": {
      "ルーレット": "https://010m-xtech.github.io/restaurant-games/ROULETTE_406520",
      "あみだくじ": "https://010m-xtech.github.io/restaurant-games/amidakuji_406520",
      "クイズ": "https://010m-xtech.github.io/minigame/timeshock/",
      "占い": "https://010m-xtech.github.io/restaurant-games/uranai_406520"
    },
    "408440": {
      "ルーレット": "https://010m-xtech.github.io/restaurant-games/ROULETTE408440",
      "あみだくじ": "https://010m-xtech.github.io/restaurant-games/amidakuji_408440",
      "クイズ": "https://010m-xtech.github.io/minigame/timeshock/",
      "占い": "https://010m-xtech.github.io/restaurant-games/uranai_408440"
    },
    "002960": {
      "ルーレット": "https://010m-xtech.github.io/restaurant-games/ROULETTE_002960",
      "あみだくじ": "https://010m-xtech.github.io/restaurant-games/amidakuji_002960",
      "クイズ": "https://010m-xtech.github.io/minigame/timeshock/",
      "占い": "https://010m-xtech.github.io/restaurant-games/uranai_002960"
    },
    "026200": {
      "ルーレット": "https://010m-xtech.github.io/restaurant-games/ROULETTE_026200",
      "あみだくじ": "https://010m-xtech.github.io/restaurant-games/amidakuji_026200",
      "クイズ": "https://010m-xtech.github.io/minigame/timeshock/",
      "占い": "https://010m-xtech.github.io/restaurant-games/uranai_026200"
    },
     "026201": {
      "ルーレット": "https://010m-xtech.github.io/restaurant-games/ROULETTE_026200",
      "あみだくじ": "https://010m-xtech.github.io/restaurant-games/amidakuji_026200",
      "クイズ": "https://010m-xtech.github.io/minigame/timeshock/",
      "占い": "https://010m-xtech.github.io/restaurant-games/uranai_026200"
    },
    // ※必要に応じて 000003 〜 000008 まで同様に追加してください
  };

  // --- デバイスIDの取得または新規発行 ---
  function getDeviceId() {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = 'dev_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  }

  // --- URLパラメータから店舗名を取得する関数 ---
  function getStoreId() {
    const urlParams = new URLSearchParams(window.location.search);
    const storeParam = urlParams.get('store');

    if (storeParam) {
      // URLに店舗指定があれば保存＆利用
      localStorage.setItem('restaurant_game_store_id', storeParam);
      return storeParam;
    }
    // URLにない場合は保存されている過去の店舗名を使う（未指定の場合は 'unknown'）
    return localStorage.getItem('restaurant_game_store_id') || 'unknown';
  }

  const currentDeviceId = getDeviceId();
  const currentStoreId = getStoreId();
  const savedProfile = JSON.parse(localStorage.getItem(STORAGE_KEY));

  // --- 店舗に応じたゲームURLの動的セット関数 ---
  function setGameUrlsForCurrentStore() {
    const storeUrls = STORE_GAME_URLS[currentStoreId];
    if (storeUrls) {
      gameCards.forEach(card => {
        const title = card.getAttribute('data-title');
        if (storeUrls[title]) {
          card.setAttribute('href', storeUrls[title]);
        }
      });
    }
  }

  // 画面ロード時に店舗別URLに差し替え実行
  setGameUrlsForCurrentStore();

  // --- スプレッドシート（GAS）へ非同期送信 ---
  function sendToSheet(payload) {
    payload.deviceId = currentDeviceId;
    payload.storeId = currentStoreId; // 店舗IDを全送信データに自動付与

    fetch(GAS_WEB_APP_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(err => console.error('GAS Send Error:', err));
  }

  // =========================================================
  // 【動作確認・テスト時の切り替えエリア】
  // =========================================================
  if (savedProfile) {
    // ■ 本番用: 2回目以降はアンケートをスキップしてトップ画面へ
    showTopSection(savedProfile, true);

    // ■ テスト用: 毎回アンケートを表示したい時は、上の「showTopSection...」の頭に
    //   「//」をつけてコメントアウトしてください。
  } else {
    // 初回アクセス時：アンケート表示ログ送信
    sendToSheet({ event: 'survey_view' });
  }
  // =========================================================

  // --- アンケート送信処理 ---
  surveyForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(surveyForm);
    const userProfile = {
      gender: formData.get('gender'),
      age: formData.get('age'),
      relationship: formData.get('relationship'),
      answeredAt: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(userProfile));

    // アンケート回答ログ送信
    sendToSheet({
      event: 'survey_submit',
      gender: userProfile.gender,
      age: userProfile.age,
      relationship: userProfile.relationship
    });

    showTopSection(userProfile, false);
  });

  // --- トップ画面表示関数 ---
  function showTopSection(profile, isReturning) {
    surveySection.classList.add('hidden');
    topSection.classList.remove('hidden');

    // トップ画面表示ログ送信
    sendToSheet({
      event: 'top_view',
      gender: profile.gender,
      age: profile.age,
      relationship: profile.relationship,
      is_returning: isReturning
    });
  }

  // --- ゲームカードタップ処理 ---
  gameCards.forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();

      const gameTitle = card.getAttribute('data-title');
      const targetUrl = card.getAttribute('href'); // 店舗別に差し替わった最新URLを取得
      const profile = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

      // ゲームタップログ送信
      sendToSheet({
        event: 'game_play',
        game_name: gameTitle,
        gender: profile.gender || '',
        age: profile.age || '',
        relationship: profile.relationship || ''
      });

      // 別タブ（別ウィンドウ）でゲームを開く
      setTimeout(() => {
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
      }, 150);
    });
  });
});
