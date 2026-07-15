// ========== B站广告账户管理器 - 渲染进程 ==========

// ---------- 自定义日历日期选择器 ----------
class CalendarPicker {
  constructor(options) {
    this.displayInput = document.getElementById(options.displayId);
    this.hiddenInput = document.getElementById(options.hiddenId);
    this.triggerBtn = document.getElementById(options.triggerId);
    this.calendarEl = document.getElementById(options.calendarId);
    this.wrapperEl = document.getElementById(options.wrapperId);
    this.clearBtn = options.clearId ? document.getElementById(options.clearId) : null;
    this.selectedDate = options.initialValue || null;

    this.currentMonth = this.selectedDate
      ? new Date(this.selectedDate).getMonth()
      : new Date().getMonth();
    this.currentYear = this.selectedDate
      ? new Date(this.selectedDate).getFullYear()
      : new Date().getFullYear();

    this._buildCalendar();
    this._bindEvents();
    this._updateDisplay();
  }

  _buildCalendar() {
    this.calendarEl.innerHTML = `
      <div class="calendar-header">
        <button type="button" class="calendar-nav cal-prev" title="上个月">
          <svg viewBox="0 0 16 16" width="14" height="14">
            <path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div class="calendar-month-year">
          <select class="cal-year-select"></select>
          <span>年</span>
          <select class="cal-month-select"></select>
          <span>月</span>
        </div>
        <button type="button" class="calendar-nav cal-next" title="下个月">
          <svg viewBox="0 0 16 16" width="14" height="14">
            <path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      <div class="calendar-weekdays">
        <span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span>
      </div>
      <div class="calendar-days"></div>
      <div class="calendar-footer">
        <button type="button" class="btn-today cal-today">今天</button>
        <span class="selected-label cal-selected-label"></span>
      </div>
    `;

    // 填充年份选择器（前后10年）
    const yearSelect = this.calendarEl.querySelector('.cal-year-select');
    const startYear = this.currentYear - 10;
    for (let y = startYear; y <= this.currentYear + 10; y++) {
      const opt = document.createElement('option');
      opt.value = y;
      opt.textContent = y;
      if (y === this.currentYear) opt.selected = true;
      yearSelect.appendChild(opt);
    }

    // 填充月份选择器
    const monthSelect = this.calendarEl.querySelector('.cal-month-select');
    const monthNames = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    monthNames.forEach((name, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = name;
      if (i === this.currentMonth) opt.selected = true;
      monthSelect.appendChild(opt);
    });

    this._renderDays();
  }

  _renderDays() {
    const daysContainer = this.calendarEl.querySelector('.calendar-days');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const prevMonthLastDay = new Date(this.currentYear, this.currentMonth, 0).getDate();

    let html = '';

    // 上个月的填充日期
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const isWeekend = (new Date(this.currentYear, this.currentMonth - 1, day).getDay() === 0 || new Date(this.currentYear, this.currentMonth - 1, day).getDay() === 6);
      html += `<button type="button" class="calendar-day other-month${isWeekend ? ' weekend' : ''}" data-date="">${day}</button>`;
    }

    // 当前月的日期
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(this.currentYear, this.currentMonth, d);
      const dateStr = this._formatDate(date);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const isToday = date.getTime() === today.getTime();
      const isSelected = this.selectedDate === dateStr;

      let cls = 'calendar-day';
      if (isWeekend) cls += ' weekend';
      if (isToday) cls += ' today';
      if (isSelected) cls += ' selected';

