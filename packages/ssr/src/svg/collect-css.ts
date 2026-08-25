/** Harvest CSS rules from emotion's injected <style> tags.
 *
 * Emotion may run in "speedy" mode where rules are inserted through the
 * CSSOM (`sheet.insertRule`) and the <style> tags have empty text content —
 * so rules are read from `sheet.cssRules` first, falling back to textContent.
 */

export interface CollectedRule {
  selector: string;
  /** Declaration block text (without braces) */
  block: string;
  /** Full rule text */
  cssText: string;
}

export function collectCssRules (document: Document): CollectedRule[] {
  const rules: CollectedRule[] = []

  for (const styleEl of Array.from(document.querySelectorAll('style'))) {
    const sheet = (styleEl as HTMLStyleElement).sheet
    if (sheet) {
      let cssRules: CSSRuleList | undefined
      try {
        cssRules = sheet.cssRules
      } catch { /* cross-origin or detached sheets */ }
      if (cssRules && cssRules.length) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        for (const rule of Array.from(cssRules)) collectRule(rule, rules)
        continue
      }
    }
    const text = styleEl.textContent
    if (text) {
      for (const match of text.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
        rules.push({ selector: match[1].trim(), block: match[2].trim(), cssText: match[0] })
      }
    }
  }
  return rules
}

function collectRule (rule: CSSRule, out: CollectedRule[]): void {
  // CSSStyleRule
  const styleRule = rule as CSSStyleRule
  if (styleRule.selectorText !== undefined) {
    const cssText = rule.cssText || ''
    const blockMatch = /\{([\s\S]*)\}/.exec(cssText)
    out.push({
      selector: styleRule.selectorText,
      block: blockMatch ? blockMatch[1].trim() : '',
      cssText,
    })
    return
  }
  // Grouping rules (@media, @supports) — recurse
  const grouping = rule as CSSGroupingRule
  if (grouping.cssRules) {
    for (const child of Array.from(grouping.cssRules)) collectRule(child, out)
  }
}
