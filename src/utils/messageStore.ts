import { OutgoingMessage } from "../types"

const MAX_MESSAGES = 50

let messages: OutgoingMessage[] = []

export const messageStore = {
  add(message: OutgoingMessage) {
    messages.push(message)
    if (messages.length > MAX_MESSAGES) {
      messages.shift() // remove oldest message
    }
  },

  getAll(): OutgoingMessage[] {
    return messages
  },
}
