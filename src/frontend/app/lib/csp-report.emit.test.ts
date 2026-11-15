// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'

// The module takes its logger when it loads, so the mock has to be in place first. A plain
// function, since mockReset clears vi.fn implementations before each test.
const emitted = vi.hoisted(() => [] as { body: string; attributes: Record<string, unknown> }[])
vi.mock('@opentelemetry/api', () => ({
  logs: {
    getLogger: () => ({
      emit: (record: { body: string; attributes: Record<string, unknown> }) => emitted.push(record),
    }),
  },
  SeverityNumber: { WARN: 13 },
}))

const { emitCspReports } = await import('./csp-report.server')

describe('emitCspReports', () => {
  beforeEach(() => {
    emitted.length = 0
  })

  it('logs each report as a warning with its attributes', () => {
    emitCspReports(
      [
        {
          blockedUri: 'https://evil.test/x.js',
          disposition: 'enforce',
          documentUri: 'https://test.test/',
          effectiveDirective: 'script-src-elem',
          sourceFile: 'https://test.test/app.js',
          lineNumber: 3,
          columnNumber: 9,
          sample: 'alert(1)',
        },
      ],
      'Mozilla/5.0 '.repeat(100),
    )

    expect(emitted).toHaveLength(1)
    expect(emitted[0]).toMatchObject({
      severityNumber: 13,
      severityText: 'WARN',
      body: 'CSP enforce: script-src-elem https://evil.test/x.js on https://test.test/',
      attributes: {
        'event.name': 'csp.violation',
        'csp.source_file': 'https://test.test/app.js',
        'csp.line_number': 3,
        'csp.column_number': 9,
        'csp.sample': 'alert(1)',
      },
    })
    expect(emitted[0]!.attributes['user_agent.original']).toHaveLength(512)
  })

  it('leaves out what a report lacks', () => {
    emitCspReports(
      [{ blockedUri: '', disposition: 'report', documentUri: 'https://test.test/', effectiveDirective: 'img-src' }],
      null,
    )
    expect(emitted[0]!.body).toBe('CSP report: img-src (no URI) on https://test.test/')
    expect(Object.keys(emitted[0]!.attributes)).toEqual([
      'event.name',
      'csp.blocked_uri',
      'csp.disposition',
      'csp.document_uri',
      'csp.effective_directive',
    ])
  })
})
