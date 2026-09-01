/**
 * censerStyles.js — 香插（香器）样式库
 *
 * 画中卷的香道番茄钟可更换香插样式。为保持视觉一致，所有款式共用：
 *   - 同一个 viewBox（0 0 112 80）与容器尺寸，切换时不会有位移/缩放跳动；
 *   - 同一套渐变 id（csBody / csHi / csPool）与语义色变量（--cs-1..4 等），
 *     故换款只需替换 path，配色由 .scroll-censer.censer-<key> 覆写变量完成；
 *   - 香身插孔位于 x=56、开口在 y≈20-28，香身穿过香器被遮挡的部分保持一致。
 *
 * 新增一款：在此数组追加 { key, name, svg }，并在 base.css 里补
 * `.scroll-censer.censer-<key>` 的亮/暗两组变量即可，无需改动逻辑代码。
 */

/** 共享渐变定义：颜色全部引用 --cs-* 变量，换 class 即整体换色 */
export const CENSER_DEFS = `
  <defs>
    <linearGradient id="csBody" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="var(--cs-1)"/>
      <stop offset="30%" stop-color="var(--cs-2)"/>
      <stop offset="60%" stop-color="var(--cs-3)"/>
      <stop offset="100%" stop-color="var(--cs-4)"/>
    </linearGradient>
    <linearGradient id="csHi" x1="0.2" y1="0" x2="0.8" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.52"/>
      <stop offset="22%" stop-color="#ffffff" stop-opacity="0.2"/>
      <stop offset="55%" stop-color="#ffffff" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="csPool" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="transparent"/>
      <stop offset="60%" stop-color="var(--cs-pool-a)"/>
      <stop offset="100%" stop-color="var(--cs-pool-b)"/>
    </linearGradient>
    <radialGradient id="censerGround" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0%" stop-color="rgba(104,108,106,0.26)"/>
      <stop offset="55%" stop-color="rgba(112,116,114,0.12)"/>
      <stop offset="100%" stop-color="rgba(120,124,122,0)"/>
    </radialGradient>
  </defs>
`;

/** 共享底座接触阴影：各款式底部均落在 y≈72-75，统一收尾（中性暖灰，避免白玉下泛青） */
export const CENSER_BASE = `
  <!-- 落地投影：宽而淡的扩散 + 紧贴器底的接触阴影，均为柔边渐变，与器底自然衔接 -->
  <ellipse cx="56" cy="75" rx="21" ry="4.5" fill="url(#censerGround)" opacity="0.5"/>
  <ellipse cx="56" cy="74" rx="13" ry="2.6" fill="url(#censerGround)"/>
`;

