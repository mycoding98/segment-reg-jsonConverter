// Interface for a single criteria in the segmentation JSON
export interface Criteria {
    type: "criteria" | "and" | "or"; // Specifies the type of criteria
    field?: string;                 // Field name (e.g., $fieldpref, $unsubdate)
    operator?: "equals" | "empty";  // Operator for comparison
    value?: string;                 // Value to compare against
    FIELD5?: string;                // Optional additional field
    children?: Criteria[];          // Nested criteria for "and" or "or" types
  }
  
  // Interface for the contact criteria in the segmentation JSON
  export interface ContactCriteria {
    type: "and" | "or";             // Specifies the logical operator
    children: Criteria[];           // Array of nested criteria
  }
  
  // Interface for the segmentation JSON structure
  export interface Segmentation {
    name: string;                   // Name of the segment
    contactCriteria: ContactCriteria; // Logical criteria for the segment
  }