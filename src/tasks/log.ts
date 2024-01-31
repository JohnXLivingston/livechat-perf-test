import type { TestSuite } from '../test-suite'
import { Task } from './abstract'

/**
 * This task just logs a text when it is called.
 * So you can add some marks in the results.
 */
class LogTask extends Task {
  protected readonly text?: string
  protected readonly chartKey?: string

  constructor (suite: TestSuite, definition: any) {
    super(suite, definition)

    if ('text' in definition) {
      this.text = definition.text.toString()
    }
    if ('chart_key' in definition) {
      this.chartKey = definition.chart_key.toString()
    }
  }

  public async start (): Promise<void> {
    const text = this.text ?? this.name
    this.log(text)
    this.suite.addMark(this, text, this.chartKey)
  }
}

export {
  LogTask
}
