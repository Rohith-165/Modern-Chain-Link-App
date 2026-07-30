from typing import Dict, Any

def calculate_gst_breakdown(amount: float, gst_rate: float = 18.0) -> Dict[str, float]:
    """Calculates CGST, SGST, and Net Total Amount with GST"""
    gst_amount = amount * (gst_rate / 100.0)
    cgst = gst_amount / 2.0
    sgst = gst_amount / 2.0
    grand_total = amount + gst_amount

    return {
        "subtotal": round(amount, 2),
        "gst_rate": gst_rate,
        "gst_amount": round(gst_amount, 2),
        "cgst": round(cgst, 2),
        "sgst": round(sgst, 2),
        "grand_total": round(grand_total, 2)
    }

def generate_invoice_html(order: Dict[str, Any], company: Dict[str, Any]) -> str:
    """Generates clean HTML invoice representation for printable or PDF exports"""
    gst_info = calculate_gst_breakdown(order.get("total_amount", 0.0))
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Invoice - {order.get("order_id")}</title>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 30px; color: #333; }}
            .header {{ display: flex; justify-content: space-between; border-bottom: 2px solid #0b8f47; padding-bottom: 15px; }}
            .company-title {{ font-size: 24px; font-weight: bold; color: #0b8f47; }}
            .table {{ width: 100%; border-collapse: collapse; margin-top: 20px; }}
            .table th, .table td {{ border: 1px solid #ddd; padding: 10px; text-align: left; }}
            .table th {{ background-color: #f8f9fa; }}
            .total-box {{ margin-top: 20px; float: right; width: 300px; }}
            .total-row {{ display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #eee; }}
            .grand-total {{ font-size: 18px; font-weight: bold; color: #0b8f47; border-top: 2px solid #0b8f47; padding-top: 8px; }}
        </style>
    </head>
    <body>
        <div class="header">
            <div>
                <div class="company-title">{company.get("name", "Modern Chain Link Company")}</div>
                <p>{company.get("address", "Tiruchengode, Tamil Nadu")}<br>GSTIN: {company.get("gst_number", "33AAAAA0000A1Z5")}</p>
            </div>
            <div style="text-align: right;">
                <h2>TAX INVOICE</h2>
                <p><strong>Invoice #:</strong> {order.get("order_id")}<br><strong>Date:</strong> {str(order.get("created_at", ""))[:10]}</p>
            </div>
        </div>

        <div style="margin-top: 20px;">
            <h3>Billed To:</h3>
            <p><strong>{order.get("customer_name")}</strong><br>Phone: {order.get("phone_number")}<br>Address: {order.get("address")}</p>
        </div>

        <table class="table">
            <thead>
                <tr>
                    <th>Item Description</th>
                    <th>Specifications</th>
                    <th>Qty / Area</th>
                    <th>Rate</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Chain Link Fencing Material</td>
                    <td>{order.get("material_type")} - {order.get("diamond_size")} ({order.get("brand")})</td>
                    <td>{order.get("area")} Sq.ft ({order.get("height")}x{order.get("length")} ft)</td>
                    <td>₹{order.get("sqft_price")}/sq.ft</td>
                    <td>₹{order.get("material_cost")}</td>
                </tr>
            </tbody>
        </table>

        <div class="total-box">
            <div class="total-row"><span>Subtotal:</span> <strong>₹{gst_info["subtotal"]}</strong></div>
            <div class="total-row"><span>CGST (9%):</span> <strong>₹{gst_info["cgst"]}</strong></div>
            <div class="total-row"><span>SGST (9%):</span> <strong>₹{gst_info["sgst"]}</strong></div>
            <div class="total-row grand-total"><span>Grand Total:</span> <strong>₹{gst_info["grand_total"]}</strong></div>
            <div class="total-row"><span>Amount Paid:</span> <strong>₹{order.get("amount_paid", 0.0)}</strong></div>
            <div class="total-row" style="color: red;"><span>Balance Due:</span> <strong>₹{order.get("balance_amount", 0.0)}</strong></div>
        </div>
    </body>
    </html>
    """
    return html
