import factory from '@adonisjs/lucid/factories'
import Caisse from '#models/caisse'

export const CaisseFactory = factory
  .define(Caisse, async ({ faker }) => {
    return {
      name:faker.person.firstName(),
      budget: faker.number.int({ min: 1000, max: 1000000000 }),
      solde_actuel: faker.number.int({ min: 1000, max: 100000 }),
    }
  })
  .build()