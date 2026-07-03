export const SectionDragDrop = {
    draggedItem: null,
    draggedOverItem: null,
    config: {
        animationDuration: 200,
        ghostClass: 'sm-dragging',
        dragOverClass: 'sm-drag-over',
        placeholderClass: 'sm-drag-placeholder',
        useGhost: true,
        useAnimation: true,
        constrainToContainer: true,
        maxItems: -1,
        filterSelector: null
    },
    instances: new Map(),

    createConfig(options = {}) {
        return {
            ...this.config,
            ...options
        };
    },

    init(listElement, options = {}) {
        if (!listElement) return null;

        const instanceId = listElement.id || `dd_${Date.now()}`;
        
        if (this.instances.has(instanceId)) {
            this.destroy(instanceId);
        }

        const config = this.createConfig(options);
        config.listElement = listElement;
        config.instanceId = instanceId;

        const items = this.getDraggableItems(listElement, config);
        
        items.forEach(item => {
            this.setupDragEvents(item, listElement, config);
        });

        this.instances.set(instanceId, {
            listElement,
            config,
            items
        });

        EventBus.emit('dragdrop:initialized', { instanceId, config });

        return instanceId;
    },

    getDraggableItems(listElement, config) {
        let items = listElement.querySelectorAll('.sm-item');
        
        if (config.filterSelector) {
            items = [...items].filter(item => item.matches(config.filterSelector));
        }
        
        return items;
    },

    setupDragEvents(item, listElement, config) {
        item.setAttribute('draggable', 'true');
        item.style.cursor = 'grab';

        const dragStartHandler = (e) => this.handleDragStart(e, item, listElement, config);
        const dragEndHandler = (e) => this.handleDragEnd(e, item, listElement, config);
        const dragOverHandler = (e) => this.handleDragOver(e, item, listElement, config);
        const dragLeaveHandler = (e) => this.handleDragLeave(e, item, config);
        const dropHandler = (e) => this.handleDrop(e, item, listElement, config);

        item.__dragStartHandler = dragStartHandler;
        item.__dragEndHandler = dragEndHandler;
        item.__dragOverHandler = dragOverHandler;
        item.__dragLeaveHandler = dragLeaveHandler;
        item.__dropHandler = dropHandler;

        item.addEventListener('dragstart', dragStartHandler);
        item.addEventListener('dragend', dragEndHandler);
        item.addEventListener('dragover', dragOverHandler);
        item.addEventListener('dragleave', dragLeaveHandler);
        item.addEventListener('drop', dropHandler);
    },

    handleDragStart(e, item, listElement, config) {
        this.draggedItem = item;
        
        if (config.useAnimation) {
            item.style.transition = `transform ${config.animationDuration}ms ease`;
        }
        
        item.classList.add(config.ghostClass);
        
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', item.dataset.id);

        if (config.onDragStart) {
            config.onDragStart({
                item,
                listElement,
                data: item.dataset.id
            });
        }

        EventBus.emit('dragdrop:dragstart', {
            instanceId: config.instanceId,
            item,
            data: item.dataset.id
        });

        if (config.useGhost) {
            const ghost = item.cloneNode(true);
            ghost.style.opacity = '0.5';
            ghost.style.position = 'absolute';
            ghost.style.top = '-9999px';
            document.body.appendChild(ghost);
            e.dataTransfer.setDragImage(ghost, 0, 0);
            setTimeout(() => ghost.remove(), 0);
        }
    },

    handleDragEnd(e, item, listElement, config) {
        item.classList.remove(config.ghostClass);
        item.style.transition = '';
        
        if (this.draggedItem) {
            listElement.querySelectorAll(`.${config.dragOverClass}`).forEach(el => {
                el.classList.remove(config.dragOverClass);
            });
        }

        const dragEndData = {
            instanceId: config.instanceId,
            item,
            data: item.dataset.id
        };

        if (config.onDragEnd) {
            config.onDragEnd(dragEndData);
        }

        EventBus.emit('dragdrop:dragend', dragEndData);

        this.draggedItem = null;
    },

    handleDragOver(e, item, listElement, config) {
        if (!this.draggedItem || this.draggedItem === item) return;

        if (config.constrainToContainer && listElement && document.contains(listElement)) {
            let rect;
            try {
                rect = listElement.getBoundingClientRect();
            } catch (e) {
                return;
            }
            if (!rect || (rect.width === 0 && rect.height === 0)) return;
            if (e.clientX < rect.left || e.clientX > rect.right ||
                e.clientY < rect.top || e.clientY > rect.bottom) {
                return;
            }
        }

        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        item.classList.add(config.dragOverClass);
    },

    handleDragLeave(e, item, config) {
        item.classList.remove(config.dragOverClass);
    },

    handleDrop(e, item, listElement, config) {
        e.preventDefault();
        item.classList.remove(config.dragOverClass);

        if (!this.draggedItem || this.draggedItem === item) return;

        const dropData = {
            instanceId: config.instanceId,
            draggedItem: this.draggedItem,
            targetItem: item,
            draggedId: this.draggedItem.dataset.id,
            targetId: item.dataset.id
        };

        this.reorderItems(listElement, this.draggedItem, item, config);

        if (config.onDrop) {
            config.onDrop(dropData);
        }

        EventBus.emit('dragdrop:drop', dropData);
    },

    reorderItems(listElement, draggedItem, targetItem, config) {
        const allItems = [...listElement.querySelectorAll('.sm-item:not(.sm-item-hidden)')];
        const draggedIdx = allItems.indexOf(draggedItem);
        const targetIdx = allItems.indexOf(targetItem);

        if (draggedIdx === -1 || targetIdx === -1) return;

        if (draggedIdx < targetIdx) {
            if (config.useAnimation) {
                draggedItem.style.transform = 'translateY(' + (targetItem.offsetTop - draggedItem.offsetTop) + 'px)';
            }
            listElement.insertBefore(draggedItem, targetItem.nextSibling);
        } else {
            if (config.useAnimation) {
                draggedItem.style.transform = 'translateY(' + (targetItem.offsetTop - draggedItem.offsetTop) + 'px)';
            }
            listElement.insertBefore(draggedItem, targetItem);
        }

        if (config.useAnimation) {
            setTimeout(() => {
                allItems.forEach(item => item.style.transform = '');
            }, config.animationDuration);
        }

        setTimeout(() => {
            this.saveOrder(listElement, config);
        }, config.useAnimation ? config.animationDuration : 0);
    },

    saveOrder(listElement, config) {
        if (!listElement) return;

        const items = listElement.querySelectorAll('.sm-item');
        const order = Array.from(items).map(item => item.dataset.id);
        
        if (config.onOrderChange) {
            config.onOrderChange(order);
        }

        SectionRegistry.updateOrder(order);

        EventBus.emit('dragdrop:orderChanged', {
            instanceId: config.instanceId,
            order
        });
    },

    destroy(instanceId) {
        const instance = this.instances.get(instanceId);
        if (!instance) return false;

        const { listElement, config } = instance;
        const items = this.getDraggableItems(listElement, config);

        items.forEach(item => {
            if (item.__dragStartHandler) {
                item.removeEventListener('dragstart', item.__dragStartHandler);
            }
            if (item.__dragEndHandler) {
                item.removeEventListener('dragend', item.__dragEndHandler);
            }
            if (item.__dragOverHandler) {
                item.removeEventListener('dragover', item.__dragOverHandler);
            }
            if (item.__dragLeaveHandler) {
                item.removeEventListener('dragleave', item.__dragLeaveHandler);
            }
            if (item.__dropHandler) {
                item.removeEventListener('drop', item.__dropHandler);
            }
            item.removeAttribute('draggable');
            item.style.cursor = '';
        });

        this.instances.delete(instanceId);
        
        EventBus.emit('dragdrop:destroyed', { instanceId });

        return true;
    },

    destroyAll() {
        const instanceIds = [...this.instances.keys()];
        instanceIds.forEach(id => this.destroy(id));
    },

    refresh(instanceId) {
        const instance = this.instances.get(instanceId);
        if (!instance) return null;

        const { listElement: oldListElement, config } = instance;
        const items = this.getDraggableItems(oldListElement, config);

        items.forEach(item => {
            if (item.__dragStartHandler) {
                item.removeEventListener('dragstart', item.__dragStartHandler);
                item.removeEventListener('dragend', item.__dragEndHandler);
                item.removeAttribute('draggable');
                item.style.cursor = '';
            }
        });

        const newListElement = document.getElementById(oldListElement.id);
        if (newListElement) {
            const newItems = this.getDraggableItems(newListElement, config);
            newItems.forEach(item => {
                this.setupDragEvents(item, newListElement, config);
            });
            
            instance.listElement = newListElement;
            instance.items = newItems;

            EventBus.emit('dragdrop:refreshed', { instanceId });
            
            return instanceId;
        }

        this.instances.delete(instanceId);
        return null;
    },

    getInstance(instanceId) {
        return this.instances.get(instanceId) || null;
    },

    getActiveDraggable() {
        return this.draggedItem;
    },

    isDragging() {
        return this.draggedItem !== null;
    },

    pause(instanceId) {
        const instance = this.instances.get(instanceId);
        if (!instance) return false;
        instance.config.isPaused = true;
        return true;
    },

    resume(instanceId) {
        const instance = this.instances.get(instanceId);
        if (!instance) return false;
        instance.config.isPaused = false;
        return true;
    },

    addItem(instanceId, itemElement) {
        const instance = this.instances.get(instanceId);
        if (!instance) return false;
        this.setupDragEvents(itemElement, instance.listElement, instance.config);
        instance.items.push(itemElement);
        return true;
    },

    removeItem(instanceId, itemElement) {
        const instance = this.instances.get(instanceId);
        if (!instance) return false;

        itemElement.removeEventListener('dragstart', itemElement.__dragStartHandler);
        itemElement.removeEventListener('dragend', itemElement.__dragEndHandler);
        itemElement.removeAttribute('draggable');
        
        const index = instance.items.indexOf(itemElement);
        if (index > -1) {
            instance.items.splice(index, 1);
        }
        
        return true;
    }
};

window.SectionDragDrop = SectionDragDrop;