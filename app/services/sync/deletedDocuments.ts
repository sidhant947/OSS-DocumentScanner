export interface DeletedDocumentEntry {
    id: string;
    deletedDate: number;
}

export function mergeDeletedDocumentTombstones(entries: DeletedDocumentEntry[] = [], ids: string[], deletedDate = Date.now()) {
    const tombstones = new Map<string, DeletedDocumentEntry>();
    let hasChanged = false;

    entries.forEach((entry) => {
        if (!entry?.id) {
            return;
        }
        const existing = tombstones.get(entry.id);
        if (!existing || existing.deletedDate < entry.deletedDate) {
            tombstones.set(entry.id, { id: entry.id, deletedDate: entry.deletedDate });
            hasChanged = true;
        }
    });

    ids.forEach((id) => {
        if (!id) {
            return;
        }
        const existing = tombstones.get(id);
        if (!existing || existing.deletedDate < deletedDate) {
            tombstones.set(id, { id, deletedDate });
            hasChanged = true;
        }
    });

    return [Array.from(tombstones.values()), hasChanged];
}
