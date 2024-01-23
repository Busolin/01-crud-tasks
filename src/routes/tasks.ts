import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'

interface TaskQuery {
  title?: string
  description?: string
}

export async function tasksRoutes(app: FastifyInstance) {
  app.get('/', async (request) => {
    const { title, description } = request.query as TaskQuery

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
