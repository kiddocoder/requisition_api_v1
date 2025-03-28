import factory from '@adonisjs/lucid/factories'
import Enterprise from '#models/enterprise'

export const EnterpriseFactory = factory
  .define(Enterprise, async ({ faker }) => {

    return {
      name: "DAC",
      description: faker.lorem.sentence(),
    }
  })
  .build()