# Scnr - Barcode Inventory Manager

A Raycast extension for barcode-based inventory management with Obsidian integration.

## Features

- **Barcode Scanning**: Quickly scan and add items to inventory
- **Smart Updates**: Automatically updates quantity for existing items
- **Search & Browse**: Fast search through your entire inventory
- **Quantity Management**: Quick increment/decrement controls (+1, -1, +10, -10)
- **Export Options**: Export inventory as CSV, JSON, or Markdown tables
- **Obsidian Integration**: Direct file-based integration with Obsidian vaults
- **Manual Entry**: Add items without scanning

## Setup

### Installation

1. Clone this repository or download the extension
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the extension:
   ```bash
   npm run build
   ```
4. Import into Raycast (or run `npm run dev` for development)

### Configuration

Open Raycast preferences for Scnr and configure:

- **Obsidian Vault Path**: Full path to your Obsidian vault (e.g., `/Users/yourname/Documents/MyVault`)
- **Inventory Folder**: Folder within vault for inventory items (default: `inventory`)

## Commands

### Scan Barcode
- Type or paste barcodes to add items
- Auto-detects existing items and adds to quantity
- Press `Cmd+L` to lookup existing item by barcode
- Fill in item details: name, description, quantity, location, tags

### Search Inventory
- Browse and search all inventory items
- View item details at a glance
- Quick actions:
  - `Cmd +` / `Cmd -`: Adjust quantity by 1
  - `Cmd Shift +` / `Cmd Shift -`: Adjust quantity by 10
  - `Cmd B`: Copy barcode
  - `Cmd C`: Copy full item details

### Add Item Manually
- Add new items without scanning
- Prevents duplicate barcodes
- Perfect for items without barcodes (use SKU or custom ID)

### Export Inventory
- Export as CSV for spreadsheet apps
- Export as JSON for data processing
- Export as Markdown table for documentation
- All exports copied to clipboard

## Obsidian Integration

Inventory items are stored as markdown files in your Obsidian vault under the configured inventory folder (default: `inventory/`).

### File Format

Each item is stored as a markdown file with YAML frontmatter:

```markdown
---
barcode: "123456789"
name: "Example Item"
quantity: 10
location: "Shelf A"
tags: ["electronics", "supplies"]
created: 2025-11-14T12:00:00.000Z
updated: 2025-11-14T12:30:00.000Z
---

# Example Item

## Description

This is an example inventory item.

## Details

- **Barcode**: 123456789
- **Quantity**: 10
- **Location**: Shelf A

## History

- Created: 11/14/2025, 12:00:00 PM
- Updated: 11/14/2025, 12:30:00 PM
```

### Benefits of Direct File Access

- ✅ No additional plugins required
- ✅ Works with any Obsidian vault
- ✅ Files fully compatible with Obsidian
- ✅ Easy to backup and sync
- ✅ Can be edited directly in Obsidian
- ✅ Version control friendly (git)

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Fix linting issues
npm run fix-lint
```

## License

MIT
