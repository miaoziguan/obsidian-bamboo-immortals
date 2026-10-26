# 死方法候选清单（零引用对象方法）

> 本清单由 `scripts/check-dead-methods.mjs` 自动生成 + 人工裁决。
> 背景：_showInputModal（零调用存活）、timeline editor（唯一消费者自身已死）
> 两起事故后补的方法级扫描。参见 docs/ui-debt-decisions.md「接线三问」。

## 闸门意图

任何「新增的零引用方法」触发 CI 失败（强制评审）。已知局限见脚本头部注释
（同名共享判定、属性键不覆盖、动态派发假设）——宁可漏报，不误伤。

---

<!-- AUTO-GENERATED:dead-methods START -->
> 本节由 `scripts/check-dead-methods.mjs` **自动生成，勿手改**。改完代码执行：
> `node scripts/check-dead-methods.mjs --update`（CI 跑默认模式校验漂移）。

**零引用方法合计：0**

| 方法 | 位置 |
|---|---|
（无）
<!-- AUTO-GENERATED:dead-methods END -->
