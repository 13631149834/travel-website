/**
 * 游导旅游 - 国际化 (i18n) 系统 v2.0
 * 支持: 中文、英语、日语、韩语、法语、德语、西班牙语、俄语
 * 功能: 多语言切换、本地化、SEO优化、翻译管理
 */

// ==================== 语言配置 ====================
const I18N_CONFIG = {
  defaultLang: 'zh',
  storageKey: 'youdao_lang',
  supportedLangs: ['zh', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru'],
  langNames: {
    zh: '中文',
    en: 'English',
    ja: '日本語',
    ko: '한국어',
    fr: 'Français',
    de: 'Deutsch',
    es: 'Español',
    ru: 'Русский'
  },
  langFlags: {
    zh: '🇨🇳',
    en: '🇺🇸',
    ja: '🇯🇵',
    ko: '🇰🇷',
    fr: '🇫🇷',
    de: '🇩🇪',
    es: '🇪🇸',
    ru: '🇷🇺'
  },
  langCodes: {
    zh: 'zh-CN',
    en: 'en-US',
    ja: 'ja-JP',
    ko: 'ko-KR',
    fr: 'fr-FR',
    de: 'de-DE',
    es: 'es-ES',
    ru: 'ru-RU'
  }
};

// ==================== 翻译数据 ====================
const translations = {
  // ===== 导航栏 =====
  nav: {
    home: { zh: '首页', en: 'Home', ja: 'ホーム', ko: '홈', fr: 'Accueil', de: 'Startseite', es: 'Inicio', ru: 'Главная' },
    guides: { zh: '找导游', en: 'Find Guides', ja: 'ガイドを探す', ko: '가이드 찾기', fr: 'Trouver un guide', de: 'Guides finden', es: 'Buscar guías', ru: 'Найти гида' },
    visa: { zh: '签证中心', en: 'Visa Center', ja: 'ビザセンター', ko: '비자 센터', fr: 'Centre de visa', de: 'Visumzentrum', es: 'Centro de visado', ru: 'Визовый центр' },
    routes: { zh: '线路', en: 'Routes', ja: 'ルート', ko: '라우트', fr: 'Circuits', de: 'Routen', es: 'Rutas', ru: 'Маршруты' },
    knowledge: { zh: '知识', en: 'Knowledge', ja: '知識', ko: '지식', fr: 'Connaissances', de: 'Wissen', es: 'Conocimientos', ru: 'Знания' },
    guideContent: { zh: '攻略', en: 'Guide', ja: 'ガイド', ko: '가이드', fr: 'Guide', de: 'Reiseführer', es: 'Guía', ru: 'Путеводитель' },
    tools: { zh: '工具', en: 'Tools', ja: 'ツール', ko: '도구', fr: 'Outils', de: 'Werkzeuge', es: 'Herramientas', ru: 'Инструменты' },
    about: { zh: '关于我们', en: 'About Us', ja: '会社概要', ko: '회사 소개', fr: 'À propos', de: 'Über uns', es: 'Sobre nosotros', ru: 'О нас' },
    contact: { zh: '咨询', en: 'Contact', ja: 'お問い合わせ', ko: '문의', fr: 'Contact', de: 'Kontakt', es: 'Contacto', ru: 'Контакты' },
    login: { zh: '登录', en: 'Login', ja: 'ログイン', ko: '로그인', fr: 'Connexion', de: 'Anmelden', es: 'Iniciar sesión', ru: 'Вход' },
    register: { zh: '注册', en: 'Register', ja: '登録', ko: '회원가입', fr: "S'inscrire", de: 'Registrieren', es: 'Registrarse', ru: 'Регистрация' },
    search: { zh: '搜索', en: 'Search', ja: '検索', ko: '검색', fr: 'Rechercher', de: 'Suchen', es: 'Buscar', ru: 'Поиск' },
    userCenter: { zh: '用户中心', en: 'User Center', ja: 'ユーザーセンター', ko: '마이페이지', fr: 'Mon compte', de: 'Benutzerzentrum', es: 'Mi cuenta', ru: 'Личный кабинет' },
    guideDashboard: { zh: '导游工作台', en: 'Guide Dashboard', ja: 'ガイドダッシュボード', ko: '가이드 대시보드', fr: 'Tableau de bord', de: 'Guide-Dashboard', es: 'Panel del guía', ru: 'Панель гида' },
    logout: { zh: '退出', en: 'Logout', ja: 'ログアウト', ko: '로그아웃', fr: 'Déconnexion', de: 'Abmelden', es: 'Cerrar sesión', ru: 'Выход' }
  },

  // ===== 首页 Hero 区域 =====
  hero: {
    tagline: { zh: '旅行从此不同', en: 'Travel Differently', ja: '旅行はここに変わる', ko: '여행이 여기서 달라집니다', fr: 'Voyagez autrement', de: 'Reisen Sie anders', es: 'Viaja diferente', ru: 'Путешествуйте иначе' },
    title: { zh: '探索世界，从这里开始', en: 'Explore the World, Start Here', ja: '世界を探索、ここから始めよう', ko: '세계를 탐험, 여기서 시작하세요', fr: 'Explorez le monde, commencez ici', de: 'Die Welt erkunden, hier beginnen', es: 'Explora el mundo, comienza aquí', ru: 'Исследуйте мир, начните здесь' },
    subtitle: { zh: '连接优秀导游与旅行者，让每一次出发都充满期待', en: 'Connect with expert guides and travelers for unforgettable journeys', ja: '優れたガイドと旅行者を繋ぎ、特別な旅を実現', ko: '우수한 가이드와 여행자를 연결하여 잊지 못할 여행을 만들어 드립니다', fr: 'Connectez-vous avec des guides experts pour des voyages inoubliables', de: 'Verbinden Sie sich mit Expertenführern für unvergessliche Reisen', es: 'Conecta con guías expertos para viajes inolvidables', ru: 'Свяжитесь с опытными гидами для незабываемых путешествий' },
    forTourist: { zh: '开启旅程', en: 'Start Your Journey', ja: '旅を始める', ko: '여행 시작하기', fr: 'Commencer votre voyage', de: 'Ihre Reise beginnen', es: 'Empieza tu viaje', ru: 'Начните путешествие' },
    forTouristDesc: { zh: '发现专属导游', en: 'Find Your Perfect Guide', ja: 'あなたにだけのガイドを見つける', ko: '나만의 가이드를 찾으세요', fr: 'Trouvez votre guide idéal', de: 'Finden Sie Ihren perfekten Führer', es: 'Encuentra tu guía perfecto', ru: 'Найдите идеального гида' },
    forGuide: { zh: '成为导游', en: 'Become a Guide', ja: 'ガイドになる', ko: '가이드가 되기', fr: 'Devenir guide', de: 'Werden Sie Führer', es: 'Conviértete en guía', ru: 'Стать гидом' },
    forGuideDesc: { zh: '开启事业新篇章', en: 'Start Your New Career', ja: '新しいキャリアを始める', ko: '새로운 커리어 시작하기', fr: 'Lancez votre nouvelle carrière', de: 'Starten Sie Ihre neue Karriere', es: 'Inicia tu nueva carrera', ru: 'Начните новую карьеру' },
    searchPlaceholder: { zh: '搜索目的地、导游、线路...', en: 'Search destinations, guides, routes...', ja: '目的地、ガイド、ルートを検索...', ko: '목적지, 가이드, 라우트 검색...', fr: 'Rechercher destinations, guides, circuits...', de: 'Reiseziele, Führer, Routen suchen...', es: 'Buscar destinos, guías, rutas...', ru: 'Поиск направлений, гидов, маршрутов...' },
    searchBtn: { zh: '搜索', en: 'Search', ja: '検索', ko: '검색', fr: 'Rechercher', de: 'Suchen', es: 'Buscar', ru: 'Поиск' },
    hotSearch: { zh: '热门搜索:', en: 'Hot Searches:', ja: '人気の検索:', ko: '인기 검색:', fr: 'Recherches populaires:', de: 'Beliebte Suchen:', es: 'Búsquedas populares:', ru: 'Популярные запросы:' }
  },

  // ===== 首页 - 热门目的地 =====
  destinations: {
    title: { zh: '🌏 热门目的地', en: '🌏 Popular Destinations', ja: '🌏 人気の目的地', ko: '🌏 인기 여행지', fr: '🌏 Destinations populaires', de: '🌏 Beliebte Reiseziele', es: '🌏 Destinos populares', ru: '🌏 Популярные направления' },
    subtitle: { zh: '发现全球最受欢迎的旅行目的地，开启你的下一段旅程', en: "Discover the world's most popular travel destinations", ja: '世界で最も人気の旅行先を発見しよう', ko: '세계에서 가장 인기 있는 여행지를 발견하세요', fr: 'Découvrez les destinations les plus populaires au monde', de: 'Entdecken Sie die beliebtesten Reiseziele der Welt', es: 'Descubre los destinos más populares del mundo', ru: 'Откройте самые популярные направления мира' },
    viewAll: { zh: '查看全部 →', en: 'View All →', ja: 'すべて見る →', ko: '전체 보기 →', fr: 'Voir tout →', de: 'Alle anzeigen →', es: 'Ver todo →', ru: 'Смотреть все →' },
    japan: { zh: '日本', en: 'Japan', ja: '日本', ko: '일본', fr: 'Japon', de: 'Japan', es: 'Japón', ru: 'Япония' },
    japanDesc: { zh: '樱花温泉 · 和风文化', en: 'Cherry Blossoms · Japanese Culture', ja: '桜・温泉・和食文化', ko: '벚꽃 · 온천 · 일본 문화', fr: 'Cerisiers · Culture japonaise', de: 'Kirschblüten · Japanische Kultur', es: 'Flor de cerezo · Cultura japonesa', ru: 'Сакура · Японская культура' },
    thailand: { zh: '泰国', en: 'Thailand', ja: 'タイ', ko: '태국', fr: 'Thaïlande', de: 'Thailand', es: 'Tailandia', ru: 'Таиланд' },
    thailandDesc: { zh: '佛寺美食', en: 'Temples & Cuisine', ja: '寺院とグルメ', ko: '사원과 미식', fr: 'Temples et gastronomie', de: 'Tempel & Gastronomie', es: 'Templos y gastronomía', ru: 'Храмы и кухня' },
    europe: { zh: '欧洲', en: 'Europe', ja: 'ヨーロッパ', ko: '유럽', fr: 'Europe', de: 'Europa', es: 'Europa', ru: 'Европа' },
    europeDesc: { zh: '古堡艺术', en: 'Castles & Art', ja: '城と芸術', ko: '성곽과 예술', fr: 'Châteaux et art', de: 'Schlösser & Kunst', es: 'Castillos y arte', ru: 'Замки и искусство' },
    australia: { zh: '澳新', en: 'Australia & NZ', ja: 'オーストラリア・NZ', ko: '호주 · 뉴질랜드', fr: 'Australie & NZ', de: 'Australien & NZ', es: 'Australia y NZ', ru: 'Австралия и НЗ' },
    australiaDesc: { zh: '自然冰川', en: 'Nature & Glaciers', ja: '自然・氷河', ko: '자연 · 빙하', fr: 'Nature et glaciers', de: 'Natur & Gletscher', es: 'Naturaleza y glaciares', ru: 'Природа и ледники' },
    southeast: { zh: '东南亚', en: 'Southeast Asia', ja: '東南アジア', ko: '동남아시아', fr: 'Asie du Sud-Est', de: 'Südostasien', es: 'Sudeste asiático', ru: 'Юго-Восточная Азия' },
    southeastDesc: { zh: '海岛度假', en: 'Island Getaways', ja: '島のバカンス', ko: '섬 휴양지', fr: 'Escapades insulaires', de: 'Inselurlaub', es: 'Escapadas insulares', ru: 'Островной отдых' },
    guides: { zh: '位导游', en: ' Guides', ja: '人のガイド', ko: '명의 가이드', fr: ' guides', de: ' Guides', es: ' guías', ru: ' гидов' }
  },

  // ===== 首页 - 为什么选择我们 =====
  whyUs: {
    title: { zh: '✨ 为什么选择游导', en: '✨ Why Choose YouDao', ja: '✨ なぜユーダオを選ぶのか', ko: '✨ 왜 유도를 선택할까', fr: '✨ Pourquoi choisir YouDao', de: '✨ Warum YouDao wählen', es: '✨ Por qué elegir YouDao', ru: '✨ Почему выбирают YouDao' },
    subtitle: { zh: '专业、可信赖的旅行伙伴，让你的旅程更精彩', en: 'Your professional and trusted travel partner', ja: '旅の信頼できるパートナー', ko: '당신의 전문적이고 신뢰할 수 있는 여행 파트너', fr: 'Votre partenaire de voyage professionnel et fiable', de: 'Ihr professioneller und vertrauenswürdiger ReisePartner', es: 'Tu socio de viaje profesional y de confianza', ru: 'Ваш профессиональный и надежный партнер для путешествий' },
    selectGuides: { zh: '严选导游', en: 'Vetted Guides', ja: '厳選されたガイド', ko: '엄선된 가이드', fr: 'Guides sélectionnés', de: 'Geprüfte Führer', es: 'Guías seleccionados', ru: 'Тщательно отобранные гиды' },
    selectGuidesDesc: { zh: '所有导游经过专业认证审核，确保服务品质', en: 'All guides are professionally certified for quality service', ja: 'すべてのガイドが資格審査済み、サービスを提供', ko: '모든 가이드는 전문 자격증을 소지하고 있습니다', fr: 'Tous les guides sont certifiés pour garantir un service de qualité', de: 'Alle Führer sind professionell zertifiziert', es: 'Todos los guías están profesionalmente certificados', ru: 'Все гиды профессионально сертифицированы' },
    safe: { zh: '安全保障', en: 'Safe & Secure', ja: '安全な保障', ko: '안전 보장', fr: 'Sécurité garantie', de: 'Sicher & Geschützt', es: 'Seguro y protegido', ru: 'Безопасность и защита' },
    safeDesc: { zh: '完善的评价体系，旅行更安心', en: 'Comprehensive review system for peace of mind', ja: '評価システムで旅行を安心して楽しめる', ko: '완벽한 리뷰 시스템으로 안심하고 여행하세요', fr: 'Système d\'évaluation complet pour voyager l\'esprit tranquille', de: 'Umfassendes Bewertungssystem für sorgenfreies Reisen', es: 'Sistema de reseñas completo para viajar con tranquilidad', ru: 'Комплексная система отзывов для спокойствия' },
    efficient: { zh: '高效匹配', en: 'Smart Matching', ja: 'スマートマッチング', ko: '스마트 매칭', fr: 'Matching intelligent', de: 'Intelligente Vermittlung', es: 'Emparejamiento inteligente', ru: 'Умный подбор' },
    efficientDesc: { zh: '智能推荐系统，快速找到合适的导游', en: 'AI-powered matching to find the perfect guide', ja: 'AI搭載であなたに最適なガイドを提案', ko: 'AI 기반 매칭으로 최적의 가이드를 찾아드립니다', fr: 'IA pour trouver le guide parfait', de: 'KI-gestützte Vermittlung für den perfekten Führer', es: 'IA para encontrar el guía perfecto', ru: 'ИИ для поиска идеального гида' },
    value: { zh: '超值的优惠', en: 'Best Value', ja: ' 최고의 가성비', ko: '최고의 가성비', fr: 'Meilleur rapport qualité-prix', de: 'Bestes Preis-Leistungs-Verhältnis', es: 'La mejor relación calidad-precio', ru: 'Лучшее соотношение цены и качества' },
    valueDesc: { zh: '透明定价，无隐形费用', en: 'Transparent pricing, no hidden fees', ja: '透明な料金設定、隠れ費用なし', ko: '투명한 가격, 숨은 비용 없음', fr: 'Tarification transparente, sans frais cachés', de: 'Transparente Preisgestaltung, keine versteckten Kosten', es: 'Precios transparentes, sin cargos ocultos', ru: 'Прозрачное ценообразование без скрытых платежей' }
  },

  // ===== 导游列表页 =====
  guides: {
    title: { zh: '找到合适的导游', en: 'Find Your Perfect Guide', ja: 'あなたに合ったガイドを探す', ko: '나만의 완벽한 가이드 찾기', fr: 'Trouvez le guide idéal', de: 'Finden Sie Ihren perfekten Führer', es: 'Encuentra tu guía perfecto', ru: 'Найдите идеального гида' },
    subtitle: { zh: '专业认证导游，为你定制专属旅程', en: 'Certified professional guides for your custom journey', ja: '認定プロガイドがあなたに最適な旅を提案', ko: '자격을 갖춘 전문 가이드가 맞춤 여정을 제공합니다', fr: 'Guides professionnels certifiés pour votre voyage sur mesure', de: 'Zertifizierte Führer für Ihre maßgeschneiderte Reise', es: 'Guías profesionales certificados para tu viaje personalizado', ru: 'Сертифицированные гиды для вашего индивидуального путешествия' },
    searchPlaceholder: { zh: '搜索导游姓名或擅长领域...', en: 'Search by name or specialty...', ja: '名前や専門分野で検索...', ko: '이름이나 전문 분야로 검색...', fr: 'Rechercher par nom ou spécialité...', de: 'Nach Name oder Spezialität suchen...', es: 'Buscar por nombre o especialidad...', ru: 'Поиск по имени или специализации...' },
    searchBtn: { zh: '搜索', en: 'Search', ja: '検索', ko: '검색', fr: 'Rechercher', de: 'Suchen', es: 'Buscar', ru: 'Поиск' },
    filterRegion: { zh: '地区', en: 'Region', ja: '地域', ko: '지역', fr: 'Région', de: 'Region', es: 'Región', ru: 'Регион' },
    filterLanguage: { zh: '语言', en: 'Language', ja: '言語', ko: '언어', fr: 'Langue', de: 'Sprache', es: 'Idioma', ru: 'Язык' },
    filterSpecialty: { zh: '特长', en: 'Specialty', ja: '専門', ko: '전문', fr: 'Spécialité', de: 'Spezialität', es: 'Especialidad', ru: 'Специализация' },
    filterAll: { zh: '全部', en: 'All', ja: 'すべて', ko: '전체', fr: 'Tous', de: 'Alle', es: 'Todos', ru: 'Все' },
    resultCount: { zh: '共找到', en: 'Found', ja: ' 件見つかりました', ko: '총', fr: 'Trouvé', de: 'Gefunden', es: 'Encontrado', ru: 'Найдено' },
    resultGuides: { zh: '位导游', en: ' guides', ja: '人のガイド', ko: '명의 가이드', fr: ' guides', de: ' Guides', es: ' guías', ru: ' гидов' },
    rating: { zh: '评分', en: 'Rating', ja: '評価', ko: '평점', fr: 'Note', de: 'Bewertung', es: 'Puntuación', ru: 'Рейтинг' },
    reviews: { zh: '条评价', en: ' reviews', ja: '件のレビュー', ko: '개의 리뷰', fr: ' avis', de: ' Bewertungen', es: ' reseñas', ru: ' отзывов' },
    price: { zh: '元/天', en: '/day', ja: '元/日', ko: '위안/일', fr: '/jour', de: '/Tag', es: '/día', ru: '/день' },
    contactBtn: { zh: '立即咨询', en: 'Contact Now', ja: '今すぐ問い合わせる', ko: '지금 문의하기', fr: 'Contacter maintenant', de: 'Jetzt kontaktieren', es: 'Contactar ahora', ru: 'Связаться сейчас' },
    viewProfile: { zh: '查看详情', en: 'View Profile', ja: 'プロフィールを見る', ko: '프로필 보기', fr: 'Voir le profil', de: 'Profil anzeigen', es: 'Ver perfil', ru: 'Посмотреть профиль' }
  },

  // ===== 登录页面 =====
  login: {
    title: { zh: '登录', en: 'Login', ja: 'ログイン', ko: '로그인', fr: 'Connexion', de: 'Anmelden', es: 'Iniciar sesión', ru: 'Вход' },
    touristTab: { zh: '我是游客', en: "I'm a Tourist", ja: '旅行者', ko: '여행자', fr: 'Je suis touriste', de: 'Ich bin Tourist', es: 'Soy turista', ru: 'Я турист' },
    guideTab: { zh: '我是导游', en: "I'm a Guide", ja: 'ガイド', ko: '가이드', fr: 'Je suis guide', de: 'Ich bin Führer', es: 'Soy guía', ru: 'Я гид' },
    email: { zh: '邮箱', en: 'Email', ja: 'メール', ko: '이메일', fr: 'E-mail', de: 'E-Mail', es: 'Correo electrónico', ru: 'Эл. почта' },
    emailPlaceholder: { zh: '请输入邮箱', en: 'Enter your email', ja: 'メールアドレスを入力', ko: '이메일을 입력하세요', fr: 'Entrez votre e-mail', de: 'E-Mail eingeben', es: 'Ingrese su correo', ru: 'Введите email' },
    password: { zh: '密码', en: 'Password', ja: 'パスワード', ko: '비밀번호', fr: 'Mot de passe', de: 'Passwort', es: 'Contraseña', ru: 'Пароль' },
    passwordPlaceholder: { zh: '请输入密码', en: 'Enter your password', ja: 'パスワードを入力', ko: '비밀번호를 입력하세요', fr: 'Entrez votre mot de passe', de: 'Passwort eingeben', es: 'Ingrese su contraseña', ru: 'Введите пароль' },
    forgotPassword: { zh: '忘记密码？', en: 'Forgot Password?', ja: 'パスワードをお忘れですか？', ko: '비밀번호를 잊으셨나요?', fr: 'Mot de passe oublié ?', de: 'Passwort vergessen?', es: '¿Olvidaste tu contraseña?', ru: 'Забыли пароль?' },
    loginBtn: { zh: '登录', en: 'Login', ja: 'ログイン', ko: '로그인', fr: 'Connexion', de: 'Anmelden', es: 'Iniciar sesión', ru: 'Войти' },
    noAccount: { zh: '还没有账号？', en: "Don't have an account?", ja: 'アカウントをお持ちでない方？', ko: '계정이 없으신가요?', fr: "Pas encore de compte ?", de: 'Noch kein Konto?', es: '¿No tienes cuenta?', ru: 'Нет аккаунта?' },
    goRegister: { zh: '立即注册 →', en: 'Register Now →', ja: '新規登録 →', ko: '회원가입 →', fr: "S'inscrire →", de: 'Registrieren →', es: 'Registrarse →', ru: 'Зарегистрироваться →' },
    orContinue: { zh: '或使用以下方式继续', en: 'Or continue with', ja: 'または以下方法で続ける', ko: '또는 다음 방법으로 계속', fr: 'Ou continuer avec', de: 'Oder fortfahren mit', es: 'O continuar con', ru: 'Или продолжить с' },
    wechatLogin: { zh: '微信登录', en: 'WeChat', ja: '微信でログイン', ko: '위챗 로그인', fr: 'WeChat', de: 'WeChat', es: 'WeChat', ru: 'WeChat' },
    phoneLogin: { zh: '手机号登录', en: 'Phone Login', ja: '電話番号でログイン', ko: '휴대폰 번호 로그인', fr: 'Connexion par téléphone', de: 'Anmeldung per Telefon', es: 'Login por teléfono', ru: 'Вход по телефону' },
    rememberMe: { zh: '记住我', en: 'Remember me', ja: 'ログイン状態を保持', ko: '로그인 상태 유지', fr: 'Se souvenir de moi', de: 'Angemeldet bleiben', es: 'Recordarme', ru: 'Запомнить меня' },
    subtitle: { zh: '开启你的精彩旅程', en: 'Start your wonderful journey', ja: '素晴らしい旅を始めましょう', ko: '精彩的인 여정을 시작하세요', fr: 'Commencez votre merveilleux voyage', de: 'Beginnen Sie Ihre wunderbare Reise', es: 'Comienza tu maravilloso viaje', ru: 'Начните свое замечательное путешествие' }
  },

  // ===== 注册页面 =====
  register: {
    title: { zh: '注册', en: 'Register', ja: '新規登録', ko: '회원가입', fr: "Inscription", de: 'Registrieren', es: 'Registrarse', ru: 'Регистрация' },
    touristTitle: { zh: '游客注册', en: 'Tourist Registration', ja: '旅行者登録', ko: '여행자 회원가입', fr: 'Inscription touriste', de: 'Tourist-Registrierung', es: 'Registro de turista', ru: 'Регистрация туриста' },
    guideTitle: { zh: '导游注册', en: 'Guide Registration', ja: 'ガイド登録', ko: '가이드 회원가입', fr: 'Inscription guide', de: 'Führer-Registrierung', es: 'Registro de guía', ru: 'Регистрация гида' },
    touristTab: { zh: '我是游客', en: "I'm a Tourist", ja: '旅行者', ko: '여행자', fr: 'Je suis touriste', de: 'Ich bin Tourist', es: 'Soy turista', ru: 'Я турист' },
    guideTab: { zh: '我是导游', en: "I'm a Guide", ja: 'ガイド', ko: '가이드', fr: 'Je suis guide', de: 'Ich bin Führer', es: 'Soy guía', ru: 'Я гид' },
    touristSubtitle: { zh: '开启你的精彩旅程', en: 'Start your wonderful journey', ja: '素晴らしい旅を始めましょう', ko: '精彩的인 여정을 시작하세요', fr: 'Commencez votre merveilleux voyage', de: 'Beginnen Sie Ihre wunderbare Reise', es: 'Comienza tu maravilloso viaje', ru: 'Начните свое замечательное путешествие' },
    email: { zh: '邮箱', en: 'Email', ja: 'メール', ko: '이메일', fr: 'E-mail', de: 'E-Mail', es: 'Correo electrónico', ru: 'Эл. почта' },
    emailPlaceholder: { zh: '请输入邮箱', en: 'Enter your email', ja: 'メールアドレスを入力', ko: '이메일을 입력하세요', fr: 'Entrez votre e-mail', de: 'E-Mail eingeben', es: 'Ingrese su correo', ru: 'Введите email' },
    password: { zh: '设置密码', en: 'Set Password', ja: 'パスワード設定', ko: '비밀번호 설정', fr: 'Définir le mot de passe', de: 'Passwort festlegen', es: 'Establecer contraseña', ru: 'Установить пароль' },
    passwordPlaceholder: { zh: '请设置密码', en: 'Create a password', ja: 'パスワードを作成', ko: '비밀번호를 만드세요', fr: 'Créez un mot de passe', de: 'Passwort erstellen', es: 'Crea una contraseña', ru: 'Создайте пароль' },
    confirmPassword: { zh: '确认密码', en: 'Confirm Password', ja: 'パスワード確認', ko: '비밀번호 확인', fr: 'Confirmer le mot de passe', de: 'Passwort bestätigen', es: 'Confirmar contraseña', ru: 'Подтвердить пароль' },
    confirmPlaceholder: { zh: '请再次输入密码', en: 'Confirm your password', ja: 'パスワードを再入力', ko: '비밀번호를 다시 입력하세요', fr: 'Confirmez votre mot de passe', de: 'Passwort wiederholen', es: 'Confirma tu contraseña', ru: 'Подтвердите пароль' },
    phone: { zh: '手机号', en: 'Phone', ja: '電話番号', ko: '휴대폰 번호', fr: 'Téléphone', de: 'Telefon', es: 'Teléfono', ru: 'Телефон' },
    phonePlaceholder: { zh: '请输入手机号', en: 'Enter your phone number', ja: '電話番号を入力', ko: '휴대폰 번호를 입력하세요', fr: 'Entrez votre numéro', de: 'Nummer eingeben', es: 'Ingrese su número', ru: 'Введите номер' },
    verifyCode: { zh: '验证码', en: 'Verification Code', ja: '確認コード', ko: '인증번호', fr: 'Code de vérification', de: 'Bestätigungscode', es: 'Código de verificación', ru: 'Код подтверждения' },
    verifyPlaceholder: { zh: '请输入验证码', en: 'Enter code', ja: 'コードを入力', ko: '인증번호를 입력하세요', fr: 'Entrez le code', de: 'Code eingeben', es: 'Ingrese el código', ru: 'Введите код' },
    sendCode: { zh: '发送验证码', en: 'Send Code', ja: 'コード送信', ko: '인증번호 발송', fr: 'Envoyer le code', de: 'Code senden', es: 'Enviar código', ru: 'Отправить код' },
    registerBtn: { zh: '注册', en: 'Register', ja: '登録', ko: '회원가입', fr: "S'inscrire", de: 'Registrieren', es: 'Registrarse', ru: 'Зарегистрироваться' },
    hasAccount: { zh: '已有账号？', en: 'Already have an account?', ja: 'アカウントをお持ちですか？', ko: '이미 계정이 있으신가요?', fr: 'Déjà un compte ?', de: 'Haben Sie ein Konto?', es: '¿Ya tienes cuenta?', ru: 'Уже есть аккаунт?' },
    goLogin: { zh: '立即登录 →', en: 'Login Now →', ja: 'ログイン →', ko: '로그인 →', fr: 'Connexion →', de: 'Anmelden →', es: 'Iniciar sesión →', ru: 'Войти →' },
    agreeTerms: { zh: '我已阅读并同意', en: 'I agree to the', ja: '利用規約に同意します', ko: '이용약관에 동의합니다', fr: "J'accepte les", de: 'Ich stimme den', es: 'Acepto los', ru: 'Я согласен с' },
    terms: { zh: '《用户协议》', en: 'Terms of Service', ja: '利用規約', ko: '이용약관', fr: 'Conditions d\'utilisation', de: 'Nutzungsbedingungen', es: 'Términos de servicio', ru: 'Условиями использования' },
    privacy: { zh: '《隐私政策》', en: 'Privacy Policy', ja: 'プライバシーポリシー', ko: '개인정보 처리방침', fr: 'Politique de confidentialité', de: 'Datenschutzrichtlinie', es: 'Política de privacidad', ru: 'Политикой конфиденциальности' },
    orContinue: { zh: '或使用以下方式注册', en: 'Or register with', ja: 'または以下方法で登録', ko: '또는 다음 방법으로 회원가입', fr: 'Ou inscrivez-vous avec', de: 'Oder registrieren Sie mit', es: 'O regístrate con', ru: 'Или зарегистрируйтесь через' }
  },

  // ===== 通用按钮和标签 =====
  common: {
    submit: { zh: '提交', en: 'Submit', ja: '送信', ko: '제출', fr: 'Soumettre', de: 'Absenden', es: 'Enviar', ru: 'Отправить' },
    cancel: { zh: '取消', en: 'Cancel', ja: 'キャンセル', ko: '취소', fr: 'Annuler', de: 'Abbrechen', es: 'Cancelar', ru: 'Отмена' },
    confirm: { zh: '确认', en: 'Confirm', ja: '確認', ko: '확인', fr: 'Confirmer', de: 'Bestätigen', es: 'Confirmar', ru: 'Подтвердить' },
    save: { zh: '保存', en: 'Save', ja: '保存', ko: '저장', fr: 'Enregistrer', de: 'Speichern', es: 'Guardar', ru: 'Сохранить' },
    edit: { zh: '编辑', en: 'Edit', ja: '編集', ko: '편집', fr: 'Modifier', de: 'Bearbeiten', es: 'Editar', ru: 'Редактировать' },
    delete: { zh: '删除', en: 'Delete', ja: '削除', ko: '삭제', fr: 'Supprimer', de: 'Löschen', es: 'Eliminar', ru: 'Удалить' },
    back: { zh: '返回', en: 'Back', ja: '戻る', ko: '뒤로', fr: 'Retour', de: 'Zurück', es: 'Volver', ru: 'Назад' },
    next: { zh: '下一步', en: 'Next', ja: '次へ', ko: '다음', fr: 'Suivant', de: 'Weiter', es: 'Siguiente', ru: 'Далее' },
    prev: { zh: '上一步', en: 'Previous', ja: '前へ', ko: '이전', fr: 'Précédent', de: 'Zurück', es: 'Anterior', ru: 'Назад' },
    loading: { zh: '加载中...', en: 'Loading...', ja: '読み込み中...', ko: '로딩 중...', fr: 'Chargement...', de: 'Laden...', es: 'Cargando...', ru: 'Загрузка...' },
    noData: { zh: '暂无数据', en: 'No Data', ja: 'データがありません', ko: '데이터가 없습니다', fr: 'Aucune donnée', de: 'Keine Daten', es: 'Sin datos', ru: 'Нет данных' },
    success: { zh: '操作成功', en: 'Success', ja: '成功しました', ko: '성공했습니다', fr: 'Succès', de: 'Erfolg', es: 'Éxito', ru: 'Успешно' },
    error: { zh: '操作失败', en: 'Error', ja: 'エラーが発生しました', ko: '오류가 발생했습니다', fr: 'Erreur', de: 'Fehler', es: 'Error', ru: 'Ошибка' },
    warning: { zh: '警告', en: 'Warning', ja: '警告', ko: '경고', fr: 'Avertissement', de: 'Warnung', es: 'Advertencia', ru: 'Предупреждение' },
    required: { zh: '必填', en: 'Required', ja: '必須', ko: '필수', fr: 'Requis', de: 'Erforderlich', es: 'Obligatorio', ru: 'Обязательно' },
    optional: { zh: '选填', en: 'Optional', ja: '任意', ko: '선택', fr: 'Facultatif', de: 'Optional', es: 'Opcional', ru: 'Необязательно' }
  },

  // ===== 页脚 =====
  footer: {
    about: { zh: '关于我们', en: 'About Us', ja: '会社概要', ko: '회사 소개', fr: 'À propos', de: 'Über uns', es: 'Sobre nosotros', ru: 'О нас' },
    contact: { zh: '联系我们', en: 'Contact Us', ja: 'お問い合わせ', ko: '문의하기', fr: 'Contactez-nous', de: 'Kontaktieren Sie uns', es: 'Contáctanos', ru: 'Свяжитесь с нами' },
    service: { zh: '服务条款', en: 'Terms of Service', ja: '利用規約', ko: '이용약관', fr: "Conditions d'utilisation", de: 'Nutzungsbedingungen', es: 'Términos de servicio', ru: 'Условия использования' },
    privacy: { zh: '隐私政策', en: 'Privacy Policy', ja: 'プライバシーポリシー', ko: '개인정보 처리방침', fr: 'Politique de confidentialité', de: 'Datenschutzerklärung', es: 'Política de privacidad', ru: 'Политика конфиденциальности' },
    help: { zh: '帮助中心', en: 'Help Center', ja: 'ヘルプセンター', ko: '고객센터', fr: 'Centre d\'aide', de: 'Hilfezentrum', es: 'Centro de ayuda', ru: 'Центр помощи' },
    copyright: { zh: '© 2024 游导旅游 版权所有', en: '© 2024 YouDao Travel. All rights reserved.', ja: '© 2024 YouDao Travel. 全著作権所有。', ko: '© 2024 유도 여행. 모든 권리 보유.', fr: '© 2024 YouDao Travel. Tous droits réservés.', de: '© 2024 YouDao Travel. Alle Rechte vorbehalten.', es: '© 2024 YouDao Travel. Todos los derechos reservados.', ru: '© 2024 YouDao Travel. Все права защищены.' },
    ICP: { zh: '备案号', en: 'ICP', ja: 'ICP', ko: 'ICP', fr: 'ICP', de: 'ICP', es: 'ICP', ru: 'ICP' },
    brandDesc: { zh: '专业的导游与游客一站式旅行平台<br>让旅行更简单，让体验更美好', en: 'Your one-stop travel platform<br>Simplifying travel, enhancing experiences', ja: 'ガイドと旅行者于一站式旅行プラットフォーム<br>旅行をよりシンプルに', ko: '가이드와 여행자를 위한 원스톱 여행 플랫폼<br>여행은 더 간단하게, 경험은 더 풍요롭게', fr: 'Votre plateforme de voyage tout-en-un<br>Simplifiez vos voyages, améliorez vos expériences', de: 'Ihre All-in-One-Reiseplattform<br>Reisen vereinfachen, Erlebnisse verbessern', es: 'Tu plataforma de viajes todo-en-uno<br>Simplifica viajes, mejora experiencias', ru: 'Ваша платформа для путешествий<br>Упрощаем путешествия, улучшаем впечатления' },
    quickLinks: { zh: '快速链接', en: 'Quick Links', ja: 'クイックリンク', ko: '빠른 링크', fr: 'Liens rapides', de: 'Schnelllinks', es: 'Enlaces rápidos', ru: 'Быстрые ссылки' },
    helpCenter: { zh: '帮助中心', en: 'Help Center', ja: 'ヘルプセンター', ko: '고객센터', fr: 'Centre d\'aide', de: 'Hilfezentrum', es: 'Centro de ayuda', ru: 'Центр помощи' },
    tools: { zh: '实用工具', en: 'Useful Tools', ja: '便利ツール', ko: '유용한 도구', fr: 'Outils utiles', de: 'Nützliche Tools', es: 'Herramientas útiles', ru: 'Полезные инструменты' },
    moreTools: { zh: '更多工具', en: 'More Tools', ja: 'その他のツール', ko: '더 많은 도구', fr: 'Plus d\'outils', de: 'Weitere Tools', es: 'Más herramientas', ru: 'Больше инструментов' },
    contactUs: { zh: '联系我们', en: 'Contact Us', ja: 'お問い合わせ', ko: '문의하기', fr: 'Contactez-nous', de: 'Kontakt', es: 'Contáctanos', ru: 'Свяжитесь с нами' },
    phone: { zh: '📞 400-888-8888', en: '📞 400-888-8888', ja: '📞 400-888-8888', ko: '📞 400-888-8888', fr: '📞 400-888-8888', de: '📞 400-888-8888', es: '📞 400-888-8888', ru: '📞 400-888-8888' },
    email: { zh: '📧 support@youdautravel.com', en: '📧 support@youdautravel.com', ja: '📧 support@youdautravel.com', ko: '📧 support@youdautravel.com', fr: '📧 support@youdautravel.com', de: '📧 support@youdautravel.com', es: '📧 support@youdautravel.com', ru: '📧 support@youdautravel.com' },
    workTime: { zh: '🕐 工作时间: 9:00-21:00', en: '🕐 Hours: 9:00-21:00', ja: '🕐 営業時間: 9:00-21:00', ko: '🕐 업무시간: 9:00-21:00', fr: '🕐 Heures: 9h00-21h00', de: '🕐 Öffnungszeiten: 9:00-21:00', es: '🕐 Horario: 9:00-21:00', ru: '🕐 Часы работы: 9:00-21:00' },
    disclaimer: { zh: '免责声明', en: 'Disclaimer', ja: '免責事項', ko: '면책 조항', fr: 'Avertissement', de: 'Haftungsausschluss', es: 'Aviso legal', ru: 'Отказ от ответственности' },
    faq: { zh: '常见问题', en: 'FAQ', ja: 'よくある質問', ko: 'FAQ', fr: 'FAQ', de: 'FAQ', es: 'Preguntas frecuentes', ru: 'Часто задаваемые вопросы' },
    becomeGuide: { zh: '导游入驻', en: 'Become a Guide', ja: 'ガイドになる', ko: '가이드 지원', fr: 'Devenir guide', de: 'Führer werden', es: 'Conviértete en guía', ru: 'Стать гидом' },
    activities: { zh: '🎯 活动中心', en: '🎯 Activities', ja: '🎯 アクティビティ', ko: '🎯 이벤트', fr: '🎯 Activités', de: '🎯 Aktivitäten', es: '🎯 Actividades', ru: '🎯 Мероприятия' }
  },

  // ===== 目的地页面 =====
  destinationsPage: {
    title: { zh: '探索目的地', en: 'Explore Destinations', ja: '目的地を探索する', ko: '목적지 탐험', fr: 'Explorer les destinations', de: 'Reiseziele erkunden', es: 'Explorar destinos', ru: 'Исследовать направления' },
    subtitle: { zh: '发现世界各地的精彩旅行体验', en: 'Discover amazing travel experiences around the world', ja: '世界中の素晴らしい旅行体験を発見', ko: '전 세계의 놀라운 여행 경험을 발견하세요', fr: 'Découvrez des expériences de voyage incroyables partout dans le monde', de: 'Entdecken Sie erstaunliche Reiseerlebnisse auf der ganzen Welt', es: 'Descubre experiencias de viaje increíbles en todo el mundo', ru: 'Откройте удивительные путешествия по всему миру' },
    asia: { zh: '亚洲', en: 'Asia', ja: 'アジア', ko: '아시아', fr: 'Asie', de: 'Asien', es: 'Asia', ru: 'Азия' },
    europe: { zh: '欧洲', en: 'Europe', ja: 'ヨーロッパ', ko: '유럽', fr: 'Europe', de: 'Europa', es: 'Europa', ru: 'Европа' },
    americas: { zh: '美洲', en: 'Americas', ja: 'アメリカ', ko: '아메리카', fr: 'Amériques', de: 'Amerika', es: 'Américas', ru: 'Америка' },
    oceania: { zh: '大洋洲', en: 'Oceania', ja: 'オセアニア', ko: '오세아니아', fr: 'Océanie', de: 'Ozeanien', es: 'Oceanía', ru: 'Океания' },
    africa: { zh: '非洲', en: 'Africa', ja: 'アフリカ', ko: '아프리카', fr: 'Afrique', de: 'Afrika', es: 'África', ru: 'Африка' }
  },

  // ===== 线路页面 =====
  routesPage: {
    title: { zh: '精选路线', en: 'Curated Routes', ja: '厳選ルート', ko: '精选 라우트', fr: 'Circuits sélectionnés', de: 'Ausgewählte Routen', es: 'Rutas seleccionadas', ru: 'Тщательно подобранные маршруты' },
    subtitle: { zh: '专业规划，带你玩转目的地', en: 'Professionally planned routes to explore destinations', ja: 'プロが企画したルートで目的地を楽しむ', ko: '전문가가策划한 라우트로 목적지를 즐기세요', fr: 'Des circuits planifiés par des professionnels', de: 'Professionell geplante Routen', es: 'Rutas planificadas profesionalmente', ru: 'Маршруты, спланированные профессионалами' },
    days: { zh: '天', en: 'days', ja: '日間', ko: '일', fr: 'jours', de: 'Tage', es: 'días', ru: 'дней' },
    priceFrom: { zh: '起', en: 'from', ja: 'から', ko: '부터', fr: 'à partir de', de: 'ab', es: 'desde', ru: 'от' },
    bookNow: { zh: '立即预订', en: 'Book Now', ja: '今すぐ予約', ko: '지금 예약', fr: 'Réserver maintenant', de: 'Jetzt buchen', es: 'Reservar ahora', ru: 'Забронировать сейчас' }
  },

  // ===== 签证页面 =====
  visaPage: {
    title: { zh: '签证中心', en: 'Visa Center', ja: 'ビザセンター', ko: '비자 센터', fr: 'Centre de visa', de: 'Visumzentrum', es: 'Centro de visado', ru: 'Визовый центр' },
    subtitle: { zh: '轻松了解各国签证政策', en: 'Easily understand visa policies for all countries', ja: '各国のビザ政策を簡単理解', ko: '각국의 비자 정책을 쉽게 알아보세요', fr: 'Comprenez facilement les politiques de visa', de: 'Visarichtlinien aller Länder leicht verstehen', es: 'Entiende fácilmente las políticas de visa', ru: 'Легко узнайте о визовых требованиях' },
    required: { zh: '所需材料', en: 'Required Documents', ja: '必要書類', ko: '필요 서류', fr: 'Documents requis', de: 'Erforderliche Dokumente', es: 'Documentos requeridos', ru: 'Необходимые документы' },
    processingTime: { zh: '办理时间', en: 'Processing Time', ja: '処理時間', ko: '처리 시간', fr: 'Délai de traitement', de: 'Bearbeitungszeit', es: 'Tiempo de procesamiento', ru: 'Срок обработки' },
    visaFee: { zh: '签证费用', en: 'Visa Fee', ja: 'ビザ料金', ko: '비자 비용', fr: 'Frais de visa', de: 'Visumsgebühr', es: 'Tarifa de visado', ru: 'Стоимость визы' }
  },

  // ===== 工具页面 =====
  toolsPage: {
    title: { zh: '旅行工具箱', en: 'Travel Tools', ja: '旅行ツール', ko: '여행 도구', fr: 'Outils de voyage', de: 'Reisewerkzeuge', es: 'Herramientas de viaje', ru: 'Инструменты для путешествий' },
    subtitle: { zh: '让你的旅行更便捷', en: 'Make your travel more convenient', ja: '旅行をもっと便利に', ko: '여행をより 편리게', fr: 'Rendre vos voyages plus pratiques', de: 'Machen Sie Ihre Reisen bequemer', es: 'Haz tu viaje más conveniente', ru: 'Сделайте путешествия удобнее' },
    currency: { zh: '汇率换算', en: 'Currency Converter', ja: '通貨換算', ko: '환율 계산', fr: 'Convertisseur de devises', de: 'Währungsrechner', es: 'Conversor de moneda', ru: 'Конвертер валют' },
    budget: { zh: '预算规划', en: 'Budget Planner', ja: '予算計画', ko: '예산 계획', fr: 'Planificateur de budget', de: 'Budgetplaner', es: 'Planificador de presupuesto', ru: 'Планировщик бюджета' },
    packing: { zh: '行李清单', en: 'Packing List', ja: '持ち物リスト', ko: '짐 싸기 리스트', fr: 'Liste de bagages', de: 'Packliste', es: 'Lista de equipaje', ru: 'Список вещей' }
  },

  // ===== 知识页面 =====
  knowledgePage: {
    title: { zh: '旅行知识', en: 'Travel Knowledge', ja: '旅行の知識', ko: '여행 지식', fr: 'Connaissances de voyage', de: 'Reisewissen', es: 'Conocimientos de viaje', ru: 'Знания о путешествиях' },
    subtitle: { zh: '获取实用旅行技巧和建议', en: 'Get practical travel tips and advice', ja: '実践的な旅行のヒントとアドバイス', ko: '실용적인 여행 팁과 조언을 얻으세요', fr: 'Obtenez des conseils pratiques', de: 'Praktische Tipps und Ratschläge erhalten', es: 'Obtén consejos prácticos de viaje', ru: 'Получите практические советы' },
    categories: { zh: '分类', en: 'Categories', ja: 'カテゴリー', ko: '카테고리', fr: 'Catégories', de: 'Kategorien', es: 'Categorías', ru: 'Категории' },
    articles: { zh: '文章', en: 'Articles', ja: '記事', ko: '기사', fr: 'Articles', de: 'Artikel', es: 'Artículos', ru: 'Статьи' }
  },

  // ===== 关于页面 =====
  aboutPage: {
    title: { zh: '关于游导', en: 'About YouDao', ja: 'ユーダオについて', ko: '유도 소개', fr: 'À propos de YouDao', de: 'Über YouDao', es: 'Sobre YouDao', ru: 'О YouDao' },
    subtitle: { zh: '连接旅行者与专业导游的平台', en: 'A platform connecting travelers with professional guides', ja: '旅行者とプロガイドを繋ぐプラットフォーム', ko: '여행자와 전문 가이드를 연결하는 플랫폼', fr: 'Une plateforme connectant voyageurs et guides professionnels', de: 'Eine Plattform, die Reisende mit professionellen Führern verbindet', es: 'Una plataforma que conecta viajeros con guías profesionales', ru: 'Платформа, соединяющая путешественников с профессиональными гидами' },
    mission: { zh: '我们的使命', en: 'Our Mission', ja: '私たちの使命', ko: '우리의 사명', fr: 'Notre mission', de: 'Unsere Mission', es: 'Nuestra misión', ru: 'Наша миссия' },
    team: { zh: '团队介绍', en: 'Our Team', ja: 'チーム紹介', ko: '팀 소개', fr: 'Notre équipe', de: 'Unser Team', es: 'Nuestro equipo', ru: 'Наша команда' }
  },

  // ===== 错误页面 =====
  errors: {
    notFound: { zh: '页面未找到', en: 'Page Not Found', ja: 'ページが見つかりません', ko: '페이지를 찾을 수 없습니다', fr: 'Page non trouvée', de: 'Seite nicht gefunden', es: 'Página no encontrada', ru: 'Страница не найдена' },
    serverError: { zh: '服务器错误', en: 'Server Error', ja: 'サーバーエラー', ko: '서버 오류', fr: 'Erreur serveur', de: 'Serverfehler', es: 'Error del servidor', ru: 'Ошибка сервера' },
    goHome: { zh: '返回首页', en: 'Go Home', ja: 'ホームに戻る', ko: '홈으로 가기', fr: 'Retour à l\'accueil', de: 'Zurück zur Startseite', es: 'Volver al inicio', ru: 'Вернуться на главную' },
    tryAgain: { zh: '请稍后重试', en: 'Please try again later', ja: '後でもう一度お試しください', ko: '나중에 다시 시도해 주세요', fr: 'Veuillez réessayer plus tard', de: 'Bitte versuchen Sie es später erneut', es: 'Por favor, inténtelo de nuevo más tarde', ru: 'Пожалуйста, попробуйте позже' }
  },

  // ===== 导游详情页 =====
  guideDetail: {
    specialties: { zh: '擅长领域', en: 'Specialties', ja: '得意分野', ko: '전문 분야', fr: 'Spécialités', de: 'Spezzialitäten', es: 'Especialidades', ru: 'Специализации' },
    languages: { zh: '语言能力', en: 'Languages', ja: '言語能力', ko: '언어 능력', fr: 'Langues', de: 'Sprachen', es: 'Idiomas', ru: 'Языки' },
    experience: { zh: '从业经验', en: 'Experience', ja: '経験', ko: '경력', fr: 'Expérience', de: 'Erfahrung', es: 'Experiencia', ru: 'Опыт' },
    certifications: { zh: '资质认证', en: 'Certifications', ja: '資格', ko: '자격', fr: 'Certifications', de: 'Zertifizierungen', es: 'Certificaciones', ru: 'Сертификаты' },
    reviews: { zh: '用户评价', en: 'Reviews', ja: 'レビュー', ko: '리뷰', fr: 'Avis', de: 'Bewertungen', es: 'Reseñas', ru: 'Отзывы' },
    availability: { zh: '可预约时间', en: 'Availability', ja: '予約可能時間', ko: '예약 가능 시간', fr: 'Disponibilité', de: 'Verfügbarkeit', es: 'Disponibilidad', ru: 'Доступность' },
    bookGuide: { zh: '预约导游', en: 'Book Guide', ja: 'ガイドを予約', ko: '가이드 예약', fr: 'Réserver un guide', de: 'Führer buchen', es: 'Reservar guía', ru: 'Забронировать гида' }
  },

  // ===== 预订流程 =====
  booking: {
    selectDate: { zh: '选择日期', en: 'Select Date', ja: '日付を選択', ko: '날짜 선택', fr: 'Sélectionner la date', de: 'Datum auswählen', es: 'Seleccionar fecha', ru: 'Выбрать дату' },
    selectTime: { zh: '选择时间', en: 'Select Time', ja: '時間を選択', ko: '시간 선택', fr: 'Sélectionner l\'heure', de: 'Zeit auswählen', es: 'Seleccionar hora', ru: 'Выбрать время' },
    numberOfPeople: { zh: '人数', en: 'Number of People', ja: '人数', ko: '인원', fr: 'Nombre de personnes', de: 'Personenzahl', es: 'Número de personas', ru: 'Количество человек' },
    totalPrice: { zh: '总价', en: 'Total Price', ja: '合計金額', ko: '총 가격', fr: 'Prix total', de: 'Gesamtpreis', es: 'Precio total', ru: 'Общая цена' },
    confirmBooking: { zh: '确认预订', en: 'Confirm Booking', ja: '予約確認', ko: '예약 확인', fr: 'Confirmer la réservation', de: 'Buchung bestätigen', es: 'Confirmar reserva', ru: 'Подтвердить бронирование' },
    bookingSuccess: { zh: '预订成功', en: 'Booking Successful', ja: '予約完了', ko: '예약 성공', fr: 'Réservation réussie', de: 'Buchung erfolgreich', es: 'Reserva exitosa', ru: 'Бронирование успешно' },
    bookingFailed: { zh: '预订失败', en: 'Booking Failed', ja: '予約に失敗しました', ko: '예약 실패', fr: 'Échec de la réservation', de: 'Buchung fehlgeschlagen', es: 'Reserva fallida', ru: 'Ошибка бронирования' }
  },

  // ===== 通知消息 =====
  notifications: {
    welcome: { zh: '欢迎回来', en: 'Welcome back', ja: 'おかえりなさい', ko: '다시 오신 것을 환영합니다', fr: 'Bienvenue', de: 'Willkommen zurück', es: 'Bienvenido de nuevo', ru: 'С возвращением' },
    logoutSuccess: { zh: '已安全退出', en: 'Logged out successfully', ja: 'ログアウトしました', ko: '로그아웃되었습니다', fr: 'Déconnexion réussie', de: 'Erfolgreich abgemeldet', es: 'Sesión cerrada', ru: 'Вы вышли успешно' },
    saveSuccess: { zh: '保存成功', en: 'Saved successfully', ja: '保存しました', ko: '저장되었습니다', fr: 'Enregistré avec succès', de: 'Erfolgreich gespeichert', es: 'Guardado exitosamente', ru: 'Успешно сохранено' },
    deleteConfirm: { zh: '确定要删除吗？', en: 'Are you sure you want to delete?', ja: '削除してもよろしいですか？', ko: '정말 삭제하시겠습니까?', fr: 'Êtes-vous sûr de vouloir supprimer ?', de: 'Sind Sie sicher, dass Sie löschen möchten?', es: '¿Estás seguro de que quieres eliminar?', ru: 'Вы уверены, что хотите удалить?' }
  },

  // ===== 社交媒体标题 =====
  social: {
    wechat: { zh: '微信公众号', en: 'WeChat', ja: '微信公式アカウント', ko: '위챗 공식 계정', fr: 'WeChat', de: 'WeChat', es: 'WeChat', ru: 'WeChat' },
    weibo: { zh: '微博', en: 'Weibo', ja: '微博', ko: '웨이보', fr: 'Weibo', de: 'Weibo', es: 'Weibo', ru: 'Weibo' },
    xiaohongshu: { zh: '小红书', en: 'Xiaohongshu', ja: '小红書', ko: '샤오훙슈', fr: 'Xiaohongshu', de: 'Xiaohongshu', es: 'Xiaohongshu', ru: 'Xiaohongshu' }
  },

  // ===== 工具页面 =====
  tools: {
    weather: { zh: '天气预报', en: 'Weather Forecast', ja: '天気予報', ko: '날씨 예보', fr: 'Prévisions météo', de: 'Wettervorhersage', es: 'Pronóstico del tiempo', ru: 'Прогноз погоды' },
    exchange: { zh: '汇率换算', en: 'Currency Exchange', ja: '通貨換算', ko: '환율 계산', fr: 'Conversion de devises', de: 'Währungsumrechnung', es: 'Cambio de divisas', ru: 'Конвертация валют' },
    worldClock: { zh: '世界时钟', en: 'World Clock', ja: '世界時計', ko: '세계 시계', fr: 'Horloge mondiale', de: 'Weltzeituhr', es: 'Reloj mundial', ru: 'Мировые часы' }
  },

  // ===== 本地化相关 =====
  localization: {
    // 货币
    currency: {
      CNY: { zh: '人民币', en: 'Chinese Yuan', ja: '中国元', ko: '위안', fr: 'Yuan chinois', de: 'Chinesischer Yuan', es: 'Yuan chino', ru: 'Китайский юань' },
      USD: { zh: '美元', en: 'US Dollar', ja: '米ドル', ko: '달러', fr: 'Dollar américain', de: 'US-Dollar', es: 'Dólar estadounidense', ru: 'Доллар США' },
      EUR: { zh: '欧元', en: 'Euro', ja: 'ユーロ', ko: '유로', fr: 'Euro', de: 'Euro', es: 'Euro', ru: 'Евро' },
      GBP: { zh: '英镑', en: 'British Pound', ja: '英ポンド', ko: '파운드', fr: 'Livre sterling', de: 'Britisches Pfund', es: 'Libra esterlina', ru: 'Британский фунт' },
      JPY: { zh: '日元', en: 'Japanese Yen', ja: '日本円', ko: '엔화', fr: 'Yen japonais', de: 'Japanischer Yen', es: 'Yen japonés', ru: 'Японская иена' },
      KRW: { zh: '韩元', en: 'Korean Won', ja: '韓国ウォン', ko: '원화', fr: 'Won sud-coréen', de: 'Südkoreanischer Won', es: 'Won coreano', ru: 'Южнокорейская вона' },
      THB: { zh: '泰铢', en: 'Thai Baht', ja: 'バーツ', ko: '바트', fr: 'Baht thaïlandais', de: 'Thailändischer Baht', es: 'Baht tailandés', ru: 'Тайский бат' },
      RUB: { zh: '卢布', en: 'Russian Ruble', ja: 'ルーブル', ko: '루블', fr: 'Rouble russe', de: 'Russischer Rubel', es: 'Rublo ruso', ru: 'Российский рубль' }
    },
    // 度量单位
    units: {
      distance: {
        km: { zh: '公里', en: 'km', ja: 'km', ko: 'km', fr: 'km', de: 'km', es: 'km', ru: 'км' },
        mi: { zh: '英里', en: 'miles', ja: 'マイル', ko: '마일', fr: 'miles', de: 'Meilen', es: 'millas', ru: 'миль' },
        m: { zh: '米', en: 'meters', ja: 'メートル', ko: '미터', fr: 'mètres', de: 'Meter', es: 'metros', ru: 'метров' }
      },
      weight: {
        kg: { zh: '公斤', en: 'kg', ja: 'kg', ko: 'kg', fr: 'kg', de: 'kg', es: 'kg', ru: 'кг' },
        lb: { zh: '磅', en: 'pounds', ja: 'ポンド', ko: '파운드', fr: 'livres', de: 'Pfund', es: 'libras', ru: 'фунтов' }
      },
      temperature: {
        celsius: { zh: '摄氏度', en: '°C', ja: '℃', ko: '℃', fr: '°C', de: '°C', es: '°C', ru: '°C' },
        fahrenheit: { zh: '华氏度', en: '°F', ja: '℉', ko: '℉', fr: '°F', de: '°F', es: '°F', ru: '°F' }
      }
    },
    // 日期格式
    dateFormats: {
      short: { zh: 'YYYY/MM/DD', en: 'MM/DD/YYYY', ja: 'YYYY/MM/DD', ko: 'YYYY.MM.DD', fr: 'DD/MM/YYYY', de: 'DD.MM.YYYY', es: 'DD/MM/YYYY', ru: 'DD.MM.YYYY' },
      long: { zh: 'YYYY年MM月DD日', en: 'MMMM DD, YYYY', ja: 'YYYY年MM月DD日', ko: 'YYYY년 MM월 DD일', fr: 'DD MMMM YYYY', de: 'DD. MMMM YYYY', es: 'DD [de] MMMM [de] YYYY', ru: 'DD MMMM YYYY г.' },
      time: { zh: 'HH:mm', en: 'h:mm A', ja: 'HH:mm', ko: 'HH:mm', fr: 'HH:mm', de: 'HH:mm', es: 'HH:mm', ru: 'HH:mm' }
    }
  },

  // ===== SEO 相关 =====
  seo: {
    keywords: {
      zh: '游导,旅游,导游,旅行,自由行,定制游,出境游,入境游',
      en: 'YouDao, travel, guide, tour, custom trip, abroad travel',
      ja: 'ユーダオ、旅行、ガイド、ツアー、custome、海外旅行',
      ko: '유도, 여행, 가이드,ツアー, 커스텀 여행, 해외여행',
      fr: 'YouDao, voyage, guide, tourisme, voyage personnalisé',
      de: 'YouDao, Reisen, Führer, Tour, Individualreise',
      es: 'YouDao, viaje, guía, turismo, viaje personalizado',
      ru: 'YouDao, путешествия, гид, тур, индивидуальное путешествие'
    },
    description: {
      zh: '游导旅游 - 连接优秀导游与旅行者，让每一次出发都充满期待',
      en: 'YouDao Travel - Connect with expert guides for unforgettable journeys',
      ja: 'ユーダオ travel - 優れたガイドと旅行者を繋ぎます',
      ko: '유도 여행 - 우수한 가이드와 여행자를 연결합니다',
      fr: 'YouDao Travel - Connectez-vous avec des guides experts pour des voyages inoubliables',
      de: 'YouDao Travel - Verbinden Sie sich mit Expertenführern für unvergessliche Reisen',
      es: 'YouDao Travel - Conecta con guías expertos para viajes inolvidables',
      ru: 'YouDao Travel - Свяжитесь с опытными гидами для незабываемых путешествий'
    }
  }
};

// ==================== 本地化工具类 ====================
class Localizer {
  constructor() {
    this.currencySymbols = {
      CNY: '¥',
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      KRW: '₩',
      THB: '฿',
      RUB: '₽'
    };

    this.locales = {
      zh: 'zh-CN',
      en: 'en-US',
      ja: 'ja-JP',
      ko: 'ko-KR',
      fr: 'fr-FR',
      de: 'de-DE',
      es: 'es-ES',
      ru: 'ru-RU'
    };

    this.timezones = {
      zh: 'Asia/Shanghai',
      en: 'America/New_York',
      ja: 'Asia/Tokyo',
      ko: 'Asia/Seoul',
      fr: 'Europe/Paris',
      de: 'Europe/Berlin',
      es: 'Europe/Madrid',
      ru: 'Europe/Moscow'
    };
  }

  // 获取当前区域设置
  getLocale() {
    const lang = i18n.getLang();
    return this.locales[lang] || 'zh-CN';
  }

  // 获取货币符号
  getCurrencySymbol(currency) {
    return this.currencySymbols[currency] || currency;
  }

  // 格式化货币
  formatCurrency(amount, currency = 'CNY') {
    const lang = i18n.getLang();
    try {
      return new Intl.NumberFormat(this.locales[lang], {
        style: 'currency',
        currency: currency
      }).format(amount);
    } catch (e) {
      return `${this.getCurrencySymbol(currency)}${amount}`;
    }
  }

  // 格式化和转换货币
  convertCurrency(amount, fromCurrency, toCurrency) {
    // 这里应该调用真实的汇率API
    // 简化版本，使用固定汇率
    const rates = {
      CNY: 1,
      USD: 7.2,
      EUR: 7.8,
      GBP: 9.0,
      JPY: 0.048,
      KRW: 0.0054,
      THB: 0.20,
      RUB: 0.080
    };

    if (!rates[fromCurrency] || !rates[toCurrency]) {
      return amount;
    }

    const inCNY = amount * rates[fromCurrency];
    const converted = inCNY / rates[toCurrency];
    return converted.toFixed(2);
  }

  // 格式化日期
  formatDate(date, formatType = 'short') {
    const lang = i18n.getLang();
    const d = date instanceof Date ? date : new Date(date);

    const formats = translations.localization.dateFormats[formatType];
    if (!formats) return d.toLocaleDateString();

    const pattern = formats[lang] || formats.zh;

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    return pattern
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH:mm', `${hours}:${minutes}`)
      .replace('MMMM', d.toLocaleDateString(this.locales[lang], { month: 'long' }));
  }

  // 格式化时间
  formatTime(date) {
    const lang = i18n.getLang();
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleTimeString(this.locales[lang], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // 获取时区
  getTimezone() {
    const lang = i18n.getLang();
    return this.timezones[lang] || 'Asia/Shanghai';
  }

  // 获取世界时钟时间
  getWorldTime(city, timezone) {
    try {
      return new Date().toLocaleTimeString(this.locales[i18n.getLang()], {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (e) {
      return '--:--:--';
    }
  }

  // 转换度量单位
  convertUnit(value, unitType, fromSystem = 'metric') {
    if (fromSystem === 'metric') {
      return value;
    }
    // 英制转换
    switch (unitType) {
      case 'distance':
        return value * 1.60934; // km to miles
      case 'weight':
        return value * 0.453592; // kg to pounds
      case 'temperature':
        return (value - 32) * 5 / 9; // Fahrenheit to Celsius
      default:
        return value;
    }
  }

  // 距离格式化
  formatDistance(km) {
    const lang = i18n.getLang();
    const unit = translations.localization.units.distance;
    
    if (lang === 'en' || lang === 'es') {
      const miles = (km * 0.621371).toFixed(1);
      return `${miles} ${unit.mi[lang]}`;
    }
    return `${km.toFixed(1)} ${unit.km[lang]}`;
  }

  // 温度格式化
  formatTemperature(celsius) {
    const lang = i18n.getLang();
    
    if (lang === 'en') {
      const fahrenheit = (celsius * 9 / 5 + 32).toFixed(0);
      return `${fahrenheit}°F`;
    }
    return `${celsius.toFixed(0)}°C`;
  }
}

// ==================== 多语言 SEO 类 ====================
class I18nSEO {
  constructor() {
    this.alternateUrls = {};
    this.defaultUrl = 'https://youdautravel.com';
  }

  // 生成 hreflang 标签
  generateHreflangTags() {
    const currentPath = window.location.pathname;
    const tags = [];

    // 添加 x-default
    tags.push(`<link rel="alternate" hreflang="x-default" href="${this.defaultUrl}${currentPath}" />`);

    // 添加各语言版本
    Object.keys(I18N_CONFIG.langCodes).forEach(lang => {
      const url = `${this.defaultUrl}/${lang}${currentPath}`;
      tags.push(`<link rel="alternate" hreflang="${I18N_CONFIG.langCodes[lang]}" href="${url}" />`);
    });

    return tags.join('\n');
  }

  // 更新 meta 标签
  updateMetaTags() {
    const lang = i18n.getLang();

    // 更新 keywords
    const keywordsEl = document.querySelector('meta[name="keywords"]');
    if (keywordsEl && translations.seo.keywords[lang]) {
      keywordsEl.content = translations.seo.keywords[lang];
    }

    // 更新 description
    const descEl = document.querySelector('meta[name="description"]');
    if (descEl && translations.seo.description[lang]) {
      descEl.content = translations.seo.description[lang];
    }

    // 更新 og:locale
    const ogLocaleEl = document.querySelector('meta[property="og:locale"]');
    if (ogLocaleEl) {
      ogLocaleEl.content = I18N_CONFIG.langCodes[lang];
    }

    // 更新文档语言
    document.documentElement.lang = I18N_CONFIG.langCodes[lang];
  }

  // 生成站点地图 URL
  generateSitemapUrls() {
    const pages = [
      '', '/guides', '/routes', '/visa', '/knowledge', '/tools', '/about', '/contact',
      '/login', '/register', '/blog', '/faq', '/help'
    ];

    const urls = [];

    Object.keys(I18N_CONFIG.langCodes).forEach(lang => {
      pages.forEach(page => {
        urls.push({
          lang: lang,
          url: `${this.defaultUrl}/${lang}${page}`,
          priority: page === '' ? '1.0' : '0.8',
          changefreq: 'weekly'
        });
      });
    });

    return urls;
  }
}

// ==================== i18n 核心类 ====================
class I18n {
  constructor() {
    this.currentLang = this.getStoredLang();
    this.isTransitioning = false;
    this.localizer = new Localizer();
    this.seo = new I18nSEO();
  }

  // 获取存储的语言
  getStoredLang() {
    const stored = localStorage.getItem(I18N_CONFIG.storageKey);
    if (stored && I18N_CONFIG.supportedLangs.includes(stored)) {
      return stored;
    }
    return this.detectBrowserLang();
  }

  // 检测浏览器语言
  detectBrowserLang() {
    const browserLang = navigator.language.toLowerCase();
    const browserLangOnly = browserLang.split('-')[0];

    // 精确匹配
    for (const lang of I18N_CONFIG.supportedLangs) {
      if (browserLang.startsWith(lang) || browserLangOnly === lang) {
        return lang;
      }
    }

    // 默认中文
    return I18N_CONFIG.defaultLang;
  }

  // 保存语言偏好
  setLang(lang, withAnimation = true) {
    if (!I18N_CONFIG.supportedLangs.includes(lang)) {
      console.warn(`Language '${lang}' is not supported`);
      return;
    }

    if (lang === this.currentLang) return;

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
    localStorage.setItem('youdao_locale', this.localizer.getLocale());

    this.updatePage();
    this.updateLangButtons();
    this.updateLanguageDisplay();
    this.seo.updateMetaTags();

    // 触发语言切换事件
    window.dispatchEvent(new CustomEvent('langChange', {
      detail: {
        lang,
        locale: this.localizer.getLocale(),
        timezone: this.localizer.getTimezone()
      }
    }));

    // 通知数据组件刷新
    window.dispatchEvent(new CustomEvent('localeChange', {
      detail: { lang }
    }));
  }

  // 语言切换动画
  animateTransition(callback) {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    const overlay = document.createElement('div');
    overlay.id = 'i18n-transition-overlay';
    overlay.innerHTML = `
      <div class="i18n-transition-content">
        <div class="i18n-loader">
          <div class="i18n-dot"></div>
          <div class="i18n-dot"></div>
          <div class="i18n-dot"></div>
        </div>
        <span class="i18n-text">${this.t('common.loading')}</span>
      </div>
    `;
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.98);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.25s ease;
      pointer-events: none;
    `;

    const content = overlay.querySelector('.i18n-transition-content');
    content.style.cssText = `
      text-align: center;
      transform: scale(0.9);
      transition: transform 0.25s ease;
    `;

    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      content.style.transform = 'scale(1)';
    });

    setTimeout(() => {
      callback();

      setTimeout(() => {
        overlay.style.opacity = '0';
        content.style.transform = 'scale(0.9)';
        setTimeout(() => {
          overlay.remove();
          this.isTransitioning = false;
        }, 250);
      }, 100);
    }, 250);
  }

  // 获取翻译
  t(key) {
    const keys = key.split('.');
    let value = translations;

    for (const k of keys) {
      if (value && value[k]) {
        value = value[k];
      } else {
        return key;
      }
    }

    if (value && value[this.currentLang]) {
      return value[this.currentLang];
    }

    if (value && value.zh) {
      return value.zh;
    }

    return key;
  }

  // 获取带变量的翻译
  tpl(key, params = {}) {
    let text = this.t(key);
    Object.keys(params).forEach(param => {
      text = text.replace(new RegExp(`{${param}}`, 'g'), params[param]);
    });
    return text;
  }

  // 更新页面所有标记了 data-i18n 的元素
  updatePage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = this.t(key);
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.placeholder = this.t(key);
    });

    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      el.title = this.t(key);
    });

    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      el.innerHTML = this.t(key);
    });

    document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
      const key = el.getAttribute('data-i18n-aria-label');
      el.setAttribute('aria-label', this.t(key));
    });

    // 更新数字格式
    this.updateNumberFormats();
  }

  // 更新数字格式
  updateNumberFormats() {
    document.querySelectorAll('[data-i18n-number]').forEach(el => {
      const num = parseFloat(el.dataset.i18nNumber);
      if (!isNaN(num)) {
        el.textContent = this.localizer.formatCurrency(num, el.dataset.currency || 'CNY');
      }
    });
  }

  // 更新语言切换按钮状态
  updateLangButtons() {
    document.querySelectorAll('[data-lang-btn]').forEach(btn => {
      const lang = btn.getAttribute('data-lang');
      btn.classList.toggle('active', lang === this.currentLang);
    });

    document.querySelectorAll('.lang-option').forEach(opt => {
      const lang = opt.getAttribute('data-lang');
      opt.classList.toggle('active', lang === this.currentLang);
    });

    document.querySelectorAll('.lang-btn').forEach(btn => {
      const lang = btn.getAttribute('data-lang');
      btn.classList.toggle('active', lang === this.currentLang);
    });
  }

  // 更新语言显示
  updateLanguageDisplay() {
    const langText = document.getElementById('currentLangText');
    if (langText) {
      langText.textContent = I18N_CONFIG.langNames[this.currentLang];
    }

    const langFlag = document.getElementById('currentLangFlag');
    if (langFlag) {
      langFlag.textContent = I18N_CONFIG.langFlags[this.currentLang];
    }

    // 更新语言选择器
    document.querySelectorAll('.lang-selector').forEach(sel => {
      sel.value = this.currentLang;
    });
  }

  // 获取当前语言
  getLang() {
    return this.currentLang;
  }

  // 获取语言名称
  getLangName(lang) {
    return I18N_CONFIG.langNames[lang] || lang;
  }

  // 获取语言名称（当前）
  getCurrentLangName() {
    return I18N_CONFIG.langNames[this.currentLang];
  }

  // 获取语言标志
  getLangFlag(lang) {
    return I18N_CONFIG.langFlags[lang] || '🌐';
  }

  // 获取所有支持的语言
  getSupportedLangs() {
    return I18N_CONFIG.supportedLangs;
  }

  // 获取完整的语言信息
  getLangInfo(lang) {
    return {
      code: lang,
      name: I18N_CONFIG.langNames[lang],
      flag: I18N_CONFIG.langFlags[lang],
      locale: this.localizer.locales[lang],
      timezone: this.localizer.timezones[lang]
    };
  }

  // 语言检测
  detectLanguage() {
    return this.detectBrowserLang();
  }

  // 获取翻译统计
  getTranslationStats() {
    const stats = {};
    const categories = Object.keys(translations);

    categories.forEach(cat => {
      const keys = Object.keys(translations[cat]);
      stats[cat] = {
        total: keys.length,
        languages: {}
      };

      I18N_CONFIG.supportedLangs.forEach(lang => {
        let filled = 0;
        keys.forEach(key => {
          if (translations[cat][key] && translations[cat][key][lang]) {
            filled++;
          }
        });
        stats[cat].languages[lang] = {
          filled,
          percentage: Math.round((filled / keys.length) * 100)
        };
      });
    });

    return stats;
  }

  // 导出翻译数据
  exportTranslations(lang) {
    const data = {};
    Object.keys(translations).forEach(cat => {
      data[cat] = {};
      Object.keys(translations[cat]).forEach(key => {
        if (translations[cat][key][lang]) {
          data[cat][key] = translations[cat][key][lang];
        }
      });
    });
    return data;
  }

  // 导入翻译数据
  importTranslations(lang, data) {
    Object.keys(data).forEach(cat => {
      if (!translations[cat]) {
        translations[cat] = {};
      }
      Object.keys(data[cat]).forEach(key => {
        if (!translations[cat][key]) {
          translations[cat][key] = {};
        }
        translations[cat][key][lang] = data[cat][key];
      });
    });
  }
}

// ==================== 语言切换器组件 ====================
class LanguageSwitcher {
  constructor(container) {
    this.container = container;
    this.isOpen = false;
    this.init();
  }

  init() {
    this.render();
    this.bindEvents();
  }

  render() {
    if (!this.container) return;

    const currentLang = i18n.getLang();
    const currentInfo = i18n.getLangInfo(currentLang);

    this.container.innerHTML = `
      <div class="language-switcher" id="languageSwitcher">
        <button class="lang-switch-trigger" id="langSwitchTrigger" aria-expanded="false" aria-haspopup="listbox">
          <span class="lang-flag">${currentInfo.flag}</span>
          <span class="lang-name">${currentInfo.name}</span>
          <span class="lang-arrow">▼</span>
        </button>
        <div class="lang-switch-dropdown" id="langSwitchDropdown" role="listbox">
          ${I18N_CONFIG.supportedLangs.map(lang => {
            const info = i18n.getLangInfo(lang);
            return `
              <button class="lang-option ${lang === currentLang ? 'active' : ''}"
                      data-lang="${lang}"
                      role="option"
                      aria-selected="${lang === currentLang}">
                <span class="lang-flag">${info.flag}</span>
                <span class="lang-name">${info.name}</span>
                ${lang === currentLang ? '<span class="lang-check">✓</span>' : ''}
              </button>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  bindEvents() {
    const trigger = document.getElementById('langSwitchTrigger');
    const dropdown = document.getElementById('langSwitchDropdown');

    if (trigger) {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggle();
      });
    }

    if (dropdown) {
      dropdown.querySelectorAll('.lang-option').forEach(option => {
        option.addEventListener('click', (e) => {
          const lang = e.currentTarget.dataset.lang;
          i18n.setLang(lang);
          this.close();
        });
      });
    }

    // 点击外部关闭
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.language-switcher')) {
        this.close();
      }
    });

    // 键盘导航
    this.container.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
    });
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    const dropdown = document.getElementById('langSwitchDropdown');
    const trigger = document.getElementById('langSwitchTrigger');
    if (dropdown && trigger) {
      dropdown.classList.add('open');
      trigger.setAttribute('aria-expanded', 'true');
      this.isOpen = true;
    }
  }

  close() {
    const dropdown = document.getElementById('langSwitchDropdown');
    const trigger = document.getElementById('langSwitchTrigger');
    if (dropdown && trigger) {
      dropdown.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
      this.isOpen = false;
    }
  }
}

// ==================== 初始化 ====================
let i18n, localizer;

// DOM 加载完成后初始化
function initI18n() {
  i18n = new I18n();
  localizer = new Localizer();

  // 更新页面
  i18n.updatePage();
  i18n.updateLangButtons();
  i18n.updateLanguageDisplay();

  // 绑定语言切换按钮
  document.querySelectorAll('[data-lang-btn]').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const lang = this.getAttribute('data-lang');
      i18n.setLang(lang);
    });
  });

  document.querySelectorAll('.lang-option, .lang-dropdown .lang-option').forEach(opt => {
    opt.addEventListener('click', function(e) {
      e.preventDefault();
      const lang = this.getAttribute('data-lang');
      i18n.setLang(lang);

      const dropdown = this.closest('.lang-dropdown');
      if (dropdown) {
        dropdown.classList.remove('open');
      }
    });
  });

  // 初始化语言切换器组件
  const switcherContainer = document.getElementById('languageSwitcherContainer');
  if (switcherContainer) {
    new LanguageSwitcher(switcherContainer);
  }

  // 更新 SEO
  i18n.seo.updateMetaTags();

  console.log(`🌐 YouDao Travel i18n initialized: ${i18n.getLang()}`);
}

// 暴露全局
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initI18n);
} else {
  initI18n();
}

// 导出全局
window.i18n = null; // 将在 initI18n 中设置
window.I18N_CONFIG = I18N_CONFIG;
window.translations = translations;
window.Localizer = Localizer;
window.I18nSEO = I18nSEO;
window.LanguageSwitcher = LanguageSwitcher;
