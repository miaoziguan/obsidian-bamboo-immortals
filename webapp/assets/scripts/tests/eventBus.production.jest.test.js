/**
 * @jest-environment jsdom
 *
 * EventBus 生产脚本测试
  */


const { loadModule } = require('./__helpers__/testUtils');
describe('EventBus production module', () => {
    beforeEach(() => {
        jest.resetModules();
        delete window.EventBus;
        loadModule('utils/eventBus.js', ['EventBus']);
        window.EventBus.clear();
    });

    test('应订阅、触发并取消事件', () => {
        const callback = jest.fn();
        const unsubscribe = window.EventBus.on('review:saved', callback);

        const results = window.EventBus.emit('review:saved', { date: '2026-05-17' });

        expect(callback).toHaveBeenCalledWith({ date: '2026-05-17' });
        expect(results[0]).toMatchObject({ success: true });
        expect(window.EventBus.hasListeners('review:saved')).toBe(true);

        unsubscribe();

        window.EventBus.emit('review:saved', { date: '2026-05-18' });
        expect(callback).toHaveBeenCalledTimes(1);
        expect(window.EventBus.hasListeners('review:saved')).toBe(false);
    });

    test('once 监听器应只执行一次', () => {
        const callback = jest.fn();

        window.EventBus.once('toast:shown', callback);
        window.EventBus.emit('toast:shown', 'first');
        window.EventBus.emit('toast:shown', 'second');

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith('first');
    });

    test('监听器异常应被捕获并返回失败结果', () => {
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        window.EventBus.on('unsafe:event', () => {
            throw new Error('boom');
        });

        const results = window.EventBus.emit('unsafe:event');

        expect(results).toHaveLength(1);
        expect(results[0].success).toBe(false);
        expect(results[0].error.message).toBe('boom');
        expect(errorSpy).toHaveBeenCalled();
        errorSpy.mockRestore();
    });

    test('SUBSCRIBER_LIMIT 应为 50', () => {
        expect(window.EventBus.SUBSCRIBER_LIMIT).toBe(50);
    });

    test('订阅数未达上限时应正常注册', () => {
        const callbacks = [];
        for (let i = 0; i < 15; i++) {
            const cb = jest.fn();
            const result = window.EventBus.on('popular:event', cb);
            expect(result).not.toBeNull();
            callbacks.push(cb);
        }
        expect(window.EventBus.getListenerCount('popular:event')).toBe(15);
    });

    test('订阅数达到上限后应返回 null 并打印警告', () => {
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        for (let i = 0; i < 50; i++) {
            window.EventBus.on('full:event', jest.fn());
        }
        const result = window.EventBus.on('full:event', jest.fn());
        expect(result).toBeNull();
        expect(warnSpy).toHaveBeenCalled();
        warnSpy.mockRestore();
    });

    test('off 不存在的事件应返回 false', () => {
        expect(window.EventBus.off('nonexistent:event', 'fake_id')).toBe(false);
    });

    test('clear 指定事件应只清除该事件', () => {
        const cb1 = jest.fn();
        const cb2 = jest.fn();
        window.EventBus.on('event:a', cb1);
        window.EventBus.on('event:b', cb2);

        window.EventBus.clear('event:a');

        expect(window.EventBus.hasListeners('event:a')).toBe(false);
        expect(window.EventBus.hasListeners('event:b')).toBe(true);
    });

    test('clear 无参数应清除所有事件', () => {
        window.EventBus.on('event:a', jest.fn());
        window.EventBus.on('event:b', jest.fn());

        window.EventBus.clear();

        expect(window.EventBus.getEvents()).toEqual([]);
    });

    test('emit 不存在的事件应返回空数组', () => {
        const results = window.EventBus.emit('nonexistent:event');
        expect(results).toEqual([]);
    });
});
