
REPORTER = spec

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER)
test2:
	@NODE_ENV=test node test/catch
.PHONY: test test2
