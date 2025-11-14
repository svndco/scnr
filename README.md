# Scnr - Barcode Inventory Manager

A Raycast extension for barcode-based inventory management with Obsidian integration.

## Features

- **Barcode Scanning**: Quickly scan and add items to inventory
- **Batch Scanning**: Scan multiple barcodes and process them as a batch (perfect for receiving shipments or inventory counts)
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
- **Batch Mode**: Press `Cmd+B` to add items to batch mode for scanning multiple items
  - Perfect for receiving shipments or counting inventory
  - Scan continuously without filling in details for each item
  - Process all scanned items at once with bulk operations

### Batch Scan Barcodes
Dedicated batch scanning mode for processing multiple items efficiently:

#### Workflow
1. **Scan Multiple Items**:
   - Press `Cmd+S` to start scanning mode
   - Scan or enter barcodes one after another (just press Enter after each)
   - Items are automatically looked up and added to the batch
   - Press `Cmd+D` when done scanning

2. **Review Batch**:
   - See summary of new vs. existing items
   - View all scanned items with timestamps
   - Remove items from batch if needed
   - Exit batch mode with `Cmd+ESC`

3. **Process Batch** (Press `Cmd+P`):
   - **Add New & Update Existing**: Add new items to inventory and increment quantity for existing ones
   - **Set Location**: Update storage location for all scanned items (existing only)
   - **Add Tags**: Apply tags to all scanned items (existing only)
   - **Adjust Quantity**: Increase or decrease quantity for all items (use negative numbers to decrease)

#### Use Cases
- **Receiving Shipments**: Scan all items from a shipment, set common location and tags, add to inventory in one go
- **Inventory Counts**: Scan items to count, then adjust quantities based on findings
- **Moving Items**: Scan items and update their location in bulk
- **Organizing**: Add tags to multiple items at once

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
