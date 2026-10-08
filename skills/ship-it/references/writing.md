# Writing and Clarity Standard

Technical prose in `ship-it` must be clear, concise, and scannable. This standard defines six core authoring rules for all documentation and lifecycle artifacts.

## Core Rules

| Rule | Requirement | Example |
| :--- | :--- | :--- |
| **1. Sentence Brevity** | Keep sentences to 25 words or fewer. Express at most one idea or instruction per sentence. Count inline code spans, commands, and URLs as single terms. | *Good*: Run the test suite before submitting the pull request. |
| **2. Voice and Mood** | Use imperative mood for instructions and procedures. Use active voice for descriptive statements. | *Good*: Inspect the diff for unhandled errors. The test runner executes tests. |
| **3. Noun Clusters** | Restrict consecutive noun strings to at most three words. Break longer chains with prepositions. | *Good*: Protocol to prevent context leakage (*not* session context token leakage prevention protocol). |
| **4. Affirmative Phrasing** | State what to do directly. Avoid double negatives and negative constructions when an affirmative instruction exists. | *Good*: Retain existing comments (*not* do not fail to avoid deleting existing comments). |
| **5. High Scannability** | Structure text with bulleted lists, bold lead-ins, short paragraphs, and clear tables. Keep paragraphs under four sentences. | Use bulleted lists for multi-item sequences. |
| **6. Controlled Vocabulary** | Use one consistent term per concept across all files. State explicit antecedents instead of bare pronouns like "this" or "it". | *Good*: The ticket defines acceptance criteria (*not* It defines them). |

## Detailed Guidelines

### 1. Sentence Brevity

- Keep every sentence to 25 words or fewer.
- Place only one instruction or proposition in each sentence.
- Split compound sentences joined by conjunctions into separate sentences.
- Count inline code spans (`` `git diff` ``), CLI commands, and URLs as single semantic units.

### 2. Voice and Mood

- **Procedural Steps**: Start instructions with action verbs in imperative mood (e.g., "Create", "Verify", "Run", "Inspect").
- **Descriptive Statements**: Use active voice where the subject performs the action (e.g., "The runner executes tests" instead of "Tests are executed by the runner").
- Avoid passive voice unless the actor is unknown or irrelevant.

### 3. Noun Clusters

- Restrict strings of modifying nouns to three words maximum.
- Unpack long noun sequences with prepositional phrases ("of", "for", "in", "to").
- *Poor*: Feature branch merge conflict resolution checklist.
- *Clear*: Checklist for resolving merge conflicts on the feature branch.

### 4. Affirmative Phrasing

- State requirements positively and directly.
- Tell the agent or developer what to do rather than listing prohibited alternatives, unless cautioning against a specific hazard.
- Eliminate double negatives (e.g., replace "not uncommon" with "frequent").

### 5. High Scannability

- Use bold lead-in keywords for list items.
- Present multi-attribute data in markdown tables.
- Limit paragraph blocks to three or four sentences.
- Use numbered lists exclusively for strict chronological sequences.

### 6. Controlled Vocabulary

- Pick a canonical term for each domain entity and use it consistently (e.g., "ticket", "spec", "map", "diff", "harness").
- Do not use synonyms interchangeably for key technical concepts.
- Provide explicit nouns for pronouns. Avoid starting sentences with bare "This", "It", or "These" without the accompanying noun (e.g., "This command", "This phase").

## Application Across Artifacts

Apply this standard across all `ship-it` documentation and lifecycle artifacts:

- **Decision Maps ([plan.md](plan.md))**: Write crisp destinations, concise notes, and single-line decision summaries.
- **Feature Specs ([spec.md](spec.md))**: State problem statements, solutions, user stories, and implementation decisions following these rules.
- **Vertical Tickets ([tickets.md](tickets.md))**: State acceptance criteria as single-sentence imperative checks.
- **Validation Reports ([validate.md](validate.md))**: Phrase all audit findings and in-place resolutions as concise, direct statements with explicit locations.
- **Review Reports ([review.md](review.md))**: Format review findings and in-place resolutions as concise, direct statements citing specific hunks or requirements.
