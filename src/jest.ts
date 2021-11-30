import { transform } from "./transform";

interface TransformerResult {
  code: string;
  map?: string;
}

export default {
  process(code: string, fileName: string): TransformerResult {
    const output = transform(code, fileName);
    return {
      code: output.code,
      map: output.sourceMap,
    };
  },
};