      html += `<button type="button" class="${cls}" data-date="${dateStr}">${d}</button>`;
    }

    // 下个月的填充日期
    const remaining = 42 - (startDayOfWeek + daysInMonth); // 6 rows * 7 cols
    for (let d = 1; d <= remaining; d++) {
      const isWeekend = (new Date(this.currentYear, this.currentMonth + 1, d).getDay() === 0 || new Date(this.currentYear, this.currentMonth + 1, d).getDay() === 6);
      html += `<button type="button" class="calendar-day other-month${isWeekend ? ' weekend' : ''}" data-date="">${d}</button>`;
    }

    daysContainer.innerHTML = html;

    // 更新选中日期标签
    const label = this.calendarEl.querySelector('.cal-selected-label');
    const selectedDate = this.selectedDate ? new Date(this.selectedDate) : null;
    if (selectedDate) {
      const sd = selectedDate;
      const sy = sd.getFullYear();
      const sm = sd.getMonth();
      const sday = sd.getDate();
      if (sm === this.currentMonth && sy === this.currentYear) {
        label.textContent = `已选：${sy}年${sm+1}月${sday}日`;
      } else {
        label.textContent = `已选：${sy}年${sm+1}月${sday}日 (非本月)`;
      }
    } else {
      label.textContent = '未选择';
    }
  }

  _formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  _formatDisplay(dateStr) {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${y}年${m}月${d}日`;
  }

  _updateDisplay() {
    if (this.selectedDate) {
      this.displayInput.value = this._formatDisplay(this.selectedDate);
      this.displayInput.classList.add('has-value');
      if (this.clearBtn) this.clearBtn.style.display = 'flex';
    } else {
      this.displayInput.value = '';
      this.displayInput.classList.remove('has-value');
      if (this.clearBtn) this.clearBtn.style.display = 'none';
    }
    this.hiddenInput.value = this.selectedDate || '';
  }

  _bindEvents() {
    // 点击显示输入框或按钮 → 打开日历（fixed 定位）
    const openCalendar = (e) => {
      e.stopPropagation();
      const isOpen = this.calendarEl.classList.contains('visible');
      // 关闭所有其他日历
      document.querySelectorAll('.calendar-popup.visible').forEach(el => el.classList.remove('visible'));
      if (!isOpen) {
        this.calendarEl.classList.add('visible');
        this._positionCalendar();
      }
    };

    this.displayInput.addEventListener('click', openCalendar);
    this.triggerBtn.addEventListener('click', openCalendar);

    // 上个月
    this.calendarEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.cal-prev');
      if (!btn) return;
      e.stopPropagation();
      if (this.currentMonth === 0) {
        this.currentMonth = 11;
        this.currentYear--;
      } else {
        this.currentMonth--;
      }
      this._buildCalendar();
    });

    // 下个月
    this.calendarEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.cal-next');
      if (!btn) return;
      e.stopPropagation();
      if (this.currentMonth === 11) {
        this.currentMonth = 0;
        this.currentYear++;
      } else {
        this.currentMonth++;
      }
      this._buildCalendar();
    });

    // 选择日期
    this.calendarEl.addEventListener('click', (e) => {
      const dayBtn = e.target.closest('.calendar-day');
      if (!dayBtn) return;
      const dateStr = dayBtn.dataset.date;
      if (!dateStr) return; // other-month days
      e.stopPropagation();
      this.selectedDate = dateStr;
      this._buildCalendar();
      this._updateDisplay();
      this.calendarEl.classList.remove('visible');
      // 触发 change 事件
      this.hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // 年份选择
    this.calendarEl.addEventListener('change', (e) => {
      if (e.target.classList.contains('cal-year-select')) {
        e.stopPropagation();
        this.currentYear = parseInt(e.target.value);
        this._buildCalendar();
      }
      if (e.target.classList.contains('cal-month-select')) {
        e.stopPropagation();
        this.currentMonth = parseInt(e.target.value);
        this._buildCalendar();
      }
    });

    // 今天按钮
    this.calendarEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.cal-today');
      if (!btn) return;
      e.stopPropagation();
      const today = new Date();
      this.selectedDate = this._formatDate(today);
      this.currentMonth = today.getMonth();
      this.currentYear = today.getFullYear();
      this._buildCalendar();
      this._updateDisplay();
      this.calendarEl.classList.remove('visible');
      this.hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // 清除按钮
    if (this.clearBtn) {
      this.clearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectedDate = null;
        this.currentMonth = new Date().getMonth();
        this.currentYear = new Date().getFullYear();
        this._buildCalendar();
        this._updateDisplay();
        this.hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
      });
    }

    // 点击外部关闭
    document.addEventListener('click', (e) => {
      if (!this.wrapperEl.contains(e.target)) {
        this.calendarEl.classList.remove('visible');
      }
    });

    // Escape 关闭
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.calendarEl.classList.contains('visible')) {
        this.calendarEl.classList.remove('visible');
      }
    });

    // 窗口大小变化或滚动时重新定位日历
    const reposition = () => {
      if (this.calendarEl.classList.contains('visible')) {
        this._positionCalendar();
      }
    };
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true); // capture 模式捕获所有滚动
  }

  /** 根据输入框当前位置计算并设置日历面板的 fixed 坐标 */
  _positionCalendar() {
    const rect = this.displayInput.getBoundingClientRect();
    const calHeight = this.calendarEl.offsetHeight || 340;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    this.calendarEl.style.left = rect.left + 'px';
    this.calendarEl.style.width = Math.min(280, rect.width) + 'px';

    if (spaceBelow >= calHeight + 6 || spaceBelow > spaceAbove) {
      this.calendarEl.style.top = (rect.bottom + 6) + 'px';
    } else {
      this.calendarEl.style.top = Math.max(4, rect.top - calHeight - 6) + 'px';
    }
  }

  // 外部设置日期
  setDate(dateStr) {
    this.selectedDate = dateStr || null;
    if (dateStr) {
      const d = new Date(dateStr);
      this.currentMonth = d.getMonth();
      this.currentYear = d.getFullYear();
    }
    this._buildCalendar();
    this._updateDisplay();
  }

  getDate() {
    return this.selectedDate;
  }

  clear() {
    this.selectedDate = null;
    this.currentMonth = new Date().getMonth();
    this.currentYear = new Date().getFullYear();
    this._buildCalendar();
    this._updateDisplay();
  }
}

// ---------- 数据层 (SQLite 优先，localStorage 回退) ----------
const STORAGE_KEY = 'bilibili_ad_accounts';
const isDesktop = !!(window.pywebview && window.pywebview.api);

// 浏览器调试回退：localStorage 读写
function _lsLoad() {
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : []; }
  catch (e) { return []; }
}
function _lsSave(accounts) { localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts)); }

// 浏览器回退：生成 ID
function _fallbackId() {
  return 'acc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
}

let accounts = [];

async function loadAccounts() {
  if (isDesktop) {
    try {
      const json = await window.pywebview.api.list_accounts();
      accounts = JSON.parse(json);
      if (accounts.error) { console.error(accounts.error); accounts = _lsLoad(); }
    } catch (e) {
      console.error('数据库读取失败，回退到本地缓存:', e);
      accounts = _lsLoad();
    }
  } else {
    accounts = _lsLoad();
  }
}

async function saveAccounts(accountList) {
  // 桌面端数据已通过 API 实时写入 SQLite，这里只更新内存和回退缓存
  accounts = accountList;
  if (!isDesktop) {
    _lsSave(accounts);
  }
}

let currentFilter = 'all';
let searchQuery = '';
let deleteTargetId = null;

// ---------- 工具函数 ----------

function getStatus(startDate, pauseDate) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // 两个日期都为空 → 已暂停
  if (!startDate && !pauseDate) return 'ended';

  const start = startDate ? new Date(startDate) : null;
  if (start) start.setHours(0, 0, 0, 0);

  if (start && start > now) return 'upcoming';

  if (pauseDate) {
    const pause = new Date(pauseDate);
    pause.setHours(0, 0, 0, 0);
    if (now >= pause) return 'ended';
    return 'active';
  }

  return 'active';
}

function getStatusLabel(status) {
  const map = {
    active: '投放中',
    paused: '已暂停',
    upcoming: '待投放',
    ended: '已暂停'
  };
  return map[status] || status;
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}年${m}月${day}日`;
}

