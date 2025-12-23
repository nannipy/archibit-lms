import '@testing-library/jest-dom'

describe('Smoke Test', () => {
    it('should pass basic assertion', () => {
        expect(true).toBe(true)
    })

    it('should be running in test environment', () => {
        expect(process.env.NODE_ENV).toBe('test')
    })
})
