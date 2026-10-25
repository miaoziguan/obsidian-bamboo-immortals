/**
 * 目标行内编辑（GoalsRenderer._startInlineEdit 的实体）。
 *
 * P2-6 Round 1：从 renderer.js 逐字搬出（360 行），仅把 `this.` 替换为 `ctx.`。
 *
 * 命名注意：本文件只负责「进入编辑态」的 DOM 编排；**提交逻辑**在既有模块
 * inlineEditService.js（GoalInlineEditService），两者职责不同、互不覆盖。
 * 调用方传入**渲染器自身**作为 ctx，因此字段/方法解析与原先完全一致，
 * 包括 `ctx._pendingEditPromise` 这类可变状态的读写（仍是同一个对象）。
 *
 * 行为等价性由 tests/goalsInlineEdit.jest.test.js 的特征测试保证（迁移前后同一批用例）。
 *
 * @param {object} ctx 渲染器（提供 _validateInlineEdit / _commitInlineEdit / renderSingleGoal /
 *                      _flashEditedElement / _showCategoryPicker / _showPriorityPicker /
 *                      _showDateRangePicker 与 _pendingEditPromise 状态）
 * @param {HTMLElement} el 带 data-inline-edit / data-goal-id [/ data-sub-idx] 的元素
 */
export function startInlineEdit(ctx, el) {
        const editType = el.dataset.inlineEdit;
        const goalId = el.dataset.goalId;
        const subIdx = el.dataset.subIdx !== undefined ? parseInt(el.dataset.subIdx) : null;

        // 防止重复进入编辑
        if (el.querySelector('input, textarea, select')) return;

        const goals = store.getGlobalGoals();
        const goal = goals.find(g => g.id === goalId);
        if (!goal) return;

        if (goal.archived) {
            Toast.showToast('已归档目标不可编辑，请先恢复', 'warning');
            return;
        }

        let input;
        let hint = null;
        let closeHintFn = null;
        let errorMsg = null;
        // 显示行内错误（红框 + 错误文案），隐藏快捷键提示以免重叠
        const showError = (msg) => {
            input.classList.add('goal-inline-edit-input-error');
            if (errorMsg) { errorMsg.textContent = msg; errorMsg.style.display = 'block'; }
            if (hint) hint.style.display = 'none';
        };
        // 清除行内错误状态，恢复快捷键提示
        const clearError = () => {
            input.classList.remove('goal-inline-edit-input-error');
            if (errorMsg) errorMsg.style.display = 'none';
            if (hint) hint.style.display = '';
        };
        const saveAndRender = () => {
            if (closeHintFn) { closeHintFn({ target: input }); closeHintFn = null; }
            const val = input.value.trim();
            if (val === '' && (editType === 'title' || editType === 'name')) { ctx.renderSingleGoal(goalId); return; }
            // Step 4: 保存前即时范围校验（currentValue / targetValue）
            const validation = ctx._validateInlineEdit(editType, val, goal, subIdx);
            if (!validation.valid) {
                showError(validation.message);
                Toast.showToast(validation.message, 'error');
                // 保留编辑框供用户修正，重新挂载 blur 监听以便重试
                input.addEventListener('blur', saveAndRender, { once: true });
                return;
            }
            const doSave = () => {
                return ctx._commitInlineEdit(goal, subIdx, editType, val).then(() => {
                    ctx._pendingEditPromise = null;
                    ctx.renderSingleGoal(goalId);
                    // Step 1: 保存成功 — 绿色闪烁反馈
                    ctx._flashEditedElement(goalId, subIdx);
                }).catch(e => {
                    ctx._pendingEditPromise = null;
                    console.error('Save failed:', e);
                    // Step 2: 保存失败 — 保留编辑框并高亮错误，不调用 renderSingleGoal
                    const msg = (e && e.message) ? e.message : '保存失败，请重试';
                    showError(msg);
                    Toast.showToast(msg, 'error');
                    input.addEventListener('blur', saveAndRender, { once: true });
                });
            };
            if (ctx._pendingEditPromise) {
                ctx._pendingEditPromise = ctx._pendingEditPromise.then(doSave, doSave);
            } else {
                ctx._pendingEditPromise = doSave();
            }
        };

        switch (editType) {
            case 'title': {
                const current = el.textContent.trim();
                input = document.createElement('input');
                input.type = 'text';
                input.value = current;
                input.className = 'goal-inline-edit-input';
                input.style.cssText = 'font:inherit;font-weight:600;color:var(--text-primary);border:1px solid var(--bamboo-primary);border-radius:4px;padding:2px 6px;outline:none;background:var(--bamboo-background);min-width:clamp(80px, 15vw, 160px);';
                break;
            }
            case 'meta': {
                const current = el.textContent.trim();
                input = document.createElement('input');
                input.type = 'text';
                input.value = current;
                input.className = 'goal-inline-edit-input';
                input.style.cssText = 'font:inherit;font-size:var(--font-size-xs);color:var(--text-secondary);border:1px solid var(--bamboo-primary);border-radius:4px;padding:2px 6px;outline:none;background:var(--bamboo-background);min-width:80px;';
                break;
            }
            case 'name': {
                const current = el.textContent.replace(/^[✓⏸]\s*/, '').trim();
                input = document.createElement('input');
                input.type = 'text';
                input.value = current;
                input.className = 'goal-inline-edit-input';
                input.style.cssText = 'font:inherit;font-weight:500;color:var(--text-primary);border:1px solid var(--bamboo-primary);border-radius:4px;padding:2px 6px;outline:none;background:var(--bamboo-background);min-width:80px;';
                break;
            }
            case 'currentValue': {
                const rawVal = (subIdx !== null && goal.items && goal.items[subIdx]) 
                    ? (goal.items[subIdx].currentValue !== undefined && goal.items[subIdx].currentValue !== '' ? goal.items[subIdx].currentValue : goal.items[subIdx].startValue)
                    : el.textContent.trim();
                const current = rawVal;
                input = document.createElement('input');
                input.type = 'text';
                input.value = current;
                input.className = 'goal-inline-edit-input';
                input.style.cssText = 'font:inherit;font-weight:500;color:var(--text-primary);border:1px solid var(--bamboo-primary);border-radius:4px;padding:4px 8px;outline:none;background:var(--bamboo-background);min-width:44px;max-width:200px;text-align:right;box-sizing:border-box;';
                const updateCVWidth = () => {
                    const len = input.value.length || 1;
                    input.style.width = Math.max(44, Math.min(200, len * 10 + 24)) + 'px';
                };
                input.addEventListener('input', updateCVWidth);
                updateCVWidth();
                break;
            }
            case 'dailyMin': {
                const current = (subIdx !== null && goal.items && goal.items[subIdx]) ? (goal.items[subIdx].dailyMin || '') : '';
                input = document.createElement('input');
                input.type = 'number';
                input.value = current;
                input.step = 'any';
                input.placeholder = '';
                input.className = 'goal-inline-edit-input';
                input.style.cssText = 'font:inherit;font-size:var(--font-size-xs);color:var(--bamboo-warning);border:none;border-radius:0;padding:0;outline:none;background:transparent;min-width:20px;max-width:90px;text-align:left;box-sizing:border-box;font-weight:600;';
                const updateDMWidth = () => {
                    const len = input.value.length || 1;
                    input.style.width = Math.max(20, Math.min(90, len * 10)) + 'px';
                };
                input.addEventListener('input', updateDMWidth);
                updateDMWidth();
                break;
            }
            case 'targetValue': {
                const rawVal = (subIdx !== null && goal.items && goal.items[subIdx])
                    ? goal.items[subIdx].targetValue
                    : el.textContent.trim();
                const current = rawVal;
                input = document.createElement('input');
                input.type = 'text';
                input.value = current === '-' ? '' : current;
                input.placeholder = '目标';
                input.className = 'goal-inline-edit-input';
                input.style.cssText = 'font:inherit;font-size:var(--font-size-sm);color:var(--text-secondary);border:1px solid var(--bamboo-primary);border-radius:6px;padding:4px 8px;outline:none;background:var(--bamboo-background);min-width:60px;max-width:200px;text-align:center;box-sizing:border-box;';
                // 自动调整宽度适应内容
                const updateWidth = () => {
                    const len = input.value.length || 1;
                    input.style.width = Math.max(60, Math.min(200, len * 10 + 24)) + 'px';
                };
                input.addEventListener('input', updateWidth);
                updateWidth();
                break;
            }
            case 'category': {
                const currentCatId = el.dataset.category || '';
                ctx._showCategoryPicker({
                    el,
                    currentCatId,
                    onSelect: (catId) => {
                        ctx._pendingEditPromise = ctx._commitInlineEdit(goal, null, 'category', catId).then(() => {
                            ctx._pendingEditPromise = null;
                            ctx.renderSingleGoal(goalId);
                        }).catch(e => console.warn('[Bamboo] 目标分类保存失败:', e));
                    },
                    onCancel: () => ctx.renderSingleGoal(goalId)
                });
                return;
            }
            case 'priority': {
                const currentPriority = goal.priority || 'medium';
                ctx._showPriorityPicker({
                    el,
                    currentPriority,
                    onSelect: (priority) => {
                        ctx._pendingEditPromise = ctx._commitInlineEdit(goal, null, 'priority', priority).then(() => {
                            ctx._pendingEditPromise = null;
                            ctx.renderSingleGoal(goalId);
                        }).catch(e => console.warn('[Bamboo] 目标优先级保存失败:', e));
                    },
                    onCancel: () => ctx.renderSingleGoal(goalId)
                });
                return;
            }
            case 'status': {
                if (subIdx === null || !goal.items || !goal.items[subIdx]) return;
                const item = goal.items[subIdx];
                const currentStatus = item.detail || '';
                const nextStatus = currentStatus === '已搁置' ? '' : '已搁置';
                ctx._pendingEditPromise = ctx._commitInlineEdit(goal, subIdx, 'status', nextStatus).then(() => {
                    ctx._pendingEditPromise = null;
                    ctx.renderSingleGoal(goalId);
                }).catch(e => console.warn('[Bamboo] 目标状态保存失败:', e));
                return;
            }
            case 'dateRange': {
                if (subIdx === null) {
                    Toast.showToast('目标日期根据子项目自动计算', 'info');
                    return;
                }
                // 直接从数据中获取当前日期范围，而不是从显示文本解析
                let currentStart = '';
                let currentEnd = '';
                if (goal.items && goal.items[subIdx]) {
                    const item = goal.items[subIdx];
                    currentStart = item.startDate || '';
                    currentEnd = item.endDate || '';
                }

                // 创建选择器容器
                ctx._showDateRangePicker({
                    el,
                    goal,
                    subIdx,
                    currentStart,
                    currentEnd,
                    onSelect: (startDate, endDate) => {
                        ctx._pendingEditPromise = ctx._commitInlineEdit(goal, subIdx, 'dateRange', `${startDate}→${endDate}`).then(() => {
                            ctx._pendingEditPromise = null;
                            ctx.renderSingleGoal(goalId);
                        }).catch(e => console.warn('[Bamboo] 目标日期范围保存失败:', e));
                    },
                    onCancel: () => ctx.renderSingleGoal(goalId)
                });
                return; // 不走下面的通用输入逻辑
            }
            default:
                return;
        }

        el.replaceWith(input);
        input.focus();
        input.select();

        // 如果是编辑每日值，显示建议提示
        if (editType === 'dailyMin' && subIdx !== null && goal.items && goal.items[subIdx]) {
            const item = goal.items[subIdx];
            const suggested = GoalService.calcSuggestedDaily(item);
            const remainingDays = GoalService.calcDaysRemaining(item.endDate);
            const targetVal = parseFloat(item.targetValue) || 0;
            const currentVal = parseFloat(item.currentValue) || parseFloat(item.startValue) || 0;
            const remainingVal = targetVal - currentVal;
            
            if (suggested !== null && suggested > 0 && remainingVal > 0 && remainingDays !== null) {
                const suggestedVal = String(suggested);
                    
                    // 创建提示
                    const hint = document.createElement('div');
                    hint.className = 'goal-daily-hint';
                    hint.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;"><span>💡 点击填入<br><strong>${suggestedVal}/天</strong></span><span style="cursor:pointer;opacity:0.7;font-size:14px;line-height:1;" class="hint-close">✕</span></div><span style="font-size:10px;opacity:0.8;">剩余 ${remainingVal.toFixed(1)} / ${remainingDays} 天</span><div style="font-size:10px;opacity:0.75;margin-top:3px;border-top:1px solid rgba(255,255,255,0.3);padding-top:3px;">回车保存</div>`;
                    hint.style.cssText = 'position:absolute;top:100%;left:50%;transform:translateX(-50%);margin-top:8px;padding:10px 14px;background:var(--bamboo-primary);color:white;border-radius:10px;font-size:12px;white-space:nowrap;z-index:1000;box-shadow:0 4px 16px hsla(calc(var(--accent-hue) + 0), 26%, calc(48% + var(--accent-lightness-offset)), 0.3);line-height:1.4;cursor:pointer;transition:transform 0.2s,box-shadow 0.2s,opacity:0.2s;';
                    hint.addEventListener('mouseenter', () => {
                        hint.style.transform = 'translateX(-50%) scale(1.05)';
                        hint.style.boxShadow = '0 6px 20px hsla(calc(var(--accent-hue) + 0), 26%, calc(48% + var(--accent-lightness-offset)), 0.4)';
                    });
                    hint.addEventListener('mouseleave', () => {
                        hint.style.transform = 'translateX(-50%) scale(1)';
                        hint.style.boxShadow = '0 4px 16px hsla(calc(var(--accent-hue) + 0), 26%, calc(48% + var(--accent-lightness-offset)), 0.3)';
                    });
                    
                    // 点击填入数值
                    hint.addEventListener('mousedown', (e) => {
                        e.preventDefault();
                    });

                    // 点击页面其他区域关闭（提前定义以便各回调引用）
                    const closeHint = (e) => {
                        if (!eventInTargets(e, hint) && !eventInTargets(e, input)) {
                            hint.style.opacity = '0';
                            setTimeout(() => hint.remove(), 200);
                            document.removeEventListener('click', closeHint);
                        }
                    };
                    closeHintFn = closeHint;
                    
                    hint.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (e.target.classList.contains('hint-close')) return;
                        input.value = suggestedVal;
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                        hint.style.opacity = '0';
                        setTimeout(() => hint.remove(), 200);
                        document.removeEventListener('click', closeHint);
                        input.removeEventListener('blur', saveAndRender);
                        saveAndRender();
                    });
                    
                    // 关闭按钮
                    const closeBtn = hint.querySelector('.hint-close');
                    closeBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        hint.style.opacity = '0';
                        setTimeout(() => hint.remove(), 200);
                        document.removeEventListener('click', closeHint);
                    });
                    
                    // 添加小箭头
                    const arrow = document.createElement('div');
                    arrow.style.cssText = 'position:absolute;bottom:100%;left:50%;transform:translateX(-50%);border:7px solid transparent;border-bottom-color:var(--bamboo-primary);';
                    hint.appendChild(arrow);
                    
                    setTimeout(() => document.addEventListener('click', closeHint), 100);
                    
                    // 给 input 添加包装器
                    const wrapper = document.createElement('div');
                    wrapper.style.cssText = 'position:relative;display:inline-flex;';
                    input.parentNode.replaceChild(wrapper, input);
                    wrapper.appendChild(input);
                    wrapper.appendChild(hint);
            }
        }

        // Step 3: 在编辑框下方显示「Enter 保存 · Esc 取消」提示
        // dailyMin 已在建议提示中内嵌快捷键说明（closeHintFn 已设置），此处跳过避免重叠
        if (!closeHintFn) {
            hint = document.createElement('div');
            hint.className = 'goal-inline-edit-hint';
            hint.textContent = '回车保存';

            errorMsg = document.createElement('div');
            errorMsg.className = 'goal-inline-edit-error-msg';
            errorMsg.style.display = 'none';

            // 确保输入框有相对定位的父级以承载绝对定位的提示
            let hintAnchor = input.parentNode;
            const anchorIsRelative = hintAnchor && hintAnchor.nodeType === 1 && getComputedStyle(hintAnchor).position === 'relative';
            if (!anchorIsRelative) {
                const anchor = document.createElement('span');
                anchor.className = 'goal-inline-edit-anchor';
                input.parentNode.replaceChild(anchor, input);
                anchor.appendChild(input);
                hintAnchor = anchor;
            }
            if (hintAnchor) {
                hintAnchor.appendChild(hint);
                hintAnchor.appendChild(errorMsg);
            }
            // 注意：此处不覆盖 closeHintFn。快捷键提示无 document 监听需要清理，
            // 保存/取消时 renderSingleGoal 会整体替换 goal-row 自然回收；
            // 保留 hint/errorMsg 在 DOM 中，以便保存失败时 showError 仍可显示错误文案。
        }

        // Step 4: currentValue / targetValue 即时范围校验（输入时反馈）
        if (editType === 'currentValue' || editType === 'targetValue') {
            input.addEventListener('input', () => {
                const result = ctx._validateInlineEdit(editType, input.value.trim(), goal, subIdx);
                if (result.valid) {
                    clearError();
                } else {
                    showError(result.message);
                }
            });
        }

        input.addEventListener('blur', saveAndRender, { once: true });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === 'Escape') {
                e.preventDefault(); e.stopPropagation();
                input.blur();
            }
        });
}

// 测试加载器（loadModule）会剥离 import/export，调用方按**全局名**解析依赖
// （与 utils/perf.js、goals/healthDetailView.js 同款做法）。
if (typeof globalThis !== 'undefined') {
    globalThis.startInlineEdit = startInlineEdit;
}
