import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import * as moment from 'moment';
import { DATE_TIME_FORMAT } from 'app/shared/constants/input.constants';
import { JhiAlertService } from 'ng-jhipster';
import { IFile } from 'app/shared/model/file.model';
import { FileService } from './file.service';
import { IUser, UserService } from 'app/core';

@Component({
    selector: 'jhi-file-update',
    templateUrl: './file-update.component.html'
})
export class FileUpdateComponent implements OnInit {
    file: IFile;
    singleFile: File;
    singleFileDescription: string;
    multipleFiles: File[] = [];
    multipleFileDescription: string;
    isSaving: boolean;

    users: IUser[];
    creationDate: string;

    constructor(
        protected jhiAlertService: JhiAlertService,
        protected fileService: FileService,
        protected userService: UserService,
        protected activatedRoute: ActivatedRoute
    ) {}

    ngOnInit() {
        this.isSaving = false;
        this.activatedRoute.data.subscribe(({ file }) => {
            this.file = file;
            this.creationDate = this.file.creationDate != null ? this.file.creationDate.format(DATE_TIME_FORMAT) : null;
        });
        this.userService
            .query()
            .pipe(
                filter((mayBeOk: HttpResponse<IUser[]>) => mayBeOk.ok),
                map((response: HttpResponse<IUser[]>) => response.body)
            )
            .subscribe((res: IUser[]) => (this.users = res), (res: HttpErrorResponse) => this.onError(res.message));
    }

    previousState() {
        window.history.back();
    }

    public singleFileEvent($event) {
        this.singleFile = $event.target.files[0];
    }

    public multipleFileEvent($event) {
        const files = $event.target.files;
        for (let i = 0; i < files.length; i++) {
            this.multipleFiles.push(files[i]);
        }
    }

    saveSingleFile() {
        this.isSaving = true;
        const formData = new FormData();
        formData.append('file', this.singleFile, this.singleFile.name);
        formData.append('description', this.singleFileDescription);
        this.subscribeToSaveResponse(this.fileService.create(formData));
    }

    saveMultipleFile() {
        this.isSaving = true;
        const formData = new FormData();
        for (let i = 0; i < this.multipleFiles.length; i++) {
            formData.append('files', this.multipleFiles[i], this.multipleFiles[i]['name']);
        }
        formData.append('description', this.multipleFileDescription);
        this.subscribeToSaveResponse(this.fileService.createFiles(formData));
    }

    protected subscribeToSaveResponse(result: Observable<HttpResponse<IFile>>) {
        result.subscribe((res: HttpResponse<IFile>) => this.onSaveSuccess(), (res: HttpErrorResponse) => this.onSaveError());
    }

    protected onSaveSuccess() {
        this.isSaving = false;
        this.previousState();
    }

    protected onSaveError() {
        this.isSaving = false;
    }

    protected onError(errorMessage: string) {
        this.jhiAlertService.error(errorMessage, null, null);
    }

    trackUserById(index: number, item: IUser) {
        return item.id;
    }
}
