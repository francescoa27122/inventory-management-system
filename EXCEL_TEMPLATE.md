# Sample Excel Import Template

Create an Excel file with these columns to import your inventory:

## Required Columns:
- Item Name
- Quantity
- Unit Price

## Optional Columns:
- Description
- Category
- Supplier
- Location
- SKU

## Example Data:

| Item Name | Quantity | Unit Price | Category | Supplier | Location |
|-----------|----------|------------|----------|----------|----------|
| Steel Pipe 2" | 150 | 12.50 | Plumbing | ABC Supply | Warehouse A |
| Copper Wire 12AWG | 500 | 0.85 | Electrical | Electric Co | Warehouse B |
| Wood Plank 2x4x8 | 300 | 8.99 | Lumber | Lumber Yard | Warehouse A |
| PVC Pipe 1.5" | 200 | 6.75 | Plumbing | ABC Supply | Warehouse A |
| LED Bulb 60W | 100 | 4.50 | Electrical | Electric Co | Warehouse C |

## Tips:

1. **Column names are flexible** - the system accepts variations like:
   - "Item Name", "item_name", "Name", or "name"
   - "Unit Price", "unit_price", "Price", or "price"
   - "Quantity", "quantity", "Qty", or "qty"

2. **Save as .xlsx or .csv** - both formats are supported

3. **Keep file size under 10MB**

4. **Use numeric values** for Quantity and Unit Price (no $ symbols)

5. **Leave optional columns blank** if you don't have the data

## Creating Your Excel File:

1. Open Microsoft Excel, Google Sheets, or any spreadsheet software
2. Create the column headers in the first row
3. Add your inventory data in the rows below
4. Save as .xlsx or .csv format
5. Import through the Inventory page in the application