// ---------- Toast 通知 ----------
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// ---------- 模态框操作 ----------
function openModal(id) {
  document.getElementById(id).classList.add('visible');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('visible');
}

function openAddModal() {
  document.getElementById('modalTitle').textContent = '添加账户';
  document.getElementById('accountForm').reset();
  document.getElementById('editAccountId').value = '';
  document.getElementById('productName').value = '';
  document.getElementById('accountId').value = '';
  document.getElementById('accountName').value = '';
  document.getElementById('remarks').value = '';
  document.getElementById('pastPeriods').value = '';
  startDatePicker.clear();
  pauseDatePicker.clear();
  openModal('modalOverlay');
  document.getElementById('productName').focus();
}

function openEditModal(account) {
  document.getElementById('modalTitle').textContent = '编辑账户';
  document.getElementById('editAccountId').value = account.id;
  document.getElementById('productName').value = account.productName;
  document.getElementById('accountId').value = account.accountId;
  document.getElementById('accountName').value = account.accountName;
  document.getElementById('remarks').value = account.remarks || '';
  document.getElementById('pastPeriods').value = account.pastPeriods || '';
  startDatePicker.setDate(account.startDate);
  pauseDatePicker.setDate(account.pauseDate || null);
  openModal('modalOverlay');
}

function openDeleteConfirm(id) {
  deleteTargetId = id;
  const account = accounts.find(a => a.id === id);
  if (account) {
    document.getElementById('confirmText').textContent =
      `确定要删除账户「${account.productName} - ${account.accountName}」吗？此操作不可恢复。`;
  }
  openModal('confirmOverlay');
}

