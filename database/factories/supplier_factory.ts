import factory from '@adonisjs/lucid/factories'
import Supplier from '#models/supplier'

export const SupplierFactory = factory
  .define(Supplier, async ({ faker }) => {
    return {
      name: faker.person.firstName(),
      phone: faker.phone.number(),
      address: faker.location.streetAddress(),
    }
  })
  .build()