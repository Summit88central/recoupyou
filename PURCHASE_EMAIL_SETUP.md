# Purchase Email Template Setup

## EmailJS Configuration

Your purchase email system is configured to use:
- **Service ID**: `service_rbfh6tm`
- **Template ID**: `template_5143ugq`

## Template Variables

When setting up your EmailJS template (`template_5143ugq`), use these variables:

### Basic Information
- `{{to_email}}` - Customer's email address
- `{{customer_name}}` - Customer's full name (First + Last)
- `{{from_name}}` - "RecoupYou Fitness"
- `{{subject}}` - "Your Fitness Guides - Download Links"

### Purchase Details
- `{{payment_reference}}` - Payment reference number
- `{{total_amount}}` - Total amount in ZAR format (e.g., "R 150,00")

### Conditional Sections
- `{{has_guides}}` - Boolean: true if customer bought individual guides
- `{{has_bundles}}` - Boolean: true if customer bought bundles

### Individual Guides (Array)
If `{{has_guides}}` is true, loop through `{{guides}}`:
- `{{title}}` - Guide title
- `{{description}}` - Guide description
- `{{quantity}}` - Quantity purchased
- `{{download_url}}` - Download link

### Bundles (Array)
If `{{has_bundles}}` is true, loop through `{{bundles}}`:
- `{{name}}` - Bundle name
- `{{quantity}}` - Quantity purchased
- `{{guide1_title}}` - First guide title
- `{{guide1_download_url}}` - First guide download link
- `{{guide2_title}}` - Second guide title
- `{{guide2_download_url}}` - Second guide download link

## HTML Template Structure

You can use the HTML template from `email-templates/purchase-template.html` as a reference for your EmailJS template. The template includes:

1. **Header Section**: RecoupYou branding
2. **Individual Guides Section**: Shows when `has_guides` is true
3. **Bundles Section**: Shows when `has_bundles` is true
4. **Payment Information**: Reference and total amount
5. **Support Information**: Contact details and help
6. **Footer**: Company information

## Example EmailJS Template Syntax

For EmailJS, you would use this syntax in your template:

```html
<h1>Dear {{customer_name}},</h1>

{{#if has_guides}}
<h3>Individual Guides</h3>
{{#each guides}}
  <div>
    <h4>{{title}} (Qty: {{quantity}})</h4>
    <p>{{description}}</p>
    <a href="{{download_url}}">Download</a>
  </div>
{{/each}}
{{/if}}

{{#if has_bundles}}
<h3>Bundles</h3>
{{#each bundles}}
  <div>
    <h4>{{name}} (Qty: {{quantity}})</h4>
    <a href="{{guide1_download_url}}">{{guide1_title}}</a>
    <a href="{{guide2_download_url}}">{{guide2_title}}</a>
  </div>
{{/each}}
{{/if}}

<p>Payment Reference: {{payment_reference}}</p>
<p>Total: {{total_amount}}</p>
```

## 🚨 Action Required

You need to **enable server-side API calls** in your EmailJS account security settings:

### Steps to Fix:
1. **Go to your EmailJS dashboard**: https://www.emailjs.com/
2. **Navigate to Account** → **Security**
3. **Check the box**: "Allow EmailJS API for non-browser applications"
4. **Ensure enabled**: "Use Private Key (recommended)"
5. **Save the changes**

### Why This is Needed:
- EmailJS blocks all non-browser applications by default as a security measure
- Even with a private key, this setting must be explicitly enabled
- This is separate from your service configuration

## Testing

To test the email system:
1. Make a purchase through the checkout process
2. Check that the email is sent with your template
3. Verify all download links work correctly
4. Ensure the ZAR currency formatting displays properly

## Files Modified

- `app/api/send-guides/route.ts` - Updated to use your service and template IDs
- `email-templates/purchase-template.html` - New HTML template reference
- Purchase email now uses proper ZAR currency formatting