export const CENSER_STYLES = [
  {
    key: 'bamboo',
    name: '青瓷竹节',
    svg: `
      <!-- 下层竹节 -->
      <path d="M38,68 Q38,72 56,72 Q74,72 74,68 L74,50 Q74,48 56,48 Q38,48 38,50 Z" fill="url(#csBody)"/>
      <path d="M38,68 Q38,72 56,72 Q74,72 74,68 L74,62 Q74,60 56,60 Q38,60 38,62 Z" fill="url(#csPool)"/>
      <ellipse cx="56" cy="50" rx="18" ry="3.5" fill="url(#csBody)"/><ellipse cx="56" cy="50" rx="18" ry="3.5" fill="url(#csHi)"/>
      <path d="M38,49 Q56,45 74,49" stroke="var(--cs-line)" stroke-width="0.5" fill="none"/>
      <path d="M38,51 Q56,55 74,51" stroke="var(--cs-line)" stroke-width="0.5" fill="none"/>
      <!-- 中层竹节 -->
      <path d="M40,50 Q40,48 56,48 Q72,48 72,50 L72,36 Q72,34 56,34 Q40,34 40,36 Z" fill="url(#csBody)"/>
      <path d="M44,48 L44,36 Q44,35 48,35 L48,47 Q44,47 44,48 Z" fill="rgba(255,255,255,0.18)" opacity="0.7"/>
      <ellipse cx="56" cy="34" rx="16" ry="3" fill="url(#csBody)"/><ellipse cx="56" cy="34" rx="16" ry="3" fill="url(#csHi)"/>
      <path d="M40,33 Q56,30 72,33" stroke="var(--cs-line)" stroke-width="0.4" fill="none"/>
      <path d="M40,35 Q56,38 72,35" stroke="var(--cs-line)" stroke-width="0.4" fill="none"/>
      <!-- 上层竹节（开口插香） -->
      <path d="M42,34 Q42,32 56,32 Q70,32 70,34 L70,22 Q70,20 56,20 Q42,20 42,22 Z" fill="url(#csBody)"/>
      <path d="M46,32 L46,22 Q46,21 49,21 L49,31 Q46,31 46,32 Z" fill="rgba(255,255,255,0.15)" opacity="0.6"/>
      <ellipse cx="56" cy="20" rx="14" ry="2.8" fill="url(#csBody)"/><ellipse cx="56" cy="20" rx="14" ry="2.8" fill="url(#csHi)"/>
      <ellipse cx="56" cy="20" rx="14" ry="2.8" stroke="var(--cs-rim)" stroke-width="0.4" fill="none"/>
      <ellipse cx="56" cy="20" rx="3" ry="1.2" fill="var(--cs-hole)"/>
      <!-- 竹丝纹与竹叶 -->
      <path d="M48,40 L50,44 L48,48" stroke="var(--cs-line)" stroke-width="0.3" fill="none"/>
      <path d="M62,36 L64,42 L61,46" stroke="var(--cs-line)" stroke-width="0.3" fill="none"/>
      <path d="M52,55 L54,60 L52,64" stroke="var(--cs-line)" stroke-width="0.3" fill="none"/>
      <path d="M60,42 Q64,38 66,35 Q63,39 60,42" stroke="var(--cs-accent)" stroke-width="0.4" fill="var(--cs-accent-2)"/>
      <path d="M62,44 Q65,41 67,38 Q64,42 62,44" stroke="var(--cs-accent)" stroke-width="0.3" fill="var(--cs-accent-2)"/>
      <path d="M58,56 Q62,52 64,49 Q61,53 58,56" stroke="var(--cs-accent)" stroke-width="0.3" fill="var(--cs-accent-2)"/>
    `
  },
  {
    key: 'stone',
    name: '太湖灵石',
    svg: `
      <defs>
        <mask id="stoneHole-stone">
          <rect x="0" y="0" width="112" height="80" fill="#fff"/>
          <ellipse cx="56" cy="18" rx="6.6" ry="3.7" fill="#000"/>
        </mask>
      </defs>
      <!-- 主轮廓（瘦皱漏透立峰，奇崛不对称：左凹右悬、三孔玲珑；mask 顶开承香窝真口，香从口中插出） -->
      <path fill-rule="evenodd" mask="url(#stoneHole-stone)" d="M35,73 C31,68 36,62 32,55 C26,47 37,43 32,34 C28,26 39,20 44,25 C47,16 51,14 54,20 C57,15 59,15 61,14 C65,12 71,20 68,28 C77,31 80,41 72,45 C82,54 77,63 71,64 C78,68 69,71 61,72 C53,74.5 45,74 35,73 Z M44,25 C39,31 45,38 50,34 C50,28 47,24 44,25 Z M61,27 C56,33 62,41 69,36 C69,30 65,26 61,27 Z M45,47 C40,52 47,58 55,54 C55,48 49,45 45,47 Z" fill="url(#csBody)"/>
      <!-- 受光面（左上方，csHi 自带白→透高光） -->
      <path d="M35,73 C31,68 36,62 32,55 C26,47 37,43 32,34 C28,26 39,20 44,25 C47,16 51,14 54,20 C52,27 47,33 42,41 C37,51 44,61 40,69 C38,72 36,72 35,73 Z" fill="url(#csHi)"/>
      <!-- 背光面（右下方，半透明深青压出体积） -->
      <path d="M68,28 C77,31 80,41 72,45 C82,54 77,63 71,64 C78,68 69,71 61,72 C53,74.5 45,74 35,73 C40,73 50,73 61,69 C71,63 77,55 70,47 C78,39 73,31 68,28 Z" fill="rgba(125,145,137,0.15)"/>

      <!-- 孔洞内壁（暗面强化通透）+ 上缘透光高光 -->
      <path d="M44,25 C39,31 45,38 42,32 C43,27 44,25 44,25 Z" fill="var(--cs-pool-b)" opacity="0.75"/>
      <path d="M44,25 C49,26 51,29" stroke="url(#csHi)" stroke-width="0.5" fill="none" opacity="0.55"/>
      <path d="M61,27 C56,33 62,41 59,35 C60,29 61,27 61,27 Z" fill="var(--cs-pool-b)" opacity="0.7"/>
      <path d="M61,27 C66,28 69,31" stroke="url(#csHi)" stroke-width="0.45" fill="none" opacity="0.5"/>
      <path d="M45,47 C40,52 47,58 44,52 C44,48 45,47 45,47 Z" fill="var(--cs-pool-b)" opacity="0.7"/>
      <path d="M45,47 C50,48 54,50" stroke="url(#csHi)" stroke-width="0.45" fill="none" opacity="0.5"/>
      <!-- 皴皱纹理（石皮褶皱，密而细，瘦皱） -->
      <path d="M30,30 C37,34 43,31" stroke="var(--cs-line)" stroke-width="0.4" fill="none"/>
      <path d="M57,18 C66,22 73,18" stroke="var(--cs-line)" stroke-width="0.4" fill="none"/>
      <path d="M28,46 C36,50 44,47" stroke="var(--cs-line)" stroke-width="0.38" fill="none"/>
      <path d="M61,42 C69,46 76,42" stroke="var(--cs-line)" stroke-width="0.38" fill="none"/>
      <path d="M33,58 C42,62 50,59" stroke="var(--cs-line)" stroke-width="0.36" fill="none"/>
      <path d="M60,60 C69,58 73,53" stroke="var(--cs-line)" stroke-width="0.34" fill="none"/>
      <path d="M40,38 C47,42 51,38" stroke="var(--cs-line)" stroke-width="0.32" fill="none" opacity="0.8"/>
      <path d="M68,35 C72,39 76,36" stroke="var(--cs-line)" stroke-width="0.32" fill="none" opacity="0.8"/>
      <path d="M48,55 C54,58 58,55" stroke="var(--cs-line)" stroke-width="0.3" fill="none" opacity="0.7"/>
      <path d="M33,40 C39,44 43,40" stroke="var(--cs-line)" stroke-width="0.3" fill="none" opacity="0.7"/>
      <!-- 石筋（浅色油润脉） -->
      <path d="M45,28 C51,37 45,48" stroke="var(--cs-accent)" stroke-width="0.4" fill="none" opacity="0.7"/>
      <path d="M70,30 C74,39 69,48" stroke="var(--cs-accent)" stroke-width="0.4" fill="none" opacity="0.6"/>
      <path d="M52,49 C58,56 54,62" stroke="var(--cs-accent)" stroke-width="0.35" fill="none" opacity="0.55"/>
      <!-- 油润光晕（玉的漫反射柔光，左上受光区） -->
      <ellipse cx="42" cy="34" rx="12" ry="8" fill="#ffffff" opacity="0.08"/>
      <ellipse cx="45" cy="39" rx="7" ry="4.5" fill="#ffffff" opacity="0.06"/>
      <!-- 边缘光（轮廓左上油脂高光） -->
      <path d="M32,34 C28,26 39,20 44,25 C47,16 51,14 54,20" stroke="#ffffff" stroke-width="1.1" fill="none" opacity="0.25" stroke-linecap="round"/>


      <!-- 承香窝真口（石壁环抱香根，俯视纵深：环透出香，前壁加深、后壁受光） -->
      <ellipse cx="56" cy="18" rx="6.6" ry="3.7" fill="none" stroke="var(--cs-pool-b)" stroke-width="2.4" opacity="0.9"/>
      <path d="M49.6,18 Q56,23.5 62.4,18" stroke="var(--cs-pool-b)" stroke-width="2.6" fill="none" opacity="0.75" stroke-linecap="round"/>
      <path d="M49.6,18 Q56,12.5 62.4,18" stroke="#ffffff" stroke-width="1" fill="none" opacity="0.22" stroke-linecap="round"/>
      <ellipse cx="56" cy="19" rx="4.4" ry="2.1" fill="var(--cs-pool-b)" opacity="0.22"/>
    `
  },
  {
    key: 'bianshan',
    name: '笔山',
    svg: `
      <defs>
        <mask id="bianshanHole-bianshan">
          <rect x="0" y="0" width="112" height="80" fill="#fff"/>
          <ellipse cx="56" cy="40" rx="5.4" ry="3.1" fill="#000"/>
        </mask>
        <radialGradient id="jadeGlow-bianshan" cx="0.34" cy="0.3" r="0.72">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.5"/>
          <stop offset="55%" stop-color="#ffffff" stop-opacity="0.16"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="jadeShade-bianshan" x1="0.2" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stop-color="rgba(130,128,122,0)"/>
          <stop offset="45%" stop-color="rgba(130,128,122,0.1)"/>
          <stop offset="100%" stop-color="rgba(120,118,112,0.24)"/>
        </linearGradient>
      </defs>
      <!-- 层1 远山（玉的远景：极淡低对比，峰头圆缓；左右两段避开谷口） -->
      <path d="M34,72 C36,58 38,48 41,42 C43,37 46,34 48,36 C50,38 51,44 51,52 C51,60 50,66 49,72 Z" fill="var(--cs-1)" opacity="0.3"/>
      <path d="M61,72 C61,62 62,52 64,46 C66,40 69,38 71,40 C73,42 74,48 75,55 C76,62 78,67 79,72 Z" fill="var(--cs-1)" opacity="0.3"/>
      <!-- 层2 主山体（白玉笔山：主峰高耸、次峰拱卫、外峰错落，中间成谷；峰头圆缓无尖角，底部圆转；mask 在谷开真孔） -->
      <path d="M26,72 C28,61 30,53 33,47 C36,41 38,33 42,29 C45,25 48,22 51,25 C53,28 54,34 54,37 C55,40 57,40 58,37 C59,33 61,27 64,29 C67,31 69,36 72,41 C75,46 78,52 81,59 C83,65 85,68 86,72 C86,73 84,74 80,74 C72,75 46,75 32,74 C28,73.5 26,72.5 26,72 Z" fill="url(#csBody)" mask="url(#bianshanHole-bianshan)"/>
      <!-- 亮部（左上受光，柔和） -->
      <path d="M26,72 C28,61 30,53 33,47 C36,41 38,33 42,29 C45,25 48,22 51,25 C50,32 47,40 42,47 C38,55 32,64 28,71 C27,72 26,72 26,72 Z" fill="url(#csHi)" opacity="0.8"/>
      <!-- 中间调（灰面：亮暗之间的过渡，避免明暗生硬） -->
      <path d="M52,26 C53,31 53,34 53,37 C51,43 48,50 43,57 C39,63 32,70 28,73 C34,72 42,66 48,58 C52,50 53,38 52,26 Z" fill="rgba(156,154,148,0.07)"/>
      <!-- 暗部（右下，渐变暗面含蓄不闷；挖孔以免糊住香） -->
      <path d="M51,25 C53,28 54,34 54,37 C55,40 57,40 58,37 C59,33 61,27 64,29 C67,31 69,36 72,41 C75,46 78,52 81,59 C83,65 85,68 86,72 C80,70 74,60 68,52 C62,44 56,34 51,25 Z" fill="url(#jadeShade-bianshan)" mask="url(#bianshanHole-bianshan)"/>
      <!-- 反光（暗部内的环境反射光，玉通透不闷） -->
      <path d="M70,50 C74,56 77,62 79,68" stroke="#ffffff" stroke-width="1.6" fill="none" opacity="0.14" stroke-linecap="round"/>
      <!-- 明暗交界线（沿形体转折，柔和连续） -->
      <path d="M52,26 C53,32 52,38 50,44 C48,51 44,58 39,64" stroke="rgba(120,118,112,0.15)" stroke-width="0.5" fill="none"/>
      <!-- 油脂光泽（漫反射柔光，弥散） -->
      <ellipse cx="40" cy="44" rx="13" ry="9" fill="url(#jadeGlow-bianshan)" opacity="0.5"/>
      <!-- 主高光核心（受光最强处，柔和不刺） -->
      <ellipse cx="45" cy="34" rx="5" ry="3.4" fill="#ffffff" opacity="0.16"/>
      <!-- 透光（水头：峰顶与边缘薄处回光） -->
      <path d="M42,29 C45,25 48,22 51,25" stroke="#ffffff" stroke-width="1.3" fill="none" opacity="0.28" stroke-linecap="round"/>
      <path d="M63,28 C65,27 67,29 69,32" stroke="#ffffff" stroke-width="1.1" fill="none" opacity="0.2" stroke-linecap="round"/>
      <path d="M29,66 C33,58 37,51 41,46" stroke="#ffffff" stroke-width="0.9" fill="none" opacity="0.15" stroke-linecap="round"/>
      <!-- 玉筋（石纹：顺形体走向的圆缓曲线） -->
      <path d="M33,54 C37,49 41,43 44,37" stroke="var(--cs-line)" stroke-width="0.34" fill="none" opacity="0.65"/>
      <path d="M37,62 C41,56 45,49 48,42" stroke="var(--cs-line)" stroke-width="0.3" fill="none" opacity="0.55"/>
      <path d="M68,45 C71,51 73,57 75,63" stroke="var(--cs-line)" stroke-width="0.32" fill="none" opacity="0.6"/>
      <path d="M73,53 C75,58 76,63 77,67" stroke="var(--cs-line)" stroke-width="0.28" fill="none" opacity="0.5"/>
      <!-- 絮棉（玉内部棉絮包裹体，朦胧弥散） -->
      <ellipse cx="38" cy="52" rx="7" ry="4" fill="#ffffff" opacity="0.13"/>
      <ellipse cx="71" cy="55" rx="5" ry="3" fill="#ffffff" opacity="0.11"/>
      <ellipse cx="50" cy="65" rx="9" ry="3.5" fill="#ffffff" opacity="0.09"/>
      <!-- 绺裂（含蓄细裂纹，圆缓走向） -->
      <path d="M43,39 C45,43 44,48 42,52" stroke="var(--cs-rim)" stroke-width="0.24" fill="none" opacity="0.3"/>
      <path d="M67,50 C69,54 68,59 66,63" stroke="var(--cs-rim)" stroke-width="0.24" fill="none" opacity="0.28"/>
      <!-- 沁色（极淡暖调，玉皮与沁色） -->
      <ellipse cx="34" cy="62" rx="8" ry="4" fill="rgba(206,190,166,0.07)"/>
      <ellipse cx="76" cy="60" rx="6" ry="3.5" fill="rgba(206,190,166,0.06)"/>
      <!-- 峰间投影（主峰投在次峰左坡，柔和） -->
      <path d="M62,28 C63,33 64,38 64,44 C64,50 63,54 61,56 C62,48 62,38 62,32 C62,30 62,29 62,28 Z" fill="rgba(120,118,112,0.09)"/>
      <!-- 谷脚 AO（谷底接缝的遮蔽暗，压实体积） -->
      <path d="M48,46 C52,49 60,49 64,46 C60,53 52,53 48,46 Z" fill="rgba(120,118,112,0.1)"/>
      <!-- 层3 基岩（近景：温润厚重，边缘圆缓） -->
      <path d="M24,72 C26,66 30,63 36,62 C44,60 52,61 58,63 C64,65 72,62 79,61 C83,60 86,63 88,72 C88,73 86,74 82,74 C72,75 46,75 32,74 C28,73.5 25,72.5 24,72 Z" fill="url(#csBody)"/>
      <path d="M24,72 C26,66 30,63 36,62 C44,60 52,61 58,63 C56,67 48,70 40,71 C33,72.5 27,73 24,72 Z" fill="url(#csHi)" opacity="0.45"/>
      <path d="M58,63 C64,65 72,62 79,61 C83,60 86,63 88,72 C78,73 66,72.5 58,70 C57,67 57,64 58,63 Z" fill="rgba(132,130,124,0.12)"/>
      <!-- 接触阴影（主山体落在基岩上的投影，压实落地感） -->
      <path d="M30,64 C36,62 44,61 52,62 C58,63 64,63 70,62 C64,66 54,67 44,66 C36,66 31,65 30,64 Z" fill="rgba(120,118,112,0.08)"/>
      <!-- 山脚反光（环境反射，玉的温润回光） -->
      <path d="M31,70 C37,67 44,65 51,66" stroke="#ffffff" stroke-width="0.8" fill="none" opacity="0.2" stroke-linecap="round"/>
      <!-- 承香谷真口（孔壁环抱香根，俯视纵深：环透出香，前壁加深、后壁受光） -->
      <ellipse cx="56" cy="40" rx="5.4" ry="3.1" fill="none" stroke="var(--cs-pool-b)" stroke-width="2.1" opacity="0.9"/>
      <path d="M51,40 Q56,43.5 61,40" stroke="var(--cs-pool-b)" stroke-width="2.3" fill="none" opacity="0.72" stroke-linecap="round"/>
      <path d="M51,40 Q56,36.5 61,40" stroke="#ffffff" stroke-width="0.9" fill="none" opacity="0.24" stroke-linecap="round"/>
      <ellipse cx="56" cy="41" rx="3.6" ry="1.9" fill="var(--cs-pool-b)" opacity="0.2"/>
    `
  },
  {
    key: 'yezi',
    name: '青玉叶',
    svg: `
      <defs>
        <mask id="yeziHole-yezi">
          <rect x="0" y="0" width="112" height="80" fill="#fff"/>
          <ellipse cx="56" cy="21" rx="5" ry="3" fill="#000"/>
        </mask>
      </defs>
      <!-- 叶片（立起青玉叶：叶尖中央天然缺刻成窝，右半翻转向暗表现厚度与卷起） -->
      <path mask="url(#yeziHole-yezi)" d="M50,16 C44,26 32,36 32,50 C32,64 44,72 56,74 C68,72 80,64 80,50 C80,36 68,26 62,16 C60,20 52,20 50,16 Z" fill="url(#csBody)"/>
      <!-- 叶面翻转（右半背面暗面，表现卷起与厚度） -->
      <path d="M62,16 C68,26 80,36 80,50 C80,64 68,72 56,74 C64,60 66,44 62,32 C60,26 61,20 62,16 Z" fill="rgba(96,126,112,0.16)"/>
      <!-- 叶缘厚度（左上卷起的窄侧面带，受光） -->
      <path d="M50,16 C44,26 32,36 32,50 C32,64 44,72 56,74 C48,64 42,52 40,40 C38,30 44,22 50,16 Z" fill="url(#csHi)" opacity="0.5"/>
      <path d="M50,16 C44,26 32,36 32,50" stroke="#ffffff" stroke-width="1.1" fill="none" opacity="0.26" stroke-linecap="round"/>
      <path d="M32,50 C32,64 44,72 56,74" stroke="#ffffff" stroke-width="0.7" fill="none" opacity="0.16" stroke-linecap="round"/>
      <!-- 叶尖缺刻（凹口两侧叶尖受光，香自缺刻穿出） -->
      <path d="M50,16 C52,20 60,20 62,16" stroke="#ffffff" stroke-width="0.6" fill="none" opacity="0.2" stroke-linecap="round"/>
      <!-- 主脉（自缺刻下贯至叶柄） -->
      <path d="M56,24 C56,40 56,58 56,74" stroke="var(--cs-line)" stroke-width="0.6" fill="none" opacity="0.5"/>
      <!-- 侧脉（简洁对称，极简不堆砌） -->
      <path d="M56,34 C48,36 42,40 36,46" stroke="var(--cs-line)" stroke-width="0.4" fill="none" opacity="0.4"/>
      <path d="M56,34 C64,36 70,40 76,46" stroke="var(--cs-line)" stroke-width="0.4" fill="none" opacity="0.35"/>
      <path d="M56,46 C48,49 42,54 38,60" stroke="var(--cs-line)" stroke-width="0.38" fill="none" opacity="0.36"/>
      <path d="M56,46 C64,49 70,54 74,60" stroke="var(--cs-line)" stroke-width="0.38" fill="none" opacity="0.32"/>
      <path d="M56,58 C50,62 46,66 44,70" stroke="var(--cs-line)" stroke-width="0.34" fill="none" opacity="0.3"/>
      <path d="M56,58 C62,62 66,66 68,70" stroke="var(--cs-line)" stroke-width="0.34" fill="none" opacity="0.28"/>
      <!-- 水头透光（青玉薄处回光） -->
      <path d="M50,16 C44,26 32,36 32,50" stroke="#ffffff" stroke-width="1.6" fill="none" opacity="0.14" stroke-linecap="round"/>
      <ellipse cx="46" cy="44" rx="9" ry="14" fill="#ffffff" opacity="0.08"/>
      <ellipse cx="50" cy="36" rx="5" ry="6" fill="#ffffff" opacity="0.1"/>
      <!-- 絮棉（玉内棉絮，朦胧弥散） -->
      <ellipse cx="44" cy="56" rx="5" ry="7" fill="#ffffff" opacity="0.09"/>
      <ellipse cx="66" cy="62" rx="4" ry="5" fill="#ffffff" opacity="0.08"/>
      <!-- 玉筋（细而流畅的石纹曲线） -->
      <path d="M40,38 C46,48 44,58 48,68" stroke="var(--cs-accent)" stroke-width="0.4" fill="none" opacity="0.5"/>
      <path d="M72,42 C68,52 70,60 66,68" stroke="var(--cs-accent)" stroke-width="0.35" fill="none" opacity="0.4"/>
      <!-- 绺裂（极细含蓄） -->
      <path d="M62,28 C58,38 60,48 58,58" stroke="var(--cs-rim)" stroke-width="0.24" fill="none" opacity="0.28"/>
      <!-- 叶柄（底部一小截，圆钝收底） -->
      <path d="M52,72 C51,76 53,79 56,79 C59,79 61,76 60,72 C58,73 54,73 52,72 Z" fill="rgba(96,126,112,0.45)"/>
      <!-- 油脂光泽（青玉温润漫反射） -->
      <ellipse cx="46" cy="42" rx="10" ry="12" fill="#ffffff" opacity="0.06"/>

      <!-- 承香叶窝真口（叶尖缺刻处的承香窝，香自窝口穿出） -->
      <ellipse cx="56" cy="21" rx="5" ry="3" fill="none" stroke="var(--cs-pool-b)" stroke-width="2" opacity="0.9"/>
      <path d="M51,21 Q56,25 61,21" stroke="var(--cs-pool-b)" stroke-width="2.2" fill="none" opacity="0.75" stroke-linecap="round"/>
      <path d="M51,21 Q56,17 61,21" stroke="#ffffff" stroke-width="0.85" fill="none" opacity="0.28" stroke-linecap="round"/>
      <ellipse cx="56" cy="21.8" rx="3.4" ry="1.8" fill="var(--cs-pool-b)" opacity="0.28"/>
    `
  },
  {
    key: 'liantai',
    name: '粉彩莲台',
    // 背景层：花瓣、荷叶、花梗，置于线香之后（z-index 2）
    svgBack: `
      <defs>
        <mask id="lianHole-liantai">
          <rect x="0" y="0" width="112" height="80" fill="#fff"/>
          <ellipse cx="56" cy="38" rx="5" ry="3.2" fill="#000"/>
        </mask>
        <!-- 粉彩洗染：瓣根淡、瓣中白、瓣尖胭脂晕（渐变随瓣旋转，恒为根→尖） -->
        <linearGradient id="lianPetal-liantai" x1="0.5" y1="1" x2="0.42" y2="0">
          <stop offset="0%" stop-color="var(--cs-2)"/>
          <stop offset="32%" stop-color="var(--cs-1)"/>
          <stop offset="58%" stop-color="var(--cs-1)"/>
          <stop offset="82%" stop-color="var(--cs-2)"/>
          <stop offset="100%" stop-color="var(--cs-4)"/>
        </linearGradient>
        <!-- 下垂瓣：整体压深一档（背光） -->
        <linearGradient id="lianPetalDim-liantai" x1="0.5" y1="1" x2="0.42" y2="0">
          <stop offset="0%" stop-color="var(--cs-3)"/>
          <stop offset="38%" stop-color="var(--cs-2)"/>
          <stop offset="72%" stop-color="var(--cs-2)"/>
          <stop offset="100%" stop-color="var(--cs-4)"/>
        </linearGradient>
        <linearGradient id="lianTip-liantai" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stop-color="var(--cs-accent)" stop-opacity="0.72"/>
          <stop offset="40%" stop-color="var(--cs-accent)" stop-opacity="0.28"/>
          <stop offset="100%" stop-color="var(--cs-accent)" stop-opacity="0"/>
        </linearGradient>
        <radialGradient id="lianCore-liantai" cx="0.36" cy="0.3" r="0.8">
          <stop offset="0%" stop-color="#f8f0cc"/>
          <stop offset="45%" stop-color="#eee5a8"/>
          <stop offset="78%" stop-color="#d8cf88"/>
          <stop offset="100%" stop-color="#bcb46e"/>
        </radialGradient>
        <linearGradient id="lianLeaf-liantai" x1="0.14" y1="0" x2="0.86" y2="1">
          <stop offset="0%" stop-color="#e9f0dd"/>
          <stop offset="42%" stop-color="#d4e1c4"/>
          <stop offset="78%" stop-color="#b6cbab"/>
          <stop offset="100%" stop-color="#a2bb9a"/>
        </linearGradient>
        <radialGradient id="lianCup-liantai" cx="0.5" cy="0.44" r="0.52">
          <stop offset="0%" stop-color="rgba(116,146,114,0.36)"/>
          <stop offset="52%" stop-color="rgba(126,156,122,0.17)"/>
          <stop offset="100%" stop-color="rgba(138,168,134,0)"/>
        </radialGradient>
        <radialGradient id="lianGlow-liantai" cx="0.34" cy="0.24" r="0.82">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.48"/>
          <stop offset="48%" stop-color="#ffffff" stop-opacity="0.16"/>
          <stop offset="78%" stop-color="#ffffff" stop-opacity="0.05"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
        </radialGradient>
        <!-- 外瓣：饱满水滴形，尖端微急 -->
        <g id="lianOuter-liantai">
          <path d="M0,0 C8,-4 12.5,-16 9.5,-27 C8,-31 2,-33 0,-32 C-2,-33 -8,-31 -9.5,-27 C-12.5,-16 -8,-4 0,0 Z" fill="url(#lianPetal-liantai)"/>
          <path d="M0,-32 C3.5,-27 5,-23 2.5,-19 C0,-16 -2.5,-19 -5,-23 C-3,-27 -1.5,-30 0,-32 Z" fill="url(#lianTip-liantai)"/>
          <path d="M0,-3 C2.5,-13 2,-22 0,-28" stroke="var(--cs-line)" stroke-width="0.3" fill="none" opacity="0.42"/>
          <path d="M-7,-7 C-9.5,-15 -9,-23 -3.5,-31" stroke="#ffffff" stroke-width="0.4" fill="none" opacity="0.2"/>
        </g>
        <g id="lianOuterDim-liantai">
          <path d="M0,0 C8,-4 12.5,-16 9.5,-27 C8,-31 2,-33 0,-32 C-2,-33 -8,-31 -9.5,-27 C-12.5,-16 -8,-4 0,0 Z" fill="url(#lianPetalDim-liantai)"/>
          <path d="M0,-32 C3.5,-27 5,-23 2.5,-19 C0,-16 -2.5,-19 -5,-23 C-3,-27 -1.5,-30 0,-32 Z" fill="url(#lianTip-liantai)" opacity="0.8"/>
          <path d="M0,-3 C2.5,-13 2,-22 0,-28" stroke="var(--cs-line)" stroke-width="0.3" fill="none" opacity="0.38"/>
        </g>
        <!-- 内瓣：短，围在花心四周 -->
        <g id="lianInner-liantai">
          <path d="M0,0 C6.5,-3 9.5,-10 7.5,-16.5 C6.5,-19 2,-20.5 0,-19.8 C-2,-20.5 -6.5,-19 -7.5,-16.5 C-9.5,-10 -6.5,-3 0,0 Z" fill="url(#lianPetal-liantai)"/>
          <path d="M0,-19.8 C3,-16 4.2,-13 2,-10.5 C0,-8.5 -2,-10.5 -4.2,-13 C-3,-16 -1.5,-18 0,-19.8 Z" fill="url(#lianTip-liantai)"/>
          <path d="M0,-2 C1.8,-9 1.4,-14 0,-18" stroke="var(--cs-line)" stroke-width="0.26" fill="none" opacity="0.4"/>
          <path d="M-5,-5 C-7,-10 -6.5,-14 -2.5,-19" stroke="#ffffff" stroke-width="0.34" fill="none" opacity="0.18"/>
        </g>
      </defs>
      <g transform="translate(56,72) scale(1.45) translate(-56,-72)">
      <!-- 浮水荷叶（盾状圆叶：波状边缘、中心叶脐下凹成浅碗、掌状放射脉、边缘微卷） -->
      <path d="M24,72 C27,68.5 34,67 41,68.2 C48,69.4 54,67 61,68 C68,69 75,67.5 82,68.8 C86.5,69.8 88.5,71.4 86.5,73.4 C83,75.6 75,76.6 67,76.8 C59,77 51,75.8 43,75.4 C35,75 26,74.6 24,72 Z" fill="url(#lianLeaf-liantai)"/>
      <!-- 叶面浅碗（叶脐压暗，向边缘回亮） -->
      <ellipse cx="56" cy="72.2" rx="26" ry="4.2" fill="url(#lianCup-liantai)"/>
      <!-- 掌状放射脉（自叶脐辐射，长脉二分叉） -->
      <g stroke="rgba(104,138,102,0.5)" stroke-width="0.22" fill="none" opacity="0.38" stroke-linecap="round">
        <path d="M56,72.2 L78,72.2"/><path d="M67,72.2 L70.5,70.3"/>
        <path d="M56,72.2 L72.9,74.4"/>
        <path d="M56,72.2 L59.8,75.6"/>
        <path d="M56,72.2 L52.2,75.6"/>
        <path d="M56,72.2 L39.1,74.4"/>
        <path d="M56,72.2 L34,72.2"/><path d="M45,72.2 L41.5,70.3"/>
        <path d="M56,72.2 L39.1,70"/>
        <path d="M56,72.2 L52.2,68.8"/>
        <path d="M56,72.2 L59.8,68.8"/>
        <path d="M56,72.2 L72.9,70"/>
      </g>
      <!-- 叶脐（柄着生处的小凹） -->
      <ellipse cx="56" cy="72.2" rx="2.4" ry="1.2" fill="rgba(114,144,112,0.4)"/>
      <ellipse cx="56" cy="71.9" rx="2.4" ry="1.2" fill="rgba(255,255,255,0.16)"/>
      <!-- 边缘微卷（远缘受光提亮，近缘背光压暗） -->
      <path d="M26,71.4 C31,68.2 39,67 47,68.2 C55,69.2 61,67.2 69,68.2 C77,69.2 84,68.6 87,72" stroke="#ffffff" stroke-width="0.9" fill="none" opacity="0.26" stroke-linecap="round"/>
      <path d="M28,74 C37,76.2 49,76.6 59,76.4 C69,76.2 79,74.8 85,73" stroke="rgba(118,148,116,0.34)" stroke-width="0.7" fill="none" opacity="0.3" stroke-linecap="round"/>
      <!-- 白霜（粉彩荷叶的灰白粉质） -->
      <ellipse cx="42" cy="70.5" rx="14" ry="2.6" fill="#ffffff" opacity="0.12"/>
      </g>
      <!-- 花梗（自叶脐挺起，托住花心） -->
      <path d="M52.8,50 C52.4,60 53,68 54,72.8 L58,72.8 C59,68 59.6,60 59.2,50 Z" fill="url(#lianLeaf-liantai)"/>
      <path d="M56.6,50 C57,60 57.6,68 58,72.8 L59.2,50 Z" fill="rgba(116,146,114,0.22)"/>
      <!-- 外瓣：自花心放射，左右对称（上扬者受光，下垂者压深一档） -->
      <use href="#lianOuter-liantai" transform="translate(56,50) rotate(-68)"/>
      <use href="#lianOuter-liantai" transform="translate(56,50) rotate(-32)"/>
      <use href="#lianOuter-liantai" transform="translate(56,50) rotate(32)"/>
      <use href="#lianOuter-liantai" transform="translate(56,50) rotate(68)"/>
      <use href="#lianOuterDim-liantai" transform="translate(56,50) rotate(-145)"/>
      <use href="#lianOuterDim-liantai" transform="translate(56,50) rotate(-108)"/>
      <use href="#lianOuterDim-liantai" transform="translate(56,50) rotate(108)"/>
      <use href="#lianOuterDim-liantai" transform="translate(56,50) rotate(145)"/>
      <!-- 内瓣：短，围在花心四周 -->
      <use href="#lianInner-liantai" transform="translate(56,50) rotate(-78)"/>
      <use href="#lianInner-liantai" transform="translate(56,50) rotate(-48)"/>
      <use href="#lianInner-liantai" transform="translate(56,50) rotate(48)"/>
      <use href="#lianInner-liantai" transform="translate(56,50) rotate(78)"/>
      <!-- 釉面玻璃光（左上受光，瓣尖提亮） -->
      <ellipse cx="42" cy="37" rx="15" ry="11" fill="url(#lianGlow-liantai)" opacity="0.26"/>
      <path d="M38,27 C44,22 50,20 55,21" stroke="#ffffff" stroke-width="1.1" fill="none" opacity="0.18" stroke-linecap="round"/>
      <path d="M72,29 C76,33 79,38 80,43" stroke="#ffffff" stroke-width="0.85" fill="none" opacity="0.12" stroke-linecap="round"/>
    `,
    // 前景层：花心与承香孔，置于线香之前（z-index 4）遮住香根
    svg: `
      <!-- 花心（加厚的莲蓬：顶面正中承香，环列莲子；不透明，遮住香根使其止于花心内） -->
      <ellipse cx="56" cy="38" rx="5.4" ry="3.3" fill="#ecd9de"/>
      <ellipse cx="56" cy="48" rx="8.5" ry="6.5" fill="url(#lianCore-liantai)" mask="url(#lianHole-liantai)"/>
      <ellipse cx="56" cy="48" rx="8.5" ry="6.5" fill="url(#lianGlow-liantai)" opacity="0.42"/>
      <path d="M64.5,48 C64.5,52.8 61,56.6 56,57.1 C62,56 64.5,52.5 64.5,48 Z" fill="rgba(150,142,80,0.24)"/>
      <ellipse cx="56" cy="48" rx="8.5" ry="6.5" fill="none" stroke="var(--cs-rim)" stroke-width="0.4" opacity="0.45"/>
      <path d="M48.6,45.6 C51,43.2 54,42.2 56.5,42.4" stroke="#ffffff" stroke-width="0.9" fill="none" opacity="0.28" stroke-linecap="round"/>
      <!-- 莲子小窝（环列，避让中央承香孔） -->
      <ellipse cx="63.5" cy="48" rx="1.15" ry="0.72" fill="rgba(150,140,80,0.5)"/>
      <ellipse cx="48.5" cy="48" rx="1.15" ry="0.72" fill="rgba(150,140,80,0.46)"/>
      <ellipse cx="61.7" cy="50.9" rx="1.1" ry="0.7" fill="rgba(150,140,80,0.46)"/>
      <ellipse cx="50.3" cy="50.9" rx="1.1" ry="0.7" fill="rgba(150,140,80,0.42)"/>
      <ellipse cx="61.7" cy="45.1" rx="1.1" ry="0.7" fill="rgba(150,140,80,0.42)"/>
      <ellipse cx="50.3" cy="45.1" rx="1.1" ry="0.7" fill="rgba(150,140,80,0.46)"/>
      <ellipse cx="56" cy="52.5" rx="1.1" ry="0.7" fill="rgba(150,140,80,0.44)"/>
      <!-- 莲蓬柄：承接莲蓬与花梗，遮住穿出莲蓬底面的香下段 -->
      <defs>
        <linearGradient id="lianStem-liantai" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stop-color="#d8cf88"/>
          <stop offset="28%" stop-color="#c9bc84"/>
          <stop offset="100%" stop-color="#d4e1c4"/>
        </linearGradient>
      </defs>
      <path d="M54.6,54.2 C54.6,60.5 54.9,66.5 55.4,72.8 L56.6,72.8 C57.1,66.5 57.4,60.5 57.4,54.2 C56.5,54.8 55.5,54.8 54.6,54.2 Z" fill="url(#lianStem-liantai)"/>
      <!-- 承香莲房真孔（香自花心正中插下：内凹浅窝，孔底/孔壁/口沿塑造没入感） -->
      <defs>
        <radialGradient id="lianHoleDepth-liantai" cx="0.5" cy="0.42" r="0.58">
          <stop offset="0%" stop-color="#f0e4b0"/>
          <stop offset="45%" stop-color="#dccf94"/>
          <stop offset="80%" stop-color="#b9a873"/>
          <stop offset="100%" stop-color="#9c8b5a"/>
        </radialGradient>
        <linearGradient id="lianHoleWall-liantai" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stop-color="rgba(160,138,100,0)"/>
          <stop offset="55%" stop-color="rgba(140,118,84,0.45)"/>
          <stop offset="100%" stop-color="rgba(115,95,68,0.62)"/>
        </linearGradient>
      </defs>
      <!-- 孔壁环：遮住香根两侧，只露出中心竖线，让香像从孔中穿出 -->
      <path d="M51,38 A5,3.2 0 1,1 61,38 A5,3.2 0 1,1 51,38 M54.2,38 A1.8,1.1 0 1,0 57.8,38 A1.8,1.1 0 1,0 54.2,38" fill="rgba(150,128,94,0.58)" fill-rule="evenodd"/>
      <!-- 孔底：深色凹陷底面，让香根没入其中 -->
      <ellipse cx="56" cy="41.2" rx="3.2" ry="1.9" fill="url(#lianHoleDepth-liantai)"/>
      <!-- 孔壁圆柱阴影（左右+底部包络） -->
      <path d="M51,38 A5,3.2 0 0,0 61,38 L61.7,41.2 A5,3.2 0 0,1 50.3,41.2 Z" fill="url(#lianHoleWall-liantai)"/>
      <path d="M51.8,38 A4.2,2.7 0 0,0 60.2,38 L60.6,40.7 A4.2,2.7 0 0,1 51.4,40.7 Z" fill="rgba(95,78,56,0.32)"/>
      <!-- 孔口下沿阴影 -->
      <path d="M51,38 Q56,42.7 61,38" stroke="rgba(90,74,54,0.72)" stroke-width="2.3" fill="none" opacity="1" stroke-linecap="round"/>
      <!-- 孔口上沿高光 -->
      <path d="M51,38 Q56,33.4 61,38" stroke="#ffffff" stroke-width="1.6" fill="none" opacity="0.85" stroke-linecap="round"/>
      <!-- 孔口外沿（清新粉紫边） -->
      <ellipse cx="56" cy="38" rx="5" ry="3.2" fill="none" stroke="rgba(165,130,148,0.65)" stroke-width="1" opacity="0.95"/>
      <!-- 香根处压影（让香与孔底交接处更贴合） -->
      <ellipse cx="56" cy="41" rx="1.3" ry="0.75" fill="rgba(90,72,55,0.45)"/>
      `
      },
      {
      key: 'mei',
      name: '折枝梅',
      svg: `
        <defs>
          <mask id="meiHole-mei">
            <rect x="0" y="0" width="112" height="80" fill="#fff"/>
            <ellipse cx="56" cy="27" rx="5" ry="3" fill="#000"/>
          </mask>
          <g id="meiFlower-mei">
            <g fill="url(#csBody)">
              <ellipse cx="0" cy="-6.6" rx="3.7" ry="4.6"/>
              <ellipse cx="0" cy="-6.6" rx="3.7" ry="4.6" transform="rotate(72)"/>
              <ellipse cx="0" cy="-6.6" rx="3.7" ry="4.6" transform="rotate(144)"/>
              <ellipse cx="0" cy="-6.6" rx="3.7" ry="4.6" transform="rotate(216)"/>
              <ellipse cx="0" cy="-6.6" rx="3.7" ry="4.6" transform="rotate(288)"/>
            </g>
          </g>
        </defs>
        <!-- 折枝梅（横斜·枝桠丰富）：墨褐老枝横贯，老干如铁、新枝如戟，多级鹿角分叉 + 末端细梢 + 嫩芽 -->
        <!-- 横主枝（自左下平缓上扬至右上，横贯画面，有体积） -->
        <path d="M19,62 C31,58 41,54 51,48 C59,44 71,42 93,38 C94,40.5 92.5,41.5 91,40 C70,44 58,46 50,50 C40,56 30,60 18,64 Z" fill="rgba(70,48,38,0.92)"/>
        <path d="M51,48 C49,47 47,48 48,50 C49,51 51,50 51,48 Z" fill="rgba(54,36,28,0.92)"/>
        <!-- 主花柄（中段向上挺出） -->
        <path d="M54,47 C53,42 55,36 56,28 C57,36 59,42 58,47 Z" fill="rgba(74,52,40,0.9)"/>
        <!-- 次级细枝（stroke，老干上生出的新枝，粗细对比） -->
        <!-- 左端分叉 -->
        <path d="M20,61 C16,59 13,57 11,56" stroke="rgba(70,48,38,0.9)" stroke-width="1.6" fill="none" stroke-linecap="round"/>
        <path d="M22,63 C18,65 15,68 13,69" stroke="rgba(70,48,38,0.9)" stroke-width="1.6" fill="none" stroke-linecap="round"/>
        <!-- 左中上挺枝（末端含苞） -->
        <path d="M42,52 C40,48 38,45 36,42" stroke="rgba(72,50,40,0.9)" stroke-width="1.7" fill="none" stroke-linecap="round"/>
        <!-- 主枝下方小垂枝 -->
        <path d="M34,55 C32,58 31,60 30,63" stroke="rgba(70,48,38,0.85)" stroke-width="1.4" fill="none" stroke-linecap="round"/>
        <path d="M62,46 C63,49 64,52 65,55" stroke="rgba(70,48,38,0.85)" stroke-width="1.4" fill="none" stroke-linecap="round"/>
        <!-- 中右短垂梢 -->
        <path d="M68,44 C69,48 71,51 73,54" stroke="rgba(72,50,40,0.9)" stroke-width="1.6" fill="none" stroke-linecap="round"/>
        <!-- 右侧上细梢（末端含苞） -->
        <path d="M80,40 C83,37 86,35 89,33" stroke="rgba(72,50,40,0.9)" stroke-width="1.6" fill="none" stroke-linecap="round"/>
        <!-- 右端分叉细梢 -->
        <path d="M93,38 C96,36 98,34 100,33" stroke="rgba(70,48,38,0.9)" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        <path d="M93,38 C95,40 97,42 99,43" stroke="rgba(70,48,38,0.9)" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        <!-- 左小花（主枝左端上生） -->
        <path d="M30,53 C29,51 30,49 31,48 C32,49 31,51 30,53 Z" fill="rgba(74,52,40,0.9)"/>
        <use href="#meiFlower-mei" transform="translate(30,49) scale(0.7)"/>
        <circle cx="30" cy="49" r="1" fill="rgba(226,176,92,0.9)"/>
        <!-- 右小蕾（主枝右端上生，含苞带萼） -->
        <ellipse cx="88" cy="39" rx="2.3" ry="3.3" fill="url(#csBody)"/>
        <path d="M86,41.5 C87,43 89,43 90,41.5 C89,42.2 87,42.2 86,41.5 Z" fill="rgba(70,48,38,0.85)"/>
        <!-- 新增小蕾（左中上挺枝端、右侧细梢端） -->
        <ellipse cx="36" cy="41" rx="1.9" ry="2.7" fill="url(#csBody)"/>
        <path d="M34,43 C35,44.5 37,44.5 38,43 C37,43.6 35,43.6 34,43 Z" fill="rgba(70,48,38,0.85)"/>
        <ellipse cx="89" cy="32" rx="1.9" ry="2.7" fill="url(#csBody)"/>
        <path d="M87,34 C88,35.5 90,35.5 91,34 C90,34.6 88,34.6 87,34 Z" fill="rgba(70,48,38,0.85)"/>
        <!-- 嫩芽点（胭脂色，缀于梢端） -->
        <circle cx="30" cy="63" r="1.1" fill="rgba(184,110,122,0.5)"/>
        <circle cx="65" cy="55" r="1.1" fill="rgba(184,110,122,0.5)"/>
        <circle cx="73" cy="54" r="1.1" fill="rgba(184,110,122,0.5)"/>
        <circle cx="11" cy="56" r="1" fill="rgba(184,110,122,0.45)"/>
        <circle cx="13" cy="69" r="1" fill="rgba(184,110,122,0.45)"/>
        <circle cx="100" cy="33" r="1" fill="rgba(184,110,122,0.45)"/>
        <circle cx="99" cy="43" r="1" fill="rgba(184,110,122,0.45)"/>
        <!-- 主花（中段上方，花心开孔承香；mask 透出香） -->
        <use href="#meiFlower-mei" transform="translate(56,27)" mask="url(#meiHole-mei)"/>
        <!-- 主花花蕊（环绕孔口的鹅黄细点） -->
        <circle cx="52" cy="27" r="0.9" fill="rgba(226,176,92,0.92)"/>
        <circle cx="60" cy="27" r="0.9" fill="rgba(226,176,92,0.92)"/>
        <circle cx="56" cy="23.5" r="0.9" fill="rgba(226,176,92,0.92)"/>
        <circle cx="53.5" cy="30" r="0.8" fill="rgba(226,176,92,0.9)"/>
        <circle cx="58.5" cy="30" r="0.8" fill="rgba(226,176,92,0.9)"/>
        <!-- 花瓣受光（主花左上提亮） -->
        <ellipse cx="52" cy="23" rx="2.4" ry="3" fill="#ffffff" opacity="0.22"/>
        <!-- 承香孔真口（主花花心，香自花心立出：环透出香，前壁加深、后壁受光） -->
        <ellipse cx="56" cy="27" rx="5" ry="3" fill="none" stroke="var(--cs-pool-b)" stroke-width="2.2" opacity="0.9"/>
        <path d="M51,27 Q56,31 61,27" stroke="var(--cs-pool-b)" stroke-width="2.4" fill="none" opacity="0.72" stroke-linecap="round"/>
        <path d="M51,27 Q56,23 61,27" stroke="#ffffff" stroke-width="0.9" fill="none" opacity="0.24" stroke-linecap="round"/>
        <ellipse cx="56" cy="28" rx="3.4" ry="1.8" fill="var(--cs-pool-b)" opacity="0.26"/>`
      }
      ];

