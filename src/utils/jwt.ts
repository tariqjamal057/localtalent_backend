import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import config from '../config';

export interface TokenPayload {
    userId: string;
}

export interface DecodedToken extends JwtPayload, TokenPayload { }

export const signAccessToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, config.jwt.accessSecret, {
        expiresIn: config.jwt.accessExpiresIn,
    } as SignOptions);
};

export const signRefreshToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, config.jwt.refreshSecret, {
        expiresIn: config.jwt.refreshExpiresIn,
    } as SignOptions);
};

export const verifyAccessToken = (token: string): DecodedToken => {
    return jwt.verify(token, config.jwt.accessSecret) as DecodedToken;
};

export const verifyRefreshToken = (token: string): DecodedToken => {
    return jwt.verify(token, config.jwt.refreshSecret) as DecodedToken;
};
