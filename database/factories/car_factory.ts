import factory from '@adonisjs/lucid/factories'
import Car from '#models/car'

export const CarFactory = factory
  .define(Car, async ({ faker }) => {
    return {
      name: faker.person.firstName(),
      license_plate: faker.database.mongodbObjectId(),
      model: faker.person.jobType(),
      brand: faker.person.jobType(),
      description: faker.lorem.sentence(),
    }
  })
  .build()