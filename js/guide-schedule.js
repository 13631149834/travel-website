/**
 * 导游日程管理系统
 * 包含：添加/编辑/删除日程、设置可预约时间、预约管理、提醒功能
 */

class GuideScheduleManager {
  constructor() {
    this.schedules = this.loadSchedules();
    this.availableSlots = this.loadAvailableSlots();
    this.bookings = this.loadBookings();
    this.currentMonth = new Date();
    this.reminders = this.loadReminders();
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.startReminderChecker();
    this.cleanupExpiredReminders();
  }

  // ==================== 数据存储 ====================
  
  loadSchedules() {
    const data = localStorage.getItem('guideSchedules');
    return data ? JSON.parse(data) : this.getDefaultSchedules();
  }

  loadAvailableSlots() {
    const data = localStorage.getItem('guideAvailableSlots');
    return data ? JSON.parse(data) : [];
  }

  loadBookings() {
    const data = localStorage.getItem('guideBookings');
    return data ? JSON.parse(data) : this.getDefaultBookings();
  }

  loadReminders() {
    const data = localStorage.getItem('guideReminders');
    return data ? JSON.parse(data) : [];
  }

  saveSchedules() {
    localStorage.setItem('guideSchedules', JSON.stringify(this.schedules));
    this.updateRecentSchedules();
  }

  saveAvailableSlots() {
    localStorage.setItem('guideAvailableSlots', JSON.stringify(this.availableSlots));
  }

  saveBookings() {
    localStorage.setItem('guideBookings', JSON.stringify(this.bookings));
  }

  saveReminders() {
    localStorage.setItem('guideReminders', JSON.stringify(this.reminders));
  }

