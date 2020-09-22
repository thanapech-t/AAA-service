type PxAccessKeyErrorType = {
    code: string;
    message: string;
};

export const PxAccessKeyError: PxAccessKeyErrorType = {
    code: 'C-1001',
    message: 'You are not authorized to use this API.',
};
