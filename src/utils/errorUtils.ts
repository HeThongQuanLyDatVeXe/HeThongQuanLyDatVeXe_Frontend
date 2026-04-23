type ApiErrorShape = {
    response?: {
        data?: {
            code?: number;
        };
    };
};

export const getApiErrorCode = (error: unknown): number | undefined => {
    if (!error || typeof error !== 'object') {
        return undefined;
    }

    const maybeApiError = error as ApiErrorShape;
    return maybeApiError.response?.data?.code;
};
