import unittest
from pathlib import Path
import re
import strictyaml
from skills_ref.validator import validate, ALLOWED_FIELDS

REPO_ROOT = Path(__file__).resolve().parent.parent
SKILL_DIR = REPO_ROOT / "skills" / "ship-it"
SKILL_MD = SKILL_DIR / "SKILL.md"

class TestSkillConformance(unittest.TestCase):
    def setUp(self):
        self.assertTrue(SKILL_MD.exists(), f"SKILL.md not found at {SKILL_MD}")
        content = SKILL_MD.read_text(encoding="utf-8")
        self.assertTrue(content.startswith("---"), "SKILL.md must start with YAML frontmatter")
        parts = content.split("---", 2)
        self.assertGreaterEqual(len(parts), 3, "Frontmatter must be closed with ---")
        self.frontmatter_raw = parts[1]
        self.body_raw = parts[2]
        self.frontmatter = strictyaml.load(self.frontmatter_raw).data

    def test_agentskills_validate_zero_errors(self):
        """Passes agentskills.io schema validation with zero errors."""
        errors = validate(SKILL_DIR)
        self.assertEqual(errors, [], f"Schema validation failed: {errors}")

    def test_root_frontmatter_allowed_fields(self):
        """Root YAML frontmatter contains exclusively ALLOWED_FIELDS."""
        keys = set(self.frontmatter.keys())
        unexpected = keys - ALLOWED_FIELDS
        self.assertEqual(unexpected, set(), f"Unexpected root frontmatter fields: {unexpected}")
        self.assertNotIn("disable-model-invocation", keys, "disable-model-invocation must not be a root field")

    def test_description_negative_trigger(self):
        """Description includes explicit negative triggers to prevent unprompted model invocation."""
        description = self.frontmatter.get("description", "")
        expected_trigger = (
            "Manual-only workflow: do NOT invoke automatically or unprompted; "
            "only activate when explicitly requested by the user via ship-it or /ship-it."
        )
        self.assertIn(expected_trigger, description)

    def test_metadata_disable_model_invocation(self):
        """Metadata contains disable-model-invocation: 'true' as a flat string map."""
        metadata = self.frontmatter.get("metadata")
        self.assertIsInstance(metadata, dict, "metadata must be a mapping")
        self.assertEqual(metadata.get("disable-model-invocation"), "true")
        for k, v in metadata.items():
            self.assertIsInstance(k, str)
            self.assertIsInstance(v, str)

    def test_compatibility_defined(self):
        """Compatibility defines environment requirements as a flat descriptive string."""
        compatibility = self.frontmatter.get("compatibility")
        self.assertIsInstance(compatibility, str, "compatibility must be a string")
        self.assertLessEqual(len(compatibility), 500, "compatibility must be <= 500 characters")
        compat_lower = compatibility.lower()
        self.assertIn("git", compat_lower)
        self.assertTrue("gh" in compat_lower or "github" in compat_lower)
        self.assertTrue("shell" in compat_lower or "terminal" in compat_lower)

    def test_claude_code_documentation(self):
        """SKILL.md documents Claude Code configuration options."""
        self.assertIn(".claude/config.json", self.body_raw)
        self.assertIn("skillOverrides", self.body_raw)
        self.assertIn("disableModelInvocation", self.body_raw)

if __name__ == "__main__":
    unittest.main()
