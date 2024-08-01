import fetch from 'node-fetch'
import config from './config.json' assert { type: 'json' }

export default async function sendMessage(text) {
  let chunks = [[text]]

  if (text.length > 2000) {
    chunks = []

    let lines = text.split('\n')
    let currentChunk = []
    let currentLength = 0
    for (let i = 0; i < lines.length; i ++) {
      let currentLine = lines[i]
      if (currentLength + currentLine.length <= 2000) {
        currentChunk.push(currentLine)
        currentLength += currentLine.length + 1
      } else {
        chunks.push(currentChunk)
        currentChunk = [currentLine]
        currentLength = currentLine.length
      }
    }
    if (currentChunk) chunks.push(currentChunk)
  }

  for (let chunk of chunks) {
    await fetch(config.discordURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: chunk.join('\n')
      })
    })
  }
}
