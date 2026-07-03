export const Other = {
    Editor: OtherModule,
    openOtherEditor() {
        OtherModule.openOtherEditor();
    },
    save() {
        OtherModule.save();
    }
};

window.Other = Other;