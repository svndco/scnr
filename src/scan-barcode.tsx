import { Action, ActionPanel, Form, showToast, Toast, useNavigation } from "@raycast/api";
import { useState } from "react";
import { saveInventoryItem, findItemByBarcode, updateInventoryItem, InventoryItem } from "./utils/obsidian";

export default function ScanBarcode() {
  const [barcode, setBarcode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [location, setLocation] = useState("");
  const [tags, setTags] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { pop } = useNavigation();

  async function handleSubmit() {
    if (!barcode || !name) {
      showToast({
        style: Toast.Style.Failure,
        title: "Missing required fields",
        message: "Barcode and name are required",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Check if item already exists
      const existingItem = await findItemByBarcode(barcode);

      if (existingItem) {
        // Update existing item quantity
        const updatedItem: InventoryItem = {
          ...existingItem,
          quantity: existingItem.quantity + parseInt(quantity || "1", 10),
          name: name || existingItem.name,
          description: description || existingItem.description,
          location: location || existingItem.location,
          tags: tags ? tags.split(",").map((t) => t.trim()) : existingItem.tags,
        };

        await updateInventoryItem(updatedItem);

        showToast({
          style: Toast.Style.Success,
          title: "Item updated",
          message: `Updated ${updatedItem.name} (${updatedItem.quantity} total)`,
        });
      } else {
        // Create new item
        const newItem: InventoryItem = {
          barcode,
          name,
          description,
          quantity: parseInt(quantity || "1", 10),
          location,
          tags: tags ? tags.split(",").map((t) => t.trim()) : [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await saveInventoryItem(newItem);

        showToast({
          style: Toast.Style.Success,
          title: "Item added",
          message: `Added ${newItem.name} to inventory`,
        });
      }

      pop();
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Error saving item",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function lookupBarcode() {
    if (!barcode) {
      showToast({
        style: Toast.Style.Failure,
        title: "Enter a barcode first",
      });
      return;
    }

    setIsLoading(true);
    const existingItem = await findItemByBarcode(barcode);

    if (existingItem) {
      setName(existingItem.name);
      setDescription(existingItem.description || "");
      setLocation(existingItem.location || "");
      setTags(existingItem.tags?.join(", ") || "");

      showToast({
        style: Toast.Style.Success,
        title: "Item found",
        message: `Found existing item: ${existingItem.name}`,
      });
    } else {
      showToast({
        style: Toast.Style.Animated,
        title: "New item",
        message: "No existing item found with this barcode",
      });
    }

    setIsLoading(false);
  }

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Save Item" onSubmit={handleSubmit} />
          <Action title="Lookup Barcode" onAction={lookupBarcode} shortcut={{ modifiers: ["cmd"], key: "l" }} />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="barcode"
        title="Barcode"
        placeholder="Scan or enter barcode"
        value={barcode}
        onChange={setBarcode}
        autoFocus
      />
      <Form.TextField
        id="name"
        title="Item Name"
        placeholder="Enter item name"
        value={name}
        onChange={setName}
      />
      <Form.TextArea
        id="description"
        title="Description"
        placeholder="Optional description"
        value={description}
        onChange={setDescription}
      />
      <Form.TextField
        id="quantity"
        title="Quantity"
        placeholder="1"
        value={quantity}
        onChange={setQuantity}
      />
      <Form.TextField
        id="location"
        title="Location"
        placeholder="Optional storage location"
        value={location}
        onChange={setLocation}
      />
      <Form.TextField
        id="tags"
        title="Tags"
        placeholder="Comma-separated tags"
        value={tags}
        onChange={setTags}
      />
    </Form>
  );
}
