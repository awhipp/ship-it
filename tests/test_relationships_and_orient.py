import unittest
from pathlib import Path
import re

REPO_ROOT = Path(__file__).resolve().parent.parent
SKILL_MD = REPO_ROOT / "skills" / "ship-it" / "SKILL.md"
TICKETS_MD = REPO_ROOT / "skills" / "ship-it" / "references" / "tickets.md"

class TestRelationshipsAndOrient(unittest.TestCase):
    def setUp(self):
        self.assertTrue(SKILL_MD.exists(), f"SKILL.md not found at {SKILL_MD}")
        self.assertTrue(TICKETS_MD.exists(), f"tickets.md not found at {TICKETS_MD}")
        self.skill_content = SKILL_MD.read_text(encoding="utf-8")
        self.tickets_content = TICKETS_MD.read_text(encoding="utf-8")

    def test_multi_phase_loop_rationale(self):
        """Build loop rationale emphasizes confirmation bias reduction and verification gates."""
        # Check SKILL.md loop rationale
        skill_lower = self.skill_content.lower()
        self.assertIn("confirmation bias", skill_lower, "SKILL.md should emphasize confirmation bias reduction")
        self.assertTrue(
            "verification gate" in skill_lower or "verification" in skill_lower,
            "SKILL.md should emphasize verification gates"
        )

    def test_portable_invocation_phrasing(self):
        """Portable invocation phrasing replaces bare slash-command requirements."""
        # SKILL.md should not use bare (/ship-it preflight) without portable phrasing
        self.assertNotIn("(`/ship-it preflight`)", self.skill_content)
        self.assertTrue(
            "ship-it preflight" in self.skill_content,
            "SKILL.md preflight invocation should mention 'ship-it preflight'"
        )

    def test_markdown_parent_child_link_format_and_spec_immutability(self):
        """Child tickets record 'Part of #<spec-id>' while parent spec body remains immutable."""
        self.assertIn("Part of #", self.tickets_content, "tickets.md must specify 'Part of #<spec-id>' format")
        tickets_lower = self.tickets_content.lower()
        self.assertIn("immutable", tickets_lower, "tickets.md must state parent spec body remains immutable")

    def test_markdown_dependency_edges_and_orient_discovery_contract(self):
        """Markdown dependency edges (## Blocked by tasklist) and Orient unblocked discovery contract are specified."""
        # tickets.md ticket template must include tasklist blocker format
        self.assertIn("## Blocked by", self.tickets_content)
        self.assertTrue(
            "- [ ] Blocked by #" in self.tickets_content or "Blocked by #<" in self.tickets_content,
            "tickets.md should specify '- [ ] Blocked by #<blocker-id>' format"
        )

        # SKILL.md Orient section must detail parsing Blocked by and checking blocker issue states
        skill_lower = self.skill_content.lower()
        self.assertIn("blocked by", skill_lower, "SKILL.md Orient must reference Blocked by dependencies")
        self.assertTrue(
            "readissue" in self.skill_content or "gh issue view" in self.skill_content,
            "SKILL.md Orient must specify inspecting blocker states via ReadIssue or gh issue view"
        )
        self.assertTrue(
            "closed" in skill_lower and "unblocked" in skill_lower,
            "SKILL.md Orient must define unblocked as all blockers closed"
        )

    def test_ticket_publishing_approval_gate(self):
        """Ticket publishing requires an explicit pause and user confirmation checkpoint before issue creation."""
        tickets_lower = self.tickets_content.lower()
        self.assertTrue(
            "approval gate" in tickets_lower or "approval checkpoint" in tickets_lower or "pause" in tickets_lower,
            "tickets.md must document an explicit approval gate or pause before publishing issues"
        )
        self.assertTrue(
            "confirmation" in tickets_lower or "confirm" in tickets_lower or "approve" in tickets_lower,
            "tickets.md must require user confirmation before creating issues"
        )

if __name__ == "__main__":
    unittest.main()
