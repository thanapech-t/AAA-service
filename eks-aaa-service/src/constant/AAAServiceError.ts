type AAAServiceErrorType = {
  code: string;
  message: string;
};

export const ErrorGetUsernameAndEmail: AAAServiceErrorType = {
  code: 'AAA-1001',
  message: 'Unexpected error, cannot get username and email from the API',
};

export const ErrorGetFullUserInfo: AAAServiceErrorType = {
  code: 'AAA-1002',
  message: 'Unexpected error, cannot get full user info from the API',
};

export const ErrorGetUserWithCustomAttr: AAAServiceErrorType = {
  code: 'AAA-1003',
  message:
    'Unexpected error, cannot get username info with custom attributes from the API',
};

export const ErrorGetUserPO: AAAServiceErrorType = {
  code: 'AAA-1004',
  message: 'Unexpected error, cannot get user PO from the API',
};

export const ErrorClearCacheUser: AAAServiceErrorType = {
  code: 'AAA-1005',
  message: 'Unexpected error, cannot clear cache for this user',
};