// ---------- 账户 CRUD ----------
async function addAccount(data) {
  try {
    const resp = await fetch('/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!resp.ok) throw new Error('添加失败');
    const newAccount = await resp.json();
    if (newAccount.error) throw new Error(newAccount.error);
    accounts.unshift(newAccount);
    renderTable();
    updateStatusBar('添加成功');
    showToast('账户添加成功', 'success');
  } catch (e) {
    showToast('添加失败: ' + e.message, 'error');
  }
}

async function updateAccount(id, data) {
  try {
    data.id = id;
    const resp = await fetch('/api/accounts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!resp.ok) throw new Error('修改失败');
    await reloadFromDB();
    renderTable();
    updateStatusBar('修改成功');
    showToast('账户修改成功', 'success');
  } catch (e) {
    showToast('修改失败: ' + e.message, 'error');
  }
}

async function deleteAccount(id) {
  try {
    const resp = await fetch(`/api/accounts/${id}`, { method: 'DELETE' });
    if (!resp.ok) throw new Error('删除失败');
    accounts = accounts.filter(a => a.id !== id);
    renderTable();
    updateStatusBar('删除成功');
    showToast('账户已删除', 'info');
  } catch (e) {
    showToast('删除失败: ' + e.message, 'error');
  }
}

async function reloadFromDB() {
  try {
    const resp = await fetch('/api/accounts');
    if (resp.ok) {
      const list = await resp.json();
      if (Array.isArray(list)) accounts = list;
    }
  } catch (e) { /* ignore */ }
}

// ---------- 导出 / 导入 ----------

function importData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,.xlsx';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.name.endsWith('.xlsx')) {
      // Excel 文件 → 上传到服务器解析
      const formData = new FormData();
      formData.append('file', file);
      try {
        const resp = await fetch('/api/import-xlsx', { method: 'POST', body: formData });
        const result = await resp.json();
        if (result.error) throw new Error(result.error);
        await reloadFromDB();
        renderTable();
        showToast(`成功导入 ${result.count || 0} 个账户`, 'success');
      } catch (err) {
        showToast('导入失败：' + (err.message || '文件格式不正确'), 'error');
      }
      return;
    }

    // JSON 文件 → 原有逻辑
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const imported = JSON.parse(ev.target.result);
        if (!Array.isArray(imported)) throw new Error('数据格式错误');

        const normalized = imported
          .filter(item => item.产品名 && item.账户ID && item.账户名 && item.投放开始)
          .map(item => ({
            productName: item.产品名.trim(),
            accountId: item.账户ID.trim(),
            accountName: item.账户名.trim(),
            startDate: item.投放开始,
            pauseDate: item.投放暂停 || null,
            remarks: item.备注 || '',
            createdAt: item.创建时间 || new Date().toISOString(),
            updatedAt: item.更新时间 || null
          }));

        const resp = await fetch('/api/accounts/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(normalized)
        });
        const result = await resp.json();
        const count = result.count || 0;

        await reloadFromDB();
        renderTable();
        showToast(`成功导入 ${count} 个账户`, 'success');
        updateStatusBar(`导入 ${count} 条数据`);
      } catch (err) {
        showToast('导入失败：文件格式不正确', 'error');
        console.error(err);
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

// ---------- 渲染表格 ----------
function renderTable() {
  const tbody = document.getElementById('tableBody');
  const emptyState = document.getElementById('emptyState');
  const dataTable = document.getElementById('accountTable');
  const accountCount = document.getElementById('accountCount');

  // 搜索过滤
  let filtered = accounts.filter(a => {
    // 搜索
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchProduct = a.productName.toLowerCase().includes(q);
      const matchId = a.accountId.toLowerCase().includes(q);
      const matchName = a.accountName.toLowerCase().includes(q);
      if (!matchProduct && !matchId && !matchName) return false;
    }

    // 状态过滤
    if (currentFilter !== 'all') {
      const status = getStatus(a.startDate, a.pauseDate);
      if (status !== currentFilter) return false;
    }

    return true;
  });

  const totalActive = filtered.filter(a => getStatus(a.startDate, a.pauseDate) === 'active').length;
  const totalEnded = filtered.filter(a => getStatus(a.startDate, a.pauseDate) === 'ended').length;
  accountCount.textContent = `共 ${filtered.length} 个账户`;
  document.getElementById('activeCount').textContent = `${totalActive} 投放中`;
  document.getElementById('endedCount').textContent = `${totalEnded} 已暂停`;

  // 更新在投账户ID框
  const activeIds = filtered
    .filter(a => getStatus(a.startDate, a.pauseDate) === 'active')
    .map(a => a.accountId)
    .join(', ');
  document.getElementById('activeIdsBox').value = activeIds;

  if (filtered.length === 0) {
    dataTable.classList.add('hidden');
    emptyState.classList.add('visible');
    if (accounts.length > 0) {
      // 有数据但被过滤了
      emptyState.querySelector('.empty-title').textContent = '没有匹配的账户';
      emptyState.querySelector('.empty-desc').textContent = '尝试修改搜索条件或筛选状态';
    } else {
      emptyState.querySelector('.empty-title').textContent = '还没有账户数据';
      emptyState.querySelector('.empty-desc').textContent = '点击"添加账户"开始管理你的B站广告账户';
    }
    return;
  }

  dataTable.classList.remove('hidden');
  emptyState.classList.remove('visible');

  // 按产品名分组
  const groups = new Map();
  filtered.forEach(a => {
    const key = a.productName || '未分类';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(a);
  });

  // 每个产品内的账户按投放开始时间降序排列（越晚越靠前）
  for (const accounts of groups.values()) {
    accounts.sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''));
  }

  // 产品组按投放中账户数降序排列
  const groupEntries = Array.from(groups.entries());
  groupEntries.sort((a, b) => {
    const aActive = a[1].filter(ac => getStatus(ac.startDate, ac.pauseDate) === 'active').length;
    const bActive = b[1].filter(ac => getStatus(ac.startDate, ac.pauseDate) === 'active').length;
    if (bActive !== aActive) return bActive - aActive;
    // 投放中数量相同时，按最新投放时间降序
    const aLatest = a[1][0]?.startDate || '';
    const bLatest = b[1][0]?.startDate || '';
    return bLatest.localeCompare(aLatest);
  });
  let html = '';

  groupEntries.forEach(([productName, groupAccounts]) => {
    const activeCount = groupAccounts.filter(a => getStatus(a.startDate, a.pauseDate) === 'active').length;
    const endedCount = groupAccounts.filter(a => getStatus(a.startDate, a.pauseDate) === 'ended').length;
    const isCollapsed = activeCount === 0;
    const groupId = 'group_' + productName.replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, '_');
    let groupIndex = 0;

    // 分组标题行
    const arrowDown = '<svg viewBox="0 0 16 16" width="14" height="14"><path d="M6 2l6 6-6 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
    const arrowRight = '<svg viewBox="0 0 16 16" width="14" height="14"><path d="M2 6l6 6 6-6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
    html += `
      <tr class="group-header" data-group="${groupId}">
        <td colspan="10">
          <span class="group-toggle" id="toggle_${groupId}" onclick="event.stopPropagation(); toggleGroup('${groupId}')">
            ${isCollapsed ? arrowRight : arrowDown}
          </span>
          <span class="group-product-name" id="gpname_${groupId}">${escapeHtml(productName)}</span>
          <button class="group-edit-btn" onclick="event.stopPropagation(); startEditProduct('${groupId}', '${escapeHtml(productName).replace(/'/g, "\\'")}')" title="修改产品名">
            <svg viewBox="0 0 14 14" width="12" height="12">
              <path d="M10 1l3 3-8 8H2v-3l8-8z" fill="currentColor"/>
            </svg>
          </button>
          <span class="group-badges">
            <span class="group-count">${groupAccounts.length} 个账户</span>
            ${activeCount > 0 ? `<span class="group-badge group-badge-active">${activeCount} 投放中</span>` : ''}
            ${endedCount > 0 ? `<span class="group-badge group-badge-ended">${endedCount} 已暂停</span>` : ''}
          </span>
        </td>
      </tr>`;

    // 子行
    groupAccounts.forEach((a) => {
      groupIndex++;
      const status = getStatus(a.startDate, a.pauseDate);
      const statusLabel = getStatusLabel(status);
      const remark = a.remarks || '';
      const remarkShort = remark.length > 15 ? remark.substring(0, 15) + '…' : remark;
      const pastTimeline = buildTimeline(a.pastPeriods || '');

      html += `
      <tr class="group-child group-${groupId}"${isCollapsed ? ' style="display:none"' : ''}>
        <td class="row-index">${groupIndex}</td>
        <td class="copyable" onclick="event.stopPropagation(); copyToClipboard('${escapeHtml(a.productName).replace(/'/g, "\\'")}', '产品名')" title="点击复制">
          <span class="product-name" title="${escapeHtml(a.productName)}">${escapeHtml(a.productName)}</span>
        </td>
        <td>
          <code class="account-id copyable" onclick="event.stopPropagation(); copyToClipboard('${escapeHtml(a.accountId).replace(/'/g, "\\'")}', '账户ID')" title="点击复制">${escapeHtml(a.accountId)}</code>
        </td>
        <td class="copyable" onclick="event.stopPropagation(); copyToClipboard('${escapeHtml(a.accountName).replace(/'/g, "\\'")}', '账户名')" title="点击复制">${escapeHtml(a.accountName)}</td>
        <td>${pastTimeline}</td>
        <td class="editable-date" data-field="startDate" data-id="${a.id}" title="点击修改投放开始">${formatDate(a.startDate)}</td>
        <td class="editable-date" data-field="pauseDate" data-id="${a.id}" title="点击修改投放暂停">${formatDate(a.pauseDate)}${a.startDate && a.pauseDate ? ` <button class="archive-btn" onclick="event.stopPropagation(); archivePeriod('${a.id}')" title="归档本期投放">归档</button>` : ''}</td>
        <td>
          <span class="status-badge status-${status}">${statusLabel}</span>
        </td>
        <td class="editable-remark" data-id="${a.id}" title="${escapeHtml(remark) || '点击添加备注'}">
          <span class="remark-cell">${escapeHtml(remarkShort) || '-'}</span>
        </td>
        <td>
          <div class="action-btns">
            <button class="btn-action" onclick="openEditModalById('${a.id}')" title="编辑">
              <svg viewBox="0 0 16 16" width="14" height="14">
                <path d="M11 2l3 3-9 9H2v-3l9-9zM2 14h2l7-7-2-2-7 7v2z" fill="currentColor"/>
              </svg>
            </button>
            <button class="btn-action delete" onclick="openDeleteConfirm('${a.id}')" title="删除">
              <svg viewBox="0 0 16 16" width="14" height="14">
                <path d="M5 2V1h6v1h4v2H1V2h4zm1 12V5h1v9H6zm3 0V5h1v9H9zM3 4l1 11h8l1-11H3z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </td>
      </tr>`;
    });
  });

  tbody.innerHTML = html;
}

