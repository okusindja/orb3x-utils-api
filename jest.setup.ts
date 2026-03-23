import '@testing-library/jest-dom'

// Next route handlers expect the Fetch API globals to exist during module evaluation.
// Jest's jsdom environment does not always provide them consistently.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { TextDecoder, TextEncoder } = require('util')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { ReadableStream, TransformStream, WritableStream } = require('stream/web')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { MessageChannel, MessagePort } = require('worker_threads')

if (!global.TextDecoder) {
  global.TextDecoder = TextDecoder
}

if (!global.TextEncoder) {
  global.TextEncoder = TextEncoder
}

if (!global.ReadableStream) {
  global.ReadableStream = ReadableStream
}

if (!global.TransformStream) {
  global.TransformStream = TransformStream
}

if (!global.WritableStream) {
  global.WritableStream = WritableStream
}

if (!global.MessageChannel) {
  global.MessageChannel = MessageChannel
}

if (!global.MessagePort) {
  global.MessagePort = MessagePort
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { fetch, Headers, Request, Response } = require('undici')

if (!global.fetch) {
  global.fetch = fetch
}

if (!global.Headers) {
  global.Headers = Headers
}

if (!global.Request) {
  global.Request = Request
}

if (!global.Response) {
  global.Response = Response
}
