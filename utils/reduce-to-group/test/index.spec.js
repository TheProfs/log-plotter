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

test('groups that start with 10 identical characters', async t => {
  const sample = [
    'code=H12 message="Request Timeout"',
    'code=H12 message="Request Timeout"',
    'code=H12 message="Request Timeout"',
    'code=H12 message="Request Timeout" path="user/bar/settings"',
    'code=H12 message="Request Timeout" path="user/foo/settings"',
    'foobar',
    'barfoo',

    'io:disconnection',
    'io:disconnection',

    'io:connection',
    'io:connection',
    'io:connection id_user = 3',

    'status=200 id_user=foo',
    'status=200 id_user=bar',
  ]

  await t.test('Merges lines into a parent group', (t) => {
    const groups = reduceToGroups(sample)

    assert.ok(Array.isArray(groups))
    assert.equal(groups.length, 6)

    const group = groups
      .find(group => group.log === 'barfoo')
    assert.ok(group)
    assert.equal(group.logs.length, 1)

    const group1 = groups
      .find(group => group.log === 'foobar')
    assert.ok(group1)
    assert.equal(group1.logs.length, 1)

    const group2 = groups
      .find(group => group.log === 'io:disconnection')
    assert.ok(group2)
    assert.equal(group2.logs.length, 2)

    const group3 = groups
      .find(group => group.log === 'io:connection')
    assert.ok(group3)
    assert.equal(group3.logs.length, 3)

    const group4 = groups
      .find(group => group.log === 'code=H12 message="Request Timeout"')
    assert.ok(group4)
    assert.equal(group4.logs.length, 5)

    const group5 = groups
      .find(group => group.log === 'status=200 id_user=')
    assert.ok(group5)
    assert.equal(group5.logs.length, 2)
  })
})
