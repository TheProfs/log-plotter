'use strict'

const { suite, test } = require('node:test')
const assert = require('node:assert')

const sample = [
  'code=H12 message="Request Timeout id_user=foo"',
  'code=H12 message="Request Timeout id_user=bar"'
  'code=H12 message="Request Timeout id_user=baz"'
]

test('Reduce to grouped', async t => {
  await t.test('Merges the 3 lines into the lower common string denom', (t) => {
    const groups = reduceToGroups(sample)

    assert.ok(Array.isArray(groups))
    assert.equal(groups.length, 1)

    const group = groups[0]

    assert.ok(group)
    assert.ok(group.label, 'code=H12 message="Request Timeout id_user=')
    assert.ok(Array.isArray(group.children))
    assert.equal(group.logs.length, 3)

    sample.forEach((log, i) => {
      assert.equal(group[i], log)
    })
  })
})
