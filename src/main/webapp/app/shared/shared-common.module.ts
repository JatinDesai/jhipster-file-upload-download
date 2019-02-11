import { NgModule } from '@angular/core';

import { TestSharedLibsModule, JhiAlertComponent, JhiAlertErrorComponent } from './';

@NgModule({
    imports: [TestSharedLibsModule],
    declarations: [JhiAlertComponent, JhiAlertErrorComponent],
    exports: [TestSharedLibsModule, JhiAlertComponent, JhiAlertErrorComponent]
})
export class TestSharedCommonModule {}
