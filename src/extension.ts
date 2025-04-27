// vscode-stylesheet-sort
// by z0gSh1u @ 2025-04
// github.com/z0gSh1u/vscode-stylesheet-sort

import * as vscode from 'vscode'
import { sortStylesheet, SortOptions } from './sorter'

// Define supported language IDs
const SUPPORTED_LANGUAGE_IDS = ['css', 'scss', 'less']

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "vscode-stylesheet-sort" is now active!')

  let disposable = vscode.commands.registerCommand('stylesheet-sort.sort', async () => {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
      vscode.window.showWarningMessage('No active editor found.')
      return // No open text editor
    }

    const document = editor.document

    // Check if the language is supported
    if (!SUPPORTED_LANGUAGE_IDS.includes(document.languageId)) {
      vscode.window.showWarningMessage(
        `Sorting is only supported for CSS, SCSS, and Less files. Current language: ${document.languageId}`
      )
      return
    }

    const originalText = document.getText()

    // Get configuration
    const config = vscode.workspace.getConfiguration('stylesheetSort')
    const sortOrder = config.get<string>('order') || 'alphabetical'
    const keepOverrides = config.get<boolean>('keepOverrides') || false

    // Prepare options for the sorter function
    const sorterOptions: SortOptions = {
      order: sortOrder as SortOptions['order'], // Cast to the specific type from SortOptions
      keepOverrides: keepOverrides
    }

    try {
      // Call the isolated sorting logic
      const sortedText = await sortStylesheet(originalText, document.languageId, sorterOptions)

      if (originalText === sortedText) {
        vscode.window.showInformationMessage(
          `Declarations are already sorted in ${sortOrder} order.`
        )
        return
      }

      // Apply the edit to the document
      const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(originalText.length)
      )

      const success = await editor.edit(editBuilder => {
        editBuilder.replace(fullRange, sortedText)
      })

      if (success) {
        vscode.window.showInformationMessage(
          `Declarations in ${document.languageId} file are sorted successfully in ${sortOrder} order.`
        )
      }
    } catch (error: any) {
      // Handle errors from the sorter function
      console.error(`Error sorting ${document.languageId} stylesheet:`, error)
      vscode.window.showErrorMessage(
        `Failed to sort ${document.languageId} declarations: ${
          error?.message || 'Unknown processing error'
        }`
      )
    }
  })

  context.subscriptions.push(disposable)
}

export function deactivate() {}
