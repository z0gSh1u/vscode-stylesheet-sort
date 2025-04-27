import { sortStylesheet, SortOptions } from '../src/sorter'

describe('sortStylesheet', () => {
  // --- CSS Tests ---
  describe('CSS', () => {
    const lang = 'css'

    it('should sort alphabetically', async () => {
      const input = `a { color: red; border: 1px solid black; background: blue; }`
      const expected = `a { background: blue; border: 1px solid black; color: red; }`
      const options: SortOptions = { order: 'alphabetical', keepOverrides: false }
      await expect(sortStylesheet(input, lang, options)).resolves.toBe(expected)
    })

    it('should sort using SMACSS order', async () => {
      const input = `a { color: red; border: 1px solid black; display: block; background: blue; }`
      const expected = `a { display: block; border: 1px solid black; background: blue; color: red; }`
      const options: SortOptions = { order: 'smacss', keepOverrides: false }
      await expect(sortStylesheet(input, lang, options)).resolves.toBe(expected)
    })

    it('should sort using Concentric CSS order', async () => {
      const input = `a { color: red; border: 1px solid black; width: 100px; position: absolute; background: blue; }`
      const expected = `a { position: absolute; border: 1px solid black; background: blue; width: 100px; color: red; }`
      const options: SortOptions = { order: 'concentric-css', keepOverrides: false }
      await expect(sortStylesheet(input, lang, options)).resolves.toBe(expected)
    })

    it('should keep overrides when keepOverrides is true', async () => {
      const input = `a { animation-name: some; animation: greeting; }`
      const expected = `a { animation-name: some; animation: greeting; }` // Order maintained
      const options: SortOptions = { order: 'alphabetical', keepOverrides: true }
      await expect(sortStylesheet(input, lang, options)).resolves.toBe(expected)
    })

    it('should NOT keep overrides when keepOverrides is false', async () => {
      const input = `a { animation-name: some; animation: greeting; }`
      const expected = `a { animation: greeting; animation-name: some; }` // Alphabetical order
      const options: SortOptions = { order: 'alphabetical', keepOverrides: false }
      await expect(sortStylesheet(input, lang, options)).resolves.toBe(expected)
    })
  })

  // --- SCSS Tests ---
  describe('SCSS', () => {
    const lang = 'scss'

    it('should sort SCSS including nesting (SMACSS)', async () => {
      const input = `
        .parent {
          color: white;
          background: black;
          .child {
            font-size: 1rem;
            display: inline;
          }
          border: 1px dashed pink;
        }`
      const expected = `
        .parent {
          border: 1px dashed pink;
          background: black;
          color: white;
          .child {
            display: inline;
            font-size: 1rem;
          }
        }`
      const options: SortOptions = { order: 'smacss', keepOverrides: false }
      await expect(sortStylesheet(input, lang, options)).resolves.toBe(expected)
    })

    it('should handle SCSS variables and mixins (Alphabetical)', async () => {
      // Note: Sorting doesn't typically affect variable declarations or mixin includes themselves,
      // but it should sort properties *within* rules containing them.
      const input = `
        $primary: blue;
        @mixin flex-center { display: flex; align-items: center; }
        .container {
          color: $primary;
          @include flex-center;
          border: none;
        }`
      const expected = `
        $primary: blue;
        @mixin flex-center { align-items: center; display: flex; }
        .container {
          color: $primary;
          @include flex-center;
          border: none;
        }`
      const options: SortOptions = { order: 'alphabetical', keepOverrides: false }
      await expect(sortStylesheet(input, lang, options)).resolves.toBe(expected)
    })
  })

  // --- Less Tests ---
  describe('Less', () => {
    const lang = 'less'

    it('should sort Less including nesting (Concentric)', async () => {
      const input = `
        .parent {
          color: white;
          background: black;
          .child {
            font-size: 1rem;
            position: relative;
          }
          border: 1px dashed pink;
        }`
      const expected = `
        .parent {
          border: 1px dashed pink;
          background: black;
          color: white;
          .child {
            position: relative;
            font-size: 1rem;
          }
        }`
      const options: SortOptions = { order: 'concentric-css', keepOverrides: false }
      await expect(sortStylesheet(input, lang, options)).resolves.toBe(expected)
    })

    it('should handle Less variables and mixins (Alphabetical)', async () => {
      const input = `
        @primary: blue;
        .flex-center() { display: flex; align-items: center; }
        .container {
          color: @primary;
          .flex-center();
          border: none;
        }`
      const expected = `
        @primary: blue;
        .flex-center() { align-items: center; display: flex; }
        .container {
          color: @primary;
          .flex-center();
          border: none;
        }`
      const options: SortOptions = { order: 'alphabetical', keepOverrides: false }
      await expect(sortStylesheet(input, lang, options)).resolves.toBe(expected)
    })
  })

  // --- Error Handling ---
  describe('Error Handling', () => {
    it('should reject with syntax error for invalid CSS', async () => {
      const input = `a { color: red; border: 1px solid black; background: blue ` // Missing closing brace
      const options: SortOptions = { order: 'alphabetical', keepOverrides: false }
      await expect(sortStylesheet(input, 'css', options)).rejects.toThrow(
        /Syntax error - Unclosed block at line 1, column 1/
      ) // Check for enriched message
    })

    it('should reject with syntax error for invalid SCSS', async () => {
      const input = ` .myClass { color: $unclosedVariable ` // Missing closing brace and potentially invalid var usage
      const options: SortOptions = { order: 'alphabetical', keepOverrides: false }
      await expect(sortStylesheet(input, 'scss', options)).rejects.toThrow(
        /Syntax error - Unclosed block at line 1, column 2/
      )
    })
  })
})
