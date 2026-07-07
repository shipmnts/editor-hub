import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import TemplateEditor from "../TemplateEditor.jsx";
import renderTemplate from "../renderTemplate";

// Shipping-line (ocean Bill of Lading) fields. `label` shows in the {{ dropdown,
// `sample` seeds the default Variables JSON. One source keeps them in sync.
const FIELDS = [
  { id: "bl_number", label: "BL Number", sample: "MBL-HKGNSA-00842" },
  { id: "booking_number", label: "Booking Number", sample: "BKG-556231" },
  { id: "shipper", label: "Shipper", sample: "Commit Pvt Lmt." },
  { id: "consignee", label: "Consignee", sample: "North West Lmt." },
  { id: "notify_party", label: "Notify Party", sample: "Same as Consignee" },
  { id: "shipping_line", label: "Shipping Line", sample: "Maersk Line" },
  { id: "vessel", label: "Vessel", sample: "MAERSK CHENNAI" },
  { id: "voyage_number", label: "Voyage Number", sample: "241W" },
  { id: "port_of_loading", label: "Port of Loading", sample: "Nhava Sheva (INNSA)" },
  { id: "port_of_discharge", label: "Port of Discharge", sample: "Hong Kong (HKHKG)" },
  { id: "place_of_delivery", label: "Place of Delivery", sample: "Hong Kong CY" },
  { id: "container_number", label: "Container Number", sample: "MSKU-7845123" },
  { id: "container_type", label: "Container Type", sample: "1 x 40' HC" },
  { id: "seal_number", label: "Seal Number", sample: "SL-889234" },
  { id: "gross_weight", label: "Gross Weight", sample: "18,450.00 KGS" },
  { id: "measurement", label: "Measurement", sample: "58.000 CBM" },
  { id: "freight_terms", label: "Freight Terms", sample: "FREIGHT PREPAID" },
];

// The variables available to insert in the template ({{ dropdown).
const VARIABLES = FIELDS.reduce((acc, f) => ({ ...acc, [f.id]: f.label }), {});

// Default sample values for the Variables JSON panel.
const SAMPLE_VALUES = FIELDS.reduce(
  (acc, f) => ({ ...acc, [f.id]: f.sample }),
  {},
);

function Demo() {
  const [html, setHtml] = useState("<p>Shipper: </p>");
  const [json, setJson] = useState(JSON.stringify(SAMPLE_VALUES, null, 3));

  let values = {};
  let jsonError = null;
  try {
    values = JSON.parse(json || "{}");
  } catch (e) {
    jsonError = e.message;
  }

  const output = jsonError ? "" : renderTemplate(html, values);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
        padding: 24,
        maxWidth: 900,
        margin: "0 auto",
        fontFamily: "sans-serif",
      }}
    >
      <section>
        <h3>Variables JSON</h3>
        <textarea
          value={json}
          onChange={(e) => setJson(e.target.value)}
          style={{ width: "100%", height: 140, fontFamily: "monospace" }}
        />
        {jsonError && <p style={{ color: "red" }}>Invalid JSON: {jsonError}</p>}
      </section>

      <section>
        <h3>Template (type {"{{"} to insert a variable)</h3>
        <TemplateEditor variables={VARIABLES} value={html} onChange={setHtml} />
      </section>

      <section>
        <h4>Stored template HTML</h4>
        <pre
          style={{
            background: "#f5f5f5",
            padding: 8,
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
            maxHeight: 160,
            overflow: "auto",
          }}
        >
          {html}
        </pre>
      </section>

      <section>
        <h3>Rendered output</h3>
        {/* Wrap in `ql-editor` so Quill's content CSS (indent / align / lists)
            styles the output the same way it looks in the editor. */}
        <div style={{ border: "1px solid #ddd", minHeight: 80 }}>
          <div
            className="ql-editor"
            dangerouslySetInnerHTML={{ __html: output }}
          />
        </div>
      </section>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<Demo />);
