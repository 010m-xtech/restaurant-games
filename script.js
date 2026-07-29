document.addEventListener('DOMContentLoaded', () => {
  const surveySection = document.getElementById('survey-section');
  const topSection = document.getElementById('top-section');
  const surveyForm = document.getElementById('survey-form');
  const gameCards = document.querySelectorAll('.game-card');

  // ローカルストレージキー
  const STORAGE_KEY = 'restaurant_game_user_profile';

  // 保存されているプロファイル（属性）を取得
  const savedProfile = JSON.parse(localStorage.getItem(STORAGE_KEY));

  if (savedProfile) {
    // 【パターンA】回答済みの場合：アンケートを非表示にしてトップ画面を表示
    showTopSection(savedProfile, true);
  } else {
    // 【パターンB】初回アクセスの場合：アンケートを表示し、表示ログを記録（未回答離脱の計算用）
    gtag('event', 'survey_view', {
      event_category: 'Engagement'
    });
  }

  // --- アンケート送信処理 ---
  surveyForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // 入力データの取得
    const formData = new FormData(surveyForm);
    const userProfile = {
      gender: formData.get('gender'),
      age: formData.get('age'),
      relationship: formData.get('relationship'),
      answeredAt: new Date().toISOString()
    };

    // localStorageに回答内容を保存
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userProfile));

    // GA4にアンケート完了イベントを送信
    gtag('event', 'survey_submit', {
      gender: userProfile.gender,
      age: userProfile.age,
      relationship: userProfile.relationship
    });

    // トップ画面の表示へ切り替え
    showTopSection(userProfile, false);
  });

  // --- トップ画面表示関数 ---
  function showTopSection(profile, isReturning) {
    surveySection.classList.add('hidden');
    topSection.classList.remove('hidden');

    // トップ画面表示ログをGA4に送信（ゲーム未プレイ離脱の計算用）
    gtag('event', 'top_view', {
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

      // GA4にゲームプレイ開始ログを送信
      gtag('event', 'game_play', {
        game_name: gameTitle,
        game_url: targetUrl,
        gender: profile.gender || 'unknown',
        age: profile.age || 'unknown',
        relationship: profile.relationship || 'unknown',
        // イベント送信後にページ遷移させるため、callbackを指定
        event_callback: () => {
          window.location.href = targetUrl;
        }
      });

      // 万が一GA4の通信が遅延した場合のセーフティ（300ms後に強制遷移）
      setTimeout(() => {
        window.location.href = targetUrl;
      }, 300);
    });
  });
});