  // 默认数据
  getDefaultSchedules() {
    const today = new Date();
    return [
      {
        id: 's1',
        title: '日本关西深度6日游',
        type: 'tour',
        date: this.formatDate(new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)),
        startTime: '09:00',
        endTime: '18:00',
        location: '关西机场集合',
        description: '包含大阪、京都、奈良三地游览',
        status: 'confirmed',
        participants: 8,
        maxParticipants: 12,
        price: 2999,
        reminder: true,
        reminderTime: 60,
        createdAt: new Date().toISOString()
      },
      {
        id: 's2',
        title: '东京+大阪经典7日',
        type: 'tour',
        date: this.formatDate(new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000)),
        startTime: '08:00',
        endTime: '19:00',
        location: '成田机场接机',
        description: '经典线路，包含富士山一日游',
        status: 'pending',
        participants: 5,
        maxParticipants: 10,
        price: 3999,
        reminder: true,
        reminderTime: 1440,
        createdAt: new Date().toISOString()
      },
      {
        id: 's3',
        title: '客户商务咨询',
        type: 'meeting',
        date: this.formatDate(today),
        startTime: '14:00',
        endTime: '15:00',
        location: '线上会议',
        description: '新客户行程方案洽谈',
        status: 'confirmed',
        participants: 2,
        reminder: true,
        reminderTime: 30,
        createdAt: new Date().toISOString()
      },
      {
        id: 's4',
        title: '京都和服体验半日游',
        type: 'activity',
        date: this.formatDate(new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000)),
        startTime: '10:00',
        endTime: '15:00',
        location: '京都祇园',
        description: '和服租赁+景点讲解',
        status: 'confirmed',
        participants: 3,
        maxParticipants: 6,
        price: 599,
        reminder: false,
        createdAt: new Date().toISOString()
      }
    ];
  }

  getDefaultBookings() {
    const today = new Date();
    return {
      pending: [
        {
          id: 'b1',
          customerName: '张先生',
          customerPhone: '138****8888',
          customerAvatar: '👤',
          scheduleId: 's2',
          scheduleTitle: '东京+大阪经典7日',
          date: this.formatDate(new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000)),
          time: '08:00',
          participants: 2,
          totalPrice: 7998,
          message: '希望安排富士山行程多一些',
          createdAt: new Date(today.getTime() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'b2',
          customerName: '李女士',
          customerPhone: '139****6666',
          customerAvatar: '👩',
          scheduleId: 's4',
          scheduleTitle: '京都和服体验半日游',
          date: this.formatDate(new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000)),
          time: '10:00',
          participants: 1,
          totalPrice: 599,
          message: '需要帮忙预约和服租赁',
          createdAt: new Date(today.getTime() - 5 * 60 * 60 * 1000).toISOString()
        }
      ],
      confirmed: [
        {
          id: 'b3',
          customerName: '王先生',
          customerPhone: '136****1234',
          customerAvatar: '👨',
          scheduleId: 's1',
          scheduleTitle: '日本关西深度6日游',
          date: this.formatDate(new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)),
          time: '09:00',
          participants: 4,
          totalPrice: 11996,
          confirmedAt: new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'b4',
          customerName: '陈女士',
          customerPhone: '137****5678',
          customerAvatar: '👩',
          scheduleId: 's1',
          scheduleTitle: '日本关西深度6日游',
          date: this.formatDate(new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)),
          time: '09:00',
          participants: 2,
          totalPrice: 5998,
          confirmedAt: new Date(today.getTime() - 48 * 60 * 60 * 1000).toISOString()
        }
      ],
      completed: [
        {
          id: 'b5',
          customerName: '刘先生',
          customerPhone: '135****9999',
          customerAvatar: '👨',
          scheduleTitle: '上海一日游',
          date: this.formatDate(new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)),
          participants: 3,
          totalPrice: 899,
          rating: 5,
          completedAt: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'b6',
          customerName: '赵女士',
          customerPhone: '138****7777',
          customerAvatar: '👩',
          scheduleTitle: '杭州西湖半日游',
          date: this.formatDate(new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000)),
          participants: 2,
          totalPrice: 499,
          rating: 4,
          completedAt: new Date(today.getTime() - 13 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    };
  }

  // ==================== 日程操作 ====================

  addSchedule(scheduleData) {
    const schedule = {
      id: 's' + Date.now(),
      ...scheduleData,
      status: 'draft',
      reminder: true,
      reminderTime: 60,
      createdAt: new Date().toISOString()
    };
    this.schedules.push(schedule);
    this.saveSchedules();
    this.createReminder(schedule);
    return schedule;
  }

  updateSchedule(id, updates) {
    const index = this.schedules.findIndex(s => s.id === id);
    if (index !== -1) {
      this.schedules[index] = { ...this.schedules[index], ...updates };
      this.saveSchedules();
      this.updateReminder(id);
      return this.schedules[index];
    }
    return null;
  }

  deleteSchedule(id) {
    const index = this.schedules.findIndex(s => s.id === id);
    if (index !== -1) {
      this.schedules.splice(index, 1);
      this.saveSchedules();
      this.removeReminder(id);
      return true;
    }
    return false;
  }

  getScheduleById(id) {
    return this.schedules.find(s => s.id === id);
  }

  getSchedulesByDate(date) {
    return this.schedules.filter(s => s.date === this.formatDate(new Date(date)));
  }

  getSchedulesByMonth(year, month) {
    return this.schedules.filter(s => {
      const scheduleDate = new Date(s.date);
      return scheduleDate.getFullYear() === year && scheduleDate.getMonth() + 1 === month;
    });
  }

  // ==================== 可预约时段 ====================

  addAvailableSlot(slotData) {
    const slot = {
      id: 'slot' + Date.now(),
      ...slotData,
      createdAt: new Date().toISOString()
    };
    this.availableSlots.push(slot);
    this.saveAvailableSlots();
    return slot;
  }

  updateAvailableSlot(id, updates) {
    const index = this.availableSlots.findIndex(s => s.id === id);
    if (index !== -1) {
      this.availableSlots[index] = { ...this.availableSlots[index], ...updates };
      this.saveAvailableSlots();
      return this.availableSlots[index];
    }
    return null;
  }

  deleteAvailableSlot(id) {
    const index = this.availableSlots.findIndex(s => s.id === id);
    if (index !== -1) {
      this.availableSlots.splice(index, 1);
      this.saveAvailableSlots();
      return true;
    }
    return false;
  }

  getAvailableSlotsByDate(date) {
    return this.availableSlots.filter(s => s.date === this.formatDate(new Date(date)));
  }

  // ==================== 预约管理 ====================

  confirmBooking(bookingId) {
    for (const booking of this.bookings.pending) {
      if (booking.id === bookingId) {
        booking.status = 'confirmed';
        booking.confirmedAt = new Date().toISOString();
        
        // 更新到已确认列表
        this.bookings.confirmed.push(booking);
        this.bookings.pending = this.bookings.pending.filter(b => b.id !== bookingId);
        
        this.saveBookings();
        
        // 创建出发提醒
        this.createBookingReminder(booking, '出发提醒');
        
        return booking;
      }
    }
    return null;
  }

  rejectBooking(bookingId, reason = '') {
    const index = this.bookings.pending.findIndex(b => b.id === bookingId);
    if (index !== -1) {
      const booking = this.bookings.pending[index];
      booking.status = 'rejected';
      booking.rejectedAt = new Date().toISOString();
      booking.rejectReason = reason;
      this.saveBookings();
      return true;
    }
    return false;
  }

  completeBooking(bookingId, rating = null) {
    for (const booking of this.bookings.confirmed) {
      if (booking.id === bookingId) {
        booking.status = 'completed';
        booking.completedAt = new Date().toISOString();
        booking.rating = rating;
        
        this.bookings.completed.unshift(booking);
        this.bookings.confirmed = this.bookings.confirmed.filter(b => b.id !== bookingId);
        
        this.saveBookings();
        return booking;
      }
    }
    return null;
  }

  getBookingById(id) {
    const all = [...this.bookings.pending, ...this.bookings.confirmed, ...this.bookings.completed];
    return all.find(b => b.id === id);
  }

  // ==================== 提醒系统 ====================

  createReminder(schedule) {
    if (!schedule.reminder) return;
    
    const reminder = {
      id: 'reminder_' + schedule.id,
      scheduleId: schedule.id,
      type: 'schedule',
      title: schedule.title,
      message: `您有行程「${schedule.title}」将于 ${schedule.startTime} 开始`,
      triggerTime: this.calculateReminderTime(schedule.date, schedule.startTime, schedule.reminderTime),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    this.reminders.push(reminder);
    this.saveReminders();
  }

  updateReminder(scheduleId) {
    this.removeReminder(scheduleId);
    const schedule = this.getScheduleById(scheduleId);
    if (schedule) {
      this.createReminder(schedule);
    }
  }

  removeReminder(scheduleId) {
    this.reminders = this.reminders.filter(r => r.scheduleId !== scheduleId);
    this.saveReminders();
  }

  createBookingReminder(booking, type) {
    const schedule = this.getScheduleById(booking.scheduleId);
    const reminderTime = schedule ? 
      this.calculateReminderTime(schedule.date, schedule.startTime, 60) :
      new Date(new Date(booking.date).getTime() - 60 * 60 * 1000).toISOString();
    
    const reminder = {
      id: 'reminder_booking_' + booking.id,
      bookingId: booking.id,
      type: type === '出发提醒' ? 'departure' : 'booking',
      title: type,
      message: `${type}：${booking.customerName} 预约的「${booking.scheduleTitle}」将于明天开始`,
      triggerTime: reminderTime,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    this.reminders.push(reminder);
    this.saveReminders();
  }

  createChangeNotification(scheduleId, changeType, details) {
    const schedule = this.getScheduleById(scheduleId);
    if (!schedule) return;

    const notification = {
      id: 'notif_' + Date.now(),
      scheduleId: scheduleId,
      type: 'change',
      title: '日程变更通知',
      message: `行程「${schedule.title}」${changeType}：${details}`,
      triggerTime: new Date().toISOString(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    this.reminders.push(notification);
    this.saveReminders();
  }

  calculateReminderTime(date, time, minutesBefore) {
    const dateTime = new Date(`${date}T${time}`);
    return new Date(dateTime.getTime() - minutesBefore * 60 * 1000).toISOString();
  }

  startReminderChecker() {
    // 每分钟检查一次提醒
    setInterval(() => this.checkReminders(), 60000);
    // 页面加载时立即检查
    this.checkReminders();
  }

  checkReminders() {
    const now = new Date();
    
    this.reminders.forEach(reminder => {
      if (reminder.status === 'pending') {
        const triggerTime = new Date(reminder.triggerTime);
        if (triggerTime <= now) {
          this.triggerReminder(reminder);
        }
      }
    });
  }

  triggerReminder(reminder) {
    reminder.status = 'triggered';
    this.saveReminders();

    // 显示浏览器通知
    if (Notification.permission === 'granted') {
      new Notification(reminder.title, {
        body: reminder.message,
        icon: 'images/icon-192.png',
        badge: 'images/icon-192.png',
        tag: reminder.id
      });
    }

    // 显示页面内通知
    this.showInPageNotification(reminder);

    // 播放提示音
    this.playNotificationSound();
  }

  showInPageNotification(reminder) {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = `schedule-notification ${reminder.type}`;
    notification.innerHTML = `
      <div class="notification-icon">${this.getReminderIcon(reminder.type)}</div>
      <div class="notification-content">
        <div class="notification-title">${reminder.title}</div>
        <div class="notification-message">${reminder.message}</div>
      </div>
      <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `;

    container.appendChild(notification);

    // 3秒后自动消失
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }

  getReminderIcon(type) {
    const icons = {
      schedule: '📅',
      booking: '📝',
      departure: '🚀',
      change: '🔔'
    };
    return icons[type] || '🔔';
  }

  playNotificationSound() {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2Onp+QcVx1go2Rlpqcn6Kll41wWnmKlpuarKqmmYtvYHqOmqGnoJ2McmB8jJqen6CiloxvYnuMmZ2en6GjlI1vZH2Nmp2en6Kik41vZX6Om56fn6Oik41wZn+Om5+fn6Oik41xZ3+Om5+fn6Oik41yaH+Om5+fn6Oik41yaX+Om5+fn6Oik41yan+Om5+fn6Oik41ya3+Om5+fn6Oik41ya3+Om5+fn6Oik41ybH+Om5+fn6Oik41ybX+Om5+fn6Oik41yb3+Om5+fn6Oik41yb3+Om5+fn6Oik41ycH+Om5+fn6Oik41ycX+Om5+fn6Oik41yc3+Om5+fn6Oik41yc3+Om5+fn6Oik41ydH+Om5+fn6Oik41ydX+Om5+fn6Oik41yd3+Om5+fn6Oik41yd3+Om5+fn6Oik41yeH+Om5+fn6Oik41yeX+Om5+fn6Oik41ye3+Om5+fn6Oik41yfH+Om5+fn6Oik41yfX+Om5+fn6Oik41yf3+Om5+fn6Oik41yf3+Om5+fn6Oik41ygH+Om5+fn6Oik41ygX+Om+fn6Oik41yg3+Om+fn6Oik41yhH+Om+fn6Oik41yhX+Om+fn6Oik41yh3+Om+fn6Oik41yh3+Om+fn6Oik41yiH+Om+fn6Oik41yiX+Om+fn6Oik41yi3+Om+fn6Oik41yjH+Om+fn6Oik41yjX+Om+fn6Oik41yj3+Om+fn6Oik41yj3+Om+fn6Oik41ykH+Om+fn6Oik41ykX+Om+fn6Oik41yk3+Om+fn6Oik41ylH+Om+fn6Oik41ylX+Om+fn6Oik41yl3+Om+fn6Oik41yl3+Om+fn6Oik41ymH+Om+fn6Oik41ymX+Om+fn6Oik41ym3+Om+fn6Oik41ynH+Om+fn6Oik41ynX+Om+fn6Oik41yn3+Om+fn6Oik41yn3+Om+fn6Oik41yoH+Om+fn6Oik41yoX+Om+fn6Oik41yo3+Om+fn6Oik41ypH+Om+fn6Oik41ypX+Om+fn6Oik41yp3+Om+fn6Oik41yp3+Om+fn6Oik41yqH+Om+fn6Oik41yqX+Om+fn6Oik41yq3+Om+fn6Oik41yq3+Om+fn6Oik41yrH+Om+fn6Oik41yrX+Om+fn6Oik41yr3+Om+fn6Oik41ysH+Om+fn6Oik41ysX+Om+fn6Oik41ys3+Om+fn6Oik41ysh');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch (e) {}
  }

  cleanupExpiredReminders() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    this.reminders = this.reminders.filter(r => {
      const triggerTime = new Date(r.triggerTime);
      return triggerTime > thirtyDaysAgo || r.status === 'pending';
    });
    
    this.saveReminders();
  }

  requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  // ==================== 日历功能 ====================

  renderCalendar(year, month) {
    this.currentMonth = new Date(year, month - 1, 1);
    const container = document.getElementById('calendar-container');
    if (!container) return;

    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    let html = this.renderCalendarHeader(year, month);
    html += '<div class="calendar-weekdays">';
    ['日', '一', '二', '三', '四', '五', '六'].forEach(day => {
      html += `<div class="weekday">${day}</div>`;
    });
    html += '</div>';
    
    html += '<div class="calendar-days">';
    
    // 上月空白
    for (let i = 0; i < startDay; i++) {
      html += '<div class="calendar-day empty"></div>';
    }
    
    // 当月日期
    const today = this.formatDate(new Date());
    const monthSchedules = this.getSchedulesByMonth(year, month);
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday = dateStr === today;
      const daySchedules = monthSchedules.filter(s => s.date === dateStr);
      const hasSchedule = daySchedules.length > 0;
      
      html += `
        <div class="calendar-day ${isToday ? 'today' : ''}" data-date="${dateStr}">
          <span class="day-number">${day}</span>
          ${hasSchedule ? `<div class="day-indicator">${daySchedules.length}个行程</div>` : ''}
          ${daySchedules.slice(0, 2).map(s => `
            <div class="day-event ${s.status}">${s.title.substring(0, 6)}</div>
          `).join('')}
          ${daySchedules.length > 2 ? `<div class="day-more">+${daySchedules.length - 2}更多</div>` : ''}
        </div>
      `;
    }
    
    html += '</div>';
    container.innerHTML = html;
    
    this.attachCalendarEventListeners();
  }

  renderCalendarHeader(year, month) {
    const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', 
                        '七月', '八月', '九月', '十月', '十一月', '十二月'];
    
    return `
      <div class="calendar-header">
        <button class="calendar-nav prev" onclick="scheduleManager.prevMonth()">‹</button>
        <h3 class="calendar-title">${year}年 ${monthNames[month - 1]}</h3>
        <button class="calendar-nav next" onclick="scheduleManager.nextMonth()">›</button>
      </div>
    `;
  }

  attachCalendarEventListeners() {
    document.querySelectorAll('.calendar-day:not(.empty)').forEach(day => {
      day.addEventListener('click', () => {
        const date = day.dataset.date;
        this.showDayScheduleModal(date);
      });
    });
  }

  prevMonth() {
    this.currentMonth.setMonth(this.currentMonth.getMonth() - 1);
    this.renderCalendar(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1);
  }

  nextMonth() {
    this.currentMonth.setMonth(this.currentMonth.getMonth() + 1);
    this.renderCalendar(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1);
  }

  goToToday() {
    const today = new Date();
    this.renderCalendar(today.getFullYear(), today.getMonth() + 1);
  }

  // ==================== 模态框 ====================

  showAddScheduleModal(date = null) {
    const modal = document.getElementById('schedule-modal');
    if (!modal) return;

    const form = modal.querySelector('#schedule-form');
    if (form) {
      form.reset();
      form.dataset.scheduleId = '';
      
      if (date) {
        form.querySelector('[name="date"]').value = date;
      }
    }

    modal.classList.add('active');
    this.setupScheduleFormValidation();
  }

  showEditScheduleModal(scheduleId) {
    const schedule = this.getScheduleById(scheduleId);
    if (!schedule) return;

    const modal = document.getElementById('schedule-modal');
    if (!modal) return;

    const form = modal.querySelector('#schedule-form');
    if (form) {
      form.dataset.scheduleId = scheduleId;
      
      Object.keys(schedule).forEach(key => {
        const input = form.querySelector(`[name="${key}"]`);
        if (input) {
          input.value = schedule[key];
        }
      });
    }

    modal.classList.add('active');
  }

  showDayScheduleModal(date) {
    const schedules = this.getSchedulesByDate(date);
    const container = document.getElementById('day-schedule-list');
    if (!container) return;

    const dateObj = new Date(date);
    const dateStr = `${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
    
    let html = `
      <div class="modal-header">
        <h3>${dateStr}的行程</h3>
        <button class="modal-close" onclick="closeModal('day-schedule-modal')">×</button>
      </div>
      <div class="modal-body">
        <button class="btn btn-primary" onclick="scheduleManager.showAddScheduleModal('${date}')">
          + 添加行程
        </button>
        ${schedules.length > 0 ? schedules.map(s => `
          <div class="schedule-card" data-id="${s.id}">
            <div class="schedule-card-header">
              <span class="schedule-type type-${s.type}">${this.getTypeName(s.type)}</span>
              <span class="schedule-status ${s.status}">${this.getStatusName(s.status)}</span>
            </div>
            <h4 class="schedule-card-title">${s.title}</h4>
            <div class="schedule-card-time">
              <span>⏰ ${s.startTime} - ${s.endTime}</span>
              <span>📍 ${s.location}</span>
            </div>
            ${s.participants ? `<div class="schedule-card-participants">👥 ${s.participants}人${s.maxParticipants ? `/${s.maxParticipants}` : ''}</div>` : ''}
            <div class="schedule-card-actions">
              <button class="btn btn-sm" onclick="scheduleManager.showEditScheduleModal('${s.id}')">编辑</button>
              <button class="btn btn-sm btn-danger" onclick="scheduleManager.confirmDeleteSchedule('${s.id}')">删除</button>
            </div>
          </div>
        `).join('') : '<p class="empty-state">暂无行程安排</p>'}
      </div>
    `;

    container.innerHTML = html;
    document.getElementById('day-schedule-modal').classList.add('active');
  }

  confirmDeleteSchedule(scheduleId) {
    const schedule = this.getScheduleById(scheduleId);
    if (!schedule) return;

    if (confirm(`确定要删除行程「${schedule.title}」吗？`)) {
      this.deleteSchedule(scheduleId);
      closeModal('day-schedule-modal');
      this.refreshCalendarView();
      this.refreshScheduleList();
      this.showToast('行程已删除');
    }
  }

  // ==================== 表单处理 ====================

  handleScheduleSubmit(formData) {
    const scheduleId = formData.get('scheduleId');
    const data = {
      title: formData.get('title'),
      type: formData.get('type'),
      date: formData.get('date'),
      startTime: formData.get('startTime'),
      endTime: formData.get('endTime'),
      location: formData.get('location'),
      description: formData.get('description'),
      participants: parseInt(formData.get('participants')) || 0,
      maxParticipants: parseInt(formData.get('maxParticipants')) || 0,
      price: parseFloat(formData.get('price')) || 0,
      status: formData.get('status') || 'draft',
      reminder: formData.get('reminder') === 'on',
      reminderTime: parseInt(formData.get('reminderTime')) || 60
    };

    if (scheduleId) {
      this.updateSchedule(scheduleId, data);
      this.showToast('行程已更新');
    } else {
      this.addSchedule(data);
      this.showToast('行程已添加');
    }

    closeModal('schedule-modal');
    this.refreshCalendarView();
    this.refreshScheduleList();
  }

  setupScheduleFormValidation() {
    const form = document.getElementById('schedule-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      formData.set('scheduleId', form.dataset.scheduleId || '');
      this.handleScheduleSubmit(formData);
    });
  }

  // ==================== 视图刷新 ====================

  refreshCalendarView() {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth() + 1;
    this.renderCalendar(year, month);
  }

  refreshScheduleList() {
    const container = document.getElementById('schedule-list-container');
    if (!container) return;

    const today = new Date();
    const upcomingSchedules = this.schedules
      .filter(s => new Date(s.date) >= today)
      .sort((a, b) => new Date(a.date + 'T' + a.startTime) - new Date(b.date + 'T' + b.startTime));

    if (upcomingSchedules.length === 0) {
      container.innerHTML = '<p class="empty-state">暂无行程安排</p>';
      return;
    }

    container.innerHTML = upcomingSchedules.map(s => this.renderScheduleCard(s)).join('');
    this.attachScheduleCardListeners();
  }

  renderScheduleCard(schedule) {
    const dateObj = new Date(schedule.date);
    const dateStr = `${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
    
    return `
      <div class="schedule-list-item" data-id="${schedule.id}">
        <div class="schedule-date-badge">
          <span class="date-day">${dateObj.getDate()}</span>
          <span class="date-month">${dateStr.split('月')[0]}月</span>
        </div>
        <div class="schedule-content">
          <div class="schedule-header">
            <span class="schedule-type type-${schedule.type}">${this.getTypeName(schedule.type)}</span>
            <span class="schedule-status ${schedule.status}">${this.getStatusName(schedule.status)}</span>
          </div>
          <h4 class="schedule-title">${schedule.title}</h4>
          <div class="schedule-meta">
            <span>⏰ ${schedule.startTime} - ${schedule.endTime}</span>
            <span>📍 ${schedule.location}</span>
          </div>
          ${schedule.participants ? `<div class="schedule-participants">👥 ${schedule.participants}人${schedule.maxParticipants ? `/${schedule.maxParticipants}` : ''}</div>` : ''}
        </div>
        <div class="schedule-actions">
          <button class="btn btn-sm" onclick="scheduleManager.showEditScheduleModal('${schedule.id}')">编辑</button>
          <button class="btn btn-sm btn-outline" onclick="scheduleManager.showDayScheduleModal('${schedule.date}')">详情</button>
        </div>
      </div>
    `;
  }

  attachScheduleCardListeners() {
    document.querySelectorAll('.schedule-list-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (!e.target.closest('.btn')) {
          scheduleManager.showEditScheduleModal(item.dataset.id);
        }
      });
    });
  }

  refreshBookingList() {
    this.refreshPendingBookings();
    this.refreshConfirmedBookings();
    this.refreshCompletedBookings();
  }

  refreshPendingBookings() {
    const container = document.getElementById('pending-bookings');
    if (!container) return;

    if (this.bookings.pending.length === 0) {
      container.innerHTML = '<p class="empty-state">暂无待确认预约</p>';
      return;
    }

    container.innerHTML = this.bookings.pending.map(b => this.renderBookingCard(b, 'pending')).join('');
    this.attachBookingCardListeners();
  }

  refreshConfirmedBookings() {
    const container = document.getElementById('confirmed-bookings');
    if (!container) return;

    if (this.bookings.confirmed.length === 0) {
      container.innerHTML = '<p class="empty-state">暂无已确认预约</p>';
      return;
    }

    container.innerHTML = this.bookings.confirmed.map(b => this.renderBookingCard(b, 'confirmed')).join('');
  }

  refreshCompletedBookings() {
    const container = document.getElementById('completed-bookings');
    if (!container) return;

    if (this.bookings.completed.length === 0) {
      container.innerHTML = '<p class="empty-state">暂无历史预约</p>';
      return;
    }

    container.innerHTML = this.bookings.completed.map(b => this.renderBookingCard(b, 'completed')).join('');
  }

  renderBookingCard(booking, type) {
    const dateObj = new Date(booking.date);
    const dateStr = `${dateObj.getMonth() + 1}月${dateObj.getDate()}日 ${booking.time || ''}`;
    
    let actions = '';
    if (type === 'pending') {
      actions = `
        <div class="booking-actions">
          <button class="btn btn-primary btn-sm" onclick="scheduleManager.confirmBookingFromUI('${booking.id}')">
            确认预约
          </button>
          <button class="btn btn-outline btn-sm" onclick="scheduleManager.showRejectModal('${booking.id}')">
            婉拒
          </button>
        </div>
      `;
    } else if (type === 'confirmed') {
      actions = `
        <div class="booking-actions">
          <button class="btn btn-sm" onclick="scheduleManager.completeBookingFromUI('${booking.id}')">
            完成服务
          </button>
          <button class="btn btn-sm btn-outline" onclick="scheduleManager.contactCustomer('${booking.customerPhone}')">
            联系客户
          </button>
        </div>
      `;
    } else {
      actions = `
        <div class="booking-rating">
          ${this.renderRating(booking.rating || 0)}
        </div>
      `;
    }

    return `
      <div class="booking-card" data-id="${booking.id}">
        <div class="booking-header">
          <div class="customer-info">
            <span class="customer-avatar">${booking.customerAvatar}</span>
            <div>
              <span class="customer-name">${booking.customerName}</span>
              <span class="customer-phone">${booking.customerPhone}</span>
            </div>
          </div>
          <span class="booking-status ${type}">${this.getBookingStatusName(type)}</span>
        </div>
        <div class="booking-details">
          <h4 class="booking-title">${booking.scheduleTitle}</h4>
          <div class="booking-info">
            <span>📅 ${dateStr}</span>
            <span>👥 ${booking.participants}人</span>
            <span>💰 ¥${booking.totalPrice}</span>
          </div>
          ${booking.message ? `<p class="booking-message">💬 ${booking.message}</p>` : ''}
        </div>
        ${actions}
      </div>
    `;
  }

  renderRating(rating) {
    let html = '<div class="stars">';
    for (let i = 1; i <= 5; i++) {
      html += `<span class="star ${i <= rating ? 'filled' : ''}">★</span>`;
    }
    html += '</div>';
    return html;
  }

  attachBookingCardListeners() {
    // 扩展卡片交互
  }

  // ==================== 预约操作 ====================

  confirmBookingFromUI(bookingId) {
    const booking = this.confirmBooking(bookingId);
    if (booking) {
      this.showToast('预约已确认');
      this.refreshBookingList();
    }
  }

  showRejectModal(bookingId) {
    const reason = prompt('请输入婉拒原因（可选）：');
    this.rejectBooking(bookingId, reason);
    this.showToast('已婉拒预约');
    this.refreshBookingList();
  }

  completeBookingFromUI(bookingId) {
    const rating = prompt('请输入客户评分（1-5星）：', '5');
    if (rating) {
      this.completeBooking(bookingId, parseInt(rating));
      this.showToast('服务已完成');
      this.refreshBookingList();
    }
  }

  contactCustomer(phone) {
    window.open(`tel:${phone}`, '_self');
  }

  // ==================== 可预约时间设置 ====================

  showAvailableSlotsModal() {
    const modal = document.getElementById('available-slots-modal');
    if (!modal) return;
    modal.classList.add('active');
    this.refreshAvailableSlotsList();
  }

  addAvailableSlotFromModal(formData) {
    const data = {
      date: formData.get('date'),
      startTime: formData.get('startTime'),
      endTime: formData.get('endTime'),
      maxBookings: parseInt(formData.get('maxBookings')) || 1,
      price: parseFloat(formData.get('price')) || 0,
      notes: formData.get('notes') || ''
    };

    this.addAvailableSlot(data);
    this.showToast('可预约时段已添加');
    this.refreshAvailableSlotsList();
  }

  refreshAvailableSlotsList() {
    const container = document.getElementById('available-slots-list');
    if (!container) return;

    const today = new Date();
    const futureSlots = this.availableSlots
      .filter(s => new Date(s.date) >= today)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (futureSlots.length === 0) {
      container.innerHTML = '<p class="empty-state">暂无可预约时段</p>';
      return;
    }

    container.innerHTML = futureSlots.map(slot => {
      const dateObj = new Date(slot.date);
      return `
        <div class="slot-item" data-id="${slot.id}">
          <div class="slot-date">
            <span class="date-day">${dateObj.getDate()}</span>
            <span class="date-month">${dateObj.getMonth() + 1}月</span>
          </div>
          <div class="slot-info">
            <div class="slot-time">${slot.startTime} - ${slot.endTime}</div>
            <div class="slot-meta">
              <span>可预约：${slot.maxBookings}组</span>
              <span>价格：¥${slot.price}</span>
            </div>
            ${slot.notes ? `<div class="slot-notes">${slot.notes}</div>` : ''}
          </div>
          <div class="slot-actions">
            <button class="btn btn-sm btn-danger" onclick="scheduleManager.deleteSlot('${slot.id}')">删除</button>
          </div>
        </div>
      `;
    }).join('');
  }

  deleteSlot(slotId) {
    if (confirm('确定要删除这个可预约时段吗？')) {
      this.deleteAvailableSlot(slotId);
      this.showToast('已删除');
      this.refreshAvailableSlotsList();
    }
  }

  // ==================== 辅助方法 ====================

  formatDate(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  getTypeName(type) {
    const types = {
      tour: '团队游',
      activity: '活动',
      meeting: '会议',
      free: '自由行'
    };
    return types[type] || type;
  }

  getStatusName(status) {
    const statuses = {
      draft: '草稿',
      pending: '规划中',
      confirmed: '已确认',
      completed: '已完成',
      cancelled: '已取消'
    };
    return statuses[status] || status;
  }

  getBookingStatusName(status) {
    const statuses = {
      pending: '待确认',
      confirmed: '已确认',
      completed: '已完成',
      rejected: '已婉拒'
    };
    return statuses[status] || status;
  }

  updateRecentSchedules() {
    const today = new Date();
    const upcoming = this.schedules
      .filter(s => new Date(s.date) >= today)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);
    
    localStorage.setItem('recentSchedules', JSON.stringify(upcoming));
  }

  showToast(message, type = 'success') {
    const container = document.getElementById('toast-container') || this.createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}</span>
      <span class="toast-message">${message}</span>
    `;
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
  }

  // ==================== 事件绑定 ====================

  setupEventListeners() {
    // 请求通知权限
    this.requestNotificationPermission();

    // 日程表单提交
    document.addEventListener('submit', (e) => {
      if (e.target.id === 'schedule-form') {
        e.preventDefault();
        const formData = new FormData(e.target);
        formData.set('scheduleId', e.target.dataset.scheduleId || '');
        this.handleScheduleSubmit(formData);
      }
    });

    // 模态框关闭
    document.querySelectorAll('.modal-close, .modal-overlay').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target === el) {
          el.closest('.modal').classList.remove('active');
        }
      });
    });

    // 键盘事件
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(modal => {
          modal.classList.remove('active');
        });
      }
    });
  }
}

// 全局函数
function closeModal(modalId) {
  document.getElementById(modalId)?.classList.remove('active');
}

// 初始化
let scheduleManager;
document.addEventListener('DOMContentLoaded', () => {
  scheduleManager = new GuideScheduleManager();
});
