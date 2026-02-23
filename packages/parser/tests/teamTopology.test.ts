import { describe, expect, it } from 'vitest';

import { TeamTopology } from '../src/language/index.js';
import { parseInteractionLine } from '../src/language/teamTopology/module.js';
import {
  expectNoErrorsOrAlternatives,
  teamTopologyParse as parse,
} from './test-util.js';

describe('teamTopology', () => {
  describe('should handle teamTopology definition', () => {
    it.each([
      `teamTopology`,
      `  teamTopology  `,
      `\tteamTopology\t`,
      `
        \tteamTopology
        `,
    ])('should parse empty teamTopology diagram', (context: string) => {
      const result = parse(context);
      expectNoErrorsOrAlternatives(result);
      expect(result.value.$type).toBe(TeamTopology.$type);
    });
  });

  describe('should handle TitleAndAccessibilities', () => {
    it('should handle title', () => {
      const context = `teamTopology title My Team Topology`;
      const result = parse(context);
      expectNoErrorsOrAlternatives(result);
      expect(result.value.title).toBe('My Team Topology');
    });

    it('should handle accTitle', () => {
      const context = `teamTopology accTitle: TT Diagram`;
      const result = parse(context);
      expectNoErrorsOrAlternatives(result);
      expect(result.value.accTitle).toBe('TT Diagram');
    });

    it('should handle accDescr', () => {
      const context = `teamTopology accDescr: TT Description`;
      const result = parse(context);
      expectNoErrorsOrAlternatives(result);
      expect(result.value.accDescr).toBe('TT Description');
    });
  });

  describe('should handle team declarations', () => {
    it('should parse a stream-aligned team with bare name', () => {
      // From issue #4659: f1#Stream
      const context = `teamTopology
  f1#Stream`;
      const result = parse(context);
      expectNoErrorsOrAlternatives(result);
      const team = result.value.teams[0];
      expect(team.name).toBe('f1');
      expect(team.type).toBe('Stream');
    });

    it('should parse a stream-aligned team with quoted name', () => {
      // From issue #4659: "Stream A"#Stream
      const context = `teamTopology
  "Stream A"#Stream`;
      const result = parse(context);
      expectNoErrorsOrAlternatives(result);
      const team = result.value.teams[0];
      expect(team.name).toBe('Stream A');
      expect(team.type).toBe('Stream');
    });

    it('should parse a complicated subsystem team', () => {
      // From issue #4659: "Complicated Subsystem"#Complicated
      const context = `teamTopology
  "Complicated Subsystem"#Complicated`;
      const result = parse(context);
      expectNoErrorsOrAlternatives(result);
      const team = result.value.teams[0];
      expect(team.name).toBe('Complicated Subsystem');
      expect(team.type).toBe('Complicated');
    });

    it('should parse an enabling team', () => {
      const context = `teamTopology
  "Enabling Team"#Enabling`;
      const result = parse(context);
      expectNoErrorsOrAlternatives(result);
      const team = result.value.teams[0];
      expect(team.name).toBe('Enabling Team');
      expect(team.type).toBe('Enabling');
    });

    it('should parse a platform team', () => {
      const context = `teamTopology
  "Platform Team"#Platform`;
      const result = parse(context);
      expectNoErrorsOrAlternatives(result);
      const team = result.value.teams[0];
      expect(team.name).toBe('Platform Team');
      expect(team.type).toBe('Platform');
    });

    it('should parse multiple teams', () => {
      const context = `teamTopology
  "Stream A"#Stream
  "Stream B"#Stream
  "Enabling Team"#Enabling
  "Complicated Subsystem"#Complicated
  "Platform"#Platform`;
      const result = parse(context);
      expectNoErrorsOrAlternatives(result);
      expect(result.value.teams).toHaveLength(5);
      expect(result.value.teams[0].type).toBe('Stream');
      expect(result.value.teams[1].type).toBe('Stream');
      expect(result.value.teams[2].type).toBe('Enabling');
      expect(result.value.teams[3].type).toBe('Complicated');
      expect(result.value.teams[4].type).toBe('Platform');
    });
  });

  describe('should handle interaction declarations', () => {
    it('should parse a XaaS interaction with single arrow', () => {
      // From issue #4659: f1--XaaS->f2
      const context = `teamTopology
  f1#Stream
  f2#Stream
  f1--XaaS->f2`;
      const result = parse(context);
      expectNoErrorsOrAlternatives(result);
      const parsed = parseInteractionLine(result.value.interactions[0].line);
      expect(parsed.lhs).toBe('f1');
      expect(parsed.mode).toBe('XaaS');
      expect(parsed.arrow).toBe('->');
      expect(parsed.rhs).toBe('f2');
    });

    it('should parse a Facilitation interaction with single arrow', () => {
      // From issue #4659: "Enabling Team A"--Facilitation->"Stream A"
      const context = `teamTopology
  "Enabling Team A"#Enabling
  "Stream A"#Stream
  "Enabling Team A"--Facilitation->"Stream A"`;
      const result = parse(context);
      expectNoErrorsOrAlternatives(result);
      const parsed = parseInteractionLine(result.value.interactions[0].line);
      expect(parsed.lhs).toBe('Enabling Team A');
      expect(parsed.mode).toBe('Facilitation');
      expect(parsed.arrow).toBe('->');
      expect(parsed.rhs).toBe('Stream A');
    });

    it('should parse a Collaboration interaction with double arrow', () => {
      // From issue #4659: "Complicated Subsystem team"--Collaboration-->"Stream A"
      const context = `teamTopology
  "Complicated Subsystem team"#Complicated
  "Stream A"#Stream
  "Complicated Subsystem team"--Collaboration-->"Stream A"`;
      const result = parse(context);
      expectNoErrorsOrAlternatives(result);
      const parsed = parseInteractionLine(result.value.interactions[0].line);
      expect(parsed.lhs).toBe('Complicated Subsystem team');
      expect(parsed.mode).toBe('Collaboration');
      expect(parsed.arrow).toBe('-->');
      expect(parsed.rhs).toBe('Stream A');
    });

    it('should parse multiple interactions', () => {
      const context = `teamTopology
  "Stream A"#Stream
  "Stream B"#Stream
  "Enabling Team"#Enabling
  "Platform"#Platform
  "Enabling Team"--Facilitation->"Stream A"
  "Platform"--XaaS->"Stream B"
  "Stream A"--Collaboration-->"Stream B"`;
      const result = parse(context);
      expectNoErrorsOrAlternatives(result);
      expect(result.value.interactions).toHaveLength(3);
      expect(parseInteractionLine(result.value.interactions[0].line).mode).toBe('Facilitation');
      expect(parseInteractionLine(result.value.interactions[1].line).mode).toBe('XaaS');
      expect(parseInteractionLine(result.value.interactions[2].line).mode).toBe('Collaboration');
    });
  });

  describe('parseInteractionLine utility', () => {
    it('should parse bare names with single arrow', () => {
      const parsed = parseInteractionLine('f1--XaaS->f2');
      expect(parsed).toEqual({ lhs: 'f1', mode: 'XaaS', arrow: '->', rhs: 'f2' });
    });

    it('should parse quoted names with double arrow', () => {
      const parsed = parseInteractionLine('"Stream A"--Collaboration-->"Stream B"');
      expect(parsed).toEqual({
        lhs: 'Stream A',
        mode: 'Collaboration',
        arrow: '-->',
        rhs: 'Stream B',
      });
    });

    it('should parse mixed bare/quoted names', () => {
      const parsed = parseInteractionLine('"Enabling Team A"--Facilitation->sa');
      expect(parsed).toEqual({ lhs: 'Enabling Team A', mode: 'Facilitation', arrow: '->', rhs: 'sa' });
    });
  });

  describe('should handle full diagrams', () => {
    it('should parse the example from issue #4659', () => {
      // Minimal example from issue: f1#Stream / f2#Stream / f1--XaaS->f2
      const context = `teamTopology
  f1#Stream
  f2#Stream
  f1--XaaS->f2`;
      const result = parse(context);
      expectNoErrorsOrAlternatives(result);
      expect(result.value.$type).toBe(TeamTopology.$type);
      expect(result.value.teams).toHaveLength(2);
      expect(result.value.interactions).toHaveLength(1);
    });

    it('should parse a complete team topology diagram', () => {
      const context = `teamTopology
  title Team Topology Example
  "Stream A"#Stream
  "Stream B"#Stream
  "Enabling Team"#Enabling
  "Complicated Subsystem"#Complicated
  "Platform"#Platform
  "Enabling Team"--Facilitation->"Stream A"
  "Complicated Subsystem"--Collaboration-->"Stream A"
  "Platform"--XaaS->"Stream B"`;
      const result = parse(context);
      expectNoErrorsOrAlternatives(result);
      expect(result.value.$type).toBe(TeamTopology.$type);
      expect(result.value.title).toBe('Team Topology Example');
      expect(result.value.teams).toHaveLength(5);
      expect(result.value.interactions).toHaveLength(3);
    });

    it('should parse the extended example from issue #4659', () => {
      const context = `teamTopology
  "Stream A"#Stream
  "Stream B"#Stream
  "Stream C"#Stream
  "Stream D"#Stream
  "Complicated Subsystem team"#Complicated
  "Enabling Team A"#Enabling
  "Enabling Team A"--Facilitation->"Stream A"
  "Complicated Subsystem team"--Collaboration-->"Stream A"
  "Complicated Subsystem team"--XaaS->"Stream B"
  "Stream D"--XaaS->"Stream C"
  "Stream D"--XaaS->"Stream B"
  "Stream D"--Collaboration-->"Stream C"`;
      const result = parse(context);
      expectNoErrorsOrAlternatives(result);
      expect(result.value.teams).toHaveLength(6);
      expect(result.value.interactions).toHaveLength(6);
    });
  });
});
