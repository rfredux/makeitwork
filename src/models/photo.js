'use strict'

const { TEMPLATE } = require('../constants/photo')
const { DC } = require('../constants/properties')
const { all } = require('bluebird')
const { text, datetime } = require('../value')
const metadata = require('./metadata')
const { into, map } = require('transducers.js')
const { assign } = Object

const skel = (id) => ({
  id, selections: [], notes: []
})

module.exports = {

  async create(db, { item, image, template }) {
    const {
      path, checksum, mimetype, width, height, orientation
    } = image

    const { id } = await db.run(`
      INSERT INTO subjects (template) VALUES (?)`, template || TEMPLATE)

    await db.run(`
      INSERT INTO images (id, width, height) VALUES (?,?,?)`,
      [id, width, height])

    await all([
      db.run(`
        INSERT INTO photos (id, item_id, path, checksum, mimetype, orientation)
          VALUES (?,?,?,?,?,?)`,
        [id, item, path, checksum, mimetype, orientation]),

      metadata.update(db, {
        id,
        data: {
          [DC.TITLE]: text(image.title),
          [DC.DATE]: datetime(image.date)
        }
      })
    ])


    return (await module.exports.load(db, [id]))[id]
  },

  async load(db, ids) {
    const photos = into({}, map(id => [id, skel(id)]), ids)

    if (ids.length) {
      ids = ids.join(',')

      await all([
        db.each(`
          SELECT id, item_id AS item, template, created, modified,
            width, height, path, protocol, mimetype, checksum, orientation, exif
            FROM subjects
              JOIN images USING (id)
              JOIN photos USING (id)
            WHERE id IN (${ids})`,

          (data) => {
            assign(photos[data.id], data)
          }
        ),

        db.each(`
          SELECT id, photo_id AS photo
            FROM selections
              LEFT OUTER JOIN trash USING (id)
            WHERE photo_id IN (${ids})
              AND deleted IS NULL
            ORDER BY photo_id, position`,
          ({ id, photo }) => {
            photos[photo].selections.push(id)
          }
        ),

        db.each(`
          SELECT id, note_id AS note
            FROM notes
            WHERE id IN (${ids}) AND deleted IS NULL
            ORDER BY id, created`,
          ({ id, note }) => {
            photos[id].notes.push(note)
          }
        )
      ])
    }

    return photos
  },

  async move(db, { ids, item }) {
    return db.run(`
      UPDATE photos SET item_id = ?  WHERE id in (${ids.join(',')})`,
      item)
  },

  async order(db, item, photos, offset = 0) {
    if (photos.length) {
      return db.run(`
        UPDATE photos
          SET position = CASE id
            ${photos.map((_, idx) =>
              (`WHEN ? THEN ${offset + idx + 1}`)).join(' ')}
            END
          WHERE item_id = ?`,
        ...photos, item)
    }
  },

  async merge(db, item, photos, offset = 0) {
    if (photos.length) {
      return db.run(`
        UPDATE photos
          SET item_id = ?, position = CASE id
            ${photos.map((_, idx) =>
              (`WHEN ? THEN ${offset + idx + 1}`)).join(' ')}
            END
          WHERE id IN (${photos.join(',')})`,
        item, ...photos)
    }
  },

  async delete(db, ids) {
    return db.run(`
      INSERT INTO trash (id)
        VALUES ${ids.map(id => `(${id})`).join(',')}`
    )
  },

  async restore(db, { ids }) {
    return db.run(`
      DELETE FROM trash WHERE id IN (${ids.join(',')})`
    )
  },

  async prune(db) {
    return db.run(`
      DELETE FROM subjects
        WHERE id IN (
          SELECT id FROM trash JOIN photos USING (id)
        )`
    )
  }
}
