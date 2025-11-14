import React from "react";
import { Action, ActionPanel, List, showToast, Toast, Clipboard } from "@raycast/api";
import { useState, useEffect } from "react";
import { getAllInventoryItems, InventoryItem } from "./utils/obsidian";

export default function ExportInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    setIsLoading(true);
    try {
      const allItems = await getAllInventoryItems();
      setItems(allItems);
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Error loading inventory",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function exportAsCSV() {
    if (items.length === 0) {
      showToast({
        style: Toast.Style.Failure,
        title: "No items to export",
      });
      return;
    }

    const headers = ["Barcode", "Name", "Description", "Quantity", "Location", "Tags", "Created", "Updated"];
    const rows = items.map((item) => [
      item.barcode,
      item.name,
      item.description || "",
      item.quantity.toString(),
      item.location || "",
      item.tags?.join(";") || "",
      item.createdAt,
      item.updatedAt,
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

    await Clipboard.copy(csv);
    showToast({
      style: Toast.Style.Success,
      title: "CSV exported to clipboard",
      message: `${items.length} items exported`,
    });
  }

  async function exportAsJSON() {
    if (items.length === 0) {
      showToast({
        style: Toast.Style.Failure,
        title: "No items to export",
      });
      return;
    }

    const json = JSON.stringify(items, null, 2);
    await Clipboard.copy(json);
    showToast({
      style: Toast.Style.Success,
      title: "JSON exported to clipboard",
      message: `${items.length} items exported`,
    });
  }

  async function exportAsMarkdownTable() {
    if (items.length === 0) {
      showToast({
        style: Toast.Style.Failure,
        title: "No items to export",
      });
      return;
    }

    const headers = ["Barcode", "Name", "Quantity", "Location"];
    const separator = headers.map(() => "---");
    const rows = items.map((item) => [
      item.barcode,
      item.name,
      item.quantity.toString(),
      item.location || "-",
    ]);

    const table = [headers, separator, ...rows].map((row) => `| ${row.join(" | ")} |`).join("\n");

    await Clipboard.copy(table);
    showToast({
      style: Toast.Style.Success,
      title: "Markdown table exported to clipboard",
      message: `${items.length} items exported`,
    });
  }

  const totalItems = items.length;
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtitle = `${totalItems} items • ${totalQuantity} total quantity`;

  return (
    <List isLoading={isLoading} navigationTitle="Export Inventory" searchBarPlaceholder="Search items...">
      <List.Section title="Export Options" subtitle={subtitle}>
        <List.Item
          title="Export as CSV"
          subtitle="Copy inventory data as CSV to clipboard"
          actions={
            <ActionPanel>
              <Action title="Export CSV" onAction={exportAsCSV} />
            </ActionPanel>
          }
        />
        <List.Item
          title="Export as JSON"
          subtitle="Copy inventory data as JSON to clipboard"
          actions={
            <ActionPanel>
              <Action title="Export JSON" onAction={exportAsJSON} />
            </ActionPanel>
          }
        />
        <List.Item
          title="Export as Markdown Table"
          subtitle="Copy inventory summary as Markdown table to clipboard"
          actions={
            <ActionPanel>
              <Action title="Export Markdown" onAction={exportAsMarkdownTable} />
            </ActionPanel>
          }
        />
      </List.Section>
    </List>
  );
}