export const DEFAULT_CENSER = 'bamboo';

/**
 * 生成指定款式的完整 SVG 内容（defs + 主体 + 底座阴影）。
 *
 * 渐变 id 会加上 `-<key>` 后缀。原因：博古格里的微缩器物与主香炉会同时存在多份 SVG，
 * 若共用 csBody/csHi/csPool，同文档内 id 冲突会让所有实例都指向第一个定义，
 * 而变量 --cs-* 是在「该定义所在的作用域」解析的 —— 结果是所有微缩图都套用主香炉的配色。
 * 加后缀后各实例互不干扰，各自取自己格子上的 cs-<key> 配色。
 *
 * @param {string} key 款式 key
 * @returns {string} 可直接写入 svg.innerHTML 的片段
 */
export function censerSvg(key) {
  // 缓存：defs/base 含的只是 var() 引用与带 -key 后缀的渐变 id，与暗色模式无关，
  // 同 key 结果恒定，避免每次切换都重跑正则拼接。
  const cache = (censerSvg._cache || (censerSvg._cache = new Map()));
  if (cache.has(key)) return cache.get(key);
  const style = CENSER_STYLES.find((s) => s.key === key) || CENSER_STYLES[0];
  const ids = '(csBody|csHi|csPool|censerGround)';
  const defs = CENSER_DEFS
    .replace(new RegExp(`id="${ids}"`, 'g'), (_, id) => `id="${id}-${style.key}"`);
  const base = CENSER_BASE
    .replace(new RegExp(`url\\(#${ids}\\)`, 'g'), (_, id) => `url(#${id}-${style.key})`);
  const bodyFront = (style.svg || '')
    .replace(new RegExp(`url\\(#${ids}\\)`, 'g'), (_, id) => `url(#${id}-${style.key})`);
  const bodyBack = (style.svgBack || '')
    .replace(new RegExp(`url\\(#${ids}\\)`, 'g'), (_, id) => `url(#${id}-${style.key})`);
  // 需要分层的款式（如莲台）：花瓣放背景层（香后），花心放前景层（香前遮香根）
  const result = (bodyBack && bodyBack.trim())
    ? { back: defs + base + bodyBack, front: bodyFront }
    : { back: '', front: defs + base + bodyFront };
  cache.set(key, result);
  return result;
}
