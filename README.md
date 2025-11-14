# Scnr - Barcode Inventory Manager

A Raycast extension for barcode-based inventory management with Obsidian integration.

## Features

- Scan barcodes to quickly add items to inventory
- Search and manage inventory items
- Integrate with Obsidian vault for markdown-based storage
- Manual item entry support

## Setup

1. Install dependencies: `npm install`
2. Configure your Obsidian vault path in Raycast preferences
3. Run `npm run dev` to develop locally

## Usage

- **Scan Barcode**: Quickly scan and add items to your inventory
- **Search Inventory**: Browse and search existing inventory items
- **Add Item Manually**: Add items without scanning

## Obsidian Integration

Inventory items are stored as markdown files in your Obsidian vault under the configured inventory folder (default: `inventory/`).

Each item is stored with:
- Barcode/SKU
- Name
- Description
- Quantity
- Location
- Tags
- Timestamps
