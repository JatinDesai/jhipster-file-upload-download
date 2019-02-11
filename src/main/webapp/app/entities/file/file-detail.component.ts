import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IFile } from 'app/shared/model/file.model';

@Component({
    selector: 'jhi-file-detail',
    templateUrl: './file-detail.component.html'
})
export class FileDetailComponent implements OnInit {
    file: IFile;

    constructor(protected activatedRoute: ActivatedRoute) {}

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ file }) => {
            this.file = file;
        });
    }

    previousState() {
        window.history.back();
    }
}
