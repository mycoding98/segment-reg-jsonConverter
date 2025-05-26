export function arrayToSegmentationRows(header, data) {
    const idCol = header.findIndex(h => h.toLowerCase() === "id" || h === "#");
    const brandCol = header.findIndex(h => h.toLowerCase() === "brand" || h.toLowerCase().includes("center"));
    const typeCol = header.findIndex(h => h.toLowerCase() === "type" || h.toLowerCase().includes("preference"));
    return data.map(row => ({
        id: idCol >= 0 ? row[idCol] : "",
        brand: brandCol >= 0 ? row[brandCol] : "",
        type: typeCol >= 0 ? row[typeCol] : "",
    }));
}
export function buildSegmentationJson({ prefField, unsubField, centerField, rows }) {
    return {
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
                    value: String(row.id),
                    FIELD5: row.brand // <-- Add FIELD5 here
                }))
            }
        ]
    };
}
//# sourceMappingURL=segmentationConverter.js.map