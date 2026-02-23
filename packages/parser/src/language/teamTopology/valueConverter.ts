import type { CstNode, GrammarAST, ValueType } from 'langium';

import { AbstractMermaidValueConverter } from '../common/index.js';

export class TeamTopologyValueConverter extends AbstractMermaidValueConverter {
  protected override runCustomConverter(
    rule: GrammarAST.AbstractRule,
    input: string,
    _cstNode: CstNode
  ): ValueType | undefined {
    if (rule.name === 'TT_LABEL') {
      // Strip outer [ and ] brackets
      let result = input.replace(/^\[|]$/g, '').trim();
      // Strip optional surrounding quotes
      if (
        (result.startsWith('"') && result.endsWith('"')) ||
        (result.startsWith("'") && result.endsWith("'"))
      ) {
        result = result.slice(1, -1);
      }
      return result;
    }
    return undefined;
  }
}
