import { AbstractIdentityStore, SerializedIdentity } from 'daf-core'
const fs = require('fs')
import Debug from 'debug'
const debug = Debug('daf:fs:identity-store')

interface FileContents {
  [did: string]: SerializedIdentity
}

export class IdentityStore extends AbstractIdentityStore {
  constructor(private fileName: string) {
    super()
  }

  async get(did: string) {
    const fileContents = this.readFromFile()
    if (!fileContents[did]) throw Error('Identity not found')
    return fileContents[did]
  }

  async delete(did: string) {
    const fileContents = this.readFromFile()
    if (!fileContents[did]) throw Error('Identity not found')
    delete fileContents[did]
    debug('Deleting', did)
    return this.writeToFile(fileContents)
  }

  async set(did: string, serializedIdentity: SerializedIdentity) {
    const fileContents = this.readFromFile()
    fileContents[did] = serializedIdentity
    debug('Saving', did)
    return this.writeToFile(fileContents)
  }

  async listDids() {
    const fileContents = this.readFromFile()
    return Object.keys(fileContents)
  }

  private readFromFile(): FileContents {
    try {
      const raw = fs.readFileSync(this.fileName)
      return JSON.parse(raw) as FileContents
    } catch (e) {
      return {}
    }
  }

  private writeToFile(json: FileContents): boolean {
    try {
      fs.writeFileSync(this.fileName, JSON.stringify(json))
      return true
    } catch (e) {
      return false
    }
  }
}
