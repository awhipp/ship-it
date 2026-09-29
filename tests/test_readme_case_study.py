import unittest
from pathlib import Path
import re

REPO_ROOT = Path(__file__).resolve().parent.parent
README_MD = REPO_ROOT / "README.md"

class TestReadmeCaseStudyAndAgnostic(unittest.TestCase):
    def setUp(self):
        self.assertTrue(README_MD.exists(), f"README.md not found at {README_MD}")
        self.readme_content = README_MD.read_text(encoding="utf-8")

    def test_readme_links_to_case_study_issue_1(self):
        """README.md links directly to https://github.com/awhipp/ship-it/issues/1."""
        self.assertIn(
            "https://github.com/awhipp/ship-it/issues/1",
            self.readme_content,
            "README.md must contain direct link to https://github.com/awhipp/ship-it/issues/1"
        )

    def test_readme_see_it_in_action_callout(self):
        """README.md features a prominent 'See it in action' callout describing the living case study."""
        readme_lower = self.readme_content.lower()
        self.assertIn(
            "see it in action",
            readme_lower,
            "README.md must feature a prominent 'See it in action' section or callout"
        )
        # Check that it describes the build loop phases in the case study
        self.assertTrue(
            "case study" in readme_lower or "demonstration" in readme_lower or "living" in readme_lower,
            "README.md must describe issue #1 as a living case study / demonstration"
        )

    def test_readme_portable_invocation_phrasing(self):
        """README.md replaces exclusive slash command references with portable invocation phrasing."""
        # Exclusive slash command lines like "Invoke `/ship-it`." or "run `/ship-it preflight`" without alternatives
        # should be replaced by portable phrasing (e.g., `ship-it`, `/ship-it`, or prompt/conversation)
        self.assertNotIn(
            "Invoke `/ship-it`.",
            self.readme_content,
            "README.md must not prescribe slash-command-only invocation"
        )
        self.assertNotIn(
            "or you run `/ship-it preflight`",
            self.readme_content,
            "README.md must not prescribe slash-command-only preflight"
        )
        readme_lower = self.readme_content.lower()
        self.assertTrue(
            "portable" in readme_lower or "natural language" in readme_lower or "prompt" in readme_lower or "ship-it" in self.readme_content,
            "README.md must include portable invocation phrasing"
        )

    def test_readme_agentskills_alignment(self):
        """README.md reflects agentskills.io schema conformance and open standard compatibility."""
        readme_lower = self.readme_content.lower()
        self.assertTrue(
            "agentskills" in readme_lower or "agentskills.io" in readme_lower or "open agent skill" in readme_lower,
            "README.md must reflect agentskills.io schema alignment"
        )

    def test_readme_two_tier_context_isolation(self):
        """README.md explains the 2-tier context isolation protocol (subagents vs fresh sessions) preventing bias."""
        readme_lower = self.readme_content.lower()
        self.assertTrue(
            "context isolation" in readme_lower or "2-tier" in readme_lower or "multi-tier" in readme_lower,
            "README.md must document multi-tier or 2-tier context isolation"
        )
        self.assertTrue(
            "subagent" in readme_lower and ("fresh session" in readme_lower or "fresh context" in readme_lower),
            "README.md must document both subagents and fresh sessions for context isolation"
        )

    def test_readme_red_green_verification_gate(self):
        """README.md explains Red-Green verification gates and concrete test-first proof."""
        readme_lower = self.readme_content.lower()
        self.assertTrue(
            "red-green" in readme_lower or ("red" in readme_lower and "green" in readme_lower),
            "README.md must document Red-Green verification"
        )
        self.assertTrue(
            "verification gate" in readme_lower or "gate" in readme_lower or "failing test" in readme_lower or "proof" in readme_lower,
            "README.md must document verification gates and proof of test failure"
        )

    def test_readme_tool_and_harness_neutrality(self):
        """README.md documents CLI and MCP tool support and cross-platform compatibility."""
        readme_lower = self.readme_content.lower()
        self.assertTrue(
            "mcp" in readme_lower or "model context protocol" in readme_lower,
            "README.md must document GitHub MCP support alongside gh CLI"
        )
        self.assertTrue(
            "cross-platform" in readme_lower or "powershell" in readme_lower or "windows" in readme_lower,
            "README.md must document cross-platform compatibility"
        )

if __name__ == "__main__":
    unittest.main()
