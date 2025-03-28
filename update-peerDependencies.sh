#!/bin/bash

set -e  # Exit on error

ROOT_PACKAGE_JSON="package.json"

# Get the current version from the root package.json
CURRENT_VERSION=$(node -e "console.log(require('./$ROOT_PACKAGE_JSON').version)")

# If the version is empty, exit with an error
if [[ -z "$CURRENT_VERSION" ]]; then
    echo "Error: Could not determine the current version from $ROOT_PACKAGE_JSON"
    exit 1
fi

echo "Current version is $CURRENT_VERSION"

perl -pi -e "s/\"\@unovis\/ts\": \"(?!\*).*?\"/\"\@unovis\/ts\": \"${CURRENT_VERSION}\"/g" packages/*/package.json

# Reinstall dependencies silently
npm install --ignore-scripts --silent

echo "Updated peerDependencies @unovis/ts to version $CURRENT_VERSION in all child package.json files under packages."