// 往期投放时间线渲染
function buildTimeline(periodsStr) {
  if (!periodsStr) return '<span class="timeline-empty">-</span>';
  // 容错：中文分号、换行符自动转英文分号
  const normalized = periodsStr.replace(/；/g, ';').replace(/\r?\n/g, ';');
  const periods = normalized.split(';').map(p => p.trim()).filter(p => p);
  if (periods.length === 0) return '<span class="timeline-empty">-</span>';

  const latest = periods[periods.length - 1];

  const allPills = periods.map(p => {
    return `<span class="timeline-pill">${escapeHtml(p)}</span>`;
  }).join('');

  const tooltip = periods.length > 1
    ? `<span class="timeline-tooltip">${allPills}</span>`
    : '';

  if (periods.length > 1) {
    return `<span class="timeline-wrapper">
      <span class="timeline-pill timeline-latest">${escapeHtml(latest)}</span>
      <span class="timeline-more">+${periods.length - 1}</span>
      ${tooltip}
    </span>`;
  }

  return `<span class="timeline-wrapper">
    <span class="timeline-pill">${escapeHtml(latest)}</span>
  </span>`;
}

// 产品名编辑
async function startEditProduct(groupId, oldName) {
  const span = document.getElementById('gpname_' + groupId);
  if (!span) return;

  const input = document.createElement('input');
  input.type = 'text';
  input.value = oldName;
  input.className = 'group-edit-input';
  input.maxLength = 50;

  const save = async () => {
    const newName = input.value.trim();
    if (!newName || newName === oldName) {
      span.textContent = oldName;
      return;
    }
    try {
      await fetch('/api/rename-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldName, newName })
      });
      await reloadFromDB();
      renderTable();
      showToast(`产品名已更新: ${oldName} → ${newName}`, 'success');
    } catch (e) {
      showToast('修改失败', 'error');
    }
  };

  input.addEventListener('blur', save);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
    if (e.key === 'Escape') { span.textContent = oldName; }
  });

  span.innerHTML = '';
  span.appendChild(input);
  input.focus();
}

window.startEditProduct = startEditProduct;
function toggleGroup(groupId) {
  const children = document.querySelectorAll(`.group-child.group-${groupId}`);
  const toggle = document.getElementById(`toggle_${groupId}`);
  const isCollapsed = children.length > 0 && children[0].style.display === 'none';

  children.forEach(row => {
    row.style.display = isCollapsed ? '' : 'none';
  });

  if (toggle) {
    if (isCollapsed) {
      toggle.innerHTML = '<svg viewBox="0 0 16 16" width="14" height="14"><path d="M6 2l6 6-6 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
    } else {
      toggle.innerHTML = '<svg viewBox="0 0 16 16" width="14" height="14"><path d="M2 6l6 6 6-6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
    }
  }
}

// 暴露给全局
window.toggleGroup = toggleGroup;

// 归档本期投放
async function archivePeriod(accountId) {
  try {
    const resp = await fetch(`/api/archive/${accountId}`, { method: 'POST' });
    const result = await resp.json();
    if (result.ok) {
      await reloadFromDB();
      renderTable();
      showToast('本期投放已归档', 'success');
    } else {
      showToast('归档失败', 'error');
    }
  } catch (e) {
    showToast('归档失败', 'error');
  }
}

window.archivePeriod = archivePeriod;

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// 复制到剪贴板
function copyToClipboard(text, label) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(label ? `${label} 已复制` : '已复制', 'success');
  }).catch(() => {
    // 回退方案
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast(label ? `${label} 已复制` : '已复制', 'success');
  });
}

function updateStatusBar(msg) {
  document.getElementById('statusText').textContent = msg || '就绪';
}

// 为避免 inline onclick 污染，暴露给 window
window.openEditModalById = (id) => {
  const account = accounts.find(a => a.id === id);
  if (account) openEditModal(account);
};

window.openDeleteConfirm = openDeleteConfirm;

