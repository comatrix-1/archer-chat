import type { RequestMetadata } from '@project/lib/universal/extract-request-metadata';

export type HonoAuthContext = {
    Variables: {
        requestMetadata: RequestMetadata;
    };
};