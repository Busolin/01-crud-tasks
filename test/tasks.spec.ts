/* eslint-disable prettier/prettier */

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { app } from '../src/app'
import { execSync } from 'node:child_process'
import request from 'supertest'

describe('Tasks routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a task', async () => {
    await request(app.server)
      .post('/tasks')
      .send({
        title: 'New task',
        description: 'New task description',
      })
      .expect(201)
  })

  it('should be able to list all tasks', async () => {
    await request(app.server).post('/tasks').send({
      title: 'New task',
      description: 'New task description',
    })

    const listTasksResponse = await request(app.server).get('/tasks')

    expect(listTasksResponse.body.tasks).toEqual([
      expect.objectContaining({
        title: 'New task',
        description: 'New task description',
      }),
    ])
  })

  it('should be able to update a task by id', async () => {
    await request(app.server).post('/tasks').send({
      title: 'New task',
      description: 'New task description',
    })

    const listTasksResponse = await request(app.server).get('/tasks')

    const taskId = listTasksResponse.body.tasks[0].id

    await request(app.server)
      .put(`/tasks/${taskId}`)
      .send({
        title: 'Updated task',
        description: 'Updated task description',
      })
      .expect(200)
  })

  it('should be able to delete a task by id', async () => {
    await request(app.server).post('/tasks').send({
      title: 'New task',
      description: 'New task description',
    })

    const listTasksResponse = await request(app.server).get('/tasks')

    const taskId = listTasksResponse.body.tasks[0].id

    await request(app.server).delete(`/tasks/${taskId}`).expect(200)
  })

  it('should be able to mark a task as completed', async () => {
    await request(app.server).post('/tasks').send({
      title: 'New task',
      description: 'New task description',
    })

    const listTasksResponse = await request(app.server).get('/tasks')

    const taskId = listTasksResponse.body.tasks[0].id

    await request(app.server).put(`/tasks/${taskId}/complete`).expect(200)
  })
})
