import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'

export async function tasksRoutes(app: FastifyInstance) {
  app.get('/', async (request) => {
    const getTasksQuerySchema = z.object({
      title: z.string().optional(),
      description: z.string().optional(),
    })
    const { title, description } = getTasksQuerySchema.parse(request.query)

    if (title) {
      const tasksFilteredByTitle = await knex('tasks').where(
        'title',
        'like',
        `%${title}%`,
      )
      return { tasks: tasksFilteredByTitle }
    }

    if (description) {
      const tasksFilteredByDescription = await knex('tasks').where(
        'description',
        'like',
        `%${description}%`,
      )
      return { tasks: tasksFilteredByDescription }
    }

    const tasks = await knex('tasks').select()

    return { tasks }
  })

  app.put('/:id', async (request, reply) => {
    const getTaskParamsSchema = z.object({
      id: z.string(),
    })
    const { id } = getTaskParamsSchema.parse(request.params)

    const getTaskBodySchema = z.object({
      title: z.string().optional(),
      description: z.string().optional(),
    })
    const { title, description } = getTaskBodySchema.parse(request.body)

    if (!title && !description) {
      reply
        .status(400)
        .send({ error: 'You must provide at least one field to update' })
      return
    }

    if (title === '' || description === '') {
      reply
        .status(400)
        .send({ error: 'You must provide a valid value for the fields' })
      return
    }

    const task = await knex('tasks').where({ id }).first()
    if (!task) {
      reply.status(404).send({ error: 'Task not found' })
      return
    }

    await knex('tasks')
      .where({ id })
      .update({
        title: title ?? task.title,
        description: description ?? task.description,
      })

    reply.status(200).send({ id })
  })

  app.put('/:id/complete', async (request, reply) => {
    const getTaskParamsSchema = z.object({
      id: z.string(),
    })
    const { id } = getTaskParamsSchema.parse(request.params)

    const task = await knex('tasks').where({ id }).first()
    if (!task) {
      reply.status(404).send({ error: 'Task not found' })
      return
    }

    await knex('tasks')
      .where({ id })
      .update({
        completed_at: task.completed_at ? null : new Date().toISOString(),
      })

    reply.status(200).send({ id })
  })

  app.delete('/:id', async (request, reply) => {
    const getTaskParamsSchema = z.object({
      id: z.string(),
    })
    const { id } = getTaskParamsSchema.parse(request.params)

    const task = await knex('tasks').where({ id }).first()
    if (!task) {
      reply.status(404).send({ error: 'Task not found' })
      return
    }

    await knex('tasks').where({ id }).delete()

    reply.status(200).send({ id })
  })

  app.post('/', async (request, reply) => {
    const createTaskSchema = z.object({
      title: z.string(),
      description: z.string(),
    })

    const { title, description } = createTaskSchema.parse(request.body)

    await knex('tasks').insert({
      id: randomUUID(),
      title,
      description,
    })

    reply.status(201).send()
  })
}
