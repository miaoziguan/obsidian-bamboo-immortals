export const EventBus = {
    events: {},
    
    SUBSCRIBER_LIMIT: 50,
    
    on(event, callback, context = null) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        
        if (this.events[event].length >= this.SUBSCRIBER_LIMIT) {
            console.warn(`Event "${event}" has reached subscriber limit of ${this.SUBSCRIBER_LIMIT}`);
            return null;
        }
        
        const id = `${event}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const subscriber = { id, callback, context };
        
        this.events[event].push(subscriber);
        
        return () => this.off(event, id);
    },
    
    off(event, subscriberId) {
        if (!this.events[event]) return false;
        
        const index = this.events[event].findIndex(sub => sub.id === subscriberId);
        if (index === -1) return false;
        
        this.events[event].splice(index, 1);
        
        if (this.events[event].length === 0) {
            delete this.events[event];
        }
        
        return true;
    },
    
    emit(event, data = null) {
        if (!this.events[event]) return [];
        
        const results = [];
        const subscribers = [...this.events[event]];
        
        subscribers.forEach(subscriber => {
            try {
                const result = subscriber.context 
                    ? subscriber.callback.call(subscriber.context, data)
                    : subscriber.callback(data);
                results.push({ success: true, result });
            } catch (error) {
                console.error(`Error in event "${event}" subscriber:`, error);
                results.push({ success: false, error });
            }
        });
        
        return results;
    },

    /**
     * 检查指定事件是否有订阅者
     * @param {string} event
     * @returns {boolean}
     */
    hasListeners(event) {
        return !!(this.events[event] && this.events[event].length > 0);
    },

    /**
     * 获取指定事件的订阅者数量
     * @param {string} event
     * @returns {number}
     */
    getListenerCount(event) {
        return (this.events[event] || []).length;
    },

    /**
     * 获取所有已注册的事件名列表
     * @returns {string[]}
     */
    getEvents() {
        return Object.keys(this.events);
    },

    /**
     * 订阅事件，但只执行一次（首次触发后自动取消）
     * @returns {Function} 取消订阅函数
     */
    once(event, callback, context = null) {
        const self = this;
        let unsub = null;
        unsub = this.on(event, function onceWrapper(data) {
            if (unsub) unsub();
            callback.call(context, data);
        }, null);
        return unsub;
    },

    /**
     * 清除订阅
     * @param {string} [event] - 指定事件名时只清除该事件；无参数时清除所有事件
     */
    clear(event) {
        if (event) {
            delete this.events[event];
        } else {
            this.events = {};
        }
    },
};

window.EventBus = EventBus;
