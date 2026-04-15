/**
 * 游导旅游 - 国际化 (i18n) 系统 v2.0
 * 支持: 中文、英语、日语、韩语、法语、德语、西班牙语、俄语
 * 用户偏好自动保存到 localStorage
 */

// 语言配置
const I18N_CONFIG = {
  defaultLang: 'zh',           // 默认语言
  storageKey: 'youdao_lang',   // localStorage key
  supportedLangs: ['zh', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru'], // 支持的语言
  langNames: {
    zh: '中文',
    en: 'English',
    ja: '日本語',
    ko: '한국어',
    fr: 'Français',
    de: 'Deutsch',
    es: 'Español',
    ru: 'Русский'
  }
};

// 翻译数据
const translations = {
  // ===== 导航栏 =====
  nav: {
    home: { zh: '首页', en: 'Home', ja: 'ホーム', ko: '홈' },
    guides: { zh: '找导游', en: 'Find Guides', ja: 'ガイドを探す', ko: '가이드 찾기' },
    visa: { zh: '签证中心', en: 'Visa Center', ja: 'ビザセンター', ko: '비자 센터' },
    routes: { zh: '线路', en: 'Routes', ja: 'ルート', ko: '라우트' },
    knowledge: { zh: '知识', en: 'Knowledge', ja: '知識', ko: '지식' },
    guideContent: { zh: '攻略', en: 'Guide', ja: 'ガイド', ko: '가이드' },
    tools: { zh: '工具', en: 'Tools', ja: 'ツール', ko: '도구' },
    about: { zh: '关于我们', en: 'About Us', ja: '会社概要', ko: '회사 소개' },
    contact: { zh: '咨询', en: 'Contact', ja: 'お問い合わせ', ko: '문의' },
    login: { zh: '登录', en: 'Login', ja: 'ログイン', ko: '로그인' },
    register: { zh: '注册', en: 'Register', ja: '登録', ko: '회원가입' },
    search: { zh: '搜索', en: 'Search', ja: '検索', ko: '검색' },
    userCenter: { zh: '用户中心', en: 'User Center', ja: 'ユーザーセンター', ko: '마이페이지' },
    guideDashboard: { zh: '导游工作台', en: 'Guide Dashboard', ja: 'ガイドダッシュボード', ko: '가이드 대시보드' },
    logout: { zh: '退出', en: 'Logout', ja: 'ログアウト', ko: '로그아웃' }
  },

  // ===== 首页 Hero 区域 =====
  hero: {
    tagline: { zh: '旅行从此不同', en: 'Travel Differently', ja: '旅行はここに変わる', ko: '여행이 여기서 달라집니다' },
    title: { zh: '探索世界，从这里开始', en: 'Explore the World, Start Here', ja: '世界を探索、ここから始めよう', ko: '세계를 탐험, 여기서 시작하세요' },
    subtitle: { zh: '连接优秀导游与旅行者，让每一次出发都充满期待', en: 'Connect with expert guides and travelers for unforgettable journeys', ja: '優れたガイドと旅行者を繋ぎ、特別な旅を実現', ko: ' 우수한 가이드와 여행자를 연결하여 잊지 못할 여행을 만들어 드립니다' },
    forTourist: { zh: '开启旅程', en: 'Start Your Journey', ja: '旅を始める', ko: '여행 시작하기' },
    forTouristDesc: { zh: '发现专属导游', en: 'Find Your Perfect Guide', ja: 'あなたにだけのガイドを見つける', ko: '나만의 가이드를 찾으세요' },
    forGuide: { zh: '成为导游', en: 'Become a Guide', ja: 'ガイドになる', ko: '가이드가 되기' },
    forGuideDesc: { zh: '开启事业新篇章', en: 'Start Your New Career', ja: '新しいキャリアを始める', ko: '새로운 커리어 시작하기' },
    searchPlaceholder: { zh: '搜索目的地、导游、线路...', en: 'Search destinations, guides, routes...', ja: '目的地、ガイド、ルートを検索...', ko: '목적지, 가이드, 라우트 검색...' },
    searchBtn: { zh: '搜索', en: 'Search', ja: '検索', ko: '검색' },
    hotSearch: { zh: '热门搜索:', en: 'Hot Searches:', ja: '人気の検索:', ko: '인기 검색:' }
  },

  // ===== 首页 - 热门目的地 =====
  destinations: {
    title: { zh: '🌏 热门目的地', en: '🌏 Popular Destinations', ja: '🌏 人気の目的地', ko: '🌏 인기 여행지' },
    subtitle: { zh: '发现全球最受欢迎的旅行目的地，开启你的下一段旅程', en: 'Discover the world\'s most popular travel destinations', ja: '世界で最も人気の旅行先を発見しよう', ko: '세계에서 가장 인기 있는 여행지를 발견하세요' },
    viewAll: { zh: '查看全部 →', en: 'View All →', ja: 'すべて見る →', ko: '전체 보기 →' },
    japan: { zh: '日本', en: 'Japan', ja: '日本', ko: '일본' },
    japanDesc: { zh: '樱花温泉 · 和风文化', en: 'Cherry Blossoms · Japanese Culture', ja: '桜・温泉・和食文化', ko: '벚꽃 · 온천 · 일본 문화' },
    thailand: { zh: '泰国', en: 'Thailand', ja: 'タイ', ko: '태국' },
    thailandDesc: { zh: '佛寺美食', en: 'Temples & Cuisine', ja: '寺院とグルメ', ko: '사원과 미식' },
    europe: { zh: '欧洲', en: 'Europe', ja: 'ヨーロッパ', ko: '유럽' },
    europeDesc: { zh: '古堡艺术', en: 'Castles & Art', ja: '城と芸術', ko: '성곽과 예술' },
    australia: { zh: '澳新', en: 'Australia & NZ', ja: 'オーストラリア・NZ', ko: '호주 · 뉴질랜드' },
    australiaDesc: { zh: '自然冰川', en: 'Nature & Glaciers', ja: '自然・氷河', ko: '자연 · 빙하' },
    southeast: { zh: '东南亚', en: 'Southeast Asia', ja: '東南アジア', ko: '동남아시아' },
    southeastDesc: { zh: '海岛度假', en: 'Island Getaways', ja: '島のバカンス', ko: '섬 휴양지' },
    guides: { zh: '位导游', en: ' Guides', ja: '人のガイド', ko: '명의 가이드' }
  },

  // ===== 首页 - 为什么选择我们 =====
  whyUs: {
    title: { zh: '✨ 为什么选择游导', en: '✨ Why Choose YouDao', ja: '✨ なぜユーダオを選ぶのか', ko: '✨ 왜 유도를 선택할까' },
    subtitle: { zh: '专业、可信赖的旅行伙伴，让你的旅程更精彩', en: 'Your professional and trusted travel partner', ja: '旅の信頼できるパートナー', ko: '당신의 전문적이고 신뢰할 수 있는 여행 파트너' },
    selectGuides: { zh: '严选导游', en: 'Vetted Guides', ja: '厳選されたガイド', ko: '엄선된 가이드' },
    selectGuidesDesc: { zh: '所有导游经过专业认证审核，确保服务品质', en: 'All guides are professionally certified for quality service', ja: 'すべてのガイドが資格審査済み、サービスを提供', ko: '모든 가이드는 전문 자격증을 소지하고 있습니다' },
    safe: { zh: '安全保障', en: 'Safe & Secure', ja: '安全な保障', ko: '안전 보장' },
    safeDesc: { zh: '完善的评价体系，旅行更安心', en: 'Comprehensive review system for peace of mind', ja: '評価システムで旅行を安心して楽しめる', ko: '완벽한 리뷰 시스템으로 안심하고 여행하세요' },
    efficient: { zh: '高效匹配', en: 'Smart Matching', ja: 'スマートマッチング', ko: '스마트 매칭' },
    efficientDesc: { zh: '智能推荐系统，快速找到合适的导游', en: 'AI-powered matching to find the perfect guide', ja: 'AI搭載であなたに最適なガイドを提案', ko: 'AI 기반 매칭으로 최적의 가이드를 찾아드립니다' },
    value: { zh: '超值的优惠', en: 'Best Value', ja: ' 최고의 가성비', ko: '최고의 가성비' },
    valueDesc: { zh: '透明定价，无隐形费用', en: 'Transparent pricing, no hidden fees', ja: '透明な料金設定、隠れ費用なし', ko: '투명한 가격, 숨은 비용 없음' }
  },

  // ===== 导游列表页 =====
  guides: {
    title: { zh: '找到合适的导游', en: 'Find Your Perfect Guide', ja: 'あなたに合ったガイドを探す', ko: '나만의 완벽한 가이드 찾기' },
    subtitle: { zh: '专业认证导游，为你定制专属旅程', en: 'Certified professional guides for your custom journey', ja: '認定プロガイドがあなたに最適な旅を提案', ko: '자격을 갖춘 전문 가이드가 맞춤 여정을 제공합니다' },
    searchPlaceholder: { zh: '搜索导游姓名或擅长领域...', en: 'Search by name or specialty...', ja: '名前や専門分野で検索...', ko: '이름이나 전문 분야로 검색...' },
    searchBtn: { zh: '搜索', en: 'Search', ja: '検索', ko: '검색' },
    filterRegion: { zh: '地区', en: 'Region', ja: '地域', ko: '지역' },
    filterLanguage: { zh: '语言', en: 'Language', ja: '言語', ko: '언어' },
    filterSpecialty: { zh: '特长', en: 'Specialty', ja: '専門', ko: '전문' },
    filterAll: { zh: '全部', en: 'All', ja: 'すべて', ko: '전체' },
    resultCount: { zh: '共找到', en: 'Found', ja: ' 件見つかりました', ko: '총' },
    resultGuides: { zh: '位导游', en: ' guides', ja: '人のガイド', ko: '명의 가이드' },
    rating: { zh: '评分', en: 'Rating', ja: '評価', ko: '평점' },
    reviews: { zh: '条评价', en: ' reviews', ja: '件のレビュー', ko: '개의 리뷰' },
    price: { zh: '元/天', en: '/day', ja: '元/日', ko: '위안/일' },
    contactBtn: { zh: '立即咨询', en: 'Contact Now', ja: '今すぐ問い合わせる', ko: '지금 문의하기' },
    viewProfile: { zh: '查看详情', en: 'View Profile', ja: 'プロフィールを見る', ko: '프로필 보기' }
  },

  // ===== 登录页面 =====
  login: {
    title: { zh: '登录', en: 'Login', ja: 'ログイン', ko: '로그인' },
    touristTab: { zh: '我是游客', en: 'I\'m a Tourist', ja: '旅行者', ko: '여행자' },
    guideTab: { zh: '我是导游', en: 'I\'m a Guide', ja: 'ガイド', ko: '가이드' },
    email: { zh: '邮箱', en: 'Email', ja: 'メール', ko: '이메일' },
    emailPlaceholder: { zh: '请输入邮箱', en: 'Enter your email', ja: 'メールアドレスを入力', ko: '이메일을 입력하세요' },
    password: { zh: '密码', en: 'Password', ja: 'パスワード', ko: '비밀번호' },
    passwordPlaceholder: { zh: '请输入密码', en: 'Enter your password', ja: 'パスワードを入力', ko: '비밀번호를 입력하세요' },
    forgotPassword: { zh: '忘记密码？', en: 'Forgot Password?', ja: 'パスワードをお忘れですか？', ko: '비밀번호를 잊으셨나요?' },
    loginBtn: { zh: '登录', en: 'Login', ja: 'ログイン', ko: '로그인' },
    noAccount: { zh: '还没有账号？', en: 'Don\'t have an account?', ja: 'アカウントをお持ちでない方？', ko: '계정이 없으신가요?' },
    goRegister: { zh: '立即注册 →', en: 'Register Now →', ja: '新規登録 →', ko: '회원가입 →' },
    orContinue: { zh: '或使用以下方式继续', en: 'Or continue with', ja: 'または以下方法で続ける', ko: '또는 다음 방법으로 계속' },
    wechatLogin: { zh: '微信登录', en: 'WeChat', ja: '微信でログイン', ko: '위챗 로그인' },
    phoneLogin: { zh: '手机号登录', en: 'Phone Login', ja: '電話番号でログイン', ko: '휴대폰 번호 로그인' },
    rememberMe: { zh: '记住我', en: 'Remember me', ja: 'ログイン状態を保持', ko: '로그인 상태 유지' },
    subtitle: { zh: '开启你的精彩旅程', en: 'Start your wonderful journey', ja: '素晴らしい旅を始めましょう', ko: '精彩的인 여정을 시작하세요' }
  },

  // ===== 注册页面 =====
  register: {
    title: { zh: '注册', en: 'Register', ja: '新規登録', ko: '회원가입' },
    touristTitle: { zh: '游客注册', en: 'Tourist Registration', ja: '旅行者登録', ko: '여행자 회원가입' },
    guideTitle: { zh: '导游注册', en: 'Guide Registration', ja: 'ガイド登録', ko: '가이드 회원가입' },
    touristTab: { zh: '我是游客', en: 'I\'m a Tourist', ja: '旅行者', ko: '여행자' },
    guideTab: { zh: '我是导游', en: 'I\'m a Guide', ja: 'ガイド', ko: '가이드' },
    touristSubtitle: { zh: '开启你的精彩旅程', en: 'Start your wonderful journey', ja: '素晴らしい旅を始めましょう', ko: '精彩的인 여정을 시작하세요' },
    email: { zh: '邮箱', en: 'Email', ja: 'メール', ko: '이메일' },
    emailPlaceholder: { zh: '请输入邮箱', en: 'Enter your email', ja: 'メールアドレスを入力', ko: '이메일을 입력하세요' },
    password: { zh: '设置密码', en: 'Set Password', ja: 'パスワード設定', ko: '비밀번호 설정' },
    passwordPlaceholder: { zh: '请设置密码', en: 'Create a password', ja: 'パスワードを作成', ko: '비밀번호를 만드세요' },
    confirmPassword: { zh: '确认密码', en: 'Confirm Password', ja: 'パスワード確認', ko: '비밀번호 확인' },
    confirmPlaceholder: { zh: '请再次输入密码', en: 'Confirm your password', ja: 'パスワードを再入力', ko: '비밀번호를 다시 입력하세요' },
    phone: { zh: '手机号', en: 'Phone', ja: '電話番号', ko: '휴대폰 번호' },
    phonePlaceholder: { zh: '请输入手机号', en: 'Enter your phone number', ja: '電話番号を入力', ko: '휴대폰 번호를 입력하세요' },
    verifyCode: { zh: '验证码', en: 'Verification Code', ja: '確認コード', ko: '인증번호' },
    verifyPlaceholder: { zh: '请输入验证码', en: 'Enter code', ja: 'コードを入力', ko: '인증번호를 입력하세요' },
    sendCode: { zh: '发送验证码', en: 'Send Code', ja: 'コード送信', ko: '인증번호 발송' },
    registerBtn: { zh: '注册', en: 'Register', ja: '登録', ko: '회원가입' },
    hasAccount: { zh: '已有账号？', en: 'Already have an account?', ja: 'アカウントをお持ちですか？', ko: '이미 계정이 있으신가요?' },
    goLogin: { zh: '立即登录 →', en: 'Login Now →', ja: 'ログイン →', ko: '로그인 →' },
    agreeTerms: { zh: '我已阅读并同意', en: 'I agree to the', ja: '利用規約に同意します', ko: '이용약관에 동의합니다' },
    terms: { zh: '《用户协议》', en: 'Terms of Service', ja: '利用規約', ko: '이용약관' },
    privacy: { zh: '《隐私政策》', en: 'Privacy Policy', ja: 'プライバシーポリシー', ko: '개인정보 처리방침' },
    orContinue: { zh: '或使用以下方式注册', en: 'Or register with', ja: 'または以下方法で登録', ko: '또는 다음 방법으로 회원가입' }
  },

  // ===== 通用按钮和标签 =====
  common: {
    submit: { zh: '提交', en: 'Submit', ja: '送信', ko: '제출' },
    cancel: { zh: '取消', en: 'Cancel', ja: 'キャンセル', ko: '취소' },
    confirm: { zh: '确认', en: 'Confirm', ja: '確認', ko: '확인' },
    save: { zh: '保存', en: 'Save', ja: '保存', ko: '저장' },
    edit: { zh: '编辑', en: 'Edit', ja: '編集', ko: '편집' },
    delete: { zh: '删除', en: 'Delete', ja: '削除', ko: '삭제' },
    back: { zh: '返回', en: 'Back', ja: '戻る', ko: '뒤로' },
    next: { zh: '下一步', en: 'Next', ja: '次へ', ko: '다음' },
    prev: { zh: '上一步', en: 'Previous', ja: '前へ', ko: '이전' },
    loading: { zh: '加载中...', en: 'Loading...', ja: '読み込み中...', ko: '로딩 중...' },
    noData: { zh: '暂无数据', en: 'No Data', ja: 'データがありません', ko: '데이터가 없습니다' },
    success: { zh: '操作成功', en: 'Success', ja: '成功しました', ko: '성공했습니다' },
    error: { zh: '操作失败', en: 'Error', ja: 'エラーが発生しました', ko: '오류가 발생했습니다' },
    warning: { zh: '警告', en: 'Warning', ja: '警告', ko: '경고' },
    required: { zh: '必填', en: 'Required', ja: '必須', ko: '필수' },
    optional: { zh: '选填', en: 'Optional', ja: '任意', ko: '선택' }
  },

  // ===== 页脚 =====
  footer: {
    about: { zh: '关于我们', en: 'About Us', ja: '会社概要', ko: '회사 소개' },
    contact: { zh: '联系我们', en: 'Contact Us', ja: 'お問い合わせ', ko: '문의하기' },
    service: { zh: '服务条款', en: 'Terms of Service', ja: '利用規約', ko: '이용약관' },
    privacy: { zh: '隐私政策', en: 'Privacy Policy', ja: 'プライバシーポリシー', ko: '개인정보 처리방침' },
    help: { zh: '帮助中心', en: 'Help Center', ja: 'ヘルプセンター', ko: '고객센터' },
    copyright: { zh: '© 2024 游导旅游 版权所有', en: '© 2024 YouDao Travel. All rights reserved.', ja: '© 2024 YouDao Travel. 全著作権所有。', ko: '© 2024 유도 여행. 모든 권리 보유.' },
    ICP: { zh: '备案号', en: 'ICP', ja: 'ICP', ko: 'ICP' }
  },

  // ===== 目的地页面 =====
  destinationsPage: {
    title: { zh: '探索目的地', en: 'Explore Destinations', ja: '目的地を探索する', ko: '목적지 탐험' },
    subtitle: { zh: '发现世界各地的精彩旅行体验', en: 'Discover amazing travel experiences around the world', ja: '世界中の素晴らしい旅行体験を発見', ko: '전 세계의 놀라운 여행 경험을 발견하세요' },
    asia: { zh: '亚洲', en: 'Asia', ja: 'アジア', ko: '아시아' },
    europe: { zh: '欧洲', en: 'Europe', ja: 'ヨーロッパ', ko: '유럽' },
    americas: { zh: '美洲', en: 'Americas', ja: 'アメリカ', ko: '아메리카' },
    oceania: { zh: '大洋洲', en: 'Oceania', ja: 'オセアニア', ko: '오세아니아' },
    africa: { zh: '非洲', en: 'Africa', ja: 'アフリカ', ko: '아프리카' }
  },

  // ===== 线路页面 =====
  routesPage: {
    title: { zh: '精选路线', en: 'Curated Routes', ja: '厳選ルート', ko: '精选 라우트' },
    subtitle: { zh: '专业规划，带你玩转目的地', en: 'Professionally planned routes to explore destinations', ja: 'プロが企画したルートで目的地を楽しむ', ko: '전문가가策划한 라우트로 목적지를 즐기세요' },
    days: { zh: '天', en: 'days', ja: '日間', ko: '일' },
    priceFrom: { zh: '起', en: 'from', ja: 'から', ko: '부터' },
    bookNow: { zh: '立即预订', en: 'Book Now', ja: '今すぐ予約', ko: '지금 예약' }
  },

  // ===== 签证页面 =====
  visaPage: {
    title: { zh: '签证中心', en: 'Visa Center', ja: 'ビザセンター', ko: '비자 센터' },
    subtitle: { zh: '轻松了解各国签证政策', en: 'Easily understand visa policies for all countries', ja: '各国のビザ政策を簡単理解', ko: '각국의 비자 정책을 쉽게 알아보세요' },
    required: { zh: '所需材料', en: 'Required Documents', ja: '必要書類', ko: '필요 서류' },
    processingTime: { zh: '办理时间', en: 'Processing Time', ja: '処理時間', ko: '처리 시간' },
    visaFee: { zh: '签证费用', en: 'Visa Fee', ja: 'ビザ料金', ko: '비자 비용' }
  },

  // ===== 工具页面 =====
  toolsPage: {
    title: { zh: '旅行工具箱', en: 'Travel Tools', ja: '旅行ツール', ko: '여행 도구' },
    subtitle: { zh: '让你的旅行更便捷', en: 'Make your travel more convenient', ja: '旅行をもっと便利に', ko: '여행をより 편리하게' },
    currency: { zh: '汇率换算', en: 'Currency Converter', ja: '通貨換算', ko: '환율 계산' },
    budget: { zh: '预算规划', en: 'Budget Planner', ja: '予算計画', ko: '예산 계획' },
    packing: { zh: '行李清单', en: 'Packing List', ja: '持ち物リスト', ko: '짐 싸기 리스트' }
  },

  // ===== 知识页面 =====
  knowledgePage: {
    title: { zh: '旅行知识', en: 'Travel Knowledge', ja: '旅行の知識', ko: '여행 지식' },
    subtitle: { zh: '获取实用旅行技巧和建议', en: 'Get practical travel tips and advice', ja: '実践的な旅行のヒントとアドバイス', ko: '실용적인 여행 팁과 조언을 얻으세요' },
    categories: { zh: '分类', en: 'Categories', ja: 'カテゴリー', ko: '카테고리' },
    articles: { zh: '文章', en: 'Articles', ja: '記事', ko: '기사' }
  },

  // ===== 关于页面 =====
  aboutPage: {
    title: { zh: '关于游导', en: 'About YouDao', ja: 'ユーダオについて', ko: '유도 소개' },
    subtitle: { zh: '连接旅行者与专业导游的平台', en: 'A platform connecting travelers with professional guides', ja: '旅行者とプロガイドを繋ぐプラットフォーム', ko: '여행자와 전문 가이드를 연결하는 플랫폼' },
    mission: { zh: '我们的使命', en: 'Our Mission', ja: '私たちの使命', ko: '우리의 사명' },
    team: { zh: '团队介绍', en: 'Our Team', ja: 'チーム紹介', ko: '팀 소개' }
  },

  // ===== 错误页面 =====
  errors: {
    notFound: { zh: '页面未找到', en: 'Page Not Found', ja: 'ページが見つかりません', ko: '페이지를 찾을 수 없습니다' },
    serverError: { zh: '服务器错误', en: 'Server Error', ja: 'サーバーエラー', ko: '서버 오류' },
    goHome: { zh: '返回首页', en: 'Go Home', ja: 'ホームに戻る', ko: '홈으로 가기' },
    tryAgain: { zh: '请稍后重试', en: 'Please try again later', ja: '後でもう一度お試しください', ko: '나중에 다시 시도해 주세요' }
  },

  // ===== 导游详情页 =====
  guideDetail: {
    specialties: { zh: '擅长领域', en: 'Specialties', ja: '得意分野', ko: '전문 분야' },
    languages: { zh: '语言能力', en: 'Languages', ja: '言語能力', ko: '언어 능력' },
    experience: { zh: '从业经验', en: 'Experience', ja: '経験', ko: '경력' },
    certifications: { zh: '资质认证', en: 'Certifications', ja: '資格', ko: '자격' },
    reviews: { zh: '用户评价', en: 'Reviews', ja: 'レビュー', ko: '리뷰' },
    availability: { zh: '可预约时间', en: 'Availability', ja: '予約可能時間', ko: '예약 가능 시간' },
    bookGuide: { zh: '预约导游', en: 'Book Guide', ja: 'ガイドを予約', ko: '가이드 예약' }
  },

  // ===== 预订流程 =====
  booking: {
    selectDate: { zh: '选择日期', en: 'Select Date', ja: '日付を選択', ko: '날짜 선택' },
    selectTime: { zh: '选择时间', en: 'Select Time', ja: '時間を選択', ko: '시간 선택' },
    numberOfPeople: { zh: '人数', en: 'Number of People', ja: '人数', ko: '인원' },
    totalPrice: { zh: '总价', en: 'Total Price', ja: '合計金額', ko: '총 가격' },
    confirmBooking: { zh: '确认预订', en: 'Confirm Booking', ja: '予約確認', ko: '예약 확인' },
    bookingSuccess: { zh: '预订成功', en: 'Booking Successful', ja: '予約完了', ko: '예약 성공' },
    bookingFailed: { zh: '预订失败', en: 'Booking Failed', ja: '予約に失敗しました', ko: '예약 실패' }
  },

  // ===== 通知消息 =====
  notifications: {
    welcome: { zh: '欢迎回来', en: 'Welcome back', ja: 'おかえりなさい', ko: '다시 오신 것을 환영합니다' },
    logoutSuccess: { zh: '已安全退出', en: 'Logged out successfully', ja: 'ログアウトしました', ko: '로그아웃되었습니다' },
    saveSuccess: { zh: '保存成功', en: 'Saved successfully', ja: '保存しました', ko: '저장되었습니다' },
    deleteConfirm: { zh: '确定要删除吗？', en: 'Are you sure you want to delete?', ja: '削除してもよろしいですか？', ko: '정말 삭제하시겠습니까?' }
  },

  // ===== 页脚扩展 =====
  footer: {
    about: { zh: '关于我们', en: 'About Us', ja: '会社概要', ko: '회사 소개' },
    contact: { zh: '联系我们', en: 'Contact Us', ja: 'お問い合わせ', ko: '문의하기' },
    service: { zh: '服务条款', en: 'Terms of Service', ja: '利用規約', ko: '이용약관' },
    privacy: { zh: '隐私政策', en: 'Privacy Policy', ja: 'プライバシーポリシー', ko: '개인정보 처리방침' },
    help: { zh: '帮助中心', en: 'Help Center', ja: 'ヘルプセンター', ko: '고객센터' },
    copyright: { zh: '© 2024 游导旅游 版权所有', en: '© 2024 YouDao Travel. All rights reserved.', ja: '© 2024 YouDao Travel. 全著作権所有。', ko: '© 2024 유도 여행. 모든 권리 보유.' },
    ICP: { zh: '备案号', en: 'ICP', ja: 'ICP', ko: 'ICP' },
    // 页脚详情页
    brandDesc: { zh: '专业的导游与游客一站式旅行平台<br>让旅行更简单，让体验更美好', en: 'Your one-stop travel platform<br>Simplifying travel, enhancing experiences', ja: 'ガイドと旅行者于一站式旅行プラットフォーム<br>旅行をよりシンプルに', ko: '가이드와 여행자를 위한 원스톱 여행 플랫폼<br>여행은 더 간단하게, 경험은 더 풍요롭게' },
    quickLinks: { zh: '快速链接', en: 'Quick Links', ja: 'クイックリンク', ko: '빠른 링크' },
    helpCenter: { zh: '帮助中心', en: 'Help Center', ja: 'ヘルプセンター', ko: '고객센터' },
    tools: { zh: '实用工具', en: 'Useful Tools', ja: '便利ツール', ko: '유용한 도구' },
    moreTools: { zh: '更多工具', en: 'More Tools', ja: 'その他のツール', ko: '더 많은 도구' },
    contactUs: { zh: '联系我们', en: 'Contact Us', ja: 'お問い合わせ', ko: '문의하기' },
    phone: { zh: '📞 400-888-8888', en: '📞 400-888-8888', ja: '📞 400-888-8888', ko: '📞 400-888-8888' },
    email: { zh: '📧 support@youdautravel.com', en: '📧 support@youdautravel.com', ja: '📧 support@youdautravel.com', ko: '📧 support@youdautravel.com' },
    workTime: { zh: '🕐 工作时间: 9:00-21:00', en: '🕐 Hours: 9:00-21:00', ja: '🕐 営業時間: 9:00-21:00', ko: '🕐 업무시간: 9:00-21:00' },
    disclaimer: { zh: '免责声明', en: 'Disclaimer', ja: '免責事項', ko: '면책 조항' },
    faq: { zh: '常见问题', en: 'FAQ', ja: 'よくある質問', ko: 'FAQ' },
    becomeGuide: { zh: '导游入驻', en: 'Become a Guide', ja: 'ガイドになる', ko: '가이드 지원' },
    activities: { zh: '🎯 活动中心', en: '🎯 Activities', ja: '🎯 アクティビティ', ko: '🎯 이벤트' }
  },

  // ===== 社交媒体标题 =====
  social: {
    wechat: { zh: '微信公众号', en: 'WeChat', ja: '微信公式アカウント', ko: '위챗 공식 계정' },
    weibo: { zh: '微博', en: 'Weibo', ja: '微博', ko: '웨이보' },
    xiaohongshu: { zh: '小红书', en: 'Xiaohongshu', ja: '小红書', ko: '샤오훙슈' }
  },

  // ===== 工具页面 =====
  tools: {
    weather: { zh: '天气预报', en: 'Weather Forecast', ja: '天気予報', ko: '날씨 예보' },
    exchange: { zh: '汇率换算', en: 'Currency Exchange', ja: '通貨換算', ko: '환율 계산' },
    worldClock: { zh: '世界时钟', en: 'World Clock', ja: '世界時計', ko: '세계 시계' }
  }
};

// i18n 核心类
class I18n {
  constructor() {
    this.currentLang = this.getStoredLang();
    this.isTransitioning = false;
  }

  // 获取存储的语言
  getStoredLang() {
    const stored = localStorage.getItem(I18N_CONFIG.storageKey);
    if (stored && I18N_CONFIG.supportedLangs.includes(stored)) {
      return stored;
    }
    // 检测浏览器语言
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('en')) {
      return 'en';
    } else if (browserLang.startsWith('ja')) {
      return 'ja';
    } else if (browserLang.startsWith('ko')) {
      return 'ko';
    }
    return I18N_CONFIG.defaultLang;
  }

  // 保存语言偏好
  setLang(lang, withAnimation = true) {
    if (!I18N_CONFIG.supportedLangs.includes(lang)) {
      console.warn(`Language '${lang}' is not supported`);
      return;
    }
    
    if (lang === this.currentLang) return;

    // 添加切换动画
    if (withAnimation) {
      this.animateTransition(() => {
        this.applyLanguageChange(lang);
      });
    } else {
      this.applyLanguageChange(lang);
    }
  }

  // 应用语言变化
  applyLanguageChange(lang) {
    this.currentLang = lang;
    localStorage.setItem(I18N_CONFIG.storageKey, lang);
    this.updatePage();
    this.updateLangButtons();
    // 触发语言切换事件
    window.dispatchEvent(new CustomEvent('langChange', { detail: { lang } }));
  }

  // 语言切换动画
  animateTransition(callback) {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    const overlay = document.createElement('div');
    overlay.id = 'i18n-transition-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.95);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s ease-in-out;
      pointer-events: none;
    `;
    
    // 添加加载指示器
    const loader = document.createElement('div');
    loader.innerHTML = `
      <style>
        .i18n-loader {
          display: flex;
          gap: 6px;
        }
        .i18n-loader span {
          width: 8px;
          height: 8px;
          background: #f97316;
          border-radius: 50%;
          animation: i18n-pulse 1s ease-in-out infinite;
        }
        .i18n-loader span:nth-child(2) { animation-delay: 0.15s; }
        .i18n-loader span:nth-child(3) { animation-delay: 0.3s; }
        @keyframes i18n-pulse {
          0%, 100% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 1; }
        }
      </style>
      <div class="i18n-loader">
        <span></span>
        <span></span>
        <span></span>
      </div>
    `;
    overlay.appendChild(loader);
    document.body.appendChild(overlay);

    // 淡入动画
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
    });

    // 短暂延迟后执行回调
    setTimeout(() => {
      callback();
      
      // 淡出动画
      setTimeout(() => {
        overlay.style.opacity = '0';
        setTimeout(() => {
          overlay.remove();
          this.isTransitioning = false;
        }, 200);
      }, 100);
    }, 200);
  }

  // 获取翻译
  t(key) {
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      if (value && value[k]) {
        value = value[k];
      } else {
        console.warn(`Translation not found: ${key}`);
        return key;
      }
    }
    
    if (value && value[this.currentLang]) {
      return value[this.currentLang];
    }
    
    // 尝试返回中文默认值
    if (value && value.zh) {
      return value.zh;
    }
    
    return key;
  }

  // 更新页面所有标记了 data-i18n 的元素
  updatePage() {
    // 更新文本内容
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = this.t(key);
    });

    // 更新 placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.placeholder = this.t(key);
    });

    // 更新 title
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      el.title = this.t(key);
    });

    // 更新 html 内容（支持 HTML）
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      el.innerHTML = this.t(key);
    });

    // 更新文档标题
    const titleEl = document.querySelector('[data-i18n-doc-title]');
    if (titleEl) {
      document.title = this.t('titleEl');
    }

    // 更新 html lang 属性
    const langMap = { zh: 'zh-CN', en: 'en-US', ja: 'ja-JP', ko: 'ko-KR' };
    document.documentElement.lang = langMap[this.currentLang] || 'zh-CN';

    // 更新 SEO meta 标签
    this.updateMetaTags();
  }

  // 更新 meta 标签以支持 SEO
  updateMetaTags() {
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    const metaDescription = document.querySelector('meta[name="description"]');
    
    if (metaKeywords) {
      const langKeywords = {
        zh: '游导,旅游,导游,旅行,自由行,定制游',
        en: 'YouDao, travel, guide, tour, custom trip',
        ja: 'ユーダオ、旅行、ガイド、ツアー、(custom)',
        ko: '유도, 여행, 가이드,ツアー, 커스텀 여행'
      };
      metaKeywords.content = langKeywords[this.currentLang] || langKeywords.zh;
    }
    
    if (metaDescription) {
      const langDesc = {
        zh: '游导旅游 - 连接优秀导游与旅行者，让每一次出发都充满期待',
        en: 'YouDao Travel - Connect with expert guides for unforgettable journeys',
        ja: 'ユーダオ travel - 優れたガイドと旅行者を繋ぎます',
        ko: '유도 여행 - 우수한 가이드와 여행자를 연결합니다'
      };
      metaDescription.content = langDesc[this.currentLang] || langDesc.zh;
    }
  }

  // 更新语言切换按钮状态
  updateLangButtons() {
    document.querySelectorAll('[data-lang-btn]').forEach(btn => {
      const lang = btn.getAttribute('data-lang');
      if (lang === this.currentLang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // 更新下拉菜单中的语言选项
    document.querySelectorAll('.lang-option').forEach(opt => {
      const lang = opt.getAttribute('data-lang');
      if (lang === this.currentLang) {
        opt.classList.add('active');
      } else {
        opt.classList.remove('active');
      }
    });
  }

  // 获取当前语言
  getLang() {
    return this.currentLang;
  }

  // 是否是英文
  isEnglish() {
    return this.currentLang === 'en';
  }

  // 是否是日语
  isJapanese() {
    return this.currentLang === 'ja';
  }

  // 是否是韩语
  isKorean() {
    return this.currentLang === 'ko';
  }

  // 获取语言名称
  getLangName(lang) {
    return I18N_CONFIG.langNames[lang] || lang;
  }

  // 获取所有支持的语言
  getSupportedLangs() {
    return I18N_CONFIG.supportedLangs;
  }
}

// 创建全局实例
const i18n = new I18n();

// 初始化函数
function initI18n() {
  // 页面加载时应用语言
  i18n.updatePage();
  i18n.updateLangButtons();

  // 绑定语言切换按钮
  document.querySelectorAll('[data-lang-btn]').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const lang = this.getAttribute('data-lang');
      i18n.setLang(lang);
    });
  });

  // 绑定下拉菜单中的语言选项
  document.querySelectorAll('.lang-option').forEach(opt => {
    opt.addEventListener('click', function(e) {
      e.preventDefault();
      const lang = this.getAttribute('data-lang');
      i18n.setLang(lang);
      
      // 关闭下拉菜单
      const dropdown = this.closest('.lang-dropdown');
      if (dropdown) {
        dropdown.classList.remove('open');
      }
    });
  });
}

// DOM 加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initI18n);
} else {
  initI18n();
}

// 导出给外部使用
window.i18n = i18n;
window.I18N_CONFIG = I18N_CONFIG;
window.initI18n = initI18n;
