const parseHtml = (actual: JQuery<HTMLElement>, expected: string): { actual: string; expected: string } => {
  // Get rid of all whitespace in both the actual and expected text,
  // so we don't have to worry about small differences in whitespace
  const parser = new DOMParser()
  const doc = parser.parseFromString(expected, 'text/html')

  return { actual: actual.text().replace(/\s+/g, ''), expected: doc.body.innerText.replace(/\s+/g, '') }
}

export default { parseHtml }
