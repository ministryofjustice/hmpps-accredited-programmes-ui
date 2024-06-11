interface OasysAlcoholDetail {
  alcoholIssuesDetails?: string | null
  alcoholLinkedToHarm?: string | null
  bingeDrinking?: string | null
  frequencyAndLevel?: string | null
}

interface OasysDrugDetail {
  drugsMajorActivity?: string | null
  levelOfUseOfMainDrug?: string | null
}

export interface DrugAlcoholDetail {
  alcohol: OasysAlcoholDetail
  drug: OasysDrugDetail
}
