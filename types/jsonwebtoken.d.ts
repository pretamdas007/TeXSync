declare module 'jsonwebtoken' {
  export interface JwtPayload {
    [key: string]: any;
  }

  export type Secret = string | Buffer;

  export interface SignOptions {
    algorithm?: string;
    expiresIn?: string | number;
    notBefore?: string | number;
    audience?: string | string[];
    issuer?: string;
    jwtid?: string;
    subject?: string;
    noTimestamp?: boolean;
    header?: object;
    keyid?: string;
  }

  export function sign(
    payload: string | object | Buffer,
    secretOrPrivateKey: Secret,
    options?: SignOptions
  ): string;

  export function verify(
    token: string,
    secretOrPublicKey: Secret,
    options?: object
  ): JwtPayload | string;

  export function decode(
    token: string,
    options?: object
  ): JwtPayload | string | null;
}