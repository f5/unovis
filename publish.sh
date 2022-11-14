# Disabling automatic version update till we find a better approach
# current_version=$(node -e "console.log(require('./packages/ts/package.json').version)") &&
# npm version patch --workspaces &&
new_version=$(node -e "console.log(require('./packages/ts/package.json').version)") &&

# Update versions
# perl -pi -e 's/${current_version}/${new_version}/g' *
# npm i --ignore-scripts

npm run publish:lib &&
npm run publish:lib-angular &&
npm run publish:lib-react &&
npm run publish:lib-svelte &&


git add . &&
git commit -m "Release: v${new_version}" -m "ref #0"
