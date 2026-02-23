grammar TeamTopologyGrammar
import "../common/common";

entry TeamTopology:
    NEWLINE*
    'teamTopology'
    (
        NEWLINE
        | TitleAndAccessibilities
        | teams+=TeamDeclaration
        | interactions+=Interaction
    )*
;

// --- Team declarations ---
// Syntax: name#Type   e.g.  "Stream A"#Stream  or  f1#Stream
// The # character stops the common ID terminal, so bare IDs work fine here.

TeamDeclaration:
    name=TtName '#' type=TT_TEAM_TYPE EOL
;

// --- Interaction declarations ---
// Syntax: lhs--Mode->rhs  (unidirectional: Facilitation, XaaS)
//         lhs--Mode-->rhs (bidirectional: Collaboration)
//
// NOTE: The entire interaction is captured as one terminal (TT_INTERACTION_LINE).
// This is necessary because the common ID terminal allows hyphens, meaning
// `f1--XaaS` would be lexed as a single ID token, breaking the structured
// lhs--Mode->rhs parsing. By matching the whole line in one terminal,
// TT_INTERACTION_LINE always wins over ID (longer match takes priority).

Interaction:
    line=TT_INTERACTION_LINE EOL
;

// Name for team declarations.
// Can be a quoted string, a bare ID, or even a bare team-type/interaction-mode
// keyword (e.g. Stream#Stream).
TtName returns string: STRING | TT_TEAM_TYPE | TT_INTERACTION_MODE | ID;

// --- Terminals ---
// Defined before the common import's ID terminal so they take lexer priority.

// Matches the full interaction line: lhs--Mode->rhs or lhs--Mode-->rhs
// Bare names (e.g. f1) and quoted names (e.g. "Stream A") are both supported.
// Defined first so it wins over common's ID terminal (longest match wins).
terminal TT_INTERACTION_LINE returns string: /(?:"[^"]*"|'[^']*'|\w+)--(?:Collaboration|Facilitation|XaaS)(?:-->|->)(?:"[^"]*"|'[^']*'|\w+)/;

// Team types from Team Topologies
terminal TT_TEAM_TYPE returns string: /Stream|Complicated|Enabling|Platform/;

// Interaction modes from Team Topologies
terminal TT_INTERACTION_MODE returns string: /Collaboration|Facilitation|XaaS/;
