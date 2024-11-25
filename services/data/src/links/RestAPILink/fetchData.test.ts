import { FetchError } from '../../engine'
import { parseStatus, fetchData, parseContentType } from './fetchData'

describe('networkFetch', () => {
    describe('parseContentType', () => {
        it('should pass through simple content-types', () => {
            expect(parseContentType('text/html')).toBe('text/html')
            expect(parseContentType('text/plain')).toBe('text/plain')
            expect(parseContentType('application/vnd.api+json')).toBe(
                'application/vnd.api+json'
            )
            expect(parseContentType('application/vnd.geo+json')).toBe(
                'application/vnd.geo+json'
            )
            expect(parseContentType('application/geo+json')).toBe(
                'application/geo+json'
            )
        })

        it('should strip parameters', () => {
            expect(parseContentType('text/svg+xml;charset=utf-8')).toBe(
                'text/svg+xml'
            )
            expect(parseContentType('text/html;testing123')).toBe('text/html')
        })

        it('should trim type', () => {
            expect(parseContentType('   text/xml ')).toBe('text/xml')
            expect(
                parseContentType(' application/json ; charset = utf-8')
            ).toBe('application/json')
        })

        it('should convert to lower-case', () => {
            expect(parseContentType('  Text/XML ')).toBe('text/xml')
            expect(parseContentType('application/JSON ; charset = UTF-8')).toBe(
                'application/json'
            )
        })

        it('should correctly parse application/json with charset param', () => {
            expect(parseContentType('application/json;charset=UTF-8')).toBe(
                'application/json'
            )
        })
    })

    describe('parseStatus', () => {
        it('should pass through the response for a success status code', async () => {
            const response: any = {
                status: 200,
            }
            await expect(parseStatus(response)).resolves.toBe(response)
        })

        it('should throw an access error for 401, 403 and 409 errors', async () => {
            const response401: any = {
                status: 401,
                json: async () => {
                    throw new Error()
                },
            }
            const response403: any = {
                status: 403,
                json: async () => {
                    throw new Error()
                },
            }
            const response409: any = {
                status: 409,
                json: async () => ({
                    message: 'An error occurred',
                }),
            }

            expect(parseStatus(response401)).rejects.toMatchObject({
                type: 'access',
                message: 'Unauthorized',
                details: {},
            })

            expect(parseStatus(response403)).rejects.toMatchObject({
                type: 'access',
                message: 'Forbidden',
                details: {},
            })

            expect(parseStatus(response409)).rejects.toMatchObject({
                type: 'access',
                message: 'An error occurred',
                details: {
                    message: 'An error occurred',
                },
            })
        })

        it('should throw if an unknown error occurs', () => {
            const response: any = {
                status: 500,
                statusText: 'Failed',
                json: async () => ({
                    message: 'An error occurred',
                }),
            }
            expect(parseStatus(response)).rejects.toMatchObject({
                type: 'unknown',
                message: `An unknown error occurred - Failed (500)`,
                details: {
                    message: 'An error occurred',
                },
            })
        })
    })

    describe('fetchData', () => {
        const headers: Record<string, (type: string) => string> = {
            'Content-Type': (type) =>
                type === 'json'
                    ? 'application/json'
                    : type === 'text'
                    ? 'text/plain'
                    : 'some/other-content-type',
        }
        const mockFetch = jest.fn(async (url) => ({
            status: 200,
            headers: {
                get: (name: string) => headers[name] && headers[name](url),
            },
            json: async () => ({ foo: 'bar' }),
            'geo+json': async () => ({ foo: 'geobar' }),
            'vnd.geo+json': async () => ({ foo: 'vndgeobar' }),
            text: async () => 'foobar',
            blob: async () => 'blob of foobar',
        }))
        beforeEach(() => {
            jest.clearAllMocks()
        })

        it('Should correctly parse a successful JSON response', () => {
            ;(global as any).fetch = mockFetch
            expect(fetchData('json', {})).resolves.toMatchObject({
                foo: 'bar',
            })
        })

        it('Should correctly parse a successful GEOJSON response', () => {
            ;(global as any).fetch = mockFetch
            expect(fetchData('geo+json', {})).resolves.toMatchObject({
                foo: 'geobar',
            })
        })

        it('Should correctly parse a successful VND.GEOJSON response', () => {
            ;(global as any).fetch = mockFetch
            expect(fetchData('vnd.geo+json', {})).resolves.toMatchObject({
                foo: 'bar',
            })
        })

        it('Should correctly parse a successful TEXT response', () => {
            ;(global as any).fetch = mockFetch
            expect(fetchData('text')).resolves.toBe('foobar')
        })

        it('Should correctly parse a successful BLOB response', () => {
            ;(global as any).fetch = mockFetch
            expect(fetchData('something else')).resolves.toBe('blob of foobar')
        })

        it('Should throw a FetchError if fetch fails', () => {
            ;(global as any).fetch = jest.fn(async () => {
                throw new Error()
            })

            expect(fetchData('failure', {})).rejects.toBeInstanceOf(FetchError)
        })
    })
})
