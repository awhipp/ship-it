import unittest
from pathlib import Path
import re

REPO_ROOT = Path(__file__).resolve().parent.parent
PLAN_MD = REPO_ROOT / "skills" / "ship-it" / "references" / "plan.md"
VALIDATE_MD = REPO_ROOT / "skills" / "ship-it" / "references" / "validate.md"
REVIEW_MD = REPO_ROOT / "skills" / "ship-it" / "references" / "review.md"
SKILL_MD = REPO_ROOT / "skills" / "ship-it" / "SKILL.md"

class TestContextIsolationAndOperations(unittest.TestCase):
    def setUp(self):
        self.assertTrue(PLAN_MD.exists(), f"plan.md not found at {PLAN_MD}")
        self.assertTrue(VALIDATE_MD.exists(), f"validate.md not found at {VALIDATE_MD}")
        self.assertTrue(REVIEW_MD.exists(), f"review.md not found at {REVIEW_MD}")
        self.plan_content = PLAN_MD.read_text(encoding="utf-8")
        self.validate_content = VALIDATE_MD.read_text(encoding="utf-8")
        self.review_content = REVIEW_MD.read_text(encoding="utf-8")
        self.skill_content = SKILL_MD.read_text(encoding="utf-8")

    def test_in_context_persona_simulation_eliminated(self):
        """In-context persona simulation or state-clearing is eliminated and strictly prohibited."""
        # Ensure contradictory instruction in review.md is gone
        self.assertNotIn(
            "run both passes sequentially in the current context, clearing your working state",
            self.review_content
        )
        self.assertNotIn(
            "clearing your working state",
            self.review_content
        )

        # Check that in-context persona simulation/switching is explicitly prohibited
        val_lower = self.validate_content.lower()
        rev_lower = self.review_content.lower()
        self.assertTrue(
            "persona" in val_lower or "in-context" in val_lower,
            "validate.md should explicitly address in-context persona simulation"
        )
        self.assertTrue(
            "prohibited" in val_lower or "forbidden" in val_lower or "not allowed" in val_lower or "never" in val_lower,
            "validate.md must prohibit in-context persona simulation"
        )
        self.assertTrue(
            "persona" in rev_lower or "in-context" in rev_lower,
            "review.md should explicitly address in-context persona simulation"
        )
        self.assertTrue(
            "prohibited" in rev_lower or "forbidden" in rev_lower or "not allowed" in rev_lower or "never" in rev_lower,
            "review.md must prohibit in-context persona simulation"
        )

    def test_two_tier_context_isolation_protocol(self):
        """2-Tier Context Isolation Protocol (Tier 1: Isolated Subagent; Tier 2: Fresh Session) is explicitly documented and mandated for Validate and Review."""
        for name, content in [("validate.md", self.validate_content), ("review.md", self.review_content)]:
            content_lower = content.lower()
            self.assertTrue(
                "tier 1" in content_lower and "tier 2" in content_lower,
                f"{name} must explicitly document Tier 1 and Tier 2"
            )
            self.assertTrue(
                "subagent" in content_lower,
                f"{name} must document Tier 1 (Isolated Subagent)"
            )
            self.assertTrue(
                "fresh session" in content_lower,
                f"{name} must document Tier 2 (Fresh Session)"
            )

    def test_plan_enforces_strictly_one_question_per_turn(self):
        """plan.md enforces strictly one question per turn during planning clarification."""
        plan_lower = self.plan_content.lower()
        self.assertTrue(
            "one question per turn" in plan_lower,
            "plan.md must explicitly enforce 'one question per turn' during user clarification"
        )
        self.assertTrue(
            "strictly" in plan_lower or "never batch" in plan_lower or "one at a time" in plan_lower,
            "plan.md must emphasize strictness of one question per turn"
        )

    def test_logical_issue_operations_in_validate_and_review(self):
        """validate.md and review.md reference logical issue operations rather than raw CLI-only commands."""
        # Validate should reference logical operations
        self.assertTrue(
            "UpdateIssue" in self.validate_content or "CommentIssue" in self.validate_content,
            "validate.md must reference logical issue operations like UpdateIssue or CommentIssue"
        )
        self.assertTrue(
            "ReadIssue" in self.validate_content or "QueryArtifact" in self.validate_content,
            "validate.md must reference logical issue operations like ReadIssue"
        )

        # Review should reference logical operations
        self.assertTrue(
            "UpdateIssue" in self.review_content or "CloseIssue" in self.review_content,
            "review.md must reference logical issue operations like UpdateIssue, CommentIssue, or CloseIssue"
        )
        self.assertTrue(
            "ReadIssue" in self.review_content,
            "review.md must reference ReadIssue"
        )

    def test_portable_invocation_phrasing_in_plan_and_guides(self):
        """Portable invocation phrasing replaces raw slash commands in plan.md and references."""
        # plan.md should not use bare /spec without portable phrasing
        self.assertNotIn('hand to /spec."', self.plan_content)

if __name__ == "__main__":
    unittest.main()
