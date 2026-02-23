import type { CstNode, GrammarAST, ValueType } from 'langium';

import { AbstractMermaidValueConverter } from '../common/index.js';

export class TeamTopologyValueConverter extends AbstractMermaidValueConverter {
  protected override runCustomConverter(
    _rule: GrammarAST.AbstractRule,
    _input: string,
    _cstNode: CstNode
  ): ValueType | undefined {
    // All token types use default Langium conversion:
    // - STRING: quotes stripped automatically
    // - TT_TEAM_TYPE, TT_INTERACTION_MODE, TT_ARROW, ID: returned as-is
    return undefined;
  }
}
