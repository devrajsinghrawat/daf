import * as Daf from 'daf-core'
import * as DidJwt from 'daf-did-jwt'
import * as W3c from 'daf-w3c'
import * as SD from 'daf-selective-disclosure'
import { DafResolver } from 'daf-resolver'
import { ApolloServer } from 'apollo-server'
import merge from 'lodash.merge'
import { createConnection } from 'typeorm'

const infuraProjectId = '5ffc47f65c4042ce847ef66a3fa70d4c'

let didResolver = new DafResolver({ infuraProjectId })

const messageValidator = new DidJwt.MessageValidator()
messageValidator
  .setNext(new W3c.MessageValidator())
  .setNext(new SD.MessageValidator())

export const core = new Daf.Core({
  identityProviders: [],
  serviceControllers: [],
  didResolver,
  messageValidator,
})

const server = new ApolloServer({
  typeDefs: [Daf.Gql.baseTypeDefs, Daf.Gql.Core.typeDefs],
  resolvers: merge(Daf.Gql.Core.resolvers),
  context: ({ req }) => {
    const token = req.headers.authorization || ''
    if (token !== 'Bearer hardcoded-example-token') {
      throw Error('Auth error')
    }

    return { core }
  },
  introspection: true,
})

core.on(Daf.EventTypes.savedMessage, async (message: Daf.Message) => {
  // Add your business logic here
  console.log(message)
})

const main = async () => {
  const c = await createConnection({
    type: 'sqlite',
    database: './database.sqlite',
    synchronize: true,
    logging: false,
    entities: [...Daf.Entities],
  })

  const info = await server.listen()
  console.log(`🚀  Server ready at ${info.url}`)
}

main().catch(console.log)