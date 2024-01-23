import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('tasks', (table) => {
    table.uuid('id').primary()
    table.text('title').notNullable()
    table.text('description').notNullable()
    table.timestamp('completed_at').defaultTo(null)
    // This means created_at and updated_at will be created automatically
    table.timestamps(true, true)
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('tasks')
}
