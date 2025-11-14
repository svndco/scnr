import React from "react";
import {
  Action,
  ActionPanel,
  Alert,
  Form,
  Icon,
  List,
  showToast,
  Toast,
  useNavigation,
  confirmAlert,
  Color,
} from "@raycast/api";
import { useState, useEffect } from "react";
import {
  saveInventoryItem,
  findItemByBarcode,
  updateInventoryItem,
  InventoryItem,
  batchUpdateItems,
} from "./utils/obsidian";

interface ScannedItem {
  barcode: string;
  timestamp: Date;
  existing?: InventoryItem;
  isNew: boolean;
}

export default function BatchScanBarcode() {
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [isScanning, setIsScanning] = useState(true);
  const { push, pop } = useNavigation();

  const handleStartScanning = () => {
    push(<ScannerView scannedItems={scannedItems} setScannedItems={setScannedItems} />);
  };

  const handleBatchProcess = () => {
    push(<BatchProcessView scannedItems={scannedItems} onComplete={pop} />);
  };

  const handleClearAll = async () => {
    const confirmed = await confirmAlert({
      title: "Clear All Scanned Items?",
      message: "This will remove all scanned items from the batch. This cannot be undone.",
      primaryAction: {
        title: "Clear All",
        style: Alert.ActionStyle.Destructive,
      },
    });

    if (confirmed) {
      setScannedItems([]);
      showToast({
        style: Toast.Style.Success,
        title: "Batch cleared",
      });
    }
  };

  const handleRemoveItem = (barcode: string) => {
    setScannedItems((items) => items.filter((item) => item.barcode !== barcode));
    showToast({
      style: Toast.Style.Success,
      title: "Item removed from batch",
    });
  };

  const newItemsCount = scannedItems.filter((item) => item.isNew).length;
  const existingItemsCount = scannedItems.length - newItemsCount;

  return (
    <List
      navigationTitle="Batch Scan Barcodes"
      searchBarPlaceholder="Filter scanned items..."
      actions={
        <ActionPanel>
          <Action
            title="Start Scanning"
            icon={Icon.BarCode}
            onAction={handleStartScanning}
            shortcut={{ modifiers: ["cmd"], key: "s" }}
          />
          {scannedItems.length > 0 && (
            <>
              <Action
                title="Process Batch"
                icon={Icon.CheckCircle}
                onAction={handleBatchProcess}
                shortcut={{ modifiers: ["cmd"], key: "p" }}
              />
              <Action
                title="Clear All"
                icon={Icon.Trash}
                style={Action.Style.Destructive}
                onAction={handleClearAll}
                shortcut={{ modifiers: ["cmd"], key: "delete" }}
              />
            </>
          )}
        </ActionPanel>
      }
    >
      {scannedItems.length === 0 ? (
        <List.EmptyView
          title="No Items Scanned"
          description="Press ⌘S to start scanning barcodes"
          icon={Icon.BarCode}
        />
      ) : (
        <>
          <List.Section title="Summary" subtitle={`${scannedItems.length} items scanned`}>
            <List.Item
              title="New Items"
              subtitle={`${newItemsCount} items will be added to inventory`}
              icon={{ source: Icon.Plus, tintColor: Color.Green }}
            />
            <List.Item
              title="Existing Items"
              subtitle={`${existingItemsCount} items already in inventory`}
              icon={{ source: Icon.Checkmark, tintColor: Color.Blue }}
            />
          </List.Section>

          <List.Section title="Scanned Items">
            {scannedItems.map((item, index) => (
              <List.Item
                key={`${item.barcode}-${index}`}
                title={item.existing?.name || item.barcode}
                subtitle={item.barcode}
                accessories={[
                  {
                    tag: item.isNew ? { value: "New", color: Color.Green } : { value: "Existing", color: Color.Blue },
                  },
                  {
                    text: item.existing ? `Qty: ${item.existing.quantity}` : "",
                  },
                  {
                    date: item.timestamp,
                    tooltip: `Scanned at ${item.timestamp.toLocaleTimeString()}`,
                  },
                ]}
                icon={item.isNew ? Icon.Plus : Icon.Checkmark}
                actions={
                  <ActionPanel>
                    <Action
                      title="Remove from Batch"
                      icon={Icon.Trash}
                      style={Action.Style.Destructive}
                      onAction={() => handleRemoveItem(item.barcode)}
                    />
                    <Action
                      title="Start Scanning"
                      icon={Icon.BarCode}
                      onAction={handleStartScanning}
                      shortcut={{ modifiers: ["cmd"], key: "s" }}
                    />
                    {scannedItems.length > 0 && (
                      <Action
                        title="Process Batch"
                        icon={Icon.CheckCircle}
                        onAction={handleBatchProcess}
                        shortcut={{ modifiers: ["cmd"], key: "p" }}
                      />
                    )}
                  </ActionPanel>
                }
              />
            ))}
          </List.Section>
        </>
      )}
    </List>
  );
}

