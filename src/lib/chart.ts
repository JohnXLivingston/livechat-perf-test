import type { Data } from '../test-suite'
import { spawn } from 'child_process'

async function generateCPUChart (
  title: string,
  start: number,
  data: { [name: string]: Data[] },
  outputPath: string
): Promise<void> {
  const gnuplot = spawn(
    'gnuplot'
  )
  gnuplot.on('error', (err) => {
    console.error(err)
    throw new Error('Gnuplot failed')
  })
  gnuplot.stderr.on('data', (data) => {
    console.error(data.toString())
  })
  gnuplot.stdout.on('data', (data) => {
    console.log(data.toString())
  })

  const p = new Promise((resolve) => {
    gnuplot.on('close', () => resolve(true))
  })

  gnuplot.stdin.write(
    'set term png\n' +
    'set output "' + outputPath + '"\n' +
    'set title "%CPU ' + title.replace(/_/g, ' ') + '"\n' +
    'set ylabel "%CPU"\n' +
    'set xlabel "Seconds"\n'
  )

  // Asking to plot N lines:
  gnuplot.stdin.write(
    'plot ' +
    Object.keys(data).map((name, i) => {
      const cleanName = name.replace(/_/g, ' ')
      return '"-" using 1:2 with linespoints linecolor ' + (i + 1).toString() + ' title "' + cleanName + '" '
    }).join(', ') +
    '\n'
  )

  // Writing data.
  for (const name in data) {
    const dataLine = data[name]
    for (const d of dataLine) {
      // Substracting `start` to get the time since the start of the test suite.
      // Must divide the timestamp by 1000 to get a unix timestamp.
      const timestamp = (d.timestamp - start) / 1000
      gnuplot.stdin.write(
        timestamp.toString() +
        ' ' +
        d.value.toString() +
        '\n'
      )
    }
    gnuplot.stdin.write('e\n')
  }

  gnuplot.stdin.write('quit\n')

  await p
}

export {
  generateCPUChart
}