// ---------- 表单提交处理 ----------
document.getElementById('accountForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const editId = document.getElementById('editAccountId').value;
  const data = {
    productName: document.getElementById('productName').value,
    accountId: document.getElementById('accountId').value,
    accountName: document.getElementById('accountName').value,
    startDate: document.getElementById('startDate').value,
    pauseDate: document.getElementById('pauseDate').value,
    remarks: document.getElementById('remarks').value,
    pastPeriods: document.getElementById('pastPeriods').value
  };

  // 验证
  if (!data.productName.trim()) {
    showToast('请输入产品名', 'error');
    return;
  }
  if (!data.accountId.trim()) {
    showToast('请输入账户ID', 'error');
    return;
  }
  if (!data.accountName.trim()) {
    showToast('请输入账户名', 'error');
    return;
  }

  // 如果同时填写了开始和暂停日期，验证暂停不早于开始
  if (data.pauseDate && data.startDate && data.pauseDate < data.startDate) {
    showToast('暂停日期不能早于开始日期', 'error');
    return;
  }

  if (editId) {
    updateAccount(editId, data);
  } else {
    addAccount(data);
  }

  closeModal('modalOverlay');
});

// ---------- 事件绑定 ----------
document.getElementById('btnAddAccount').addEventListener('click', openAddModal);
document.getElementById('btnRefresh').addEventListener('click', async () => {
  updateStatusBar('正在刷新...');
  await reloadFromDB();
  renderTable();
  updateStatusBar('刷新完成');
  showToast('数据已刷新', 'success');
});
document.getElementById('btnModalClose').addEventListener('click', () => closeModal('modalOverlay'));
document.getElementById('btnCancel').addEventListener('click', () => closeModal('modalOverlay'));

// ---------- 产品名下拉开 ----------
const productInput = document.getElementById('productName');
const productDropdown = document.getElementById('productDropdown');

function getExistingProducts() {
  const names = new Set();
  accounts.forEach(a => { if (a.productName) names.add(a.productName); });
  return Array.from(names).sort();
}

function showProductDropdown() {
  const value = productInput.value.trim();
  const lowerValue = value.toLowerCase();
  const allProducts = getExistingProducts();

  if (allProducts.length === 0) {
    productDropdown.classList.remove('visible');
    return;
  }

  const products = value
    ? allProducts.filter(p => p.toLowerCase().includes(lowerValue))
    : allProducts;

  if (products.length === 0) {
    productDropdown.classList.remove('visible');
    return;
  }

  productDropdown.innerHTML = products.map(p => {
    const count = accounts.filter(a => a.productName === p).length;
    return `<div class="product-dropdown-item" data-name="${escapeHtml(p)}">
      ${escapeHtml(p)} <span class="hint">${count} 个账户</span>
    </div>`;
  }).join('');

  productDropdown.classList.add('visible');
}

productInput.addEventListener('focus', showProductDropdown);
productInput.addEventListener('input', showProductDropdown);

productInput.addEventListener('blur', () => {
  // 延迟关闭，让 click 事件先触发
  setTimeout(() => productDropdown.classList.remove('visible'), 150);
});

productDropdown.addEventListener('mousedown', (e) => {
  e.preventDefault(); // 阻止 input 失焦
  const item = e.target.closest('.product-dropdown-item');
  if (item) {
    productInput.value = item.dataset.name;
    productDropdown.classList.remove('visible');
  }
});

// 点击模态框遮罩关闭
document.getElementById('modalOverlay').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeModal('modalOverlay');
});

// 确认删除对话框
document.getElementById('btnConfirmCancel').addEventListener('click', () => {
  closeModal('confirmOverlay');
  deleteTargetId = null;
});

document.getElementById('confirmOverlay').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) {
    closeModal('confirmOverlay');
    deleteTargetId = null;
  }
});

document.getElementById('btnConfirmDelete').addEventListener('click', () => {
  if (deleteTargetId) {
    deleteAccount(deleteTargetId);
    deleteTargetId = null;
  }
  closeModal('confirmOverlay');
});

// 搜索
document.getElementById('searchInput').addEventListener('input', (e) => {
  searchQuery = e.target.value;
  renderTable();
});

// 状态筛选
document.getElementById('filterStatus').addEventListener('change', (e) => {
  currentFilter = e.target.value;
  renderTable();
});

