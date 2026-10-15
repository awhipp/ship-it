#!/usr/bin/env bash
# .github/scripts/validate-bash.sh
# Validates syntax (bash -n), file modes (100755), and LF line endings.

set -e

echo "=== Validating Bash Syntax (bash -n) ==="
for script in skills/ship-it/scripts/*.sh; do
  echo "Checking syntax: $script"
  bash -n "$script"
done

# When running on Linux, verify git file modes and absence of CRLF
if [ "$(uname -s)" = "Linux" ]; then
  echo "=== Verifying POSIX File Modes & Line Endings ==="
  for script in skills/ship-it/scripts/*.sh; do
    mode=$(git ls-files -s "$script" | cut -d' ' -f1)
    if [ "$mode" != "100755" ]; then
      echo "Error: $script mode is $mode, expected 100755"
      exit 1
    fi
    if grep -q "$(printf '\r')" "$script"; then
      echo "Error: $script contains CRLF line endings"
      exit 1
    fi
    echo "File mode (100755) & line endings (LF) OK: $script"
  done
fi

echo "All Bash script checks passed successfully."
