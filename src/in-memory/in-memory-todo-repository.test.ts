import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { InMemoryTodoRepository } from './in-memory-todo-repository.ts'

describe('InMemoryTodoRepository', () => {
  it('creates and finds a todo', async () => {
    const repository = new InMemoryTodoRepository()
    const created = await repository.create({ description: 'buy milk', status: 'todo' })

    const found = await repository.find(created.id)

    assert.deepEqual(found, created)
  })

  it('returns null when the todo does not exist', async () => {
    const repository = new InMemoryTodoRepository()

    assert.equal(await repository.find('missing'), null)
  })

  it('does not expose the stored object', async () => {
    const repository = new InMemoryTodoRepository()
    const created = await repository.create({ description: 'buy milk', status: 'todo' })

    created.description = 'mutated'

    assert.equal((await repository.find(created.id))?.description, 'buy milk')
  })

  it('lists with limit and offset', async () => {
    const repository = new InMemoryTodoRepository()
    for (const description of ['a', 'b', 'c']) {
      await repository.create({ description, status: 'todo' })
    }

    const todos = await repository.list({ limit: 1, offset: 1 })

    assert.deepEqual(todos.map(t => t.description), ['b'])
  })

  it('updates only the given fields', async () => {
    const repository = new InMemoryTodoRepository()
    const created = await repository.create({ description: 'buy milk', status: 'todo' })

    const updated = await repository.update(created.id, { status: 'done' })

    assert.equal(updated?.description, 'buy milk')
    assert.equal(updated?.status, 'done')
  })

  it('returns null when updating a missing todo', async () => {
    const repository = new InMemoryTodoRepository()

    assert.equal(await repository.update('missing', { status: 'done' }), null)
  })

  it('deletes a todo', async () => {
    const repository = new InMemoryTodoRepository()
    const created = await repository.create({ description: 'buy milk', status: 'todo' })

    await repository.delete(created.id)

    assert.equal(await repository.find(created.id), null)
  })
})
