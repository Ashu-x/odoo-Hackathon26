export function operationRow(item) {
  return [item.reference_no || item.referenceNo || '-', item.doc_type || item.move_type || item.moveType || '-', item.product_name || item.productName || '-', item.from_location_name || item.to_location_name || '-', item.status || '-', item.created_at || item.createdAt || '-'];
}

export function productRow(item) {
  return [item.name, item.sku, item.category_name || item.categoryName || '-', item.unit_of_measure || item.unitOfMeasure || '-', item.total_quantity ?? item.quantity ?? '-', item.location_name || item.warehouse_name || '-'];
}
