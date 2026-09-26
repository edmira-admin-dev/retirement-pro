const authed = (extra: Record<string, unknown> = {}) => ({
  security: [{ bearerAuth: [] }],
  responses: {
    '200': { description: 'OK' },
    '401': { description: 'Unauthorized' },
  },
  ...extra,
})

function op(summary: string, extra: Record<string, unknown> = {}) {
  return authed({ summary, ...extra })
}

export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Retirement Pro API',
    version: '1.0.0',
    description: 'Desi FIRE dashboard backend — retirement planning, holdings, trading journal, signals, and market data.',
  },
  servers: [{ url: '/api/v1' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
  },
  tags: [
    { name: 'Auth' }, { name: 'Holdings' }, { name: 'FIRE' }, { name: 'Health' },
    { name: 'Goals' }, { name: 'Gamification' }, { name: 'Tax' }, { name: 'Net Worth' },
    { name: 'Income' }, { name: 'Expenses' }, { name: 'Preferences' }, { name: 'Trades' },
    { name: 'Signals' }, { name: 'VCP Signals' }, { name: 'Trade Book' }, { name: 'Market' },
    { name: 'Tax P&L' }, { name: 'Equity Holdings' }, { name: 'Mutual Fund Holdings' },
    { name: 'News' }, { name: 'Factor Scorecard' },
  ],
  paths: {
    '/health': { get: { summary: 'API health check', responses: { '200': { description: 'OK' } } } },

    '/auth/register': { post: op('Register', { tags: ['Auth'], security: [] }) },
    '/auth/login': { post: op('Login', { tags: ['Auth'], security: [] }) },
    '/auth/refresh': { post: op('Refresh access token', { tags: ['Auth'], security: [] }) },
    '/auth/logout': { post: op('Logout', { tags: ['Auth'] }) },

    '/holdings': {
      get: op('List holdings', { tags: ['Holdings'] }),
      post: op('Create holding', { tags: ['Holdings'] }),
    },
    '/holdings/{id}': {
      patch: op('Update holding', { tags: ['Holdings'], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }] }),
      delete: op('Delete holding', { tags: ['Holdings'], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }] }),
    },

    '/fire': {
      get: op('Get FIRE profile', { tags: ['FIRE'] }),
      put: op('Upsert FIRE profile', { tags: ['FIRE'] }),
    },

    '/health-profile': {
      get: op('Get health profile', { tags: ['Health'] }),
      put: op('Upsert health profile', { tags: ['Health'] }),
    },
    '/health-profile/score-history': {
      get: op('Get health score history', { tags: ['Health'] }),
      post: op('Save health score', { tags: ['Health'] }),
    },

    '/goals': {
      get: op('List goals', { tags: ['Goals'] }),
      post: op('Create goal', { tags: ['Goals'] }),
    },
    '/goals/{id}': {
      patch: op('Update goal', { tags: ['Goals'], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }] }),
      delete: op('Delete goal', { tags: ['Goals'], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }] }),
    },

    '/gamification': {
      get: op('Get gamification state', { tags: ['Gamification'] }),
      patch: op('Patch gamification state', { tags: ['Gamification'] }),
    },

    '/tax': {
      get: op('Get tax profile', { tags: ['Tax'] }),
      put: op('Upsert tax profile', { tags: ['Tax'] }),
    },

    '/networth/snapshots': { get: op('List net worth snapshots', { tags: ['Net Worth'] }) },

    '/income/summary': { get: op('Income summary', { tags: ['Income'] }) },
    '/income': {
      get: op('List income entries', { tags: ['Income'] }),
      post: op('Create income entry', { tags: ['Income'] }),
    },
    '/income/{id}': {
      patch: op('Update income entry', { tags: ['Income'], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }] }),
      delete: op('Delete income entry', { tags: ['Income'], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }] }),
    },

    '/expenses/summary': { get: op('Expense summary', { tags: ['Expenses'] }) },
    '/expenses': {
      get: op('List expenses', { tags: ['Expenses'] }),
      post: op('Create expense(s)', { tags: ['Expenses'] }),
    },
    '/expenses/{id}': {
      patch: op('Update expense', { tags: ['Expenses'], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }] }),
      delete: op('Delete expense', { tags: ['Expenses'], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }] }),
    },

    '/preferences': {
      get: op('Get preferences', { tags: ['Preferences'] }),
      patch: op('Patch preferences', { tags: ['Preferences'] }),
    },

    '/trades/positions': { get: op('List open positions', { tags: ['Trades'] }) },
    '/trades/pnl': { get: op('Get P&L summary', { tags: ['Trades'] }) },
    '/trades/positions/{symbol}/ltp': {
      patch: op('Update LTP for a position', { tags: ['Trades'], parameters: [{ name: 'symbol', in: 'path', required: true, schema: { type: 'string' } }] }),
    },
    '/trades': {
      get: op('List trades', { tags: ['Trades'] }),
      post: op('Create trade', { tags: ['Trades'] }),
    },
    '/trades/{id}': {
      patch: op('Update trade', { tags: ['Trades'], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }] }),
      delete: op('Delete trade', { tags: ['Trades'], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }] }),
    },

    '/signals/generate': { post: op('Generate trade signals', { tags: ['Signals'] }) },
    '/signals/evaluate': { post: op('Evaluate trade signals', { tags: ['Signals'] }) },
    '/signals/dates': { get: op('List signal run dates', { tags: ['Signals'] }) },
    '/signals/stats': { get: op('Signal stats', { tags: ['Signals'] }) },
    '/signals/{date}': { get: op('Get signals for a date', { tags: ['Signals'], parameters: [{ name: 'date', in: 'path', required: true, schema: { type: 'string' } }] }) },

    '/vcp-signals/generate': { post: op('Generate Minervini VCP signals', { tags: ['VCP Signals'] }) },
    '/vcp-signals/dates': { get: op('List VCP run dates', { tags: ['VCP Signals'] }) },
    '/vcp-signals/{date}': { get: op('Get VCP signals for a date', { tags: ['VCP Signals'], parameters: [{ name: 'date', in: 'path', required: true, schema: { type: 'string' } }] }) },

    '/tradebook/parse': { post: op('Upload & parse tradebook file', { tags: ['Trade Book'] }) },
    '/tradebook/save-batch': { post: op('Save parsed tradebook batch', { tags: ['Trade Book'] }) },
    '/tradebook/trades': { get: op('List tradebook trades', { tags: ['Trade Book'] }) },
    '/tradebook/dividends': { get: op('List dividends', { tags: ['Trade Book'] }) },
    '/tradebook/charges': { get: op('List charges', { tags: ['Trade Book'] }) },
    '/tradebook/holdings': { get: op('List tradebook holdings', { tags: ['Trade Book'] }) },
    '/tradebook/realized-pnl': { get: op('List realized P&L', { tags: ['Trade Book'] }) },
    '/tradebook/dividend-summary': { get: op('Dividend summary', { tags: ['Trade Book'] }) },

    '/market/ltp': { get: op('Get last traded price', { tags: ['Market'] }) },
    '/market/indices': { get: op('Get index quotes', { tags: ['Market'] }) },
    '/market/index-sector-allocation': { get: op('Get index sector allocation', { tags: ['Market'] }) },
    '/market/benchmark-returns': { get: op('Get benchmark returns', { tags: ['Market'] }) },

    '/taxpnl/save': { post: op('Save tax P&L data', { tags: ['Tax P&L'] }) },
    '/taxpnl/data': {
      get: op('Get tax P&L data', { tags: ['Tax P&L'] }),
      delete: op('Delete tax P&L data', { tags: ['Tax P&L'] }),
    },
    '/taxpnl/holdings': { get: op('Get all tax P&L holdings', { tags: ['Tax P&L'] }) },
    '/taxpnl/exited-symbols': { get: op('Get exited symbols', { tags: ['Tax P&L'] }) },
    '/taxpnl/symbol-summary': { get: op('Get symbol summary', { tags: ['Tax P&L'] }) },
    '/taxpnl/brokers': { get: op('List brokers', { tags: ['Tax P&L'] }) },

    '/equity-holdings/parse': { post: op('Upload & parse equity holdings file', { tags: ['Equity Holdings'] }) },
    '/equity-holdings/save-batch': { post: op('Save parsed equity holdings batch', { tags: ['Equity Holdings'] }) },
    '/equity-holdings': { get: op('List equity holdings', { tags: ['Equity Holdings'] }) },
    '/equity-holdings/dates': { get: op('List equity holdings snapshot dates', { tags: ['Equity Holdings'] }) },

    '/mutual-fund-holdings/parse': { post: op('Upload & parse MF holdings file', { tags: ['Mutual Fund Holdings'] }) },
    '/mutual-fund-holdings/save-batch': { post: op('Save parsed MF holdings batch', { tags: ['Mutual Fund Holdings'] }) },
    '/mutual-fund-holdings': { get: op('List MF holdings', { tags: ['Mutual Fund Holdings'] }) },
    '/mutual-fund-holdings/dates': { get: op('List MF holdings snapshot dates', { tags: ['Mutual Fund Holdings'] }) },

    '/news': { get: op('Get news feed', { tags: ['News'] }) },
    '/news/refresh': { post: op('Refresh news feed', { tags: ['News'] }) },

    '/factor-scorecard/upload': { post: op('Upload stock universe file', { tags: ['Factor Scorecard'] }) },
    '/factor-scorecard': { get: op('List uploads', { tags: ['Factor Scorecard'] }) },
    '/factor-scorecard/uploads/{uploadId}': { delete: op('Delete upload', { tags: ['Factor Scorecard'], parameters: [{ name: 'uploadId', in: 'path', required: true, schema: { type: 'string' } }] }) },
    '/factor-scorecard/fundamentals/upload': { post: op('Upload fundamentals file', { tags: ['Factor Scorecard'] }) },
    '/factor-scorecard/fundamentals': { get: op('List fundamentals uploads', { tags: ['Factor Scorecard'] }) },
    '/factor-scorecard/run': { post: op('Start a scorecard run', { tags: ['Factor Scorecard'] }) },
    '/factor-scorecard/runs': { get: op('List scorecard runs', { tags: ['Factor Scorecard'] }) },
    '/factor-scorecard/runs/{runId}': { get: op('Get scorecard run', { tags: ['Factor Scorecard'], parameters: [{ name: 'runId', in: 'path', required: true, schema: { type: 'string' } }] }) },
  },
}
