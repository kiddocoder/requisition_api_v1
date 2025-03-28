import factory from '@adonisjs/lucid/factories'
import Caisse from '#models/caisse'

export const CaisseFactory = factory
  .define(Caisse, async ({ faker }) => {
    return {
      budget: faker.number.int({ min: 1000, max: 1000000000 }),
    }
  })
  .build()