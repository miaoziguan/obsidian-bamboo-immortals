/**
 * ConsultModal — 竹林咨询确认弹窗
 *
 * 用户在笔记中选中文字，右键「竹林咨询」触发此弹窗。
 * 展示选中内容（只读）、可选补充说明，确认后通过 SMTP 直接发送邮件到羽鳞君。
 */

import { App, Modal, Notice, Setting } from 'obsidian';
import { sendEmail, type SmtpConfig } from './smtpSender';

const RECIPIENT = 'yanyulin2100@qq.com';

export interface ConsultOptions {
  /** 选中的文字内容 */
  selectedText: string;
  /** 来源笔记标题（旧字段，兼容原生笔记场景） */
  noteTitle?: string;
  /** 来源展示名（新字段，供外部插件联动时使用，如「竹杖芒鞋·《标题》」） */
  sourceLabel?: string;
  /** SMTP 配置 */
  smtpConfig: SmtpConfig;
}

export class ConsultModal extends Modal {
  private options: ConsultOptions;

  constructor(app: App, options: ConsultOptions) {
    super(app);
    this.options = options;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('bamboo-consult-modal');

    const displayLabel =
      this.options.sourceLabel ?? this.options.noteTitle ?? '未知来源';

    // 标题
    contentEl.createEl('h2', { text: '竹林咨询' });

    // 引导语
    contentEl.createEl('p', {
      text: '向羽鳞君发送一段文字。可以是疑问、反馈，或者想聊的任何事。',
      cls: 'bamboo-consult-desc',
    });

    // 选中内容展示（只读 textarea）
    new Setting(contentEl)
      .setName('选中的内容')
      .setDesc('来自：' + displayLabel)
      .addTextArea((ta) => {
        ta.setValue(this.options.selectedText).setDisabled(true);
        ta.inputEl.rows = 5;
        ta.inputEl.addClass('bamboo-consult-textarea');
      });

    // 补充说明（选填）
    let noteText = '';
    new Setting(contentEl)
      .setName('补充说明（选填）')
      .setDesc('可以补充你的问题背景、emoji、或者任何你想说的')
      .addTextArea((ta) => {
        ta.setPlaceholder('比如：这段话我纠结了一天，总觉得哪里不对...');
        ta.inputEl.rows = 3;
        ta.onChange((v) => {
          noteText = v;
        });
      });

    // 发送信息说明
    const infoBox = contentEl.createDiv({ cls: 'bamboo-consult-info' });
    infoBox.createEl('p', {
      text: `将发送至：${RECIPIENT}`,
      cls: 'bamboo-consult-recipient',
    });
    infoBox.createEl('p', {
      text: '发件人：' + this.options.smtpConfig.user,
      cls: 'bamboo-consult-sender',
    });

    // 按钮区
    const btnRow = contentEl.createDiv({ cls: 'bamboo-consult-buttons' });
    const cancelBtn = btnRow.createEl('button', { text: '算了', cls: 'bamboo-consult-cancel' });
    const sendBtn = btnRow.createEl('button', {
      text: '发送咨询',
      cls: 'bamboo-consult-send mod-cta',
    });

    let sending = false;

    cancelBtn.addEventListener('click', () => this.close());

    sendBtn.addEventListener('click', () => {
      if (sending) return;
      sending = true;
      sendBtn.disabled = true;
      sendBtn.textContent = '发送中...';
      void (async () => {

      const subject = `[竹林咨询] 来自《${displayLabel}》的一段文字`;

      // 拼装正文 HTML
      const note = noteText.trim();
      let body =
        `<p>以下内容来自 <strong>《${displayLabel}》</strong>：</p>` +
        `<blockquote style="margin:10px 0;padding:8px 16px;border-left:3px solid #4a9;background:rgba(74,153,136,0.08);white-space:pre-wrap;font-family:inherit;">
${escapeHtml(this.options.selectedText)}
</blockquote>`;

      if (note) {
        body += `<p style="margin-top:12px;">用户补充说明：</p>` +
          `<p style="margin-left:8px;">${escapeHtml(note)}</p>`;
      }

      body += `<hr style="margin:16px 0 8px;border:none;border-top:1px solid rgba(127,127,127,0.25);">` +
        `<p style="color:#999;font-size:0.85em;">—— 来自竹林修仙传 · 竹林咨询功能</p>`;

      const result = await sendEmail(this.options.smtpConfig, RECIPIENT, subject, body);

      if (result.ok) {
        new Notice('咨询已发送。我会尽快回复你 🎋', 6000);
        this.close();
      } else {
        sending = false;
        sendBtn.disabled = false;
        sendBtn.textContent = '发送咨询';
        new Notice(result.error ?? '发送失败，请检查 SMTP 配置后重试', 8000);
      }
      })();
    });

    // Esc 关闭
    contentEl.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
    });
  }

  onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
  }
}

/** 转义 HTML 特殊字符 */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
