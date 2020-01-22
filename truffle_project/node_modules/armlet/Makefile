.PHONY: test check lint lint-fix rebuild distcheck

#: Run lint and then tests
check:
	npm run lint-fix && npm test

#: same thing as "make check"
test: check

#: Rebuild all
rebuild:
	rm -fr node_modules && npm install --no-progress

#: Rebuild all
distcheck: rebuild check

#: Look for nodejs lint violations
lint:
	npm run lint

#: Look and fix nodejs lint violations
lint-fix:
	npm run lint-fix

RM      ?= rm
GIT2CL ?= git2cl

rmChangeLog:
	rm ChangeLog || true

#: Create a ChangeLog from git via git log and git2cl
ChangeLog: rmChangeLog
	git log --pretty --numstat --summary | $(GIT2CL) >$@
