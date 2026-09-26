// frontend/src/data/adapters.js

export function operationRow(item) {
    // Handles both generic dashboard operations and detailed stock moves
    const documentRef = item.reference_no || `${item.reference_type}-${item.id?.substring(0, 4)}`;
    const type = item.doc_type || item.move_type || "OPERATION";

    // If it's a specific stock move, show the product. Otherwise, indicate a document.
    const movement = item.product_name
        ? `${item.quantity}x ${item.product_name}`
        : "Multiple items";

    const counterparty = item.customer_name || item.supplier_id || "-";
    const status = item.status || "DONE"; // Stock moves are implicitly done
    const updated = new Date(item.created_at).toLocaleDateString();

    return [documentRef, type, movement, counterparty, status, updated];
}

export function productRow(item) {
    return [
        item.name,
        item.sku,
        item.category_name || "Uncategorized",
        item.unit_of_measure,
        item.available_stock ?? "-", // Note: Backend listProducts needs to join product_stock to populate this
        item.primary_location ?? "-"
    ];
}