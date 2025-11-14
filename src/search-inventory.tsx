import React from "react";
import { Action, ActionPanel, List, showToast, Toast, Icon, Color } from "@raycast/api";
import { useEffect, useState } from "react";
import { getAllInventoryItems, searchInventoryItems, updateInventoryItem, InventoryItem } from "./utils/obsidian";

export default function SearchInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

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

  async function handleSearch(query: string) {
    setSearchText(query);
    if (!query) {
      await loadItems();
      return;
    }

    setIsLoading(true);
    try {
      const results = await searchInventoryItems(query);
      setItems(results);
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Error searching",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function adjustQuantity(item: InventoryItem, delta: number) {
    const newQuantity = Math.max(0, item.quantity + delta);
    const updatedItem = { ...item, quantity: newQuantity };

    try {
      await updateInventoryItem(updatedItem);
      showToast({
        style: Toast.Style.Success,
        title: "Quantity updated",
        message: `${item.name}: ${newQuantity}`,
      });
      await loadItems();
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Error updating quantity",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return (
    <List isLoading={isLoading} onSearchTextChange={handleSearch} searchBarPlaceholder="Search inventory...">
      {items.map((item) => (
        <List.Item
          key={item.barcode}
          title={item.name}
          subtitle={item.description}
          accessories={[
            { text: `Qty: ${item.quantity}` },
            item.location ? { text: item.location, icon: Icon.Pin } : {},
          ]}
          actions={
            <ActionPanel>
              <ActionPanel.Section title="Quantity">
                <Action
                  title="Increase Quantity (+1)"
                  icon={Icon.Plus}
                  onAction={() => adjustQuantity(item, 1)}
                  shortcut={{ modifiers: ["cmd"], key: "+" }}
                />
                <Action
                  title="Decrease Quantity (-1)"
                  icon={Icon.Minus}
                  onAction={() => adjustQuantity(item, -1)}
                  shortcut={{ modifiers: ["cmd"], key: "-" }}
                />
                <Action
                  title="Increase Quantity (+10)"
                  icon={Icon.PlusCircle}
                  onAction={() => adjustQuantity(item, 10)}
                  shortcut={{ modifiers: ["cmd", "shift"], key: "+" }}
                />
                <Action
                  title="Decrease Quantity (-10)"
                  icon={Icon.MinusCircle}
                  onAction={() => adjustQuantity(item, -10)}
                  shortcut={{ modifiers: ["cmd", "shift"], key: "-" }}
                />
              </ActionPanel.Section>
              <ActionPanel.Section title="Details">
                <Action.CopyToClipboard
                  title="Copy Barcode"
                  content={item.barcode}
                  shortcut={{ modifiers: ["cmd"], key: "b" }}
                />
                <Action.CopyToClipboard
                  title="Copy Details"
                  content={`${item.name}\nBarcode: ${item.barcode}\nQuantity: ${item.quantity}\n${item.location ? `Location: ${item.location}` : ""}`}
                  shortcut={{ modifiers: ["cmd"], key: "c" }}
                />
              </ActionPanel.Section>
              <ActionPanel.Section>
                <Action title="Refresh" icon={Icon.ArrowClockwise} onAction={loadItems} />
              </ActionPanel.Section>
            </ActionPanel>
          }
        />
      ))}
      {!isLoading && items.length === 0 && (
        <List.EmptyView
          title={searchText ? "No items found" : "No inventory items"}
          description={searchText ? "Try a different search query" : "Scan a barcode to add your first item"}
          icon={Icon.MagnifyingGlass}
        />
      )}
    </List>
  );
}
