export const LucideUtils = {
    SPEC: {
        STROKE_WIDTH: 2,
        STROKE_WIDTH_LIGHT: 1.5,
        LINECAP: 'round',
        LINEJOIN: 'round',
        FILL: 'none',
        SIZES: { xs: 12, sm: 14, md: 16, lg: 18, xl: 20, xxl: 24, hero: 32, empty: 48 },
        COLOR: 'currentColor'
    },

    _svg(name, paths, size, strokeWidth) {
        const sw = strokeWidth || this.SPEC.STROKE_WIDTH;
        return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${this.SPEC.FILL}" stroke="${this.SPEC.COLOR}" stroke-width="${sw}" stroke-linecap="${this.SPEC.LINECAP}" stroke-linejoin="${this.SPEC.LINEJOIN}" class="icon icon-${name}" aria-hidden="true">${paths}</svg>`;
    },

    ICONS: {
        plus: (s, sw) => LucideUtils._svg('plus', '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>', s, sw),
        plusCircle: (s, sw) => LucideUtils._svg('plus-circle', '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>', s, sw),
        x: (s, sw) => LucideUtils._svg('x', '<line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/>', s, sw),
        check: (s, sw) => LucideUtils._svg('check', '<polyline points="20 6 9 17 4 12"/>', s, sw),
        checkCircle: (s, sw) => LucideUtils._svg('check-circle', '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>', s, sw),
        alertTriangle: (s, sw) => LucideUtils._svg('alert-triangle', '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/>', s, sw),
        info: (s, sw) => LucideUtils._svg('info', '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/>', s, sw),
        edit: (s, sw) => LucideUtils._svg('edit', '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>', s, sw),
        trash: (s, sw) => LucideUtils._svg('trash', '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>', s, sw),
        archive: (s, sw) => LucideUtils._svg('archive', '<rect x="2" y="4" width="20" height="5" rx="2"/><path d="M4 9v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9"/><path d="M10 13h4"/>', s, sw),
        refreshCw: (s, sw) => LucideUtils._svg('refresh-cw', '<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>', s, sw),
        settings: (s, sw) => LucideUtils._svg('settings', '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>', s, sw),
        palette: (s, sw) => LucideUtils._svg('palette', '<circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>', s, sw),
        search: (s, sw) => LucideUtils._svg('search', '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>', s, sw),
        calendar: (s, sw) => LucideUtils._svg('calendar', '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>', s, sw),
        moon: (s, sw) => LucideUtils._svg('moon', '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>', s, sw),
        sun: (s, sw) => LucideUtils._svg('sun', '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>', s, sw),
        briefcase: (s, sw) => LucideUtils._svg('briefcase', '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>', s, sw),
        map: (s, sw) => LucideUtils._svg('map', '<polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21 3 6"/><line x1="9" x2="9" y1="3" y2="18"/><line x1="15" x2="15" y1="6" y2="21"/>', s, sw),
        target: (s, sw) => LucideUtils._svg('target', '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>', s, sw),
        barChart: (s, sw) => LucideUtils._svg('bar-chart', '<line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/>', s, sw),
        messageCircle: (s, sw) => LucideUtils._svg('message-circle', '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/>', s, sw),
        leaf: (s, sw) => LucideUtils._svg('leaf', '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.77 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>', s, sw),
        treePine: (s, sw) => LucideUtils._svg('tree-pine', '<path d="m12 22 7-10H5l7 10z"/><path d="M9 12l3-4 3 4"/><path d="M12 22V10"/>', s, sw),
        clock: (s, sw) => LucideUtils._svg('clock', '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>', s, sw),
        star: (s, sw) => LucideUtils._svg('star', '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>', s, sw),
        bookClosed: (s, sw) => LucideUtils._svg('book-closed', '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>', s, sw),
        bookOpen: (s, sw) => LucideUtils._svg('book-open', '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>', s, sw),
        dollarSign: (s, sw) => LucideUtils._svg('dollar-sign', '<line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>', s, sw),
        trophy: (s, sw) => LucideUtils._svg('trophy', '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>', s, sw),
        sparkles: (s, sw) => LucideUtils._svg('sparkles', '<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>', s, sw),
        bot: (s, sw) => LucideUtils._svg('bot', '<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>', s, sw),
        list: (s, sw) => LucideUtils._svg('list', '<line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/>', s, sw),
        handshake: (s, sw) => LucideUtils._svg('handshake', '<path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-2"/><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/><path d="M3 4h2"/>', s, sw),
        cloud: (s, sw) => LucideUtils._svg('cloud', '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>', s, sw),
        monitor: (s, sw) => LucideUtils._svg('monitor', '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>', s, sw),
        bell: (s, sw) => LucideUtils._svg('bell', '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>', s, sw),
        penTool: (s, sw) => LucideUtils._svg('pen-tool', '<path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="m2 2 7.586 7.586"/><circle cx="11" cy="11" r="2"/>', s, sw),
        lightbulb: (s, sw) => LucideUtils._svg('lightbulb', '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>', s, sw),
        dumbbell: (s, sw) => LucideUtils._svg('dumbbell', '<path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/>', s, sw),
        rocket: (s, sw) => LucideUtils._svg('rocket', '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>', s, sw),
        fileText: (s, sw) => LucideUtils._svg('file-text', '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/>', s, sw),
        trendingUp: (s, sw) => LucideUtils._svg('trending-up', '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>', s, sw),
        waves: (s, sw) => LucideUtils._svg('waves', '<path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>', s, sw),
        mountain: (s, sw) => LucideUtils._svg('mountain', '<path d="m8 3 4 8 5-5 5 15H2L8 3z"/>', s, sw),
        flower: (s, sw) => LucideUtils._svg('flower', '<circle cx="12" cy="12" r="3"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M6.34 17.66l-1.41 1.41"/><path d="M19.07 4.93l-1.41 1.41"/>', s, sw),
        cloudRain: (s, sw) => LucideUtils._svg('cloud-rain', '<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="m4 18 2 2"/><path d="m10 18 2 2"/><path d="m16 18 2 2"/>', s, sw),
        coffee: (s, sw) => LucideUtils._svg('coffee', '<path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/>', s, sw),
        music: (s, sw) => LucideUtils._svg('music', '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>', s, sw),
        partyPopper: (s, sw) => LucideUtils._svg('party-popper', '<path d="M5.8 11.3 2 22l10.7-3.79"/><path d="M4 3h.01"/><path d="M22 8h.01"/><path d="M15 2h.01"/><path d="M22 20h.01"/><path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10"/><path d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17"/><path d="m11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7"/>', s, sw),
        circle: (s, sw) => LucideUtils._svg('circle', '<circle cx="12" cy="12" r="10"/>', s, sw),
        keyboard: (s, sw) => LucideUtils._svg('keyboard', '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.001"/><path d="M10 8h.001"/><path d="M14 8h.001"/><path d="M18 8h.001"/><path d="M8 12h.001"/><path d="M12 12h.001"/><path d="M16 12h.001"/><path d="M7 16h10"/>', s, sw),
        volume: (s, sw) => LucideUtils._svg('volume', '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>', s, sw),
        chevronDown: (s, sw) => LucideUtils._svg('chevron-down', '<path d="m6 9 6 6 6-6"/>', s, sw),
        chevronUp: (s, sw) => LucideUtils._svg('chevron-up', '<path d="m18 15-6-6-6 6"/>', s, sw),
        chevronLeft: (s, sw) => LucideUtils._svg('chevron-left', '<path d="m15 18-6-6 6-6"/>', s, sw),
        chevronRight: (s, sw) => LucideUtils._svg('chevron-right', '<path d="m9 18 6-6-6-6"/>', s, sw),
        download: (s, sw) => LucideUtils._svg('download', '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>', s, sw),
        upload: (s, sw) => LucideUtils._svg('upload', '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>', s, sw),
        pin: (s, sw) => LucideUtils._svg('pin', '<line x1="12" x2="12" y1="17" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>', s, sw),
        pause: (s, sw) => LucideUtils._svg('pause', '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>', s, sw),
        link: (s, sw) => LucideUtils._svg('link', '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>', s, sw),
        shield: (s, sw) => LucideUtils._svg('shield', '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>', s, sw),
        slidersHorizontal: (s, sw) => LucideUtils._svg('sliders-horizontal', '<line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/>', s, sw),
        eye: (s, sw) => LucideUtils._svg('eye', '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>', s, sw),
        eyeOff: (s, sw) => LucideUtils._svg('eye-off', '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/>', s, sw),
        bookmark: (s, sw) => LucideUtils._svg('bookmark', '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>', s, sw),
        gripVertical: (s, sw) => LucideUtils._svg('grip-vertical', '<circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/>', s, sw),
        ticket: (s, sw) => LucideUtils._svg('ticket', '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>', s, sw),
        code: (s, sw) => LucideUtils._svg('code', '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>', s, sw),
        arrowUpFromLine: (s, sw) => LucideUtils._svg('arrow-up-from-line', '<path d="M12 19V5"/><path d="m5 12 7-7 7 7"/><path d="M5 19h14"/>', s, sw),
        xCircle: (s, sw) => LucideUtils._svg('x-circle', '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>', s, sw),
        layoutGrid: (s, sw) => LucideUtils._svg('layout-grid', '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>', s, sw),
        rotateCcw: (s, sw) => LucideUtils._svg('rotate-ccw', '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>', s, sw),
        flame: (s, sw) => LucideUtils._svg('flame', '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-1.12-2.5-2.5-2.5S6 10.62 6 12a2.5 2.5 0 0 0 2.5 2.5z"/><path d="M12 2c0 4-4 6-4 10a4 4 0 1 0 8 0c0-4-4-6-4-10z"/>', s, sw),
        filePlus: (s, sw) => LucideUtils._svg('file-plus', '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>', s, sw),
        dice5: (s, sw) => LucideUtils._svg('dice-5', '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M8 8h.01"/><path d="M16 8h.01"/><path d="M8 16h.01"/><path d="M16 16h.01"/><path d="M12 12h.01"/>', s, sw),
    },

    emojiMap: {
        '🎋': 'treePine', '🏆': 'trophy', '📆': 'calendar', '✨': 'sparkles',
        '🤖': 'bot', '📊': 'barChart', '🎨': 'palette', '🌙': 'moon',
        '📋': 'list', '🤝': 'handshake', '☁️': 'cloud', '🖥️': 'monitor',
        '🔔': 'bell', '🗺️': 'map', '🎯': 'target', '📝': 'penTool',
        '✎': 'edit', '⚠️': 'alertTriangle', '❌': 'x', '✅': 'check',
        '💡': 'lightbulb', '💪': 'dumbbell', '🚀': 'rocket', '📅': 'calendar',
        '📜': 'fileText', '📈': 'trendingUp', '🔄': 'refreshCw', '⭐': 'star',
        'ℹ️': 'info', '🎪': 'ticket', '🌿': 'leaf', '🌊': 'waves',
        '🏔️': 'mountain', '🌸': 'flower', '☔': 'cloudRain', '🍵': 'coffee',
        '🎵': 'music', '🎉': 'partyPopper', '📌': 'pin', '💼': 'briefcase',
        '☀️': 'sun', '🗑️': 'trash', '✏️': 'edit', '🔴': 'circle',
        '🟡': 'circle', '🟢': 'circle', '📦': 'archive', '🎲': 'dice5'
    },

    getIconName(emoji) {
        return this.emojiMap[emoji] || 'circle';
    },

    _iconCache: new Map(),
    _CACHE_MAX: 500,

    createIcon(name, options = {}) {
        const { size = 20, strokeWidth, className = '' } = options;
        const resolvedSize = typeof size === 'string' ? (this.SPEC.SIZES[size] || 20) : size;
        const cacheKey = name + ':' + resolvedSize + ':' + (strokeWidth || '') + ':' + className;
        const cached = this._iconCache.get(cacheKey);
        if (cached !== undefined) return cached;
        const iconFn = this.ICONS[name];
        if (!iconFn) return this.ICONS.circle(resolvedSize, strokeWidth);
        let svg = iconFn(resolvedSize, strokeWidth);
        if (className) {
            svg = svg.replace('class="icon icon-' + name + '"', 'class="icon icon-' + name + ' ' + className + '"');
        }
        if (this._iconCache.size >= this._CACHE_MAX) {
            const firstKey = this._iconCache.keys().next().value;
            this._iconCache.delete(firstKey);
        }
        this._iconCache.set(cacheKey, svg);
        return svg;
    },

    icon(name, size, strokeWidth) {
        return this.createIcon(name, { size: size || 20, strokeWidth });
    },

    replaceEmojiWithIcon(emoji, options = {}) {
        const iconName = this.getIconName(emoji);
        return this.createIcon(iconName, options);
    },

    renderIconForData(iconValue, options = {}) {
        if (!iconValue) return this.createIcon('circle', options);
        if (iconValue.startsWith('<svg')) return iconValue;
        if (this.emojiMap[iconValue]) return this.createIcon(this.emojiMap[iconValue], options);
        if (this.ICONS[iconValue]) return this.createIcon(iconValue, options);
        return this.createIcon('circle', options);
    },
};

window.LucideUtils = LucideUtils;
