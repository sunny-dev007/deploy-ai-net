declare module 'js-tiktoken' {
  export interface Encoding {
    encode(text: string): number[];
    decode(tokens: number[]): string;
    free(): void;
  }

  export function encodingForModel(model: string): Encoding;
} 