function ScannerView({
  scannedItems,
  setScannedItems,
}: {
  scannedItems: ScannedItem[];
  setScannedItems: React.Dispatch<React.SetStateAction<ScannedItem[]>>;
}) {
  const [barcode, setBarcode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { pop } = useNavigation();

  async function handleScan() {
    if (!barcode.trim()) {
      showToast({
        style: Toast.Style.Failure,
        title: "Enter a barcode",
      });
      return;
    }

    // Check if already in batch
    if (scannedItems.some((item) => item.barcode === barcode)) {
      showToast({
        style: Toast.Style.Failure,
        title: "Already in batch",
        message: `Barcode ${barcode} has already been scanned`,
      });
      setBarcode("");
      return;
    }

    setIsLoading(true);

    try {
      const existingItem = await findItemByBarcode(barcode);

      const newScannedItem: ScannedItem = {
        barcode,
        timestamp: new Date(),
        existing: existingItem || undefined,
        isNew: !existingItem,
      };

      setScannedItems((prev) => [...prev, newScannedItem]);

      showToast({
        style: Toast.Style.Success,
        title: existingItem ? "Existing item added to batch" : "New item added to batch",
        message: existingItem ? existingItem.name : barcode,
      });

      setBarcode("");
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Error scanning barcode",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form
      isLoading={isLoading}
      navigationTitle={`Scanning (${scannedItems.length} items)`}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Add to Batch" icon={Icon.Plus} onSubmit={handleScan} />
          <Action title="Done Scanning" icon={Icon.CheckCircle} onAction={pop} shortcut={{ modifiers: ["cmd"], key: "d" }} />
        </ActionPanel>
      }
    >
      <Form.Description
        title="Batch Scanning Mode"
        text={`${scannedItems.length} items scanned. Scan barcodes and press Enter to add each to the batch.`}
      />
      <Form.TextField
        id="barcode"
        title="Barcode"
        placeholder="Scan or enter barcode, then press Enter"
        value={barcode}
        onChange={setBarcode}
        autoFocus
      />
      <Form.Separator />
      <Form.Description
        title="Recent Scans"
        text={scannedItems
          .slice(-5)
          .reverse()
          .map((item, i) => `${i + 1}. ${item.existing?.name || item.barcode}`)
          .join("\n")}
      />
    </Form>
  );
}

function BatchProcessView({
  scannedItems,
  onComplete,
}: {
  scannedItems: ScannedItem[];
  onComplete: () => void;
}) {
  const [operation, setOperation] = useState<string>("add-update");
  const [quantityChange, setQuantityChange] = useState("1");
  const [location, setLocation] = useState("");
  const [tags, setTags] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { pop } = useNavigation();

  async function handleProcess() {
    setIsLoading(true);

    try {
      const quantityDelta = parseInt(quantityChange || "1", 10);
      let processed = 0;
      let errors = 0;

      for (const scannedItem of scannedItems) {
        try {
          if (operation === "add-update") {
            // Add new items or update existing ones
            if (scannedItem.isNew) {
              // New item - must have a name
              if (!name && !scannedItem.existing?.name) {
                errors++;
                continue;
              }

              const newItem: InventoryItem = {
                barcode: scannedItem.barcode,
                name: name || scannedItem.barcode,
                description,
                quantity: quantityDelta,
                location,
                tags: tags ? tags.split(",").map((t) => t.trim()) : [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };

              await saveInventoryItem(newItem);
            } else if (scannedItem.existing) {
              // Update existing item
              const updatedItem: InventoryItem = {
                ...scannedItem.existing,
                quantity: scannedItem.existing.quantity + quantityDelta,
                location: location || scannedItem.existing.location,
                tags: tags
                  ? tags.split(",").map((t) => t.trim())
                  : scannedItem.existing.tags,
              };

              await updateInventoryItem(updatedItem);
            }
          } else if (operation === "set-location" && scannedItem.existing) {
            // Set location for existing items
            const updatedItem: InventoryItem = {
              ...scannedItem.existing,
              location,
            };
            await updateInventoryItem(updatedItem);
          } else if (operation === "add-tags" && scannedItem.existing) {
            // Add tags to existing items
            const newTags = tags.split(",").map((t) => t.trim());
            const existingTags = scannedItem.existing.tags || [];
            const updatedItem: InventoryItem = {
              ...scannedItem.existing,
              tags: [...new Set([...existingTags, ...newTags])],
            };
            await updateInventoryItem(updatedItem);
          } else if (operation === "adjust-quantity" && scannedItem.existing) {
            // Adjust quantity for existing items
            const updatedItem: InventoryItem = {
              ...scannedItem.existing,
              quantity: Math.max(0, scannedItem.existing.quantity + quantityDelta),
            };
            await updateInventoryItem(updatedItem);
          }

          processed++;
        } catch (error) {
          console.error(`Error processing ${scannedItem.barcode}:`, error);
          errors++;
        }
      }

      showToast({
        style: errors > 0 ? Toast.Style.Failure : Toast.Style.Success,
        title: `Processed ${processed} items`,
        message: errors > 0 ? `${errors} errors occurred` : undefined,
      });

      pop();
      onComplete();
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Batch processing failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const newItemsCount = scannedItems.filter((item) => item.isNew).length;
  const existingItemsCount = scannedItems.length - newItemsCount;

  return (
    <Form
      isLoading={isLoading}
      navigationTitle="Process Batch"
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Process Batch" icon={Icon.CheckCircle} onSubmit={handleProcess} />
          <Action title="Cancel" icon={Icon.XMarkCircle} onAction={pop} shortcut={{ modifiers: ["cmd"], key: "." }} />
        </ActionPanel>
      }
    >
      <Form.Description
        title="Batch Summary"
        text={`Total: ${scannedItems.length} items (${newItemsCount} new, ${existingItemsCount} existing)`}
      />

      <Form.Dropdown id="operation" title="Operation" value={operation} onChange={setOperation}>
        <Form.Dropdown.Item value="add-update" title="Add New & Update Existing" icon={Icon.Plus} />
        <Form.Dropdown.Item value="set-location" title="Set Location (existing only)" icon={Icon.Pin} />
        <Form.Dropdown.Item value="add-tags" title="Add Tags (existing only)" icon={Icon.Tag} />
        <Form.Dropdown.Item value="adjust-quantity" title="Adjust Quantity (existing only)" icon={Icon.HashTag} />
      </Form.Dropdown>

      <Form.Separator />

      {operation === "add-update" && (
        <>
          {newItemsCount > 0 && (
            <>
              <Form.TextField
                id="name"
                title="Name (for new items)"
                placeholder="Leave blank to use barcode as name"
                value={name}
                onChange={setName}
              />
              <Form.TextArea
                id="description"
                title="Description (for new items)"
                placeholder="Optional description"
                value={description}
                onChange={setDescription}
              />
            </>
          )}
          <Form.TextField
            id="quantity"
            title="Quantity to Add"
            placeholder="1"
            value={quantityChange}
            onChange={setQuantityChange}
          />
          <Form.TextField
            id="location"
            title="Location"
            placeholder="Storage location"
            value={location}
            onChange={setLocation}
          />
          <Form.TextField id="tags" title="Tags" placeholder="Comma-separated tags" value={tags} onChange={setTags} />
        </>
      )}

      {operation === "set-location" && (
        <Form.TextField
          id="location"
          title="Location"
          placeholder="Storage location"
          value={location}
          onChange={setLocation}
        />
      )}

      {operation === "add-tags" && (
        <Form.TextField id="tags" title="Tags" placeholder="Comma-separated tags" value={tags} onChange={setTags} />
      )}

      {operation === "adjust-quantity" && (
        <>
          <Form.TextField
            id="quantityChange"
            title="Quantity Change"
            placeholder="Use negative numbers to decrease (e.g., -5)"
            value={quantityChange}
            onChange={setQuantityChange}
          />
          <Form.Description text="Positive numbers add to quantity, negative numbers subtract. Quantity cannot go below 0." />
        </>
      )}
    </Form>
  );
}
