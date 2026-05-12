import { File, Folder } from '@nativescript/core';
import type { DocFolder, OCRDocument } from '~/models/OCRDocument';
import { DocumentEvents } from '~/services/documents';
import { BasePDFSyncService, BasePDFSyncServiceOptions } from '~/services/sync/BasePDFSyncService';
import { SERVICES_SYNC_MASK } from '~/services/sync/types';
import { PDF_EXT } from '~/utils/constants';
import type { FileStat } from '~/webdav';

export interface LocalFolderPDFSyncServiceOptions extends BasePDFSyncServiceOptions {
    localFolderPath: string;
}

export class LocalFolderPDFSyncService extends BasePDFSyncService {
    shouldSync(force?: boolean, event?: DocumentEvents) {
        // DEV_LOG && console.log('shouldSync', force, this.autoSync);
        return force || (event && this.autoSync);
    }
    static type = 'folder_pdf';
    type = LocalFolderPDFSyncService.type;
    syncMask = SERVICES_SYNC_MASK[LocalFolderPDFSyncService.type];
    localFolderPath: string;
    static start(config?: { id: number; [k: string]: any }) {
        if (config) {
            const service = LocalFolderPDFSyncService.getOrCreateInstance();
            Object.assign(service, config);
            DEV_LOG && console.log('LocalFolderPDFSyncService', 'start', JSON.stringify(config), service.autoSync);
            return service;
        }
    }
    override stop() {}
    override async ensureRemoteFolder(folderPath = this.localFolderPath) {
        if (!Folder.exists(folderPath)) {
            Folder.fromPath(folderPath);
        }
    }
    override async getRemoteFolderFiles(folderStr: string) {
        let nURL: NSURL;
        if (__IOS__) {
            nURL = NSURL.fileURLWithPathIsDirectory(this.localFolderPath, true);
            nURL.startAccessingSecurityScopedResource();
        }
        const files = await Folder.fromPath(this.localFolderPath).getEntities();
        nURL?.stopAccessingSecurityScopedResource();
        return files
            .filter((e) => e instanceof File)
            .map(
                (e) =>
                    ({
                        basename: e.name,
                        filename: e.path,
                        type: 'file',
                        lastmod: e.lastModified.valueOf() / 1000,
                        size: e.size
                    }) as FileStat
            );
    }

    override async writePDF(document: OCRDocument, fileName: string, _docFolder?: DocFolder) {
        if (!fileName.endsWith(PDF_EXT)) {
            fileName += PDF_EXT;
        }
        let destinationPath = this.localFolderPath;
        if (_docFolder) {
            const subFolders = _docFolder.name.split('/');
            let folder = Folder.fromPath(destinationPath, true);
            for (let i = 0; i < subFolders.length; i++) {
                folder = folder.getFolder(subFolders[i], true);
            }
            destinationPath = folder.path;
        }

        return this.writePDFToFolder(document, fileName, destinationPath, _docFolder);
    }

    async uploadPDF(document: OCRDocument, localFilePath: string, fileName: string, docFolder?: DocFolder) {}
}
