const inDebug = true;

export default {
  /** is in development? */
  inDebug: inDebug,
  /** server root folder */
  root: inDebug ? '' : '',
  /** SITE Base URL */
  siteBaseURL: inDebug ? 'http://localhost:8000' : '',
  /** API Base URL */
  apiBaseURL: inDebug ? 'http://localhost:3006/' : '',
};
