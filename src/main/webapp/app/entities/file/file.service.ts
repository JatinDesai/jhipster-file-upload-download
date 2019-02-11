import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import { DATE_FORMAT } from 'app/shared/constants/input.constants';
import { map } from 'rxjs/operators';

import { SERVER_API_URL } from 'app/app.constants';
import { createRequestOption } from 'app/shared';
import { IFile } from 'app/shared/model/file.model';

type EntityResponseType = HttpResponse<IFile>;
type EntityArrayResponseType = HttpResponse<IFile[]>;

@Injectable({ providedIn: 'root' })
export class FileService {
    public resourceUrl = SERVER_API_URL + 'api/files';

    constructor(protected http: HttpClient) {}

    create(formData): Observable<EntityResponseType> {
        return this.http
            .post<IFile>(`${this.resourceUrl}/single-file`, formData, { observe: 'response' })
            .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
    }

    createFiles(formData): Observable<EntityResponseType> {
        return this.http
            .post<IFile>(`${this.resourceUrl}/multiple-files`, formData, { observe: 'response' })
            .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
    }

    update(file: IFile): Observable<EntityResponseType> {
        const copy = this.convertDateFromClient(file);
        return this.http
            .put<IFile>(this.resourceUrl, copy, { observe: 'response' })
            .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
    }

    find(id: number): Observable<EntityResponseType> {
        return this.http
            .get<IFile>(`${this.resourceUrl}/${id}`, { observe: 'response' })
            .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
    }

    download(id: number): Observable<any> {
        const url = `${this.resourceUrl}/download/${id}`;
        const httpOptions = {
            responseType: 'arraybuffer' as 'json'
        };
        return this.http.get<any>(url, httpOptions);
    }

    query(req?: any): Observable<EntityArrayResponseType> {
        const options = createRequestOption(req);
        return this.http
            .get<IFile[]>(this.resourceUrl, { params: options, observe: 'response' })
            .pipe(map((res: EntityArrayResponseType) => this.convertDateArrayFromServer(res)));
    }

    delete(id: number): Observable<HttpResponse<any>> {
        return this.http.delete<any>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }

    protected convertDateFromClient(file: IFile): IFile {
        const copy: IFile = Object.assign({}, file, {
            creationDate: file.creationDate != null && file.creationDate.isValid() ? file.creationDate.toJSON() : null
        });
        return copy;
    }

    protected convertDateFromServer(res: EntityResponseType): EntityResponseType {
        if (res.body) {
            res.body.creationDate = res.body.creationDate != null ? moment(res.body.creationDate) : null;
        }
        return res;
    }

    protected convertDateArrayFromServer(res: EntityArrayResponseType): EntityArrayResponseType {
        if (res.body) {
            res.body.forEach((file: IFile) => {
                file.creationDate = file.creationDate != null ? moment(file.creationDate) : null;
            });
        }
        return res;
    }
}
