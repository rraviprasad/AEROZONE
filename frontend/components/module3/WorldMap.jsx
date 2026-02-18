import React, { useMemo } from "react";
import Highcharts from "highcharts/highmaps";
import HighchartsReact from "highcharts-react-official";
import worldMap from "@highcharts/map-collection/custom/world.geo.json";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";

countries.registerLocale(enLocale);

/* ---------------------------------------
   Extract Material from Type
--------------------------------------- */
const extractMaterial = (type = "") => {
  const t = type.toUpperCase();
  if (t.includes("SS")) return "SS";
  if (t.includes("NI")) return "NI";
  if (t.includes("TI")) return "TI";
  if (t.includes("AL")) return "AL";
  if (t.includes("COBALT")) return "COBALT";
  return "OTHER";
};

/* ---------------------------------------
   Aggregate Country-Level Data
--------------------------------------- */
const calculateCountryData = (rows) => {
  const map = {};
  let grandTotalValue = 0;

  rows.forEach((row) => {
    const country = row.Country;
    if (!country) return;

    const qty = Number(row.OrderedLineQuantity) || 0;
    const value = Number(row.OrderLineValue) || 0;
    const type = row.Type || "";
    const material = extractMaterial(type);
    const customer = row.CustomerName;
    const supplier = row.SupplierName;

    if (!map[country]) {
      map[country] = {
        country,
        totalValue: 0,
        totalQtyEA: 0,
        totalQtyKG: 0,
        customers: new Set(),
        suppliers: new Set(),
        materials: {},
        types: {},
      };
    }

    // Totals
    map[country].totalValue += value;
    grandTotalValue += value;

   const rawUom = (row.UOM || "").toUpperCase().trim();
const uom =
  rawUom.includes("KG") ? "KG" :
  rawUom.includes("EA") || rawUom.includes("NO") || rawUom.includes("EACH")
    ? "EA"
    : "OTHER";

if (uom === "EA") map[country].totalQtyEA += qty;
if (uom === "KG") map[country].totalQtyKG += qty;
    // Customers
    if (customer) map[country].customers.add(customer);
    // Suppliers
   
if (supplier) {
  map[country].suppliers.add(
    supplier.trim().replace(/\s+/g, " ")
  );
}


    // Materials
    map[country].materials[material] =
      (map[country].materials[material] || 0) + qty;

    // Types
    if (type) {
      map[country].types[type] =
        (map[country].types[type] || 0) + qty;
    }
  });

  return Object.values(map).map((item) => ({
    ...item,
    customers: Array.from(item.customers),
    suppliers: Array.from(item.suppliers),
    percentage:
      grandTotalValue === 0
        ? 0
        : Math.round((item.totalValue / grandTotalValue) * 100),
  }));
  

};

/* ---------------------------------------
   World Map Component
--------------------------------------- */
const WorldMap = ({ rows = [] }) => {
  const mapData = useMemo(() => {
    const processed = calculateCountryData(rows);

    return processed
      .map((item) => {
        const iso2 = countries.getAlpha2Code(item.country, "en");
        if (!iso2) return null;

        return {
          "hc-key": iso2.toLowerCase(),
          value: item.percentage,
          data: item,
        };
      })
      .filter(Boolean);
  }, [rows]);

 const options = {
  title: {
    text: null, // 🔥 removes "Chart title"
  },

  legend: {
    enabled: false, // 🔥 removes purple dot + "Global Distribution"
  },

  chart: {
    map: worldMap,
    height: 170,
    backgroundColor: "transparent",

    events: {
      load: function () {
        this.selectedPoint = null;
      },

      click: function () {
        if (this.selectedPoint) {
          this.tooltip.hide();
          this.selectedPoint = null;
        }
      },
    },
  },

  mapNavigation: {
    enabled: true,
    enableMouseWheelZoom: true,
    enableButtons: false,
  },

  tooltip: {
    useHTML: true,
     backgroundColor: "transparent", // ✅ removes white box
  borderWidth: 0,                  // ✅ removes border
  borderRadius: 0,
  shadow: false,                   // ✅ no shadow
  padding: 0,                      // ✅ remove spacing
  outside: false,
  followPointer: false,

    style: {
      fontSize: "11px",
      zIndex: 10,
      pointerEvents: "auto",
    },

    formatter: function () {
      const chart = this.series.chart;
      if (chart.selectedPoint && chart.selectedPoint !== this.point) {
        return "";
      }

      const d = this.point.data;
      if (!d) return "";

      const projects = d.customers.join(", ");
      const materials = Object.keys(d.materials).join(", ");
      const types = Object.keys(d.types).join(", ");
      const suppliers = d.suppliers ? d.suppliers.join(", ") : "";

      return `
        <div style="
          width:230px;
          max-height:140px;
          overflow-y:auto;
          background:#111827;
          pointer-events:auto;
          color:#e5e7eb;
          padding:8px;
          border-radius:6px;
          line-height:1.35;
        ">
          <div style="font-weight:600;font-size:12px;margin-bottom:4px">
            ${d.country}
          </div>

          <div style="border-top:1px solid #374151;margin:4px 0"></div>

          <div style="word-break:break-word;white-space:normal">
            <b>Projects</b> : ${projects || "-"}
          </div>
         <div style="word-break:break-word;white-space:normal">
  <b>Suppliers</b> : ${suppliers || "-"}
</div>


          <div><b>Value</b> : ${d.totalValue.toFixed(2)}</div>
          <div>
            <b>Qty</b> :
            ${d.totalQtyEA} EA
            ${d.totalQtyKG ? ` | ${d.totalQtyKG} KG` : ""}
          </div>
          <div><b>Material</b> : ${materials || "-"}</div>
          <div style="word-break:break-word;white-space:normal">
            <b>Type</b> : ${types || "-"}
          </div>
        </div>
      `;
    },
  },

  series: [
    {
      name: "",
      data: mapData,
      joinBy: "hc-key",
      

      color: "#9333ea",
      nullColor: "#374151",
      borderColor: "#4b5563",
      borderWidth: 0.5,

      enableMouseTracking: true,

      point: {
        events: {
          click: function () {
            const chart = this.series.chart;

            if (chart.selectedPoint === this) {
              chart.tooltip.hide();
              chart.selectedPoint = null;
              return;
            }

            chart.tooltip.refresh(this);
            chart.selectedPoint = this;
          },
        },
      },

      states: {
        hover: {
          color: "#7e22ce",
        },
      },
    },
  ],
};

  return (
    <HighchartsReact
      highcharts={Highcharts}
      constructorType="mapChart"
      options={options}
    />
  );
};

export default WorldMap;
