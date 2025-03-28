import factory from '@adonisjs/lucid/factories'
import Article from '#models/article'

export const ArticleFactory = factory
  .define(Article, async ({ faker }) => {
    return {
      name: faker.person.firstName(),
      unite_mesure: faker.person.jobType(),
      description: faker.lorem.sentence(),
      image: faker.system.commonFileName(),
      image_name: faker.image.url(),
    }
  })
  .build()