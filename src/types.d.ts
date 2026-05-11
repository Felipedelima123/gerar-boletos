declare module 'base64-stream' {
  import { Transform } from 'stream';
  export class Base64Encode extends Transform {}
  export class Base64Decode extends Transform {}
}
