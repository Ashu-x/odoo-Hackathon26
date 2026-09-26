export function operationRow(item) {
    const documentRef = item.document_reference || item.reference_no || `${item.reference_type}-${item.id?.substring(0, 4)}`;
    const type = item.doc_type || item.move_type || "OPERATION";

    const movement = item.product_name
        ? `${item.quantity}x ${item.product_name}`
        : "Multiple items";

    // Reads supplier_name from the receipt join, or customer_name from delivery orders
    const counterparty = item.customer_name || item.supplier_name || "-";
    const status = item.status || "DONE";
    const updated = new Date(item.created_at).toLocaleDateString();

    return { id: item.id, cells: [documentRef, type, movement, counterparty, status, updated] };
}

export function productRow(item) {
    return [
        item.name,
        item.sku,
        item.category_name || "Uncategorized",
        item.unit_of_measure,
        item.available_stock ?? "-",
        item.primary_location ?? "-"
    ];
}