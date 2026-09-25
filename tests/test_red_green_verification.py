import unittest
from pathlib import Path
import re

REPO_ROOT = Path(__file__).resolve().parent.parent
IMPLEMENT_MD = REPO_ROOT / "skills" / "ship-it" / "references" / "implement.md"
REVIEW_MD = REPO_ROOT / "skills" / "ship-it" / "references" / "review.md"

class TestRedGreenVerification(unittest.TestCase):
    def setUp(self):
        self.assertTrue(IMPLEMENT_MD.exists(), f"implement.md not found at {IMPLEMENT_MD}")
        self.assertTrue(REVIEW_MD.exists(), f"review.md not found at {REVIEW_MD}")
        self.implement_content = IMPLEMENT_MD.read_text(encoding="utf-8")
        self.review_content = REVIEW_MD.read_text(encoding="utf-8")

    def test_implement_mandates_two_step_red_green_cycle(self):
        """implement.md mandates a strict two-step Red-Green verification cycle."""
        impl_lower = self.implement_content.lower()
        self.assertTrue(
            "red-green" in impl_lower or ("red" in impl_lower and "green" in impl_lower),
            "implement.md must mention the Red-Green cycle"
        )
        self.assertTrue(
            "two-step" in impl_lower or "2-step" in impl_lower or "cycle" in impl_lower,
            "implement.md must mandate the two-step Red-Green cycle"
        )
        # Verify write failing test, observe failure, write implementation, observe pass
        self.assertTrue(
            "failing test" in impl_lower or "observe failure" in impl_lower or "watch it fail" in impl_lower,
            "implement.md must specify writing a failing test and observing failure"
        )
        self.assertTrue(
            "observe pass" in impl_lower or "make it pass" in impl_lower,
            "implement.md must specify making the test pass"
        )

    def test_implement_defines_required_red_verification_artifact_gate(self):
        """implement.md defines the required verification artifact (failing test commit or collapsible failure log) as an explicit gate before writing code."""
        # Check for explicit git commit option with (RED) naming convention
        self.assertTrue(
            "(RED)" in self.implement_content or "(red)" in self.implement_content.lower(),
            "implement.md must mention failing test commit naming convention (RED)"
        )
        # Check for collapsible test failure log option
        self.assertTrue(
            "<details><summary>Red Phase Failure Log</summary>" in self.implement_content or
            "<details><summary>red phase failure log</summary>" in self.implement_content.lower(),
            "implement.md must mention collapsible test failure log (<details><summary>Red Phase Failure Log</summary>...)"
        )
        # Check that it's defined as a gate before writing code
        impl_lower = self.implement_content.lower()
        self.assertTrue(
            "gate" in impl_lower or "before" in impl_lower or "proceeding" in impl_lower,
            "implement.md must define the verification artifact as a gate before writing implementation code"
        )

    def test_review_verifies_red_artifact_checkpoint(self):
        """review.md includes an explicit verification checkpoint checking for the Red artifact, rejecting diffs lacking it."""
        rev_lower = self.review_content.lower()
        self.assertTrue(
            "red" in rev_lower and ("artifact" in rev_lower or "verification" in rev_lower or "checkpoint" in rev_lower or "log" in rev_lower or "commit" in rev_lower),
            "review.md must include a checkpoint checking for the Red verification artifact"
        )
        self.assertTrue(
            "reject" in rev_lower or "fail" in rev_lower or "lacking" in rev_lower or "missing" in rev_lower,
            "review.md must reject or fail diffs lacking the Red verification artifact"
        )
        # Check that it verifies either the commit or the collapsible failure log
        self.assertTrue(
            "red" in self.review_content and ("(RED)" in self.review_content or "Red Phase Failure Log" in self.review_content or "failure log" in rev_lower or "failing test commit" in rev_lower),
            "review.md must verify the failing test commit or collapsible failure log"
        )
        # Check outcome section gates approval on red artifact
        outcome_section = self.review_content[self.review_content.find("## Outcome"):]
        self.assertTrue(
            "red" in outcome_section.lower(),
            "review.md Outcome section must explicitly condition approval / rejection on Red verification artifact"
        )

    def test_logical_issue_operations_and_portable_phrasing_in_implement(self):
        """implement.md uses logical issue operations (AssignSelf with quoted @me) and portable phrasing."""
        self.assertIn(
            "AssignSelf",
            self.implement_content,
            "implement.md must reference AssignSelf logical operation"
        )
        self.assertIn(
            '"@me"',
            self.implement_content,
            "implement.md must use quoted \"@me\" in AssignSelf invocation"
        )
        # Check unquoted @me is not present as a raw CLI snippet
        self.assertNotIn(
            "--add-assignee @me",
            self.implement_content,
            "implement.md must not use unquoted @me"
        )
        self.assertTrue(
            "UpdateIssue" in self.implement_content or "CommentIssue" in self.implement_content,
            "implement.md must reference logical issue operations like UpdateIssue or CommentIssue"
        )

if __name__ == "__main__":
    unittest.main()
