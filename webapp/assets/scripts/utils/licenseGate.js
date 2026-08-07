/**
 * licenseGate.js — webapp 侧激活遮罩
 *
 * 职责（单一、无密钥）：
 *  - 宿主在 app:ready 响应里携带 licenseActive 字段；
 *  - 未激活时，在 Shadow DOM 上盖一层全屏「激活」遮罩，含激活码输入框；
 *  - 用户输入激活码 → postMessage('app:activateLicense', { code }) 给宿主；
 *  - 宿主校验（持密钥，crypto.subtle）后回 ok/fail；
 *  - 成功 → 移除遮罩并广播 license:activated，业务模块据此解锁。
 *
 * 本模块不持有任何密钥或校验逻辑，纯展示 + 转发。
 */

const GATE_ID = 'bamboo-license-gate';

/** 当前是否处于激活遮罩态（供业务层查询，避免功能裸奔） */
let gateActive = false;

export function isLicenseGateActive() {
  return gateActive;
}

/**
 * 创建并挂载激活遮罩。
 * @param {object} opts
 * @param {ShadowRoot|null} opts.root  Shadow DOM 根（null 时为 document）
 * @param {(code:string)=>Promise<{ok:boolean,error?:string}>} opts.activate  激活请求函数（转发给宿主）
 * @param {(backup:string)=>Promise<{ok:boolean,error?:string}>} [opts.importBackup]  备份码导入函数（换设备用）
 */
export function mountLicenseGate(opts) {
  const { root, activate, importBackup } = opts;
  const parent = root || document;
  if (parent.getElementById(GATE_ID)) return;

  gateActive = true;

  const wrap = document.createElement('div');
  wrap.id = GATE_ID;
  wrap.className = 'bamboo-license-gate';
  wrap.innerHTML = `
    <div class="blg-card">
      <h1 class="blg-title">竹林修仙传 · 未激活</h1>
      <div class="blg-price">
        <span class="blg-price-early">早鸟价 ¥29</span>
        <span class="blg-price-regular">正式价 ¥99</span>
      </div>
      <p class="blg-sub">一次性买断 · 无订阅 · 无有效期 · 离线激活 · 永久可用</p>
      <input
        class="blg-input"
        type="text"
        placeholder="激活码（例如 BRI-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX）"
        autocomplete="off"
        spellcheck="false"
      />
      <button class="blg-btn" type="button">激活</button>
      <div class="blg-msg" role="status"></div>
      <details class="blg-backup">
        <summary>换设备 / 换仓库？用备份码一键激活</summary>
        <input
          class="blg-backup-input"
          type="text"
          placeholder="粘贴备份码（BRIBACK- 开头）"
          autocomplete="off"
          spellcheck="false"
        />
        <button class="blg-backup-btn" type="button">导入备份码</button>
        <div class="blg-backup-msg" role="status"></div>
      </details>
      <div class="blg-hint">还未购买？添加作者微信 <strong>yanhu94</strong> 获取激活码<br/>付款后发送截图，作者会回复你的专属激活码</div>
    </div>
  `;

  parent.appendChild(wrap);

  const input = wrap.querySelector('.blg-input');
  const btn = wrap.querySelector('.blg-btn');
  const msg = wrap.querySelector('.blg-msg');

  input.focus();

  const setMsg = (text, type) => {
    msg.textContent = text || '';
    msg.className = 'blg-msg' + (type ? ' blg-msg-' + type : '');
  };

  const doActivate = async () => {
    const code = (input.value || '').trim();
    if (!code) {
      setMsg('请输入激活码', 'error');
      return;
    }
    btn.disabled = true;
    setMsg('校验中…');
    try {
      const res = await activate(code);
      if (res && res.ok) {
        setMsg('激活成功，正在解锁…', 'ok');
        gateActive = false;
        // 延迟一拍移除，让用户看到成功态
        setTimeout(() => {
          wrap.remove();
          if (typeof EventBus !== 'undefined') {
            EventBus.emit('license:activated', {});
          }
        }, 600);
      } else {
        setMsg(res && res.error ? res.error : '激活码无效', 'error');
        btn.disabled = false;
      }
    } catch (e) {
      setMsg('校验失败：' + (e && e.message ? e.message : '未知错误'), 'error');
      btn.disabled = false;
    }
  };

  btn.addEventListener('click', doActivate);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doActivate();
  });

  // —— 备份码导入（方案 1，换设备 / 换仓库入口）——
  const backupInput = wrap.querySelector('.blg-backup-input');
  const backupBtn = wrap.querySelector('.blg-backup-btn');
  const backupMsg = wrap.querySelector('.blg-backup-msg');
  const setBackupMsg = (text, type) => {
    backupMsg.textContent = text || '';
    backupMsg.className = 'blg-backup-msg' + (type ? ' blg-backup-msg-' + type : '');
  };

  const doImportBackup = async () => {
    if (typeof importBackup !== 'function') {
      setBackupMsg('当前环境不支持备份码导入', 'error');
      return;
    }
    const backup = (backupInput.value || '').trim();
    if (!backup) {
      setBackupMsg('请粘贴备份码', 'error');
      return;
    }
    backupBtn.disabled = true;
    setBackupMsg('导入中…');
    try {
      const res = await importBackup(backup);
      if (res && res.ok) {
        setBackupMsg('导入成功，正在解锁…', 'ok');
        gateActive = false;
        setTimeout(() => {
          wrap.remove();
          if (typeof EventBus !== 'undefined') {
            EventBus.emit('license:activated', {});
          }
        }, 600);
      } else {
        setBackupMsg(res && res.error ? res.error : '备份码无效', 'error');
        backupBtn.disabled = false;
      }
    } catch (e) {
      setBackupMsg('导入失败：' + (e && e.message ? e.message : '未知错误'), 'error');
      backupBtn.disabled = false;
    }
  };

  if (backupBtn && backupInput) {
    backupBtn.addEventListener('click', doImportBackup);
    backupInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doImportBackup();
    });
  }
}

/**
 * 在 webapp 启动早期调用：根据宿主下发的 licenseActive 决定是否挂遮罩。
 * 该函数由入口脚本在 app:ready 后调用。
 *
 * @param {boolean} licenseActive
 * @param {ShadowRoot|null} root
 * @param {(code:string)=>Promise<{ok:boolean,error?:string}>} activate
 * @param {(backup:string)=>Promise<{ok:boolean,error?:string}>} [importBackup]
 */
export function bootstrapLicenseGate(licenseActive, root, activate, importBackup) {
  if (licenseActive) {
    gateActive = false;
    return;
  }
  mountLicenseGate({ root, activate, importBackup });
}

// 供入口内联脚本调用
if (typeof window !== 'undefined') {
  window.bootstrapLicenseGate = bootstrapLicenseGate;
  window.mountLicenseGate = mountLicenseGate;
  window.isLicenseGateActive = isLicenseGateActive;
}
