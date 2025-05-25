export function arrayToSegmentationRows(
  header: string[], 
  data: any[][]
): { id: string | number, brand: string, type: string }[] {
  const idCol = header.findIndex(h => h.toLowerCase() === "id" || h === "#");
  const brandCol = header.findIndex(h => h.toLowerCase() === "brand" || h.toLowerCase().includes("center"));
  const typeCol = header.findIndex(h => h.toLowerCase() === "type" || h.toLowerCase().includes("preference"));
  return data.map(row => ({
    id: idCol >= 0 ? row[idCol] : "",
    brand: brandCol >= 0 ? row[brandCol] : "",
    type: typeCol >= 0 ? row[typeCol] : "",
  }));
}

export function buildSegmentationJson({
  name,
  prefField,
  unsubField,
  centerField,
  rows
}: {
  name: string,
  prefField: string|number,
  unsubField: string|number,
  centerField: string|number,
  rows: { id: string|number, brand: string, type: string }[]
}) {
  return {
    name,
    contactCriteria: {
      type: "and",
      children: [
        {
          type: "criteria",
          field: String(prefField),
          operator: "equals",
          value: "True"
        },
        {
          type: "criteria",
          field: String(unsubField),
          operator: "empty",
          value: ""
        },
        {
          type: "or",
          children: rows.map(row => ({
            type: "criteria",
            field: String(centerField),
            operator: "equals",
            value: String(row.id)
          }))
        }
      ]
    }
  };
}