import { expect, test } from 'vitest';
import { mergeDeletedDocumentTombstones } from './deletedDocuments';

test('creates tombstones for deleted document ids', () => {
    expect(mergeDeletedDocumentTombstones([], ['doc-a'], 1234)).toEqual([{ id: 'doc-a', deletedDate: 1234 }]);
});

test('de-duplicates deleted document ids', () => {
    expect(mergeDeletedDocumentTombstones([], ['doc-a', 'doc-a'], 1234)).toEqual([{ id: 'doc-a', deletedDate: 1234 }]);
});

test('preserves the newest deleted date for an existing tombstone', () => {
    expect(mergeDeletedDocumentTombstones([{ id: 'doc-a', deletedDate: 2000 }], ['doc-a'], 1000)).toEqual([{ id: 'doc-a', deletedDate: 2000 }]);
    expect(mergeDeletedDocumentTombstones([{ id: 'doc-a', deletedDate: 1000 }], ['doc-a'], 2000)).toEqual([{ id: 'doc-a', deletedDate: 2000 }]);
});
