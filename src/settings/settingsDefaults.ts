/**
 * 设置默认值常量（中立模块：不 import 任何东西）。
 *
 * 存在理由：把「三类 Markdown 导出目录默认值」从 legacySettings 抽出来，
 * 使 PluginSettings（主干设置）与 legacySettings（旧值迁移）都能引用，
 * 而不必让 PluginSettings 反向依赖迁移代码。
 *
 * 历史背景（P1-4）：原先 PluginSettings → legacySettings 是**值**依赖，
 * legacySettings → PluginSettings 是 `import type` 依赖。运行期其实无环
 * （type 被编译擦除），但依赖方向是反的（主干依赖迁移），且静态依赖图成环。
 * 抽出本模块后两边都指向中立常量，依赖图为无环，方向也恢复自然。
 */

/** 三类 Markdown 导出的默认目录（须与 DEFAULT_SETTINGS 保持一致） */
export const EXPORT_FOLDER_DEFAULTS: Record<
  'mmExportFolder' | 'noteExportFolder' | 'writeExportFolder',
  string
> = {
  mmExportFolder: '思维子弹',
  noteExportFolder: '便签',
  writeExportFolder: 'MD可视化写作',
};
