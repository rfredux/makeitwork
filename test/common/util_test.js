'use strict'

describe('util', () => {
  const util = __require('common/util')

  describe('.once', () => {
    const { once } = util

    describe('given an event emitter', () => {
      const { EventEmitter } = require('events')
      const ee = new EventEmitter()

      describe('when the event fires', () => {
        beforeEach(() => {
          sinon.spy(ee, 'removeListener')
          setTimeout(() => ee.emit('evt', 42), 25)
        })

        afterEach(() => {
          ee.removeListener.restore()
        })

        it('resolves', () => (
          expect(once(ee, 'evt')).eventually.to.eql(42)
        ))

        it('cleans up', () => (
          once(ee, 'evt').then(() => {
            expect(ee.removeListener)
              .to.have.been.calledWith('evt')
              .and.to.have.been.calledWith('error')
          })
        ))
      })

      describe('when the error event fires', () => {
        beforeEach(() => {
          sinon.spy(ee, 'removeListener')
          setTimeout(() => ee.emit('error', new Error()), 25)
        })

        afterEach(() => {
          ee.removeListener.restore()
        })

        it('is rejected', () => (
          expect(once(ee, 'evt')).eventually.to.be.rejected
        ))

        it('cleans up', () => (
          once(ee, 'evt').catch(() => {
            expect(ee.removeListener)
              .to.have.been.calledWith('evt')
              .and.to.have.been.calledWith('error')
          })
        ))
      })
    })
  })

  describe('.flatten', () => {
    const { flatten } = util

    it('flattens empty objects', () =>
      expect(flatten({})).to.eql({}))

    it('flattens dictionaries', () =>
      expect(flatten({ foo: { bar: 'baz' } })).to.eql({ 'foo.bar': 'baz' }))
  })

  describe('.strftime', () => {
    const { strftime } = util

    it('supports subset of stdlib strftime', () => {
      const date = new Date(2016, 8, 3, 23, 11, 5)

      expect(strftime('%Y-%m-%d %H:%M:%S', date)).to.eql('2016-09-03 23:11:05')
      expect(strftime('%y-%m-%d %H:%M:%S', date)).to.eql('16-09-03 23:11:05')
      expect(strftime('y-m-d', date)).to.eql('y-m-d')
    })
  })

  describe('.pick', () => {
    const { pick } = util

    it('picks the given properties', () =>
      expect(pick({ foo: 1, bar: 2 }, ['bar'])).to.eql({ bar: 2 }))

    it('is empty when there is no match', () =>
      expect(pick({ foo: 1, bar: 2 }, ['baz'])).to.be.empty)

    it('returns a new object', () => {
      const obj = { foo: 1 }
      expect(pick(obj, ['foo'])).to.eql(obj).and.not.equal(obj)
    })
  })

  describe('.omit', () => {
    const { omit } = util

    it('picks the given properties', () =>
      expect(omit({ foo: 1, bar: 2 }, ['bar'])).to.eql({ foo: 1 }))

    it('is empty when there is a complete match', () =>
      expect(omit({ foo: 1, bar: 2 }, ['bar', 'foo'])).to.be.empty)

    it('returns a new object', () => {
      const obj = { foo: 1 }
      expect(omit(obj, ['bar'])).to.eql(obj).and.not.equal(obj)
    })
  })

  describe('.move', () => {
    const { move } = util

    describe('with offset 0', () => {
      it('moves a in front of b', () => {
        expect(move([1, 2, 3], 3, 2, 0)).to.eql([1, 3, 2])
        expect(move([1, 2, 3], 3, 1, 0)).to.eql([3, 1, 2])

        expect(move([1, 2, 3], 2, 1, 0)).to.eql([2, 1, 3])
        expect(move([1, 2, 3], 2, 3, 0)).to.eql([1, 2, 3])

        expect(move([1, 2, 3], 1, 3, 0)).to.eql([2, 1, 3])
        expect(move([1, 2, 3], 1, 2, 0)).to.eql([1, 2, 3])

        expect(move([1, 2, 3], 1, 1, 0)).to.eql([1, 2, 3])
        expect(move([1, 2, 3], 2, 2, 0)).to.eql([1, 2, 3])
        expect(move([1, 2, 3], 3, 3, 0)).to.eql([1, 2, 3])
      })
    })

    describe('with offset 1', () => {
      it('moves a behind b', () => {
        expect(move([1, 2, 3], 3, 2, 1)).to.eql([1, 2, 3])
        expect(move([1, 2, 3], 3, 1, 1)).to.eql([1, 3, 2])

        expect(move([1, 2, 3], 2, 1, 1)).to.eql([1, 2, 3])
        expect(move([1, 2, 3], 2, 3, 1)).to.eql([1, 3, 2])

        expect(move([1, 2, 3], 1, 3, 1)).to.eql([2, 3, 1])
        expect(move([1, 2, 3], 1, 2, 1)).to.eql([2, 1, 3])

        expect(move([1, 2, 3], 1, 1, 1)).to.eql([1, 2, 3])
        expect(move([1, 2, 3], 2, 2, 1)).to.eql([1, 2, 3])
        expect(move([1, 2, 3], 3, 3, 1)).to.eql([1, 2, 3])
      })
    })
  })

  describe('.adjacent', () => {
    const { adjacent } = util

    it('returns the two items adjacent to the given item', () => {
      expect(adjacent([])).to.eql([])
      expect(adjacent([], 1)).to.eql([])

      expect(adjacent([1], 1)).to.eql([])
      expect(adjacent([1, 2], 1)).to.eql([undefined, 2])
      expect(adjacent([1, 2], 2)).to.eql([1])
      expect(adjacent([1, 2, 3], 1)).to.eql([undefined, 2])
      expect(adjacent([1, 2, 3], 2)).to.eql([1, 3])
      expect(adjacent([1, 2, 3], 3)).to.eql([2])
    })
  })

  describe('.get', () => {
    const { get } = util

    it('returns the value', () => {
      expect(get({}, '')).to.eql({})
      expect(get(null, '')).to.be.undefined
      expect(get(undefined, '')).to.be.undefined

      expect(get({}, 'a')).to.be.undefined
      expect(get({ a: 1 }, 'a')).to.eql(1)
      expect(get({ a: { b: 1 } }, 'a')).to.eql({ b: 1 })
      expect(get({ a: { b: 1 } }, 'a.b')).to.eql(1)
      expect(get({ a: { b: 1 } }, 'a.c')).to.undefined
      expect(get({ a: { b: null } }, 'a.b')).to.be.null
    })
  })

  describe('.has', () => {
    const { has } = util

    it('tests for existence', () => {
      expect(has({}, '')).to.be.true
      expect(has(null, '')).to.be.false
      expect(has(undefined, '')).to.be.false

      expect(has({}, 'a')).to.be.false
      expect(has({ a: 1 }, 'a')).to.be.true
      expect(has({ a: { b: 1 } }, 'a')).to.be.true
      expect(has({ a: { b: 1 } }, 'a.b')).to.be.true
      expect(has({ a: { b: false } }, 'a.b')).to.be.true
      expect(has({ a: { b: null } }, 'a.b')).to.be.true
      expect(has({ a: { b: undefined } }, 'a.b')).to.be.true
      expect(has({ a: { b: 1 } }, 'a.c')).to.be.false
    })
  })

  describe('.merge', () => {
    const { merge } = util

    it('returns a new object', () => {
      const a = {}
      const b = {}

      expect(merge(a, b)).to.eql({})
      expect(merge(a, b)).to.not.equal(a)
      expect(merge(a, b)).to.not.equal(b)
    })

    it('deeply merges two objects', () => {
      expect(merge({ a: 1 }, { b: 2 })).to.eql({ a: 1, b: 2 })
      expect(merge({ a: 1 }, { b: 2, a: 3 })).to.eql({ a: 3, b: 2 })
      expect(merge({ a: 1 }, { a: null })).to.eql({ a: null })
      expect(merge({ a: 1 }, { a: undefined })).to.eql({ a: undefined })

      let date = new Date()
      expect(merge({}, { date })).to.have.property('date').and.eql(date)
      expect(merge({}, { date }).date).to.not.equal(date)

      let a = { x: 1, y: 2 }
      let b = { x: 3, z: 4 }

      expect(merge({ a }, { a: b }))
        .to.have.property('a')
        .and.eql({ x: 3, y: 2, z: 4 })

      expect(merge({ a: [1] }, { b: 2, a: [3] })).to.eql({ a: [3], b: 2 })
    })
  })

  describe('.uniq', () => {
    const { uniq } = util

    it('returns array of unique values', () => {
      expect(uniq([])).to.eql([])
      expect(uniq([1])).to.eql([1])
      expect(uniq([1, 2, 3, 1, 3, 4])).to.eql([1, 2, 3, 4])
    })
  })
})
