/**
 * 打卡签到系统 - 核心逻辑
 */

class CheckinSystem {
  constructor() {
    this.data = null;
    this.userData = this.loadUserData();
    this.checkinData = this.userData.checkinData || {
      checkinHistory: [],
      spotCheckins: [],
      achievements: [],
      points: 0,
      totalCheckins: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastCheckinDate: null,
      photos: [],
      moods: []
    };
  }

  // 加载打卡数据
  async loadData() {
    try {
      const response = await fetch('../data/checkin.json');
      this.data = await response.json();
      return this.data;
    } catch (error) {
      console.error('加载打卡数据失败:', error);
      return null;
    }
  }

  // 本地存储操作
  loadUserData() {
    const stored = localStorage.getItem('checkin_user_data');
    return stored ? JSON.parse(stored) : {
      checkinData: null,
      userName: '旅行者',
      avatar: '🌍'
    };
  }

  saveUserData() {
    this.userData.checkinData = this.checkinData;
    localStorage.setItem('checkin_user_data', JSON.stringify(this.userData));
  }

  // 获取今日日期字符串
  getToday() {
    return new Date().toISOString().split('T')[0];
  }

  // 检查今日是否已签到
  isCheckedInToday() {
    return this.checkinData.lastCheckinDate === this.getToday();
  }

  // 计算连续签到天数
  calculateStreak() {
    if (!this.checkinData.checkinHistory.length) return 0;
    
    let streak = 0;
    let currentDate = new Date();
    
    // 从昨天开始检查
    currentDate.setDate(currentDate.getDate() - 1);
    
    // 检查历史记录
    for (let i = 0; i < 365; i++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const found = this.checkinData.checkinHistory.find(h => h.date === dateStr);
      
      if (found) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    // 如果今天还没签到但昨天签到了，当前连续天数是上面计算的值
    // 如果今天已签到，需要加1
    if (this.isCheckedInToday()) {
      streak++;
    }
    
    return streak;
  }

  // 计算积分
  calculatePoints(streak) {
    const rules = this.data.points_rules;
    let points = rules.daily_checkin.base;
    
    // 连续签到奖励
    const streakBonus = rules.daily_checkin.streak_bonus;
    for (const [days, bonus] of Object.entries(streakBonus)) {
      if (streak >= parseInt(days)) {
        points += bonus;
      }
    }
    
    // 周末双倍
    const dayOfWeek = new Date().getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      points = Math.floor(points * rules.weekend_multiplier);
    }
    
    // 特殊日期双倍
    const today = this.getToday();
    const specialDate = this.data.special_dates.find(d => d.date === today);
    if (specialDate) {
      points *= specialDate.multiplier;
    }
    
    // 早起奖励（6点前）
    const hour = new Date().getHours();
    if (hour < 6) {
      points += 20;
    }
    
    return Math.floor(points);
  }

  // 执行签到
  doCheckin(mood = null, note = '') {
    if (this.isCheckedInToday()) {
      return { success: false, message: '今日已签到' };
    }

    const today = this.getToday();
    const streak = this.calculateStreak() + 1;
    const points = this.calculatePoints(streak);
    
    // 添加签到记录
    const record = {
      date: today,
      time: new Date().toISOString(),
      streak: streak,
      points: points,
      mood: mood,
      note: note
    };
    
    this.checkinData.checkinHistory.push(record);
    this.checkinData.points += points;
    this.checkinData.totalCheckins++;
    this.checkinData.currentStreak = streak;
    this.checkinData.lastCheckinDate = today;
    
    if (mood && !this.checkinData.moods.includes(mood)) {
      this.checkinData.moods.push(mood);
    }
    
    // 更新最长连续
    if (streak > this.checkinData.longestStreak) {
      this.checkinData.longestStreak = streak;
    }
    
    this.saveUserData();
    
    // 检查成就
    const newAchievements = this.checkAchievements();
    
    return {
      success: true,
      points: points,
      streak: streak,
      newAchievements: newAchievements
    };
  }

  // 景点打卡
  doSpotCheckin(spotId, photo = null, note = '') {
    const spot = this.data.spots.find(s => s.id === spotId);
    if (!spot) {
      return { success: false, message: '景点不存在' };
    }
    
    const existingCheckin = this.checkinData.spotCheckins.find(s => s.spotId === spotId);
    if (existingCheckin) {
      return { success: false, message: '该景点已打卡' };
    }
    
    let points = this.data.points_rules.spot_checkin.base;
    
    // 景点等级奖励
    const rating = spot.rating;
    if (rating === 5) {
      points += this.data.points_rules.spot_checkin.type_bonus['5A'];
    } else if (rating === 4) {
      points += this.data.points_rules.spot_checkin.type_bonus['4A'];
    } else {
      points += this.data.points_rules.spot_checkin.type_bonus['others'];
    }
    
    const record = {
      spotId: spotId,
      spotName: spot.name,
      city: spot.city,
      province: spot.province,
      date: this.getToday(),
      photo: photo,
      note: note
    };
    
    this.checkinData.spotCheckins.push(record);
    this.checkinData.points += points;
    
    // 保存照片
    if (photo) {
      this.checkinData.photos.push({
        url: photo,
        spotId: spotId,
        date: this.getToday()
      });
    }
    
    this.saveUserData();
    
    // 检查成就
    const newAchievements = this.checkAchievements();
    
    return {
      success: true,
      points: points,
      spot: spot,
      newAchievements: newAchievements
    };
  }

