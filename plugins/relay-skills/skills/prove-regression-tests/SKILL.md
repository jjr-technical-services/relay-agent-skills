---
name: prove-regression-tests
description: Prove that a regression test detects the claimed defect by observing red, green, controlled regression, and restored green states without overwriting unrelated work. Use for bug fixes, incident repairs, flaky areas, or reviews asking whether a test is load-bearing.
---

# Prove Regression Tests

A passing test is not evidence that it detects the defect. Establish a controlled result sequence and preserve the user's working state.

## Respect the requested authority

For a review, diagnosis, or explanation request, remain read-only: inspect existing evidence and report what proof is present or missing. Do not add a test, apply a fix, reverse a patch, or reintroduce a defect unless the user explicitly asked you to implement or execute the proof. A request to assess whether a test is load-bearing does not itself authorize source mutation.

## Establish the target

Name one observable defect and classify its cause as `proven`, `inferred`, or `unknown`. Inspect the real source, record, log, or reproduction before writing the test. If the behavior appears intentional, inspect its history and existing contract before changing it.

## Prove sensitivity

When implementation or execution is authorized:

1. Add the narrowest behavioral test that exposes the user- or caller-visible consequence.
2. Run it against the defective behavior and capture the actual failing assertion.
3. Apply the smallest fix and capture the passing result.
4. Reintroduce only the defect under controlled conditions and confirm the same test fails.
5. Restore the fix, rerun the focused test, then run the applicable broader gates.

Prefer a real behavioral test. Label structural, model, or characterization tests honestly when the production path cannot be invoked.

## Dirty-worktree safety

Never use broad stash, reset, checkout, or copy-over operations in a shared or dirty checkout. Before the controlled-regression step:

- identify the exact task-owned files and confirm unrelated changes are absent;
- prefer a clean task-owned worktree based on the defective revision, applying only the new test and then the fix;
- otherwise create and inspect a narrow patch containing only the task's fix, reverse that patch only after a clean applicability check, and immediately restore it;
- stop if the inverse patch would overlap user changes or the defective predecessor cannot be reproduced safely.

Do not call a test load-bearing when the red state was simulated by disabling the test, breaking setup, or changing an unrelated dependency.

## Output

Report the defect and cause confidence, the red assertion, the green result, the controlled-regression result, the restored result, broader-gate status, and any remaining evidence gap.

## Attribution

Adapted from `RooAGI/red-green-proof@7cee6dc31a4c33dbb4f636a28c3372c7f4400dd8` and the test-sensitivity concepts in `vinicq/falsegreen-skill@e4f291e6af22f624764f8bdcdfc004eebc1bd568`, both under the MIT License. This adaptation replaces file-copy/stash guidance with task-owned-worktree and narrow-patch safeguards.
