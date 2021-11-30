# @sylo-digital/swc-register

This is a require hook and jest transformer to transform `.ts` files with SWC that handles falling back to and caching the result of `tsc` for files with decorators. SWC has some funky issues when it comes to decorators, making it incompatible with NestJS projects and other libraries that use decorators. This transformer will use SWC for files without decorators as normal, but for files with decorators it will use `tsc` to compile the file and cache the result on disk by the files hash.

Other attempts like [@swc/register](https://www.npmjs.com/package/@swc/register) and [@swc-node/register](https://www.npmjs.com/package/@swc-node/register) do not play well with decorators, and do not have simple jest support with decorators.

This is a replacement for a previous attempt, [@sylo-digital/swc-decorator-fix](https://github.com/sylo-digital/swc-decorator-fix). The previous attempt worked fine, but it lacked jest support and when used with `@swc/register` like it was intended to it meant compiling the same files multiple times.

## usage

> You can enable debug mode by setting `NODE_DEBUG` to `swc-register`.

- Install with `pnpm add @sylo-digital/swc-register @swc/core`
- For NodeJS run with `node -r @sylo-digital/swc-register ./src/index.ts`
- For Jest add `transform: { "^.+\\.tsx?$": "@sylo-digital/swc-register" }` to your jest.config.js
  - This is currently a hack until Jest 28 where `@sylo-digital/swc-register/jest` will work.
  - Debug mode won't show everything with jest because jest does its own caching on top of ours.

## todo

- Copy tests from `@sylo-digital/swc-decorator-fix`
- Disable caching when running with jest, it has its own caching.
