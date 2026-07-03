import { VaultStorage } from '../storage/VaultStorage';
import { MarkdownSync } from '../storage/MarkdownSync';
import type { AnyBridgeMessage } from '../types/messages';

/**
 * StorageBridge - 将 storage:* 消息映射到 VaultStorage 操作
 */
export class StorageBridge {
  private storage: VaultStorage;
  private enableMarkdownSync: boolean;

  constructor(storage: VaultStorage, enableMarkdownSync = true) {
    this.storage = storage;
    this.enableMarkdownSync = enableMarkdownSync;
  }

  async handle(message: AnyBridgeMessage): Promise<unknown> {
    switch (message.type) {
      case 'storage:readDay':
        return await this.storage.getDay(message.payload.dateKey);

      case 'storage:writeDay': {
        const result = await this.storage.putDay(message.payload.data as any);
        // 双写 Markdown 摘要
        if (this.enableMarkdownSync && message.payload.data) {
          try {
            const md = MarkdownSync.generateMarkdown(message.payload.data as any);
            await this.storage.writeMarkdownReview(message.payload.dateKey, md);
          } catch (e) {
            console.warn('Markdown sync failed:', e);
          }
        }
        return result;
      }

      case 'storage:listDays':
        return await this.storage.getAllDays();

      case 'storage:deleteDay': {
        await this.storage.deleteMarkdownReview(message.payload.dateKey);
        return await this.storage.deleteDay(message.payload.dateKey);
      }

      case 'storage:getSetting':
        return await this.storage.getSetting(message.payload.key);

      case 'storage:putSetting':
        return await this.storage.putSetting(message.payload.key, message.payload.value);

      case 'storage:getAllSettings':
        return await this.storage.getAllSettings();

      case 'storage:getGoals':
        return await this.storage.getGoals();

      case 'storage:putGoals':
        return await this.storage.putGoals(message.payload.goals);

      case 'storage:getPurchaseHistory':
        return await this.storage.getPurchaseHistory();

      case 'storage:putPurchaseHistory':
        return await this.storage.putPurchaseHistory(message.payload.data);

      case 'storage:getIncomeHistory':
        return await this.storage.getIncomeHistory();

      case 'storage:putIncomeHistory':
        return await this.storage.putIncomeHistory(message.payload.data);

      case 'storage:getDayKeys':
        return await this.storage.getDayKeys();

      case 'storage:getDaysPaginated':
        return await this.storage.getDaysPaginated(
          (message as any).payload?.page ?? 0,
          (message as any).payload?.pageSize ?? 30
        );

      case 'storage:exportAll':
        return await this.storage.exportAllData();

      case 'storage:importAll':
        return await this.storage.importData(message.payload.data, message.payload.options);

      case 'storage:clearAll':
        return await this.storage.clearAll();

      default:
        throw new Error(`Unknown storage message type: ${message.type}`);
    }
  }
}
