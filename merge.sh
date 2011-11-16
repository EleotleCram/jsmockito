#! /bin/sh

set -x &&
git checkout master &&
git branch -m all-merged all-merged.`date +%s` &&
git checkout -b all-merged &&
git merge upon-verification-failed-describe-interactions sequence-verifier mock-no-longer-mocks-properties-that-are-not-a-function mockfunc-reset-interactions &&
git cherry-pick testing-framework-util-throw-assertion-exception &&
git cherry-pick merge-helper &&
set +x &&
echo "Done."

