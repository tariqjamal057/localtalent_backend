import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { sendResponse, ApiError } from '../utils/response';
import { MESSAGES } from '../constants/messages';

import config from '../config';

const LOCALES_DIR = path.join(__dirname, '../locales');
const SUPPORTED_LOCALES = config.i18n.supportedLocales;
const CACHE_MAX_AGE_SECONDS = config.i18n.cacheMaxAgeSeconds;

interface LocaleMeta {
    name: string;
    nativeName: string;
    symbol: string;
    symbolBg: string;
    symbolColor: string;
}

const LOCALE_META: Record<string, LocaleMeta> = {
    en: { name: 'English', nativeName: 'English', symbol: 'Aa', symbolBg: '#e0f2fe', symbolColor: '#0284c7' },
    hi: { name: 'Hindi', nativeName: 'हिंदी', symbol: 'अ', symbolBg: '#fce7f3', symbolColor: '#db2777' },
    te: { name: 'Telugu', nativeName: 'తెలుగు', symbol: 'అ', symbolBg: '#e0f2fe', symbolColor: '#0284c7' },
    ta: { name: 'Tamil', nativeName: 'தமிழ்', symbol: 'அ', symbolBg: '#fef3c7', symbolColor: '#d97706' },
};

interface TranslationEntry {
    data: Record<string, unknown>;
    etag: string;
    lastModified: Date;
}

const translationCache = new Map<string, TranslationEntry>();

const isSupportedLocale = (locale: string): boolean =>
    SUPPORTED_LOCALES.includes(locale);

const loadTranslation = (locale: string, namespace: string): TranslationEntry | null => {
    const cacheKey = `${locale}:${namespace}`;
    const filePath = path.join(LOCALES_DIR, locale, `${namespace}.json`);

    if (!fs.existsSync(filePath)) {
        return null;
    }

    const stat = fs.statSync(filePath);

    const cached = translationCache.get(cacheKey);
    if (cached && cached.lastModified.getTime() === stat.mtimeMs) {
        return cached;
    }

    try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const etag = `"${crypto.createHash('sha256').update(raw).digest('hex').slice(0, 16)}"`;
        const entry: TranslationEntry = {
            data: JSON.parse(raw) as Record<string, unknown>,
            etag,
            lastModified: stat.mtime,
        };
        translationCache.set(cacheKey, entry);
        return entry;
    } catch {
        return null;
    }
};

export class TranslationController {
    getTranslations = (req: Request, res: Response): void => {
        const { locale, namespace } = req.params as { locale: string; namespace: string };

        if (!isSupportedLocale(locale)) {
            throw new ApiError(
                MESSAGES.TRANSLATION.UNSUPPORTED_LOCALE,
                StatusCodes.BAD_REQUEST
            );
        }

        const entry = loadTranslation(locale, namespace);

        if (!entry) {
            throw new ApiError(
                MESSAGES.TRANSLATION.NAMESPACE_NOT_FOUND,
                StatusCodes.NOT_FOUND
            );
        }

        // Set caching headers before any conditional check
        res.setHeader('ETag', entry.etag);
        res.setHeader('Last-Modified', entry.lastModified.toUTCString());
        res.setHeader('Cache-Control', `public, max-age=${CACHE_MAX_AGE_SECONDS}`);

        // Conditional request: client already has this version
        if (req.headers['if-none-match'] === entry.etag) {
            res.status(StatusCodes.NOT_MODIFIED).end();
            return;
        }

        sendResponse(res, StatusCodes.OK, MESSAGES.TRANSLATION.FETCHED_SUCCESSFULLY, entry.data);
    };

    /**
     * GET /translations/supported-locales
     * Returns the list of supported locale codes.
     */
    getSupportedLocales = (_req: Request, res: Response): void => {
        const locales = SUPPORTED_LOCALES.reduce<Record<string, LocaleMeta>>((acc, code) => {
            if (LOCALE_META[code]) acc[code] = LOCALE_META[code];
            return acc;
        }, {});
        sendResponse(res, StatusCodes.OK, MESSAGES.TRANSLATION.FETCHED_SUCCESSFULLY, { locales });
    };
}

export const translationController = new TranslationController();
