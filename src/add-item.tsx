import React from "react";
import { Action, ActionPanel, Form, showToast, Toast, useNavigation } from "@raycast/api";
import { useState } from "react";
import { saveInventoryItem, findItemByBarcode, InventoryItem } from "./utils/obsidian";

export default function AddItem() {
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
        showToast({
          style: Toast.Style.Failure,
          title: "Item already exists",
          message: `An item with barcode ${barcode} already exists`,
        });
        setIsLoading(false);
        return;
      }

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

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Add Item" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="barcode"
        title="Barcode/SKU"
        placeholder="Enter unique barcode or SKU"
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
