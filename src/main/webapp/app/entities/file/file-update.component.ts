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

    save() {
        this.isSaving = true;
        this.file.creationDate = this.creationDate != null ? moment(this.creationDate, DATE_TIME_FORMAT) : null;
        if (this.file.id !== undefined) {
            this.subscribeToSaveResponse(this.fileService.update(this.file));
        } else {
            this.subscribeToSaveResponse(this.fileService.create(this.file));
        }
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