// 导出/导入按钮
document.getElementById('btnExport').addEventListener('click', async () => {
  if (window.pywebview && window.pywebview.api) {
    const result = await window.pywebview.api.export_to_xlsx();
    if (result === 'ok') {
      showToast('导出成功', 'success');
    } else if (result === 'cancelled') {
      // 用户取消
    } else {
      showToast('导出失败', 'error');
    }
  } else {
    // 浏览器回退：下载 JSON
    const exportData = accounts.map(a => ({
      产品名: a.productName, 账户ID: a.accountId, 账户名: a.accountName,
      投放开始: a.startDate, 投放暂停: a.pauseDate || '',
      备注: a.remarks || '', 往期投放: a.pastPeriods || '',
      创建时间: a.createdAt, 更新时间: a.updatedAt || ''
    }));
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bilibili-accounts-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('导出成功', 'success');
  }
});
document.getElementById('btnImport').addEventListener('click', importData);
document.getElementById('btnDownloadTemplate').addEventListener('click', async () => {
  if (window.pywebview && window.pywebview.api) {
    const result = await window.pywebview.api.download_template();
    if (result === 'ok') {
      showToast('模板已保存', 'success');
    } else if (result === 'cancelled') {
      // 用户取消了，不提示
    } else {
      showToast('保存失败: ' + result, 'error');
    }
  } else {
    // 浏览器回退：直接下载
    const a = document.createElement('a');
    a.href = '/导入模板.xlsx';
    a.download = 'B站账户导入模板.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
});

// ---------- 表格内联编辑 ----------
document.getElementById('tableBody').addEventListener('click', async (e) => {
  // 日期单元格内联编辑
  const dateCell = e.target.closest('.editable-date');
  if (dateCell && !dateCell.querySelector('.inline-calendar-popup')) {
    // 忽略归档按钮点击
    if (e.target.closest('.archive-btn')) return;

    const accountId = dateCell.dataset.id;
    const field = dateCell.dataset.field;
    const account = accounts.find(a => a.id === accountId);
    if (!account) return;

    const currentVal = account[field] || '';
    const popup = document.createElement('div');
    popup.className = 'calendar-popup inline-calendar-popup visible';
    popup.style.position = 'fixed';
    popup.style.zIndex = '3000';

    const rect = dateCell.getBoundingClientRect();
    popup.style.left = rect.left + 'px';
    const spaceBelow = window.innerHeight - rect.bottom;
    if (spaceBelow >= 350) {
      popup.style.top = (rect.bottom + 4) + 'px';
    } else {
      popup.style.top = Math.max(4, rect.top - 350) + 'px';
    }

    dateCell.appendChild(popup);

    // 构建日历
    const now = new Date();
    let calYear = currentVal ? new Date(currentVal).getFullYear() : now.getFullYear();
    let calMonth = currentVal ? new Date(currentVal).getMonth() : now.getMonth();
    let selected = currentVal;

    function renderCal() {
      const today = new Date(); today.setHours(0,0,0,0);
      const firstDay = new Date(calYear, calMonth, 1);
      const lastDay = new Date(calYear, calMonth + 1, 0);
      const startDow = firstDay.getDay();
      const prevLast = new Date(calYear, calMonth, 0).getDate();

      const yearOpts = [];
      for (let y = now.getFullYear() - 10; y <= now.getFullYear() + 10; y++) {
        yearOpts.push(`<option value="${y}" ${y === calYear ? 'selected' : ''}>${y}</option>`);
      }
      const monthOpts = [];
      for (let m = 0; m < 12; m++) {
        monthOpts.push(`<option value="${m}" ${m === calMonth ? 'selected' : ''}>${m + 1}</option>`);
      }

      let days = '';
      for (let i = startDow - 1; i >= 0; i--) {
        days += `<button type="button" class="calendar-day other-month">${prevLast - i}</button>`;
      }
      for (let d = 1; d <= lastDay.getDate(); d++) {
        const dt = new Date(calYear, calMonth, d);
        const ds = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const isToday = dt.getTime() === today.getTime();
        const isSel = ds === selected;
        days += `<button type="button" class="calendar-day${isToday ? ' today' : ''}${isSel ? ' selected' : ''}${dt.getDay()===0||dt.getDay()===6 ? ' weekend' : ''}" data-date="${ds}">${d}</button>`;
      }
      const remaining = 42 - (startDow + lastDay.getDate());
      for (let d = 1; d <= remaining; d++) days += `<button type="button" class="calendar-day other-month">${d}</button>`;

      popup.innerHTML = `
        <div class="calendar-header">
          <button type="button" class="calendar-nav cal-prev"><svg viewBox="0 0 16 16" width="14" height="14"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg></button>
          <div class="calendar-month-year">
            <select class="cal-year-select">${yearOpts.join('')}</select><span>年</span>
            <select class="cal-month-select">${monthOpts.join('')}</select><span>月</span>
          </div>
          <button type="button" class="calendar-nav cal-next"><svg viewBox="0 0 16 16" width="14" height="14"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg></button>
        </div>
        <div class="calendar-weekdays"><span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span></div>
        <div class="calendar-days">${days}</div>
        <div class="calendar-footer">
          <button type="button" class="btn-today cal-today">今天</button>
          ${selected ? `<button type="button" class="btn-today cal-clear" style="margin-left:6px;">清除</button>` : ''}
          <span class="selected-label">${selected ? '已选：' + selected : '未选择'}</span>
        </div>`;
    }

    renderCal();

    // 日历事件
    popup.addEventListener('click', (ev) => {
      ev.stopPropagation();
      const target = ev.target;

      if (target.closest('.cal-prev')) {
        if (calMonth === 0) { calMonth = 11; calYear--; } else calMonth--;
        renderCal();
      } else if (target.closest('.cal-next')) {
        if (calMonth === 11) { calMonth = 0; calYear++; } else calMonth++;
        renderCal();
      } else if (target.closest('.cal-today')) {
        const td = new Date();
        selected = `${td.getFullYear()}-${String(td.getMonth()+1).padStart(2,'0')}-${String(td.getDate()).padStart(2,'0')}`;
        calYear = td.getFullYear(); calMonth = td.getMonth();
        saveDate(selected);
      } else if (target.closest('.cal-clear')) {
        selected = '';
        saveDate('');
      } else if (target.closest('.calendar-day') && target.dataset.date) {
        selected = target.dataset.date;
        saveDate(selected);
      }
    });

    popup.addEventListener('change', (ev) => {
      ev.stopPropagation();
      if (ev.target.classList.contains('cal-year-select')) {
        calYear = parseInt(ev.target.value);
        renderCal();
      } else if (ev.target.classList.contains('cal-month-select')) {
        calMonth = parseInt(ev.target.value);
        renderCal();
      }
    });

    async function saveDate(val) {
      try {
        const updated = { ...account, [field]: val || null };
        await fetch('/api/accounts', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated)
        });
        await reloadFromDB();
        renderTable();
        showToast('已更新', 'success');
      } catch (err) {
        showToast('更新失败', 'error');
      }
    }

    // 点击外部关闭
    const closeMe = (ev) => {
      if (!popup.contains(ev.target)) {
        popup.remove();
        document.removeEventListener('click', closeMe);
        document.removeEventListener('keydown', escMe);
      }
    };
    const escMe = (ev) => { if (ev.key === 'Escape') { popup.remove(); document.removeEventListener('click', closeMe); document.removeEventListener('keydown', escMe); } };
    setTimeout(() => {
      document.addEventListener('click', closeMe);
      document.addEventListener('keydown', escMe);
    }, 50);

    return;
  }

  // 备注内联编辑 — 悬浮大输入框
  const remarkCell = e.target.closest('.editable-remark');
  if (remarkCell && !remarkCell.querySelector('.remark-popup')) {
    const accountId = remarkCell.dataset.id;
    const account = accounts.find(a => a.id === accountId);
    if (!account) return;

    const oldRemark = account.remarks || '';

    // 创建悬浮弹窗
    const popup = document.createElement('div');
    popup.className = 'remark-popup';
    popup.innerHTML = `
      <textarea class="remark-popup-textarea" maxlength="200" placeholder="输入备注...">${escapeHtml(oldRemark)}</textarea>
      <div class="remark-popup-actions">
        <span class="remark-popup-hint">${oldRemark.length}/200</span>
        <button type="button" class="btn btn-sm btn-primary remark-save-btn">保存</button>
      </div>
    `;
    popup.style.position = 'fixed';
    popup.style.zIndex = '3000';

    const rect = remarkCell.getBoundingClientRect();
    popup.style.left = Math.max(10, rect.left - 80) + 'px';
    const spaceBelow = window.innerHeight - rect.bottom;
    if (spaceBelow >= 160) {
      popup.style.top = (rect.bottom + 6) + 'px';
    } else {
      popup.style.top = Math.max(10, rect.top - 160) + 'px';
    }

    document.body.appendChild(popup);

    const textarea = popup.querySelector('textarea');
    const hintSpan = popup.querySelector('.remark-popup-hint');

    textarea.addEventListener('input', () => {
      hintSpan.textContent = textarea.value.length + '/200';
    });

    const save = async () => {
      const newRemark = textarea.value.trim();
      if (newRemark === oldRemark) {
        popup.remove();
        return;
      }
      try {
        const updated = { ...account, remarks: newRemark };
        await fetch('/api/accounts', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated)
        });
        await reloadFromDB();
        renderTable();
        showToast('备注已更新', 'success');
      } catch (err) {
        showToast('更新失败', 'error');
      }
      popup.remove();
    };

    popup.querySelector('.remark-save-btn').addEventListener('click', save);
    textarea.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') { popup.remove(); }
    });

    // 点击外部关闭
    const closeMe = (ev) => {
      if (!popup.contains(ev.target) && ev.target !== remarkCell) {
        save();
      }
    };
    setTimeout(() => document.addEventListener('click', closeMe), 50);

    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    return;
  }
}, true);  // capture mode

