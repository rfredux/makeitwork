'use strict'

module.exports = {
  CREATE: 'item.create',
  DELETE: 'item.delete',
  DESTROY: 'item.destroy',
  INSERT: 'item.insert',
  IMPORT: 'item.import',
  LOAD: 'item.load',
  MERGE: 'item.merge',
  OPEN: 'item.open',
  REMOVE: 'item.remove',
  RESTORE: 'item.restore',
  SAVE: 'item.save',
  SELECT: 'item.select',
  UPDATE: 'item.update',
  PREVIEW: 'item.preview',

  BULK: {
    UPDATE: 'item.bulk.update'
  },

  TAG: {
    ADD: 'item.tag.add',
    REMOVE: 'item.tag.remove',
    CLEAR: 'item.tag.clear',
    TOGGLE: 'item.tag.toggle'
  },

  PHOTO: {
    ADD: 'item.photo.add',
    REMOVE: 'item.photo.remove'
  }
}
