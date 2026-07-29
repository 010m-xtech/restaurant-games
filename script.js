document.addEventListener('DOMContentLoaded', () => {
  // ★ここにGASでデプロイした「ウェブアプリのURL」を貼り付けてください
  const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxw21MDXDHN-NZQGUjCdYNZGqJNWUCh-AwNPZYfq3HaIxDle2QaXB8cRoM8SdjHjpkl/exec';

  const surveySection = document.getElementById('survey-section');
  const topSection = document.getElementById('top-section');
  const surveyForm = document.getElementById('survey-form');
  const gameCards = document.querySelectorAll('.game-card');

  const STORAGE_KEY = 'restaurant_game_user_profile';
  const savedProfile = JSON.parse(localStorage.getItem(STORAGE_KEY));

  // --- スプレッドシート（GAS）へ非同期で送信する共通関数 ---
  function sendToSheet(payload) {
    // 画面の動きを邪魔しないようバックグラウンドで送信
    fetch(GAS_WEB_APP_URL, {
      method: 'POST',
      mode: 'no-cors', // クロスドメインエラー回避
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
    // 初回アクセス時：アンケート表示ログをスプレッドシートに送信
    sendToSheet({ event: 'survey_view' });
  }
  // ========================================================

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

    // スプレッドシートにアンケート回答ログを送信
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

    // スプレッドシートにトップ画面表示ログを送信（ゲーム未プレイ離脱の計算用）
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
      const targetUrl = card.getAttribute('href');
      const profile = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

      // スプレッドシートにゲームタップログを送信
      sendToSheet({
        event: 'game_play',
        game_name: gameTitle,
        gender: profile.gender || '',
        age: profile.age || '',
        relationship: profile.relationship || ''
      });

      // ログ送信と同時にスムーズにゲーム画面へ遷移させる
      setTimeout(() => {
        window.location.href = targetUrl;
      }, 150);
    });
  });
});
