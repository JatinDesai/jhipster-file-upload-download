import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Routes } from '@angular/router';
import { JhiPaginationUtil, JhiResolvePagingParams } from 'ng-jhipster';
import { UserRouteAccessService } from 'app/core';
import { Observable, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { File } from 'app/shared/model/file.model';
import { FileService } from './file.service';
import { FileComponent } from './file.component';
import { FileDetailComponent } from './file-detail.component';
import { FileUpdateComponent } from './file-update.component';
import { FileDeletePopupComponent } from './file-delete-dialog.component';
import { IFile } from 'app/shared/model/file.model';

@Injectable({ providedIn: 'root' })
export class FileResolve implements Resolve<IFile> {
    constructor(private service: FileService) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IFile> {
        const id = route.params['id'] ? route.params['id'] : null;
        if (id) {
            return this.service.find(id).pipe(
                filter((response: HttpResponse<File>) => response.ok),
                map((file: HttpResponse<File>) => file.body)
            );
        }
        return of(new File());
    }
}

export const fileRoute: Routes = [
    {
        path: '',
        component: FileComponent,
        resolve: {
            pagingParams: JhiResolvePagingParams
        },
        data: {
            authorities: ['ROLE_USER'],
            defaultSort: 'id,asc',
            pageTitle: 'Files'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: ':id/view',
        component: FileDetailComponent,
        resolve: {
            file: FileResolve
        },
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Files'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: 'new',
        component: FileUpdateComponent,
        resolve: {
            file: FileResolve
        },
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Files'
        },
        canActivate: [UserRouteAccessService]
    },
    {
        path: ':id/edit',
        component: FileUpdateComponent,
        resolve: {
            file: FileResolve
        },
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Files'
        },
        canActivate: [UserRouteAccessService]
    }
];

export const filePopupRoute: Routes = [
    {
        path: ':id/delete',
        component: FileDeletePopupComponent,
        resolve: {
            file: FileResolve
        },
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'Files'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    }
];
