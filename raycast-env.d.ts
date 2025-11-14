/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Obsidian Vault Path - Path to your Obsidian vault */
  "vaultPath": string,
  /** Inventory Folder - Folder within vault for inventory items (default: inventory) */
  "inventoryFolder": string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `scan-barcode` command */
  export type ScanBarcode = ExtensionPreferences & {}
  /** Preferences accessible in the `search-inventory` command */
  export type SearchInventory = ExtensionPreferences & {}
  /** Preferences accessible in the `add-item` command */
  export type AddItem = ExtensionPreferences & {}
  /** Preferences accessible in the `export-inventory` command */
  export type ExportInventory = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `scan-barcode` command */
  export type ScanBarcode = {}
  /** Arguments passed to the `search-inventory` command */
  export type SearchInventory = {}
  /** Arguments passed to the `add-item` command */
  export type AddItem = {}
  /** Arguments passed to the `export-inventory` command */
  export type ExportInventory = {}
}