document.getElementById('btnSnapshotBackup').addEventListener('click', async () => {
  try {
    const resp = await fetch('/api/backup', { method: 'POST' });
    const result = await resp.json();
    if (result.ok) {
      showToast('备份已保存', 'success');
    } else {
      showToast('备份失败: ' + (result.error || ''), 'error');
    }
  } catch (e) {
    showToast('备份失败', 'error');
  }
});

document.getElementById('btnRestoreBackup').addEventListener('click', async () => {
  if (window.pywebview && window.pywebview.api) {
    try {
      const result = await window.pywebview.api.restore_from_backup();
      const data = JSON.parse(result);
      if (data.ok) {
        await reloadFromDB();
        renderTable();
        showToast(`已从备份恢复 ${data.count} 条记录`, 'success');
      } else if (result === 'cancelled' || data.ok === false) {
        // 用户取消或失败
      }
    } catch (e) {
      showToast('恢复失败', 'error');
    }
  }
});

// 键盘快捷键
document.addEventListener('keydown', (e) => {
  // Ctrl+N 添加账户
  if (e.ctrlKey && e.key === 'n') {
    e.preventDefault();
    openAddModal();
  }
  // Escape 关闭模态框
  if (e.key === 'Escape') {
    if (document.getElementById('modalOverlay').classList.contains('visible')) {
      closeModal('modalOverlay');
    }
    if (document.getElementById('confirmOverlay').classList.contains('visible')) {
      closeModal('confirmOverlay');
      deleteTargetId = null;
    }
  }
});

// ---------- 菜单事件（来自主进程） ----------
if (window.electronAPI) {
  // 监听主进程菜单事件（如果未来需要）
}

// ---------- 初始化日历选择器 ----------
const startDatePicker = new CalendarPicker({
  displayId: 'startDateDisplay',
  hiddenId: 'startDate',
  triggerId: 'startDateTrigger',
  calendarId: 'startDateCalendar',
  wrapperId: 'startDatePicker'
});

const pauseDatePicker = new CalendarPicker({
  displayId: 'pauseDateDisplay',
  hiddenId: 'pauseDate',
  triggerId: 'pauseDateTrigger',
  calendarId: 'pauseDateCalendar',
  wrapperId: 'pauseDatePicker',
  clearId: 'pauseDateClear'
});

// ---------- 初始化 ----------
async function initApp() {
  updateStatusBar('正在加载数据...');

  try {
    const resp = await fetch('/api/accounts');
    if (resp.ok) {
      const list = await resp.json();
      if (Array.isArray(list) && list.length > 0) {
        accounts = list;
        renderTable();
        updateStatusBar('就绪');
        return;
      }
    }
  } catch (e) {
    console.error('加载失败:', e);
  }

  // 空数据
  accounts = [];
  renderTable();
  updateStatusBar('就绪');
}

initApp();
