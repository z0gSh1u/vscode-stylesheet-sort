// CSS, SCSS, Less property declaration sorter
// based on css-declaration-sorter

import postcss from 'postcss'
import postcssScss from 'postcss-scss'
import postcssLess from 'postcss-less'
import cssDeclarationSorter from 'css-declaration-sorter'

// Define the expected type for the sort order option
type SortOrderOption = 'alphabetical' | 'smacss' | 'concentric-css'

export interface SortOptions {
  order: SortOrderOption
  keepOverrides: boolean
}

export async function sortStylesheet(
  text: string,
  languageId: string,
  options: SortOptions
): Promise<string> {
  // Determine PostCSS syntax based on language ID
  let syntax
  switch (languageId) {
    case 'scss':
      syntax = postcssScss
      break
    case 'less':
      syntax = postcssLess
      break
    default: // css
      syntax = undefined // Use default PostCSS parser
  }

  try {
    const result = await postcss([cssDeclarationSorter(options)]).process(text, {
      from: undefined,
      syntax: syntax
    })
    return result.css
  } catch (error: any) {
    // Re-throw the error to be handled by the caller (extension.ts)
    console.error(`Error during PostCSS processing for ${languageId}:`, error)
    // Enrich the error slightly for better context if it's a syntax error
    if (error.name === 'CssSyntaxError') {
      error.message = `Syntax error - ${error.reason} at line ${error.line}, column ${error.column}`
    }
    throw error
  }
}
