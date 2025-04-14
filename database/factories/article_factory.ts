import factory from '@adonisjs/lucid/factories'
import Article from '#models/article'

export const ArticleFactory = factory
  .define(Article, async ({ faker }) => {
    return {
      name: faker.person.firstName(),
      reference: faker.string.uuid(),
      unite_mesure: faker.person.jobType(),
      description: faker.lorem.sentence(),
      image: faker.image.url(),
      image_name: faker.system.commonFileName(),
    }
  })
  .build()