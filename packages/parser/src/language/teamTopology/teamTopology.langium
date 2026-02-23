grammar TeamTopologyGrammar
import "../common/common";

entry TeamTopology:
    NEWLINE*
    'teamTopology'
    (
        NEWLINE
        | TitleAndAccessibilities
        | teams+=Team
        | interactions+=Interaction
    )*
;

// --- Team declarations ---

Team:
    id=ID label=TT_LABEL type=TEAM_TYPE EOL
;

// --- Interaction declarations ---

Interaction:
    lhsId=ID mode=INTERACTION_MODE rhsId=ID EOL
;

// --- Terminals ---

// TT_LABEL includes brackets to avoid conflicting with other tokens
terminal TT_LABEL returns string: /\[(?:"[^"]*"|'[^']*'|[^\]\r\n]+)\]/;

// Defined before ID (imported from common) so they have higher token priority
terminal TEAM_TYPE returns string: 'stream-aligned' | 'enabling' | 'complicated-subsystem' | 'platform';
terminal INTERACTION_MODE returns string: 'collaboration' | 'facilitation' | 'x-as-a-service';
