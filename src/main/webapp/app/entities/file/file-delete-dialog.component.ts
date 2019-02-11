import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { IFile } from 'app/shared/model/file.model';
import { FileService } from './file.service';

@Component({
    selector: 'jhi-file-delete-dialog',
    templateUrl: './file-delete-dialog.component.html'
})
export class FileDeleteDialogComponent {
    file: IFile;

    constructor(protected fileService: FileService, public activeModal: NgbActiveModal, protected eventManager: JhiEventManager) {}

    clear() {
        this.activeModal.dismiss('cancel');
    }

    confirmDelete(id: number) {
        this.fileService.delete(id).subscribe(response => {
            this.eventManager.broadcast({
                name: 'fileListModification',
                content: 'Deleted an file'
            });
            this.activeModal.dismiss(true);
        });
    }
}

@Component({
    selector: 'jhi-file-delete-popup',
    template: ''
})
export class FileDeletePopupComponent implements OnInit, OnDestroy {
    protected ngbModalRef: NgbModalRef;

    constructor(protected activatedRoute: ActivatedRoute, protected router: Router, protected modalService: NgbModal) {}

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ file }) => {
            setTimeout(() => {
                this.ngbModalRef = this.modalService.open(FileDeleteDialogComponent as Component, { size: 'lg', backdrop: 'static' });
                this.ngbModalRef.componentInstance.file = file;
                this.ngbModalRef.result.then(
                    result => {
                        this.router.navigate(['/file', { outlets: { popup: null } }]);
                        this.ngbModalRef = null;
                    },
                    reason => {
                        this.router.navigate(['/file', { outlets: { popup: null } }]);
                        this.ngbModalRef = null;
                    }
                );
            }, 0);
        });
    }

    ngOnDestroy() {
        this.ngbModalRef = null;
    }
}
