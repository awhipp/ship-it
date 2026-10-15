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

## Application Across Artifacts

Apply these six rules across all `ship-it` documentation, maps, specs, tickets, validation reports, and reviews.
