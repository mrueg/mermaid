import { describe, expect, it } from 'vitest';

import { TeamTopology } from '../src/language/index.js';
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
      const { title } = result.value;
      expect(title).toBe('My Team Topology');
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
    it('should parse a stream-aligned team', () => {
      const context = `teamTopology
  teamA[Stream Team A] stream-aligned`;
      const result = parse(context);
      expectNoErrorsOrAlternatives(result);
      const team = result.value.teams[0];
      expect(team.id).toBe('teamA');
      expect(team.label).toBe('Stream Team A');
      expect(team.type).toBe('stream-aligned');
    });

    it('should parse an enabling team', () => {
      const context = `teamTopology
  teamB[Enabling Team B] enabling`;
      const result = parse(context);
      expectNoErrorsOrAlternatives(result);
      const team = result.value.teams[0];
      expect(team.id).toBe('teamB');
      expect(team.label).toBe('Enabling Team B');
      expect(team.type).toBe('enabling');
    });

    it('should parse a complicated-subsystem team', () => {
      const context = `teamTopology
  teamC[Complicated Subsystem C] complicated-subsystem`;
      const result = parse(context);
      expectNoErrorsOrAlternatives(result);
      const team = result.value.teams[0];
      expect(team.id).toBe('teamC');
      expect(team.label).toBe('Complicated Subsystem C');
      expect(team.type).toBe('complicated-subsystem');
    });

    it('should parse a platform team', () => {
      const context = `teamTopology
  teamD[Platform D] platform`;
      const result = parse(context);
      expectNoErrorsOrAlternatives(result);
      const team = result.value.teams[0];
      expect(team.id).toBe('teamD');
      expect(team.label).toBe('Platform D');
      expect(team.type).toBe('platform');
    });

    it('should parse team with quoted label', () => {
      const context = `teamTopology
  teamA["Stream-aligned Team A"] stream-aligned`;
      const result = parse(context);
      expectNoErrorsOrAlternatives(result);
      const team = result.value.teams[0];
      expect(team.id).toBe('teamA');
      expect(team.label).toBe('Stream-aligned Team A');
      expect(team.type).toBe('stream-aligned');
    });

    it('should parse multiple teams', () => {
      const context = `teamTopology
  sa[Stream Team A] stream-aligned
  en[Enabling Team] enabling
  cs[Complicated Subsystem] complicated-subsystem
  pl[Platform] platform`;
      const result = parse(context);
      expectNoErrorsOrAlternatives(result);
      expect(result.value.teams).toHaveLength(4);
      expect(result.value.teams[0].type).toBe('stream-aligned');
      expect(result.value.teams[1].type).toBe('enabling');
      expect(result.value.teams[2].type).toBe('complicated-subsystem');
      expect(result.value.teams[3].type).toBe('platform');
    });
  });

  describe('should handle interaction declarations', () => {
    it('should parse a collaboration interaction', () => {
      const context = `teamTopology
  sa[Stream A] stream-aligned
  cs[Complicated Subsystem] complicated-subsystem
  sa collaboration cs`;
      const result = parse(context);
      expectNoErrorsOrAlternatives(result);
      const interaction = result.value.interactions[0];
      expect(interaction.lhsId).toBe('sa');
      expect(interaction.mode).toBe('collaboration');
      expect(interaction.rhsId).toBe('cs');
    });

    it('should parse a facilitation interaction', () => {
      const context = `teamTopology
  en[Enabling Team] enabling
  sa[Stream A] stream-aligned
  en facilitation sa`;
      const result = parse(context);
      expectNoErrorsOrAlternatives(result);
      const interaction = result.value.interactions[0];
      expect(interaction.lhsId).toBe('en');
      expect(interaction.mode).toBe('facilitation');
      expect(interaction.rhsId).toBe('sa');
    });

    it('should parse an x-as-a-service interaction', () => {
      const context = `teamTopology
  pl[Platform] platform
  sa[Stream A] stream-aligned
  pl x-as-a-service sa`;
      const result = parse(context);
      expectNoErrorsOrAlternatives(result);
      const interaction = result.value.interactions[0];
      expect(interaction.lhsId).toBe('pl');
      expect(interaction.mode).toBe('x-as-a-service');
      expect(interaction.rhsId).toBe('sa');
    });

    it('should parse multiple interactions', () => {
      const context = `teamTopology
  sa[Stream A] stream-aligned
  sa2[Stream B] stream-aligned
  en[Enabling Team] enabling
  pl[Platform] platform
  en facilitation sa
  pl x-as-a-service sa2
  sa collaboration sa2`;
      const result = parse(context);
      expectNoErrorsOrAlternatives(result);
      expect(result.value.interactions).toHaveLength(3);
    });
  });

  describe('should handle full diagrams', () => {
    it('should parse a complete team topology diagram', () => {
      const context = `teamTopology
  title Team Topology Example
  sa1[Stream A] stream-aligned
  sa2[Stream B] stream-aligned
  en[Enabling Team] enabling
  cs[Complicated Subsystem] complicated-subsystem
  pl[Platform] platform
  en facilitation sa1
  cs collaboration sa1
  pl x-as-a-service sa2`;
      const result = parse(context);
      expectNoErrorsOrAlternatives(result);
      expect(result.value.$type).toBe(TeamTopology.$type);
      expect(result.value.title).toBe('Team Topology Example');
      expect(result.value.teams).toHaveLength(5);
      expect(result.value.interactions).toHaveLength(3);
    });
  });
});
