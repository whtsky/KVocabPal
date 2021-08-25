import type { QueryExecResult } from 'sql.js'

export const VocabFields = ['stem', 'word', 'usage', 'title', 'timestamp']

export class Vocab {
  constructor(
    readonly stem: string,
    readonly word: string,
    readonly usage: string,
    readonly title: string,
    readonly timestamp: string,
  ) {}

  get usageWithWordBolded() {
    return this.usage.replace(this.word, `<strong>${this.word}</strong>`)
  }
}

export function getVocabModelsFromQueryResult(result: QueryExecResult): Vocab[] {
  return result.values.map(
    (value) => new Vocab(String(value[0]), String(value[1]), String(value[2]), String(value[3]), String(value[4])),
  )
}
