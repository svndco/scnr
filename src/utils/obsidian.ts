import { getPreferenceValues } from "@raycast/api";
import fs from "fs/promises";
import path from "path";

export interface Preferences {
  vaultPath: string;
  inventoryFolder: string;
}

export interface InventoryItem {
  barcode: string;
  name: string;
  description?: string;
  quantity: number;
  location?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Get the full path to the inventory folder
 */
export function getInventoryPath(): string {
  const preferences = getPreferenceValues<Preferences>();
  return path.join(preferences.vaultPath, preferences.inventoryFolder || "inventory");
}

/**
 * Ensure the inventory folder exists
 */
export async function ensureInventoryFolder(): Promise<void> {
  const inventoryPath = getInventoryPath();
  try {
    await fs.access(inventoryPath);
  } catch {
    await fs.mkdir(inventoryPath, { recursive: true });
  }
}

/**
 * Generate a markdown file for an inventory item
 */
export function generateItemMarkdown(item: InventoryItem): string {
  const frontmatter = [
    "---",
    `barcode: "${item.barcode}"`,
    `name: "${item.name}"`,
    `quantity: ${item.quantity}`,
    item.location ? `location: "${item.location}"` : "",
    item.tags && item.tags.length > 0 ? `tags: [${item.tags.map((t) => `"${t}"`).join(", ")}]` : "",
    `created: ${item.createdAt}`,
    `updated: ${item.updatedAt}`,
    "---",
  ]
    .filter(Boolean)
    .join("\n");

  const body = [
    `# ${item.name}`,
    "",
    item.description ? `## Description\n\n${item.description}\n` : "",
    "## Details",
    "",
    `- **Barcode**: ${item.barcode}`,
    `- **Quantity**: ${item.quantity}`,
    item.location ? `- **Location**: ${item.location}` : "",
    "",
    "## History",
    "",
    `- Created: ${new Date(item.createdAt).toLocaleString()}`,
    `- Updated: ${new Date(item.updatedAt).toLocaleString()}`,
  ]
    .filter(Boolean)
    .join("\n");

  return `${frontmatter}\n\n${body}`;
}

/**
 * Save an inventory item to Obsidian vault
 */
export async function saveInventoryItem(item: InventoryItem): Promise<void> {
  await ensureInventoryFolder();
  const inventoryPath = getInventoryPath();

  // Use barcode as filename, sanitized
  const filename = `${item.barcode.replace(/[^a-zA-Z0-9-_]/g, "_")}.md`;
  const filePath = path.join(inventoryPath, filename);

  const markdown = generateItemMarkdown(item);
  await fs.writeFile(filePath, markdown, "utf-8");
}

/**
 * Parse a markdown file to extract inventory item data
 */
export async function parseInventoryItem(filePath: string): Promise<InventoryItem | null> {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

    if (!frontmatterMatch) {
      return null;
    }

    const frontmatter = frontmatterMatch[1];
    const lines = frontmatter.split("\n");
    const data: Record<string, string> = {};

    for (const line of lines) {
      const match = line.match(/^(\w+):\s*(.+)$/);
      if (match) {
        const [, key, value] = match;
        data[key] = value.replace(/^["']|["']$/g, "");
      }
    }

    return {
      barcode: data.barcode || "",
      name: data.name || "",
      quantity: parseInt(data.quantity || "0", 10),
      location: data.location,
      tags: data.tags ? JSON.parse(data.tags.replace(/'/g, '"')) : [],
      createdAt: data.created || new Date().toISOString(),
      updatedAt: data.updated || new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error parsing inventory item:", error);
    return null;
  }
}

/**
 * Get all inventory items from the vault
 */
export async function getAllInventoryItems(): Promise<InventoryItem[]> {
  const inventoryPath = getInventoryPath();
  const items: InventoryItem[] = [];

  try {
    const files = await fs.readdir(inventoryPath);
    const mdFiles = files.filter((f) => f.endsWith(".md"));

    for (const file of mdFiles) {
      const filePath = path.join(inventoryPath, file);
      const item = await parseInventoryItem(filePath);
      if (item) {
        items.push(item);
      }
    }
  } catch (error) {
    // Inventory folder might not exist yet
    console.error("Error reading inventory:", error);
  }

  return items;
}

/**
 * Search inventory items by query
 */
export async function searchInventoryItems(query: string): Promise<InventoryItem[]> {
  const allItems = await getAllInventoryItems();
  const lowerQuery = query.toLowerCase();

  return allItems.filter(
    (item) =>
      item.name.toLowerCase().includes(lowerQuery) ||
      item.barcode.toLowerCase().includes(lowerQuery) ||
      item.description?.toLowerCase().includes(lowerQuery) ||
      item.location?.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Find an inventory item by barcode
 */
export async function findItemByBarcode(barcode: string): Promise<InventoryItem | null> {
  const inventoryPath = getInventoryPath();
  const filename = `${barcode.replace(/[^a-zA-Z0-9-_]/g, "_")}.md`;
  const filePath = path.join(inventoryPath, filename);

  try {
    return await parseInventoryItem(filePath);
  } catch {
    return null;
  }
}

/**
 * Update an existing inventory item
 */
export async function updateInventoryItem(item: InventoryItem): Promise<void> {
  const updatedItem = {
    ...item,
    updatedAt: new Date().toISOString(),
  };
  await saveInventoryItem(updatedItem);
}

/**
 * Batch update multiple inventory items
 */
export async function batchUpdateItems(items: InventoryItem[]): Promise<{ success: number; errors: number }> {
  let success = 0;
  let errors = 0;

  for (const item of items) {
    try {
      await updateInventoryItem(item);
      success++;
    } catch (error) {
      console.error(`Error updating item ${item.barcode}:`, error);
      errors++;
    }
  }

  return { success, errors };
}

/**
 * Delete an inventory item by barcode
 */
export async function deleteInventoryItem(barcode: string): Promise<void> {
  const inventoryPath = getInventoryPath();
  const filename = `${barcode.replace(/[^a-zA-Z0-9-_]/g, "_")}.md`;
  const filePath = path.join(inventoryPath, filename);

  try {
    await fs.unlink(filePath);
  } catch (error) {
    throw new Error(`Failed to delete item: ${error}`);
  }
}