  // 检查成就
  checkAchievements() {
    const newAchievements = [];
    const checkinCount = this.checkinData.totalCheckins;
    const spotCount = this.checkinData.spotCheckins.length;
    const streak = this.checkinData.currentStreak;
    const photoCount = this.checkinData.photos.length;
    const moodCount = this.checkinData.moods.length;
    
    // 获取省份数量
    const provinces = [...new Set(this.checkinData.spotCheckins.map(s => s.province))];
    
    for (const achievement of this.data.achievements) {
      if (this.checkinData.achievements.includes(achievement.id)) continue;
      
      let unlocked = false;
      
      switch (achievement.id) {
        case 'first_checkin':
          unlocked = checkinCount >= 1;
          break;
        case 'week_streak':
          unlocked = streak >= 7;
          break;
        case 'month_streak':
          unlocked = streak >= 30;
          break;
        case 'spot_10':
          unlocked = spotCount >= 10;
          break;
        case 'spot_50':
          unlocked = spotCount >= 50;
          break;
        case 'spot_100':
          unlocked = spotCount >= 100;
          break;
        case 'photo_master':
          unlocked = photoCount >= 50;
          break;
        case 'share_master':
          unlocked = (this.checkinData.shareCount || 0) >= 10;
          break;
        case 'mood_collector':
          unlocked = moodCount >= 10;
          break;
        case 'spot_explorer':
          unlocked = provinces.length >= 5;
          break;
      }
      
      if (unlocked) {
        this.checkinData.achievements.push(achievement.id);
        this.checkinData.points += achievement.points;
        newAchievements.push(achievement);
      }
    }
    
    if (newAchievements.length > 0) {
      this.saveUserData();
    }
    
    return newAchievements;
  }

  // 获取日历数据
  getCalendarData(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    
    // 填充空白
    for (let i = 0; i < startDay; i++) {
      days.push({ day: null, signed: false, empty: true });
    }
    
    // 填充日期
    const today = this.getToday();
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const signed = this.checkinData.checkinHistory.some(h => h.date === dateStr);
      const isToday = dateStr === today;
      const isFuture = dateStr > today;
      
      days.push({
        day: day,
        date: dateStr,
        signed: signed,
        today: isToday,
        future: isFuture
      });
    }
    
    return days;
  }

  // 获取连续签到奖励进度
  getStreakProgress() {
    const streak = this.checkinData.currentStreak;
    const rewards = this.data.streak_rewards;
    
    const milestones = Object.keys(rewards).map(Number).sort((a, b) => a - b);
    let nextMilestone = milestones.find(m => m > streak);
    let currentReward = null;
    let progress = 0;
    
    if (!nextMilestone) {
      // 已达成所有里程碑
      return {
        current: streak,
        next: null,
        progress: 100,
        reward: null
      };
    }
    
    // 找到当前达成的里程碑
    for (const m of milestones) {
      if (m <= streak) {
        currentReward = rewards[m];
      }
    }
    
    // 计算进度
    const prevMilestone = currentReward ? parseInt(Object.keys(rewards).find(k => rewards[k] === currentReward)) : 0;
    const progressDays = streak - prevMilestone;
    const totalDays = nextMilestone - prevMilestone;
    progress = Math.round((progressDays / totalDays) * 100);
    
    return {
      current: streak,
      next: nextMilestone,
      progress: progress,
      reward: rewards[nextMilestone]
    };
  }

  // 补签功能
  retroCheckin(date, cost = 10) {
    const checkinDate = new Date(date);
    const today = new Date();
    
    // 不能补签今天或未来的日期
    if (checkinDate >= today) {
      return { success: false, message: '无法补签今天或未来的日期' };
    }
    
    // 检查是否已签到
    const exists = this.checkinData.checkinHistory.some(h => h.date === date);
    if (exists) {
      return { success: false, message: '该日期已签到' };
    }
    
    // 检查积分是否足够
    if (this.checkinData.points < cost) {
      return { success: false, message: '积分不足' };
    }
    
    // 扣除积分并添加记录
    this.checkinData.points -= cost;
    this.checkinData.checkinHistory.push({
      date: date,
      time: new Date().toISOString(),
      retro: true,
      points: -cost
    });
    
    this.saveUserData();
    
    return { success: true };
  }

  // 获取排行榜数据（模拟）
  getLeaderboard() {
    return [
      { rank: 1, name: '旅行者001', avatar: '🏆', score: 5800, badge: '年度冠军' },
      { rank: 2, name: '行走天下', avatar: '🥈', score: 5200, badge: '亚军之星' },
      { rank: 3, name: '风景收藏家', avatar: '🥉', score: 4800, badge: '季军之光' },
      { rank: 4, name: '背包客', avatar: '🎒', score: 4200, badge: '十强达人' },
      { rank: 5, name: '漫游者', avatar: '✈️', score: 3800, badge: '十强达人' },
      { rank: 6, name: '旅途漫漫', avatar: '🌍', score: 3500, badge: '十强达人' },
      { rank: 7, name: '探险家', avatar: '🧭', score: 3200, badge: '十强达人' },
      { rank: 8, name: '行者无疆', avatar: '🗺️', score: 2900, badge: '十强达人' },
      { rank: 9, name: '云游四方', avatar: '☁️', score: 2600, badge: '十强达人' },
      { rank: 10, name: '山水之间', avatar: '🏔️', score: 2300, badge: '十强达人' }
    ];
  }

  // 分享打卡
  shareCheckin(recordId) {
    this.checkinData.shareCount = (this.checkinData.shareCount || 0) + 1;
    this.checkinData.points += this.data.points_rules.share;
    this.saveUserData();
    
    // 检查分享成就
    this.checkAchievements();
    
    return { success: true, points: this.data.points_rules.share };
  }
}

// 导出全局实例
window.CheckinSystem = CheckinSystem;
