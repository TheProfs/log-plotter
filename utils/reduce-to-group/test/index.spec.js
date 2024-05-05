'use strict'

const { suite, test } = require('node:test')
const assert = require('node:assert')

const reduceToGroups = require('../index.js')

test('Identical Log lines', async t => {
  const sample = [
    'code=H12 message="Request Timeout',
    'code=H12 message="Request Timeout',
    'code=H12 message="Request Timeout'
  ]

  await t.test('Merges the 3 lines into a parent group', (t) => {
    const groups = reduceToGroups(sample)

    assert.ok(Array.isArray(groups))
    assert.equal(groups.length, 1)

    const group = groups[0]

    assert.ok(group)
    assert.ok(group.log, 'code=H12 message="Request Timeout')
    assert.ok(Array.isArray(group.logs))
    assert.equal(group.logs.length, 3)

    sample.forEach((log, i) => assert.equal(group.logs[i], log))
  })
})

/*
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

    sample.forEach((log, i) => assert.equal(group[i], log))
  })
})
*/
