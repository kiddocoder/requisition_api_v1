import factory from '@adonisjs/lucid/factories'
import ArticleCategory from '#models/article_category'

export const ArticleCategoryFactory = factory
  .define(ArticleCategory, async ({ faker }) => {
    return {
      name: faker.person.firstName(),
      description: faker.lorem.sentence(),
    }
  })
  .build()