const inDebug = true;

export default {
  /** is in development? */
  inDebug: inDebug,
  /** server root folder */
  root: inDebug ? '' : '',
  /** API Base URL */
  apiBaseURL: inDebug ? 'http://localhost:3006' : '',
};
