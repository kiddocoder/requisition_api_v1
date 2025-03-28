import factory from '@adonisjs/lucid/factories'
import Car from '#models/car'

export const CarFactory = factory
  .define(Car, async ({ faker }) => {
    return {
      name: faker.person.firstName(),
      description: faker.lorem.sentence(),
    }
  })
  .build()