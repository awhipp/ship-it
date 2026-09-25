import unittest
from pathlib import Path
import re

REPO_ROOT = Path(__file__).resolve().parent.parent
PREFLIGHT_MD = REPO_ROOT / "skills" / "ship-it" / "references" / "preflight.md"

class TestPreflightConformance(unittest.TestCase):
    def setUp(self):
        self.assertTrue(PREFLIGHT_MD.exists(), f"preflight.md not found at {PREFLIGHT_MD}")
        self.content = PREFLIGHT_MD.read_text(encoding="utf-8")

    def test_tool_translation_table_contains_all_nine_operations(self):
        """Tool translation table defines all 9 logical operations with both gh CLI and GitHub MCP equivalents."""
        operations = [
            "QueryArtifact",
            "ReadIssue",
            "CreateIssue",
            "UpdateIssue",
            "CommentIssue",
            "AssignSelf",
            "CloseIssue",
            "LinkDependency",
            "LinkParentChild",
        ]
        for op in operations:
            self.assertIn(op, self.content, f"Operation {op} missing from preflight.md")

        # Verify that GitHub MCP tools (mcp__github__*) are present
        self.assertIn("mcp__github__", self.content, "mcp__github__ tools must be mapped in preflight.md")

    def test_preflight_check_uses_gh_version(self):
        """Preflight check runs gh --version instead of command -v gh."""
        self.assertIn("gh --version", self.content, "Preflight checklist must use 'gh --version'")
        self.assertNotIn("command -v gh", self.content, "Preflight checklist must not use 'command -v gh'")

    def test_shell_commands_cross_platform(self):
        """Shell command examples are cross-platform (PowerShell and POSIX compliant)."""
        self.assertNotIn("<<EOF", self.content, "Bash heredocs (<<EOF) must not be used")
        self.assertNotIn("<<-EOF", self.content, "Bash heredocs (<<-EOF) must not be used")
        self.assertNotIn("<<'EOF'", self.content, "Bash heredocs (<<'EOF') must not be used")
        # Ensure --body-file is recommended/used for multi-line bodies
        self.assertIn("--body-file", self.content, "Cross-platform multi-line body argument (--body-file) must be documented")
        # Ensure assignee @me is quoted to prevent PowerShell expression evaluation errors
        self.assertNotIn("--add-assignee @me", self.content, "Bare '--add-assignee @me' breaks in PowerShell; must use quotes like '--add-assignee \"@me\"'")
        self.assertIn('--add-assignee "@me"', self.content, "Must document quoted '--add-assignee \"@me\"'")

    def test_markdown_fallback_conventions_documented(self):
        """Markdown fallback conventions (Part of #<spec-id> and ## Blocked by tasklists) are documented."""
        self.assertIn("Part of #", self.content, "Parent linkage fallback 'Part of #<spec-id>' must be documented")
        self.assertIn("## Blocked by", self.content, "Dependency fallback '## Blocked by' section must be documented")
        self.assertTrue(
            "- [ ] Blocked by #" in self.content or "- [x] Blocked by #" in self.content or "Blocked by #" in self.content,
            "Tasklist blocker item format must be documented"
        )
        self.assertIn("immutable", self.content.lower(), "Parent spec immutability should be documented")

    def test_claude_code_native_configuration_documented(self):
        """Claude Code native configuration via .claude/config.json is documented alongside local frontmatter tradeoffs."""
        self.assertIn(".claude/config.json", self.content)
        self.assertIn("skillOverrides", self.content)
        self.assertIn("disableModelInvocation", self.content)
        self.assertIn("disable-model-invocation", self.content)


if __name__ == "__main__":
    unittest.main()
